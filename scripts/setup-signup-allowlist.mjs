import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("Creating allowed_signup_emails table if not exists...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "allowed_signup_emails" (
      "email" text PRIMARY KEY,
      "created_at" timestamp NOT NULL DEFAULT now()
    );
  `);

  const emails = process.argv.slice(2);
  for (const email of emails) {
    const normalized = email.toLowerCase();
    await pool.query(
      `INSERT INTO allowed_signup_emails (email) VALUES ($1) ON CONFLICT DO NOTHING`,
      [normalized]
    );
    console.log(`Added allowed email: ${normalized}`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
