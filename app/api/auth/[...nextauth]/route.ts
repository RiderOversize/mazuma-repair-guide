import NextAuth from "next-auth"
import LineProvider from "next-auth/providers/line"
import { getUsers } from "@/lib/data-service"

export const authOptions = {
  providers: [
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
      client: {
        id_token_signed_response_alg: 'HS256'
      }
    })
  ],
  callbacks: {
    async session({ session, token }: any) {
      if (session.user) {
         session.user.lineUserId = token.sub; // This is the LINE ID we will use to query Google Sheets
         
         // Fetch the actual user from Google Sheets
         const users = await getUsers();
         const dbUser = users.find(u => u.lineUserId === token.sub && u.status === "active");
         
         if (dbUser) {
           session.user.dbUser = dbUser;
           
           // If the database avatar is different from the LINE picture, or doesn't exist, update it in the background
           if (token.picture && dbUser.avatar !== token.picture) {
              const { updateUser } = await import("@/lib/sheets-db");
              updateUser(dbUser.employeeCode, { avatar: token.picture as string }).catch(console.error);
           }
         } else {
           session.user.dbUser = null; // Needs to bind
         }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
