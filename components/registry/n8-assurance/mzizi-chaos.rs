//! Mzizi N8 assurance — chaos injection and blast-radius diagnosis.
//!
//! The Rust implementation of `mzizi-chaos`. The `.tsx` extension is misleading:
//! all but the last thirty lines of that file are pure functions, and the React
//! context around them is a thin wrapper. This is the logic half.
//!
//! # What this owns
//!
//! Whether to inject, into what, and what a set of probe results means. Not the
//! probing: the host performs the requests, because a core with no I/O is the
//! whole point of N8 being a shared core.
//!
//! # Five defects in the TypeScript, fixed here
//!
//! **1. `targetNodes` was declared and never read.** The field is documented
//! "Nodes to target (empty = all)", and nothing in the file consults it — so a
//! consumer scoping chaos to N5 got chaos in every node, having taken the
//! deliberate step of narrowing it. A configuration option that silently does
//! nothing is worse than an absent one, because it buys confidence. [`ChaosConfig::targets`]
//! is now the gate and every injection decision takes the node.
//!
//! **2. `featureFlag` was declared and never read either.** Documented as a key
//! "for remote control", with no remote control anywhere in the component. Kept as
//! [`ChaosConfig::feature_flag`] because a host genuinely can resolve a flag and
//! pass the result in, and named in the docs as what it is: an input to the host's
//! decision, not something this core acts on.
//!
//! **3. The blast-radius bands could not all be reached, and the unreachable one
//! was the calm one.** `errorCount < probes.length / 2` gives, for the default two
//! probes: 0 errors → `isolated`, 1 → `systemic`, 2 → `systemic`. `partial` is
//! unreachable, so ONE failing endpoint out of two recommended "Activate incident
//! response". A classifier whose middle band is dead and whose error is toward
//! paging is one people learn to disregard. [`classify_blast_radius`] uses the
//! fraction, with the boundaries stated.
//!
//! **4. The default endpoint list was app-specific, and it compounded defect 3.**
//! `/api/weather?lat=-17.83&lon=31.05` is hardcoded into a component anyone can
//! install. In any app that is not the weather app, that probe fails every time —
//! one failure out of two — which defect 3 then classifies as a systemic outage.
//! Installed anywhere else, this component reported a systemic outage on every
//! single diagnosis. There is no default probe set here: an empty list means
//! nothing was probed, and [`BlastRadius::Unknown`] says so.
//!
//! **5. The report was written to the console on every diagnosis.** A
//! `console.warn` with `JSON.stringify(report, null, 2)`, unconditionally, in a
//! component that "runs in production" by its own header — carrying an error
//! message that is attacker-influenced whenever user input reaches an exception.
//! This core returns the report; where it goes is the host's.
//!
//! # Randomness is supplied, as everywhere in this node
//!
//! [`should_inject_error`] takes the draw rather than making it — not for a
//! security reason, but because a core with no I/O has no entropy source, and a
//! caller that supplies the draw can test the boundary rather than the odds.

use std::collections::BTreeSet;

/// How chaos is configured.
#[derive(Debug, Clone, PartialEq)]
pub struct ChaosConfig {
    /// Whether to inject anything at all.
    pub enabled: bool,
    /// Chance of an injected error, per render.
    pub error_probability: f64,
    /// Chance of injected latency, per fetch.
    pub latency_probability: f64,
    /// The ceiling on injected latency, in milliseconds.
    pub max_latency_ms: u32,
    /// Which helix nodes to target. Empty means all.
    ///
    /// The `.ts` declares this and never reads it, so narrowing chaos to one node
    /// had no effect. Uncapped — node numbers are labels (CLAUDE.md §9).
    pub target_nodes: BTreeSet<u32>,
    /// A remote flag key the HOST resolves.
    ///
    /// This core never fetches it; a flag lookup is I/O. The host resolves the key
    /// and reflects the answer in [`ChaosConfig::enabled`]. The `.ts` reads it
    /// nowhere at all, which is not the same thing.
    pub feature_flag: Option<String>,
}

impl Default for ChaosConfig {
    /// The `.ts` defaults: off, 0.1% errors, 0.5% latency, 3s ceiling, all nodes.
    fn default() -> Self {
        Self {
            enabled: false,
            error_probability: 0.001,
            latency_probability: 0.005,
            max_latency_ms: 3000,
            target_nodes: BTreeSet::new(),
            feature_flag: None,
        }
    }
}

impl ChaosConfig {
    /// Whether this node is in scope.
    ///
    /// An empty [`ChaosConfig::target_nodes`] means every node, which is what the
    /// field's own documentation says and what the `.ts` never implemented.
    #[must_use]
    pub fn targets(&self, node: u32) -> bool {
        self.target_nodes.is_empty() || self.target_nodes.contains(&node)
    }
}

/// Whether to inject an error into a component on this node.
///
/// `draw` is a value in `[0, 1)` from the host.
#[must_use]
pub fn should_inject_error(config: &ChaosConfig, node: u32, draw: f64) -> bool {
    config.enabled && config.targets(node) && draw < config.error_probability
}

/// Whether to inject latency into a request from this node.
#[must_use]
pub fn should_inject_latency(config: &ChaosConfig, node: u32, draw: f64) -> bool {
    config.enabled && config.targets(node) && draw < config.latency_probability
}

/// How much latency to inject.
///
/// Returns 0 when chaos is disabled. The `.ts` computes a delay regardless, so a
/// caller reaching for it directly slowed a system with chaos switched off.
#[must_use]
pub fn injected_latency_ms(config: &ChaosConfig, draw: f64) -> u32 {
    if !config.enabled {
        return 0;
    }
    let clamped = draw.clamp(0.0, 1.0);
    (clamped * f64::from(config.max_latency_ms)).floor() as u32
}

/// The message an injected error carries.
///
/// The prefix is load-bearing: an injected failure that reads like a real one
/// wastes an on-call hour, and this string is what tells them apart in a log.
#[must_use]
pub fn injected_error_message(node: u32, component: &str) -> String {
    format!("[nyuchi:chaos] Injected error in Node {node} component \"{component}\"")
}

/// How a probe answered.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum ProbeStatus {
    /// Answered, and well.
    Healthy,
    /// Answered, badly.
    Degraded,
    /// Did not answer in time.
    Timeout,
    /// Did not answer.
    Error,
}

impl ProbeStatus {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Healthy => "healthy",
            Self::Degraded => "degraded",
            Self::Timeout => "timeout",
            Self::Error => "error",
        }
    }

    /// Whether this counts toward the blast radius.
    ///
    /// `degraded` does NOT, matching the `.ts`: a slow-but-answering dependency is
    /// not the same signal as an unreachable one, and folding the two together
    /// would make every busy afternoon look like an outage.
    #[must_use]
    pub const fn is_down(self) -> bool {
        matches!(self, Self::Timeout | Self::Error)
    }
}

/// What one probe found.
#[derive(Debug, Clone, PartialEq)]
pub struct ProbeResult {
    /// What was probed.
    pub target: String,
    /// How it answered.
    pub status: ProbeStatus,
    /// How long it took, in milliseconds.
    pub latency_ms: f64,
    /// What went wrong, when something did.
    pub error: Option<String>,
}

/// How far a failure reaches.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BlastRadius {
    /// Nothing else is down.
    Isolated,
    /// Some dependencies are down.
    Partial,
    /// Most or all are.
    Systemic,
    /// Nothing was probed, so nothing is known.
    ///
    /// The `.ts` has no such case: zero probes gives `errorCount === 0`, which is
    /// `isolated` — "component-level issue, retry should resolve", asserted with
    /// no evidence whatsoever.
    Unknown,
}

impl BlastRadius {
    /// The wire spelling. `unknown` has no `.ts` counterpart.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Isolated => "isolated",
            Self::Partial => "partial",
            Self::Systemic => "systemic",
            Self::Unknown => "unknown",
        }
    }

    /// What to do about it.
    #[must_use]
    pub const fn recommendation(self) -> &'static str {
        match self {
            Self::Isolated => "Component-level issue. Retry should resolve.",
            Self::Partial => "Multiple services affected. Check infrastructure.",
            Self::Systemic => "Systemic outage. Activate incident response.",
            Self::Unknown => "No dependencies were probed. Blast radius unknown.",
        }
    }
}

/// The fraction of probes that must be down, EXCLUSIVELY, for a failure to be
/// systemic. More than half, not half.
///
/// The strictness is the whole fix and it is easy to get wrong twice: `>= 0.5`
/// leaves `partial` exactly as unreachable with two probes as the `.ts`'s
/// `< length / 2` did — 0 down is isolated, 1 is systemic, 2 is systemic. This
/// author wrote `>=` first and the test caught it. With `>`, two probes reach all
/// three bands, which is what the classifier claims to offer.
pub const SYSTEMIC_FRACTION: f64 = 0.5;

/// Classify a set of probe results.
///
/// Nothing down is [`BlastRadius::Isolated`]; MORE than [`SYSTEMIC_FRACTION`] down
/// is [`BlastRadius::Systemic`]; anything between is [`BlastRadius::Partial`].
///
/// The `.ts` writes `errorCount < probes.length / 2`, which for its own default of
/// two probes makes `partial` unreachable — one failure out of two lands on
/// `systemic` and recommends activating incident response.
#[must_use]
pub fn classify_blast_radius(probes: &[ProbeResult]) -> BlastRadius {
    if probes.is_empty() {
        return BlastRadius::Unknown;
    }
    let down = probes.iter().filter(|p| p.status.is_down()).count();
    if down == 0 {
        return BlastRadius::Isolated;
    }
    if (down as f64 / probes.len() as f64) > SYSTEMIC_FRACTION {
        BlastRadius::Systemic
    } else {
        BlastRadius::Partial
    }
}

/// What a diagnosis concluded.
#[derive(Debug, Clone, PartialEq)]
pub struct DiagnosticReport {
    /// When, milliseconds since the Unix epoch.
    pub at_ms: f64,
    /// Which component failed first.
    pub trigger_component: String,
    /// What it said.
    pub trigger_error: String,
    /// What the dependencies said.
    pub probes: Vec<ProbeResult>,
    /// How far it reaches.
    pub blast_radius: BlastRadius,
    /// What to do.
    pub recommendation: String,
}

/// Turn probe results into a report.
///
/// There is no default endpoint list, deliberately. The `.ts` ships
/// `/api/weather?lat=-17.83&lon=31.05` as a default in a component anyone can
/// install, so in any app that is not the weather app that probe fails every time
/// — one failure out of two, which its classifier then calls a systemic outage.
/// Installed anywhere else, it reported a systemic outage on every diagnosis. The
/// host names what to probe; probing nothing answers [`BlastRadius::Unknown`].
///
/// The report is RETURNED, never logged. The `.ts` writes it to the console on
/// every diagnosis, in a component whose own header says it runs in production,
/// carrying an error message that is attacker-influenced whenever user input
/// reaches an exception.
#[must_use]
pub fn diagnose(
    trigger_component: impl Into<String>,
    trigger_error: impl Into<String>,
    probes: Vec<ProbeResult>,
    at_ms: f64,
) -> DiagnosticReport {
    let blast_radius = classify_blast_radius(&probes);
    DiagnosticReport {
        at_ms,
        trigger_component: trigger_component.into(),
        trigger_error: trigger_error.into(),
        probes,
        blast_radius,
        recommendation: blast_radius.recommendation().to_owned(),
    }
}
