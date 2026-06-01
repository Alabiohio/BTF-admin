import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("Creating Better Auth tables if they do not exist...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" text PRIMARY KEY,
      "name" text,
      "email" text NOT NULL UNIQUE,
      "emailVerified" boolean NOT NULL DEFAULT false,
      "image" text,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "id" text PRIMARY KEY,
      "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "expiresAt" timestamp NOT NULL,
      "token" text UNIQUE,
      "ipAddress" text,
      "userAgent" text,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("userId");
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "account" (
      "id" text PRIMARY KEY,
      "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "accountId" text NOT NULL,
      "providerId" text NOT NULL,
      "accessToken" text,
      "refreshToken" text,
      "idToken" text,
      "accessTokenExpiresAt" timestamp,
      "refreshTokenExpiresAt" timestamp,
      "scope" text,
      "password" text,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("userId");
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "verification" (
      "id" text PRIMARY KEY,
      "identifier" text NOT NULL,
      "value" text NOT NULL,
      "expiresAt" timestamp NOT NULL,
      "createdAt" timestamp,
      "updatedAt" timestamp
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "allowed_signup_emails" (
      "email" text PRIMARY KEY,
      "created_at" timestamp NOT NULL DEFAULT now()
    );
  `);

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
