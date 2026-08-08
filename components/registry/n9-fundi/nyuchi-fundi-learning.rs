//! Mzizi N9 fundi — learning from healing outcomes.
//!
//! The Rust implementation of `nyuchi-fundi-learning`: what fundi did, whether it
//! was right, and what that suggests about the next occurrence.
//!
//! # What this owns
//!
//! Aggregation and the severity suggestion. Not persistence — the `.ts` carries a
//! comment saying production stores outcomes in `fundi_healing_log` and computes
//! stats in SQL, which remains true and is the host's, because it is a database.
//!
//! # Two defects in the TypeScript, fixed here
//!
//! **1. `suggestSeverity` could LOWER the severity of a repeatedly recurring
//! defect.** The `.ts` returns `"high"` whenever something has recurred more than
//! twice — so a `critical` issue that keeps coming back is suggested as `high`,
//! which is exactly backwards. Recurrence is evidence that the first assessment
//! was too generous, never too harsh. [`suggest_severity`] escalates and never
//! de-escalates.
//!
//! **2. History grew without bound.** `outcomes.push` with no cap, in a component
//! whose whole purpose is to accumulate. The error tracker next door caps at 500;
//! this one did not, so a long-lived Worker or session leaks until it dies.
//!
//! # One thing preserved rather than "fixed"
//!
//! `accuracy` is `fundiWasCorrect / total`, and `total` includes outcomes fundi
//! never attempted — a human-fixed issue that fundi never claimed still drags the
//! denominator down. Arguably it should be measured over attempts. That is a
//! product decision about what the number means, not a porting one, and quietly
//! changing a published metric is how a dashboard starts lying in the flattering
//! direction. Preserved, with [`LearningStats::accuracy_over_attempts`] alongside
//! so the other reading is available without redefining the first.

use std::collections::BTreeMap;

/// Who actually fixed it.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ResolvedBy {
    /// fundi's plan landed the fix.
    Fundi,
    /// A person fixed it.
    Human,
    /// Both contributed.
    Both,
}

impl ResolvedBy {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Fundi => "fundi",
            Self::Human => "human",
            Self::Both => "both",
        }
    }

    /// Whether fundi attempted this at all.
    #[must_use]
    pub const fn fundi_attempted(self) -> bool {
        matches!(self, Self::Fundi | Self::Both)
    }
}

/// Severity, ordered so escalation is a comparison rather than a lookup table.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Severity {
    /// Noise, or a well-handled edge.
    Low,
    /// Worth looking at.
    Medium,
    /// Degrades something users touch.
    High,
    /// A core guarantee broke.
    Critical,
}

impl Severity {
    /// The wire spelling.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Low => "low",
            Self::Medium => "medium",
            Self::High => "high",
            Self::Critical => "critical",
        }
    }

    /// Parse a wire spelling, defaulting to [`Severity::Medium`].
    ///
    /// Medium rather than Low, because an unrecognised severity is an unknown
    /// risk and treating the unknown as harmless is how things get missed.
    #[must_use]
    pub fn from_str_or_medium(value: &str) -> Self {
        match value {
            "low" => Self::Low,
            "high" => Self::High,
            "critical" => Self::Critical,
            _ => Self::Medium,
        }
    }
}

/// What happened to one issue.
#[derive(Debug, Clone)]
pub struct HealingOutcome {
    /// The issue number.
    pub issue_id: u64,
    /// Which component.
    pub component: String,
    /// Which helix node.
    pub node: u32,
    /// What kind of failure.
    pub error_type: String,
    /// How bad it was judged.
    pub severity: Severity,
    /// What fundi proposed.
    pub plan_actions: Vec<String>,
    /// What actually fixed it.
    pub actual_fix: String,
    /// Whether fundi's diagnosis was right.
    pub fundi_was_correct: bool,
    /// How long it took to resolve.
    pub time_to_resolve_minutes: f64,
    /// Whether it came back.
    pub recurred: bool,
    /// Who fixed it.
    pub resolved_by: ResolvedBy,
    /// When it was recorded, milliseconds since the Unix epoch.
    pub recorded_at_ms: f64,
}

/// A ranked count.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Ranked {
    /// The thing being counted.
    pub name: String,
    /// How many.
    pub count: usize,
}

/// What the history says.
#[derive(Debug, Clone, PartialEq)]
pub struct LearningStats {
    /// How many outcomes are held.
    pub total_issues: usize,
    /// How many fundi resolved alone.
    pub auto_fixed: usize,
    /// How many it did not.
    pub human_fixed: usize,
    /// Correct diagnoses over ALL outcomes — the `.ts`'s definition.
    pub accuracy: f64,
    /// Correct diagnoses over the outcomes fundi actually attempted.
    ///
    /// The other reading of the same data, offered alongside rather than
    /// replacing, so neither number has to be silently redefined.
    pub accuracy_over_attempts: f64,
    /// Mean minutes to resolve, rounded as the `.ts` does.
    pub avg_time_to_resolve: f64,
    /// The components failing most.
    pub top_failing_components: Vec<Ranked>,
    /// The error types occurring most.
    pub top_error_types: Vec<Ranked>,
    /// Fraction that came back.
    pub recurrence_rate: f64,
}

impl LearningStats {
    /// The empty case.
    #[must_use]
    pub fn empty() -> Self {
        Self {
            total_issues: 0,
            auto_fixed: 0,
            human_fixed: 0,
            accuracy: 0.0,
            accuracy_over_attempts: 0.0,
            avg_time_to_resolve: 0.0,
            top_failing_components: Vec::new(),
            top_error_types: Vec::new(),
            recurrence_rate: 0.0,
        }
    }
}

/// Rank a tally, highest first, breaking ties by name.
///
/// The tie-break is not cosmetic. The `.ts` sorts a `Map` whose iteration order
/// is insertion order, so two components with equal counts swap places depending
/// on which failed first — and a "top failing components" list that reshuffles
/// between refreshes is one nobody trusts.
fn rank(counts: &BTreeMap<String, usize>, limit: usize) -> Vec<Ranked> {
    let mut ranked: Vec<Ranked> = counts
        .iter()
        .map(|(name, &count)| Ranked {
            name: name.clone(),
            count,
        })
        .collect();
    ranked.sort_by(|a, b| b.count.cmp(&a.count).then(a.name.cmp(&b.name)));
    ranked.truncate(limit);
    ranked
}

/// The accumulated history.
#[derive(Debug, Clone)]
pub struct LearningLog {
    /// How many outcomes to retain. The `.ts` retains all of them, forever.
    pub max_outcomes: usize,
    outcomes: Vec<HealingOutcome>,
}

impl Default for LearningLog {
    fn default() -> Self {
        Self::new(1000)
    }
}

impl LearningLog {
    /// A log holding at most `max_outcomes`.
    #[must_use]
    pub fn new(max_outcomes: usize) -> Self {
        Self {
            max_outcomes,
            outcomes: Vec::new(),
        }
    }

    /// Record an outcome, dropping the oldest if that exceeds the cap.
    pub fn record(&mut self, outcome: HealingOutcome) {
        self.outcomes.push(outcome);
        if self.outcomes.len() > self.max_outcomes {
            self.outcomes.remove(0);
        }
    }

    /// Every outcome held.
    #[must_use]
    pub fn outcomes(&self) -> &[HealingOutcome] {
        &self.outcomes
    }

    /// Everything recorded for one component.
    #[must_use]
    pub fn component_history(&self, component: &str) -> Vec<&HealingOutcome> {
        self.outcomes
            .iter()
            .filter(|o| o.component == component)
            .collect()
    }

    /// Aggregate the history.
    #[must_use]
    pub fn stats(&self) -> LearningStats {
        let total = self.outcomes.len();
        if total == 0 {
            return LearningStats::empty();
        }

        let auto_fixed = self
            .outcomes
            .iter()
            .filter(|o| o.resolved_by == ResolvedBy::Fundi)
            .count();
        let correct = self.outcomes.iter().filter(|o| o.fundi_was_correct).count();
        let attempts = self
            .outcomes
            .iter()
            .filter(|o| o.resolved_by.fundi_attempted())
            .count();
        let correct_attempts = self
            .outcomes
            .iter()
            .filter(|o| o.fundi_was_correct && o.resolved_by.fundi_attempted())
            .count();
        let recurred = self.outcomes.iter().filter(|o| o.recurred).count();
        let total_f = total as f64;

        let mut components: BTreeMap<String, usize> = BTreeMap::new();
        let mut error_types: BTreeMap<String, usize> = BTreeMap::new();
        for outcome in &self.outcomes {
            *components.entry(outcome.component.clone()).or_insert(0) += 1;
            *error_types.entry(outcome.error_type.clone()).or_insert(0) += 1;
        }

        LearningStats {
            total_issues: total,
            auto_fixed,
            human_fixed: total - auto_fixed,
            accuracy: correct as f64 / total_f,
            accuracy_over_attempts: if attempts == 0 {
                0.0
            } else {
                correct_attempts as f64 / attempts as f64
            },
            avg_time_to_resolve: (self
                .outcomes
                .iter()
                .map(|o| o.time_to_resolve_minutes)
                .sum::<f64>()
                / total_f)
                .round(),
            top_failing_components: rank(&components, 10),
            top_error_types: rank(&error_types, 5),
            recurrence_rate: recurred as f64 / total_f,
        }
    }

    /// What severity the next occurrence of this defect probably deserves.
    ///
    /// Escalates and never de-escalates. The `.ts` returns `"high"` outright when
    /// something has recurred more than twice, which *lowers* a `critical` defect
    /// that keeps coming back — precisely inverted, since recurrence is evidence
    /// the first assessment was too generous.
    ///
    /// With no history the answer is [`Severity::Medium`], as in the `.ts`.
    #[must_use]
    pub fn suggest_severity(&self, component: &str, error_type: &str) -> Severity {
        let history: Vec<&HealingOutcome> = self
            .outcomes
            .iter()
            .filter(|o| o.component == component && o.error_type == error_type)
            .collect();

        let Some(last) = history.last() else {
            return Severity::Medium;
        };

        let recurrences = history.iter().filter(|o| o.recurred).count();
        if recurrences > 2 {
            // Escalate from where it already was, rather than to a fixed rung.
            return last.severity.max(Severity::High);
        }
        last.severity
    }
}
