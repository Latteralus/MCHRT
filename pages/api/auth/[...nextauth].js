// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { dbService } from '../../../utils/dbService';
import bcrypt from 'bcryptjs';

export default NextAuth({
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Special case for testing - hardcoded test user
          if (credentials.username === 'fcalkins' && credentials.password === 'password') {
            return {
              id: '1',
              name: 'Faith Calkins',
              email: 'fcalkins@mountaincare.example',
              username: 'fcalkins',
              role: 'Admin',
              department: 'Human Resources',
              departmentId: '1'
            };
          }
          
          // Get user from database
          const user = await dbService.getUserByUsername(credentials.username);
          
          // If user doesn't exist, return null
          if (!user) {
            return null;
          }
          
          // Check password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          
          if (!isPasswordValid) {
            return null;
          }
          
          // Get department info if user has a departmentId
          let departmentName = null;
          if (user.departmentId) {
            const department = await dbService.getDepartmentById(user.departmentId);
            departmentName = department ? department.name : null;
          }
          
          // Return user object
          return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            username: user.username,
            role: user.role,
            departmentId: user.departmentId,
            department: departmentName
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // First time JWT callback is called, user object is available
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.department = user.department;
        token.departmentId = user.departmentId;
      }
      return token;
    },
    async session({ session, token }) {
      // Add properties to session from token
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.role = token.role;
      session.user.department = token.department;
      session.user.departmentId = token.departmentId;
      
      // Add isMockDb flag for development-only features
      if (process.env.NODE_ENV !== 'production') {
        session.isMockDb = dbService.isMockDb();
      }
      
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-for-development',
  debug: process.env.NODE_ENV !== 'production',
});