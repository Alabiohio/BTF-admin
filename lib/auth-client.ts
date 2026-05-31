import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || (typeof window !== 'undefined' && window.location.origin !== 'http://localhost:3000' ? undefined : "http://localhost:3000");

if (!baseURL && typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  console.error("NEXT_PUBLIC_BETTER_AUTH_URL environment variable is not set");
}

export const authClient = createAuthClient({
  baseURL: baseURL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
});

export const { signIn, signUp, signOut, useSession } = authClient;
