#!/usr/bin/env node
/**
 * stdio entry — for the MCP registry (`npx mzizi-mcp`).
 *
 * Spawns the server over the stdio transport, using a long-lived Supabase
 * anon client. RLS on `component_documents` enforces read-only.
 *
 * Env:
 *   SUPABASE_URL              (or NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_PUBLISHABLE_KEY  (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { createClient } from "@supabase/supabase-js"
import { createMziziMcpServer } from "./server.js"

async function main(): Promise<void> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  if (!url || !key) {
    process.stderr.write(
      "mzizi-mcp: missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY (NEXT_PUBLIC_ equivalents are accepted)\n"
    )
    process.exit(1)
  }
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const server = await createMziziMcpServer(supabase)
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? (err.stack ?? err.message) : String(err)
  process.stderr.write(`mzizi-mcp: ${message}\n`)
  process.exit(1)
})
