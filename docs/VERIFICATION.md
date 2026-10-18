# Verification record

Run against this milestone on 2026-10-18. Environment: Node 24.19.0, Yarn Classic 1.22.22, React 16.14 and local Chromium 131 (Playwright 1.49.1). The repository’s intended development Node version remains 20.12. No packages were published and no hosted website was deployed.

## Baseline and existing blockers

Initial core test, lint and build attempts failed with missing executables because this fresh environment had no installed dependencies or Yarn shim. After a frozen-lockfile installation, checks ran locally. The lockfile is unchanged. Installation scripts were initially skipped, then the actual dependency builds were run explicitly.

A detached checkout of original commit `3392aa5ef` was typechecked using the same installed dependencies. Original docs produced **559 TypeScript diagnostics**. Current full docs typecheck produces **324 diagnostics**, all present in the baseline comparison (0 new diagnostics; 235 eliminated by the Sass module declaration). Remaining failures include old Storybook interaction APIs, missing asset declarations and legacy DOM properties. These are not hidden or counted as a passing whole-docs check. The focused Prism typecheck passes.

The first static Storybook build exhausted Node’s default 2 GB heap. Re-running with `NODE_OPTIONS=--max-old-space-size=6144` succeeded. The initial dev-server attempt hit this container’s `uv_interface_addresses` restriction; browser QA used the actual production Storybook output served over a local Python HTTP server instead. This is not a deployment.

## Executed checks

| Check                                                       | Actual result                                             |
| ----------------------------------------------------------- | --------------------------------------------------------- |
| Frozen Yarn install, without changing dependencies          | Pass                                                      |
| `SKIP_RELEASE_ARTIFACTS=true yarn build:package @vibe/core` | Pass, 64 dependency projects                              |
| Rebuild final a11y, tabs, text-inputs and core packages     | Pass, 4 projects                                          |
| `vibe-storybook-components` build                           | Pass                                                      |
| Static Storybook production build, 6 GB heap                | Pass                                                      |
| Core Vitest suite                                           | 7 files, **62 tests passed**, including 4 new Prism tests |
| Showcase Vitest suite                                       | 1 file, **5 tests passed**                                |
| Grid keyboard-navigation helper/hook tests                  | 2 files, **46 tests passed**                              |
| Tabs full suite, final run without snapshot updating        | 6 files, **33 tests passed**                              |
| TextField suite, final run without snapshot updating        | 3 files, **65 tests passed**                              |
| Prism TypeScript check                                      | Pass                                                      |
| Full docs TypeScript check                                  | Fails: 324 baseline diagnostics, 0 new diagnostics        |
| Core ESLint                                                 | Pass, 5 existing warnings                                 |
| Tabs ESLint                                                 | Pass, 1 existing hook dependency warning                  |
| a11y and text-inputs ESLint                                 | Pass                                                      |
| New docs/Prism ESLint                                       | Pass                                                      |
| Prism material stylelint                                    | Pass                                                      |
| Opaque token contrast script                                | **14 checks passed** in light/dark                        |
| Legacy generated token file                                 | Unchanged after fixing scoped palette extraction          |
| Diff whitespace and browser script syntax                   | Pass                                                      |

Total executed unit/interaction tests listed above: **211 passed**. Tests do not rely on Chromatic. The 11 Tabs snapshots were reviewed and updated only for the added focus handler; 23 TextField snapshots were reviewed and updated for omission of empty role attributes. Subsequent runs passed without `-u`.

## Browser and visual review

The local script `node scripts/prism-browser-check.cjs` opens the built Storybook stories at 390, 768 and 1440 px in light and dark modes, with reduced motion. It blocks external asset requests so screenshots use Prism’s actual system font stack consistently. It checks horizontal overflow, WCAG-tagged axe rules and runtime errors, and captures local screenshots. It also exercises the opaque material override and Modal Escape/focus restoration.

Browser result: **all 6 mode/viewport scenarios passed**, with no horizontal overflow, WCAG-tagged axe violations or runtime errors. Dialogs fit inside each viewport; Escape restored focus to the trigger. The explicit reduced-transparency override produced `backdrop-filter: none`. Screenshots were reviewed in light and dark modes.

A real mobile overflow in Tabs and inherited global code styling were found during this process and corrected. These checks are current screenshots and interaction assertions, not established pixel-diff regression baselines. Axe does not certify contrast over arbitrary glass backgrounds.

## Skipped or deferred

- Remote Chromatic publishing and screenshot comparison: no external credentials used.
- Entire 68-workspace test suite, mobile device/GPU benchmarks, Safari/Firefox and React version matrix: not executed.
- Full license/SBOM audit of transitive dependencies: not represented as complete. No new runtime dependency was added; existing license notices are preserved.
- Genuine SVG/Canvas/WebGL refraction: not implemented; the named material uses a documented liquid fallback.
- Individual visual and behavior certification of all 57 component packages: remaining milestone work.

The inherited all-component Storybook still emits large-chunk warnings (including a roughly 5.3 MB uncompressed preview chunk). Lazy-loading the upstream live editor/playground and splitting the reference docs are recommended before treating documentation bundle performance as finished.
