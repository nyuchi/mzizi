//! NYUCHI TOAST PROVIDER — N7 shell, Dioxus.
//!
//! The Rust sibling of `nyuchi-toast-provider.tsx`: a toast queue with position and cap,
//! sharing its contract — same `data-slot`, same position/type class maps.
//!
//! # `max_visible == 0` is a `.tsx` edge case
//!
//! The `.tsx` caps the queue with `[...prev.slice(-(maxVisible - 1)), item]`. At
//! `maxVisible === 0` that becomes `prev.slice(-(-1))`, i.e. `prev.slice(1)` — which drops only
//! the oldest existing toast and still appends the new one, so a "cap of zero" would still show
//! one toast. [`push_toast`] treats `max_visible == 0` as "show none" instead.
//!
//! **The `.tsx` sibling still has this.**
//!
//! Toast IDs are the caller's responsibility here rather than generated internally
//! (`Date.now().toString(36) + Math.random()...` in the `.tsx`) — pushing ID generation to the
//! host keeps the queue logic pure and deterministic to test.

use dioxus::prelude::*;

/// Visual/semantic category of a toast.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ToastKind {
    /// No particular semantic category.
    Default,
    /// A positive/confirming outcome.
    Success,
    /// A failure.
    Error,
    /// A caution.
    Warning,
    /// A neutral notice.
    Info,
}

/// Where the toast stack is anchored on screen.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ToastPosition {
    /// Anchored to the top-right corner.
    TopRight,
    /// Anchored to top-center.
    TopCenter,
    /// Anchored to the bottom-right corner, above the bottom nav.
    BottomRight,
    /// Anchored to bottom-center, above the bottom nav.
    BottomCenter,
}

/// Tailwind position classes for a [`ToastPosition`].
pub fn position_class(position: ToastPosition) -> &'static str {
    match position {
        ToastPosition::TopRight => "top-4 right-4",
        ToastPosition::TopCenter => "top-4 left-1/2 -translate-x-1/2",
        ToastPosition::BottomRight => "bottom-20 right-4",
        ToastPosition::BottomCenter => "bottom-20 left-1/2 -translate-x-1/2",
    }
}

/// Tailwind accent classes for a [`ToastKind`].
pub fn type_style_class(kind: ToastKind) -> &'static str {
    match kind {
        ToastKind::Default => "border-border",
        ToastKind::Success => "border-l-4 border-l-[var(--status-success,#64FFDA)]",
        ToastKind::Error => "border-l-4 border-l-[var(--status-error,#FF5252)]",
        ToastKind::Warning => "border-l-4 border-l-[var(--status-warning,#FFD740)]",
        ToastKind::Info => "border-l-4 border-l-[var(--status-info,#00B0FF)]",
    }
}

/// A single toast in the queue.
#[derive(Clone, Debug, PartialEq)]
pub struct ToastItem {
    /// Unique identifier, supplied by the caller.
    pub id: String,
    /// Visual/semantic category.
    pub kind: ToastKind,
    /// Headline text.
    pub title: String,
    /// Optional body text.
    pub message: Option<String>,
    /// Whether the user can dismiss this toast manually.
    pub dismissible: bool,
}

/// Appends a new toast, keeping the queue capped at `max_visible` — see the module docs for how
/// this differs from the `.tsx` at `max_visible == 0`.
pub fn push_toast(existing: &[ToastItem], item: ToastItem, max_visible: usize) -> Vec<ToastItem> {
    if max_visible == 0 {
        return Vec::new();
    }
    let keep = max_visible.saturating_sub(1);
    let start = existing.len().saturating_sub(keep);
    let mut next: Vec<ToastItem> = existing[start..].to_vec();
    next.push(item);
    next
}

/// Removes a toast by id.
pub fn dismiss(existing: &[ToastItem], id: &str) -> Vec<ToastItem> {
    existing.iter().filter(|t| t.id != id).cloned().collect()
}

/// Props for [`NyuchiToastProvider`].
#[derive(Props, Clone, PartialEq)]
pub struct NyuchiToastProviderProps {
    /// Where the toast stack is anchored.
    #[props(default = ToastPosition::BottomRight)]
    pub position: ToastPosition,
    /// The current toast queue, controlled by the host.
    pub toasts: Vec<ToastItem>,
    /// Fired with a toast's `id` when it is dismissed.
    #[props(default)]
    pub on_dismiss: EventHandler<String>,
    /// The subtree this provider wraps.
    pub children: Element,
}

/// Renders children plus a positioned toast stack.
#[component]
pub fn NyuchiToastProvider(props: NyuchiToastProviderProps) -> Element {
    rsx! {
        {props.children.clone()}
        div {
            "data-slot": "nyuchi-toast-provider",
            "data-portal": "https://mzizi.dev/components/nyuchi-toast-provider",
            "aria-live": "polite",
            "aria-atomic": "false",
            class: "pointer-events-none fixed z-50 flex w-full max-w-sm flex-col gap-2 {position_class(props.position)}",
            for toast in props.toasts.iter() {
                div {
                    key: "{toast.id}",
                    role: "alert",
                    class: "pointer-events-auto rounded-[var(--radius-lg,14px)] border bg-card p-4 shadow-lg {type_style_class(toast.kind)}",
                    div { class: "flex items-start justify-between gap-2",
                        div { class: "min-w-0",
                            p { class: "text-sm font-medium", "{toast.title}" }
                            if let Some(message) = &toast.message {
                                p { class: "mt-0.5 text-xs text-muted-foreground", "{message}" }
                            }
                        }
                        if toast.dismissible {
                            button {
                                "aria-label": "Dismiss",
                                class: "flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                                onclick: {
                                    let id = toast.id.clone();
                                    move |_| props.on_dismiss.call(id.clone())
                                },
                                "\u{2715}"
                            }
                        }
                    }
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn toast(id: &str) -> ToastItem {
        ToastItem {
            id: id.into(),
            kind: ToastKind::Default,
            title: id.into(),
            message: None,
            dismissible: true,
        }
    }

    #[test]
    fn queue_is_capped_at_max_visible() {
        let existing = vec![toast("a"), toast("b"), toast("c")];
        let next = push_toast(&existing, toast("d"), 3);
        assert_eq!(next.len(), 3);
        assert_eq!(
            next.iter().map(|t| t.id.as_str()).collect::<Vec<_>>(),
            vec!["b", "c", "d"]
        );
    }

    #[test]
    fn queue_grows_until_the_cap_is_reached() {
        let existing = vec![toast("a")];
        let next = push_toast(&existing, toast("b"), 3);
        assert_eq!(
            next.iter().map(|t| t.id.as_str()).collect::<Vec<_>>(),
            vec!["a", "b"]
        );
    }

    #[test]
    fn max_visible_zero_shows_nothing() {
        // The .tsx's `prev.slice(-(maxVisible - 1))` degrades to
        // `slice(1)` when maxVisible is 0 — it drops the oldest toast and
        // still appends the new one, so "cap of zero" would still show
        // one toast. Fixed here to show none.
        let existing = vec![toast("a")];
        let next = push_toast(&existing, toast("b"), 0);
        assert!(next.is_empty());
    }

    #[test]
    fn dismiss_removes_only_the_matching_id() {
        let existing = vec![toast("a"), toast("b")];
        let next = dismiss(&existing, "a");
        assert_eq!(
            next.iter().map(|t| t.id.as_str()).collect::<Vec<_>>(),
            vec!["b"]
        );
    }
}
