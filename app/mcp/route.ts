import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { createMziziMcpServer } from "@/lib/mcp-server"

/**
 * Mzizi MCP — mzizi.dev/mcp (new tooling, document-route)
 *
 * Reads the `component_documents` Supabase table — one document per component
 * — and serves it over Streamable HTTP transport, stateless. Read-only via
 * the anon key + RLS. The legacy relational MCP lives on the `legacy` branch
 * (→ design.nyuchi.com/mcp); the two are split deliberately.
 *
 *   POST /mcp    — JSON-RPC (initialize, tool calls, resource reads)
 *   GET  /mcp    — SSE stream for server-initiated notifications
 *   DELETE /mcp  — Session cleanup
 *   OPTIONS /mcp — CORS preflight
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, MCP-Protocol-Version, MCP-Session-Id",
}

function createTransport() {
  return new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
    enableJsonResponse: true,
  })
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export async function POST(request: Request) {
  const transport = createTransport()
  const server = await createMziziMcpServer()

  await server.connect(transport)

  const response = await transport.handleRequest(request)

  return withCors(response)
}

export async function GET(request: Request) {
  const transport = createTransport()
  const server = await createMziziMcpServer()

  await server.connect(transport)

  const response = await transport.handleRequest(request)

  return withCors(response)
}

export async function DELETE(request: Request) {
  const transport = createTransport()
  const server = await createMziziMcpServer()

  await server.connect(transport)

  const response = await transport.handleRequest(request)

  return withCors(response)
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, MCP-Protocol-Version, MCP-Session-Id",
    },
  })
}
