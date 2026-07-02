import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { createSupabaseContext, type WithSupabaseConfig } from "@supabase/server"
import { createMziziMcpServer } from "@/lib/mcp-server"

/**
 * Mzizi MCP — mzizi.dev/mcp (new tooling, document-route)
 *
 * Reads the `component_documents` Supabase table — one document per component
 * — and serves it over Streamable HTTP transport, stateless.
 *
 * Auth via `@supabase/server`'s `createSupabaseContext` with `auth: 'none'` —
 * a per-request anon-scoped `SupabaseClient` for public-read against RLS. No
 * service-role key in scope, no write APIs exposed.
 *
 * The legacy relational MCP is retired (the `legacy` branch was dropped);
 * `design.nyuchi.com` now 308-redirects to `mzizi.dev`.
 *
 *   POST /mcp    — JSON-RPC (initialize, tool calls, resource reads)
 *   GET  /mcp    — SSE stream for server-initiated notifications
 *   DELETE /mcp  — Session cleanup
 *   OPTIONS /mcp — CORS preflight
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, MCP-Protocol-Version, MCP-Session-Id, apikey",
}

// Map the portal's existing public env vars onto @supabase/server's expected shape.
// Falls back to the package's auto-detection (SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY)
// when only the new-style env vars are set.
const SUPABASE_CONFIG: WithSupabaseConfig = {
  auth: "none",
  cors: false, // we add our own CORS headers below
  env: {
    url: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    publishableKeys: {
      default:
        process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    },
  },
}

function createTransport() {
  return new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
    enableJsonResponse: true,
  })
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

async function handle(request: Request): Promise<Response> {
  const { data: ctx, error } = await createSupabaseContext(request, SUPABASE_CONFIG)
  if (error || !ctx) {
    return withCors(
      Response.json(
        { error: error?.message ?? "Failed to create Supabase context" },
        { status: error?.status ?? 500 }
      )
    )
  }
  const transport = createTransport()
  const server = await createMziziMcpServer(ctx.supabase)
  await server.connect(transport)
  const response = await transport.handleRequest(request)
  return withCors(response)
}

export async function POST(request: Request) {
  return handle(request)
}

export async function GET(request: Request) {
  return handle(request)
}

export async function DELETE(request: Request) {
  return handle(request)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}
