"use client";

import { createAuthClient } from "better-auth/react";

const baseURL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.BETTER_AUTH_URL;

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = createAuthClient({
  baseURL,
});
