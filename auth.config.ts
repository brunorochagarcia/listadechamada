import type { NextAuthConfig } from "next-auth";

// Configuração mínima usada no proxy (Edge Runtime) — sem imports Node.js
export const authConfig: NextAuthConfig = {
  providers: [],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = request.nextUrl.pathname === "/login";

      if (!isLoggedIn && !isLoginPage) return false;
      if (isLoggedIn && isLoginPage) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }
      return true;
    },
  },
};
