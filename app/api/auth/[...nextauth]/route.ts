import NextAuth, { NextAuthOptions } from "next-auth"
import LineProvider from "next-auth/providers/line"
import { getUsers } from "@/lib/data-service"

const useSecureCookies = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

export const authOptions: NextAuthOptions = {
  providers: [
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
      client: {
        id_token_signed_response_alg: 'HS256'
      },
      checks: ["state"],
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  useSecureCookies,
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${useSecureCookies ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    state: {
      name: `${cookiePrefix}next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 900,
      },
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 900,
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account, trigger }: any) {
      // 1. On initial login with LINE
      if (account && user) {
        token.lineUserId = token.sub || user.id;
        token.picture = token.picture || user.image;
        token.name = token.name || user.name;
        
        try {
          const users = await getUsers();
          const dbUser = users.find(u => u.lineUserId === token.lineUserId && u.status === "active");
          token.dbUser = dbUser || null;

          // Sync database avatar or lineName in background if needed
          if (dbUser) {
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
          }
        } catch (err) {
          console.error("Failed to load user in jwt callback", err);
        }
      }

      // 2. On explicit update (e.g. after employee binds their LINE ID)
      if (trigger === "update" || (trigger === "manual" && !token.dbUser)) {
        try {
          const users = await getUsers(true);
          const lineId = token.lineUserId || token.sub;
          const dbUser = users.find(u => u.lineUserId === lineId && u.status === "active");
          token.dbUser = dbUser || null;
        } catch (err) {
          console.error("Failed to update user in jwt callback", err);
        }
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
         session.user.lineUserId = token.lineUserId || token.sub;
         session.user.dbUser = token.dbUser || null;
      }
      return session;
    }
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

