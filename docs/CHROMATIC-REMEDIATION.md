# Chromatic accessibility remediation

The reviewed Chromatic project is `6ad40c80b2084206c1954da3`.
Build 5 was produced from the separate dependency-security branch (`2eaa02f`),
not the current Prism branch. Its 1,046 visual changes have no ancestor baseline;
these require visual review and are not a count of defects. No baselines were
accepted automatically as part of this remediation.

## Shared fixes

- Combobox options expose option, selection, and disabled semantics. Keyboard
  focus no longer masquerades as selection.
- Menu items omit unsupported `aria-selected`; grid-shaped menu groups preserve
  arrow-key navigation without claiming to implement an ARIA data grid.
- Table headers expose a row that owns the column headers.
- List selection remains available as `data-selected` when the chosen role does
  not allow `aria-selected`. Generated active-descendant IDs stay in sync.
- Step indicators retain list structure and activate once with Enter/Space.
- Color pickers have named dialogs and listboxes instead of invalid ID references.
- Virtualized scrollports can receive keyboard focus for native scrolling.
- Avatar images always provide an alt attribute; unnamed images are decorative.
  Informative and clickable avatars should supply a person's name. Disabled
  avatars do not activate, and clickable avatars have one keyboard focus target.
- Disabled ButtonGroup options pass the disabled state to the actual controls.
- Clickable dates outside the current month use readable secondary text.
- ProgressBar forwards its accessible label to the primary bar.
- Modal close actions default to “Close modal”; callers can localize the label.
- Non-action TextField icons no longer expose unnamed buttons.
- Catalog previews provide meaningful labels and use neutral surfaces for
  decorative elevation examples instead of unnamed dialogs.

Existing component props remain supported. `Button.role` is additive and allows
composition into menu items. `MenuGridItem` now exposes `group` instead of an
incomplete `grid`; consumers targeting its old role should update selectors.

## Local accessibility scan

Build the existing Storybook first (`yarn workspace @vibe/docs build-storybook`).
The review used axe-core **4.10.3**, matching the major/minor rule engine linked
from Chromatic's findings. The repository's older transitive axe versions do not
exercise all the same rules. Obtain the test engine without changing runtime
dependencies:

```sh
mkdir -p /tmp/vibe-axe
npm pack axe-core@4.10.3 --pack-destination /tmp/vibe-axe
tar -xf /tmp/vibe-axe/axe-core-4.10.3.tgz -C /tmp/vibe-axe
node node_modules/@playwright/test/cli.js install chromium
python3 -m http.server 7008 --directory packages/docs/static_storybook
```

In another shell, from the repository root:

```sh
AXE_SOURCE=/tmp/vibe-axe/package/axe.min.js \
  A11Y_REPORT=/tmp/vibe-a11y.jsonl \
  node scripts/chromatic-a11y-audit.cjs
```

Use `A11Y_MODES=Light,Dark` for both themes and `A11Y_STORIES='^catalog--catalog$'`
to select stories. `STORYBOOK_URL` overrides the local server URL. The script
waits for Storybook play completion, scans contrast and ARIA rules, records page
errors, honors existing Chromatic snapshot exclusions, and exits nonzero for
violations or execution errors. It disables only the region rule, matching
Chromatic's isolated-story convention. No production accessibility rules or
Chromatic findings are suppressed.

The Pages workflow now submits the same built artifact to Chromatic on Prism
pushes and waits for test completion. Upload success alone is not a passing test.
Visual changes remain unaccepted; the job can therefore fail pending review.
Pages deployment remains independent of that review job. The project token is
read only from `CHROMATIC_PROJECT_TOKEN` in GitHub secrets.

## Remaining work

This is a shared-component remediation milestone, not a claim that every legacy
story meets WCAG AA. Remaining legacy examples include unnamed inputs/dialogs,
bright avatar color pairings, nested chip actions, repeated landmarks, and
contrast in documentation blocks. The full baseline inventory is recorded in
`chromatic-a11y-baseline.json`; rerun the scanner to produce the current inventory. Remote visual comparisons require human review after the new
Chromatic build completes; do not accept them wholesale to hide errors.

## Verified locally in this milestone

- Production Storybook build passed.
- Fresh Catalog preview: **42 → 0 failing elements** with axe 4.10.3; light and
  dark both passed. Prism Light/Dark also passed (six story/theme combinations).
- Focused package suites: **636 tests passed, 6 skipped** across 18 suites/packages,
  including the Prism showcase and core primitives. Reviewed semantic snapshot
  changes were updated; Chromatic visual baselines were left unaccepted.
- ESLint on changed library TypeScript: no errors, five existing warnings.
- Prism typecheck/lint passed. The full documentation typecheck has **324 errors**
  both before and after these changes. A pristine HEAD source archive was checked
  with the same dependencies; normalized diagnostic comparison found zero added
  or removed errors. This legacy check is not reported as passing.
- The full local baseline covered 528 light-mode stories, with 163 reporting
  violations. It is an inventory for the remaining work, not a green baseline.
