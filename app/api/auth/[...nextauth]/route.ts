import NextAuth from "next-auth"
import LineProvider from "next-auth/providers/line"
import { getUsers } from "@/lib/data-service"

const authOptions = {
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
    async session({ session, token, trigger }: any) {
      if (session.user) {
         session.user.lineUserId = token.sub; // This is the LINE ID we will use to query Google Sheets
         
         // Fetch the actual user from Google Sheets
         let users = await getUsers();
         let dbUser = users.find(u => u.lineUserId === token.sub && u.status === "active");
         
         // If update() was called from client (e.g. after binding), force fetch without cache
         if (!dbUser && trigger === "update") {
           users = await getUsers(true);
           dbUser = users.find(u => u.lineUserId === token.sub && u.status === "active");
         }
         
         if (dbUser) {
           session.user.dbUser = dbUser;
           
           // If the database avatar or lineName is different from the LINE token, update it in the background
           let needsUpdate = false;
           const updateData: any = {};
           
           if (token.picture && dbUser.avatar !== token.picture) {
             updateData.avatar = token.picture as string;
             needsUpdate = true;
           }
           if (token.name && dbUser.lineName !== token.name) {
             updateData.lineName = token.name as string;
             needsUpdate = true;
           }
           
           if (needsUpdate) {
              const { updateUser } = await import("@/lib/sheets-db");
              updateUser(dbUser.employeeCode, updateData).catch(console.error);
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
