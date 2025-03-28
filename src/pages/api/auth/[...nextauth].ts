import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt'; // Import bcrypt for password comparison
import User from '@/modules/auth/models/User'; // Import the User model

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

        // --- Database User Lookup ---
        if (!credentials?.username || !credentials?.password) {
          console.log('Authorization failed: Missing username or password.');
          return null;
        }

        try {
          const user = await User.findOne({ where: { username: credentials.username } });

          if (user && await bcrypt.compare(credentials.password, user.passwordHash)) {
            console.log(`User '${credentials.username}' authorized successfully.`);
            // Return user object required by NextAuth, excluding sensitive data
            return {
              id: user.id,
              name: user.username, // Use username as name for now, or fetch from Employee if linked
              role: user.role,
              departmentId: user.departmentId, // Include departmentId if available and needed
              // Add other non-sensitive user properties needed in the session
            };
          } else {
            console.log(`Authorization failed for user: '${credentials.username}'. Invalid credentials.`);
            return null;
          }
        } catch (error) {
          console.error('Error during authorization:', error);
          return null; // Return null on error to prevent login
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
        token.id = Number(user.id); // Ensure id is a number
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