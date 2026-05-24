/**
 * Cloudflare Worker entry — mcp.mzizi.dev (once DNS is wired up).
 *
 * Worker bindings (`env`) are surfaced to `@supabase/server`'s
 * `createSupabaseContext` via the explicit `env` override, so no `process.env`
 * coupling is needed. The handler is rebuilt per request so the worker can
 * pick up secret rotations on the next invocation without a redeploy.
 */

import { createMziziHttpHandler } from "./http.js"

export interface Env {
  SUPABASE_URL: string
  SUPABASE_PUBLISHABLE_KEY: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const handler = createMziziHttpHandler({
      supabaseConfig: {
        auth: "none",
        cors: false,
        env: {
          url: env.SUPABASE_URL,
          publishableKeys: { default: env.SUPABASE_PUBLISHABLE_KEY },
        },
      },
    })
    return handler(request)
  },
}
