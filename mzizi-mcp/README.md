# mzizi-mcp

> Model Context Protocol server for the Mzizi component registry.

Reads the **document-route** store on Supabase — one self-contained JSON
document per component, keyed by node collection
(`n1_tokens` … `n10_documentation`). One fetch, no joins.

This is the **new-tooling tier** of the Mzizi/Bundu/Nyuchi MCP stack. The
legacy relational MCP lives on the `legacy` branch of `nyuchi/design-portal`
and is served at `design.nyuchi.com/mcp`. This server is the going-forward
implementation.

## Distribution

Three transports, one server factory:

| Surface           | Entry            | Use                                              |
| ----------------- | ---------------- | ------------------------------------------------ |
| **stdio**         | `npx mzizi-mcp`  | Local AI assistants (Claude Code, Cursor, etc.)  |
| **HTTP / Worker** | `mzizi-mcp/http` | Cloudflare Workers + Next.js + any fetch-runtime |
| **Library**       | `mzizi-mcp`      | Embed the server factory in your own host        |

## Tools

| Tool                  | Returns                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `list_components`     | Lean index, filterable by `node` (1–10) or `owner`                 |
| `get_component`       | Full JSON document — metadata, owner, sources, files, legacy, docs |
| `list_collections`    | Per-node counts + ownership breakdown                              |
| `get_database_status` | Connection health + document count                                 |

## Resources

| URI                  | Content                         |
| -------------------- | ------------------------------- |
| `mzizi://components` | Lean component index            |
| `mzizi://nodes`      | Per-node summary with ownership |

## Configuration

The server is read-only and uses the Supabase anon role under RLS. Set:

```
SUPABASE_URL              # or NEXT_PUBLIC_SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY  # or NEXT_PUBLIC_SUPABASE_ANON_KEY
```

The HTTP handler accepts an optional `WithSupabaseConfig` override.

## License

Apache-2.0.
