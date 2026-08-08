//! Mzizi N8 assurance — real user monitoring: sampling, classification, batching.
//!
//! The Rust implementation of `mzizi-rum`. Privacy-first: no PII, and nothing
//! here can reach for any, because the core never touches a browser.
//!
//! # What this owns
//!
//! Whether to sample, what a viewport means, and how events accumulate into a
//! batch. Not `window`, not `performance`, not `navigator`, not the POST — the
//! host gathers the numbers and sends them.
//!
//! # Two defects in the TypeScript, fixed here
//!
//! **1. An unsampled collector still accumulated events, forever.** The `.ts`
//! constructor returns early when `Math.random() > sampleRate`, *before* calling
//! `init()` — so no flush timer is ever created. But `record()` stays public and
//! still pushes onto `this.events`, so any consumer calling it by hand on an
//! unsampled collector grows an array that nothing will ever drain. At the
//! default 10% sample rate that is nine sessions in ten.
//!
//! Here sampling is decided once, by [`should_sample`], and an unsampled
//! [`RumBuffer`] *discards* rather than silently hoarding.
//!
//! **2. The buffer had no ceiling even when sampled.** Events drain on a 30-second
//! timer, and a flush that fails is swallowed by design — correctly, since RUM
//! must never surface its own network error to the user it measures. Correct, and
//! unbounded: a collector whose endpoint is down accumulates for the life of the
//! session. [`RumBuffer`] caps and drops oldest, which loses the least recent
//! data rather than the whole tab.
//!
//! # Randomness is supplied, as everywhere in this node
//!
//! [`should_sample`] takes the random draw rather than making it. Not for the
//! security reason that applies to trace ids — sampling is not a correlation key
//! — but because a core with no I/O has no entropy source either, and a caller
//! that supplies the draw can write a deterministic test for the boundary.

/// What kind of device, derived from the viewport.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Device {
    /// Narrow viewport.
    Mobile,
    /// Mid-width viewport.
    Tablet,
    /// Wide viewport.
    Desktop,
}

impl Device {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Mobile => "mobile",
            Self::Tablet => "tablet",
            Self::Desktop => "desktop",
        }
    }
}

/// Effective connection type, as the Network Information API reports it.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Connection {
    /// 4g or better.
    FourG,
    /// 3g.
    ThreeG,
    /// 2g.
    TwoG,
    /// Slower than 2g.
    SlowTwoG,
    /// Reported as wifi.
    Wifi,
    /// Not reported. Safari does not implement the API at all.
    Unknown,
}

impl Connection {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::FourG => "4g",
            Self::ThreeG => "3g",
            Self::TwoG => "2g",
            Self::SlowTwoG => "slow-2g",
            Self::Wifi => "wifi",
            Self::Unknown => "unknown",
        }
    }

    /// Parse what the host read, defaulting to [`Connection::Unknown`].
    #[must_use]
    pub fn from_str_or_unknown(value: &str) -> Self {
        match value {
            "4g" => Self::FourG,
            "3g" => Self::ThreeG,
            "2g" => Self::TwoG,
            "slow-2g" => Self::SlowTwoG,
            "wifi" => Self::Wifi,
            _ => Self::Unknown,
        }
    }
}

/// What kind of thing was measured.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RumEventType {
    /// The initial page load.
    Pageload,
    /// A user interaction.
    Interaction,
    /// A client-side navigation.
    Navigation,
    /// A network request.
    Network,
    /// An error.
    Error,
}

impl RumEventType {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Pageload => "pageload",
            Self::Interaction => "interaction",
            Self::Navigation => "navigation",
            Self::Network => "network",
            Self::Error => "error",
        }
    }
}

/// One measurement.
///
/// `url` is a PATH, never a full URL: a query string carries session tokens,
/// reset links and search terms, and this component's whole premise is that it
/// collects no PII.
#[derive(Debug, Clone, PartialEq)]
pub struct RumEvent {
    /// What kind.
    pub event_type: RumEventType,
    /// When, in milliseconds since the Unix epoch.
    pub timestamp_ms: f64,
    /// The path, without query or fragment.
    pub url: String,
    /// Which mini-app.
    pub mini_app: Option<String>,
    /// Device class.
    pub device: Device,
    /// Connection class.
    pub connection: Connection,
    /// The numbers.
    pub metrics: Vec<(String, f64)>,
}

/// The viewport width below which a device is [`Device::Mobile`].
pub const MOBILE_MAX_WIDTH: u32 = 640;
/// The viewport width below which a device is [`Device::Tablet`].
pub const TABLET_MAX_WIDTH: u32 = 1024;

/// Classify a viewport width.
#[must_use]
pub fn device_for(viewport_width: u32) -> Device {
    if viewport_width < MOBILE_MAX_WIDTH {
        Device::Mobile
    } else if viewport_width < TABLET_MAX_WIDTH {
        Device::Tablet
    } else {
        Device::Desktop
    }
}

/// Whether this session is sampled.
///
/// `draw` is a value in `[0, 1)` from the host. The comparison matches the
/// `.ts`'s `Math.random() > sampleRate` inverted, so a rate of `0.0` samples
/// nothing and `1.0` samples everything — both exactly, which a `>=` on either
/// side would get wrong at one end.
#[must_use]
pub fn should_sample(draw: f64, sample_rate: f64) -> bool {
    draw < sample_rate
}

/// Strip a URL to the path RUM is allowed to keep.
///
/// A query string is where session tokens, password-reset links and search terms
/// live. The `.ts` uses `window.location.pathname`, which already excludes them;
/// this exists so a host that has a full URL cannot accidentally hand one over.
#[must_use]
pub fn path_only(url: &str) -> String {
    let without_fragment = url.split('#').next().unwrap_or("");
    let without_query = without_fragment.split('?').next().unwrap_or("");
    // Keep the path from an absolute URL, dropping scheme and host.
    match without_query.find("://") {
        Some(scheme_end) => {
            let rest = &without_query[scheme_end + 3..];
            match rest.find('/') {
                Some(path_start) => rest[path_start..].to_owned(),
                None => "/".to_owned(),
            }
        }
        None => without_query.to_owned(),
    }
}

/// A bounded batch of events awaiting flush.
#[derive(Debug, Clone)]
pub struct RumBuffer {
    /// Whether this session is sampled at all.
    sampled: bool,
    /// How many events to hold before dropping the oldest.
    max_events: usize,
    events: Vec<RumEvent>,
}

impl RumBuffer {
    /// A buffer for a session that has already been sampled in or out.
    ///
    /// An unsampled buffer DISCARDS. The `.ts` leaves `record()` callable on an
    /// unsampled collector whose flush timer was never started, so events pile up
    /// with nothing to drain them — in nine sessions out of ten at the default
    /// rate.
    #[must_use]
    pub fn new(sampled: bool, max_events: usize) -> Self {
        Self {
            sampled,
            max_events,
            events: Vec::new(),
        }
    }

    /// Whether this session is collecting.
    #[must_use]
    pub const fn is_sampled(&self) -> bool {
        self.sampled
    }

    /// Record an event. Returns whether it was kept.
    pub fn record(&mut self, event: RumEvent) -> bool {
        if !self.sampled {
            return false;
        }
        self.events.push(event);
        // Dropping the oldest loses the least recent measurement rather than
        // growing until the tab does. A flush that fails is swallowed by design
        // — RUM must never surface its own network error to the user it measures
        // — so without a ceiling an unreachable endpoint accumulates for the
        // whole session.
        if self.events.len() > self.max_events {
            self.events.remove(0);
        }
        true
    }

    /// Take everything pending, leaving the buffer empty.
    ///
    /// The batch is handed over BEFORE the host tries to send it, matching the
    /// `.ts`. A send that fails loses that batch rather than retrying, which is
    /// the deliberate trade for never blocking or surfacing an error.
    pub fn drain(&mut self) -> Vec<RumEvent> {
        std::mem::take(&mut self.events)
    }

    /// How many events are pending.
    #[must_use]
    pub fn len(&self) -> usize {
        self.events.len()
    }

    /// Whether anything is pending.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.events.is_empty()
    }
}
