//! Mzizi N8 assurance — the OTLP exporter core.
//!
//! The Rust implementation of `mzizi-otel`. Its `.ts` sibling is the per-target
//! shim; this is the shared core, and the split between them is the whole point
//! of N8 being a Rust node rather than a TypeScript one.
//!
//! # This core is PURE. It does not send.
//!
//! `build_trace_request` returns a [`TraceRequest`] — a URL, headers and a body —
//! and the host does the sending: `fetch` in a browser, `fetch` or the Browser
//! Run binding in a Cloudflare Worker, whatever a native shell uses.
//!
//! That is not a limitation worked around, it is the correct boundary:
//!
//! * **Every target sends differently and computes identically.** Payload
//!   shape, attribute typing, nanosecond conversion, endpoint resolution and the
//!   span tree are the parts that must not vary, so they are the parts that live
//!   here once.
//! * **The never-throw rule becomes structural instead of promised.** The `.ts`
//!   version had to wrap `fetch` in a `try/catch` and hand back
//!   `{ exported: false, reason }`, because a probe reporting "failed" merely
//!   because its collector was unreachable manufactures an incident out of an
//!   exporter outage. With no I/O in the core there is nothing to catch — the
//!   host owns the failure and the verdict, and cannot conflate them.
//! * **No HTTP dependency.** `reqwest` would pull a TLS stack into a WASM module
//!   whose host already has one.
//!
//! # Randomness is supplied, never chosen
//!
//! [`TraceId`] and [`SpanId`] are constructed from bytes the caller provides. A
//! shared core must not pick the host's CSPRNG: in a browser or Worker the right
//! source is `crypto.getRandomValues`, natively it is the OS, and a WASM build
//! that reaches for `getrandom` needs a backend configured per target — a
//! well-known footgun that turns into a link error at the worst moment.
//!
//! `Math.random()` and its equivalents are wrong here for a reason that is not
//! style: trace ids are correlation keys across services, so a predictable one
//! lets an unrelated caller collide with, or forge, a trace.

use std::collections::BTreeMap;
use std::fmt;

/// Span status, matching the OTLP enum exactly.
///
/// Named rather than inlined because a bare `2` in a payload is unreadable and
/// the two non-zero values are easy to transpose.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StatusCode {
    /// No status was set. The OTLP default.
    Unset = 0,
    /// The operation completed successfully.
    Ok = 1,
    /// The operation failed. This is the variant fundi acts on.
    Error = 2,
}

/// Span kind, matching the OTLP enum.
///
/// Only the two kinds this node emits are modelled. A probe *step* calls
/// something external so it is [`SpanKind::Client`]; the *run* calls nothing
/// itself so it is [`SpanKind::Internal`]. Reversing them makes a collector draw
/// service-dependency edges that do not exist.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SpanKind {
    /// The operation is internal to this process.
    Internal = 1,
    /// The operation called something outside this process.
    Client = 3,
}

/// A typed attribute value.
///
/// OTLP tags every attribute with its type; a bare JSON value is rejected. The
/// integer case is serialised as a **string** because JSON cannot hold an int64
/// exactly — a float64 silently loses precision above 2^53, which is where a
/// nanosecond timestamp lives.
#[derive(Debug, Clone, PartialEq)]
pub enum AttributeValue {
    /// A string attribute.
    Str(String),
    /// An integer attribute. Crosses the wire as a quoted string.
    Int(i64),
    /// A floating-point attribute.
    Double(f64),
    /// A boolean attribute.
    Bool(bool),
}

impl From<&str> for AttributeValue {
    fn from(v: &str) -> Self {
        Self::Str(v.to_owned())
    }
}
impl From<String> for AttributeValue {
    fn from(v: String) -> Self {
        Self::Str(v)
    }
}
impl From<i64> for AttributeValue {
    fn from(v: i64) -> Self {
        Self::Int(v)
    }
}
impl From<u32> for AttributeValue {
    fn from(v: u32) -> Self {
        Self::Int(i64::from(v))
    }
}
impl From<f64> for AttributeValue {
    fn from(v: f64) -> Self {
        Self::Double(v)
    }
}
impl From<bool> for AttributeValue {
    fn from(v: bool) -> Self {
        Self::Bool(v)
    }
}

/// A 16-byte trace id. Renders as 32 lowercase hex characters.
///
/// A collector rejects any other length outright, and it does so by dropping the
/// span rather than by returning an error — so the length is enforced by the type
/// instead of being checked at the edge.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct TraceId([u8; 16]);

impl TraceId {
    /// Build a trace id from 16 bytes supplied by the host's CSPRNG.
    #[must_use]
    pub const fn new(bytes: [u8; 16]) -> Self {
        Self(bytes)
    }
}

impl fmt::Display for TraceId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for b in self.0 {
            write!(f, "{b:02x}")?;
        }
        Ok(())
    }
}

/// An 8-byte span id. Renders as 16 lowercase hex characters.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct SpanId([u8; 8]);

impl SpanId {
    /// Build a span id from 8 bytes supplied by the host's CSPRNG.
    #[must_use]
    pub const fn new(bytes: [u8; 8]) -> Self {
        Self(bytes)
    }
}

impl fmt::Display for SpanId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for b in self.0 {
            write!(f, "{b:02x}")?;
        }
        Ok(())
    }
}

/// Where the exporter sends, and what identifies the sender.
///
/// There is deliberately **no default endpoint**. `mzizi-rum` defaulted to
/// `https://mzizi.dev/api/rum`, a route that returns 404 and has never existed,
/// and every consumer who installed it without setting an endpoint posted into a
/// void that looked exactly like working telemetry. Inventing a destination for
/// someone else's telemetry is not a sane default even when the destination
/// works.
#[derive(Debug, Clone, Default)]
pub struct OtelConfig {
    /// Base endpoint. The signal path `/v1/traces` is appended.
    pub endpoint: Option<String>,
    /// Complete traces endpoint, used verbatim with **no** path appended.
    ///
    /// The asymmetry with [`OtelConfig::endpoint`] is the OTLP spec's, not ours,
    /// and it is the detail people get wrong: appending to this one produces
    /// `/v1/traces/v1/traces` and a 404 that reads like a broken collector.
    pub traces_endpoint: Option<String>,
    /// `service.name`. Required by the OTel resource conventions.
    pub service_name: String,
    /// `service.version`, when the host knows it.
    pub service_version: Option<String>,
    /// Deployment environment — `production`, `preview`, `local`.
    pub environment: Option<String>,
    /// Extra headers: an API key, a tenant id.
    pub headers: BTreeMap<String, String>,
}

/// One span, before it is turned into a payload.
#[derive(Debug, Clone)]
pub struct Span {
    /// Span name, as a collector displays it.
    pub name: String,
    /// Span kind.
    pub kind: SpanKind,
    /// This span's own id.
    pub span_id: SpanId,
    /// The parent span's id, when this span has one.
    pub parent_span_id: Option<SpanId>,
    /// Start time in milliseconds since the Unix epoch.
    pub start_time_ms: f64,
    /// End time in milliseconds since the Unix epoch.
    pub end_time_ms: f64,
    /// Typed attributes. Ordered so a payload is byte-stable across runs.
    pub attributes: BTreeMap<String, AttributeValue>,
    /// Status code.
    pub status: StatusCode,
    /// Status message. Carried only when there is something to say.
    pub status_message: Option<String>,
}

/// Everything the host needs to make one HTTP request, and nothing it does not.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TraceRequest {
    /// Fully resolved URL to POST to.
    pub url: String,
    /// Headers, including `Content-Type: application/json`.
    pub headers: BTreeMap<String, String>,
    /// The OTLP/HTTP JSON body.
    pub body: String,
}

/// Why no request was produced.
///
/// Not an error type in the "something went wrong" sense: the common variant is
/// a consumer who simply runs no collector, and for them this must be inert
/// rather than noisy.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum NotExported {
    /// There were no spans to send.
    NoSpans,
    /// No endpoint is configured, so nothing should be sent anywhere.
    NoEndpoint,
}

impl fmt::Display for NotExported {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NoSpans => f.write_str("no spans"),
            Self::NoEndpoint => f.write_str(
                "no OTLP endpoint configured (set OTEL_EXPORTER_OTLP_ENDPOINT or \
                 OtelConfig::endpoint) — nothing was sent",
            ),
        }
    }
}

/// Milliseconds, possibly fractional, to an integer nanosecond count.
///
/// Returned as a string by the serialiser for the int64 reason above. Rounding
/// rather than truncating keeps a duration from drifting shorter every hop.
fn to_unix_nano(ms: f64) -> u128 {
    // Milliseconds since the epoch are positive in every case this handles; a
    // negative value would mean a clock before 1970, which is not a span.
    let ns = (ms * 1_000_000.0).round();
    if ns <= 0.0 { 0 } else { ns as u128 }
}

/// Resolve the traces URL, honouring the spec's base/complete asymmetry.
///
/// Returns `None` when nothing is configured, which is the inert case rather
/// than a failure.
#[must_use]
pub fn resolve_traces_url(config: &OtelConfig) -> Option<String> {
    if let Some(explicit) = config.traces_endpoint.as_deref().filter(|s| !s.is_empty()) {
        return Some(explicit.to_owned());
    }
    let base = config.endpoint.as_deref().filter(|s| !s.is_empty())?;
    Some(format!("{}/v1/traces", base.trim_end_matches('/')))
}

/// Escape a string for a JSON document.
///
/// Hand-written rather than pulled from `serde_json`, for the same reason the
/// `.ts` sibling hand-builds its payload: this compiles into a WASM shared core
/// where every dependency is paid for by each consumer, and OTLP/HTTP JSON is a
/// small, fully documented shape. The escape set is the one JSON requires —
/// quote, backslash, the two-character forms, and every remaining control
/// character as `\u00XX`.
fn escape_json(s: &str, out: &mut String) {
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            '\u{8}' => out.push_str("\\b"),
            '\u{c}' => out.push_str("\\f"),
            c if c.is_control() => {
                let _ = fmt::Write::write_fmt(out, format_args!("\\u{:04x}", c as u32));
            }
            c => out.push(c),
        }
    }
}

fn write_string(value: &str, out: &mut String) {
    out.push('"');
    escape_json(value, out);
    out.push('"');
}

/// Serialise one attribute as an OTLP `KeyValue`.
fn write_attribute(key: &str, value: &AttributeValue, out: &mut String) {
    out.push_str("{\"key\":");
    write_string(key, out);
    out.push_str(",\"value\":{");
    match value {
        AttributeValue::Str(v) => {
            out.push_str("\"stringValue\":");
            write_string(v, out);
        }
        // Quoted: JSON has no int64, so the OTLP JSON mapping specifies a string.
        AttributeValue::Int(v) => {
            let _ = fmt::Write::write_fmt(out, format_args!("\"intValue\":\"{v}\""));
        }
        AttributeValue::Double(v) => {
            let _ = fmt::Write::write_fmt(out, format_args!("\"doubleValue\":{v}"));
        }
        AttributeValue::Bool(v) => {
            let _ = fmt::Write::write_fmt(out, format_args!("\"boolValue\":{v}"));
        }
    }
    out.push_str("}}");
}

fn write_attributes(attributes: &BTreeMap<String, AttributeValue>, out: &mut String) {
    out.push('[');
    for (i, (key, value)) in attributes.iter().enumerate() {
        if i > 0 {
            out.push(',');
        }
        write_attribute(key, value, out);
    }
    out.push(']');
}

/// Build the OTLP/HTTP JSON body for a set of spans.
///
/// Exported separately from [`build_trace_request`] so a caller can inspect,
/// queue or persist the payload without committing to sending it.
#[must_use]
pub fn build_trace_body(spans: &[Span], config: &OtelConfig, trace_id: TraceId) -> String {
    let mut resource: BTreeMap<String, AttributeValue> = BTreeMap::new();
    resource.insert(
        "service.name".to_owned(),
        AttributeValue::Str(config.service_name.clone()),
    );
    if let Some(v) = &config.service_version {
        resource.insert("service.version".to_owned(), AttributeValue::Str(v.clone()));
    }
    if let Some(v) = &config.environment {
        resource.insert(
            "deployment.environment.name".to_owned(),
            AttributeValue::Str(v.clone()),
        );
    }
    resource.insert(
        "telemetry.sdk.name".to_owned(),
        AttributeValue::Str("mzizi-otel".to_owned()),
    );
    resource.insert(
        "telemetry.sdk.language".to_owned(),
        AttributeValue::Str("rust".to_owned()),
    );

    let mut out = String::with_capacity(512 + spans.len() * 256);
    out.push_str("{\"resourceSpans\":[{\"resource\":{\"attributes\":");
    write_attributes(&resource, &mut out);
    out.push_str("},\"scopeSpans\":[{\"scope\":{\"name\":\"mzizi.n8.assurance\"},\"spans\":[");

    for (i, span) in spans.iter().enumerate() {
        if i > 0 {
            out.push(',');
        }
        out.push_str("{\"traceId\":");
        write_string(&trace_id.to_string(), &mut out);
        out.push_str(",\"spanId\":");
        write_string(&span.span_id.to_string(), &mut out);
        if let Some(parent) = span.parent_span_id {
            out.push_str(",\"parentSpanId\":");
            write_string(&parent.to_string(), &mut out);
        }
        out.push_str(",\"name\":");
        write_string(&span.name, &mut out);
        let _ = fmt::Write::write_fmt(
            &mut out,
            format_args!(
                ",\"kind\":{},\"startTimeUnixNano\":\"{}\",\"endTimeUnixNano\":\"{}\"",
                span.kind as u8,
                to_unix_nano(span.start_time_ms),
                to_unix_nano(span.end_time_ms),
            ),
        );
        out.push_str(",\"attributes\":");
        write_attributes(&span.attributes, &mut out);
        let _ = fmt::Write::write_fmt(
            &mut out,
            format_args!(",\"status\":{{\"code\":{}", span.status as u8),
        );
        if let Some(message) = &span.status_message {
            out.push_str(",\"message\":");
            write_string(message, &mut out);
        }
        out.push_str("}}");
    }

    out.push_str("]}]}]}");
    out
}

/// Build the request a host should POST, or say why there is nothing to send.
///
/// # Errors
///
/// Returns [`NotExported`] when there are no spans, or when no endpoint is
/// configured. Neither is a malfunction — see that type's documentation.
pub fn build_trace_request(
    spans: &[Span],
    config: &OtelConfig,
    trace_id: TraceId,
) -> Result<TraceRequest, NotExported> {
    if spans.is_empty() {
        return Err(NotExported::NoSpans);
    }
    let url = resolve_traces_url(config).ok_or(NotExported::NoEndpoint)?;

    let mut headers = BTreeMap::new();
    headers.insert("Content-Type".to_owned(), "application/json".to_owned());
    for (k, v) in &config.headers {
        headers.insert(k.clone(), v.clone());
    }

    Ok(TraceRequest {
        url,
        headers,
        body: build_trace_body(spans, config, trace_id),
    })
}

// ── the N8 probe bridge ────────────────────────────────────────────────────

// The probe types are NOT redefined here. `mzizi-synthetic-probe` owns them, and
// this module borrows them exactly as the `.ts` sibling does with its
// `import type { ProbeResult } from "./mzizi-synthetic-probe"` and its declared
// `registryDependencies` entry.
//
// The first draft of this file defined its own, which duplicated the contract and
// got it subtly wrong within one sitting: the `.ts` has TWO step shapes — the
// input `ProbeStep` a runner executes, and an anonymous outcome shape inside
// `ProbeResult` — and the copy here collapsed them into one. Two definitions of a
// wire contract drift; one does not.
//
// Rust has no type-only import, so this is a real intra-crate dependency rather
// than an erased one. That is fine and is the distribution model: a Rust consumer
// takes the crate, where the `.ts` consumer takes two installed files.
use super::mzizi_synthetic_probe::{ProbeResult, StepStatus};

/// Turn a [`ProbeResult`] into a run span plus one child span per step.
///
/// Span ids are supplied rather than generated, for the reason in the module
/// documentation: `ids[0]` is the run, `ids[1..]` the steps. Fewer ids than
/// steps truncates rather than inventing one, because a duplicated span id
/// corrupts the trace a collector assembles.
///
/// `ProbeResult` carries a duration per step but no per-step timestamp, so steps
/// are laid end to end from the run start. The durations are measured; the
/// offsets are reconstructed, and saying so here is the difference between an
/// approximation and a false claim.
#[must_use]
pub fn probe_result_to_spans(
    result: &ProbeResult,
    ids: &[SpanId],
    extra: &BTreeMap<String, AttributeValue>,
) -> Vec<Span> {
    let Some((&run_id, step_ids)) = ids.split_first() else {
        return Vec::new();
    };

    let failed_steps = result
        .steps
        .iter()
        .filter(|s| s.status == StepStatus::Fail)
        .count();

    let mut run_attrs: BTreeMap<String, AttributeValue> = BTreeMap::new();
    run_attrs.insert("mzizi.node".to_owned(), AttributeValue::Int(8));
    run_attrs.insert(
        "mzizi.probe.journey".to_owned(),
        AttributeValue::Str(result.journey_id.clone()),
    );
    run_attrs.insert(
        "mzizi.probe.status".to_owned(),
        AttributeValue::Str(result.status.as_str().to_owned()),
    );
    run_attrs.insert(
        "mzizi.probe.region".to_owned(),
        AttributeValue::Str(result.region.clone()),
    );
    run_attrs.insert(
        "mzizi.probe.steps".to_owned(),
        AttributeValue::Int(result.steps.len() as i64),
    );
    run_attrs.insert(
        "mzizi.probe.steps_failed".to_owned(),
        AttributeValue::Int(failed_steps as i64),
    );
    for (k, v) in extra {
        run_attrs.insert(k.clone(), v.clone());
    }

    let failed = result.status.is_failure();
    let mut spans = Vec::with_capacity(1 + result.steps.len());
    spans.push(Span {
        name: format!("probe {}", result.journey_id),
        kind: SpanKind::Internal,
        span_id: run_id,
        parent_span_id: None,
        start_time_ms: result.started_at_ms,
        end_time_ms: result.started_at_ms + result.duration_ms,
        attributes: run_attrs,
        status: if failed {
            StatusCode::Error
        } else {
            StatusCode::Ok
        },
        status_message: failed
            .then(|| format!("probe {} {}", result.journey_id, result.status.as_str())),
    });

    let mut cursor = result.started_at_ms;
    for (step, &span_id) in result.steps.iter().zip(step_ids) {
        let start = cursor;
        cursor += step.duration_ms;

        let mut attrs: BTreeMap<String, AttributeValue> = BTreeMap::new();
        attrs.insert("mzizi.node".to_owned(), AttributeValue::Int(8));
        attrs.insert(
            "mzizi.probe.journey".to_owned(),
            AttributeValue::Str(result.journey_id.clone()),
        );
        attrs.insert(
            "mzizi.probe.step_status".to_owned(),
            AttributeValue::Str(
                match step.status {
                    StepStatus::Pass => "pass",
                    StepStatus::Fail => "fail",
                }
                .to_owned(),
            ),
        );
        if let Some(err) = &step.error {
            attrs.insert("error.message".to_owned(), AttributeValue::Str(err.clone()));
        }

        let step_failed = step.status == StepStatus::Fail;
        spans.push(Span {
            name: step.description.clone(),
            kind: SpanKind::Client,
            span_id,
            parent_span_id: Some(run_id),
            start_time_ms: start,
            end_time_ms: cursor,
            attributes: attrs,
            status: if step_failed {
                StatusCode::Error
            } else {
                StatusCode::Ok
            },
            status_message: step_failed.then(|| {
                step.error
                    .clone()
                    .unwrap_or_else(|| "step failed".to_owned())
            }),
        });
    }

    spans
}
