//! Mzizi N8 assurance — runtime accessibility rules.
//!
//! The Rust implementation of `mzizi-a11y-audit`. The rules, the levels, the
//! selector and the score; not the DOM walk. The host observes the page and hands
//! over a list of [`ObservedNode`] in document order, which is the only step that
//! needs a browser.
//!
//! Document order matters and is part of the contract: [`Rule::HeadingOrder`]
//! reads it. Hand nodes over in the order `querySelectorAll("*")` yields them, not
//! sorted or filtered.
//!
//! # Four defects in the TypeScript, fixed here
//!
//! **1. One element could report at most ONE violation.** The `.ts` chains its
//! rules with `else if`, so an `<img>` with no alt is never checked for anything
//! else, and a `<button>` with no accessible name is never checked for touch
//! target size. The rules are independent facts about an element; chaining them
//! means the *first* finding hides the rest, and a button with no name is exactly
//! the button most likely to also be too small. Every rule is evaluated here.
//!
//! **2. A conformant button never counted as a pass.** Falling into the
//! touch-target branch and finding nothing wrong incremented nothing — `passes++`
//! lived only in the branches an interactive element could not reach. So a page
//! of correct buttons scored *lower* than a page of `<div>`s, and the one number
//! anybody looks at moved the wrong way as accessibility improved. An element
//! passes here when it produced no violations, which is the only definition that
//! cannot invert.
//!
//! **3. The heading-order rule was a comment.** `// Rule: Headings should be in
//! order` sat above a branch that matched `H1`–`H6` and then did nothing but count
//! a pass. A stated rule that evaluates nothing reads as coverage on a dashboard
//! and is worse than an absent one. Implemented — see [`Rule::HeadingOrder`].
//!
//! **4. The touch-target rule measured the wrong box.** `getBoundingClientRect()`
//! is the *visual* box, and Mzizi's control scale is deliberately dense — `h-8` /
//! `h-9` / `h-10`, so 32-40px (CLAUDE.md §8.2). Measuring the visual box therefore
//! flagged every correctly-built Mzizi control as a moderate violation: the design
//! system failed its own audit universally, which is the fastest way to teach
//! everyone to ignore a rule. §8.2 says a dense control earns its hit area through
//! surrounding spacing or padding beyond the visual box, so the hit area is what
//! the rule is about. The host supplies [`ObservedNode::hit_box`] and is expected
//! to include that padding.
//!
//! # Two things recorded rather than changed
//!
//! **`<a>` is held to a size but not to a name.** `button-name` covers `<button>`
//! and `role="button"`; `touch-target` additionally covers `<a>`. So a link with
//! no accessible name passes. That is a coverage gap in the rule set, not a defect
//! in this port, and adding a `link-name` rule would silently change what every
//! existing consumer's score means. Left as it is, said out loud.
//!
//! **The node guess can only ever answer 2, 3 or 6.** `guessNodeFromSlot` is a
//! string heuristic over the slot name, so a violation in an N7 shell component is
//! labelled N6 and routed to the wrong owner — and N1, N4, N5 and N8-N12 are
//! unreachable answers. The registry knows the real node, so [`resolve_node`]
//! prefers a lookup the host supplies and falls back to the heuristic only when
//! there is no entry. The heuristic is kept because a consumer auditing their own
//! app has no Mzizi registry to consult.

use std::collections::{BTreeMap, BTreeSet};

/// How much an accessibility violation matters.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum A11yLevel {
    /// Cosmetic or advisory.
    Minor,
    /// Degrades the experience for assistive technology.
    Moderate,
    /// Blocks a common task.
    Serious,
    /// Makes the element unusable.
    Critical,
}

impl A11yLevel {
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
pub enum Rule {
    /// An image with no `alt` attribute at all.
    ImgAlt,
    /// A button with no accessible name.
    ButtonName,
    /// An interactive control whose hit area is below the floor.
    TouchTarget,
    /// A heading that skips a level.
    HeadingOrder,
}

impl Rule {
    /// The wire spelling, matching the `.ts` `rule` strings.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::ImgAlt => "img-alt",
            Self::ButtonName => "button-name",
            Self::TouchTarget => "touch-target",
            Self::HeadingOrder => "heading-order",
        }
    }

    /// Every rule this core evaluates.
    #[must_use]
    pub fn all() -> BTreeSet<Self> {
        [
            Self::ImgAlt,
            Self::ButtonName,
            Self::TouchTarget,
            Self::HeadingOrder,
        ]
        .into_iter()
        .collect()
    }
}

/// The measured hit area of a control, in CSS pixels.
///
/// This is the *interactive* area — the visual box plus any padding that extends
/// what a finger can land on — not `getBoundingClientRect()` on the painted
/// element. See the module docs, defect 4.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct HitBox {
    /// Width in CSS pixels.
    pub width: f64,
    /// Height in CSS pixels.
    pub height: f64,
}

/// One element as the host observed it.
///
/// Every field is a plain value rather than a live DOM reference, which is what
/// lets the rules run in a Worker, in CI against server-rendered HTML, or in a
/// test. It also sidesteps a real crash in the `.ts`: `el.className` is an
/// `SVGAnimatedString` on SVG elements, so `.split(" ")` throws on any SVG element
/// that reaches the selector builder.
///
/// `PartialEq` without `Eq`, because [`HitBox`] holds `f64` and floats have no
/// total equality — the same reason [`f64::NAN`] is not equal to itself.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct ObservedNode {
    /// Uppercase tag name, e.g. `BUTTON`.
    pub tag_name: String,
    /// The `id`, when present.
    pub id: Option<String>,
    /// The first class, when present.
    pub first_class: Option<String>,
    /// The `data-slot` value.
    pub data_slot: Option<String>,
    /// The `data-portal` backlink.
    pub data_portal: Option<String>,
    /// The `alt` attribute. `Some("")` is a decorative image and passes; `None`
    /// means the attribute is absent, which does not.
    pub alt: Option<String>,
    /// The `aria-label`.
    pub aria_label: Option<String>,
    /// The `aria-labelledby`.
    pub aria_labelledby: Option<String>,
    /// The `role`.
    pub role: Option<String>,
    /// Rendered text content.
    pub text: Option<String>,
    /// Whether the element occupies space. The `.ts` uses `offsetHeight > 0`,
    /// which reports true for `visibility: hidden` and `opacity: 0` — so a hidden
    /// control is still audited. Named `visible` because that is what the rule
    /// wants; supplying the honest answer is the host's job.
    pub visible: bool,
    /// The interactive area, when the host could measure it.
    pub hit_box: Option<HitBox>,
}

impl ObservedNode {
    /// Whether this element is a button for the purposes of [`Rule::ButtonName`].
    #[must_use]
    pub fn is_button(&self) -> bool {
        self.tag_name.eq_ignore_ascii_case("button") || self.role.as_deref() == Some("button")
    }

    /// Whether this element is a touch target for [`Rule::TouchTarget`].
    #[must_use]
    pub fn is_touch_target(&self) -> bool {
        self.is_button() || self.tag_name.eq_ignore_ascii_case("a")
    }

    /// The name a screen reader would announce, if any.
    ///
    /// `role` is NOT a name. `mzizi-conformity-check.ts` treats it as one
    /// (`aria-label || role`), which makes its own rule unfireable for exactly the
    /// `role="button"` elements it was widened to cover; this is the correct
    /// definition and the two now agree.
    #[must_use]
    pub fn accessible_name(&self) -> Option<&str> {
        [
            self.aria_label.as_deref(),
            self.aria_labelledby.as_deref(),
            self.text.as_deref(),
        ]
        .into_iter()
        .flatten()
        .map(str::trim)
        .find(|name| !name.is_empty())
    }

    /// The heading level, for `H1`-`H6`.
    #[must_use]
    pub fn heading_level(&self) -> Option<u8> {
        let bytes = self.tag_name.as_bytes();
        match bytes {
            [h, d] if h.eq_ignore_ascii_case(&b'H') && d.is_ascii_digit() => {
                let level = d - b'0';
                (1..=6).contains(&level).then_some(level)
            }
            _ => None,
        }
    }
}

/// One finding.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct A11yViolation {
    /// Which rule.
    pub rule: Rule,
    /// How much it matters.
    pub level: A11yLevel,
    /// What is wrong, in words.
    pub message: String,
    /// The element's tag.
    pub element: String,
    /// A selector that finds it again.
    pub selector: String,
    /// Which helix node owns the component, when known.
    pub node: Option<u32>,
    /// The `data-slot` value, when present.
    pub component_name: Option<String>,
    /// Where the component's documentation is.
    pub portal_url: Option<String>,
    /// How to fix it.
    pub fix: String,
}

/// What a whole page scored.
#[derive(Debug, Clone, PartialEq)]
pub struct A11yAuditResult {
    /// The URL audited.
    pub url: String,
    /// How many elements were observed.
    pub total_elements: usize,
    /// Every finding.
    pub violations: Vec<A11yViolation>,
    /// How many elements produced no finding.
    pub passes: usize,
    /// Percentage passing, 0-100.
    pub score: u32,
}

/// The touch-target floor the `.ts` uses, and the Apple HIG figure.
///
/// Material's is 48dp. This is a floor on the HIT AREA, not on the painted
/// control — see the module docs, defect 4.
pub const DEFAULT_TOUCH_TARGET_MIN_PX: f64 = 44.0;

/// What to check and how strictly.
#[derive(Debug, Clone, PartialEq)]
pub struct A11yConfig {
    /// Which rules to run. Empty means none, which is not the same as [`None`].
    pub rules: Option<BTreeSet<Rule>>,
    /// The hit-area floor in CSS pixels.
    pub touch_target_min_px: f64,
}

impl Default for A11yConfig {
    fn default() -> Self {
        Self {
            rules: None,
            touch_target_min_px: DEFAULT_TOUCH_TARGET_MIN_PX,
        }
    }
}

impl A11yConfig {
    /// Whether a rule is enabled. Absent configuration means every rule.
    #[must_use]
    pub fn runs(&self, rule: Rule) -> bool {
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

/// Escape a value for a double-quoted attribute selector.
fn escape_attr(value: &str) -> String {
    value.replace('\\', "\\\\").replace('"', "\\\"")
}

/// A selector that finds this element again.
///
/// The `.ts` interpolates the id and the slot raw, so an id containing a quote,
/// a space or a leading digit produces a selector that does not parse — and the
/// selector's only job is to let a human or an agent locate the element. Quoted
/// attribute form is used whenever the bare form would not survive.
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

/// The heuristic the `.ts` uses to guess a node from a slot name.
///
/// It can only ever answer 2, 3 or 6, so it is a guess and named like one. Prefer
/// [`resolve_node`], which asks the registry first.
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

/// Which node owns the component in this slot.
///
/// The registry lookup wins; the heuristic is the fallback for a consumer
/// auditing their own app, who has no Mzizi registry to consult.
#[must_use]
pub fn resolve_node(slot: Option<&str>, registry: &BTreeMap<String, u32>) -> Option<u32> {
    let slot = slot?;
    registry
        .get(slot)
        .copied()
        .or_else(|| guess_node_from_slot(slot))
}

/// Build a violation carrying the element's identity.
fn violation(
    node: &ObservedNode,
    helix_node: Option<u32>,
    rule: Rule,
    level: A11yLevel,
    message: String,
    fix: &str,
) -> A11yViolation {
    A11yViolation {
        rule,
        level,
        message,
        element: node.tag_name.clone(),
        selector: css_selector(node),
        node: helix_node,
        component_name: node.data_slot.clone().filter(|s| !s.is_empty()),
        portal_url: node.data_portal.clone().filter(|s| !s.is_empty()),
        fix: fix.to_owned(),
    }
}

/// Check one element against every enabled rule.
///
/// `previous_heading` is the level of the last heading seen before this element,
/// which is why the caller iterates in document order. Returns every violation,
/// never just the first.
#[must_use]
pub fn check_node(
    node: &ObservedNode,
    previous_heading: Option<u8>,
    config: &A11yConfig,
    registry: &BTreeMap<String, u32>,
) -> Vec<A11yViolation> {
    let mut found = Vec::new();
    let helix_node = resolve_node(node.data_slot.as_deref(), registry);

    if config.runs(Rule::ImgAlt) && node.tag_name.eq_ignore_ascii_case("img") && node.alt.is_none()
    {
        found.push(violation(
            node,
            helix_node,
            Rule::ImgAlt,
            A11yLevel::Critical,
            "Image missing alt text".to_owned(),
            "Add alt=\"\" for decorative or alt=\"description\" for informative",
        ));
    }

    if config.runs(Rule::ButtonName) && node.is_button() && node.accessible_name().is_none() {
        found.push(violation(
            node,
            helix_node,
            Rule::ButtonName,
            A11yLevel::Critical,
            "Button missing accessible name".to_owned(),
            "Add aria-label, aria-labelledby, or visible text",
        ));
    }

    if config.runs(Rule::TouchTarget)
        && node.is_touch_target()
        && node.visible
        && let Some(hit) = node.hit_box
        && (hit.height < config.touch_target_min_px || hit.width < config.touch_target_min_px)
    {
        let min = config.touch_target_min_px.round();
        found.push(violation(
            node,
            helix_node,
            Rule::TouchTarget,
            A11yLevel::Moderate,
            format!(
                "Touch target too small ({}×{}px, min {min}×{min})",
                hit.width.round(),
                hit.height.round()
            ),
            "Extend the interactive area with padding or surrounding spacing",
        ));
    }

    // A heading may not skip a level going DOWN the document — h2 after h4 is a
    // section ending, not a gap. The first heading on a page is compared against
    // level 0, so an h3 with no h1 or h2 above it is a skip.
    if config.runs(Rule::HeadingOrder)
        && let Some(level) = node.heading_level()
    {
        let previous = previous_heading.unwrap_or(0);
        if level > previous + 1 {
            found.push(violation(
                node,
                helix_node,
                Rule::HeadingOrder,
                A11yLevel::Moderate,
                format!("Heading level skipped (h{previous} → h{level})"),
                "Use the next heading level down, or restructure the section",
            ));
        }
    }

    found
}

/// Audit a page.
///
/// `nodes` must be in document order — [`Rule::HeadingOrder`] depends on it.
///
/// An element PASSES when it produced no violation. The `.ts` counts passes in
/// branches an interactive element cannot reach, so a correct button scored as
/// neither a pass nor a violation and the page score fell as accessibility rose.
#[must_use]
pub fn audit(
    url: impl Into<String>,
    nodes: &[ObservedNode],
    config: &A11yConfig,
    registry: &BTreeMap<String, u32>,
) -> A11yAuditResult {
    let mut violations = Vec::new();
    let mut passes = 0usize;
    let mut previous_heading: Option<u8> = None;

    for node in nodes {
        let found = check_node(node, previous_heading, config, registry);
        if found.is_empty() {
            passes += 1;
        }
        violations.extend(found);
        if let Some(level) = node.heading_level() {
            previous_heading = Some(level);
        }
    }

    let total = nodes.len();
    A11yAuditResult {
        url: url.into(),
        total_elements: total,
        violations,
        passes,
        // A page with no elements is not failing anything, which is different from
        // being untested — `total_elements` says which.
        score: if total == 0 {
            100
        } else {
            ((passes as f64 / total as f64) * 100.0).round() as u32
        },
    }
}

/// The worst level present, for a single go/no-go answer.
#[must_use]
pub fn worst_level(violations: &[A11yViolation]) -> Option<A11yLevel> {
    violations.iter().map(|v| v.level).max()
}

/// Whether a result clears a score threshold.
#[must_use]
pub fn meets_threshold(result: &A11yAuditResult, threshold: u32) -> bool {
    result.score >= threshold
}
