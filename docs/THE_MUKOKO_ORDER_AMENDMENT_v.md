# The Mukoko Order — Amendment: Pattern Language for the Ethics Domain

> This amendment is a supersession-in-place. Prior Order versions are
> **not** modified. Where this amendment overlaps with an earlier
> statement, the amendment wins.

**Status:** Adopted alongside the Ubuntu Five Pillars and Five Principles wire-up (design-portal issue #45, 2026-04).

---

## § Five remains the number of ethics

The Mukoko Order names **five** as the number of ethics — the instrument through which intention becomes action. That number is locked. This amendment does not change it; it observes what the number now _contains_.

Before this amendment, the ethics domain held one canonical five-fold structure: the **Five Ubuntu Questions**, stored in `brand_meta.philosophy.ubuntuQuestions` and applied as the decision filter on every product change.

After this amendment, the ethics domain holds **three** five-fold structures, all drawn from African scholarship:

| Structure                  | Role                               | Source-of-truth                                 | Count |
| -------------------------- | ---------------------------------- | ----------------------------------------------- | ----- |
| **Five Ubuntu Questions**  | Decision filter — _what evaluates_ | `brand_meta.philosophy.ubuntuQuestions` (JSONB) | 5     |
| **Five Ubuntu Pillars**    | Spheres of relationship — _where_  | `ubuntu_pillars` (table)                        | 5     |
| **Five Ubuntu Principles** | Behavioural virtues — _how_        | `ubuntu_principles` (table)                     | 5     |

Three fives, all in the ethics domain. The number of ethics did not change; the _density_ of the ethics domain did. The Order's pattern language is unchanged — only its content under the five-key grew.

---

## § Pattern-language resonance

The Order is a pattern language: every count has a meaning and every meaning has a count. Adding canonical structures must respect those bindings. This amendment respects them.

- **5** remains the number of ethics.
- **7** remains the number of covenants.
- **12** remains the number of manifesto sections.
- **17** remains the number of mukoko mini-apps.
- **4** remains the number of architectural pillars (Local-First, Mobile-First, Open Source, Open Data) — these now live under `brand_meta.philosophy.architecturalPillars` (renamed from the ambiguous `pillars`). The count and content are unchanged.
- **10** remains the number of frontend architecture layers.
- **5** remains the number of frontend architecture axes.

No locked count is added, removed, or modified. The amendment is **content-additive within the existing five-key**, not pattern-changing.

---

## § Two hands, ten fingers, one grip

The Pillars and the Principles together form a two-handed structure. Five fingers on one hand cannot crush a louse; five on the other hand alone cannot either. Only the two hands working in concert have grip.

This is not metaphor for metaphor's sake — it is the source. Lovemore Mbigi's **Collective Fingers Theory**, from which the five Principles are derived, names the hand as the unit of Ubuntu action: _chara chimwe hachitswanyi inda_. The structural Ubuntu model in this platform is itself a Collective Fingers structure. The Pillars are one hand; the Principles are the other.

When the Order is consulted in future amendments, the question to ask is whether a proposed change preserves grip — both hands, ten fingers, one purpose — or whether it amputates one hand in favour of the other. An amendment that proposed only Pillars or only Principles would fail this test. The current amendment preserves grip.

---

## § Rollback guards

The Order binds these counts. Any future change that would violate them must amend the Order's pattern language first, not the underlying tables:

- **No sixth pillar.** Adding a sixth pillar to `ubuntu_pillars` requires an Order amendment first. Five is the count.
- **No sixth principle.** Adding a sixth principle to `ubuntu_principles` requires an Order amendment first. Five is the count.
- **No translation away of Shona.** Both `shona` and `title` (English) columns are required on every row. The Shona carries meaning the English cannot. An amendment that proposed Shona-to-English translation would violate the Pillars/Principles content contract.
- **No restorative-justice principle.** Restorative justice is an American juvenile-justice and therapeutic frame, not an African one. Adding it to `ubuntu_principles` would require, in order: (1) a peer-reviewed African derivation, (2) an Order amendment, (3) a Manifesto amendment. The Manifesto amendment for this issue rejects the addition explicitly.
- **No change to the Five Ubuntu Questions.** They remain the decision filter and live unchanged in `brand_meta.philosophy.ubuntuQuestions`.

---

## § Closing

The Order describes what the platform's pattern language already is. This amendment does not extend the language — it observes that the five-key now holds three canonical structures instead of one, and that the addition was made without changing any locked count.

The platform is denser. The Order is unchanged.
