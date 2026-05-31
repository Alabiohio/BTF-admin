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
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  hooks: {
    before: async (context) => {
      // Check sign-up email against allowlist
      if (context.path === "/sign-up" && context.method === "POST") {
        const body = context.body as Record<string, unknown> | undefined;
        if (body?.email && typeof body.email === "string") {
          const email = body.email.toLowerCase();
          const allowed = await db.query.allowedSignupEmails.findFirst({
            where: (table, { eq }) => eq(table.email, email),
          });

          if (!allowed) {
            return {
              status: 403,
              body: JSON.stringify({
                error: "FORBIDDEN",
                message: "This email is not allowed to sign up",
              }),
            };
          }
        }
      }
      return context;
    },
  },
});
