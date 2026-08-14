# EchoVerify — Prototype

This repository contains a lightweight prototype of EchoVerify: a small interactive walkthrough demonstrating a verifier workflow for voice notes. The feature/a11y-playwright-axe branch adds accessibility improvements, Playwright end-to-end tests with axe-core accessibility checks, and a CI workflow to run accessibility checks.

This README documents how the project is structured, how to run the app locally, how to run tests (including Playwright + axe), and details about the CI workflow and failure thresholds.

## What's included in this branch

Files of interest (on feature/a11y-playwright-axe):

- `index.html` — Vite entry HTML.
- `package.json` — scripts and devDependencies (includes `@playwright/test` and `axe-core`, and `test:e2e`).
- `src/main.jsx` — application entry (mounts React app).
- `src/App.jsx` — lightweight App wrapper that renders the prototype.
- `src/EchoVerify_Prototype.jsx` — the main prototype UI with accessibility improvements:
  - Roving tabindex for the stamp rail and clip list
  - Programmatic focus-sync when navigating steps
  - Skip link and visually-hidden announcer for aria-live
  - Proper `button` `type` attributes
- `src/styles.css` — styles used by the prototype (skip link, focus-visible styles, visually-hidden helper, reduced-motion support).
- `src/styles.css` — visual tokens & focus styles for keyboard users.

Planned/remaining files to be committed in this branch (if not present yet):

- `playwright.config.ts` — Playwright configuration (webServer to start Vite for tests).
- `tests/keyboard-flow.spec.ts` — Playwright tests that include axe-core checks and fail on serious/critical violations.
- `.github/workflows/a11y.yml` — CI workflow to run Playwright and other accessibility checks and upload artifacts.

If anything above is missing in the branch, it will be committed as part of this feature branch before opening the PR.

---

## Getting started (local development)

Prerequisites
- Node.js 18+ (Node 20 recommended)
- npm (or yarn/pnpm) installed

Install dependencies

```
npm install
```

Start the dev server (Vite)

```
npm run dev
```

Open http://localhost:5173 in your browser (Vite typically uses port 5173).

Note: Playwright tests (see below) can also start the dev server automatically using the webServer setting in `playwright.config.ts`.

---

## Running the Playwright E2E tests (with axe-core)

Install Playwright browsers (required once):

```
npx playwright install
```

Run the tests:

```
# run all tests
npx playwright test

# or using the package script
npm run test:e2e
```

What the tests do
- The tests exercise keyboard flows for the prototype (stamp rail navigation, clip list navigation, activation of steps)
- At several checkpoints the tests inject `axe-core` into the page and run `axe.run(document, options)`
- The tests will fail if any accessibility violation returned by axe has impact `serious` or `critical`. The test prints the violations to the console for debugging.

Adjusting the failure threshold
- If you want to change which impacts fail the test, edit the test code where violations are filtered. For example, to include `moderate` as failures, update the filter to include `moderate`.

Example snippet from the tests (informational):

```js
const results = await runAxe(page);
const criticalOrSerious = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
expect(criticalOrSerious.length).toBe(0);
```

Saving axe results / artifacts
- The tests can write the axe JSON results to disk as a Playwright artifact or attach them to CI job artifacts. This is recommended so you can triage violations in CI.

---

## Continuous Integration (CI)

A GitHub Actions workflow `.github/workflows/a11y.yml` is included in this branch and is intended to:

- Install dependencies
- Install Playwright browsers
- Run Playwright tests
- Optionally run other accessibility checks (pa11y, Lighthouse) if configured
- Upload test artifacts (Playwright traces, screenshots, axe JSON results) for failing runs

Notes about secrets and tokens
- If you configure Lighthouse CI or external services you may need to provide tokens or secrets in the repository settings. This workflow will run Playwright tests without secrets.

---

## Accessibility considerations implemented

- Roving tabindex pattern for keyboard navigation on the stamp rail and clip list so arrow keys move a single logical focusable element while preserving tab order.
- Properly set `aria-selected`, `role="tab"` on the stamp rail items, and `aria-pressed` for clip items to expose state to assistive tech.
- Programmatic focus synchronization: when navigating to a new step the primary heading receives focus (tabindex="-1" and focus()) to ensure screen readers announce the new section.
- An off-screen, visually-hidden live region (`aria-live="polite"`) is used to announce important status updates.
- Skip link added so keyboard users can bypass navigation to the main content.
- Focus styles: use `:focus-visible` to show visible focus only for keyboard users; `prefers-reduced-motion` respected.

---

## Troubleshooting

- Playwright tests fail to start the server: ensure no other process is using the Vite port (5173) or adjust the webServer port in `playwright.config.ts`.
- axe-core reports violations: open the test run logs to inspect the printed violations and run axe locally using the browser devtools axe extension or by reproducing the failing test in Playwright.
- `npx playwright install` failing on CI: ensure the runner has required packages and permissions; consider caching Playwright browsers in CI.

---

## Contributing

This branch is intended to be reviewed via a pull request. Typical contribution flow:

1. Fork or create a branch from `main`.
2. Make changes and run tests locally (`npm run test:e2e`).
3. Push your branch and open a pull request; mention accessibility reviewers if available.

When reviewing accessibility failures reported by axe in CI, prefer to:
- Fix clear semantic or missing attribute issues (aria-label, role, correct element type)
- For visual contrast issues, ensure color tokens meet WCAG thresholds or adjust designs
- For more complex problems, annotate the rule with a comment and create an issue to track design fixes

---

## License & attribution

This prototype uses `lucide-react` for icons and `axe-core` for automated accessibility checks in tests. The rest of the code in this branch is authored as part of the EchoVerify prototype.

---

If you want, I can now:

- Open the pull request for feature/a11y-playwright-axe → default branch (I can do this next), or
- Add the remaining files (Playwright config, tests, CI workflow) to this branch and then open the PR.

Which would you like me to do next?