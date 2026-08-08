/* ═══════════════════════════════════════════════════════════════
   MZIZI OTEL — N8 assurance (a node on the engineering strand)
   The sink. Exports assurance signals over OTLP so anything that
   speaks OpenTelemetry can pick them up.
   ═══════════════════════════════════════════════════════════════ */

/**
 * THE RUST CORE HAS LANDED. THIS FILE IS THE JAVASCRIPT SHIM OVER IT.
 *
 * This block used to say N8 was a Rust node with zero `.rs` files under it, and
 * to call this file a stopgap for a core nobody had started. That is no longer
 * true: `mzizi-otel.rs` sits beside this file, every N8 and N9 component now has
 * a Rust core, and the `mzizi-assurance` / `mzizi-fundi` crates compile them
 * under `cargo check`, `clippy -D warnings` and a contract suite in CI.
 *
 * The split the old note promised is the split that shipped. Payload
 * construction, id handling, endpoint resolution, the nanosecond conversion and
 * the never-throw contract are shared-core logic and live in the `.rs`. What
 * belongs here is the thin call that actually sends — `fetch` in a browser,
 * `fetch` or the Browser Run binding in a Worker.
 *
 * So this file is NOT deprecated and NOT a stopgap: it is the per-target shim,
 * and a consumer app whose runtime is JavaScript installs it rather than a WASM
 * module. What it must not do is drift. The `.rs` is where a rule changes; if
 * you edit a threshold, an attribute key or a payload shape here and not there,
 * the contract suite in `mzizi-rs/crates/mzizi-assurance/tests/contract.rs`
 * reads this file on disk and fails. See `docs/n8-telemetry.md`.
 *
 * Still outstanding, and stated plainly so nobody reads "the core landed" as
 * more than it is: the core is pure logic with no I/O, so there is no WASM build
 * wired into any consumer yet and this file does not call one. The two
 * implementations agree by contract test, not by sharing a binary.
 *
 * WHY THIS EXISTS.
 *
 * N8's covenant is "what breaks is seen before users feel it." Every other N8
 * component was built to that covenant and stops one step short of it:
 * `mzizi-synthetic-probe` has `onResult`/`onAlert`, `mzizi-rum` has
 * `onEvent`/`onFlush`, `mzizi-error-tracker` has `onError`/`onCritical`,
 * `mzizi-alert-engine` has its handlers. Five callback surfaces, and **no sink
 * behind any of them** — so a signal is seen by whoever installed the component
 * and by nobody else. `mzizi-rum`'s default `endpoint` is
 * `https://mzizi.dev/api/rum`, a route that does not exist.
 *
 * This is that sink, and it is OTLP rather than a bespoke Mzizi endpoint for one
 * reason: a signal that only fundi can read is a signal only fundi can act on.
 * OTLP is the protocol every collector, tracing backend and agent runtime
 * already speaks, so "the changelog route stopped rendering" becomes an event
 * any service can subscribe to without Mzizi shipping a client for each one.
 *
 * WHY NO @opentelemetry/* DEPENDENCY.
 *
 * OTLP/HTTP with a JSON payload is a documented wire format — a POST with a
 * specific body shape. The JS SDK adds a large dependency tree, and the pieces
 * that matter here (BatchSpanProcessor, NodeTracerProvider) assume a Node
 * runtime. **fundi is a Cloudflare Worker**, and consumer apps install this file
 * into projects whose runtime is not ours to choose. A hand-built payload runs
 * unchanged in Node, in a Worker, in a browser and in Deno, and keeps this file
 * independently installable, which the registry requires.
 *
 * The tradeoff is real and worth stating: no automatic context propagation, no
 * batching queue, no retry/backoff. This is for discrete assurance events —
 * probe runs, tracked errors, fired alerts — not for tracing a request path. If
 * you need distributed tracing, use the SDK.
 */

import type { ProbeResult } from "./mzizi-synthetic-probe"

/**
 * Span status. OTLP's own enum — 0 UNSET, 1 OK, 2 ERROR.
 * Named rather than inlined, because a bare `2` in a payload is unreadable and
 * the two non-zero values are easy to transpose.
 */
const STATUS_UNSET = 0
const STATUS_OK = 1
const STATUS_ERROR = 2

/** SPAN_KIND_CLIENT — this process called something else and timed it. */
const SPAN_KIND_CLIENT = 3
/** SPAN_KIND_INTERNAL — the run itself, which called nothing. */
const SPAN_KIND_INTERNAL = 1

export type AttributeValue = string | number | boolean

export interface OtelConfig {
  /**
   * OTLP base endpoint, e.g. `https://collector.example.com`. The signal path
   * (`/v1/traces`) is appended, per the OTLP spec.
   *
   * Falls back to `OTEL_EXPORTER_OTLP_ENDPOINT` where an environment is
   * readable. **There is no default endpoint**: inventing one would send a
   * consumer's telemetry somewhere they never chose.
   */
  endpoint?: string
  /**
   * Full traces endpoint, used verbatim with **no** `/v1/traces` appended.
   *
   * This asymmetry is the spec's, not ours, and it is the detail people get
   * wrong: `OTEL_EXPORTER_OTLP_ENDPOINT` is a base that gets the signal path
   * added, `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` is already complete. Appending
   * to the second produces `/v1/traces/v1/traces` and a 404 that reads like a
   * broken collector.
   */
  tracesEndpoint?: string
  /** Extra headers — an API key, a tenant id. */
  headers?: Record<string, string>
  /** `service.name`. Required by the OTel resource conventions. */
  serviceName: string
  serviceVersion?: string
  /** Deployment environment, e.g. `production`, `preview`, `local`. */
  environment?: string
  /** Milliseconds before the export is abandoned. Default 10_000. */
  timeoutMs?: number
}

export interface OtelSpan {
  name: string
  kind?: number
  startTimeMs: number
  endTimeMs: number
  attributes?: Record<string, AttributeValue | undefined>
  status?: { code: number; message?: string }
  /** 16-hex-char id. Generated when absent. */
  spanId?: string
  parentSpanId?: string
}

export interface ExportOutcome {
  /** False when nothing was sent — including the deliberate no-endpoint case. */
  exported: boolean
  /** Why nothing was sent, or why the POST failed. Never thrown. */
  reason?: string
  status?: number
  spanCount: number
  traceId?: string
}

/* ── ids ──────────────────────────────────────────────────────── */

/**
 * `crypto.getRandomValues` is present in Node 20+, Workers, Deno and browsers,
 * which is the whole runtime set this file targets. `Math.random()` would also
 * "work" and is wrong: trace ids are correlation keys across services, and a
 * predictable one lets an unrelated caller collide with, or forge, a trace.
 */
function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  let out = ""
  for (const b of buf) out += b.toString(16).padStart(2, "0")
  return out
}

/** 16 bytes → 32 hex chars. Anything else is rejected by collectors. */
export const newTraceId = (): string => randomHex(16)
/** 8 bytes → 16 hex chars. */
export const newSpanId = (): string => randomHex(8)

/* ── payload ──────────────────────────────────────────────────── */

/**
 * OTLP tags every attribute with its type; a bare JSON value is not accepted.
 * Integers cross the wire as STRINGS because JSON cannot hold an int64 exactly
 * — a float64 silently loses precision above 2^53, which is where a nanosecond
 * timestamp lives.
 */
function toAnyValue(value: AttributeValue) {
  if (typeof value === "boolean") return { boolValue: value }
  if (typeof value === "number") {
    return Number.isInteger(value) ? { intValue: String(value) } : { doubleValue: value }
  }
  return { stringValue: value }
}

function toAttributes(attrs: Record<string, AttributeValue | undefined> = {}) {
  return Object.entries(attrs)
    .filter(([, v]) => v !== undefined)
    .map(([key, value]) => ({ key, value: toAnyValue(value as AttributeValue) }))
}

/** Milliseconds (possibly fractional) → an integer nanosecond string. */
function toUnixNano(ms: number): string {
  return String(Math.round(ms * 1e6))
}

/** Build the OTLP/HTTP JSON body. Exported so a caller can inspect or queue it. */
export function buildTracePayload(spans: OtelSpan[], config: OtelConfig, traceId: string) {
  return {
    resourceSpans: [
      {
        resource: {
          attributes: toAttributes({
            "service.name": config.serviceName,
            "service.version": config.serviceVersion,
            "deployment.environment.name": config.environment,
            "telemetry.sdk.name": "mzizi-otel",
            "telemetry.sdk.language": "webjs",
          }),
        },
        scopeSpans: [
          {
            scope: { name: "mzizi.n8.assurance" },
            spans: spans.map((span) => ({
              traceId,
              spanId: span.spanId ?? newSpanId(),
              ...(span.parentSpanId ? { parentSpanId: span.parentSpanId } : {}),
              name: span.name,
              kind: span.kind ?? SPAN_KIND_INTERNAL,
              startTimeUnixNano: toUnixNano(span.startTimeMs),
              endTimeUnixNano: toUnixNano(span.endTimeMs),
              attributes: toAttributes(span.attributes),
              status: span.status ?? { code: STATUS_UNSET },
            })),
          },
        ],
      },
    ],
  }
}

/* ── export ───────────────────────────────────────────────────── */

/** Read an env var without assuming `process` exists (it does not in a Worker). */
function readEnv(name: string): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  return proc?.env?.[name]
}

function resolveTracesUrl(config: OtelConfig): string | undefined {
  const explicit = config.tracesEndpoint ?? readEnv("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT")
  if (explicit) return explicit
  const base = config.endpoint ?? readEnv("OTEL_EXPORTER_OTLP_ENDPOINT")
  if (!base) return undefined
  return `${base.replace(/\/$/, "")}/v1/traces`
}

/**
 * POST spans to the collector.
 *
 * **Never throws, and never changes its caller's verdict.** A probe that reports
 * "failed" because its telemetry sink was unreachable is worse than one that
 * reports nothing: it manufactures an incident out of an exporter outage. Every
 * failure path returns `exported: false` with a reason, and the caller decides
 * whether that is worth surfacing.
 *
 * A missing endpoint is a normal outcome, not an error — most consumers will not
 * run a collector, and this must be inert for them rather than noisy.
 */
export async function exportSpans(spans: OtelSpan[], config: OtelConfig): Promise<ExportOutcome> {
  if (spans.length === 0) return { exported: false, reason: "no spans", spanCount: 0 }

  const url = resolveTracesUrl(config)
  if (!url) {
    return {
      exported: false,
      reason:
        "no OTLP endpoint configured (set OTEL_EXPORTER_OTLP_ENDPOINT or pass `endpoint`) — nothing was sent",
      spanCount: spans.length,
    }
  }

  const traceId = newTraceId()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), config.timeoutMs ?? 10_000)

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...config.headers },
      body: JSON.stringify(buildTracePayload(spans, config, traceId)),
      signal: controller.signal,
    })
    if (!res.ok) {
      return {
        exported: false,
        reason: `collector answered HTTP ${res.status}`,
        status: res.status,
        spanCount: spans.length,
        traceId,
      }
    }
    return { exported: true, status: res.status, spanCount: spans.length, traceId }
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError"
    return {
      exported: false,
      reason: aborted ? `export timed out after ${config.timeoutMs ?? 10_000}ms` : String(err),
      spanCount: spans.length,
      traceId,
    }
  } finally {
    clearTimeout(timer)
  }
}

/* ── the N8 probe bridge ──────────────────────────────────────── */

/**
 * Turn a `ProbeResult` into spans: one for the run, one child per step.
 *
 * The type is imported `import type`, so it is erased at build time and this
 * file keeps no runtime dependency on `mzizi-synthetic-probe` — it stays
 * independently installable while still speaking that component's contract
 * rather than a second, parallel shape.
 *
 * A step maps to a CLIENT span because a probe step calls something external;
 * the run maps to INTERNAL because it calls nothing itself. Getting this wrong
 * makes a collector's service-dependency graph draw edges that do not exist.
 */
export function probeResultToSpans(
  result: ProbeResult,
  extra: Record<string, AttributeValue | undefined> = {}
): OtelSpan[] {
  const runStart = Date.parse(result.timestamp)
  const runId = newSpanId()
  const failed = result.status !== "pass"

  const run: OtelSpan = {
    name: `probe ${result.journeyId}`,
    kind: SPAN_KIND_INTERNAL,
    spanId: runId,
    startTimeMs: runStart,
    endTimeMs: runStart + result.durationMs,
    attributes: {
      "mzizi.node": 8,
      "mzizi.probe.journey": result.journeyId,
      "mzizi.probe.status": result.status,
      "mzizi.probe.region": result.region,
      "mzizi.probe.steps": result.steps.length,
      "mzizi.probe.steps_failed": result.steps.filter((s) => s.status === "fail").length,
      ...extra,
    },
    status: failed
      ? { code: STATUS_ERROR, message: `probe ${result.journeyId} ${result.status}` }
      : { code: STATUS_OK },
  }

  // Steps carry no per-step timestamp in ProbeResult, only a duration, so they
  // are laid end to end from the run start. That is an approximation and it is
  // stated here rather than presented as measured: the durations are real, the
  // offsets are reconstructed.
  let cursor = runStart
  const steps: OtelSpan[] = result.steps.map((step) => {
    const start = cursor
    cursor += step.durationMs
    return {
      name: step.description,
      kind: SPAN_KIND_CLIENT,
      parentSpanId: runId,
      startTimeMs: start,
      endTimeMs: cursor,
      attributes: {
        "mzizi.node": 8,
        "mzizi.probe.journey": result.journeyId,
        "mzizi.probe.step_status": step.status,
        "error.message": step.error,
      },
      status:
        step.status === "fail"
          ? { code: STATUS_ERROR, message: step.error ?? "step failed" }
          : { code: STATUS_OK },
    }
  })

  return [run, ...steps]
}

/** Convenience: map a `ProbeResult` and ship it in one call. */
export function exportProbeResult(
  result: ProbeResult,
  config: OtelConfig,
  extra?: Record<string, AttributeValue | undefined>
): Promise<ExportOutcome> {
  return exportSpans(probeResultToSpans(result, extra), config)
}

export const otelStatus = { UNSET: STATUS_UNSET, OK: STATUS_OK, ERROR: STATUS_ERROR }
export const otelSpanKind = { INTERNAL: SPAN_KIND_INTERNAL, CLIENT: SPAN_KIND_CLIENT }
