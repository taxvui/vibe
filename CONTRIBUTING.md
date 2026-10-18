# Contributing to Vibe Prism

This is an independent fork. Please retain existing license and attribution notices. Read [the architecture](docs/PRISM.md) and [the audit](docs/AUDIT.md) before changing component APIs.

Use Node 20.12 and Yarn Classic 1.22.22. Follow the root README setup. Keep semantic tokens in `packages/style/src/prism.scss`, reuse existing accessible primitives, and preserve React >=16.9 compatibility. Prefer scoped CSS and native composition; add a dependency only with an explicit size, browser-support and maintenance justification.

For Prism changes, run the focused core and docs tests, the style build, the core dependency build and the static Storybook build described in README. Check desktop, tablet and mobile, both themes, keyboard focus, Escape, reduced motion and opaque fallback. Record skipped checks honestly. Remote Chromatic needs credentials and is not a substitute for local tests. Do not update unrelated snapshots to hide regressions.

Include a concise problem/behavior description, validation results and any API migration notes in your PR. Publishing packages, deployment and history rewriting require separate authorization.

---

The original upstream contribution guidance follows for historical context; fork-specific instructions above take precedence.

# Contribution Guide

Hi there! We're really excited that you're interested in contributing to Vibe. Before submitting your contribution, please make sure to take a moment and read through the following guidelines:

## Issue reporting

For new features, suggestions, or general questions, please make sure to create a [discussion](https://github.com/taxvui/vibe/discussions) first.

If you found a bug, please [create an issue](https://github.com/taxvui/vibe/issues/new).

## Development Setup

Storybook is used as the project's development environment. You can use it to preview your changes and test components in isolation. To start working locally, run the following command in the root directory:

```bash
yarn install
yarn storybook
```

### Testing

There are several layers of testing, such as unit/component tests, integration, a11y, and end-to-end tests. Every new feature or bug fix should be covered by tests, depending on the type of change.

Please make sure to run tests before submitting your PR:

```bash
yarn test
```

If snapshot tests fail, and you are sure that the changes are intentional, update them by running:

```bash
yarn test:update
```

### Linting and formatting

We use [Prettier](https://prettier.io/) for code formatting. Please, make sure to use it in your editor to keep the codebase consistent.

Please make sure to run linting and formatting before submitting your PR:

```bash
yarn lint
```

### Commits

The project is using [Conventional Commits](https://www.conventionalcommits.org/) to standardize the commit messages, and release new versions automatically according to [Semantic Versioning](https://semver.org/).

Please make sure to follow the convention for creating Pull Requests and commits.

## Creating a Pull Request

When creating a PR, please make sure to:

- Create a PR title based on the [Conventional Commits](https://www.conventionalcommits.org/) format
- Add a description of the changes you're making, including the motivation for these changes, and any additional context
- Link to any related issues or discussions
- Make sure that all checks are passed

After submitting your PR, the maintainers will review your changes and provide feedback. If everything is good, your PR will be merged.

**We really appreciate your contribution to Vibe! 🚀**
