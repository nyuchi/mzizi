# Supabase — Nyuchi Design Portal

This directory captures the Supabase side of the design portal. The
database itself is the source of truth; the files here document and
reproduce its structure.

```
supabase/
├── schema.sql        ← canonical structure of the `public` schema (DDL only)
├── functions/        ← edge functions deployed to Supabase
└── README.md         ← you are here
```

## 1. How changes land in the database

Schema changes are applied **directly against the live database** —
Dashboard SQL editor, `psql`, or the Supabase MCP server. We do **not**
keep a versioned `supabase/migrations/` directory and we do **not** run
`supabase db push` from CI.

Why:

- The DB is the source of truth. Treating it as such eliminates
  drift between a stack of timestamped migration files and what's
  actually running in prod.
- A developer who needs a local replica runs **one file** — `schema.sql`
  — instead of replaying dozens of migrations.
- Preview branches and new environments get a consistent, deterministic
  starting point in a single pass.

## 2. Updating `schema.sql` after a change

Any time the `public` schema changes (new table, new column, new
function, new policy, etc.), regenerate this file from the live DB:

```bash
# Option A — Supabase CLI (preferred)
supabase link --project-ref <project-ref>
supabase db dump --schema public --file supabase/schema.sql

# Option B — raw pg_dump
pg_dump "$DATABASE_URL" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-privileges \
  --file supabase/schema.sql
```

Then commit the updated file. PRs that touch the database structure
MUST include the corresponding `schema.sql` update in the same commit.

**Do not hand-edit `schema.sql`.** If you need to fix a typo in a
column comment or rename a constraint, do it against the live DB first,
then re-run the dump.

## 3. Bootstrapping a local replica

A developer starting a fresh local Supabase project:

```bash
# 1. Create a new Supabase project (or reset an existing one)
supabase projects create <name>

# 2. Connect to the new project's DB
psql "$(supabase db remote list)"

# 3. Apply the canonical schema
\i supabase/schema.sql
```

Or, using the Dashboard SQL Editor: paste the contents of
`supabase/schema.sql` into a new query and run it.

The replica is structurally identical to prod but contains **no rows**.
Seed data is out of scope for this repo — fetch what you need from the
live REST API (`https://mzizi.dev/api/v1/*`) or, for dev-only
fixtures, add a `supabase/fixtures.sql` alongside `schema.sql` (not
present today).

## 4. What's *not* in `schema.sql`

`schema.sql` captures **only** the `public` schema. These are Supabase
managed schemas created automatically on any new project, so they are
deliberately excluded:

| Schema                | Managed by         |
| --------------------- | ------------------ |
| `auth`                | Supabase Auth      |
| `storage`             | Supabase Storage   |
| `realtime`            | Supabase Realtime  |
| `graphql`, `graphql_public` | pg_graphql   |
| `extensions`          | Postgres extensions |
| `vault`               | Supabase Vault     |
| `pgbouncer`           | connection pooler  |
| `supabase_migrations` | Supabase internal  |

If you ever add custom RLS on `storage.objects` or `auth.users`, those
policies live outside `public` and must be captured separately.

## 5. Edge functions

`supabase/functions/` holds edge functions deployed to Supabase. Each
function has its own directory with an `index.ts` entry point. Deploy
with:

```bash
supabase functions deploy <function-name>
```

See `supabase/functions/README.md` for the deployment workflow and the
required secrets.

## 6. Env vars

Committed:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the publishable key — safe for the browser)

Never committed — set via shell, `.env.local`, or the Vercel dashboard:

- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS; treat as a database password

## 7. Why no migration files?

We moved off versioned migrations in favour of a single schema dump
because:

1. **No drift.** With 31 versioned migrations out-of-sync with the live
   DB, every PR risked false positives from the Supabase GitHub App. A
   single regenerated dump is always in sync by definition.
2. **Lower onboarding friction.** A new contributor runs one file, not
   thirty-one.
3. **Honest history.** The canonical history of "who changed what, when"
   lives in prod's `supabase_migrations.schema_migrations` table and in
   Git commits on `schema.sql` — not in a parallel pile of handwritten
   `.sql` files that can silently diverge.

The tradeoff is that the Supabase GitHub App's "Supabase Preview" check
will stay red for this repo — it expects the migration-history model.
That check is informational only and is not in the required-checks list
(see `CLAUDE.md` §14).
