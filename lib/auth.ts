import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { APIError } from "better-auth/api";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is not set");
}

// Parse DATABASE_URL to ensure proper SSL mode for production
let poolConfig: any = {
  connectionString: process.env.DATABASE_URL,
};

if (process.env.NODE_ENV === 'production') {
  // Use verify-full for production to maintain security
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('sslmode=')) {
    poolConfig.connectionString = `${process.env.DATABASE_URL}${process.env.DATABASE_URL.includes('?') ? '&' : '?'}sslmode=verify-full`;
  }
  poolConfig.ssl = { rejectUnauthorized: true };
} else {
  poolConfig.ssl = false;
}

const pool = new Pool(poolConfig);

const baseURL = process.env.BETTER_AUTH_URL || (process.env.NODE_ENV === 'production' ? undefined : "http://localhost:3000");

if (!baseURL) {
  throw new Error("BETTER_AUTH_URL environment variable is not set in production");
}

export const auth = betterAuth({
  database: pool,
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
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
