//! Mzizi N8 assurance — what a set of service statuses adds up to.
//!
//! The Rust core behind `mzizi-platform-health`. The component is a UI surface and
//! gets a Dioxus alternative rather than an implementation (CLAUDE.md §6.2); what
//! lives here is the part that is not UI at all — the rollup from a list of
//! services to the single line at the top of the panel, and the status → label
//! mapping that has to agree across every target.
//!
//! Putting it here is what makes that agreement possible. In the `.tsx` the rollup
//! is three chained ternaries inside the render, so a Swift panel and a Dioxus
//! panel would each re-derive it, and the three would drift silently — the failure
//! being that two dashboards showing the same services disagree about whether
//! anything is wrong.
//!
//! # Three defects in the TypeScript, fixed here
//!
//! **1. An empty service list reported "All Systems Operational", in green.**
//! `services.every(…)` is `true` for an empty array, so a panel that fetched
//! nothing — the request failed, the list has not loaded, the config is wrong —
//! renders exactly like a healthy platform. This is the worst possible failure for
//! a status page: it is the one surface whose entire job is to be trusted at a
//! glance, and knowing nothing renders as knowing everything is fine.
//! [`Overall::Unknown`] is what nothing adds up to.
//!
//! **2. Planned maintenance was reported as "Issues Detected".** `allOk` is false
//! for any non-`operational` status, and the fallback branch is `degraded` — so a
//! service someone deliberately took down on a schedule turns the header amber and
//! announces a problem. Maintenance is a state the operator chose; a status page
//! that cries about it is one people stop reading.
//!
//! **3. `unknown` was folded into `degraded` too.** Same fallback branch. "We
//! could not determine this service's state" and "this service is impaired" are
//! different claims, and a status page that cannot tell them apart cannot be used
//! to decide anything. [`Overall::Unknown`] carries it separately.
//!
//! # Colours are not here, deliberately
//!
//! `STATUS_CONFIG` in the `.tsx` pairs each status with `var(--health-operational,
//! #22C55E)` and friends. The variable reference is right and the hex fallback is
//! a design value defined outside N1, which §7.4 forbids — but the fix is a token,
//! not a Rust constant. Duplicating the hex here would put the same wrong value in
//! a second place. Each target reads `--health-<status>`; this core answers which
//! status applies.

/// How one service is doing.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum ServiceStatus {
    /// Working.
    Operational,
    /// Taken down on purpose.
    Maintenance,
    /// State could not be determined.
    Unknown,
    /// Working badly.
    Degraded,
    /// Not working.
    Outage,
}

impl ServiceStatus {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Operational => "operational",
            Self::Degraded => "degraded",
            Self::Outage => "outage",
            Self::Maintenance => "maintenance",
            Self::Unknown => "unknown",
        }
    }

    /// The human label, matching the `.tsx`'s `STATUS_CONFIG`.
    #[must_use]
    pub const fn label(self) -> &'static str {
        match self {
            Self::Operational => "Operational",
            Self::Degraded => "Degraded",
            Self::Outage => "Outage",
            Self::Maintenance => "Maintenance",
            Self::Unknown => "Unknown",
        }
    }

    /// The CSS custom property a target reads for this status's colour.
    ///
    /// The property, not the value. See the module docs.
    #[must_use]
    pub const fn color_var(self) -> &'static str {
        match self {
            Self::Operational => "--health-operational",
            Self::Degraded => "--health-degraded",
            Self::Outage => "--health-outage",
            Self::Maintenance => "--health-maintenance",
            Self::Unknown => "--color-muted-foreground",
        }
    }

    /// Whether this status means something is wrong.
    ///
    /// `maintenance` is NOT a problem — it is a state an operator chose — and
    /// `unknown` is not a problem either, it is an absence of information.
    #[must_use]
    pub const fn is_problem(self) -> bool {
        matches!(self, Self::Degraded | Self::Outage)
    }
}

/// One service on the panel.
#[derive(Debug, Clone, PartialEq)]
pub struct ServiceHealth {
    /// What it is called.
    pub name: String,
    /// How it is doing.
    pub status: ServiceStatus,
    /// How fast it answered, when that was measured.
    pub latency_ms: Option<f64>,
    /// Anything worth saying about it.
    pub message: Option<String>,
}

/// What the whole panel says in one line.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Overall {
    /// Everything is working.
    Operational,
    /// Nothing is broken, but something is deliberately down.
    UnderMaintenance,
    /// Something is impaired.
    Degraded,
    /// Something is down.
    Outage,
    /// Nothing is known — no services were reported.
    ///
    /// The `.tsx` has no such case: `[].every(…)` is `true`, so an empty list
    /// renders green and says "All Systems Operational".
    Unknown,
}

impl Overall {
    /// The headline.
    #[must_use]
    pub const fn headline(self) -> &'static str {
        match self {
            Self::Operational => "All Systems Operational",
            Self::UnderMaintenance => "Planned Maintenance",
            Self::Degraded | Self::Outage => "Issues Detected",
            Self::Unknown => "Status Unavailable",
        }
    }

    /// The CSS custom property the header dot and text read.
    #[must_use]
    pub const fn color_var(self) -> &'static str {
        match self {
            Self::Operational => ServiceStatus::Operational.color_var(),
            Self::UnderMaintenance => ServiceStatus::Maintenance.color_var(),
            Self::Degraded => ServiceStatus::Degraded.color_var(),
            Self::Outage => ServiceStatus::Outage.color_var(),
            Self::Unknown => ServiceStatus::Unknown.color_var(),
        }
    }

    /// Whether this warrants somebody looking.
    #[must_use]
    pub const fn needs_attention(self) -> bool {
        matches!(self, Self::Degraded | Self::Outage)
    }
}

/// Roll a list of services up into the one line at the top of the panel.
///
/// Worst wins, with the bands ordered outage → degraded → unknown → maintenance →
/// operational. `unknown` outranks `maintenance` because an unmeasured service
/// might be down, and a scheduled one is known not to be.
#[must_use]
pub fn overall(services: &[ServiceHealth]) -> Overall {
    if services.is_empty() {
        // Nothing measured is not the same as nothing wrong. See defect 1: this
        // is the case that made a broken fetch look like a healthy platform.
        return Overall::Unknown;
    }
    if services.iter().any(|s| s.status == ServiceStatus::Outage) {
        return Overall::Outage;
    }
    if services.iter().any(|s| s.status == ServiceStatus::Degraded) {
        return Overall::Degraded;
    }
    if services.iter().any(|s| s.status == ServiceStatus::Unknown) {
        return Overall::Unknown;
    }
    if services
        .iter()
        .any(|s| s.status == ServiceStatus::Maintenance)
    {
        return Overall::UnderMaintenance;
    }
    Overall::Operational
}

/// How many services are in each state, for a summary line.
#[must_use]
pub fn tally(services: &[ServiceHealth], status: ServiceStatus) -> usize {
    services.iter().filter(|s| s.status == status).count()
}
