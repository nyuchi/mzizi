/**
 * Mzizi MCP — document-route server factory.
 *
 * Reads `component_documents` from Supabase. Each row is a self-contained
 * component document keyed by node collection (n1_tokens … n10_documentation).
 * One fetch, no joins — the MCP just looks up a document and returns it.
 *
 * The factory takes a pre-built `SupabaseClient` so the same factory works
 * across transports: an HTTP entrypoint (per-request anon client via
 * `@supabase/server`) and a stdio entrypoint (long-lived anon client via
 * `@supabase/supabase-js`).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"

export const MZIZI_MCP_VERSION = "0.1.0"

function toolError(message: string, err?: unknown) {
  const reason = err instanceof Error ? err.message : err ? String(err) : ""
  return {
    isError: true,
    content: [{ type: "text" as const, text: reason ? `${message}: ${reason}` : message }],
  }
}

function jsonContent(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] }
}

/**
 * Build the Mzizi MCP server bound to a Supabase client. The client must have
 * SELECT access to `component_documents` (RLS public-read policy is in place).
 */
export async function createMziziMcpServer(supabase: SupabaseClient): Promise<McpServer> {
  const server = new McpServer({ name: "mzizi-mcp", version: MZIZI_MCP_VERSION })

  // ── Resources ─────────────────────────────────────────────────────────────

  server.resource(
    "components",
    "mzizi://components",
    {
      description:
        "Mzizi component registry index — one row per component (name / node / collection / owner). The full document is available via the get_component tool.",
    },
    async () => {
      const { data } = await (supabase as unknown as SupabaseClient)
        .from("component_documents")
        .select("name, node, collection, owner")
        .order("collection", { ascending: true })
        .order("name", { ascending: true })
      return {
        contents: [
          {
            uri: "mzizi://components",
            mimeType: "application/json",
            text: JSON.stringify(data ?? [], null, 2),
          },
        ],
      }
    }
  )

  server.resource(
    "nodes",
    "mzizi://nodes",
    { description: "Per-node collection summary — counts and ownership breakdown." },
    async () => {
      const { data } = await (supabase as unknown as SupabaseClient)
        .from("component_documents")
        .select("node, collection, owner")
      const summary = new Map<
        string,
        { node: number; collection: string; total: number; byOwner: Record<string, number> }
      >()
      for (const row of (data ?? []) as Array<{
        node: number
        collection: string
        owner: string
      }>) {
        const entry = summary.get(row.collection) ?? {
          node: row.node,
          collection: row.collection,
          total: 0,
          byOwner: {},
        }
        entry.total += 1
        entry.byOwner[row.owner] = (entry.byOwner[row.owner] ?? 0) + 1
        summary.set(row.collection, entry)
      }
      return {
        contents: [
          {
            uri: "mzizi://nodes",
            mimeType: "application/json",
            text: JSON.stringify(
              [...summary.values()].sort((a, b) => a.node - b.node),
              null,
              2
            ),
          },
        ],
      }
    }
  )

  // ── Tools ─────────────────────────────────────────────────────────────────

  server.tool(
    "list_components",
    "List components from the document store. Optionally filter by node (1–10) or owner (bundu | nyuchi | mzizi | framework). Returns the lean index — use get_component for the full document.",
    {
      node: z.number().int().min(1).max(10).optional(),
      owner: z.enum(["bundu", "nyuchi", "mzizi", "framework"]).optional(),
      limit: z.number().int().min(1).max(1000).default(200),
    },
    async ({ node, owner, limit }) => {
      try {
        let q = (supabase as unknown as SupabaseClient)
          .from("component_documents")
          .select("name, node, collection, owner")
          .order("collection", { ascending: true })
          .order("name", { ascending: true })
          .limit(limit)
        if (node != null) q = q.eq("node", node)
        if (owner) q = q.eq("owner", owner)
        const { data, error } = await q
        if (error) return toolError("list_components query failed", error)
        return jsonContent(data ?? [])
      } catch (err) {
        return toolError("list_components failed", err)
      }
    }
  )

  server.tool(
    "get_component",
    "Fetch one component as its full JSON document — one read, everything in it (metadata, owner, sources/descriptors, legacy source code, files, docs).",
    {
      name: z.string().min(1).describe("Component name, e.g. 'button', 'nyuchi-tokens'"),
    },
    async ({ name }) => {
      try {
        const { data, error } = await (supabase as unknown as SupabaseClient)
          .from("component_documents")
          .select("name, node, collection, owner, schema_version, document, updated_at")
          .eq("name", name)
          .maybeSingle()
        if (error) return toolError(`get_component('${name}') query failed`, error)
        if (!data) return toolError(`Component '${name}' not found`)
        return jsonContent(data)
      } catch (err) {
        return toolError("get_component failed", err)
      }
    }
  )

  server.tool(
    "list_collections",
    "List the per-node collections (n1_tokens … n10_documentation) with total counts and ownership breakdown.",
    {},
    async () => {
      try {
        const { data, error } = await (supabase as unknown as SupabaseClient)
          .from("component_documents")
          .select("node, collection, owner")
        if (error) return toolError("list_collections query failed", error)
        const summary = new Map<
          string,
          { node: number; collection: string; total: number; byOwner: Record<string, number> }
        >()
        for (const row of (data ?? []) as Array<{
          node: number
          collection: string
          owner: string
        }>) {
          const entry = summary.get(row.collection) ?? {
            node: row.node,
            collection: row.collection,
            total: 0,
            byOwner: {},
          }
          entry.total += 1
          entry.byOwner[row.owner] = (entry.byOwner[row.owner] ?? 0) + 1
          summary.set(row.collection, entry)
        }
        return jsonContent([...summary.values()].sort((a, b) => a.node - b.node))
      } catch (err) {
        return toolError("list_collections failed", err)
      }
    }
  )

  server.tool(
    "get_database_status",
    "Diagnostic info — Supabase connection health and document-store row count.",
    {},
    async () => {
      try {
        const { count, error } = await (supabase as unknown as SupabaseClient)
          .from("component_documents")
          .select("*", { count: "exact", head: true })
        if (error)
          return jsonContent({
            provider: "supabase",
            status: "error",
            error: error.message,
            documents: 0,
            readOnly: true,
          })
        return jsonContent({
          provider: "supabase",
          status: "connected",
          documents: count ?? 0,
          readOnly: true,
        })
      } catch (err) {
        return toolError("get_database_status failed", err)
      }
    }
  )

  return server
}
