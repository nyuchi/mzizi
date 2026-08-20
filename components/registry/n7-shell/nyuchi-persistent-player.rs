//! NYUCHI PERSISTENT PLAYER — N7 shell, Dioxus.
//!
//! The Rust sibling of `nyuchi-persistent-player.tsx`: a mini-player pinned above the bottom
//! nav, sharing its contract — same `data-slot`, same play/pause/close controls.
//!
//! # Progress is clamped, unlike the `.tsx`
//!
//! The `.tsx` interpolates `${progress}%` into the bar's CSS width with no bound check, so an
//! out-of-range value (e.g. a stale duration calculation putting `progress` above 100 or below
//! 0) renders verbatim and overflows or underflows the track. Clamped here to `[0, 100]`.
//!
//! **The `.tsx` sibling still has this.**

use dioxus::prelude::*;

/// The kind of media a track represents.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum MediaKind {
    /// Audio-only playback.
    Audio,
    /// Audio + video playback.
    Video,
    /// A live stream.
    Live,
}

/// The track currently loaded in the player.
#[derive(Clone, Debug, PartialEq)]
pub struct MediaTrack {
    /// Unique identifier.
    pub id: String,
    /// Track title.
    pub title: String,
    /// Optional artist/creator name.
    pub artist: Option<String>,
    /// Optional thumbnail image URL.
    pub thumbnail: Option<String>,
    /// The kind of media this track is.
    pub kind: MediaKind,
}

/// Clamps a progress percentage to `[0, 100]` — see the module docs for why.
pub fn clamp_progress(progress: f64) -> f64 {
    progress.clamp(0.0, 100.0)
}

/// Props for [`NyuchiPersistentPlayer`].
#[derive(Props, Clone, PartialEq)]
pub struct NyuchiPersistentPlayerProps {
    /// The currently loaded track, or `None` to render nothing.
    pub track: Option<MediaTrack>,
    /// Whether playback is active.
    #[props(default = false)]
    pub is_playing: bool,
    /// Playback progress as a percentage.
    #[props(default = 0.0)]
    pub progress: f64,
    /// Fired when play is requested.
    #[props(default)]
    pub on_play: EventHandler<()>,
    /// Fired when pause is requested.
    #[props(default)]
    pub on_pause: EventHandler<()>,
    /// Fired when the player should expand to full view.
    #[props(default)]
    pub on_expand: EventHandler<()>,
    /// Fired when the player is closed.
    #[props(default)]
    pub on_close: EventHandler<()>,
}

/// Mini-player pinned above the bottom nav, with play/pause and progress.
#[component]
pub fn NyuchiPersistentPlayer(props: NyuchiPersistentPlayerProps) -> Element {
    let Some(track) = props.track.clone() else {
        return rsx! {};
    };
    let progress = clamp_progress(props.progress);

    rsx! {
        div {
            "data-slot": "nyuchi-persistent-player",
            "data-portal": "https://mzizi.dev/components/nyuchi-persistent-player",
            role: "region",
            "aria-label": "Now playing: {track.title}",
            class: "safe-area-bottom fixed right-0 bottom-16 left-0 z-30 border-t border-border bg-card/95 backdrop-blur-sm",

            div { class: "h-0.5 bg-muted",
                div { class: "h-full bg-primary transition-all", style: "width: {progress}%" }
            }

            div { class: "flex items-center gap-3 px-4 py-2",
                button {
                    class: "min-w-0 flex-1 text-left",
                    onclick: move |_| props.on_expand.call(()),
                    p { class: "truncate text-sm font-medium", "{track.title}" }
                    if let Some(artist) = &track.artist {
                        p { class: "truncate text-xs text-muted-foreground", "{artist}" }
                    }
                }
                div { class: "flex shrink-0 items-center gap-1",
                    button {
                        "aria-label": if props.is_playing { "Pause" } else { "Play" },
                        class: "flex size-10 min-h-[48px] min-w-[48px] items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        onclick: move |_| if props.is_playing { props.on_pause.call(()) } else { props.on_play.call(()) },
                        if props.is_playing { "\u{23F8}" } else { "\u{25B6}" }
                    }
                    button {
                        "aria-label": "Close player",
                        class: "flex size-10 min-h-[48px] min-w-[48px] items-center justify-center rounded-full transition-colors hover:bg-muted",
                        onclick: move |_| props.on_close.call(()),
                        "\u{2715}"
                    }
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn progress_within_range_is_unchanged() {
        assert_eq!(clamp_progress(42.0), 42.0);
    }

    #[test]
    fn progress_above_100_is_clamped() {
        // The .tsx has no such guard: `style={{ width: `${progress}%` }}`
        // would render `width: 137%` verbatim, overflowing the track.
        assert_eq!(clamp_progress(137.0), 100.0);
    }

    #[test]
    fn negative_progress_is_clamped_to_zero() {
        assert_eq!(clamp_progress(-5.0), 0.0);
    }
}
