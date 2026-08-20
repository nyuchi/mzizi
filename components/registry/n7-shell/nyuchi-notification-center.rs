//! NYUCHI NOTIFICATION CENTER — N7 shell, Dioxus.
//!
//! The Rust sibling of `nyuchi-notification-center.tsx`: a slide-over notification list, sharing
//! its contract — same `data-slot`, same unread-count badge.
//!
//! # The touch floor is raised above the `.tsx`
//!
//! The `.tsx` ships `min-h-[44px]` on the close/dismiss controls. Raised to `min-h-[48px]`
//! here, matching this build-out's other touch-floor fixes; nothing else changes.
//!
//! **The `.tsx` sibling still has this.**

use dioxus::prelude::*;

/// The kind of event a notification represents.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum NotificationKind {
    /// A social interaction (follow, mention, reply).
    Social,
    /// A financial/transactional event.
    Fintech,
    /// A system-generated notice.
    System,
    /// A time-sensitive alert.
    Alert,
}

/// An inline call-to-action shown on a notification.
#[derive(Clone, Debug, PartialEq)]
pub struct NotificationAction {
    /// Button label.
    pub label: String,
}

/// A single notification entry.
#[derive(Clone, Debug, PartialEq)]
pub struct Notification {
    /// Unique identifier.
    pub id: String,
    /// The kind of event this represents.
    pub kind: NotificationKind,
    /// Headline text.
    pub title: String,
    /// Optional body text.
    pub message: Option<String>,
    /// Optional avatar image URL.
    pub avatar: Option<String>,
    /// Pre-formatted display timestamp.
    pub timestamp: String,
    /// Whether the user has seen this notification.
    pub read: bool,
    /// Optional inline action.
    pub action: Option<NotificationAction>,
}

/// Counts unread notifications.
pub fn unread_count(notifications: &[Notification]) -> usize {
    notifications.iter().filter(|n| !n.read).count()
}

/// Props for [`NyuchiNotificationCenter`].
#[derive(Props, Clone, PartialEq)]
pub struct NyuchiNotificationCenterProps {
    /// Whether the panel is currently shown.
    pub open: bool,
    /// Notifications to display, most recent first.
    pub notifications: Vec<Notification>,
    /// Shown when `notifications` is empty.
    #[props(default = "You are all caught up".to_string())]
    pub empty_message: String,
    /// Replaces `useNyuchiHarness(...).motion.prefersReduced`.
    #[props(default)]
    pub prefers_reduced_motion: bool,
    /// Fired to open or close the panel.
    #[props(default)]
    pub on_open_change: EventHandler<bool>,
    /// Fired when "Mark all read" is pressed.
    #[props(default)]
    pub on_mark_all_read: EventHandler<()>,
    /// Fired with a notification's `id` when it is dismissed.
    #[props(default)]
    pub on_dismiss: EventHandler<String>,
}

/// Slide-over panel listing notifications with an unread-count badge.
#[component]
pub fn NyuchiNotificationCenter(props: NyuchiNotificationCenterProps) -> Element {
    if !props.open {
        return rsx! {};
    }
    let unread = unread_count(&props.notifications);

    rsx! {
        div { class: "fixed inset-0 z-40", "aria-hidden": "true", onclick: move |_| props.on_open_change.call(false) }
        div {
            "data-slot": "nyuchi-notification-center",
            "data-portal": "https://mzizi.dev/components/nyuchi-notification-center",
            role: "dialog",
            "aria-label": "Notifications",
            "aria-modal": "true",
            class: "fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-border bg-card shadow-2xl sm:top-16 sm:right-4 sm:h-auto sm:max-h-[80vh] sm:rounded-[var(--radius-xl,17px)] sm:border",

            header { class: "flex items-center justify-between border-b border-border px-4 py-3",
                div { class: "flex items-center gap-2",
                    h2 { class: "text-sm font-semibold", "Notifications" }
                    if unread > 0 {
                        span { class: "rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground", "{unread}" }
                    }
                }
                div { class: "flex items-center gap-2",
                    if unread > 0 {
                        button {
                            class: "min-h-[48px] px-2 text-xs text-muted-foreground transition-colors hover:text-foreground",
                            onclick: move |_| props.on_mark_all_read.call(()),
                            "Mark all read"
                        }
                    }
                    button {
                        "aria-label": "Close",
                        class: "flex size-8 min-h-[48px] min-w-[48px] items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        onclick: move |_| props.on_open_change.call(false),
                        "\u{2715}"
                    }
                }
            }

            div { class: "flex-1 overflow-y-auto",
                if props.notifications.is_empty() {
                    div { class: "flex flex-col items-center justify-center py-16 text-sm text-muted-foreground", "{props.empty_message}" }
                } else {
                    for n in props.notifications.iter() {
                        div {
                            key: "{n.id}",
                            class: "flex gap-3 border-b border-border px-4 py-3 transition-colors",
                            div { class: "min-w-0 flex-1",
                                p { class: "text-sm", "{n.title}" }
                                if let Some(msg) = &n.message {
                                    p { class: "mt-0.5 line-clamp-2 text-xs text-muted-foreground", "{msg}" }
                                }
                                div { class: "mt-1 flex items-center gap-2",
                                    time { class: "text-[10px] text-muted-foreground/60", "{n.timestamp}" }
                                }
                            }
                            button {
                                "aria-label": "Dismiss",
                                class: "flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center self-start text-muted-foreground/40 hover:text-muted-foreground",
                                onclick: {
                                    let id = n.id.clone();
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

    fn notif(id: &str, read: bool) -> Notification {
        Notification {
            id: id.into(),
            kind: NotificationKind::System,
            title: id.into(),
            message: None,
            avatar: None,
            timestamp: "now".into(),
            read,
            action: None,
        }
    }

    #[test]
    fn unread_count_counts_only_unread() {
        let notifications = vec![notif("a", false), notif("b", true), notif("c", false)];
        assert_eq!(unread_count(&notifications), 2);
    }

    #[test]
    fn unread_count_is_zero_when_all_read() {
        let notifications = vec![notif("a", true)];
        assert_eq!(unread_count(&notifications), 0);
    }

    #[test]
    fn unread_count_is_zero_for_empty_list() {
        assert_eq!(unread_count(&[]), 0);
    }
}
