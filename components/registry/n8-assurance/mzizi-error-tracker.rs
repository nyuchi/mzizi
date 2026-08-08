//! Mzizi N8 assurance — structured error collection, deduplication and blast radius.
//!
//! The Rust implementation of `mzizi-error-tracker`.
//!
//! # What this owns
//!
//! Classification, deduplication, eviction and auto-resolution — everything that
//! decides *what an error means* and *which errors are still live*. Not the DOM
//! walk that discovers a blast radius, not the clock, not the delivery of a
//! report; those are the host's, as everywhere else in this node.
//!
//! # Three defects in the TypeScript, addressed rather than ported
//!
//! **1. `autoResolveMinutes` was documented, defaulted, and never read.** The
//! `.ts` declares it, `Required<>` fills it with 60, and no code path consults
//! it — so every error stayed unresolved forever and "unresolved errors" grew
//! without bound as a dashboard number. A configuration option that does nothing
//! is worse than an absent one, because it is *believed*. Implemented here as
//! [`ErrorLog::auto_resolve`], which the host calls with its own clock.
//!
//! **2. Eviction sorted the entire map on every insert past the cap.** At 500
//! errors that is a full `O(n log n)` sort per tracked error — and the cap is
//! only exceeded during an error storm, so the slow path engaged at precisely the
//! worst moment. Finding the oldest entry is a single linear scan.
//!
//! **3. Undeduplicated ids collided.** With `dedup: false` the key is
//! `Date.now().toString()`, unique only if no two errors arrive in the same
//! millisecond — which an error storm violates by construction. Ids are supplied
//! here for the same reason they are in the alert engine and the exporter.
//!
//! # One thing left alone, deliberately
//!
//! [`classify_severity`] tests the error *message* for `"TypeError"`, which is
//! usually the error's `name` rather than anything in its message — so that
//! branch rarely fires and the neighbouring `"Cannot read"` test is what actually
//! catches those. It is preserved because changing it would silently reclassify
//! live errors, which is a product decision rather than a porting one. The
//! observation is recorded here instead of being quietly fixed or quietly
//! carried.

use std::collections::BTreeMap;

/// How bad an error is.
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

/// Where an error happened, as much as the host can say.
#[derive(Debug, Clone, Default)]
pub struct ErrorContext {
    /// The component's `data-slot` name.
    pub component_name: Option<String>,
    /// Which helix node it belongs to.
    pub node: Option<u32>,
    /// Which mini-app was running.
    pub mini_app: Option<String>,
    /// The path the user was on.
    pub url: Option<String>,
    /// Components in the same render tree that may be affected.
    ///
    /// Supplied, not discovered: the `.ts` finds these by walking
    /// `document.querySelectorAll("[data-slot]")`, and a Worker or native shell
    /// has no document.
    pub blast_radius: Vec<String>,
}

/// One deduplicated error, with its recurrence history.
///
/// `PartialEq` but not `Eq`: the timestamps are `f64`, and floats have no total
/// equality. Deriving `Eq` here would be claiming a property the type does not
/// have.
#[derive(Debug, Clone, PartialEq)]
pub struct TrackedError {
    /// Dedup key or supplied id.
    pub id: String,
    /// The error message.
    pub message: String,
    /// Stack trace, when the host captured one.
    pub stack: Option<String>,
    /// The component blamed.
    pub component_name: Option<String>,
    /// Which helix node.
    pub node: Option<u32>,
    /// Which mini-app.
    pub mini_app: Option<String>,
    /// The path the user was on.
    pub url: String,
    /// How many times this has been seen.
    pub count: u32,
    /// First occurrence, milliseconds since the Unix epoch.
    pub first_seen_ms: f64,
    /// Most recent occurrence.
    pub last_seen_ms: f64,
    /// Components that may be affected.
    pub blast_radius: Vec<String>,
    /// How bad.
    pub severity: Severity,
    /// Whether it is considered settled.
    pub resolved: bool,
}

/// Classify an error's severity.
///
/// Pure, and ordered so the strongest signal wins: a broken token or safety node
/// is critical regardless of anything else, because N1 and N4 are core
/// guarantees — if design values or safety gates fail, everything downstream is
/// already wrong.
#[must_use]
pub fn classify_severity(message: &str, node: Option<u32>, blast_radius: usize) -> Severity {
    // N1 tokens and N4 safety are core guarantees. Their failure is never minor.
    if node == Some(1) || node == Some(4) {
        return Severity::Critical;
    }
    // N7 is the shell: the product stops holding together.
    if node == Some(7) {
        return Severity::High;
    }
    if blast_radius > 10 {
        return Severity::High;
    }
    if message.contains("TypeError") || message.contains("Cannot read") {
        return Severity::Medium;
    }
    Severity::Low
}

/// Configuration for a log.
#[derive(Debug, Clone)]
pub struct ErrorLogConfig {
    /// How many distinct errors to retain.
    pub max_errors: usize,
    /// Whether to group recurrences of the same message + component.
    pub dedup: bool,
    /// Minutes without recurrence after which an error auto-resolves.
    ///
    /// Actually consulted here — see the module docs for why that is worth
    /// saying out loud.
    pub auto_resolve_minutes: f64,
}

impl Default for ErrorLogConfig {
    fn default() -> Self {
        Self {
            max_errors: 500,
            dedup: true,
            auto_resolve_minutes: 60.0,
        }
    }
}

/// What tracking an error did.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Tracked {
    /// A new distinct error was recorded.
    New,
    /// An existing error recurred; its count went up.
    Recurrence,
}

/// The set of errors a host is holding.
#[derive(Debug, Clone, Default)]
pub struct ErrorLog {
    config: ErrorLogConfig,
    errors: BTreeMap<String, TrackedError>,
}

impl ErrorLog {
    /// A log with the given configuration.
    #[must_use]
    pub fn new(config: ErrorLogConfig) -> Self {
        Self {
            config,
            errors: BTreeMap::new(),
        }
    }

    /// The dedup key for a message and component.
    ///
    /// When dedup is off the caller's `id` is used instead — the `.ts` reaches
    /// for `Date.now()` there, which collides during exactly the error storms
    /// that make dedup worth turning off.
    #[must_use]
    pub fn dedup_key(message: &str, component_name: Option<&str>) -> String {
        format!("{message}:{}", component_name.unwrap_or("unknown"))
    }

    /// Record an occurrence.
    ///
    /// `id` is used only when dedup is off. `now_ms` is supplied because a core
    /// has no clock.
    pub fn track(
        &mut self,
        message: impl Into<String>,
        stack: Option<String>,
        context: &ErrorContext,
        id: impl Into<String>,
        now_ms: f64,
    ) -> (Tracked, &TrackedError) {
        let message = message.into();
        let key = if self.config.dedup {
            Self::dedup_key(&message, context.component_name.as_deref())
        } else {
            id.into()
        };

        let severity = classify_severity(&message, context.node, context.blast_radius.len());

        // The mutation and the returned reference are separated deliberately.
        // Returning `&TrackedError` out of both branches of a `&mut self` method
        // needs borrow-checker support Rust does not have yet (polonius), so the
        // borrow is taken once, at the end, after every mutation is finished.
        let outcome = if let Some(existing) = self.errors.get_mut(&key) {
            existing.count += 1;
            existing.last_seen_ms = now_ms;
            // A recurrence un-resolves: an error that came back was not settled.
            existing.resolved = false;
            existing.severity = severity;
            Tracked::Recurrence
        } else {
            self.errors.insert(
                key.clone(),
                TrackedError {
                    id: key.clone(),
                    message,
                    stack,
                    component_name: context.component_name.clone(),
                    node: context.node,
                    mini_app: context.mini_app.clone(),
                    url: context.url.clone().unwrap_or_default(),
                    count: 1,
                    first_seen_ms: now_ms,
                    last_seen_ms: now_ms,
                    blast_radius: context.blast_radius.clone(),
                    severity,
                    resolved: false,
                },
            );
            self.evict_if_over_cap(&key);
            Tracked::New
        };

        (
            outcome,
            self.errors
                .get(&key)
                .expect("just tracked, and eviction never removes the new key"),
        )
    }

    /// Drop the least recently seen error when over the cap.
    ///
    /// A single linear scan rather than sorting the whole map. The `.ts` sorts on
    /// every insert past the cap, which means the expensive path runs during an
    /// error storm — the one moment the tracker should be cheapest.
    ///
    /// The just-inserted key is never the victim, even if the cap is 1: evicting
    /// what you were asked to record is not eviction, it is a silent drop.
    fn evict_if_over_cap(&mut self, keep: &str) {
        if self.errors.len() <= self.config.max_errors {
            return;
        }
        let oldest = self
            .errors
            .iter()
            .filter(|(k, _)| k.as_str() != keep)
            .min_by(|a, b| {
                a.1.last_seen_ms
                    .partial_cmp(&b.1.last_seen_ms)
                    .unwrap_or(std::cmp::Ordering::Equal)
            })
            .map(|(k, _)| k.clone());
        if let Some(key) = oldest {
            self.errors.remove(&key);
        }
    }

    /// Resolve everything untouched for longer than the configured window.
    ///
    /// Returns how many were resolved. This is the option the `.ts` declared and
    /// never implemented.
    pub fn auto_resolve(&mut self, now_ms: f64) -> usize {
        let window_ms = self.config.auto_resolve_minutes * 60_000.0;
        let mut resolved = 0;
        for error in self.errors.values_mut() {
            if !error.resolved && now_ms - error.last_seen_ms >= window_ms {
                error.resolved = true;
                resolved += 1;
            }
        }
        resolved
    }

    /// Mark one error resolved. Returns false if the id is unknown.
    pub fn resolve(&mut self, id: &str) -> bool {
        match self.errors.get_mut(id) {
            Some(error) => {
                error.resolved = true;
                true
            }
            None => false,
        }
    }

    /// Every error held.
    #[must_use]
    pub fn all(&self) -> Vec<&TrackedError> {
        self.errors.values().collect()
    }

    /// Every error not yet resolved.
    #[must_use]
    pub fn unresolved(&self) -> Vec<&TrackedError> {
        self.errors.values().filter(|e| !e.resolved).collect()
    }

    /// How many distinct errors are held.
    #[must_use]
    pub fn len(&self) -> usize {
        self.errors.len()
    }

    /// Whether the log is empty.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.errors.is_empty()
    }

    /// Forget everything.
    pub fn clear(&mut self) {
        self.errors.clear();
    }
}
