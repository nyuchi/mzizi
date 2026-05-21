# Supabase Edge Functions

Deno-runtime functions that run close to the database. One is scaffolded here:

| Function    | Route (Supabase-prefixed)      | Purpose                                                                                              |
| ----------- | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `analytics` | `POST /functions/v1/analytics` | Fire-and-forget ingest for `usage_events`. Replaces the inline `trackApiCall` / `trackMcpTool` path from Next.js. |

Project ref: `grjsboqkaywpwatvrzmy` (`nyuchi_design_db`, region `ap-southeast-1`).

## Prerequisites

1. Install the Supabase CLI: `brew install supabase/tap/supabase` (or see <https://supabase.com/docs/guides/cli>).
2. `supabase login` with a PAT that has access to the `nyuchi_design_db` project.
3. `supabase link --project-ref grjsboqkaywpwatvrzmy` from the repo root.

## Required database tables

The `usage_events` table already exists in the production Supabase project
(`grjsboqkaywpwatvrzmy`). This function aligns to the live schema,
not to a new one. The authoritative columns are:

```text
usage_events
  id, event_type, endpoint, tool_name, component_name,
  duration_ms, status_code, is_error (NOT NULL), created_at
```

If that table ever needs to be recreated, use `supabase db pull`
from the live project — do NOT hand-author a schema here (the one
committed previously drifted from live, which broke the edge
functions).

## Secrets

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected by the Supabase runtime.

### `analytics`

No additional secrets. Rate limiting is per-instance (see notes inside the file).

## Deploy

```bash
# From the repo root:
supabase functions deploy analytics --project-ref grjsboqkaywpwatvrzmy
```

The function is `--no-verify-jwt` compatible (it does its own auth via rate limiting). The default deploy is fine.

## Switching the portal to the analytics function

`lib/metrics.ts` currently writes to `usage_events` directly from Next.js via the service-role client. Once `analytics` is deployed and verified, swap the body of `trackApiCall` / `trackMcpTool` to:

```ts
void fetch(`${SUPABASE_URL}/functions/v1/analytics`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(event),
  // Don't let this block or throw — metrics must never affect the request path.
}).catch(() => {})
```

This pulls the service-role key out of the Next.js request path and centralises ingest (so mukoko-*, nhimbe, shamwari can hit the same endpoint without needing service-role access).

## Invoking by hand

```bash
# Analytics — single event
curl -sS -X POST 'https://grjsboqkaywpwatvrzmy.supabase.co/functions/v1/analytics' \
  -H 'Content-Type: application/json' \
  -d '{"event_type":"api_call","endpoint":"/api/v1/ui","duration_ms":42,"status_code":200}'
```

## Local development

```bash
supabase start                                    # boot local stack (Docker)
supabase functions serve analytics --no-verify-jwt
```

Functions hot-reload on save.

## Why edge instead of Next.js API routes?

- **Analytics** moves the metric write off the portal's request path — no more service-role key in the Next.js runtime, no fire-and-forget client in app code. Any ecosystem app can call the same URL.

## License

MIT — same as the rest of the repo (see `../../LICENSE`).
