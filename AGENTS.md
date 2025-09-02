# Repository Guidelines

## Project Structure & Module Organization
- `frontend-chrome-ext/`: Chrome extension source (React + TypeScript).
- `frontend-chrome-ext/src/`: App code, components, tests.
- `frontend-chrome-ext/dist/`: Webpack build output to load in Chrome.
- `frontend-chrome-ext/manifest.json`: Extension configuration (popup, content scripts).
- `frontend-chrome-ext/webpack.config.js`: Build pipeline for popup (`popup`) and content script (`main`).

## Build, Test, and Development Commands
- Install: `cd frontend-chrome-ext && npm install`.
- Dev watch (build to `dist/` on change): `npm run watch`.
- Production build (clean + bundle to `dist/`): `npm run build`.
- CRA dev server (popup only): `npm start`.
- Tests (watch mode): `npm test`.

Tip: For extension testing, load `frontend-chrome-ext/dist/` as an unpacked extension in Chrome. Rebuild after changes.

## Coding Style & Naming Conventions
- Language: TypeScript with `"strict": true` (see `tsconfig.json`).
- Linting: CRA ESLint config (`react-app`). Fix warnings before PR.
- Indentation: 2 spaces; semicolons required; single quotes in TS/JS.
- Naming: `PascalCase` for components (e.g., `Popup.tsx`), `camelCase` for variables/functions, entry points lowercase (`index.tsx`, `main.tsx`).
- Keep React components functional; colocate small component files under `src/`.

## Testing Guidelines
- Frameworks: Jest + React Testing Library (`@testing-library/*`).
- Test files: `*.test.tsx` adjacent to source in `src/`.
- Run: `npm test` (watch) or `CI=true npm test` for single pass.
- Aim to cover component rendering and user interactions; avoid DOM implementation details.

## Commit & Pull Request Guidelines
- Commits: clear, imperative subject (e.g., `feat: add popup color preview`, `fix: debounce eyedropper sampling`).
- Scope small; commit early and often.
- PRs: include summary, motivation, screenshots/GIFs of popup or content script, and steps to verify (how to load `dist/`). Link related issues.

## Security & Extension Tips
- Update `manifest.json` version on user‑visible changes; keep permissions minimal.
- Do not commit secrets or API keys. Review `web_accessible_resources` and content script matches.
- After `npm run build`, verify `dist/` contains `index.html`, `popup.js`, and `main.js` and that the extension loads without errors.
