# Launcher Pixel Sampling — Design & Checklist

## Overview
Enable the bottom-right launcher icon to report the color of the page pixel underneath its center. It updates on demand (click) and while dragging.

## UX
- Idle: small eyedropper icon; draggable within viewport.
- On sample: updates a tiny swatch/tooltip next to the button with the sampled color; click still opens full picker.
- Non-goals: OS-level picker; sampling on Chrome UI or `chrome://` pages.

## Technical Approach
- Capture the visible tab via `chrome.tabs.captureVisibleTab` (PNG).
- Hide our overlay before capture to avoid sampling our own UI; restore after.
- Draw the data URL to an offscreen `<canvas>` and sample the pixel under the icon center.
- Convert CSS pixels to screenshot pixels using `devicePixelRatio`.

## Architecture
- Content Script (CS): UI + coordinates + canvas sampling.
- Service Worker (SW): Performs capture and returns data URL.
- Messaging: CS → SW `{type:"CAPTURE"}`; SW → CS `{type:"CAPTURE_RESULT", dataUrl}`.

## Permission Strategy (No "tabs")
- Recommended: use only `"activeTab"` (no `"tabs"`).
- Rationale: `activeTab` grants temporary access to the active tab after a user gesture on the extension (e.g., clicking the toolbar icon or using a keyboard shortcut). `chrome.tabs.captureVisibleTab` works under this grant.
- Manifest additions:
```json
{
  "manifest_version": 3,
  "permissions": ["activeTab"],
  "action": { "default_popup": "index.html", "default_title": "chair.co" },
  "background": { "service_worker": "background.js" }
}
```
Note: keep the content script as-is. The user must click the extension action once per tab to “arm” sampling.

## Data Flow
1) CS hides overlay (`visibility: hidden`), waits a frame.
2) CS sends `CAPTURE` to SW.
3) SW calls `chrome.tabs.captureVisibleTab({ format: "png" })` and replies with data URL. If `Permission denied`, return `NO_ACTIVE_TAB_ACCESS` and prompt the user to click the toolbar icon.
4) CS draws image to canvas; computes center → DPR-scaled `(x,y)` → `getImageData`.
5) CS restores overlay; updates swatch/tooltip and state.

## Coordinate Mapping
- `centerX = btnRect.left + btnRect.width/2`
- `centerY = btnRect.top + btnRect.height/2`
- `sampleX = Math.round(centerX * window.devicePixelRatio)`
- `sampleY = Math.round(centerY * window.devicePixelRatio)`

## Edge Cases & Performance
- High-DPI/zoom: handled by DPR scaling; test at 100/125/150%.
- Restricted pages: skip sampling on `chrome://*`, Chrome Web Store.
- Drag sampling: throttle to ~10–20 Hz with `requestAnimationFrame` timestamp gating.
- Errors: show unobtrusive tooltip like “Sampling not available here”.

## Privacy
- Only capture current tab on demand; do not persist images.
- Request minimal permissions; document behavior in README.

## Implementation Checklist
- [ ] Manifest: add `"activeTab"`, `background.service_worker`, and ensure an `action` is present for user activation (no `"tabs"`).
- [ ] Build: add `background: "./src/background.ts"` entry in `webpack.config.js` → output `background.js`.
- [ ] SW: implement `background.ts` listener for `chrome.runtime.onMessage` `CAPTURE` → `captureVisibleTab` → respond with data URL.
- [ ] CS: add sampling util in launcher component:
  - [ ] Hide overlay, `await next animation frame`.
  - [ ] Send `CAPTURE`; handle timeout/error.
  - [ ] If error `NO_ACTIVE_TAB_ACCESS`, show inline nudge: “Click the extension icon to enable sampling on this tab,” and optionally open the popup programmatically via instructions.
  - [ ] Draw image to offscreen canvas; sample pixel; convert to hex/RGB.
  - [ ] Restore overlay; update swatch tooltip and internal color state.
  - [ ] During drag: throttle sample loop; cancel on mouseup/touchend.
- [ ] UI: add small swatch next to the icon, with ARIA label (`title` fallback) showing color text.
- [ ] Fallback: on failure, try `EyeDropper` API when user explicitly clicks “Pick from screen” (if available).
- [ ] Tests: unit-test mapping helper; manual runbook for zoom/DPI; verify panel still opens and works.
- [ ] Docs: update README with permission rationale and how sampling works.

## Limitations Without "tabs"
- Requires a user gesture on the extension (toolbar button or command) to grant `activeTab` before sampling; content script clicks alone do not grant it.
- Grant resets on navigation. Keep UX nudge minimal and clear.

## Acceptance Criteria
- [ ] Clicking the icon samples and shows the correct color swatch.
- [ ] Dragging updates swatch at a reasonable rate without jank.
- [ ] Overlay is not visible in captured image (no self-sampling artifact).
- [ ] Works on standard HTTP(S) pages at multiple zoom levels and DPRs.
- [ ] Graceful message when sampling is unavailable.
