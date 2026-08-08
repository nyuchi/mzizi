//! Mzizi N8 assurance — SLO tracking, burn-rate alerting and escalation.
//!
//! The Rust implementation of `mzizi-alert-engine`.
//!
//! # What this owns
//!
//! Burn-rate arithmetic, the escalation decision, and the alert lifecycle. Not
//! the timer, not the metrics store, not the DOM. The `.ts` sibling's `evaluate`
//! runs on a `setInterval` and reads `const currentValue = 99.95` — a literal,
//! under a comment saying *"in production this would query metrics… here we
//! define the contract."*
//!
//! So the measurement is the host's and always was. What belongs here is the part
//! that must not vary: given an observed value and an SLO, what fires and how
//! loudly.
//!
//! # Two defects in the TypeScript, fixed here rather than ported
//!
//! **1. One breach fired one alert per matching escalation tier.** The `.ts`
//! loops every tier and fires whenever `burnRate >= esc.burnRate`, so an SLO
//! escalating at 1× warning / 2× critical / 5× page produces *three* alerts at a
//! burn rate of 6 — and one of them pages a human, three times, for a single
//! breach. [`escalate_to`] returns the **highest matching tier, once**, which is
//! what an escalation ladder means.
//!
//! **2. Alert ids collided.** `alert-${Date.now()}` is unique only if no two
//! alerts fire in the same millisecond, and a burn-rate breach fires several
//! alerts in the same tick by construction — so the defects compounded, with the
//! duplicates overwriting each other in the `Map`. Ids are supplied here, for the
//! same reason trace ids are: a core has no clock and should not invent identity.
//!
//! Neither is a translation choice. A faithful port would have carried both
//! across, and `cargo check` would have been perfectly happy with them.

use std::collections::BTreeMap;

/// How loud an alert is.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum AlertSeverity {
    /// Informational. No action expected.
    Info,
    /// Someone should look when convenient.
    Warning,
    /// Someone should look now.
    Critical,
    /// Wake a human.
    Page,
}

impl AlertSeverity {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Info => "info",
            Self::Warning => "warning",
            Self::Critical => "critical",
            Self::Page => "page",
        }
    }
}

/// Where an alert is in its life.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AlertState {
    /// Currently breaching.
    Firing,
    /// Breaching but inside its grace period.
    Pending,
    /// No longer breaching.
    Resolved,
}

impl AlertState {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Firing => "firing",
            Self::Pending => "pending",
            Self::Resolved => "resolved",
        }
    }
}

/// Which metric an SLO tracks.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SloMetric {
    /// Fraction of requests served.
    Availability,
    /// 99th-percentile latency.
    LatencyP99,
    /// Fraction of requests that errored.
    ErrorRate,
    /// Fraction of requests that succeeded.
    SuccessRate,
}

impl SloMetric {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Availability => "availability",
            Self::LatencyP99 => "latency_p99",
            Self::ErrorRate => "error_rate",
            Self::SuccessRate => "success_rate",
        }
    }
}

/// One rung of an escalation ladder.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Escalation {
    /// Burn rate at or above which this rung applies.
    pub burn_rate: f64,
    /// How loud to be at this rung.
    pub severity: AlertSeverity,
}

/// A service-level objective.
#[derive(Debug, Clone)]
pub struct SloDefinition {
    /// Stable id.
    pub id: String,
    /// Human name.
    pub name: String,
    /// Target percentage, e.g. `99.9`.
    pub target: f64,
    /// Window in hours, e.g. `720` for 30 days.
    pub window_hours: u32,
    /// Which metric this tracks.
    pub metric: SloMetric,
    /// Which mini-apps it covers.
    pub mini_apps: Vec<String>,
    /// The escalation ladder. Order does not matter — the highest match wins.
    pub escalation: Vec<Escalation>,
}

/// A fired alert.
#[derive(Debug, Clone, PartialEq)]
pub struct Alert {
    /// Stable id, supplied by the host.
    pub id: String,
    /// The SLO this came from, when it came from one.
    pub slo_id: Option<String>,
    /// Human name.
    pub name: String,
    /// How loud.
    pub severity: AlertSeverity,
    /// Where it is in its life.
    pub state: AlertState,
    /// What happened, in words.
    pub message: String,
    /// When it fired, in milliseconds since the Unix epoch.
    pub fired_at_ms: f64,
    /// When it resolved.
    pub resolved_at_ms: Option<f64>,
    /// Components implicated.
    ///
    /// Supplied by the host. The `.ts` falls back to
    /// `document.querySelectorAll("[data-portal]")`, which is DOM access — the
    /// host's business, and meaningless in a Worker or a native shell.
    pub affected_components: Vec<String>,
    /// Mini-apps implicated.
    pub affected_mini_apps: Vec<String>,
    /// Who has been told.
    pub notified: Vec<String>,
    /// Where the runbook is.
    pub runbook_url: Option<String>,
}

/// Error-budget burn rate for an observed value against a target.
///
/// Returns `0.0` while the objective is being met, and otherwise how many times
/// over the budget the breach is: a target of 99.9 observed at 99.8 has consumed
/// its whole 0.1 budget once, so the rate is 1.0.
///
/// # A 100% target
///
/// `100 - target` is the budget, and a target of 100 leaves none — so any breach
/// is infinitely over it. The `.ts` divides straight through and yields
/// `Infinity`, which then compares `>=` true against every escalation rung and
/// pages immediately. That is arguably the right answer for an SLO that admits no
/// failure, but it arrives by accident. Here it is explicit: an unmeetable
/// objective returns [`f64::INFINITY`] deliberately, and a caller can decide
/// whether that objective was a mistake.
#[must_use]
pub fn burn_rate(observed: f64, target: f64) -> f64 {
    let remaining = observed - target;
    if remaining >= 0.0 {
        return 0.0;
    }
    let budget = 100.0 - target;
    if budget <= 0.0 {
        return f64::INFINITY;
    }
    remaining.abs() / budget
}

/// The single rung an escalation ladder reaches at this burn rate.
///
/// Returns the **highest** matching rung, or `None` when none match. This is the
/// fix for the `.ts`'s per-rung firing: an escalation ladder describes one
/// response that gets louder, not a set of independent triggers, and treating it
/// as the latter pages a human once per rung they configured.
///
/// Ties on `burn_rate` break toward the louder severity, because under-alerting a
/// breach is the worse error.
#[must_use]
pub fn escalate_to(escalation: &[Escalation], burn_rate: f64) -> Option<Escalation> {
    escalation
        .iter()
        .filter(|e| burn_rate >= e.burn_rate)
        .copied()
        .max_by(|a, b| {
            a.burn_rate
                .partial_cmp(&b.burn_rate)
                .unwrap_or(std::cmp::Ordering::Equal)
                .then(a.severity.cmp(&b.severity))
        })
}

/// Evaluate one SLO against an observed value.
///
/// Returns at most ONE alert, which is the whole point. `id` and `fired_at_ms`
/// are supplied because a core has neither a counter nor a clock.
#[must_use]
pub fn evaluate_slo(
    slo: &SloDefinition,
    observed: f64,
    id: impl Into<String>,
    fired_at_ms: f64,
) -> Option<Alert> {
    let rate = burn_rate(observed, slo.target);
    let rung = escalate_to(&slo.escalation, rate)?;
    Some(Alert {
        id: id.into(),
        slo_id: Some(slo.id.clone()),
        name: format!("SLO breach: {}", slo.name),
        severity: rung.severity,
        state: AlertState::Firing,
        message: format!(
            "{} burn rate {rate:.2}x (threshold: {}x). Current: {observed}%, target: {}%",
            slo.name, rung.burn_rate, slo.target
        ),
        fired_at_ms,
        resolved_at_ms: None,
        affected_components: Vec::new(),
        affected_mini_apps: slo.mini_apps.clone(),
        notified: Vec::new(),
        runbook_url: Some(format!("https://mzizi.dev/runbooks/{}", slo.id)),
    })
}

/// The set of alerts a host is tracking.
///
/// Ordered, so "the active alerts" is a stable list rather than whatever order a
/// hash map happened to produce — a dashboard that reshuffles between polls is
/// one nobody trusts.
#[derive(Debug, Clone, Default)]
pub struct AlertLog {
    alerts: BTreeMap<String, Alert>,
}

impl AlertLog {
    /// An empty log.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Record a fired alert, returning the previous one with that id if any.
    ///
    /// Returning the displaced alert rather than dropping it is deliberate: with
    /// the `.ts`'s colliding `Date.now()` ids this silently destroyed alerts, and
    /// a caller that ignores the return value at least had the chance not to.
    pub fn fire(&mut self, alert: Alert) -> Option<Alert> {
        self.alerts.insert(alert.id.clone(), alert)
    }

    /// Mark an alert resolved. Returns false if the id is unknown.
    pub fn resolve(&mut self, id: &str, resolved_at_ms: f64) -> bool {
        match self.alerts.get_mut(id) {
            Some(alert) => {
                alert.state = AlertState::Resolved;
                alert.resolved_at_ms = Some(resolved_at_ms);
                true
            }
            None => false,
        }
    }

    /// Every alert currently firing.
    #[must_use]
    pub fn active(&self) -> Vec<&Alert> {
        self.alerts
            .values()
            .filter(|a| a.state == AlertState::Firing)
            .collect()
    }

    /// Every alert, resolved or not.
    #[must_use]
    pub fn all(&self) -> Vec<&Alert> {
        self.alerts.values().collect()
    }

    /// How many alerts are held.
    #[must_use]
    pub fn len(&self) -> usize {
        self.alerts.len()
    }

    /// Whether the log is empty.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.alerts.is_empty()
    }
}
