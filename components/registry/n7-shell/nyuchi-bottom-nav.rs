//! NYUCHI BOTTOM NAV — N7 shell, Dioxus.
//!
//! The Rust sibling of `nyuchi-bottom-nav.tsx`: 5-item bottom navigation with an optional
//! center FAB, sharing its contract — same `data-slot`, same active-state detection.

use dioxus::prelude::*;

/// Bottom-nav item. `is_fab` marks the raised center action button.
#[derive(Clone, Debug, PartialEq)]
pub struct BottomNavItem {
    /// Unique identifier.
    pub id: String,
    /// Display label.
    pub label: String,
    /// Route path.
    pub href: String,
    /// Whether this item is the center FAB rather than a link.
    pub is_fab: bool,
}

/// Mirrors the .tsx `isActive`: an explicit `active_id` wins; otherwise `/` matches only
/// exactly, and any other href matches itself or any of its sub-paths.
pub fn is_active(item: &BottomNavItem, active_id: Option<&str>, pathname: &str) -> bool {
    if let Some(id) = active_id {
        return id == item.id;
    }
    if item.href == "/" {
        return pathname == "/";
    }
    pathname == item.href || pathname.starts_with(&format!("{}/", item.href))
}

const FAB: &str = "flex size-[52px] -translate-y-6 items-center justify-center rounded-full \
     bg-[var(--brand-accent,var(--color-primary,#00B0FF))] \
     shadow-[0_4px_20px_var(--brand-accent-glow,rgba(100,255,218,0.3))] \
     transition-transform active:scale-95";

const NAV_ITEM: &str = "relative flex min-w-[56px] flex-col items-center gap-[3px] py-1 \
     text-[10px] font-medium transition-colors";

/// Props for [`NyuchiBottomNav`].
#[derive(Props, Clone, PartialEq)]
pub struct NyuchiBottomNavProps {
    /// The nav items to render, including at most one FAB.
    pub items: Vec<BottomNavItem>,
    /// Override active detection (useful for client-side routing).
    pub active_id: Option<String>,
    /// The current route, used for active detection when `active_id` is absent.
    pub pathname: String,
    /// Fired when the center FAB is pressed.
    #[props(default)]
    pub on_fab_click: EventHandler<()>,
}

/// Fixed bottom navigation bar with an optional raised center FAB.
#[component]
pub fn NyuchiBottomNav(props: NyuchiBottomNavProps) -> Element {
    rsx! {
        nav {
            "data-slot": "nyuchi-bottom-nav",
            "data-portal": "https://mzizi.dev/components/nyuchi-bottom-nav",
            class: "fixed inset-x-0 bottom-0 z-50 flex h-20 items-center justify-around \
                     border-t border-border bg-card/90 backdrop-blur-xl \
                     pb-[env(safe-area-inset-bottom)] md:hidden",
            for item in props.items.iter() {
                if item.is_fab {
                    button {
                        key: "{item.id}",
                        "aria-label": "{item.label}",
                        class: "{FAB}",
                        onclick: move |_| props.on_fab_click.call(()),
                        "+"
                    }
                } else {
                    a {
                        key: "{item.id}",
                        href: "{item.href}",
                        class: "{NAV_ITEM}",
                        if is_active(item, props.active_id.as_deref(), &props.pathname) {
                            span { class: "absolute -top-[9px] h-[2.5px] w-7 rounded-full bg-[var(--brand-accent,var(--color-primary,#00B0FF))]" }
                        }
                        span { "{item.label}" }
                    }
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn item(id: &str, href: &str) -> BottomNavItem {
        BottomNavItem {
            id: id.into(),
            label: id.into(),
            href: href.into(),
            is_fab: false,
        }
    }

    #[test]
    fn root_href_matches_only_exactly() {
        let home = item("home", "/");
        assert!(is_active(&home, None, "/"));
        assert!(!is_active(&home, None, "/feed"));
    }

    #[test]
    fn non_root_href_matches_itself_and_sub_paths() {
        let feed = item("feed", "/feed");
        assert!(is_active(&feed, None, "/feed"));
        assert!(is_active(&feed, None, "/feed/123"));
        assert!(!is_active(&feed, None, "/feeds"));
    }

    #[test]
    fn explicit_active_id_overrides_pathname() {
        let feed = item("feed", "/feed");
        assert!(is_active(&feed, Some("feed"), "/somewhere-else"));
        assert!(!is_active(&feed, Some("other"), "/feed"));
    }
}
