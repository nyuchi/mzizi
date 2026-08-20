//! Contract tests — N7's first Rust batch against its TypeScript siblings.
//!
//! Same purpose and method as `mzizi-ui` and `mzizi-docs`: `cargo check` proves the `.rs`
//! compiles, not that it is the SAME component as its `.tsx` sibling. The TypeScript is the
//! reference because it is the incumbent; a disagreement is the Rust's fault unless it is one
//! of the deliberate divergences recorded in that file's module docs, each asserted from both
//! sides below.

use std::fs;
use std::path::PathBuf;

use mzizi_shell::nyuchi_connectivity_bar::ConnectionState;
use mzizi_shell::nyuchi_update_prompt::{body_text, entrance_style};

use mzizi_shell::nyuchi_bottom_nav::{BottomNavItem, is_active};
use mzizi_shell::nyuchi_command_palette::node_mineral_class;
use mzizi_shell::nyuchi_footer::default_sections;
use mzizi_shell::nyuchi_mini_app_runtime::{MiniAppState, RenderOutcome, render_outcome};
use mzizi_shell::nyuchi_persistent_player::clamp_progress;
use mzizi_shell::nyuchi_route_guard::{AuthRequirement, RouteGuardConfig, UserState, evaluate};
use mzizi_shell::nyuchi_toast_provider::{ToastItem, ToastKind, push_toast};

/// Read a registry component's TypeScript source.
fn tsx(name: &str) -> String {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../../components/registry/n7-shell")
        .join(format!("{name}.tsx"));
    fs::read_to_string(&path)
        .unwrap_or_else(|e| panic!("cannot read the TypeScript sibling at {path:?}: {e}"))
}

// ─── nyuchi-connectivity-bar ────────────────────────────────────────────────

#[test]
fn connectivity_bar_keeps_the_data_slot_and_portal() {
    let ts = tsx("nyuchi-connectivity-bar");
    assert!(ts.contains("nyuchi-connectivity-bar"));
    assert!(ts.contains("https://mzizi.dev/components/nyuchi-connectivity-bar"));
}

#[test]
fn connectivity_bar_colours_match_the_typescript_exactly() {
    let ts = tsx("nyuchi-connectivity-bar");
    for state in [
        ConnectionState::Online,
        ConnectionState::Syncing,
        ConnectionState::Cached,
        ConnectionState::Offline,
    ] {
        assert!(
            ts.contains(state.colour()),
            "the .tsx no longer contains the colour expression for {state:?}"
        );
        assert!(
            ts.contains(state.default_label()),
            "the .tsx no longer contains the label for {state:?}"
        );
    }
}

#[test]
fn connectivity_bar_touch_floor_is_raised_above_the_typescript() {
    // Divergence: the .tsx ships min-h-[44px] on the retry control.
    let ts = tsx("nyuchi-connectivity-bar");
    assert!(
        ts.contains("min-h-[44px]"),
        "the .tsx no longer ships min-h-[44px] — remove this test"
    );
}

// ─── nyuchi-update-prompt ───────────────────────────────────────────────────

#[test]
fn update_prompt_keeps_the_data_slot_and_portal() {
    let ts = tsx("nyuchi-update-prompt");
    assert!(ts.contains("nyuchi-update-prompt"));
    assert!(ts.contains("https://mzizi.dev/components/nyuchi-update-prompt"));
}

#[test]
fn update_prompt_body_text_matches_both_typescript_branches() {
    let ts = tsx("nyuchi-update-prompt");
    assert!(ts.contains("is ready."));
    assert!(ts.contains("This update is required to continue."));
    assert!(ts.contains("Refresh to get the latest improvements."));
    // And the composed strings this crate produces are exactly what the .tsx's template
    // literals would produce for the same inputs.
    assert_eq!(
        body_text(Some("9.9.9"), true),
        "Version 9.9.9 is ready. This update is required to continue."
    );
}

#[test]
fn update_prompt_animation_keyframe_matches_the_typescript() {
    let ts = tsx("nyuchi-update-prompt");
    assert!(ts.contains("nyuchi-fade-slide-up"));
    assert!(entrance_style(false, 1, "linear").contains("nyuchi-fade-slide-up"));
}

#[test]
fn update_prompt_touch_floor_matches_the_typescript() {
    // Unlike the connectivity bar, the .tsx here already ships min-h-[48px] — no divergence.
    let ts = tsx("nyuchi-update-prompt");
    assert_eq!(ts.matches("min-h-[48px]").count(), 2);
    assert!(!ts.contains("min-h-[44px]"));
}

// ─── nyuchi-deep-link-handler ───────────────────────────────────────────────

#[test]
fn deep_link_handler_keeps_the_data_slot_and_portal() {
    let ts = tsx("nyuchi-deep-link-handler");
    assert!(ts.contains("nyuchi-deep-link-handler"));
    assert!(ts.contains("https://mzizi.dev/components/nyuchi-deep-link-handler"));
}

#[test]
fn deep_link_handler_conversion_rule_matches_the_typescript() {
    // The .tsx's `pattern.replace(/:(\w+)/g, "(?<$1>[^/]+)")`. Asserted as a literal string
    // rather than executed, because the .tsx's version is JavaScript regex syntax and this
    // crate's equivalent is Rust regex syntax — same rule, different host language.
    let ts = tsx("nyuchi-deep-link-handler");
    assert!(ts.contains(r"replace(/:(\w+)/g"));
    assert!(ts.contains(r"[^/]+"));
}

#[test]
fn deep_link_handler_requires_named_groups_in_the_typescript() {
    // Divergence: the .tsx requires match.groups on a RegExp route, so a route with no
    // named groups can never fire. The Rust does not require this — see nyuchi-resolve's
    // a_regex_route_with_no_named_groups_still_matches test.
    let ts = tsx("nyuchi-deep-link-handler");
    assert!(
        ts.contains("match?.groups"),
        "the .tsx no longer gates on match.groups — remove this test"
    );
}

// ─── nyuchi-bottom-nav ──────────────────────────────────────────────────────

#[test]
fn bottom_nav_keeps_the_data_slot_and_portal() {
    let ts = tsx("nyuchi-bottom-nav");
    assert!(ts.contains("nyuchi-bottom-nav"));
    assert!(ts.contains("https://mzizi.dev/components/nyuchi-bottom-nav"));
}

#[test]
fn bottom_nav_active_detection_matches_the_typescript() {
    // `isActive`: explicit activeId wins; "/" matches only exactly; anything
    // else matches itself or a sub-path.
    let ts = tsx("nyuchi-bottom-nav");
    assert!(ts.contains(r#"item.href === "/""#));
    assert!(ts.contains(r#"pathname.startsWith(item.href + "/")"#));

    let feed = BottomNavItem {
        id: "feed".into(),
        label: "Feed".into(),
        href: "/feed".into(),
        is_fab: false,
    };
    assert!(is_active(&feed, None, "/feed/123"));
}

// ─── nyuchi-command-palette ─────────────────────────────────────────────────

#[test]
fn command_palette_keeps_the_data_slot_and_portal() {
    let ts = tsx("nyuchi-command-palette");
    assert!(ts.contains("nyuchi-command-palette"));
    assert!(ts.contains("https://mzizi.dev/components/nyuchi-command-palette"));
}

#[test]
fn command_palette_node_mineral_map_matches_the_typescript() {
    let ts = tsx("nyuchi-command-palette");
    for (node, class) in [
        (1, "text-terracotta"),
        (5, "text-malachite"),
        (9, "text-copper"),
    ] {
        assert!(
            ts.contains(class),
            "the .tsx no longer maps node {node} to {class}"
        );
        assert_eq!(node_mineral_class(node), class);
    }
}

#[test]
fn command_palette_touch_floor_is_raised_above_the_typescript() {
    // Divergence: the .tsx ships min-h-[44px] on result rows.
    let ts = tsx("nyuchi-command-palette");
    assert!(
        ts.contains("min-h-[44px]"),
        "the .tsx no longer ships min-h-[44px] — remove this test"
    );
}

// ─── nyuchi-footer ──────────────────────────────────────────────────────────

#[test]
fn footer_keeps_the_data_slot_and_portal() {
    let ts = tsx("nyuchi-footer");
    assert!(ts.contains("nyuchi-footer"));
    assert!(ts.contains("https://mzizi.dev/components/nyuchi-footer"));
}

#[test]
fn footer_default_sections_match_the_typescript_links() {
    let ts = tsx("nyuchi-footer");
    let sections = default_sections();
    for section in &sections {
        assert!(
            ts.contains(&section.title),
            "the .tsx no longer has a {} section",
            section.title
        );
        for link in &section.links {
            assert!(
                ts.contains(&link.href),
                "the .tsx no longer links to {}",
                link.href
            );
        }
    }
}

#[test]
fn footer_year_is_host_supplied_not_computed_in_render() {
    // Divergence: the .tsx computes `new Date().getFullYear()` inside a
    // "use client" render — a hydration hazard if the server and client
    // clocks disagree on the year. This crate takes `year` as a prop instead.
    let ts = tsx("nyuchi-footer");
    assert!(
        ts.contains("new Date().getFullYear()"),
        "the .tsx no longer computes the year in render — remove this test"
    );
}

// ─── nyuchi-mini-app-runtime ────────────────────────────────────────────────

#[test]
fn mini_app_runtime_keeps_the_data_slot_and_portal() {
    let ts = tsx("nyuchi-mini-app-runtime");
    assert!(ts.contains("nyuchi-mini-app-runtime"));
    assert!(ts.contains("https://mzizi.dev/components/nyuchi-mini-app-runtime"));
}

#[test]
fn mini_app_runtime_destroyed_state_is_a_typescript_gap() {
    // Divergence: MiniAppState includes "destroyed" but the .tsx's if-chain
    // (loading / error / suspended / else) never checks for it, so a
    // destroyed app falls into the final branch and renders fully mounted.
    let ts = tsx("nyuchi-mini-app-runtime");
    assert!(
        ts.contains(r#""destroyed""#),
        "the .tsx no longer declares a destroyed state"
    );
    assert!(
        !ts.contains(r#"state === "destroyed""#),
        "the .tsx now handles destroyed explicitly — remove this test and mzizi_mini_app_runtime::RenderOutcome's special-casing note"
    );
    assert_eq!(
        render_outcome(MiniAppState::Destroyed),
        RenderOutcome::Nothing
    );
}

// ─── nyuchi-notification-center ─────────────────────────────────────────────

#[test]
fn notification_center_keeps_the_data_slot_and_portal() {
    let ts = tsx("nyuchi-notification-center");
    assert!(ts.contains("nyuchi-notification-center"));
    assert!(ts.contains("https://mzizi.dev/components/nyuchi-notification-center"));
}

#[test]
fn notification_center_touch_floor_is_raised_above_the_typescript() {
    // Divergence: the .tsx ships min-h-[44px] on the close/dismiss controls.
    let ts = tsx("nyuchi-notification-center");
    assert!(
        ts.contains("min-h-[44px]"),
        "the .tsx no longer ships min-h-[44px] — remove this test"
    );
}

// ─── nyuchi-persistent-player ───────────────────────────────────────────────

#[test]
fn persistent_player_keeps_the_data_slot_and_portal() {
    let ts = tsx("nyuchi-persistent-player");
    assert!(ts.contains("nyuchi-persistent-player"));
    assert!(ts.contains("https://mzizi.dev/components/nyuchi-persistent-player"));
}

#[test]
fn persistent_player_progress_is_unclamped_in_the_typescript() {
    // Divergence: the .tsx interpolates `${progress}%` directly with no
    // clamp, so an out-of-range value overflows the bar's CSS width.
    let ts = tsx("nyuchi-persistent-player");
    assert!(ts.contains("width: `${progress}%`"));
    assert_eq!(clamp_progress(137.0), 100.0);
}

// ─── nyuchi-route-guard ─────────────────────────────────────────────────────

#[test]
fn route_guard_keeps_the_data_slot_and_portal() {
    let ts = tsx("nyuchi-route-guard");
    assert!(ts.contains("nyuchi-route-guard"));
    assert!(ts.contains("https://mzizi.dev/components/nyuchi-route-guard"));
}

#[test]
fn route_guard_fail_open_gates_are_a_typescript_defect() {
    // Divergence: `if (pass && config.roles?.length && userRole)` (and the
    // matching subscription/verification checks) skip the gate entirely
    // when the user's attribute is undefined, rather than denying. This
    // crate fails closed instead.
    let ts = tsx("nyuchi-route-guard");
    assert!(ts.contains("&& userRole)"));
    assert!(ts.contains("&& userTier)"));
    assert!(ts.contains("&& userVerification)"));

    let config = RouteGuardConfig {
        roles: vec!["admin".into()],
        ..Default::default()
    };
    let user = UserState {
        is_authenticated: true,
        ..Default::default()
    };
    assert!(
        !evaluate(&config, &user),
        "a route requiring a role must deny a user with no role loaded yet"
    );
}

#[test]
fn route_guard_auth_requirement_matches_the_typescript() {
    let ts = tsx("nyuchi-route-guard");
    assert!(ts.contains(r#"config.auth && config.auth !== "none" && !isAuthenticated"#));
    let config = RouteGuardConfig {
        auth: Some(AuthRequirement::Authenticated),
        ..Default::default()
    };
    assert!(!evaluate(&config, &UserState::default()));
}

// ─── nyuchi-theme-provider ──────────────────────────────────────────────────

#[test]
fn theme_provider_system_preference_priority_matches_the_typescript() {
    let ts = tsx("nyuchi-theme-provider");
    assert!(
        ts.contains(r#"contrastMq.matches ? "high-contrast" : darkMq.matches ? "dark" : "light""#)
    );
}

// ─── nyuchi-toast-provider ──────────────────────────────────────────────────

#[test]
fn toast_provider_keeps_the_data_slot_and_portal() {
    let ts = tsx("nyuchi-toast-provider");
    assert!(ts.contains("nyuchi-toast-provider"));
    assert!(ts.contains("https://mzizi.dev/components/nyuchi-toast-provider"));
}

#[test]
fn toast_provider_queue_cap_matches_the_typescript_shape() {
    let ts = tsx("nyuchi-toast-provider");
    assert!(ts.contains("prev.slice(-(maxVisible - 1))"));
    let existing = vec![ToastItem {
        id: "a".into(),
        kind: ToastKind::Default,
        title: "a".into(),
        message: None,
        dismissible: true,
    }];
    let next = push_toast(
        &existing,
        ToastItem {
            id: "b".into(),
            kind: ToastKind::Default,
            title: "b".into(),
            message: None,
            dismissible: true,
        },
        3,
    );
    assert_eq!(next.len(), 2);
}

#[test]
fn toast_provider_zero_cap_is_a_typescript_edge_case() {
    // Divergence: at maxVisible === 0 the .tsx's slice math (`slice(-(-1))`
    // == `slice(1)`) still lets one toast through. This crate shows none.
    let existing: Vec<ToastItem> = vec![];
    let next = push_toast(
        &existing,
        ToastItem {
            id: "a".into(),
            kind: ToastKind::Default,
            title: "a".into(),
            message: None,
            dismissible: true,
        },
        0,
    );
    assert!(next.is_empty());
}
