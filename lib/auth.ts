import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./schema";

const productionUrl = process.env.BETTER_AUTH_URL;
const vercelUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "127.0.0.1:3000",
      "btfadmin.vercel.app",
      "*.vercel.app",
    ],
    fallback: productionUrl || vercelUrl || "http://localhost:3000",
    protocol: process.env.NODE_ENV === "production" ? "https" : "auto",
  },
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    productionUrl,
    vercelUrl,
    "http://localhost:3000",
    "https://btfadmin.vercel.app",
  ].filter((origin): origin is string => Boolean(origin)),
});
