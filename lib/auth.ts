import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  //trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    'https://vercel.app', // Add your exact Vercel URL
  ]
});
