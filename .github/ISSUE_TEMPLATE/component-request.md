---
name: Component Request
about: Request a new component for the registry
title: "[Component] "
labels: component
assignees: ""
---

## Component Name

What should this component be called? (kebab-case, e.g., `date-range-picker`)

## Category

Which registry category does this belong to?

- [ ] Input
- [ ] Action
- [ ] Data Display
- [ ] Feedback
- [ ] Layout
- [ ] Navigation
- [ ] Overlay
- [ ] Mukoko Ecosystem
- [ ] Infrastructure
- [ ] Utility

## Layer

What layer is this component?

- [ ] Primitive — standalone UI component (`components/ui/`)
- [ ] Composite — combines multiple primitives (e.g., `chat-layout`)
- [ ] Orchestrator — page-level composition (e.g., `dashboard-layout`)
- [ ] Block — full page/section example (e.g., `login-01`)

## Description

What does this component do? What problem does it solve?

## Which Apps Need This?

Which Mukoko ecosystem apps would use this component?

- [ ] mukoko-weather
- [ ] mukoko-news
- [ ] mukoko (super app)
- [ ] nhimbe (events)
- [ ] Other: \_\_\_

## Use Cases

Where would this component be used across the ecosystem?

## API Design

Suggested props, variants, and behavior:

```tsx
<ComponentName variant="default" size="md" />
```

Install command:

```bash
npx shadcn@latest add https://mzizi.dev/api/v1/ui/<component-name>
```

## Design Reference

Link to designs, screenshots, or similar components in other libraries.

## Dependencies

Does this component depend on other registry components or external packages?
