/**
 * HTTP / fetch-handler entry — Cloudflare Workers + Next.js routes + any
 * Web-standard Request/Response runtime.
 *
 * Uses `@supabase/server`'s `createSupabaseContext(request, { auth: 'none' })`
 * to mint a per-request anon-scoped `SupabaseClient`. RLS on
 * `component_documents` enforces read-only.
 */

import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { createSupabaseContext, type WithSupabaseConfig } from "@supabase/server"
import { createMziziMcpServer } from "./server.js"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, MCP-Protocol-Version, MCP-Session-Id, apikey",
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value)
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export interface HttpHandlerOptions {
  /**
   * Override the default `@supabase/server` config. Defaults to
   * `{ auth: 'none', cors: false }` — public read via the anon client.
   */
  supabaseConfig?: WithSupabaseConfig
}

/**
 * Build a fetch handler that serves the Mzizi MCP over Streamable HTTP.
 * Stateless — each request creates a fresh transport + server pair.
 */
export function createMziziHttpHandler(options: HttpHandlerOptions = {}) {
  const config: WithSupabaseConfig = options.supabaseConfig ?? { auth: "none", cors: false }

  return async function handle(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }
    const { data: ctx, error } = await createSupabaseContext(request, config)
    if (error || !ctx) {
      return withCors(
        Response.json(
          { error: error?.message ?? "Failed to create Supabase context" },
          { status: error?.status ?? 500 }
        )
      )
    }
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    })
    const server = await createMziziMcpServer(ctx.supabase)
    await server.connect(transport)
    const response = await transport.handleRequest(request)
    return withCors(response)
  }
}
