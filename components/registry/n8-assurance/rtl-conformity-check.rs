//! Mzizi N8 assurance — is this layout actually right-to-left correct?
//!
//! The Rust implementation of `rtl-conformity-check`. Five rules over what the
//! host observed; the host walks the DOM and reads the computed styles, because
//! that is the only part that needs a browser.
//!
//! # Six defects in the TypeScript, fixed here
//!
//! **1. The most serious rule did not affect the score.** `direction-attribute` —
//! "`<html>` has no `dir`, so RTL locales fall back to LTR", the one finding that
//! is about the whole page rather than one element — is pushed AFTER the element
//! loop, and `passes` is only ever incremented inside it. So a page whose sole
//! defect is that RTL does not work at all scores 100. [`audit`] counts it.
//!
//! **2. The icon rule only ran when the page was already RTL.** `docDir === "rtl"`
//! gates it, so the check that finds icons needing mirroring never fires on the
//! LTR build — which is the build almost everyone audits. And the finding is a
//! property of the icon, not of the current render: a chevron with no mirroring
//! hint will be wrong in RTL whether or not you are looking at RTL right now. The
//! direction is still reported; it no longer decides whether to look.
//!
//! **3. Name matching was substring matching, in both directions.**
//! `"research-icon".includes("search-icon")` is true, so `research-icon` inherited
//! the non-mirroring exemption meant for the magnifying glass. And
//! `isDirectionalIcon` matches `"back"`, so `background-icon` is reported as a
//! directional icon needing mirroring. Both are matched on hyphen-separated
//! segments here.
//!
//! **4. The bidi detector missed most real Arabic and Hebrew.** The range list
//! covers the base blocks and stops, so Arabic Supplement (U+0750-U+077F), Arabic
//! Extended-A (U+08A0-U+08FF) and — the big one — the Presentation Forms
//! (U+FB1D-U+FDFF, U+FE70-U+FEFF) all read as non-bidi. Presentation forms are
//! where a great deal of real-world Arabic arrives, particularly out of PDFs and
//! older systems, so the rule passed exactly the content most likely to need it.
//!
//! **5. The selector broke on an id that is not an identifier.** `#${el.id}` raw,
//! same as `mzizi-a11y-audit`, and the selector's only job is to find the element
//! again.
//!
//! **6. The node guess can only answer 2, 3 or 6.** Same heuristic as
//! `mzizi-a11y-audit`, same consequence: an N7 shell component is labelled N6 and
//! routed to the wrong owner. The registry wins; the heuristic is the fallback.

use std::collections::{BTreeMap, BTreeSet};

/// The direction a document declares.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum Direction {
    /// Left to right.
    #[default]
    Ltr,
    /// Right to left.
    Rtl,
    /// Per-element, decided by the browser.
    Auto,
}

impl Direction {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Ltr => "ltr",
            Self::Rtl => "rtl",
            Self::Auto => "auto",
        }
    }

    /// Parse a `dir` attribute value.
    ///
    /// [`None`] means the attribute was absent, which is what
    /// [`RtlRule::DirectionAttribute`] is about — distinct from a `dir` that says
    /// `ltr`, which is a deliberate answer.
    #[must_use]
    pub fn parse(value: &str) -> Option<Self> {
        match value.trim().to_ascii_lowercase().as_str() {
            "ltr" => Some(Self::Ltr),
            "rtl" => Some(Self::Rtl),
            "auto" => Some(Self::Auto),
            _ => None,
        }
    }
}

/// How much an RTL violation matters.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum RtlLevel {
    /// Advisory.
    Minor,
    /// Wrong for some content.
    Moderate,
    /// Wrong for a whole locale.
    Serious,
    /// Unusable.
    Critical,
}

impl RtlLevel {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Critical => "critical",
            Self::Serious => "serious",
            Self::Moderate => "moderate",
            Self::Minor => "minor",
        }
    }
}

/// Which rule produced a finding.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum RtlRule {
    /// A physical CSS property where a logical one belongs.
    LogicalProperties,
    /// Bidi text with no `lang` or `dir`.
    BidiText,
    /// A directional icon with no mirroring hint.
    IconMirroring,
    /// `text-align: left` or `right`.
    TextAlignment,
    /// `<html>` carries no `dir`.
    DirectionAttribute,
}

impl RtlRule {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::LogicalProperties => "logical-properties",
            Self::BidiText => "bidi-text",
            Self::IconMirroring => "icon-mirroring",
            Self::TextAlignment => "text-alignment",
            Self::DirectionAttribute => "direction-attribute",
        }
    }

    /// Every rule.
    ///
    /// One list. The `.ts` writes the rule names twice — once in the type union
    /// and once in the runtime default array — so adding a rule to one and not
    /// the other is a silently disabled rule.
    #[must_use]
    pub fn all() -> BTreeSet<Self> {
        [
            Self::LogicalProperties,
            Self::BidiText,
            Self::IconMirroring,
            Self::TextAlignment,
            Self::DirectionAttribute,
        ]
        .into_iter()
        .collect()
    }
}

/// The physical CSS properties that have logical counterparts.
pub const PHYSICAL_PROPERTIES: [&str; 12] = [
    "margin-left",
    "margin-right",
    "padding-left",
    "padding-right",
    "left",
    "right",
    "border-left",
    "border-right",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-left-radius",
    "border-bottom-right-radius",
];

/// Icon names that must NOT mirror in RTL.
pub const NON_MIRRORING_ICONS: [&str; 15] = [
    "search-icon",
    "play-icon",
    "pause-icon",
    "volume-icon",
    "mute-icon",
    "clock-icon",
    "calendar-icon",
    "check-icon",
    "x-icon",
    "heart-icon",
    "star-icon",
    "info-icon",
    "warning-icon",
    "error-icon",
    "success-icon",
];

/// Name fragments that mark an icon as directional.
pub const DIRECTIONAL_FRAGMENTS: [&str; 11] = [
    "arrow", "chevron", "caret", "back", "forward", "next", "prev", "undo", "redo", "reply", "send",
];

/// Split a name into hyphen- and underscore-separated segments, lowercased.
///
/// Segment matching, not substring matching. `"research-icon".includes("search")`
/// is true and `"background-icon".includes("back")` is true, which is how the
/// `.ts` exempts a research icon from mirroring and demands that a background
/// image be mirrored.
#[must_use]
pub fn segments(name: &str) -> Vec<String> {
    name.split(['-', '_', ' ', '.', '/'])
        .filter(|s| !s.is_empty())
        .map(str::to_ascii_lowercase)
        .collect()
}

/// Whether this icon is on the never-mirror list.
///
/// Compared segment-wise: `search-icon` exempts `search-icon` and `icon-search`,
/// and does not exempt `research-icon`.
#[must_use]
pub fn is_non_mirroring(name: &str, non_mirroring: &BTreeSet<String>) -> bool {
    let parts: BTreeSet<String> = segments(name).into_iter().collect();
    non_mirroring
        .iter()
        .any(|entry| segments(entry).iter().all(|seg| parts.contains(seg)))
}

/// Whether this icon points somewhere, and so may need mirroring.
#[must_use]
pub fn is_directional(name: &str) -> bool {
    let parts = segments(name);
    DIRECTIONAL_FRAGMENTS
        .iter()
        .any(|fragment| parts.iter().any(|seg| seg == fragment))
}

/// Whether a string contains characters from a right-to-left script.
///
/// Covers what the `.ts` covers PLUS Arabic Supplement, Arabic Extended-A and the
/// Presentation Forms — the blocks a great deal of real-world Arabic and Hebrew
/// actually arrives in, and which the `.ts` reads as non-bidi.
#[must_use]
pub fn has_bidi_chars(text: &str) -> bool {
    text.chars().any(|c| {
        matches!(c as u32,
            0x0590..=0x05FF   // Hebrew
            | 0x0600..=0x06FF // Arabic
            | 0x0700..=0x074F // Syriac
            | 0x0750..=0x077F // Arabic Supplement — missing from the .ts
            | 0x0780..=0x07BF // Thaana
            | 0x07C0..=0x07FF // NKo
            | 0x0800..=0x083F // Samaritan
            | 0x0840..=0x085F // Mandaic
            | 0x08A0..=0x08FF // Arabic Extended-A — missing from the .ts
            | 0xFB1D..=0xFB4F // Hebrew Presentation Forms — missing
            | 0xFB50..=0xFDFF // Arabic Presentation Forms-A — missing
            | 0xFE70..=0xFEFF // Arabic Presentation Forms-B — missing
        )
    })
}

/// One element as the host observed it.
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct ObservedNode {
    /// Uppercase tag name.
    pub tag_name: String,
    /// The `id`.
    pub id: Option<String>,
    /// The first class.
    pub first_class: Option<String>,
    /// The `data-slot` value.
    pub data_slot: Option<String>,
    /// The `data-portal` backlink.
    pub data_portal: Option<String>,
    /// The `aria-label`.
    pub aria_label: Option<String>,
    /// The `lang` attribute.
    pub lang: Option<String>,
    /// The `dir` attribute.
    pub dir: Option<String>,
    /// Rendered text.
    pub text: Option<String>,
    /// Inline style declarations the host read, property to value.
    pub inline_styles: BTreeMap<String, String>,
    /// The `data-rtl-mirror` marker.
    pub rtl_mirror_hint: Option<String>,
}

impl ObservedNode {
    /// The name this element's icon goes by.
    #[must_use]
    pub fn icon_name(&self) -> String {
        self.data_slot
            .clone()
            .or_else(|| self.aria_label.clone())
            .unwrap_or_default()
    }

    /// Whether this element is an icon.
    #[must_use]
    pub fn is_icon(&self) -> bool {
        self.data_slot.as_deref() == Some("icon") || self.tag_name.eq_ignore_ascii_case("svg")
    }

    /// Whether bidi text here would need a `lang` or `dir`.
    #[must_use]
    pub fn carries_prose(&self) -> bool {
        ["P", "SPAN", "DIV"]
            .iter()
            .any(|tag| self.tag_name.eq_ignore_ascii_case(tag))
    }
}

/// One finding.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RtlViolation {
    /// Which rule.
    pub rule: RtlRule,
    /// How much it matters.
    pub level: RtlLevel,
    /// What is wrong.
    pub message: String,
    /// The element's tag.
    pub element: String,
    /// A selector that finds it again.
    pub selector: String,
    /// Which helix node, when known.
    pub node: Option<u32>,
    /// The `data-slot` value.
    pub component_name: Option<String>,
    /// Where the documentation is.
    pub portal_url: Option<String>,
    /// How to fix it.
    pub fix: String,
}

/// What a page scored.
#[derive(Debug, Clone, PartialEq)]
pub struct RtlAuditResult {
    /// The URL audited.
    pub url: String,
    /// What `<html dir>` said, when it said anything.
    pub direction: Option<Direction>,
    /// How many elements were observed.
    pub total_elements: usize,
    /// Every finding.
    pub violations: Vec<RtlViolation>,
    /// How many checks passed.
    pub passes: usize,
    /// Percentage passing, 0-100.
    pub score: u32,
}

/// What to check.
#[derive(Debug, Clone, PartialEq)]
pub struct RtlConfig {
    /// Which rules to run. [`None`] means all; an empty set means none.
    pub rules: Option<BTreeSet<RtlRule>>,
    /// Icons that must never mirror.
    pub non_mirroring_icons: BTreeSet<String>,
}

impl Default for RtlConfig {
    fn default() -> Self {
        Self {
            rules: None,
            non_mirroring_icons: NON_MIRRORING_ICONS
                .iter()
                .map(|s| (*s).to_owned())
                .collect(),
        }
    }
}

impl RtlConfig {
    /// Whether a rule is enabled.
    #[must_use]
    pub fn runs(&self, rule: RtlRule) -> bool {
        self.rules.as_ref().is_none_or(|set| set.contains(&rule))
    }
}

/// Whether a string is usable bare after `#` in a selector.
fn is_plain_ident(value: &str) -> bool {
    let mut chars = value.chars();
    match chars.next() {
        Some(first) if first.is_ascii_alphabetic() || first == '_' => {}
        _ => return false,
    }
    chars.all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
}

fn escape_attr(value: &str) -> String {
    value.replace('\\', "\\\\").replace('"', "\\\"")
}

/// A selector that finds this element again.
#[must_use]
pub fn css_selector(node: &ObservedNode) -> String {
    if let Some(id) = node.id.as_deref().filter(|s| !s.is_empty()) {
        return if is_plain_ident(id) {
            format!("#{id}")
        } else {
            format!("[id=\"{}\"]", escape_attr(id))
        };
    }
    if let Some(slot) = node.data_slot.as_deref().filter(|s| !s.is_empty()) {
        return format!("[data-slot=\"{}\"]", escape_attr(slot));
    }
    let tag = node.tag_name.to_ascii_lowercase();
    match node.first_class.as_deref().filter(|s| !s.is_empty()) {
        Some(class) if is_plain_ident(class) => format!("{tag}.{class}"),
        Some(class) => format!("{tag}[class~=\"{}\"]", escape_attr(class)),
        None => tag,
    }
}

/// The `.ts`'s slot heuristic. Can only answer 2, 3 or 6 — prefer [`resolve_node`].
#[must_use]
pub fn guess_node_from_slot(slot: &str) -> Option<u32> {
    if slot.is_empty() {
        return None;
    }
    if slot.starts_with("nyuchi-") && !slot.contains("page") {
        return Some(3);
    }
    if slot.contains("page") || slot.contains("layout") {
        return Some(6);
    }
    Some(2)
}

/// Which node owns the component in this slot. The registry wins.
#[must_use]
pub fn resolve_node(slot: Option<&str>, registry: &BTreeMap<String, u32>) -> Option<u32> {
    let slot = slot?;
    registry
        .get(slot)
        .copied()
        .or_else(|| guess_node_from_slot(slot))
}

fn violation(
    node: &ObservedNode,
    helix_node: Option<u32>,
    rule: RtlRule,
    level: RtlLevel,
    message: String,
    fix: String,
) -> RtlViolation {
    RtlViolation {
        rule,
        level,
        message,
        element: node.tag_name.clone(),
        selector: css_selector(node),
        node: helix_node,
        component_name: node.data_slot.clone().filter(|s| !s.is_empty()),
        portal_url: node.data_portal.clone().filter(|s| !s.is_empty()),
        fix,
    }
}

/// Check one element against every enabled rule.
///
/// Returns every physical property found, not the first — matching the `.ts`,
/// which is right: twelve wrong properties on one element are twelve edits.
#[must_use]
pub fn check_node(
    node: &ObservedNode,
    config: &RtlConfig,
    registry: &BTreeMap<String, u32>,
) -> Vec<RtlViolation> {
    let mut found = Vec::new();
    let helix_node = resolve_node(node.data_slot.as_deref(), registry);

    if config.runs(RtlRule::LogicalProperties) {
        for property in PHYSICAL_PROPERTIES {
            if node
                .inline_styles
                .get(property)
                .is_some_and(|v| !v.trim().is_empty())
            {
                found.push(violation(
                    node,
                    helix_node,
                    RtlRule::LogicalProperties,
                    RtlLevel::Serious,
                    format!(
                        "Inline style uses physical \"{property}\" — use logical equivalent \
                         (margin-inline-start, padding-inline-end, inset-inline-start, etc.)"
                    ),
                    format!("Replace {property} with its inline-/block- logical counterpart"),
                ));
            }
        }
    }

    if config.runs(RtlRule::BidiText)
        && node.carries_prose()
        && node.lang.is_none()
        && node.dir.is_none()
        && node.text.as_deref().is_some_and(has_bidi_chars)
    {
        found.push(violation(
            node,
            helix_node,
            RtlRule::BidiText,
            RtlLevel::Moderate,
            "Element contains bidi text but is missing lang or dir attribute".to_owned(),
            "Add lang=\"ar\" (or appropriate) or dir=\"auto\" so the browser can render bidi \
             correctly"
                .to_owned(),
        ));
    }

    // Evaluated whatever the document direction is. The .ts gates this on
    // `docDir === "rtl"`, so it never fires on the LTR build almost everyone
    // audits — and whether a chevron has a mirroring hint is a property of the
    // icon, not of the render you happen to be looking at.
    if config.runs(RtlRule::IconMirroring) && node.is_icon() {
        let name = node.icon_name();
        let has_hint = node.rtl_mirror_hint.is_some()
            || node
                .inline_styles
                .get("transform")
                .is_some_and(|v| !v.trim().is_empty());
        if !has_hint
            && is_directional(&name)
            && !is_non_mirroring(&name, &config.non_mirroring_icons)
        {
            found.push(violation(
                node,
                helix_node,
                RtlRule::IconMirroring,
                RtlLevel::Minor,
                format!("Directional icon \"{name}\" may need mirroring in RTL contexts"),
                "Add data-rtl-mirror=\"true\" or apply CSS [dir=rtl] & { transform: scaleX(-1) }"
                    .to_owned(),
            ));
        }
    }

    if config.runs(RtlRule::TextAlignment)
        && let Some(align) = node.inline_styles.get("text-align")
        && matches!(align.trim(), "left" | "right")
    {
        let align = align.trim();
        let logical = if align == "left" { "start" } else { "end" };
        found.push(violation(
            node,
            helix_node,
            RtlRule::TextAlignment,
            RtlLevel::Moderate,
            format!(
                "text-align: {align} is physical — use \"start\" or \"end\" for RTL-aware alignment"
            ),
            format!("Replace text-align: {align} with text-align: {logical}"),
        ));
    }

    found
}

/// Audit a page.
///
/// `document_dir` is what `<html dir>` said, or [`None`] when it said nothing —
/// which is itself the [`RtlRule::DirectionAttribute`] finding.
///
/// The document-level rule COUNTS toward the score. In the `.ts` it is pushed
/// after the element loop and `passes` only ever moves inside it, so a page whose
/// sole defect is that RTL does not work at all scored 100.
#[must_use]
pub fn audit(
    url: impl Into<String>,
    document_dir: Option<Direction>,
    nodes: &[ObservedNode],
    config: &RtlConfig,
    registry: &BTreeMap<String, u32>,
) -> RtlAuditResult {
    let mut violations = Vec::new();
    let mut passes = 0usize;
    // The document-level rule is one check in its own right, so the denominator
    // is elements plus one whenever it runs.
    let mut checks = nodes.len();

    for node in nodes {
        let found = check_node(node, config, registry);
        if found.is_empty() {
            passes += 1;
        }
        violations.extend(found);
    }

    if config.runs(RtlRule::DirectionAttribute) {
        checks += 1;
        if document_dir.is_none() {
            violations.push(RtlViolation {
                rule: RtlRule::DirectionAttribute,
                level: RtlLevel::Serious,
                message: "<html> element has no dir attribute — RTL locales will fall back to LTR"
                    .to_owned(),
                element: "HTML".to_owned(),
                selector: "html".to_owned(),
                node: None,
                component_name: None,
                portal_url: None,
                fix: "Add dir=\"ltr\" or dir=\"rtl\" (or a direction provider) on <html>"
                    .to_owned(),
            });
        } else {
            passes += 1;
        }
    }

    RtlAuditResult {
        url: url.into(),
        direction: document_dir,
        total_elements: nodes.len(),
        violations,
        passes,
        score: if checks == 0 {
            100
        } else {
            ((passes as f64 / checks as f64) * 100.0).round() as u32
        },
    }
}

/// The worst level present, for a single go/no-go answer.
#[must_use]
pub fn worst_level(violations: &[RtlViolation]) -> Option<RtlLevel> {
    violations.iter().map(|v| v.level).max()
}
