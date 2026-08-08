//! Mzizi N9 fundi — turning an assurance signal into a filed defect.
//!
//! The Rust implementation of `nyuchi-fundi-reporter`. This is the **healing**
//! exit from N8: a named defect a human can merge a fix for. The observation exit
//! is `mzizi-otel`, and they are not alternatives — see `docs/n8-telemetry.md`.
//!
//! # What this owns
//!
//! The cooldown decision, the labels, the issue title and body. Not the HTTP
//! POST: the host files the issue, as everywhere in the core.
//!
//! # Three defects in the TypeScript, fixed here
//!
//! **1. A failed report still started the cooldown.** The `.ts` records
//! `cooldowns.set(component, Date.now())` *before* the `fetch`, so a GitHub
//! outage — or a 401, or a rate limit — suppressed every retry for the next five
//! minutes. The signal was consumed without ever producing an issue. Here the
//! cooldown is recorded by [`CooldownLog::record_filed`], which a host calls only
//! after the file succeeds.
//!
//! **2. The cooldown key was the component alone.** A component with a render bug
//! and a network bug reported one and silently dropped the other for five
//! minutes, because they share a key. The key is component **and** error type, so
//! distinct defects on one component are distinct reports.
//!
//! **3. The issue body interpolated untrusted text into Markdown.** Every field
//! goes into a table cell, a code span or a link, and every field ultimately
//! comes from a runtime error message — which is attacker-influenced whenever any
//! user input reaches an exception. A backtick in `component` closes the code
//! span; a `|` in any value forges table columns; a newline plus `---` forges the
//! provenance footer this very file appends, so an injected report can claim to
//! have been filed by something it was not. [`escape_markdown_cell`] and
//! [`escape_code_span`] close that.
//!
//! GitHub sanitises rendered HTML, so this is content forgery rather than script
//! execution — but a fabricated "Filed by" line in an automated issue is exactly
//! the sort of thing a triager trusts without checking.

use std::collections::BTreeMap;

/// How bad the reported failure is.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ReportSeverity {
    /// Noise, or a well-handled edge.
    Low,
    /// Worth looking at.
    Medium,
    /// Degrades something users touch.
    High,
    /// A core guarantee broke.
    Critical,
}

impl ReportSeverity {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Low => "low",
            Self::Medium => "medium",
            Self::High => "high",
            Self::Critical => "critical",
        }
    }
}

/// What kind of failure this is.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ErrorType {
    /// A component failed to render.
    Render,
    /// A request failed.
    Network,
    /// Data was missing or malformed.
    Data,
    /// An authentication or authorisation failure.
    Auth,
    /// A chain interaction failed.
    Chain,
    /// A cryptographic operation failed.
    Crypto,
    /// An operation exceeded its deadline.
    Timeout,
    /// An accessibility conformance failure.
    A11y,
    /// A performance budget was exceeded.
    Perf,
    /// A conformity check failed.
    Conformity,
    /// A service-level objective was breached.
    Slo,
}

impl ErrorType {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Render => "render",
            Self::Network => "network",
            Self::Data => "data",
            Self::Auth => "auth",
            Self::Chain => "chain",
            Self::Crypto => "crypto",
            Self::Timeout => "timeout",
            Self::A11y => "a11y",
            Self::Perf => "perf",
            Self::Conformity => "conformity",
            Self::Slo => "slo",
        }
    }
}

/// A failure worth filing.
#[derive(Debug, Clone)]
pub struct FundiReport {
    /// Which component failed.
    pub component: String,
    /// Which helix node it belongs to.
    pub node: u32,
    /// How bad.
    pub severity: ReportSeverity,
    /// What kind.
    pub error_type: ErrorType,
    /// Which N8 component observed it.
    pub source: String,
    /// One-line summary.
    pub title: String,
    /// The detail.
    pub description: String,
    /// Where to see the component.
    pub portal_url: Option<String>,
    /// Structured diagnostic, already serialised by the host.
    pub diagnostic: Option<String>,
    /// Mini-apps implicated.
    pub affected_mini_apps: Vec<String>,
    /// Components that may be affected.
    pub blast_radius: Vec<String>,
}

impl FundiReport {
    /// The cooldown key: component AND error type.
    ///
    /// Keying on the component alone — which the `.ts` does — means a render bug
    /// and a network bug on one component share a bucket, so the second is
    /// silently dropped for the cooldown window.
    #[must_use]
    pub fn cooldown_key(&self) -> String {
        format!("{}:{}", self.component, self.error_type.as_str())
    }
}

/// Escape a value destined for a Markdown table cell.
///
/// A `|` forges columns, a newline escapes the row entirely, and a leading `-`
/// on its own line can start a list or a rule. Backslashes go first, or the
/// escapes this adds would themselves be escapable.
#[must_use]
pub fn escape_markdown_cell(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    for c in value.chars() {
        match c {
            '\\' => out.push_str("\\\\"),
            '|' => out.push_str("\\|"),
            // A cell cannot contain a line break; a space preserves readability
            // where a dropped character would silently join two words.
            '\n' | '\r' => out.push(' '),
            c => out.push(c),
        }
    }
    out
}

/// Escape a value destined for a backtick code span.
///
/// A backtick closes the span and lets everything after it render as Markdown,
/// which is how a component name becomes a heading. Replaced rather than
/// backslash-escaped, because a backslash does not escape a backtick inside a
/// code span — only widening the fence does, and that cannot be done per value.
#[must_use]
pub fn escape_code_span(value: &str) -> String {
    value.replace('`', "'").replace(['\n', '\r'], " ")
}

/// The labels an issue carries.
#[must_use]
pub fn labels_for(report: &FundiReport) -> Vec<String> {
    vec![
        format!("fundi:severity/{}", report.severity.as_str()),
        format!("fundi:node/{}", report.node),
        format!("fundi:type/{}", report.error_type.as_str()),
        format!("fundi:source/{}", escape_code_span(&report.source)),
    ]
}

/// The issue title.
#[must_use]
pub fn issue_title(report: &FundiReport) -> String {
    format!(
        "[{}] {}",
        escape_code_span(&report.component),
        report.title.replace(['\n', '\r'], " ")
    )
}

/// The issue body, in Markdown.
#[must_use]
pub fn issue_body(report: &FundiReport) -> String {
    let mut b = String::from("## Component Failure Report\n\n| Field | Value |\n|---|---|\n");
    b.push_str(&format!(
        "| Component | `{}` |\n",
        escape_code_span(&report.component)
    ));
    b.push_str(&format!("| Node | {} |\n", report.node));
    b.push_str(&format!("| Severity | {} |\n", report.severity.as_str()));
    b.push_str(&format!(
        "| Error Type | {} |\n",
        report.error_type.as_str()
    ));
    b.push_str(&format!(
        "| Source | {} |\n",
        escape_markdown_cell(&report.source)
    ));
    if let Some(url) = &report.portal_url {
        // Angle brackets are Markdown's own literal-URL form, so a `)` in the
        // URL cannot terminate the link early.
        b.push_str(&format!(
            "| Portal | [View](<{}>) |\n",
            url.replace(['<', '>', '\n', '\r'], "")
        ));
    }
    b.push_str(&format!("\n### Description\n\n{}\n", report.description));
    if !report.affected_mini_apps.is_empty() {
        b.push_str(&format!(
            "\n### Affected Mini-Apps\n\n{}\n",
            report
                .affected_mini_apps
                .iter()
                .map(|m| escape_markdown_cell(m))
                .collect::<Vec<_>>()
                .join(", ")
        ));
    }
    if !report.blast_radius.is_empty() {
        b.push_str(&format!(
            "\n### Blast Radius\n\n{}\n",
            report
                .blast_radius
                .iter()
                .map(|c| format!("`{}`", escape_code_span(c)))
                .collect::<Vec<_>>()
                .join(", ")
        ));
    }
    if let Some(diagnostic) = &report.diagnostic {
        // A four-backtick fence, so a three-backtick fence inside the diagnostic
        // cannot close it and spill the rest into prose.
        b.push_str(&format!(
            "\n### Diagnostic\n\n````json\n{}\n````\n",
            diagnostic.replace("````", "'''")
        ));
    }
    b.push_str("\n---\n*Filed by nyuchi-fundi-reporter (the N8 assurance to N9 fundi bridge)*\n");
    b
}

/// Why a report was not filed.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NotFiled {
    /// An identical defect was filed recently.
    InCooldown,
}

/// Per-defect cooldowns.
///
/// The host records a filing only once it has actually succeeded, which is the
/// fix for the `.ts` consuming a signal it never delivered.
#[derive(Debug, Clone, Default)]
pub struct CooldownLog {
    /// Seconds a defect stays suppressed after a successful filing.
    pub cooldown_seconds: f64,
    filed_at_ms: BTreeMap<String, f64>,
}

impl CooldownLog {
    /// A log with the `.ts`'s default of five minutes.
    #[must_use]
    pub fn new(cooldown_seconds: f64) -> Self {
        Self {
            cooldown_seconds,
            filed_at_ms: BTreeMap::new(),
        }
    }

    /// Whether this report may be filed now.
    ///
    /// # Errors
    ///
    /// Returns [`NotFiled::InCooldown`] when an identical defect was filed inside
    /// the window.
    pub fn may_file(&self, report: &FundiReport, now_ms: f64) -> Result<(), NotFiled> {
        match self.filed_at_ms.get(&report.cooldown_key()) {
            Some(last) if now_ms - last < self.cooldown_seconds * 1000.0 => {
                Err(NotFiled::InCooldown)
            }
            _ => Ok(()),
        }
    }

    /// Record that this report WAS filed. Call only on success.
    pub fn record_filed(&mut self, report: &FundiReport, now_ms: f64) {
        self.filed_at_ms.insert(report.cooldown_key(), now_ms);
    }

    /// How many distinct defects are suppressed.
    #[must_use]
    pub fn len(&self) -> usize {
        self.filed_at_ms.len()
    }

    /// Whether anything is suppressed.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.filed_at_ms.is_empty()
    }
}
