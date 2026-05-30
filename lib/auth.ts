import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { APIError } from "better-auth/api";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Check if the user's email exists in the allowed_signup_emails table
          const res = await pool.query(
            "SELECT 1 FROM allowed_signup_emails WHERE email = $1",
            [user.email.toLowerCase()]
          );

          if (res.rowCount === 0) {
            throw new APIError("FORBIDDEN", {
              message: "Email is not authorized for sign up.",
            });
          }

          return { data: user };
        },
      },
    },
  },
});
