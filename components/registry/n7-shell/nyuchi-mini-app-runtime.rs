//! NYUCHI MINI-APP RUNTIME — N7 shell, Dioxus.
//!
//! The Rust sibling of `nyuchi-mini-app-runtime.tsx`: the lifecycle host for a tiered mini-app,
//! sharing its contract — same `data-slot`, same state set.
//!
//! # The "destroyed" state is a gap in the `.tsx`
//!
//! `MiniAppState` in the `.tsx` includes `"destroyed"`, but its render only branches on
//! `"loading"`, `"error"`, and `"suspended"` — everything else, `"destroyed"` included, falls
//! into the final `return` and renders as fully mounted, with `data-state="mounted"` hardcoded
//! (not even reading the actual `state`). A destroyed mini-app would keep rendering its
//! children. `RenderOutcome` here makes that branch exhaustive so `Destroyed` gets its own,
//! nothing-rendered outcome instead of silently reusing `Mounted`'s.
//!
//! **The `.tsx` sibling still has this.**

use dioxus::prelude::*;

/// Lifecycle state of a hosted mini-app.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum MiniAppState {
    /// Being fetched/initialized.
    Loading,
    /// Running and visible.
    Mounted,
    /// Backgrounded but retained.
    Suspended,
    /// Failed to load or crashed.
    Error,
    /// Torn down; nothing of it should render.
    Destroyed,
}

impl MiniAppState {
    /// The wire/attribute representation of this state.
    pub fn as_str(self) -> &'static str {
        match self {
            MiniAppState::Loading => "loading",
            MiniAppState::Mounted => "mounted",
            MiniAppState::Suspended => "suspended",
            MiniAppState::Error => "error",
            MiniAppState::Destroyed => "destroyed",
        }
    }
}

/// Static mini-app identity and constraints.
#[derive(Clone, Debug, PartialEq)]
pub struct MiniAppConfig {
    /// Unique identifier.
    pub id: String,
    /// Display name, shown while loading/erroring.
    pub name: String,
    /// Tier (1 or 2), rendered as `data-tier` while mounted.
    pub tier: u8,
}

/// What to render for a given state — see the module docs for why this is exhaustive where
/// the `.tsx`'s if-chain is not.
#[derive(Debug, PartialEq)]
pub enum RenderOutcome {
    /// Show the loading spinner.
    Loading,
    /// Show the error panel (plus any `fallback`).
    Error,
    /// Render nothing.
    Nothing,
    /// Render the mounted shell and children.
    Mounted,
}

/// Maps a [`MiniAppState`] to what should actually render.
pub fn render_outcome(state: MiniAppState) -> RenderOutcome {
    match state {
        MiniAppState::Loading => RenderOutcome::Loading,
        MiniAppState::Error => RenderOutcome::Error,
        MiniAppState::Suspended | MiniAppState::Destroyed => RenderOutcome::Nothing,
        MiniAppState::Mounted => RenderOutcome::Mounted,
    }
}

/// Props for [`NyuchiMiniAppRuntime`].
#[derive(Props, Clone, PartialEq)]
pub struct NyuchiMiniAppRuntimeProps {
    /// Static mini-app identity and constraints.
    pub config: MiniAppConfig,
    /// Current lifecycle state.
    #[props(default = MiniAppState::Loading)]
    pub state: MiniAppState,
    /// Fired whenever `state` changes.
    #[props(default)]
    pub on_state_change: EventHandler<MiniAppState>,
    /// Replaces `useNyuchiHarness(...).motion.prefersReduced` — the one bit
    /// of the harness this component actually reads.
    #[props(default)]
    pub prefers_reduced_motion: bool,
    /// Extra content shown alongside the error panel.
    pub fallback: Option<Element>,
    /// The mini-app's own UI, shown only while mounted.
    pub children: Element,
}

/// Lifecycle host for a tiered mini-app: loading, error, suspended, or mounted.
#[component]
pub fn NyuchiMiniAppRuntime(props: NyuchiMiniAppRuntimeProps) -> Element {
    match render_outcome(props.state) {
        RenderOutcome::Loading => rsx! {
            div {
                "data-slot": "nyuchi-mini-app-runtime",
                "data-portal": "https://mzizi.dev/components/nyuchi-mini-app-runtime",
                "data-app": "{props.config.id}",
                "data-state": "loading",
                role: "status",
                "aria-label": "Loading {props.config.name}",
                class: "flex min-h-screen items-center justify-center",
                div { class: "flex flex-col items-center gap-3",
                    p { class: "text-sm text-muted-foreground", "{props.config.name}" }
                }
            }
        },
        RenderOutcome::Error => rsx! {
            div {
                "data-slot": "nyuchi-mini-app-runtime",
                "data-app": "{props.config.id}",
                "data-state": "error",
                role: "alert",
                class: "flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center",
                p { class: "text-lg font-semibold", "Something went wrong" }
                p { class: "text-sm text-muted-foreground", "{props.config.name} encountered an error" }
                {props.fallback.clone().unwrap_or(rsx! {})}
            }
        },
        RenderOutcome::Nothing => rsx! {},
        RenderOutcome::Mounted => rsx! {
            div {
                "data-slot": "nyuchi-mini-app-runtime",
                "data-app": "{props.config.id}",
                "data-state": "{props.state.as_str()}",
                "data-tier": "{props.config.tier}",
                role: "application",
                "aria-label": "{props.config.name}",
                class: "flex min-h-screen flex-col",
                {props.children.clone()}
            }
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn destroyed_renders_nothing_not_mounted() {
        // The .tsx has no branch for "destroyed": it isn't loading, error,
        // or suspended, so it falls into the final `return` and renders
        // full mounted UI (data-state hardcoded to "mounted") with children
        // still attached. Delete this test if that .tsx branch is fixed.
        assert_eq!(
            render_outcome(MiniAppState::Destroyed),
            RenderOutcome::Nothing
        );
        assert_ne!(
            render_outcome(MiniAppState::Destroyed),
            render_outcome(MiniAppState::Mounted)
        );
    }

    #[test]
    fn suspended_and_destroyed_both_render_nothing() {
        assert_eq!(
            render_outcome(MiniAppState::Suspended),
            RenderOutcome::Nothing
        );
        assert_eq!(
            render_outcome(MiniAppState::Destroyed),
            RenderOutcome::Nothing
        );
    }

    #[test]
    fn loading_and_error_and_mounted_are_distinct() {
        assert_eq!(
            render_outcome(MiniAppState::Loading),
            RenderOutcome::Loading
        );
        assert_eq!(render_outcome(MiniAppState::Error), RenderOutcome::Error);
        assert_eq!(
            render_outcome(MiniAppState::Mounted),
            RenderOutcome::Mounted
        );
    }
}
