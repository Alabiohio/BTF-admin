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
  session: {
    cookieCache: {
      enabled: true,
    },
  },
  cookies: {
    sessionToken: {
      name: "better-auth.session_token",
      attributes: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
        path: "/",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Check if the user's email exists in the allowed_signup_emails table
          try {
            console.log("Sign-up attempt for email:", user.email.toLowerCase());
            
            const res = await pool.query(
              "SELECT 1 FROM allowed_signup_emails WHERE email = $1",
              [user.email.toLowerCase()]
            );

            console.log("Allowlist query result:", res.rowCount);

            if (res.rowCount === 0) {
              console.error("Email not in allowlist:", user.email);
              throw new APIError("FORBIDDEN", {
                message: "Email is not authorized for sign up.",
              });
            }

            console.log("Email authorized, proceeding with sign-up");
            return { data: user };
          } catch (err) {
            console.error("Error in sign-up hook:", err);
            throw err;
          }
        },
      },
    },
  },
});
