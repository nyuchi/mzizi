-- Changelog row for v4.0.40 — Mzizi transition + node-aware portal surfaces.
--
-- Applied to the live Supabase project (grjsboqkaywpwatvrzmy) via the
-- design-portal MCP at PR time using `apply_migration`. Tracked here as a
-- text record so the PR shows the exact row that landed.
--
-- The migration was named: `changelog_v4_0_40_mzizi_transition_release`.
--
-- Idempotent: guarded by `WHERE NOT EXISTS` so re-running is safe. Note that
-- the `changelog` table does NOT enforce a unique constraint on `version`,
-- so historically a row already existed for version 4.0.40 (id 47, dated
-- 2026-04-29, "Infrastructure topology declaration"). This row sits next
-- to it; if a uniqueness constraint is added later, the older row should
-- be merged or migrated forward — flagged in CLAUDE.md §14.

BEGIN;

INSERT INTO public.changelog (
  version,
  title,
  description,
  nodes_affected,
  axes_affected,
  components_added,
  components_modified,
  components_deprecated,
  components_removed,
  tools_added,
  tools_modified,
  tools_deprecated,
  tools_removed,
  linked_issues,
  changed_by,
  released_at
)
SELECT
  '4.0.40',
  'v4.0.40 — Mzizi transition + node-aware portal surfaces',
  $$Doctrine + release cleanup landing the Mzizi transition (#104) and the node-aware portal surfaces wired by #103–#107. PR #103 renamed layers to nodes across the registry and shipped the database migration. PR #104 stripped the Fundi edge function from the portal (it moved to nyuchi/mzizi-tools), retired the in-repo MDX renderers in favour of bundu-docs / nyuchi-docs (Astro Starlight), removed the Stytch B2B auth surface (the portal is anon-only now), rebranded everything from Nyuchi Design Portal to Mzizi, relicensed to Apache-2.0, swapped the document-route MCP to @supabase/server with auth:'none', fixed the MDX styling regression on native markdown elements, and pinned qs via pnpm overrides. PR #105 wired the /observability open-data dashboard with live charts from usage_events, fundi_issues, and chaos_events. PR #106 wired /playground and /playground/[name]. PR #107 wired /changelog, /tools, /tools/[name], the per-component /changelog/[name] route, and the <NodeBadge> + <StatusBadge> registry primitives. Also bundled: CLAUDE.md rewritten for post-#104 reality (node language, four-repo ecosystem split — Mzizi/Mukoko/Nyuchi/Bundu, document-route MCP doctrine, count-as-data rule); openapi.yaml audited against the live route tree and its ChangelogEntry + /stats schemas brought in line with the post-#107 DB shape; README refreshed for the Mzizi identity and Bundu Foundation governance footer.$$,
  ARRAY[1,2,3,4,5,6,7,8,10]::int[],
  ARRAY['X','Y','Z','Outside','Documentation']::text[],
  ARRAY['node-badge','status-badge']::text[],
  ARRAY['mukoko-header','mukoko-footer','mukoko-theme-provider','mukoko-skeleton-set','mukoko-error-set','mukoko-verified-badge']::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY['createMziziMcpServer','mzizi://components','mzizi://nodes','list_collections']::text[],
  ARRAY['list_components','get_component','get_database_status']::text[],
  ARRAY[]::text[],
  ARRAY['get_component_docs','get_component_links','get_component_versions','search_components','get_design_tokens','scaffold_component','get_install_command','get_brand_info','get_architecture_info','get_ubuntu_doctrine','get_ubuntu_pillars','get_ubuntu_principles','get_architecture_frontend','get_usage_stats','get_layer_summary','list_skills','get_skill','get_ai_instructions','get_changelog']::text[],
  ARRAY[103,104,105,106,107]::int[],
  'mzizi-release-bot',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.changelog
  WHERE version = '4.0.40'
    AND title = 'v4.0.40 — Mzizi transition + node-aware portal surfaces'
);

COMMIT;
