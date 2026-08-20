//! NYUCHI FOOTER — N7 shell, Dioxus.
//!
//! The Rust sibling of `nyuchi-footer.tsx`: enterprise ecosystem footer, sharing its contract —
//! same `data-slot`, same default link sections.
//!
//! # The year is a prop, not computed in render
//!
//! The `.tsx` calls `new Date().getFullYear()` directly inside a "use client" component's
//! render — a hydration hazard if server and client disagree on the year (a real, if rare,
//! edge case at a year boundary or clock drift), the same class of defect
//! `nyuchi-docs-engine`'s `updated_at` formatting had. Taking `year` as a prop removes it.
//!
//! **The `.tsx` sibling still has this.**

use dioxus::prelude::*;

/// A single footer link.
#[derive(Clone, Debug, PartialEq)]
pub struct FooterLink {
    /// Display label.
    pub label: String,
    /// Link target.
    pub href: String,
    /// Whether this opens in a new tab with `rel="noopener noreferrer"`.
    pub external: bool,
}

/// A titled group of footer links.
#[derive(Clone, Debug, PartialEq)]
pub struct FooterSection {
    /// Section heading.
    pub title: String,
    /// Links under this section.
    pub links: Vec<FooterLink>,
}

fn link(label: &str, href: &str, external: bool) -> FooterLink {
    FooterLink {
        label: label.into(),
        href: href.into(),
        external,
    }
}

/// Default footer sections (Nyuchi ecosystem). Same content as the `.tsx`.
pub fn default_sections() -> Vec<FooterSection> {
    vec![
        FooterSection {
            title: "Platform".into(),
            links: vec![
                link("nhimbe", "/nhimbe", false),
                link("Bush Trade", "/bushtrade", false),
                link("Shamwari", "/shamwari", false),
                link("Campfire", "/campfire", false),
            ],
        },
        FooterSection {
            title: "Developers".into(),
            links: vec![
                link("Components", "/components", false),
                link("API", "/api-docs", false),
                link("Architecture", "/architecture", false),
                link("GitHub", "https://github.com/nyuchi", true),
            ],
        },
        FooterSection {
            title: "Company".into(),
            links: vec![
                link("About Nyuchi", "/about", false),
                link("Brand", "/brand", false),
                link("Ubuntu Philosophy", "/ubuntu", false),
                link("Privacy", "/privacy", false),
            ],
        },
    ]
}

const LINK: &str = "text-sm text-muted-foreground transition-colors \
     hover:text-[var(--brand-accent,var(--color-primary,#00B0FF))] \
     flex min-h-[48px] items-center rounded-[var(--radius-inner,7px)] \
     focus-visible:outline-[length:var(--focusRing-width,2px)] \
     focus-visible:outline-[var(--color-primary)] \
     focus-visible:outline-offset-[var(--focusRing-offset,2px)]";

/// Props for [`NyuchiFooter`].
#[derive(Props, Clone, PartialEq)]
pub struct NyuchiFooterProps {
    /// Link sections; defaults to the ecosystem's own pages.
    #[props(default = default_sections())]
    pub sections: Vec<FooterSection>,
    /// Copyright line company name.
    #[props(default = "Nyuchi Africa".to_string())]
    pub company_name: String,
    /// Tagline shown under the wordmark.
    #[props(default = "I am because we are.".to_string())]
    pub tagline: String,
    /// Whether to show the mineral accent strip along the top edge.
    #[props(default = true)]
    pub show_mineral_strip: bool,
    /// The current year, supplied by the host rather than computed with
    /// `Date.now()` inside render — see the module docs above.
    pub year: i32,
}

/// Enterprise ecosystem footer with link sections and a copyright line.
#[component]
pub fn NyuchiFooter(props: NyuchiFooterProps) -> Element {
    rsx! {
        footer {
            "data-slot": "nyuchi-footer",
            "data-portal": "https://mzizi.dev/components/nyuchi-footer",
            role: "contentinfo",
            class: "border-t border-border bg-card",

            if props.show_mineral_strip {
                div { class: "h-[3px] w-full" }
            }

            div { class: "mx-auto max-w-7xl px-5 py-10",
                div { class: "grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4",
                    div { class: "col-span-2 md:col-span-1",
                        p { class: "mt-3 font-sans text-sm text-muted-foreground italic", "{props.tagline}" }
                    }
                    for section in props.sections.iter() {
                        div {
                            key: "{section.title}",
                            h4 { class: "text-xs font-semibold tracking-wider text-muted-foreground uppercase", "{section.title}" }
                            nav { class: "mt-3 flex flex-col gap-2", "aria-label": "{section.title}",
                                for l in section.links.iter() {
                                    a {
                                        key: "{l.href}",
                                        href: "{l.href}",
                                        class: "{LINK}",
                                        "{l.label}"
                                    }
                                }
                            }
                        }
                    }
                }
                div { class: "mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 md:flex-row",
                    p { class: "text-xs text-muted-foreground", "\u{00A9} {props.year} {props.company_name}. All rights reserved." }
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_sections_match_the_three_ecosystem_groups() {
        let sections = default_sections();
        assert_eq!(sections.len(), 3);
        assert_eq!(sections[0].title, "Platform");
        assert_eq!(sections[1].title, "Developers");
        assert_eq!(sections[2].title, "Company");
    }

    #[test]
    fn github_link_is_external() {
        let sections = default_sections();
        let github = sections[1]
            .links
            .iter()
            .find(|l| l.label == "GitHub")
            .unwrap();
        assert!(github.external);
        assert_eq!(github.href, "https://github.com/nyuchi");
    }

    #[test]
    fn internal_links_are_not_external() {
        let sections = default_sections();
        assert!(!sections[0].links[0].external);
    }
}
