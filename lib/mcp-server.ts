/**
 * Mzizi MCP Server — new tooling track, document-route.
 *
 * Reads from the `component_documents` staging table on Supabase. Each row is
 * a self-contained component document (`{ owner, sources, legacy, files, …}`)
 * keyed by node collection (n1_tokens … n10_documentation). One fetch, no
 * joins — the MCP just looks up a document and returns it.
 *
 * Read-only. The HTTP entrypoint at `app/mcp/route.ts` uses
 * `@supabase/server`'s `createSupabaseContext` with `auth: 'none'` to mint a
 * per-request anon-scoped `SupabaseClient` (RLS-enforced public select on
 * `component_documents`). The factory below just consumes that client.
 *
 * The legacy relational MCP is retired (the `legacy` branch was dropped);
 * `design.nyuchi.com` now 308-redirects to `mzizi.dev`.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"

const VERSION = "4.0.41"

// ─── Result helpers ─────────────────────────────────────────────────────────

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
 * Fetch rows from `component_documents`, paging past PostgREST's max-rows cap
 * (1000 by default). The document store holds >3k rows, so a single unpaged
 * select silently truncates — counts come back wrong and whole collections
 * (shell, safety, agentic-components, …) disappear from the surface. Ordered
 * by the `(collection, name)` primary key so pages are stable.
 */
async function fetchAllDocumentRows<T>(
  supabase: SupabaseClient,
  columns: string
): Promise<{ rows: T[]; error: unknown }> {
  const rows: T[] = []
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("component_documents")
      .select(columns)
      .order("collection", { ascending: true })
      .order("name", { ascending: true })
      .range(from, from + pageSize - 1)
    if (error) return { rows, error }
    const batch = (data ?? []) as T[]
    rows.push(...batch)
    if (batch.length < pageSize) return { rows, error: null }
  }
}

// ─── Server factory ─────────────────────────────────────────────────────────

/**
 * Build the Mzizi MCP server bound to a request-scoped Supabase client.
 *
 * The caller (the `/mcp` route handler) creates the client via
 * `createSupabaseContext` from `@supabase/server` with `auth: 'none'` — the
 * resulting `ctx.supabase` is anon-scoped and read-only under RLS.
 */
export async function createMziziMcpServer(supabase: SupabaseClient): Promise<McpServer> {
  const server = new McpServer({ name: "mzizi", version: VERSION })

  // ── Resources ─────────────────────────────────────────────────────────────

  server.resource(
    "components",
    "mzizi://components",
    {
      description:
        "Mzizi component registry index — one row per component (name / node / collection / owner). The full document is available via the get_component tool.",
    },
    async () => {
      const { rows } = await fetchAllDocumentRows(supabase, "name, node, collection, owner")
      return {
        contents: [
          {
            uri: "mzizi://components",
            mimeType: "application/json",
            text: JSON.stringify(rows, null, 2),
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
      const { rows } = await fetchAllDocumentRows<{
        node: number
        collection: string
        owner: string
      }>(supabase, "node, collection, owner")
      const summary = new Map<
        string,
        { node: number; collection: string; total: number; byOwner: Record<string, number> }
      >()
      for (const row of rows) {
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
    "List components from the document store. Optionally filter by node (1–10) or owner (bundu | nyuchi | mzizi | framework). Returns the lean index (name / node / collection / owner) — use get_component for the full document.",
    {
      node: z.number().int().min(1).max(10).optional(),
      owner: z.enum(["bundu", "nyuchi", "mzizi", "framework"]).optional(),
      limit: z.number().int().min(1).max(5000).default(500),
    },
    async ({ node, owner, limit }) => {
      try {
        // Page in PK order so requests above PostgREST's 1000-row cap still
        // return every matching row up to `limit`.
        const rows: Array<{ name: string; node: number; collection: string; owner: string }> = []
        const pageSize = 1000
        while (rows.length < limit) {
          const take = Math.min(pageSize, limit - rows.length)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let q: any = (supabase as any)
            .from("component_documents")
            .select("name, node, collection, owner")
            .order("collection", { ascending: true })
            .order("name", { ascending: true })
            .range(rows.length, rows.length + take - 1)
          if (node != null) q = q.eq("node", node)
          if (owner) q = q.eq("owner", owner)
          const { data, error } = await q
          if (error) return toolError("list_components query failed", error)
          const batch = data ?? []
          rows.push(...batch)
          if (batch.length < take) break
        }
        return jsonContent(rows)
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
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
        const { rows, error } = await fetchAllDocumentRows<{
          node: number
          collection: string
          owner: string
        }>(supabase, "node, collection, owner")
        if (error) return toolError("list_collections query failed", error)
        const summary = new Map<
          string,
          { node: number; collection: string; total: number; byOwner: Record<string, number> }
        >()
        for (const row of rows) {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count, error } = await (supabase as any)
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
