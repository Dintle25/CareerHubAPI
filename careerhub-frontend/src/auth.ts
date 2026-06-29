// NextAuth configuration — defines how users sign in and how the session works.
// Uses JWT strategy so no database is needed to store sessions.
// Credentials are validated against a hardcoded mock user list.

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Mock users — in a real app these would come from the database.
// Passwords are compared with strict equality (no bcrypt) since this is a mock.
const MOCK_USERS = [
  { id: "1", name: "employer1", password: "password123", role: "employer" },
  { id: "2", name: "employer2", password: "password123", role: "employer" },
  { id: "3", name: "alice",     password: "password123", role: "candidate" },
  { id: "4", name: "bob",       password: "password123", role: "candidate" },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Use JWT — session data is stored in a cookie, not a database
  session: { strategy: "jwt" },

  // Send users to /login when they need to sign in
  pages: { signIn: "/login" },

  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },

      // Called when the user submits the login form.
      // Returns the user object on success, null on failure.
      authorize(credentials) {
        // Find user by username
        const user = MOCK_USERS.find((u) => u.name === credentials?.username);

        // Return null if user not found or password doesn't match
        if (!user || user.password !== credentials?.password) return null;

        // Return id, name, and role — these get passed to the JWT callback
        return { id: user.id, name: user.name, role: user.role };
      },
    }),
  ],

  callbacks: {
    // jwt callback — runs when the JWT is created or updated.
    // We add role to the token here so it's available in the session.
    jwt({ token, user }) {
      if (user) {
        // user is only available on first sign in — copy role into the token
        token.role = (user as { role: string }).role;
      }
      return token;
    },

    // session callback — runs when the session is read.
    // We copy role from the token into the session so the client can read it.
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});