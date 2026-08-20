//! Mzizi N7 shell for Rust — the app-chrome rung: header, nav, connectivity, theme, lifecycle.
//!
//! # Where the components are
//!
//! Not in this crate's `src/`. Each is a file under `components/registry/n7-shell/<name>.rs`,
//! beside the `.tsx` implementing the same contract for a JavaScript host, and this module
//! `#[path]`-includes it.
//!
//! # 12 of 16, node closed except for the N2-blocked three
//!
//! N7 has 16 components. 12 are ported here. `app-switcher`, `nyuchi-header` and
//! `nyuchi-sidebar` depend on N2 primitives (`button`, `popover`, the shadcn `sidebar`
//! primitive) that have no Dioxus port yet — porting them first would mean writing throwaway
//! primitive stubs this crate does not own. `nyuchi-root-layout` wraps Next.js's `<html>`/
//! `<body>`, which is the App Router's job, not a portable shell component's; a Dioxus app's
//! root is `dioxus::launch`, not a registry component, so a straight port would be a fiction
//! that compiles. Those four are the only ones left, and none are portable work this crate can
//! do on its own — they wait on N2.

#[path = "../../../../components/registry/n7-shell/nyuchi-connectivity-bar.rs"]
pub mod nyuchi_connectivity_bar;

#[path = "../../../../components/registry/n7-shell/nyuchi-update-prompt.rs"]
pub mod nyuchi_update_prompt;

#[path = "../../../../components/registry/n7-shell/nyuchi-deep-link-handler.rs"]
pub mod nyuchi_deep_link_handler;

#[path = "../../../../components/registry/n7-shell/nyuchi-bottom-nav.rs"]
pub mod nyuchi_bottom_nav;

#[path = "../../../../components/registry/n7-shell/nyuchi-command-palette.rs"]
pub mod nyuchi_command_palette;

#[path = "../../../../components/registry/n7-shell/nyuchi-footer.rs"]
pub mod nyuchi_footer;

#[path = "../../../../components/registry/n7-shell/nyuchi-mini-app-runtime.rs"]
pub mod nyuchi_mini_app_runtime;

#[path = "../../../../components/registry/n7-shell/nyuchi-notification-center.rs"]
pub mod nyuchi_notification_center;

#[path = "../../../../components/registry/n7-shell/nyuchi-persistent-player.rs"]
pub mod nyuchi_persistent_player;

#[path = "../../../../components/registry/n7-shell/nyuchi-route-guard.rs"]
pub mod nyuchi_route_guard;

#[path = "../../../../components/registry/n7-shell/nyuchi-theme-provider.rs"]
pub mod nyuchi_theme_provider;

#[path = "../../../../components/registry/n7-shell/nyuchi-toast-provider.rs"]
pub mod nyuchi_toast_provider;
