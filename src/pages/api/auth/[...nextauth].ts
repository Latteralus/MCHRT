import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
// import bcrypt from 'bcrypt'; // Will be used later for password comparison
// import { findUserByUsername } from '@/modules/auth/services/authService'; // Placeholder for actual user lookup

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // The name to display on the sign-in form (e.g., 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign-in page.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        console.log('Authorize attempt with:', credentials?.username); // Log attempt

        // --- Placeholder User Lookup ---
        // Replace this with actual database lookup and password verification
        // const user = await findUserByUsername(credentials?.username);
        // if (user && credentials?.password && await bcrypt.compare(credentials.password, user.passwordHash)) {

        // --- Hardcoded User for MVP ---
        if (credentials?.username === 'admin' && credentials?.password === 'password') {
          console.log('Hardcoded admin user authorized.');
          // Return user object required by NextAuth
          // The object returned will be encoded in the JWT/session.
          // Ensure sensitive data like passwordHash is NOT included here.
          return {
            id: 1, // Use a unique ID (number type)
            name: 'Admin User', // Or user.name
            // email: user.email, // Not required for login per docs
            role: 'Admin', // Add custom properties like role
            // Add other non-sensitive user properties needed in the session
          };
        } else {
          console.log('Authorization failed for:', credentials?.username);
          // If you return null then an error will be displayed advising the user to check their details.
          return null;
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      }
    })
  ],
  // Use JWT strategy for sessions
  session: {
    strategy: 'jwt',
  },
  // Add custom callbacks to include role in JWT and session
  callbacks: {
    async jwt({ token, user }) {
      // Persist custom user data to the JWT right after sign-in
      if (user) { // user object is only available on initial sign-in
        token.id = user.id;
        token.role = user.role;
        token.departmentId = user.departmentId;
      }
      return token;
    },
    async session({ session, token }) {
      // Send custom properties to the client session from the JWT
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.departmentId = token.departmentId;
      }
      return session;
    }
  },
  // Define custom pages if needed (e.g., login page)
  pages: {
    signIn: '/login', // Redirect users to '/login' for sign-in
    // error: '/auth/error', // Error code passed in query string as ?error=
  },
  // Secret for signing JWTs - MUST match NEXTAUTH_SECRET in .env.local
  secret: process.env.NEXTAUTH_SECRET,

  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);

// Type augmentation is now handled in src/types/next-auth.d.ts