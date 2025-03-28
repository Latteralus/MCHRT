import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import { UserRole } from "./roles"; // Assuming UserRole is defined here

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's database ID. */
      id: number;
      /** The user's role. */
      role?: UserRole;
      /** The user's department ID (if applicable). */
      departmentId?: number | null;
      /** The user's linked employee ID (if applicable). */
      employeeId?: number | null;
    } & DefaultSession["user"]; // Keep existing properties like name, email, image
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    /** The user's database ID. */
    id: number;
    /** The user's role. */
    role?: UserRole;
    /** The user's department ID (if applicable). */
    departmentId?: number | null;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** User ID */
    id: number;
    /** User role */
    role?: UserRole;
    /** User department ID */
    departmentId?: number | null;
  }
}