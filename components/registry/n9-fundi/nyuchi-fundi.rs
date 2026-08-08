//! Mzizi N9 fundi — the healing decision engine.
//!
//! The Rust implementation of `nyuchi-fundi`. N8 assurance observes and finds
//! problems; N9 receives those observations and decides what to do. Two rungs,
//! one loop, and this is the hinge between them.
//!
//! # What this owns
//!
//! The decision: diagnostic in, plan out. Not the execution — a remediation
//! action clears a cache, opens a circuit or pages somebody, all of which is I/O
//! and all of which differs per host. [`plan_outcome`] folds the results the host
//! reports back.
//!
//! # Six defects in the TypeScript, fixed here
//!
//! **1. "Requires human approval" did not stop anything.** `FundiProvider`
//! defaults `autoHeal = true`, and the gate reads `if (plan.requiresHumanApproval
//! && !autoHeal)` — so the flag meaning "a person must look at this" is overridden
//! by a convenience flag that is on unless somebody turns it off. A systemic-outage
//! plan disables non-critical features automatically while declaring that it should
//! not. [`HealingPlan::approval`] is a state a host must clear, not a boolean it can
//! out-vote, and [`HealingPlan::may_execute`] is the only thing that answers.
//!
//! **2. "Never auto-fix auth" was skipped exactly when it mattered most.** The
//! `errorType === "auth"` branch sits inside the `else` that handles ISOLATED
//! failures. A partial or systemic auth failure never reaches it — it gets
//! `degrade-feature` and `reroute` instead. The one rule the file states as
//! inviolable applied only to the narrowest case. Auth is checked first here,
//! before the blast radius is consulted at all.
//!
//! **3. Chain and crypto failures had the same hole.** Same `else`, same
//! consequence: a systemic chain failure is rerouted rather than falling back to
//! the Web2 path.
//!
//! **4. Nothing handled "we could not determine the blast radius".** The union is
//! `isolated | partial | systemic`, so an unknown radius has no representation and
//! the `else` treats it as isolated — the calmest response, chosen when the least
//! is known. `mzizi-chaos` now answers `unknown` when nothing was probed, and the
//! two halves of one loop have to share a vocabulary. [`BlastRadius::Unknown`]
//! requires approval and escalates.
//!
//! **5. The reroute target depended on probe ordering.** `healthyNodes[0]` takes
//! whichever healthy probe happened to come back first, so two runs over the same
//! set can reroute to different targets and neither is reproducible. Sorted by
//! name.
//!
//! **6. The plan id was generated inside the engine**, from `Date.now()` plus six
//! random base-36 characters. Better than the clock alone, and still an I/O
//! decision made by a core that has neither a clock nor entropy. Host-supplied.
//!
//! # One thing recorded rather than changed
//!
//! `confidence` is set to 0.8, 0.6 or 0.7 by branch and **nothing reads it** — not
//! the approval decision, not the executor, not the log. It is preserved because a
//! host may well surface it, and named here as what it is: a number no code acts
//! on. If it is to gate anything, that is a decision to make deliberately rather
//! than by wiring up a value whose scale nobody has defined.

use std::collections::BTreeMap;

/// How far a failure reaches.
///
/// Mirrors `mzizi-chaos`'s [`BlastRadius`](../mzizi_chaos/enum.BlastRadius.html)
/// including its `Unknown`, because the producer and the consumer of a diagnostic
/// have to share one vocabulary. Mirrored rather than imported: a registry
/// component must be installable on its own (CLAUDE.md §15.6).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BlastRadius {
    /// Nothing else is down.
    Isolated,
    /// Some dependencies are down.
    Partial,
    /// Most or all are.
    Systemic,
    /// Nothing was probed, so nothing is known.
    Unknown,
}

impl BlastRadius {
    /// The wire spelling.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Isolated => "isolated",
            Self::Partial => "partial",
            Self::Systemic => "systemic",
            Self::Unknown => "unknown",
        }
    }
}

/// What kind of failure.
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
        }
    }

    /// Whether fundi is forbidden from acting on this by itself.
    ///
    /// Auth, and only auth. The `.ts` states the rule — "never auto-fix auth" —
    /// and then only reaches it on an isolated failure.
    #[must_use]
    pub const fn is_never_auto_fixed(self) -> bool {
        matches!(self, Self::Auth)
    }
}

/// How severe an escalation is.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum EscalationSeverity {
    /// Worth knowing.
    Low,
    /// Worth looking at.
    Medium,
    /// Worth waking somebody.
    High,
    /// Worth waking everybody.
    Critical,
}

impl EscalationSeverity {
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
}

/// How far a feature is degraded.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DegradeLevel {
    /// Reduced.
    Partial,
    /// Static content only.
    Static,
    /// Off.
    Disabled,
}

impl DegradeLevel {
    /// The wire spelling.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Partial => "partial",
            Self::Static => "static",
            Self::Disabled => "disabled",
        }
    }
}

/// What a cache clear covers.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CacheScope {
    /// This client.
    Local,
    /// The edge.
    Edge,
    /// Everything.
    All,
}

impl CacheScope {
    /// The wire spelling.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Local => "local",
            Self::Edge => "edge",
            Self::All => "all",
        }
    }
}

/// One thing to do about a failure.
#[derive(Debug, Clone, PartialEq)]
pub enum RemediationAction {
    /// Stop calling a service for a while.
    CircuitBreak {
        /// Which service.
        service: String,
        /// For how long.
        duration_ms: u32,
    },
    /// Move traffic from one path to another.
    FallbackSwitch {
        /// The failing path.
        from: String,
        /// The path to use instead.
        to: String,
    },
    /// Throw a cache away.
    CacheClear {
        /// How much of it.
        scope: CacheScope,
    },
    /// Send work to a different node.
    Reroute {
        /// Where it was going.
        from_node: String,
        /// Where it goes now.
        to_node: String,
    },
    /// Try again, more slowly each time.
    RetryWithBackoff {
        /// Which service.
        service: String,
        /// How many attempts.
        max_retries: u32,
    },
    /// Turn a feature down.
    DegradeFeature {
        /// Which feature.
        feature: String,
        /// How far.
        level: DegradeLevel,
    },
    /// Ask for more or less of something.
    ScaleRequest {
        /// Which way.
        up: bool,
        /// What.
        resource: String,
    },
    /// Tell a person.
    Escalate {
        /// How loudly.
        severity: EscalationSeverity,
        /// What to say.
        message: String,
    },
}

impl RemediationAction {
    /// The action's `type` tag, matching the `.ts` discriminant.
    #[must_use]
    pub const fn type_str(&self) -> &'static str {
        match self {
            Self::CircuitBreak { .. } => "circuit-break",
            Self::FallbackSwitch { .. } => "fallback-switch",
            Self::CacheClear { .. } => "cache-clear",
            Self::Reroute { .. } => "reroute",
            Self::RetryWithBackoff { .. } => "retry-with-backoff",
            Self::DegradeFeature { .. } => "degrade-feature",
            Self::ScaleRequest { .. } => "scale-request",
            Self::Escalate { .. } => "escalate",
        }
    }

    /// Whether this action only informs, changing nothing about the system.
    ///
    /// Load-bearing for [`HealingPlan::may_execute`]: a plan awaiting approval may
    /// still page somebody, because holding the page until a human notices defeats
    /// the point of paging.
    #[must_use]
    pub const fn is_notification_only(&self) -> bool {
        matches!(self, Self::Escalate { .. })
    }
}

/// How a probe answered.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProbeStatus {
    /// Answered, and well.
    Healthy,
    /// Answered, badly.
    Degraded,
    /// Did not answer.
    Error,
    /// Did not answer in time.
    Timeout,
}

impl ProbeStatus {
    /// The wire spelling.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Healthy => "healthy",
            Self::Degraded => "degraded",
            Self::Error => "error",
            Self::Timeout => "timeout",
        }
    }
}

/// One dependency's answer.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProbeSummary {
    /// What was probed.
    pub target: String,
    /// How it answered.
    pub status: ProbeStatus,
}

/// What N8 observed.
#[derive(Debug, Clone, PartialEq)]
pub struct DiagnosticInput {
    /// How far it reaches.
    pub blast_radius: BlastRadius,
    /// Which component failed.
    pub failed_component: String,
    /// Which helix node it belongs to. Uncapped.
    pub failed_node: u32,
    /// What kind of failure.
    pub error_type: ErrorType,
    /// How many times.
    pub error_count: u32,
    /// How long since the first one, in milliseconds.
    pub time_since_first_error_ms: f64,
    /// What the dependencies said.
    pub probe_results: Vec<ProbeSummary>,
}

/// Whether a person has to look at this before it runs.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Approval {
    /// fundi may act.
    NotRequired,
    /// A person must clear it first.
    ///
    /// This is a STATE, not advice. The `.ts` makes it a boolean that
    /// `autoHeal` — default true — overrides, so a plan declaring that it needs a
    /// human executed anyway.
    Required,
    /// A person cleared it.
    Granted,
}

/// The number of errors, within the window, that trips a circuit break.
pub const REPEAT_ERROR_THRESHOLD: u32 = 3;
/// The window that count is measured over, in milliseconds.
pub const REPEAT_ERROR_WINDOW_MS: f64 = 60_000.0;

/// What fundi decided to do.
#[derive(Debug, Clone, PartialEq)]
pub struct HealingPlan {
    /// Supplied by the host, not derived from a clock. See defect 6.
    pub id: String,
    /// When, milliseconds since the Unix epoch.
    pub at_ms: f64,
    /// What it was reacting to.
    pub diagnostic: DiagnosticInput,
    /// What to do, in order.
    pub actions: Vec<RemediationAction>,
    /// A number nothing acts on. See the module docs.
    pub confidence: f64,
    /// Why, in words.
    pub reasoning: String,
    /// Whether a person has to clear it.
    pub approval: Approval,
}

impl HealingPlan {
    /// The actions a host may run right now.
    ///
    /// A plan awaiting approval yields only its notifications — escalating is how
    /// the human who must approve it finds out there is something to approve, so
    /// withholding that would deadlock the gate it enforces. Everything that
    /// changes the system waits.
    #[must_use]
    pub fn may_execute(&self) -> Vec<&RemediationAction> {
        match self.approval {
            Approval::NotRequired | Approval::Granted => self.actions.iter().collect(),
            Approval::Required => self
                .actions
                .iter()
                .filter(|a| a.is_notification_only())
                .collect(),
        }
    }

    /// Whether anything is being held back.
    #[must_use]
    pub fn is_held(&self) -> bool {
        self.approval == Approval::Required
            && self.actions.iter().any(|a| !a.is_notification_only())
    }

    /// Record that a person cleared it.
    pub fn grant_approval(&mut self) {
        if self.approval == Approval::Required {
            self.approval = Approval::Granted;
        }
    }
}

/// Decide what to do about a failure.
///
/// The order is deliberate and differs from the `.ts`: the never-auto-fix rule is
/// consulted BEFORE the blast radius, because in the `.ts` the auth branch lives
/// inside the isolated-failure `else` and is therefore skipped for exactly the
/// partial and systemic auth failures it most needs to catch.
#[must_use]
pub fn create_healing_plan(
    id: impl Into<String>,
    input: DiagnosticInput,
    at_ms: f64,
) -> HealingPlan {
    let mut actions = Vec::new();
    let mut reasoning = String::new();
    let mut confidence = 0.8;
    let mut approval = Approval::NotRequired;

    // Rule 1: repeated failures trip the breaker, whatever else is true.
    if input.error_count > REPEAT_ERROR_THRESHOLD
        && input.time_since_first_error_ms < REPEAT_ERROR_WINDOW_MS
    {
        actions.push(RemediationAction::CircuitBreak {
            service: input.failed_component.clone(),
            duration_ms: 30_000,
        });
        reasoning.push_str("Repeated failures detected — circuit-breaking to prevent cascade. ");
    }

    // Rule 2: auth is never fixed automatically, at ANY blast radius.
    if input.error_type.is_never_auto_fixed() {
        actions.push(RemediationAction::Escalate {
            severity: match input.blast_radius {
                BlastRadius::Systemic => EscalationSeverity::Critical,
                _ => EscalationSeverity::High,
            },
            message: format!(
                "Auth failure in {} on N{} ({} blast radius)",
                input.failed_component,
                input.failed_node,
                input.blast_radius.as_str()
            ),
        });
        reasoning.push_str("Auth error — escalating (never auto-fix auth). ");
        return HealingPlan {
            id: id.into(),
            at_ms,
            diagnostic: input,
            actions,
            confidence,
            reasoning: reasoning.trim().to_owned(),
            approval: Approval::Required,
        };
    }

    // Rule 3: chain and crypto fall back to the Web2 path, at any blast radius.
    // The .ts reaches this only on an isolated failure.
    if matches!(input.error_type, ErrorType::Chain | ErrorType::Crypto) {
        actions.push(RemediationAction::FallbackSwitch {
            from: "web3".to_owned(),
            to: "web2".to_owned(),
        });
        actions.push(RemediationAction::DegradeFeature {
            feature: input.failed_component.clone(),
            level: DegradeLevel::Partial,
        });
        reasoning.push_str("Chain/crypto failure — falling back to Web2 path. ");
        confidence = 0.7;
    }

    match input.blast_radius {
        BlastRadius::Systemic => {
            actions.push(RemediationAction::DegradeFeature {
                feature: "non-critical".to_owned(),
                level: DegradeLevel::Disabled,
            });
            actions.push(RemediationAction::Escalate {
                severity: EscalationSeverity::Critical,
                message: format!(
                    "Systemic failure: {} on N{}. {} errors in {}s.",
                    input.failed_component,
                    input.failed_node,
                    input.error_count,
                    (input.time_since_first_error_ms / 1000.0).round()
                ),
            });
            confidence = 0.6;
            reasoning
                .push_str("Systemic outage — disabling non-critical features, escalating to ops. ");
            approval = Approval::Required;
        }
        BlastRadius::Partial => {
            // Sorted, so two runs over the same probe set choose the same target.
            // `healthyNodes[0]` in the .ts takes whichever probe came back first.
            let mut healthy: Vec<&str> = input
                .probe_results
                .iter()
                .filter(|p| p.status == ProbeStatus::Healthy)
                .map(|p| p.target.as_str())
                .collect();
            healthy.sort_unstable();
            if let Some(target) = healthy.first() {
                actions.push(RemediationAction::Reroute {
                    from_node: input.failed_component.clone(),
                    to_node: (*target).to_owned(),
                });
                reasoning.push_str(&format!(
                    "Partial failure — rerouting to healthy node: {target}. "
                ));
            }
            actions.push(RemediationAction::DegradeFeature {
                feature: input.failed_component.clone(),
                level: DegradeLevel::Partial,
            });
            reasoning.push_str("Degrading affected feature to partial mode. ");
        }
        BlastRadius::Unknown => {
            // Nothing was probed. The .ts has no representation for this, so its
            // `else` treats it as isolated — the calmest response, chosen at the
            // moment the least is known.
            actions.push(RemediationAction::Escalate {
                severity: EscalationSeverity::Medium,
                message: format!(
                    "Blast radius unknown for {} on N{} — no dependencies were probed.",
                    input.failed_component, input.failed_node
                ),
            });
            confidence = 0.3;
            reasoning.push_str(
                "Blast radius unknown — no dependency was probed, so no remediation is \
                 chosen on the strength of it. ",
            );
            approval = Approval::Required;
        }
        BlastRadius::Isolated => match input.error_type {
            ErrorType::Network | ErrorType::Timeout => {
                actions.push(RemediationAction::RetryWithBackoff {
                    service: input.failed_component.clone(),
                    max_retries: 3,
                });
                actions.push(RemediationAction::FallbackSwitch {
                    from: "cloud".to_owned(),
                    to: "edge".to_owned(),
                });
                reasoning.push_str(
                    "Isolated network issue — retrying with backoff, switching to edge. ",
                );
            }
            ErrorType::Data | ErrorType::Render => {
                actions.push(RemediationAction::CacheClear {
                    scope: CacheScope::Local,
                });
                actions.push(RemediationAction::RetryWithBackoff {
                    service: input.failed_component.clone(),
                    max_retries: 2,
                });
                reasoning
                    .push_str("Isolated data/render error — clearing local cache and retrying. ");
            }
            // Chain and crypto were handled above, at any radius; auth returned.
            ErrorType::Chain | ErrorType::Crypto | ErrorType::Auth => {}
        },
    }

    HealingPlan {
        id: id.into(),
        at_ms,
        diagnostic: input,
        actions,
        confidence,
        reasoning: reasoning.trim().to_owned(),
        approval,
    }
}

/// What happened when the host ran one action.
#[derive(Debug, Clone, PartialEq)]
pub struct ActionOutcome {
    /// Which action.
    pub action: RemediationAction,
    /// Whether it worked.
    pub success: bool,
    /// What went wrong, when something did.
    pub error: Option<String>,
}

/// What happened to a whole plan.
#[derive(Debug, Clone, PartialEq)]
pub struct HealingResult {
    /// Which plan.
    pub plan_id: String,
    /// How many actions succeeded.
    pub actions_executed: usize,
    /// How many did not.
    pub actions_failed: usize,
    /// How many were never attempted, because approval was pending.
    ///
    /// The `.ts` has no such count: an unapproved plan either ran in full or
    /// returned `null`, so "held" and "never happened" were indistinguishable
    /// afterwards.
    pub actions_held: usize,
    /// One entry per action attempted.
    pub outcomes: Vec<ActionOutcome>,
    /// When, milliseconds since the Unix epoch.
    pub at_ms: f64,
}

/// Fold what the host reported back into a result.
///
/// The core does not execute — clearing a cache, opening a circuit and paging
/// somebody are all I/O — so the host runs [`HealingPlan::may_execute`] and hands
/// the outcomes here.
#[must_use]
pub fn plan_outcome(plan: &HealingPlan, outcomes: Vec<ActionOutcome>, at_ms: f64) -> HealingResult {
    let executed = outcomes.iter().filter(|o| o.success).count();
    let failed = outcomes.len() - executed;
    HealingResult {
        plan_id: plan.id.clone(),
        actions_executed: executed,
        actions_failed: failed,
        actions_held: plan.actions.len().saturating_sub(outcomes.len()),
        outcomes,
        at_ms,
    }
}

/// How many of each action type a plan carries, for a summary line.
#[must_use]
pub fn action_tally(plan: &HealingPlan) -> BTreeMap<&'static str, usize> {
    let mut tally = BTreeMap::new();
    for action in &plan.actions {
        *tally.entry(action.type_str()).or_insert(0) += 1;
    }
    tally
}
