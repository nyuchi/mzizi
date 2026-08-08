//! Mzizi N8 assurance — the incident lifecycle, from detection to postmortem.
//!
//! The Rust implementation of `mzizi-incident-manager`. The state machine, the
//! timings, and the postmortem document; not the storage, the clock, or the
//! delivery.
//!
//! # Six defects in the TypeScript, fixed here
//!
//! **1. The incident id was a clock read.** `inc-${Date.now().toString(36)}` gives
//! two incidents created in the same millisecond the same id, and `incidents.set`
//! then OVERWRITES the first — so the incident vanishes, along with its timeline,
//! and nobody is told. Detection is exactly when a burst arrives: one outage
//! trips several alerts at once, which is the case this identifier scheme cannot
//! survive. Ids are supplied by the host here, and [`IncidentLog::open`] refuses a
//! duplicate rather than silently replacing.
//!
//! **2. `ttdMinutes` was declared and never computed.** The field is documented as
//! a duration and nothing ever assigns it, so every incident reports time-to-detect
//! as absent — which reads on a dashboard as "we do not measure detection" or, worse,
//! as zero. Time to detect needs a moment the impact STARTED, which the `.ts` never
//! records. [`Incident::impact_started_at_ms`] is that moment, and TTD is computed
//! only when it is known.
//!
//! **3. Every mutation silently did nothing for an unknown id.** `if (!inc) return`
//! — so transitioning, annotating or root-causing a typo'd incident succeeded from
//! the caller's point of view and changed nothing. Each of those returns a
//! [`Result`] here.
//!
//! **4. Resolving an already-resolved incident re-resolved it.** No guard on the
//! current state, so `resolved → resolved` rewrote `resolvedAt`, recomputed TTR
//! from the new timestamp, and fired `onResolved` again — a duplicate page, and a
//! TTR that grows every time somebody clicks. A transition to the state an
//! incident is already in is [`Transitioned::NoChange`] and touches nothing.
//! Re-entering `resolved` after a genuine regression still works, because that is
//! a real thing that happens.
//!
//! **5. The postmortem interpolated untrusted text into Markdown.** Titles come
//! from alerts, alerts come from error messages, and error messages carry user
//! input. A newline plus `##` in a title forges a section; a `|` or a newline in a
//! timeline detail escapes its bullet; a `)` in a portal URL terminates the link
//! early and dumps the rest into prose. This is content forgery in a document
//! people read to decide what happened, which is the document where a forged line
//! does the most damage.
//!
//! **6. A component with no portal URL rendered `[name](undefined)`.** The `.ts`
//! interpolates `c.portalUrl` unconditionally, so an affected component that has
//! no documentation link gets a link to a relative path called `undefined`. Plain
//! text when there is no URL.
//!
//! # What is deliberately NOT constrained
//!
//! Any state may follow any other. That is not an oversight: `monitoring →
//! mitigating` is a regression, `resolved → triaging` is a reopen, and an incident
//! tool that refuses either is one people work around. What IS enforced is that a
//! transition to the current state is a no-op (defect 4).

use std::collections::BTreeMap;

/// How bad, in the usual descending scale — `sev1` is worst.
///
/// Ordered so `max()` finds the worst; the `Ord` derive follows declaration
/// order, so [`Sev4`](Self::Sev4) is declared first.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum IncidentSeverity {
    /// Minor, no user impact.
    Sev4,
    /// Degraded, with a workaround.
    Sev3,
    /// Significant user impact.
    Sev2,
    /// Critical — a core guarantee is broken.
    Sev1,
}

impl IncidentSeverity {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Sev1 => "sev1",
            Self::Sev2 => "sev2",
            Self::Sev3 => "sev3",
            Self::Sev4 => "sev4",
        }
    }
}

/// Where an incident is in its lifecycle.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum IncidentState {
    /// Something fired.
    Detected,
    /// Working out what it is.
    Triaging,
    /// Working on stopping the bleeding.
    Mitigating,
    /// Mitigated, watching.
    Monitoring,
    /// Over.
    Resolved,
    /// Written up.
    Postmortem,
}

impl IncidentState {
    /// The wire spelling, matching the `.ts` string union.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Detected => "detected",
            Self::Triaging => "triaging",
            Self::Mitigating => "mitigating",
            Self::Monitoring => "monitoring",
            Self::Resolved => "resolved",
            Self::Postmortem => "postmortem",
        }
    }

    /// Whether an incident in this state still needs somebody.
    #[must_use]
    pub const fn is_active(self) -> bool {
        !matches!(self, Self::Resolved | Self::Postmortem)
    }
}

/// One thing that happened, and when.
#[derive(Debug, Clone, PartialEq)]
pub struct TimelineEntry {
    /// When, milliseconds since the Unix epoch.
    pub at_ms: f64,
    /// Who or what did it.
    pub actor: String,
    /// What they did.
    pub action: String,
    /// Any detail.
    pub details: Option<String>,
}

/// A component caught up in an incident.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AffectedComponent {
    /// The component name.
    pub name: String,
    /// Which helix node it belongs to. Uncapped — node numbers are labels.
    pub node: u32,
    /// Where its documentation is, when it has any.
    pub portal_url: Option<String>,
}

/// Something somebody has to do afterwards.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ActionItem {
    /// What.
    pub description: String,
    /// Who.
    pub owner: String,
    /// By when.
    pub due_date: Option<String>,
    /// Whether it is done.
    pub done: bool,
}

/// What is being opened.
///
/// `PartialEq` without `Eq`: `impact_started_at_ms` is an `f64`, and floats have
/// no total equality.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct NewIncident {
    /// One-line summary.
    pub title: String,
    /// Components implicated.
    pub affected_components: Vec<AffectedComponent>,
    /// Mini-apps implicated.
    pub affected_mini_apps: Vec<String>,
    /// The alert that fired, when there was one.
    pub alert_id: Option<String>,
    /// Who is running it.
    pub commander: Option<String>,
    /// When the impact actually began, if known.
    ///
    /// Time to detect is measured from HERE, not from detection — the `.ts`
    /// declares `ttdMinutes` and never has a value to compute it from.
    pub impact_started_at_ms: Option<f64>,
}

/// One incident.
#[derive(Debug, Clone, PartialEq)]
pub struct Incident {
    /// Supplied by the host, not derived from a clock. See defect 1.
    pub id: String,
    /// One-line summary.
    pub title: String,
    /// How bad.
    pub severity: IncidentSeverity,
    /// Where it is.
    pub state: IncidentState,
    /// When it was detected, milliseconds since the Unix epoch.
    pub detected_at_ms: f64,
    /// When the impact began, if known.
    pub impact_started_at_ms: Option<f64>,
    /// When it was resolved.
    pub resolved_at_ms: Option<f64>,
    /// Components implicated.
    pub affected_components: Vec<AffectedComponent>,
    /// Mini-apps implicated.
    pub affected_mini_apps: Vec<String>,
    /// Who ran it.
    pub commander: Option<String>,
    /// Everything that happened.
    pub timeline: Vec<TimelineEntry>,
    /// What caused it.
    pub root_cause: Option<String>,
    /// What to do about it.
    pub action_items: Vec<ActionItem>,
    /// The alert that fired.
    pub alert_id: Option<String>,
}

impl Incident {
    /// Minutes from impact starting to it being detected.
    ///
    /// [`None`] when nobody recorded when the impact began, which is honest —
    /// the `.ts` leaves the field undefined in every case and calls it a duration.
    #[must_use]
    pub fn ttd_minutes(&self) -> Option<f64> {
        let started = self.impact_started_at_ms?;
        Some(((self.detected_at_ms - started) / 60_000.0).round())
    }

    /// Minutes from detection to resolution.
    #[must_use]
    pub fn ttr_minutes(&self) -> Option<f64> {
        let resolved = self.resolved_at_ms?;
        Some(((resolved - self.detected_at_ms) / 60_000.0).round())
    }
}

/// Why a mutation did not happen.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum IncidentError {
    /// No incident with that id.
    NotFound,
    /// An incident with that id is already open.
    DuplicateId,
}

/// What a transition did.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Transitioned {
    /// The state changed.
    Moved {
        /// Where it was.
        from: IncidentState,
        /// Where it is.
        to: IncidentState,
    },
    /// It was already in that state. Nothing recorded, nothing fired.
    ///
    /// The `.ts` has no such case: `resolved → resolved` rewrites `resolvedAt`,
    /// recomputes TTR from the new timestamp and fires `onResolved` again.
    NoChange(IncidentState),
}

impl Transitioned {
    /// Whether this transition entered [`IncidentState::Resolved`] — the one
    /// moment a resolution notification should fire.
    #[must_use]
    pub const fn resolved_now(self) -> bool {
        matches!(
            self,
            Self::Moved {
                to: IncidentState::Resolved,
                ..
            }
        )
    }
}

/// Every open and closed incident.
#[derive(Debug, Clone, Default)]
pub struct IncidentLog {
    incidents: BTreeMap<String, Incident>,
}

impl IncidentLog {
    /// An empty log.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Open an incident under a host-supplied id.
    ///
    /// # Errors
    ///
    /// [`IncidentError::DuplicateId`] when that id is already in use. The `.ts`
    /// derives the id from `Date.now()` and overwrites on collision, which loses
    /// an entire incident in exactly the burst that produces one.
    pub fn open(
        &mut self,
        id: impl Into<String>,
        severity: IncidentSeverity,
        new: NewIncident,
        now_ms: f64,
    ) -> Result<&Incident, IncidentError> {
        let id = id.into();
        if self.incidents.contains_key(&id) {
            return Err(IncidentError::DuplicateId);
        }
        let incident = Incident {
            id: id.clone(),
            title: new.title,
            severity,
            state: IncidentState::Detected,
            detected_at_ms: now_ms,
            impact_started_at_ms: new.impact_started_at_ms,
            resolved_at_ms: None,
            affected_components: new.affected_components,
            affected_mini_apps: new.affected_mini_apps,
            commander: new.commander,
            timeline: vec![TimelineEntry {
                at_ms: now_ms,
                actor: "system".to_owned(),
                action: "Incident created".to_owned(),
                details: Some(format!("Severity: {}", severity.as_str())),
            }],
            root_cause: None,
            action_items: Vec::new(),
            alert_id: new.alert_id,
        };
        Ok(self.incidents.entry(id).or_insert(incident))
    }

    /// Move an incident to a new state.
    ///
    /// # Errors
    ///
    /// [`IncidentError::NotFound`] when no incident has that id — which the `.ts`
    /// answers by returning `undefined` and doing nothing.
    pub fn transition(
        &mut self,
        id: &str,
        to: IncidentState,
        actor: impl Into<String>,
        details: Option<String>,
        now_ms: f64,
    ) -> Result<Transitioned, IncidentError> {
        let incident = self.incidents.get_mut(id).ok_or(IncidentError::NotFound)?;
        let from = incident.state;
        if from == to {
            return Ok(Transitioned::NoChange(from));
        }

        incident.state = to;
        incident.timeline.push(TimelineEntry {
            at_ms: now_ms,
            actor: actor.into(),
            action: format!("State → {}", to.as_str()),
            details,
        });
        if to == IncidentState::Resolved {
            incident.resolved_at_ms = Some(now_ms);
        }
        Ok(Transitioned::Moved { from, to })
    }

    /// Add a note to the timeline.
    ///
    /// # Errors
    ///
    /// [`IncidentError::NotFound`] when no incident has that id.
    pub fn note(
        &mut self,
        id: &str,
        actor: impl Into<String>,
        action: impl Into<String>,
        details: Option<String>,
        now_ms: f64,
    ) -> Result<(), IncidentError> {
        let incident = self.incidents.get_mut(id).ok_or(IncidentError::NotFound)?;
        incident.timeline.push(TimelineEntry {
            at_ms: now_ms,
            actor: actor.into(),
            action: action.into(),
            details,
        });
        Ok(())
    }

    /// Record what caused it.
    ///
    /// # Errors
    ///
    /// [`IncidentError::NotFound`] when no incident has that id.
    pub fn set_root_cause(
        &mut self,
        id: &str,
        root_cause: impl Into<String>,
    ) -> Result<(), IncidentError> {
        let incident = self.incidents.get_mut(id).ok_or(IncidentError::NotFound)?;
        incident.root_cause = Some(root_cause.into());
        Ok(())
    }

    /// Add something somebody has to do.
    ///
    /// # Errors
    ///
    /// [`IncidentError::NotFound`] when no incident has that id.
    pub fn add_action_item(&mut self, id: &str, item: ActionItem) -> Result<(), IncidentError> {
        let incident = self.incidents.get_mut(id).ok_or(IncidentError::NotFound)?;
        incident.action_items.push(item);
        Ok(())
    }

    /// One incident.
    #[must_use]
    pub fn get(&self, id: &str) -> Option<&Incident> {
        self.incidents.get(id)
    }

    /// Every incident still needing somebody.
    #[must_use]
    pub fn active(&self) -> Vec<&Incident> {
        self.incidents
            .values()
            .filter(|i| i.state.is_active())
            .collect()
    }

    /// Every incident.
    #[must_use]
    pub fn all(&self) -> Vec<&Incident> {
        self.incidents.values().collect()
    }

    /// The worst severity among the active incidents — the one-glance answer.
    #[must_use]
    pub fn worst_active(&self) -> Option<IncidentSeverity> {
        self.active().iter().map(|i| i.severity).max()
    }
}

/// Escape a value going into a Markdown line.
///
/// A newline lets a value start its own block — `\n## Root Cause` forges a
/// section in a document people read to decide what happened. A `|` forges table
/// columns. Backslashes go first, or the escapes this adds are themselves
/// escapable.
#[must_use]
pub fn escape_markdown(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    for c in value.chars() {
        match c {
            '\\' => out.push_str("\\\\"),
            '|' => out.push_str("\\|"),
            '\n' | '\r' => out.push(' '),
            c => out.push(c),
        }
    }
    out
}

/// Render a link, or plain text when there is no URL.
///
/// The `.ts` interpolates `c.portalUrl` unconditionally, so a component with no
/// documentation link renders `[name](undefined)` — a link to a relative path
/// called `undefined`. Angle brackets are Markdown's literal-URL form, so a `)`
/// inside the URL cannot terminate the link early.
#[must_use]
pub fn component_link(component: &AffectedComponent) -> String {
    let name = escape_markdown(&component.name);
    match component
        .portal_url
        .as_deref()
        .filter(|url| !url.trim().is_empty())
    {
        Some(url) => format!("[{name}](<{}>)", url.replace(['<', '>', '\n', '\r'], "")),
        None => name,
    }
}

/// The postmortem, in Markdown.
///
/// Timestamps are milliseconds since the epoch: formatting them for humans needs
/// a locale and a timezone, which is a host concern, and the `.ts`'s bare
/// `toISOString()` was neither.
#[must_use]
pub fn postmortem(incident: &Incident) -> String {
    let mut doc = format!(
        "# Incident Postmortem: {}\n\n",
        escape_markdown(&incident.title)
    );
    doc.push_str(&format!("**Severity:** {}\n", incident.severity.as_str()));
    doc.push_str(&format!("**State:** {}\n", incident.state.as_str()));
    doc.push_str(&format!("**Detected:** {}\n", incident.detected_at_ms));
    doc.push_str(&match incident.resolved_at_ms {
        Some(at) => format!("**Resolved:** {at}\n"),
        None => "**Resolved:** Ongoing\n".to_owned(),
    });
    doc.push_str(&match incident.ttd_minutes() {
        Some(ttd) => format!("**TTD:** {ttd} minutes\n"),
        // Not "0", and not silence. Nobody recorded when the impact began.
        None => "**TTD:** not measured — impact start unrecorded\n".to_owned(),
    });
    doc.push_str(&match incident.ttr_minutes() {
        Some(ttr) => format!("**TTR:** {ttr} minutes\n"),
        None => "**TTR:** N/A\n".to_owned(),
    });
    doc.push_str(&format!(
        "**Commander:** {}\n",
        incident
            .commander
            .as_deref()
            .map_or_else(|| "Unassigned".to_owned(), escape_markdown)
    ));

    doc.push_str("\n## Affected Components\n");
    if incident.affected_components.is_empty() {
        doc.push_str("_None recorded_\n");
    } else {
        for component in &incident.affected_components {
            doc.push_str(&format!(
                "- {} (Node {})\n",
                component_link(component),
                component.node
            ));
        }
    }

    doc.push_str("\n## Affected Mini-Apps\n");
    if incident.affected_mini_apps.is_empty() {
        doc.push_str("_None recorded_\n");
    } else {
        doc.push_str(&format!(
            "{}\n",
            incident
                .affected_mini_apps
                .iter()
                .map(|app| escape_markdown(app))
                .collect::<Vec<_>>()
                .join(", ")
        ));
    }

    doc.push_str("\n## Timeline\n");
    if incident.timeline.is_empty() {
        doc.push_str("_Empty_\n");
    } else {
        for entry in &incident.timeline {
            doc.push_str(&format!(
                "- **{}** [{}] {}{}\n",
                entry.at_ms,
                escape_markdown(&entry.actor),
                escape_markdown(&entry.action),
                entry
                    .details
                    .as_deref()
                    .map(|d| format!(" — {}", escape_markdown(d)))
                    .unwrap_or_default()
            ));
        }
    }

    doc.push_str(&format!(
        "\n## Root Cause\n{}\n",
        incident
            .root_cause
            .as_deref()
            .map_or_else(|| "_To be determined_".to_owned(), escape_markdown)
    ));

    doc.push_str("\n## Action Items\n");
    if incident.action_items.is_empty() {
        doc.push_str("_None yet_\n");
    } else {
        for item in &incident.action_items {
            doc.push_str(&format!(
                "- [{}] {} (Owner: {}{})\n",
                if item.done { "x" } else { " " },
                escape_markdown(&item.description),
                escape_markdown(&item.owner),
                item.due_date
                    .as_deref()
                    .map(|due| format!(", Due: {}", escape_markdown(due)))
                    .unwrap_or_default()
            ));
        }
    }

    doc
}
