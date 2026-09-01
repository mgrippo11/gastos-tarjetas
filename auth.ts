import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { eq } from "drizzle-orm";
import { db } from "./db/client";
import { users } from "./db/schema";

export function isAdminEmail(email: string | null | undefined) {
  return !!email && email === process.env.ADMIN_EMAIL;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      if (isAdminEmail(user.email)) return true;
      const allowed = await db.query.users.findFirst({
        where: eq(users.email, user.email),
      });
      return !!allowed;
    },
  },
});
