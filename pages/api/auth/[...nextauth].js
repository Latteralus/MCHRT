// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { dbService } from '@/utils/dbService'; // Use path alias
import bcrypt from 'bcryptjs';

// Define the authentication options
export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
            console.error("Auth attempt with missing credentials");
            return null;
        }
        try {
          // Special case for testing - hardcoded test user (REMOVE FOR PRODUCTION)
          // NOTE: This hardcoded user check should be removed before going live.
          if (credentials.username === 'fcalkins' && credentials.password === 'password') {
             console.warn("Using hardcoded test user 'fcalkins'");
             // Fetch department for the hardcoded user for consistency
             const hrDept = (await dbService.getDepartments({ name: 'Human Resources'}))[0];
             return {
              id: 'mock-fcalkins-id', // Use a mock ID distinct from real DB IDs
              name: 'Faith Calkins (Mock)',
              email: 'fcalkins@mountaincare.example',
              username: 'fcalkins',
              role: 'hr_manager', // Correct role for Faith Calkins based on seed
              department: hrDept ? hrDept.name : 'Human Resources',
              departmentId: hrDept ? hrDept.id : null // Use actual ID if found
            };
          }

          // Get user from database via dbService
          const user = await dbService.getUserByUsername(credentials.username);

          // If user doesn't exist, return null
          if (!user || !user.passwordHash) { // Check for passwordHash too
            console.log(`Auth failed: User not found or missing password hash for ${credentials.username}`);
            return null;
          }

          // Check password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
             console.log(`Auth failed: Invalid password for ${credentials.username}`);
            return null;
          }

          // Get department info if user has a departmentId
          let departmentName = null;
          if (user.departmentId) {
            const department = await dbService.getDepartmentById(user.departmentId);
            departmentName = department ? department.name : null;
          }

          // Return user object compatible with NextAuth session/token
          return {
            id: user.id, // Must be string or number convertible to string
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(), // Ensure name exists
            email: user.email,
            username: user.username,
            role: user.role,
            departmentId: user.departmentId,
            department: departmentName,
            // Include any other fields needed in token/session from the user object
            employeeId: user.employeeId // Pass employeeId if available on user
          };
        } catch (error) {
          console.error('Error during authorize callback:', error);
          return null; // Return null on any error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      // Persist user info from authorize step into the JWT token
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.department = user.department;
        token.departmentId = user.departmentId;
        token.employeeId = user.employeeId; // Persist employeeId
      }
      return token;
    },
    async session({ session, token, user }) {
      // Add properties from JWT token to the session.user object
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.department = token.department;
        session.user.departmentId = token.departmentId;
        session.user.employeeId = token.employeeId; // Add employeeId to session
      }

      // Add isMockDb flag for development-only features
      // Ensure this logic is outside the 'if (token)' block if it should always run
      if (process.env.NODE_ENV !== 'production') {
        // Ensure dbService is available or handle potential errors
        try {
          session.isMockDb = dbService.isMockDb();
        } catch (dbError) {
          console.error("Error checking dbService state:", dbError);
          session.isMockDb = undefined; // Indicate uncertainty or error
        }
      } else {
        session.isMockDb = false; // Explicitly false in production
      }

      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on auth errors
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours (default is 30 days)
  },
  // Use secret from environment variable or fallback for development
  secret: process.env.NEXTAUTH_SECRET || 'default_secret_for_development_only',
  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
};


// Export the handler, passing the options
export default NextAuth(authOptions);