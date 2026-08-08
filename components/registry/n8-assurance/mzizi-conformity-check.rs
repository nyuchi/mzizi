//! Mzizi N8 assurance — does production match the registry?
//!
//! The Rust implementation of `mzizi-conformity-check` (a Conformity Monkey for
//! the component registry).
//!
//! # What this owns
//!
//! The rules and the score. Not the DOM walk: the host collects what it sees and
//! hands over a list of [`ObservedElement`], which is the only part that needs a
//! browser.
//!
//! That split is what makes the check runnable somewhere it never was. The `.ts`
//! calls `document.querySelectorAll` directly, so conformity could only ever be
//! assessed inside a live page — never against server-rendered HTML in CI, and
//! never from the Worker that is supposed to notice when a deploy stops
//! conforming.
//!
//! # Three defects in the TypeScript, fixed here
//!
//! **1. `onViolation` fired for one violation type out of four.** The
//! `unregistered` branch builds its violation object twice — once to push, once
//! to hand to the callback — and every other branch only pushes. So a consumer
//! wiring `onViolation` to an alerting path saw unregistered components and
//! silently never saw a deprecated one, a missing portal link or a missing
//! accessible name. Structurally impossible here: [`check_conformity`] returns
//! every violation and the host dispatches, so there is no second code path to
//! forget.
//!
//! **2. The score was wrong whenever a component name repeated.** Conformance was
//! counted with `violations.filter(v => v.componentName === slot).length === 0`,
//! which asks "has *any* element with this slot name had a violation" — so one
//! bad button marks every other button on the page non-conformant. A page with
//! twenty conformant buttons and one broken one scored zero for all twenty-one.
//! Counted per element here.
//!
//! It was also O(n²): a full scan of the violation list for every element.
//!
//! **3. An unregistered component skipped every other check.** The `.ts` returns
//! early, so an unregistered component that is *also* deprecated and *also*
//! missing an accessible name reports one violation instead of three. Being
//! absent from the registry does not make the other findings untrue, and the
//! aria one is a real accessibility defect either way.
//!
//! **4. The `missing_aria` rule could never fire for a `role="button"` element.**
//! The `.ts` computes `const ariaLabel = el.getAttribute("aria-label") ||
//! el.getAttribute("role")` and then refuses to report when `ariaLabel` is truthy
//! — so any element carrying `role="button"` supplies its own "name" and is
//! exempted by the very attribute that brought it into the rule's scope. The rule
//! was widened past `<button>` specifically to catch those elements and then
//! excluded all of them; only a literal `<button>` with no `role`, no `aria-label`
//! and no text could ever be reported.
//!
//! A role is not a name. `mzizi-a11y-audit` had the correct definition all along
//! — `aria-label`, `aria-labelledby`, or text — and two N8 components disagreeing
//! about what an accessible name IS meant the same button was a violation on one
//! surface and a pass on the other. [`ObservedElement::has_accessible_name`] now
//! matches the audit, `aria-labelledby` included.
//!
//! # Two variants that never had a producer
//!
//! `version_mismatch` and `missing_slot` are declared in the `.ts` union and
//! nothing emits either. They are kept because both describe real conditions a
//! host can detect — a rendered component whose version differs from the
//! registry's, and a registry component rendered with no `data-slot` at all —
//! and a union that can express a finding is better than one that cannot. What
//! is not kept is any pretence that this module produces them.

use std::collections::BTreeSet;

/// What kind of conformity failure.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum ViolationType {
    /// Rendered but absent from the registry.
    Unregistered,
    /// Missing the `data-portal` backlink.
    MissingPortal,
    /// Registered, but deprecated.
    Deprecated,
    /// Rendered version differs from the registry's. Never produced here.
    VersionMismatch,
    /// An interactive element with no accessible name.
    MissingAria,
    /// A registry component rendered without `data-slot`. Never produced here.
    MissingSlot,
}

impl ViolationType {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Unregistered => "unregistered",
            Self::MissingPortal => "missing_portal",
            Self::Deprecated => "deprecated",
            Self::VersionMismatch => "version_mismatch",
            Self::MissingAria => "missing_aria",
            Self::MissingSlot => "missing_slot",
        }
    }
}

/// How much a violation matters.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum ViolationSeverity {
    /// Worth knowing.
    Info,
    /// Worth fixing.
    Warning,
    /// Worth blocking on.
    Error,
}

impl ViolationSeverity {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Info => "info",
            Self::Warning => "warning",
            Self::Error => "error",
        }
    }
}

/// What the host saw on the page.
///
/// One of these per element carrying a `data-slot`. Gathering them is the only
/// step that needs a browser; everything after is arithmetic.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ObservedElement {
    /// The `data-slot` value.
    pub slot: String,
    /// The element's tag name, e.g. `BUTTON`.
    pub tag_name: String,
    /// The `data-portal` backlink, when present.
    pub portal_url: Option<String>,
    /// The `aria-label`, when present.
    pub aria_label: Option<String>,
    /// The `aria-labelledby`, when present.
    pub aria_labelledby: Option<String>,
    /// The `role`, when present. Decides whether the element is INTERACTIVE; it
    /// is not a source of an accessible name.
    pub role: Option<String>,
    /// Whether the element has any non-whitespace text.
    pub has_text: bool,
}

impl ObservedElement {
    /// Whether this element is interactive in the sense the aria rule means.
    #[must_use]
    pub fn is_interactive(&self) -> bool {
        self.tag_name.eq_ignore_ascii_case("button") || self.role.as_deref() == Some("button")
    }

    /// Whether a screen reader would announce a name for it.
    ///
    /// `role` is deliberately absent. Counting it — as the `.ts` does — makes the
    /// rule unfireable for the `role="button"` elements it exists to cover.
    #[must_use]
    pub fn has_accessible_name(&self) -> bool {
        self.aria_label.is_some() || self.aria_labelledby.is_some() || self.has_text
    }
}

/// One finding.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ConformityViolation {
    /// What kind.
    pub violation_type: ViolationType,
    /// Which component.
    pub component_name: String,
    /// The element's tag.
    pub element: String,
    /// A selector that finds it again.
    pub selector: String,
    /// What is wrong, in words.
    pub message: String,
    /// Where the component's documentation is.
    pub portal_url: Option<String>,
    /// How much it matters.
    pub severity: ViolationSeverity,
}

/// What a whole page scored.
#[derive(Debug, Clone, PartialEq)]
pub struct ConformityReport {
    /// The path checked.
    pub url: String,
    /// How many slotted elements were seen.
    pub total_components: usize,
    /// How many had no violations of their own.
    pub conformant: usize,
    /// Every finding.
    pub violations: Vec<ConformityViolation>,
    /// Percentage conformant, 0-100.
    pub score: u32,
}

/// A CSS selector for a slot value, with quotes escaped.
///
/// A slot containing `"` would otherwise produce a selector that does not parse
/// — and the selector's whole job is to let somebody find the element again.
#[must_use]
pub fn selector_for(slot: &str) -> String {
    format!(
        "[data-slot=\"{}\"]",
        slot.replace('\\', "\\\\").replace('"', "\\\"")
    )
}

/// Check one element against the registry.
///
/// Returns every violation it has, not the first. An unregistered component that
/// is also missing its accessible name has two problems, and the second is a real
/// accessibility defect regardless of the first.
#[must_use]
pub fn check_element(
    element: &ObservedElement,
    registry: Option<&BTreeSet<String>>,
    deprecated: &BTreeSet<String>,
) -> Vec<ConformityViolation> {
    let mut violations = Vec::new();
    let selector = selector_for(&element.slot);

    let base = |violation_type: ViolationType,
                message: String,
                severity: ViolationSeverity,
                portal_url: Option<String>| ConformityViolation {
        violation_type,
        component_name: element.slot.clone(),
        element: element.tag_name.clone(),
        selector: selector.clone(),
        message,
        portal_url,
        severity,
    };

    if let Some(registry) = registry
        && !registry.contains(&element.slot)
    {
        violations.push(base(
            ViolationType::Unregistered,
            format!(
                "Component \"{}\" is not in the design registry",
                element.slot
            ),
            ViolationSeverity::Warning,
            None,
        ));
    }

    if element.portal_url.is_none() {
        violations.push(base(
            ViolationType::MissingPortal,
            format!(
                "Component \"{}\" missing data-portal attribute",
                element.slot
            ),
            ViolationSeverity::Info,
            None,
        ));
    }

    if deprecated.contains(&element.slot) {
        violations.push(base(
            ViolationType::Deprecated,
            format!("Component \"{}\" is deprecated", element.slot),
            ViolationSeverity::Error,
            element.portal_url.clone(),
        ));
    }

    if element.is_interactive() && !element.has_accessible_name() {
        violations.push(base(
            ViolationType::MissingAria,
            format!(
                "Interactive element in \"{}\" missing accessible name",
                element.slot
            ),
            ViolationSeverity::Warning,
            element.portal_url.clone(),
        ));
    }

    violations
}

/// Check a whole page.
///
/// Conformance is counted PER ELEMENT. The `.ts` counts per slot NAME, so one
/// broken button marks every other button non-conformant — a page with twenty
/// good buttons and one bad one scored zero for all twenty-one.
#[must_use]
pub fn check_conformity(
    url: impl Into<String>,
    elements: &[ObservedElement],
    registry: Option<&BTreeSet<String>>,
    deprecated: &BTreeSet<String>,
) -> ConformityReport {
    let mut violations = Vec::new();
    let mut conformant = 0usize;

    for element in elements {
        let found = check_element(element, registry, deprecated);
        if found.is_empty() {
            conformant += 1;
        }
        violations.extend(found);
    }

    let total = elements.len();
    ConformityReport {
        url: url.into(),
        total_components: total,
        conformant,
        violations,
        // An empty page is fully conformant rather than a division by zero. It
        // has nothing wrong with it, which is different from being untested —
        // `total_components` says which.
        score: if total == 0 {
            100
        } else {
            ((conformant as f64 / total as f64) * 100.0).round() as u32
        },
    }
}

/// The worst severity present, for a single go/no-go answer.
#[must_use]
pub fn worst_severity(violations: &[ConformityViolation]) -> Option<ViolationSeverity> {
    violations.iter().map(|v| v.severity).max()
}
