# Better Auth Setup In This Project

This project uses Better Auth for email/password authentication in a Next.js App Router app. Authenticated users are sent to the home dashboard at `/`, and new sign-ups are restricted to emails that already exist in the database allowlist.

## Main Files

- `lib/auth.ts` creates the server-side Better Auth instance.
- `app/api/auth/[...auth]/route.ts` exposes Better Auth's API handlers to Next.js.
- `lib/auth-client.ts` creates the React client helpers used by sign-in, sign-up, sign-out, and session UI.
- `lib/auth-session.ts` reads the current session from Server Components.
- `proxy.ts` redirects unauthenticated requests away from `/`.
- `lib/schema.ts` defines the Better Auth tables and the project-specific allowlist table.
- `scripts/setup-signup-allowlist.mjs` creates and seeds the email allowlist table.

## Environment Variables

The auth setup expects these values in `.env.local`:

```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

`DATABASE_URL` connects Drizzle and Better Auth to Neon/Postgres. `BETTER_AUTH_SECRET` signs auth tokens and must stay private. The URL values tell Better Auth where the app is running.

## Server Auth Instance

`lib/auth.ts` calls `betterAuth()` with:

- `drizzleAdapter(db, { provider: "pg" })` so Better Auth stores users, sessions, accounts, and verification records in Postgres.
- `emailAndPassword.enabled = true` for email/password login.
- `autoSignIn = true` so users are signed in after successful sign-up.
- A `before` hook that checks sign-up emails against `allowed_signup_emails`.

If the submitted sign-up email is not present in `allowed_signup_emails`, the hook throws a `FORBIDDEN` API error and account creation stops.

## Auth API Route

`app/api/auth/[...auth]/route.ts` connects Better Auth to Next.js:

```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const { GET, POST, PATCH, PUT, DELETE } = toNextJsHandler(auth);

export { GET, POST, PATCH, PUT, DELETE };
```

This makes Better Auth endpoints available under `/api/auth/*`, including sign-in, sign-up, sign-out, and session endpoints.

## Client Usage

`lib/auth-client.ts` exports:

- `authClient`
- `useSession`
- `signIn`
- `signOut`
- `signUp`

The sign-in page uses:

```ts
await signIn.email({
  email,
  password,
  callbackURL: "/",
});
```

The sign-up page uses:

```ts
await signUp.email({
  email,
  password,
  name,
  callbackURL: "/",
});
```

After success, both flows redirect to `/`.

## Protecting The Dashboard

The dashboard lives at `/`.

Protection happens in two places:

1. `proxy.ts` performs a quick cookie check for `better-auth.session_token` and redirects unauthenticated users to `/auth/sign-in`.
2. `app/page.tsx` calls `getAuthSession()` from `lib/auth-session.ts` and redirects to `/auth/sign-in` if Better Auth does not return a valid session.

The server-side check is the important authorization layer. The proxy check is an early redirect for a smoother user experience.

## Sign-Out UI

`components/AdminHeader.tsx` uses `useSession()` to display the current user and `signOut()` to end the session:

```ts
await signOut();
router.push("/auth/sign-in");
```

## Database Tables

Better Auth manages these core auth tables:

- `user`
- `session`
- `account`
- `verification`

The project also adds:

- `allowed_signup_emails`

Schema:

```sql
CREATE TABLE IF NOT EXISTS "allowed_signup_emails" (
  "email" text PRIMARY KEY,
  "created_at" timestamp NOT NULL DEFAULT now()
);
```

Only emails in this table can create accounts.

## Managing Allowed Sign-Up Emails

Create the table:

```bash
node scripts/setup-signup-allowlist.mjs
```

Create the table and add one or more emails:

```bash
node scripts/setup-signup-allowlist.mjs person@example.com admin@example.com
```

The script normalizes emails to lowercase and ignores duplicates.

## RLS Notes

RLS is useful on project tables like:

- `contact_messages`
- `inquiries`
- `allowed_signup_emails`

Do not casually enable RLS on Better Auth core tables (`user`, `session`, `account`, `verification`) unless you have fully tested Better Auth's query paths. Restrictive policies there can break sign-in, sign-up, and session validation.

## Current Auth Flow

1. User visits `/`.
2. If they do not have a session cookie, `proxy.ts` redirects to `/auth/sign-in`.
3. Sign-in calls Better Auth through `signIn.email()`.
4. Sign-up calls Better Auth through `signUp.email()`.
5. Before sign-up continues, `lib/auth.ts` checks `allowed_signup_emails`.
6. If allowed, Better Auth creates the user, account, and session.
7. The user is redirected to `/`.
8. `app/page.tsx` verifies the session server-side before loading messages.
