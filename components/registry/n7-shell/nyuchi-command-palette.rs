//! NYUCHI COMMAND PALETTE — N7 shell, Dioxus.
//!
//! The Rust sibling of `nyuchi-command-palette.tsx`: global search + actions, Cmd+K / Ctrl+K,
//! sharing its contract — same `data-slot`, same node-mineral colour map, same grouping.

use dioxus::prelude::*;

/// A single result/action row. Selection is dispatched by `id` through
/// `NyuchiCommandPaletteProps::on_select` rather than a per-item closure,
/// so the item list stays plain data (Clone/PartialEq, easy to test).
#[derive(Clone, Debug, PartialEq)]
pub struct CommandItem {
    /// Unique identifier, passed back through `on_select`.
    pub id: String,
    /// Display label.
    pub label: String,
    /// Optional secondary text shown under the label.
    pub description: Option<String>,
    /// Result group; items with no category fall under "Results".
    pub category: Option<String>,
    /// Optional keyboard shortcut hint, shown when `node` is absent.
    pub shortcut: Option<String>,
    /// Architecture node (1-12) — renders as a mineral-coloured N-chip.
    pub node: Option<u8>,
}

/// Node -> mineral Tailwind class. Static strings only (never constructed), per the
/// design-system styling rule — Tailwind's content scanner needs the literal class.
pub fn node_mineral_class(node: u8) -> &'static str {
    match node {
        1 => "text-terracotta",
        2 => "text-cobalt",
        3 => "text-tanzanite",
        4 => "text-gold",
        5 => "text-malachite",
        6 => "text-cobalt",
        7 => "text-gold",
        8 => "text-sodalite",
        9 => "text-copper",
        10 => "text-sodalite",
        _ => "text-muted-foreground",
    }
}

/// Groups items by category, first-seen order — matching the .tsx's
/// `acc[cat] ||= []` reduce, whose insertion order a `BTreeMap` would have
/// silently re-sorted alphabetically and changed the on-screen order.
pub fn group_by_category(items: &[CommandItem]) -> Vec<(String, Vec<CommandItem>)> {
    let mut groups: Vec<(String, Vec<CommandItem>)> = Vec::new();
    for item in items {
        let cat = item
            .category
            .clone()
            .unwrap_or_else(|| "Results".to_string());
        match groups.iter_mut().find(|(c, _)| *c == cat) {
            Some((_, list)) => list.push(item.clone()),
            None => groups.push((cat, vec![item.clone()])),
        }
    }
    groups
}

/// Cmd+K / Ctrl+K toggles the palette open or closed.
pub fn should_toggle(key: &str, meta_or_ctrl: bool) -> bool {
    meta_or_ctrl && key == "k"
}

/// Escape closes the palette only while it is open.
pub fn should_close_on_escape(key: &str, open: bool) -> bool {
    open && key == "Escape"
}

/// Props for [`NyuchiCommandPalette`].
#[derive(Props, Clone, PartialEq)]
pub struct NyuchiCommandPaletteProps {
    /// Whether the palette is currently shown.
    pub open: bool,
    /// Search results for the current query.
    pub items: Vec<CommandItem>,
    /// Shown instead of `items` while the query is empty.
    pub recent_items: Vec<CommandItem>,
    /// Placeholder text for the search input.
    #[props(default = "Search or type a command...".to_string())]
    pub placeholder: String,
    /// The current search query, controlled by the host.
    pub query: String,
    /// Whether a search is in flight.
    pub loading: bool,
    /// Fired as the query text changes.
    #[props(default)]
    pub on_query_change: EventHandler<String>,
    /// Fired with an item's `id` when it is chosen.
    #[props(default)]
    pub on_select: EventHandler<String>,
    /// Fired to open or close the palette (backdrop click, selection, Escape).
    #[props(default)]
    pub on_open_change: EventHandler<bool>,
}

/// Global search / command dialog, Cmd+K-style.
#[component]
pub fn NyuchiCommandPalette(props: NyuchiCommandPaletteProps) -> Element {
    if !props.open {
        return rsx! {};
    }
    let grouped = group_by_category(&props.items);

    rsx! {
        div {
            class: "fixed inset-0 z-50 bg-black/50",
            "aria-hidden": "true",
            onclick: move |_| props.on_open_change.call(false),
        }
        div {
            "data-slot": "nyuchi-command-palette",
            "data-portal": "https://mzizi.dev/components/nyuchi-command-palette",
            role: "dialog",
            "aria-label": "Command palette",
            "aria-modal": "true",
            class: "fixed inset-x-4 top-[15%] z-50 mx-auto max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl",

            div { class: "flex items-center border-b border-border px-4",
                input {
                    value: "{props.query}",
                    placeholder: "{props.placeholder}",
                    "aria-label": "Search commands",
                    class: "flex-1 bg-transparent px-3 py-4 text-sm outline-none placeholder:text-muted-foreground",
                    oninput: move |e| props.on_query_change.call(e.value()),
                }
            }

            div { class: "max-h-[60vh] overflow-y-auto p-2", role: "listbox",
                if props.query.is_empty() && !props.recent_items.is_empty() {
                    div {
                        p { class: "px-2 py-1.5 text-xs font-medium text-muted-foreground", "Recent" }
                        for item in props.recent_items.iter() {
                            button {
                                key: "{item.id}",
                                role: "option",
                                class: "flex min-h-[48px] w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                                onclick: {
                                    let id = item.id.clone();
                                    move |_| { props.on_select.call(id.clone()); props.on_open_change.call(false); }
                                },
                                "{item.label}"
                            }
                        }
                    }
                }
                for (cat, cat_items) in grouped.iter() {
                    div {
                        key: "{cat}",
                        p { class: "px-2 py-1.5 text-xs font-medium text-muted-foreground", "{cat}" }
                        for item in cat_items.iter() {
                            button {
                                key: "{item.id}",
                                role: "option",
                                class: "flex min-h-[48px] w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                                onclick: {
                                    let id = item.id.clone();
                                    move |_| { props.on_select.call(id.clone()); props.on_open_change.call(false); }
                                },
                                "{item.label}"
                            }
                        }
                    }
                }
                if !props.query.is_empty() && props.items.is_empty() && !props.loading {
                    p { class: "py-8 text-center text-sm text-muted-foreground", "No results found" }
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn item(id: &str, category: Option<&str>) -> CommandItem {
        CommandItem {
            id: id.into(),
            label: id.into(),
            description: None,
            category: category.map(str::to_string),
            shortcut: None,
            node: None,
        }
    }

    #[test]
    fn unknown_node_falls_back_to_muted_not_a_wrong_colour() {
        assert_eq!(node_mineral_class(11), "text-muted-foreground");
        assert_eq!(node_mineral_class(1), "text-terracotta");
    }

    #[test]
    fn grouping_preserves_first_seen_category_order() {
        let items = vec![
            item("a", Some("Zebra")),
            item("b", Some("Apple")),
            item("c", Some("Zebra")),
        ];
        let grouped = group_by_category(&items);
        let order: Vec<&str> = grouped.iter().map(|(c, _)| c.as_str()).collect();
        // "Zebra" appeared first in the input, so it must stay first — a BTreeMap
        // would have alphabetized this to Apple, Zebra and silently reordered the UI.
        assert_eq!(order, vec!["Zebra", "Apple"]);
        assert_eq!(grouped[0].1.len(), 2);
    }

    #[test]
    fn uncategorised_items_group_under_results() {
        let items = vec![item("a", None)];
        let grouped = group_by_category(&items);
        assert_eq!(grouped[0].0, "Results");
    }

    #[test]
    fn ctrl_or_meta_k_toggles() {
        assert!(should_toggle("k", true));
        assert!(!should_toggle("k", false));
        assert!(!should_toggle("j", true));
    }

    #[test]
    fn escape_only_closes_while_open() {
        assert!(should_close_on_escape("Escape", true));
        assert!(!should_close_on_escape("Escape", false));
    }
}
