import { createAuthClient } from "better-auth/react";

// Use the public env var if available, otherwise fallback to window.location.origin
// This ensures we use the correct domain in production (https://btfadmin.vercel.app)
const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 
  (typeof window !== 'undefined' ? window.location.origin : undefined);

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
