# Repository audit and first milestone

## Starting point

Audited on 2026-10-18, before changing implementation: root README, CONTRIBUTING, package manifests, Yarn v1 lockfile, Lerna configuration, `.nvmrc`, core/docs TypeScript configs, Sass foundations and themes, public entry points, component APIs, Rollup builders, Vitest configuration, Storybook manager/preview/Vite aliases and CI build/test/Chromatic workflows.

- Yarn Classic workspaces: `packages/*` and `packages/components/*`; Lerna independent versions.
- 57 component packages plus core, style, shared, hooks, base, icons, docs, config, testkit, codemod, MCP and Storybook blocks.
- React development baseline 16.14; public peers >=16.9. TypeScript 5.9.3. Node target `.nvmrc`: 20.12.
- Styling: Sass, CSS Modules and inherited CSS custom properties. No Tailwind v3/v4.
- Accessible interaction tools: Floating UI, Downshift, react-focus-lock, react-remove-scroll, react-day-picker and Vibe’s own keyboard/navigation helpers. No Radix/Base UI dependency was added.
- Public `@vibe/core` paths: root, package.json, meta, interactionsTests, testIds, next, tokens, mockedClassNames. Root re-exports components/hooks/types. Component source entry points and package manifests were inspected; existing export statements are unchanged. New root exports: PrismTheme, GlassSurface and their TypeScript props/material types.
- Existing Button exposes kind/size/color, loading/success/disabled and native event/ARIA props; TextField exposes value/onChange/title/validation; TabsContext coordinates TabList/TabPanels; Modal owns focus lock, scroll management, labeling and portal placement. TabPanel now accepts an optional aria-labelledby attribute for explicit tab-to-panel labeling.
- Existing tests: package Vitest and Jest, Testing Library, jest-axe, testkit Playwright; Storybook addon-a11y, story play functions and token-dependent remote Chromatic. Local checks do not need Chromatic credentials.
- License manifests: MIT for core/style/components and most workspaces; testkit declares ISC. Original per-package license files remain untouched.

## Decisions and files

1. Keep the existing package graph and React peer range. Do not fork accessible interaction behavior or add a second primitive library.
2. Add `packages/style/src/prism.scss`, imported by the existing stylesheet build. Centralize semantic, typography, geometry, motion and material values and bridge to Vibe’s current variables. Keep the new visual language opt-in to avoid silently breaking consumers.
3. Add a small `packages/core/src/prism` API and root export. Reuse existing `classnames` and typed Vibe variants; no new runtime dependency or Tailwind-specific helper.
4. Add the live showcase in `packages/docs/src/prism`, with theme/brand/material controls, actual components, a filtered native table, code copying and a real portaled Modal. Update the existing Storybook identity and order.
5. Add tests under core/prism and docs/prism using the existing Vitest, Testing Library and axe stack. Wire docs test/lint aliases into the existing Lerna CI commands. Document local checks separately from remote publishing.
6. Update README, contribution guidance, attribution, architecture and verification notes. Keep all existing license notices.

## Component decisions

| Group                                                                    | Decision for this milestone                                                                                                                                                      |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button, Checkbox, TextField, Toggle                                      | Retain APIs and behavior; use the semantic bridge; showcase controlled, disabled/loading/error/readonly states; remove empty role attributes that suppressed TextField semantics |
| Tabs and Modal                                                           | Retain primitives; repair focused-descendant tracking and duplicate key activation; add panel labeling; keep portal inside theme scope                                           |
| Typography, radii, colors                                                | New Prism defaults and semantic bridge, with an interactive foundations reference                                                                                                |
| GlassSurface                                                             | New composable native div surface, forwards attributes/ref, no fake interaction behavior                                                                                         |
| Existing menus, dropdowns, date picker, tooltip, toast and data packages | Retain implementation and token inheritance; full visual and behavioral review deferred                                                                                          |
| shadcn components absent from Vibe                                       | No superficial command menu, calendar or drawer substitutes were created                                                                                                         |

## Remaining milestones

- Review every remaining component’s semantic hover/selected/error tokens, spacing, contrast and mobile targets. The token adapter does not constitute individual visual certification.
- Expand focused docs examples for menu, toast, tooltip, dropdown, table and date picker; add overlay keyboard/axe checks and deterministic local screenshot baselines.
- Add new composition components only after the existing layout primitives and APIs are fully evaluated.
- Evaluate genuine optical distortion separately, behind a progressive enhancement, with browser and GPU measurements. Refractive is currently a documented liquid fallback.
- Decide independent package naming, release policy, source installation tooling and supported browser matrix before publishing. No deployment or publication is part of this change.

The palette generator now excludes opt-in Prism scopes from legacy palette flattening; the original generated token JSON remains byte-for-byte unchanged.
