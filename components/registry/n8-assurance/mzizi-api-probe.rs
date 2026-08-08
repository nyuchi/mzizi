//! Mzizi N8 assurance — endpoint health classification.
//!
//! The Rust implementation of `mzizi-api-probe`.
//!
//! # What this owns
//!
//! What a response *means*: healthy, degraded, down or timed out. Not the
//! request. The `.ts` sibling's `runApiProbe` performs `fetch` with an
//! `AbortController`, which is I/O and therefore the host's — the same boundary
//! the exporter draws at sending and the probe draws at driving a browser.
//!
//! # Two defects in the TypeScript, fixed here
//!
//! **1. A timeout was detected by string-matching the error.** The `.ts` writes
//! `String(err).includes("abort")`, and the text of an abort differs by runtime:
//! *"The operation was aborted"*, *"This operation was aborted"*, *"signal is
//! aborted without reason"*. So the same timeout classifies as `timeout` in one
//! host and `down` in another — and `down` pages people while `timeout` often
//! does not. The caller always knows whether it aborted, so [`Outcome`] carries
//! the fact instead of the core guessing at prose.
//!
//! **2. The degraded threshold ignored the timeout.** 2000 ms was hardcoded while
//! the request timeout was configurable at 5000. Set the timeout below 2000 and
//! nothing can ever be `Degraded`: the request aborts before it can be slow. The
//! threshold is a parameter here, and [`degraded_threshold_for`] derives a
//! sensible one from the timeout so the two cannot contradict each other.
//!
//! # One field that never had a producer
//!
//! `EndpointStatus` declares `"unknown"` and nothing in the `.ts` ever returns
//! it. It is kept, because a host that has not yet probed an endpoint needs a way
//! to say so — and a dashboard rendering "unknown" is honest where rendering
//! "healthy" by default is not.

/// What a probe made of an endpoint.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EndpointStatus {
    /// Responded, and quickly enough.
    Healthy,
    /// Responded, but slowly.
    Degraded,
    /// Responded with a failure, or the connection failed.
    Down,
    /// Did not respond inside the allotted time.
    Timeout,
    /// Not yet probed. Never inferred — only stated.
    Unknown,
}

impl EndpointStatus {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Healthy => "healthy",
            Self::Degraded => "degraded",
            Self::Down => "down",
            Self::Timeout => "timeout",
            Self::Unknown => "unknown",
        }
    }

    /// Whether this status should worry somebody.
    #[must_use]
    pub const fn is_unhealthy(self) -> bool {
        matches!(self, Self::Degraded | Self::Down | Self::Timeout)
    }
}

/// What the host's request actually did.
///
/// An enum rather than an error string, so a timeout is a *fact the caller
/// reports* instead of something this module infers from prose it did not write.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Outcome {
    /// The request completed with an HTTP status.
    Responded {
        /// The HTTP status code.
        status_code: u16,
    },
    /// The request was aborted for exceeding its deadline.
    TimedOut,
    /// The request failed before producing a status.
    Failed {
        /// Whatever the host can say about why.
        error: String,
    },
}

/// An endpoint to probe.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Endpoint {
    /// Full URL.
    pub url: String,
    /// Which component it reports for.
    pub component_name: String,
    /// Which helix node that component belongs to.
    pub node: u32,
}

/// One probe's finding.
#[derive(Debug, Clone, PartialEq)]
pub struct EndpointCheck {
    /// Which endpoint.
    pub url: String,
    /// Which component.
    pub component_name: String,
    /// Which node.
    pub node: u32,
    /// The verdict.
    pub status: EndpointStatus,
    /// HTTP status, when there was one.
    pub status_code: Option<u16>,
    /// How long it took.
    pub latency_ms: f64,
    /// When, in milliseconds since the Unix epoch.
    pub checked_at_ms: f64,
    /// Why it failed, when it did.
    pub error: Option<String>,
}

/// A slow-but-alive threshold that cannot contradict the timeout.
///
/// Returns 40% of the timeout, floored at 250 ms. The `.ts`'s fixed 2000 ms was
/// meaningless whenever the timeout was lower, because the request aborted before
/// it could ever be classified slow — the `Degraded` state simply became
/// unreachable, silently.
#[must_use]
pub fn degraded_threshold_for(timeout_ms: f64) -> f64 {
    (timeout_ms * 0.4).max(250.0)
}

/// Classify one outcome.
///
/// A 2xx/3xx response is healthy unless it was slow; anything else is down. The
/// latency test applies only to a successful response, because a slow 500 is
/// down, not degraded — reporting it as degraded would understate an outage.
#[must_use]
pub fn classify(outcome: &Outcome, latency_ms: f64, degraded_above_ms: f64) -> EndpointStatus {
    match outcome {
        Outcome::TimedOut => EndpointStatus::Timeout,
        Outcome::Failed { .. } => EndpointStatus::Down,
        Outcome::Responded { status_code } => {
            if (200..400).contains(status_code) {
                if latency_ms > degraded_above_ms {
                    EndpointStatus::Degraded
                } else {
                    EndpointStatus::Healthy
                }
            } else {
                EndpointStatus::Down
            }
        }
    }
}

/// Build a check from an endpoint and what the host's request did.
#[must_use]
pub fn check(
    endpoint: &Endpoint,
    outcome: &Outcome,
    latency_ms: f64,
    checked_at_ms: f64,
    degraded_above_ms: f64,
) -> EndpointCheck {
    EndpointCheck {
        url: endpoint.url.clone(),
        component_name: endpoint.component_name.clone(),
        node: endpoint.node,
        status: classify(outcome, latency_ms, degraded_above_ms),
        status_code: match outcome {
            Outcome::Responded { status_code } => Some(*status_code),
            _ => None,
        },
        latency_ms,
        checked_at_ms,
        error: match outcome {
            Outcome::Failed { error } => Some(error.clone()),
            Outcome::TimedOut => Some(format!("timed out after {latency_ms:.0}ms")),
            Outcome::Responded { .. } => None,
        },
    }
}

/// The default endpoints, mirroring the `.ts`.
///
/// A starting set, not a registry. The `.ts` carries a comment saying production
/// discovers these from a `component_backlinks` view — which remains true, and is
/// the host's job because it is a database read.
#[must_use]
pub fn default_endpoints(base_url: &str) -> Vec<Endpoint> {
    let base = base_url.trim_end_matches('/');
    [
        ("nyuchi-tokens", 1),
        ("nyuchi-section", 5),
        ("nyuchi-wallet-gate", 4),
        ("wallet-page", 6),
    ]
    .into_iter()
    .map(|(name, node)| Endpoint {
        url: format!("{base}/api/health/{name}"),
        component_name: name.to_owned(),
        node,
    })
    .collect()
}

/// The worst status in a set of checks.
///
/// "Worst" rather than "most common", because one endpoint being down is an
/// outage even when nine are healthy — an average would hide exactly the case
/// worth seeing.
#[must_use]
pub fn worst_status(checks: &[EndpointCheck]) -> EndpointStatus {
    checks
        .iter()
        .map(|c| c.status)
        .max_by_key(|s| match s {
            EndpointStatus::Healthy => 0,
            EndpointStatus::Unknown => 1,
            EndpointStatus::Degraded => 2,
            EndpointStatus::Timeout => 3,
            EndpointStatus::Down => 4,
        })
        .unwrap_or(EndpointStatus::Unknown)
}
