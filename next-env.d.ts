/// <reference types="next" />
/// <reference types="next/image-types/global" />


// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

// Augment the next-auth module to include custom session properties
import 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id?: string | number | null; // Use the appropriate type for your user ID
      role?: string | null;
    } & DefaultSession['user']; // Keep existing properties like name, email, image
  }

  /** The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database. */
  interface User {
    // Add your custom properties here if needed for the User object itself
    id?: string | number | null;
    role?: string | null;
  }
}

// Also augment the JWT type if you are using JWT sessions and adding custom claims
declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id?: string | number | null;
    role?: string | null;
    // Add other custom claims here
  }
}