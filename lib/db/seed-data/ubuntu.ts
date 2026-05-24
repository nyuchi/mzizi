/**
 * Ubuntu Pillars and Principles — seed data mirror.
 *
 * Issue nyuchi/design-portal#45. The production `ubuntu_pillars` and
 * `ubuntu_principles` tables on `grjsboqkaywpwatvrzmy` were seeded
 * out-of-band on 2026-04-22. This module mirrors those rows verbatim
 * for branch databases — local Supabase stacks, ephemeral preview
 * environments, CI fixtures — so a fresh DB can be brought up to the
 * canonical shape without re-running the (now non-idempotent) migration.
 *
 * Rules of engagement:
 *  - The values here MUST match production verbatim. If production
 *    changes, mirror the change here in the same commit.
 *  - Five pillars, five principles. Five is the number of ethics in
 *    the Mukoko Order — a sixth requires amending the Order first.
 *  - Shona terms are required and never translated away. They carry
 *    meaning the English titles cannot.
 *  - Seed scripts MUST be idempotent (`INSERT ... ON CONFLICT (name)
 *    DO UPDATE`). Production already has these rows; running this
 *    against production must be a no-op or an update-with-identical-
 *    values. Never let the seed mutate canonical content.
 *
 * Provenance:
 *  - Pillars: Mugumbate, J. et al. (2023). Understanding Ubuntu and
 *    its contribution to social work education in Africa and other
 *    regions of the world. Social Work Education, 43(4), 1123–1139.
 *  - Principles: Mbigi, L. (1997). Ubuntu: The African Dream in
 *    Management. Pretoria: Sigma Press. (Collective Fingers Theory —
 *    chara chimwe hachitswanyi inda, "one finger cannot crush a louse".)
 */

import type { UbuntuPillarInsert, UbuntuPrincipleInsert } from "../types"

export const UBUNTU_PILLARS: UbuntuPillarInsert[] = [
  {
    name: "family",
    shona: "Mhuri",
    title: "Family",
    description:
      "The first sphere of Ubuntu — the household and kin who form a person's primary web of belonging. Ubuntu begins here: identity is given by family before it is given by any institution.",
    sphere: "Immediate relationships — kin, household",
    platform_surface:
      "User accounts, personal data, Digital Twin, account switching for shared devices",
    source: "Mugumbate et al. (2023)",
    sort_order: 1,
  },
  {
    name: "community",
    shona: "Nharaunda",
    title: "Community",
    description:
      "The extended sphere of neighbours, peers, and chosen kin. Where the family ends, the community begins; the two are continuous, not opposed. Ubuntu treats community as the medium through which a person grows into society.",
    sphere: "Extended relationships — neighbours, peers, chosen kin",
    platform_surface:
      "Social features, Circles, Nhimbe gatherings, collaboration tools, contribution types",
    source: "Mugumbate et al. (2023)",
    sort_order: 2,
  },
  {
    name: "society",
    shona: "Vanhu",
    title: "Society",
    description:
      "The broader human web — strangers, institutions, the polity. Ubuntu does not stop at the village wall; vanhu means people, all people. A person who treats strangers as strangers has not yet practised Ubuntu.",
    sphere: "Broader human web — strangers, institutions",
    platform_surface: "Platform ecosystem, public features, marketplace, multi-language parity",
    source: "Mugumbate et al. (2023)",
    sort_order: 3,
  },
  {
    name: "environment",
    shona: "Zvakatipoteredza",
    title: "Environment",
    description:
      "The natural world that holds all relationships. Ubuntu is ecological before it is social — soil, water, and weather are kin too. A person who exhausts the environment has broken Ubuntu, even if they have wronged no human directly.",
    sphere: "The natural world that holds all relationships",
    platform_surface:
      "Digital footprint, sustainability, resource cost, offline-first architecture, budget-hardware performance budgets",
    source: "Mugumbate et al. (2023)",
    sort_order: 4,
  },
  {
    name: "spirituality",
    shona: "Unhu",
    title: "Spirituality",
    description:
      "The vertical axis of being human — meaning, purpose, ancestry, and the sacred. Unhu names the inner quality from which Ubuntu flows outward. Without unhu, the four horizontal pillars are scaffolding without a soul.",
    sphere: "Meaning, purpose, the vertical axis of being human",
    platform_surface:
      "Mission alignment, cultural preservation, legacy, memorial states for ancestral accounts",
    source: "Mugumbate et al. (2023)",
    sort_order: 5,
  },
]

export const UBUNTU_PRINCIPLES: UbuntuPrincipleInsert[] = [
  {
    name: "survival",
    shona: "Kurarama",
    title: "Survival",
    description:
      "Collective endurance. No one survives alone; basic needs are met through one another. Reciprocal care sustains the community before any individual can flourish.",
    expression:
      "Offline-first architecture, shared-device support, budget-hardware performance budget, open data commons, works in a village with 2G",
    source: "Mbigi (1997), Collective Fingers Theory",
    sort_order: 1,
  },
  {
    name: "solidarity",
    shona: "Kubatana",
    title: "Solidarity",
    description:
      "A firm and persevering commitment to the common good. Not vague compassion but active allegiance to the welfare of the whole — kubatana means to hold together.",
    expression:
      "Circles, Nhimbe gatherings, Ubuntu contribution types (moderation, translation, curation, mentorship), collective ownership of the open data commons",
    source: "Mbigi (1997), Collective Fingers Theory",
    sort_order: 2,
  },
  {
    name: "compassion",
    shona: "Tsitsi",
    title: "Compassion",
    description:
      "Active care, sympathy, and concern shown through helping, sharing, and welcoming. Tsitsi extends beyond kin to all — a stranger in need is not a stranger to compassion. (Also: Du Toit, Poovan & Engelbretch 2006.)",
    expression:
      "Hospitality to newcomers, help-first interaction patterns, welcome flows, accessible defaults that do not punish people for the device they own",
    source: "Mbigi (1997), Collective Fingers Theory; Du Toit, Poovan & Engelbretch (2006)",
    sort_order: 3,
  },
  {
    name: "respect",
    shona: "Ruremekedzo",
    title: "Respect",
    description:
      "Unprejudiced consideration of another's privileges, beliefs, and norms. Encompasses elder-respect (ukuhlonipha) but applies to every person, every age, every belief. (Also: Poovan et al. 2006.)",
    expression:
      "Account switching for shared devices, multi-language parity with no second-class language, no age-gate assumptions, elder-respect in greeting patterns and tone",
    source: "Mbigi (1997), Collective Fingers Theory; Poovan et al. (2006)",
    sort_order: 4,
  },
  {
    name: "dignity",
    shona: "Chiremerera",
    title: "Dignity",
    description:
      "Inherent worth held by virtue of existence — irrespective of status, ethnicity, age, or background. Humanity is sacred. Dignity is not earned and cannot be revoked. (Also: Ramose 2002.)",
    expression:
      "No dark patterns, data sovereignty, verification without stigma, memorial states for ancestral accounts, never selling user attention",
    source: "Mbigi (1997), Collective Fingers Theory; Ramose (2002)",
    sort_order: 5,
  },
]
