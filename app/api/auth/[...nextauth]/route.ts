import NextAuth, { NextAuthOptions } from "next-auth"
import LineProvider from "next-auth/providers/line"
import { getUsers } from "@/lib/data-service"

const isHttps = process.env.NEXTAUTH_URL?.startsWith("https://") || process.env.VERCEL === "1";
const useSecureCookies = isHttps;
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

const authOptions: NextAuthOptions = {
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
      name: `${cookiePrefix}next-auth.csrf-token`,
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
    nonce: {
      name: `${cookiePrefix}next-auth.nonce`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }: any) {
      // 1. Instant update if boundUser was provided directly from client
      if (trigger === "update" && session?.boundUser) {
        token.dbUser = session.boundUser;
        return token;
      }

      // 2. On initial login with LINE
      if (account && user) {
        token.lineUserId = token.sub || user.id;
        token.picture = token.picture || user.image;
        token.name = token.name || user.name;
        
        try {
          const users = await getUsers();
          const cleanLineId = String(token.lineUserId || '').trim();
          const dbUser = users.find(u => 
            String(u.lineUserId || '').trim() === cleanLineId && 
            String(u.status || 'active').trim().toLowerCase() === "active"
          );
          
          if (dbUser) {
            token.dbUser = dbUser;

            // Sync database avatar or lineName only if missing, to protect Google Sheets write quota
            let needsUpdate = false;
            const updateData: any = {};
            
            if (token.picture && (!dbUser.avatar || dbUser.avatar.includes("/avatars/"))) {
              updateData.avatar = token.picture as string;
              needsUpdate = true;
            }
            if (token.name && (!dbUser.lineName || dbUser.lineName === "-")) {
              updateData.lineName = token.name as string;
              needsUpdate = true;
            }
            
            if (needsUpdate) {
              const { updateUser } = await import("@/lib/sheets-db");
              updateUser(dbUser.employeeCode, updateData).catch(() => {});
            }
          } else {
            token.dbUser = null;
          }
        } catch (err) {
          console.error("Failed to load user in jwt callback", err);
          if (!token.dbUser) token.dbUser = null;
        }
      }

      // 3. On explicit update (e.g. session update trigger)
      if (trigger === "update" || (trigger === "manual" && !token.dbUser)) {
        try {
          const users = await getUsers(true);
          const cleanLineId = String(token.lineUserId || token.sub || '').trim();
          const dbUser = users.find(u => 
            String(u.lineUserId || '').trim() === cleanLineId && 
            String(u.status || 'active').trim().toLowerCase() === "active"
          );
          if (dbUser) {
            token.dbUser = dbUser;
          }
        } catch (err) {
          console.error("Failed to update user in jwt callback", err);
          // Never erase an already authenticated user on a transient error!
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

