//! NYUCHI THEME PROVIDER — N7 shell, Dioxus.
//!
//! The Rust sibling of `nyuchi-theme-provider.tsx`'s decision logic: which theme wins at
//! startup, and how system preferences resolve to a mode.
//!
//! System-preference detection (`matchMedia`), persistence (`localStorage`), and
//! `document.documentElement` class/attribute wiring are all real-DOM glue with no portable
//! pure logic behind them — the host owns that part and passes in the already-resolved values,
//! the same way this node's other components take a host-controlled `visible` /
//! `prefers_reduced_motion` prop instead of re-implementing browser-only mechanisms in Rust.
//! [`NyuchiThemeProvider`] is accordingly a thin wrapper: it injects the host-generated CSS
//! variables and renders children; [`resolve_initial_theme`] and [`system_preference`] are the
//! parts worth testing.

use dioxus::prelude::*;

/// The resolved theme mode.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ThemeMode {
    /// Light mode.
    Light,
    /// Dark mode.
    Dark,
    /// High-contrast mode, overriding light/dark.
    HighContrast,
}

/// System-preference resolution. Contrast wins over dark, matching the
/// `.tsx`: `contrastMq.matches ? "high-contrast" : darkMq.matches ? "dark" : "light"`.
pub fn system_preference(prefers_high_contrast: bool, prefers_dark: bool) -> ThemeMode {
    if prefers_high_contrast {
        ThemeMode::HighContrast
    } else if prefers_dark {
        ThemeMode::Dark
    } else {
        ThemeMode::Light
    }
}

/// Initial theme priority: a stored (persisted) choice wins outright;
/// otherwise the system preference is used only if the host opted in;
/// otherwise the configured default. Mirrors the `.tsx`'s
/// `useState(() => stored ?? (useSystemPreference ? systemPreference : defaultTheme))`.
pub fn resolve_initial_theme(
    stored: Option<ThemeMode>,
    use_system_preference: bool,
    system_preference: ThemeMode,
    default_theme: ThemeMode,
) -> ThemeMode {
    if let Some(theme) = stored {
        return theme;
    }
    if use_system_preference {
        system_preference
    } else {
        default_theme
    }
}

/// Props for [`NyuchiThemeProvider`].
#[derive(Props, Clone, PartialEq)]
pub struct NyuchiThemeProviderProps {
    /// The resolved theme mode, already decided by the host.
    pub theme: ThemeMode,
    /// The active brand identity.
    pub brand: String,
    /// Host-generated CSS custom properties, injected verbatim as a `<style>` tag.
    pub css_vars: String,
    /// The subtree this provider wraps.
    pub children: Element,
}

/// Injects the host-resolved theme's CSS variables and renders children.
#[component]
pub fn NyuchiThemeProvider(props: NyuchiThemeProviderProps) -> Element {
    rsx! {
        style { dangerous_inner_html: "{props.css_vars}" }
        {props.children.clone()}
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn high_contrast_wins_over_dark() {
        assert_eq!(system_preference(true, true), ThemeMode::HighContrast);
    }

    #[test]
    fn dark_wins_over_light_when_no_contrast() {
        assert_eq!(system_preference(false, true), ThemeMode::Dark);
    }

    #[test]
    fn light_is_the_fallback() {
        assert_eq!(system_preference(false, false), ThemeMode::Light);
    }

    #[test]
    fn stored_choice_wins_over_everything() {
        let resolved = resolve_initial_theme(
            Some(ThemeMode::Light),
            true,
            ThemeMode::Dark,
            ThemeMode::Dark,
        );
        assert_eq!(resolved, ThemeMode::Light);
    }

    #[test]
    fn system_preference_used_when_opted_in_and_nothing_stored() {
        let resolved = resolve_initial_theme(None, true, ThemeMode::HighContrast, ThemeMode::Dark);
        assert_eq!(resolved, ThemeMode::HighContrast);
    }

    #[test]
    fn default_theme_used_when_not_using_system_preference() {
        let resolved = resolve_initial_theme(None, false, ThemeMode::HighContrast, ThemeMode::Dark);
        assert_eq!(resolved, ThemeMode::Dark);
    }
}
