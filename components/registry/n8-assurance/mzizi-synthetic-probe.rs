//! Mzizi N8 assurance — synthetic journeys: the probe contract and its pure parts.
//!
//! The Rust implementation of `mzizi-synthetic-probe`.
//!
//! # What this owns, and what it deliberately does not
//!
//! It owns the **contract** — what a journey is, what a run produced, when a
//! failure is worth waking somebody for — and every decision derivable from a
//! finished run. It does **not** own execution.
//!
//! That is the same boundary [`super::mzizi_otel`] draws at sending, and for the
//! same reason: driving a browser is I/O, and every host does it differently. A
//! Cloudflare Worker cannot spawn a browser process at all and reaches Browser
//! Run over `fetch`; a laptop can drive Chromium directly; a native shell has its
//! own harness. What must *not* vary is what counts as a pass, how step outcomes
//! roll up into a run outcome, and when an alert fires.
//!
//! The `.ts` sibling is honest about this in a way worth preserving: its
//! `executeSyntheticJourney` is a stub whose body says *"in a real implementation
//! this would use Puppeteer/Playwright — here we define the contract that the
//! probe runner implements."* Porting that stub to Rust would have carried a
//! placeholder across as though it were an implementation. The contract is the
//! real content, so the contract is what moved.
//!
//! One correction landed on the way: that comment names Puppeteer/Playwright, and
//! **fundi is a Cloudflare Worker**, which can run neither. The runner that
//! actually exists (`scripts/kitesurf.ts`) is a `fetch` against Browser Run for
//! exactly that reason.

use std::collections::BTreeMap;

/// What a step does when a runner executes it.
///
/// A closed set rather than a string, because a runner has to exhaustively
/// handle every variant — and an unknown step type should fail to compile rather
/// than be silently skipped at 3am.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProbeStepType {
    /// Go to a path.
    Navigate,
    /// Click a selector.
    Click,
    /// Type a value into a selector.
    Input,
    /// Assert a selector is present.
    Assert,
    /// Wait, either for a selector or for a duration.
    Wait,
    /// Capture a screenshot.
    Screenshot,
}

impl ProbeStepType {
    /// The wire spelling, matching the `.ts` string union exactly.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Navigate => "navigate",
            Self::Click => "click",
            Self::Input => "input",
            Self::Assert => "assert",
            Self::Wait => "wait",
            Self::Screenshot => "screenshot",
        }
    }
}

/// One step a runner should perform.
///
/// This is the INPUT shape. The outcome of running it is [`StepResult`], which is
/// a different type carrying different fields — the `.ts` names this one
/// `ProbeStep` and leaves the outcome shape anonymous inside `ProbeResult`, which
/// is how the two came to be conflated in the first Rust draft.
#[derive(Debug, Clone)]
pub struct ProbeStep {
    /// What to do.
    pub step_type: ProbeStepType,
    /// Selector or path, depending on the step type.
    pub target: Option<String>,
    /// Value to enter, for [`ProbeStepType::Input`].
    pub value: Option<String>,
    /// Per-step timeout in milliseconds.
    pub timeout_ms: Option<u32>,
    /// Human description. Becomes the step's span name, so it is not decoration.
    pub description: String,
}

/// A journey a runner can execute on a schedule.
#[derive(Debug, Clone)]
pub struct SyntheticJourney {
    /// Stable id. A collector groups runs on this, so it must not drift.
    pub id: String,
    /// Human name.
    pub name: String,
    /// Which mini-app this journey exercises.
    pub mini_app: Option<String>,
    /// Which helix nodes the journey traverses.
    ///
    /// Uncapped on purpose: node numbers are labels, not a sequence, and any
    /// upper bound here would be the defect rather than its current value.
    pub nodes: Vec<u32>,
    /// The steps, in order.
    pub steps: Vec<ProbeStep>,
    /// Cron expression, when scheduled.
    pub schedule: Option<String>,
    /// Regions to run from.
    pub regions: Vec<String>,
    /// Whether a failure should raise an alert.
    pub alert_on_failure: bool,
}

/// Outcome of one executed step.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StepStatus {
    /// The step asserted what it set out to assert.
    Pass,
    /// The step failed.
    Fail,
}

impl StepStatus {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Pass => "pass",
            Self::Fail => "fail",
        }
    }
}

/// Outcome of a whole run.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProbeStatus {
    /// Every step passed.
    Pass,
    /// At least one step failed.
    Fail,
    /// The run exceeded its allotted time.
    Timeout,
    /// The runner itself could not complete — distinct from the journey failing.
    Error,
}

impl ProbeStatus {
    /// Whether this outcome should surface as an OTLP `ERROR` status.
    #[must_use]
    pub const fn is_failure(self) -> bool {
        !matches!(self, Self::Pass)
    }

    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Pass => "pass",
            Self::Fail => "fail",
            Self::Timeout => "timeout",
            Self::Error => "error",
        }
    }
}

/// The outcome of one executed step.
#[derive(Debug, Clone)]
pub struct StepResult {
    /// The step's description, carried through so a reader need not re-join.
    pub description: String,
    /// Whether it passed.
    pub status: StepStatus,
    /// How long it took.
    pub duration_ms: f64,
    /// Why it failed, when it did.
    ///
    /// Carried onto the wire as `error.message` rather than left in prose,
    /// because the consumer acting on it is usually not a human. A render check
    /// that failed because the URL sat behind an auth wall is not the same
    /// incident as a page that rendered empty, and fundi filing an issue for the
    /// first would be a false positive.
    pub error: Option<String>,
}

/// What one run produced. The contract every runner returns.
#[derive(Debug, Clone)]
pub struct ProbeResult {
    /// Which journey ran.
    pub journey_id: String,
    /// When the run started, in milliseconds since the Unix epoch.
    ///
    /// Milliseconds rather than the `.ts`'s ISO-8601 string, because a core has
    /// no clock and no timezone database and should not grow a date parser to
    /// avoid needing one. The host formats for display; the core does arithmetic.
    pub started_at_ms: f64,
    /// Where it ran from.
    pub region: String,
    /// The run's outcome.
    pub status: ProbeStatus,
    /// Total run duration.
    pub duration_ms: f64,
    /// Each step, in order.
    pub steps: Vec<StepResult>,
}

impl ProbeResult {
    /// Roll finished steps up into a run.
    ///
    /// The status is DERIVED, never passed in. A runner that reported a passing
    /// run containing a failed step would be believed, and this is the one place
    /// that can prevent it — so the invariant lives in a constructor rather than
    /// in a rule somebody has to remember.
    #[must_use]
    pub fn from_steps(
        journey_id: impl Into<String>,
        region: impl Into<String>,
        started_at_ms: f64,
        duration_ms: f64,
        steps: Vec<StepResult>,
    ) -> Self {
        let status = if steps.iter().any(|s| s.status == StepStatus::Fail) {
            ProbeStatus::Fail
        } else {
            ProbeStatus::Pass
        };
        Self {
            journey_id: journey_id.into(),
            started_at_ms,
            region: region.into(),
            status,
            duration_ms,
            steps,
        }
    }

    /// How many steps failed.
    #[must_use]
    pub fn failed_step_count(&self) -> usize {
        self.steps
            .iter()
            .filter(|s| s.status == StepStatus::Fail)
            .count()
    }

    /// The first failure's reason, for a summary line.
    #[must_use]
    pub fn first_failure(&self) -> Option<&StepResult> {
        self.steps.iter().find(|s| s.status == StepStatus::Fail)
    }
}

/// Whether this run should raise an alert.
///
/// Pure, and separate from the run itself, because "did it fail" and "should
/// somebody be woken" are different questions. A journey that fails constantly in
/// a known-degraded region and one that fails for the first time in production
/// produce the same [`ProbeStatus`] and warrant different responses; keeping the
/// decision here means a host can change it without touching a runner.
#[must_use]
pub fn should_alert(journey: &SyntheticJourney, result: &ProbeResult) -> bool {
    journey.alert_on_failure && result.status.is_failure()
}

/// Attributes describing a run, for whatever the host reports it through.
///
/// Lives here rather than in the exporter so that a host reporting to something
/// other than OTLP still gets the same facts under the same names.
#[must_use]
pub fn run_attributes(result: &ProbeResult) -> BTreeMap<String, String> {
    let mut attrs = BTreeMap::new();
    attrs.insert("mzizi.probe.journey".to_owned(), result.journey_id.clone());
    attrs.insert(
        "mzizi.probe.status".to_owned(),
        result.status.as_str().to_owned(),
    );
    attrs.insert("mzizi.probe.region".to_owned(), result.region.clone());
    attrs
}

// ── journey templates ──────────────────────────────────────────────────────

/// The auth journey for a mini-app.
///
/// The credentials are the `.ts`'s, unchanged, and they are placeholders for a
/// seeded probe account rather than anything that opens a real door. Kept
/// identical so the two implementations exercise the same path; a host wanting
/// real credentials substitutes them, and should not be reading them from here.
#[must_use]
pub fn auth_flow(mini_app: &str) -> SyntheticJourney {
    SyntheticJourney {
        id: format!("auth-{mini_app}"),
        name: format!("{mini_app} Auth Flow"),
        mini_app: Some(mini_app.to_owned()),
        nodes: vec![6, 4, 7],
        steps: vec![
            step(
                ProbeStepType::Navigate,
                Some("/login"),
                None,
                "Navigate to login",
            ),
            step(
                ProbeStepType::Input,
                Some("[name=email]"),
                Some("probe@nyuchi.com"),
                "Enter email",
            ),
            step(
                ProbeStepType::Input,
                Some("[name=password]"),
                Some("probe-pass"),
                "Enter password",
            ),
            step(
                ProbeStepType::Click,
                Some("[type=submit]"),
                None,
                "Submit login",
            ),
            step(
                ProbeStepType::Assert,
                Some("[data-slot=nyuchi-header]"),
                None,
                "Verify header renders",
            ),
        ],
        schedule: None,
        regions: Vec::new(),
        alert_on_failure: true,
    }
}

/// The wallet-balance journey.
#[must_use]
pub fn wallet_flow() -> SyntheticJourney {
    SyntheticJourney {
        id: "wallet-balance".to_owned(),
        name: "Wallet Balance Check".to_owned(),
        mini_app: Some("wallet".to_owned()),
        nodes: vec![6, 4, 3, 2],
        steps: vec![
            step(
                ProbeStepType::Navigate,
                Some("/wallet"),
                None,
                "Navigate to wallet",
            ),
            step(
                ProbeStepType::Assert,
                Some("[data-slot=wallet-page]"),
                None,
                "Verify wallet page renders",
            ),
            step(
                ProbeStepType::Assert,
                Some("[data-slot=kpi-card]"),
                None,
                "Verify balance card renders",
            ),
        ],
        schedule: None,
        regions: Vec::new(),
        alert_on_failure: true,
    }
}

fn step(
    step_type: ProbeStepType,
    target: Option<&str>,
    value: Option<&str>,
    description: &str,
) -> ProbeStep {
    ProbeStep {
        step_type,
        target: target.map(ToOwned::to_owned),
        value: value.map(ToOwned::to_owned),
        timeout_ms: None,
        description: description.to_owned(),
    }
}
