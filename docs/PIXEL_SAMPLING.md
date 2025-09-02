# Launcher Pixel Sampling — Design & Checklist

## Overview
Enable the bottom-right launcher icon to report the color of the page pixel underneath its center, without requesting the `tabs` permission. Provide an accurate, user-gesture-based picker and a best-effort heuristic for quick previews.

## UX
- Idle: small eyedropper icon; draggable within viewport.
- On sample: updates a tiny swatch/tooltip next to the button with the sampled color; click still opens full picker.
- Non-goals: OS-level picker; sampling on Chrome UI or `chrome://` pages.

## Technical Approach (No `tabs` Permission)
- Accurate sampling: use the built-in `EyeDropper` Web API (Chromium). It requires an explicit user gesture and returns the exact pixel color anywhere on the page. No extension permissions needed.
- Quick heuristic preview: when dragging, compute the element under the icon center with `document.elementFromPoint` and read a representative color from computed styles (e.g., `background-color`, `color`, `border-color`). This is not pixel-perfect (images/gradients are not supported) but provides instant feedback without extra permissions.

## Architecture
- Content Script (CS): UI + coordinates + heuristic color derivation + `EyeDropper` invocation on demand.
- Service Worker (SW): Not required for sampling. Keep only if needed for other features.

## Permission Strategy (No "tabs")
- Do not add `"tabs"`. Prefer zero additional permissions for sampling.
- `EyeDropper` works in the page context without extra permissions; it only requires a user gesture.
- Manifest remains minimal:
```json
{
  "manifest_version": 3,
  "permissions": ["activeTab"],
  "action": { "default_popup": "index.html", "default_title": "chair.co" }
}
```
Note: `activeTab` is optional here; keep it only if other features need it. The color picking itself does not require it.

## Data Flow
1) CS hides overlay (`visibility: hidden`), waits a frame.
2) CS sends `CAPTURE` to SW.
3) On user click of “Pick” (e.g., clicking the launcher or a dedicated button), CS calls `new EyeDropper().showPicker()`.
4) Resolve color (sRGB hex) and update swatch/tooltip and internal state. If unsupported or user cancels, show a subtle message.

## Heuristic Coordinate Mapping (for previews)
- `centerX = btnRect.left + btnRect.width/2`
- `centerY = btnRect.top + btnRect.height/2`
- `el = document.elementFromPoint(centerX, centerY)`
- Color candidates from `getComputedStyle(el)`: `background-color`, `color`, borders; choose the most opaque, non-transparent candidate.

## Edge Cases & Performance
- `EyeDropper` is not available on some pages (e.g., `chrome://*`) or may be blocked inside certain iframes; disable and message accordingly.
- Heuristic preview may differ from actual pixel color on images/gradients/video; label it as “preview”.
- Throttle heuristic checks during drag to ~10–20 Hz using `requestAnimationFrame` timestamps.

## Privacy
- Only capture current tab on demand; do not persist images.
- Request minimal permissions; document behavior in README.

- [ ] Manifest: keep minimal permissions (no `tabs`).
- [ ] CS: add heuristic preview under icon using `elementFromPoint` + computed styles (document limitations in code comment).
- [ ] CS: add accurate picker button/handler using `EyeDropper().showPicker()`; update state with resolved color; handle cancel/unsupported.
- [ ] CS: throttle heuristic sampling during drag; stop on mouseup/touchend; avoid layout thrash.
- [ ] UI: add small swatch next to the icon, with ARIA label (`title` fallback) showing color text.
- [ ] Fallback: if `EyeDropper` unsupported, show helper text and keep heuristic-only mode.
- [ ] Tests: unit-test mapping helper; manual runbook for zoom/DPI; verify panel still opens and works.
- [ ] Docs: update README with permission rationale and how sampling works.

## Limitations Without "tabs"
- Requires a user gesture on the extension (toolbar button or command) to grant `activeTab` before sampling; content script clicks alone do not grant it.
- Grant resets on navigation. Keep UX nudge minimal and clear.

## Acceptance Criteria
- [ ] Clicking “Pick” opens `EyeDropper` and returns a color accurately.
- [ ] Dragging shows a stable preview swatch; no jank at ~10–20 Hz.
- [ ] Heuristic preview clearly labeled; actual pick overrides it.
- [ ] Works on standard HTTP(S) pages; gracefully disables on restricted contexts.
- [ ] Clear, concise user messaging when picking is unavailable or cancelled.
