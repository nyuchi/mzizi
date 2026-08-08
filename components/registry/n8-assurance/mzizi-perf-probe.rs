//! Mzizi N8 assurance — Web Vitals rating and per-component performance.
//!
//! The Rust implementation of `mzizi-perf-probe`. The thresholds, the ratings, the
//! CLS fold and the report; not `PerformanceObserver`, not `performance.memory`,
//! not the sampling draw.
//!
//! # Four defects in the TypeScript, fixed here
//!
//! **1. An unknown metric was rated `good`.** `rateMetric` looks the name up in a
//! `Record<string, …>` and returns `"good"` when the lookup misses — so a typo, a
//! metric added ahead of its threshold, or anything the table does not know about
//! reports as healthy. This is the fail-open shape CLAUDE.md §14 forbids for
//! entitlement, and it is no better here: "we have no threshold for this" must not
//! resolve to "this is fine". [`Vital`] is a closed enum and [`rate`] matches it
//! totally, so the case cannot arise; [`Rating::Unrated`] exists for a host that
//! measured something this core has no threshold for.
//!
//! **2. Per-component metrics were three literal zeros.** `renderTimeMs: 0,
//! rerenderCount: 0, mountTimeMs: 0` for every component on the page — and
//! `usePerfMark` writes `performance.mark` entries that nothing ever reads, since
//! `performance.measure` is never called and the marks are never collected. So the
//! component half of the probe measures nothing and reports zeros as though it
//! had. A table showing every component rendering in 0ms is not an empty dashboard,
//! it is a dashboard saying everything is perfect. Every measurement here is an
//! [`Option`], and [`ComponentPerf::from_marks`] is the only thing that fills one.
//!
//! **3. `totalRenderTimeMs` was `performance.now()`** — milliseconds since the
//! page started, read inside a `setTimeout(…, 5000)`. So it was the age of the
//! page, never below 5000, and had nothing to do with rendering. Here it is the
//! sum of what was actually measured, and [`None`] when nothing was.
//!
//! **4. CLS was recorded once per observer batch.** `recordMetric("CLS", clsValue)`
//! fires inside the observer callback, so `vitals` accumulates one CLS entry per
//! batch, each carrying the running cumulative total, and `onMetric` fires
//! repeatedly for one metric. Anyone averaging that array gets a number that means
//! nothing. CLS is cumulative by definition — [`VitalsAccumulator`] folds it and
//! keeps ONE value.
//!
//! # Preserved
//!
//! `memoryUsageMB` stays optional and absent rather than zero. `performance.memory`
//! is Chromium-only, and the `.ts` had already been fixed to stop dividing
//! `undefined` by 1048576 and reporting **NaN** on every other browser — a
//! number-shaped value that poisons any average computed from it. Same rule, same
//! reason: absent is the honest answer.

use std::collections::BTreeMap;

/// A Web Vital this core can rate.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Vital {
    /// Largest Contentful Paint, milliseconds.
    Lcp,
    /// First Input Delay, milliseconds.
    Fid,
    /// Cumulative Layout Shift, unitless.
    Cls,
    /// Interaction to Next Paint, milliseconds.
    Inp,
    /// Time To First Byte, milliseconds.
    Ttfb,
    /// First Contentful Paint, milliseconds.
    Fcp,
}

impl Vital {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Lcp => "LCP",
            Self::Fid => "FID",
            Self::Cls => "CLS",
            Self::Inp => "INP",
            Self::Ttfb => "TTFB",
            Self::Fcp => "FCP",
        }
    }

    /// Parse a wire spelling.
    ///
    /// Returns [`None`] for anything unknown, which the caller must handle — the
    /// `.ts` resolves the same situation to a `good` rating. See defect 1.
    ///
    /// Deliberately not `FromStr`: that trait's `Err` would have to name a type,
    /// and "this is not a vital I have a threshold for" is an absence rather than
    /// an error.
    #[must_use]
    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "LCP" => Some(Self::Lcp),
            "FID" => Some(Self::Fid),
            "CLS" => Some(Self::Cls),
            "INP" => Some(Self::Inp),
            "TTFB" => Some(Self::Ttfb),
            "FCP" => Some(Self::Fcp),
            _ => None,
        }
    }

    /// The `good` ceiling and the `poor` floor, from web.dev.
    #[must_use]
    pub const fn thresholds(self) -> (f64, f64) {
        match self {
            Self::Lcp => (2500.0, 4000.0),
            Self::Fid => (100.0, 300.0),
            Self::Cls => (0.1, 0.25),
            Self::Inp => (200.0, 500.0),
            Self::Ttfb => (800.0, 1800.0),
            Self::Fcp => (1800.0, 3000.0),
        }
    }

    /// Whether this vital accumulates across the page's life.
    ///
    /// Only CLS does, and that is why it needs folding rather than appending.
    #[must_use]
    pub const fn is_cumulative(self) -> bool {
        matches!(self, Self::Cls)
    }

    /// Every vital this core rates.
    #[must_use]
    pub const fn all() -> [Self; 6] {
        [
            Self::Lcp,
            Self::Fid,
            Self::Cls,
            Self::Inp,
            Self::Ttfb,
            Self::Fcp,
        ]
    }
}

/// How a measurement scores against its thresholds.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Rating {
    /// Within the good ceiling.
    Good,
    /// Between the two.
    NeedsImprovement,
    /// At or beyond the poor floor.
    Poor,
    /// Measured, but this core has no threshold for it.
    ///
    /// Deliberately NOT `Good`. The `.ts` returns `"good"` on a threshold miss,
    /// so an unrecognised metric reports as healthy.
    Unrated,
}

impl Rating {
    /// The wire spelling. `unrated` has no `.ts` counterpart, because the `.ts`
    /// has no way to express it.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Good => "good",
            Self::NeedsImprovement => "needs-improvement",
            Self::Poor => "poor",
            Self::Unrated => "unrated",
        }
    }
}

/// Rate a measurement against its vital's thresholds.
///
/// The boundaries match the `.ts`: `<= good` is good, `>= poor` is poor, and the
/// band between them is `needs-improvement`.
#[must_use]
pub fn rate(vital: Vital, value: f64) -> Rating {
    let (good, poor) = vital.thresholds();
    if value.is_nan() {
        // A NaN compares false against everything, so every branch below would
        // fall through to `needs-improvement` — a rating invented from a
        // non-measurement.
        return Rating::Unrated;
    }
    if value <= good {
        Rating::Good
    } else if value >= poor {
        Rating::Poor
    } else {
        Rating::NeedsImprovement
    }
}

/// One rated measurement.
#[derive(Debug, Clone, PartialEq)]
pub struct VitalsMetric {
    /// Which vital.
    pub vital: Vital,
    /// The measurement.
    pub value: f64,
    /// How it scores.
    pub rating: Rating,
    /// The PATH, never a full URL — a query string carries session tokens and
    /// search terms, and this probe collects no PII.
    pub url: String,
    /// When, milliseconds since the Unix epoch.
    pub at_ms: f64,
}

/// The vitals seen so far on one page.
///
/// Cumulative vitals are FOLDED, not appended. The `.ts` pushes a fresh CLS entry
/// on every `layout-shift` batch, each holding the running total, so a page with
/// twelve shift batches reports twelve CLS metrics.
#[derive(Debug, Clone, Default)]
pub struct VitalsAccumulator {
    metrics: BTreeMap<Vital, VitalsMetric>,
}

impl VitalsAccumulator {
    /// An empty accumulator.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Record a measurement, returning the value now held for that vital.
    ///
    /// A cumulative vital replaces its previous value — that value already
    /// includes everything before it. A non-cumulative one also replaces, which
    /// matches the browser: LCP is reported repeatedly and the last is the answer.
    pub fn record(&mut self, vital: Vital, value: f64, url: &str, at_ms: f64) -> &VitalsMetric {
        self.metrics.insert(
            vital,
            VitalsMetric {
                vital,
                value,
                rating: rate(vital, value),
                url: url.to_owned(),
                at_ms,
            },
        );
        &self.metrics[&vital]
    }

    /// What is held for one vital.
    #[must_use]
    pub fn get(&self, vital: Vital) -> Option<&VitalsMetric> {
        self.metrics.get(&vital)
    }

    /// Every vital held, one entry each.
    #[must_use]
    pub fn metrics(&self) -> Vec<&VitalsMetric> {
        self.metrics.values().collect()
    }

    /// The worst rating present — the one-glance answer.
    ///
    /// [`Rating::Unrated`] does not win: it is an absence of judgement, not a bad
    /// one, and letting it outrank `Poor` would hide a real failure behind an
    /// unknown metric.
    #[must_use]
    pub fn worst_rating(&self) -> Option<Rating> {
        self.metrics
            .values()
            .map(|m| m.rating)
            .filter(|r| *r != Rating::Unrated)
            .max()
    }
}

/// A `performance.mark` pair for one component.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct MarkPair {
    /// When the component mounted, milliseconds on the performance timeline.
    pub mount_ms: f64,
    /// When it unmounted, if it has.
    pub unmount_ms: Option<f64>,
}

/// What a component actually cost.
///
/// Every measurement is optional, because the honest answer to "how long did this
/// take" is frequently "nobody measured". The `.ts` answers `0`.
#[derive(Debug, Clone, PartialEq)]
pub struct ComponentPerf {
    /// The `data-slot` value.
    pub component_name: String,
    /// Which helix node. Uncapped.
    pub node: Option<u32>,
    /// Where its documentation is.
    pub portal_url: Option<String>,
    /// How long it was mounted for.
    pub mount_duration_ms: Option<f64>,
    /// How long its render took.
    pub render_time_ms: Option<f64>,
    /// How many times it re-rendered.
    pub rerender_count: Option<u32>,
}

impl ComponentPerf {
    /// A component that was seen on the page but never measured.
    ///
    /// This is what the `.ts` produces for every component; the difference is that
    /// here it says so rather than reporting three zeros.
    #[must_use]
    pub fn observed(component_name: impl Into<String>) -> Self {
        Self {
            component_name: component_name.into(),
            node: None,
            portal_url: None,
            mount_duration_ms: None,
            render_time_ms: None,
            rerender_count: None,
        }
    }

    /// Fill in what a mark pair says.
    ///
    /// An unmount mark that precedes its mount is discarded rather than reported
    /// as a negative duration: clocks and mark ordering are the host's business,
    /// and a negative lifetime is a measurement error, not a fast component.
    #[must_use]
    pub fn from_marks(component_name: impl Into<String>, marks: MarkPair) -> Self {
        let mut perf = Self::observed(component_name);
        perf.mount_duration_ms = marks
            .unmount_ms
            .map(|end| end - marks.mount_ms)
            .filter(|d| *d >= 0.0);
        perf
    }

    /// Whether anything at all was measured.
    #[must_use]
    pub fn is_measured(&self) -> bool {
        self.mount_duration_ms.is_some()
            || self.render_time_ms.is_some()
            || self.rerender_count.is_some()
    }
}

/// One page's performance.
#[derive(Debug, Clone, PartialEq)]
pub struct PerfReport {
    /// The path measured.
    pub url: String,
    /// When, milliseconds since the Unix epoch.
    pub at_ms: f64,
    /// One entry per vital.
    pub vitals: Vec<VitalsMetric>,
    /// One entry per component seen.
    pub components: Vec<ComponentPerf>,
    /// The sum of the render times that were MEASURED.
    ///
    /// [`None`] when none were — which the `.ts` answers with `performance.now()`,
    /// the age of the page, read inside a five-second timeout.
    pub total_render_time_ms: Option<f64>,
    /// Heap in megabytes, when the runtime reports it. Chromium only.
    pub memory_usage_mb: Option<f64>,
}

/// Assemble a report from what was gathered.
#[must_use]
pub fn build_report(
    url: impl Into<String>,
    at_ms: f64,
    vitals: &VitalsAccumulator,
    components: Vec<ComponentPerf>,
    memory_usage_mb: Option<f64>,
) -> PerfReport {
    let measured: Vec<f64> = components.iter().filter_map(|c| c.render_time_ms).collect();
    PerfReport {
        url: url.into(),
        at_ms,
        vitals: vitals.metrics().into_iter().cloned().collect(),
        total_render_time_ms: (!measured.is_empty()).then(|| measured.iter().sum()),
        components,
        memory_usage_mb,
    }
}

/// The default sample rate, matching the `.ts`.
pub const DEFAULT_SAMPLE_RATE: f64 = 0.1;

/// Whether this pageload is sampled.
///
/// `draw` is a value in `[0, 1)` supplied by the host, for the same reason as in
/// `mzizi-rum`: a core with no I/O has no entropy source, and a supplied draw is
/// testable at both boundaries.
#[must_use]
pub fn should_sample(draw: f64, sample_rate: f64) -> bool {
    draw < sample_rate
}
