import React, { useEffect, useMemo, useRef, useState } from "react";
import ColorPickerComponent from "./color-picker-component";

function EyedropperIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
    >
      <g fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4l6 6" />
        <path d="M4 20l6-6" />
        <path d="M16 2a2.8 2.8 0 014 4l-8 8-4 1 1-4 8-8z" fill="#666" stroke="#333" />
        <path d="M10 14l-4 1 1-4" />
      </g>
    </svg>
  );
}

export default function ColorPickerLauncher() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Draggable position (fixed coordinates)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRef = useRef<{ dragging: boolean; dx: number; dy: number }>({ dragging: false, dx: 0, dy: 0 });
  const lastSampleRef = useRef<number>(0);
  const [previewColor, setPreviewColor] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [pickerSupported, setPickerSupported] = useState<boolean>(false);
  const longPressTimer = useRef<number | null>(null);

  // Initialize near bottom-right with 24px margin
  useEffect(() => {
    const size = 40; // button size
    const margin = 24;
    setPos({ x: Math.max(8, window.innerWidth - size - margin), y: Math.max(8, window.innerHeight - size - margin) });
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      const insidePanel = panelRef.current?.contains(target);
      const insideBtn = btnRef.current?.contains(target);
      if (!insidePanel && !insideBtn) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onMove(e: MouseEvent) {
      if (!dragRef.current.dragging) return;
      const x = e.clientX - dragRef.current.dx;
      const y = e.clientY - dragRef.current.dy;
      const maxX = window.innerWidth - 40 - 8;
      const maxY = window.innerHeight - 40 - 8;
      setPos({ x: Math.min(Math.max(8, x), maxX), y: Math.min(Math.max(8, y), maxY) });
      maybeSamplePreview();
    }
    function onUp() {
      dragRef.current.dragging = false;
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Touch support
  useEffect(() => {
    function onTouchMove(e: TouchEvent) {
      if (!dragRef.current.dragging) return;
      const t = e.touches[0];
      const x = t.clientX - dragRef.current.dx;
      const y = t.clientY - dragRef.current.dy;
      const maxX = window.innerWidth - 40 - 8;
      const maxY = window.innerHeight - 40 - 8;
      setPos({ x: Math.min(Math.max(8, x), maxX), y: Math.min(Math.max(8, y), maxY) });
      maybeSamplePreview();
    }
    function onTouchEnd() {
      dragRef.current.dragging = false;
    }
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchmove", onTouchMove as any);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Detect EyeDropper support
  useEffect(() => {
    // @ts-ignore
    setPickerSupported(typeof window !== "undefined" && typeof (window as any).EyeDropper === "function");
  }, []);

  function startDrag(e: React.MouseEvent | React.TouchEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if ("touches" in e && e.touches[0]) {
      const t = e.touches[0];
      dragRef.current.dx = t.clientX - rect.left;
      dragRef.current.dy = t.clientY - rect.top;
    } else {
      const me = e as React.MouseEvent;
      dragRef.current.dx = me.clientX - rect.left;
      dragRef.current.dy = me.clientY - rect.top;
    }
    dragRef.current.dragging = true;
    // long press to trigger EyeDropper
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => {
      openEyeDropper();
    }, 600);
  }

  function endPress() {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function maybeSamplePreview() {
    const now = performance.now();
    if (now - lastSampleRef.current < 60) return; // ~16 fps
    lastSampleRef.current = now;
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const color = getElementColorAtPoint(cx, cy);
    if (color) setPreviewColor(color);
  }

  function parseCssColorToRgba(s: string | null): { r: number; g: number; b: number; a: number } | null {
    if (!s) return null;
    s = s.trim().toLowerCase();
    if (s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
    const rgbaMatch = s.match(/^rgba?\(([^)]+)\)$/);
    if (rgbaMatch) {
      const parts = rgbaMatch[1].split(",").map(p => p.trim());
      const r = parseInt(parts[0], 10);
      const g = parseInt(parts[1], 10);
      const b = parseInt(parts[2], 10);
      const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
      if ([r, g, b].some(n => Number.isNaN(n)) || Number.isNaN(a)) return null;
      return { r, g, b, a };
    }
    if (s[0] === '#') {
      let hex = s.slice(1);
      if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return { r, g, b, a: 1 };
      }
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b, a: 1 };
      }
    }
    return null;
  }

  function rgbaToHex(c: { r: number; g: number; b: number; a?: number }): string {
    const toH = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toH(Math.max(0, Math.min(255, Math.round(c.r))))}${toH(Math.max(0, Math.min(255, Math.round(c.g))))}${toH(Math.max(0, Math.min(255, Math.round(c.b))))}`;
  }

  function pickMostOpaque(colors: (string | null)[]): string | null {
    let best: { hex: string; a: number } | null = null;
    for (const s of colors) {
      const rgba = parseCssColorToRgba(s);
      if (!rgba) continue;
      if (rgba.a === 0) continue;
      const hex = rgbaToHex(rgba);
      if (!best || rgba.a > best.a) {
        best = { hex, a: rgba.a };
      }
    }
    return best?.hex ?? null;
  }

  function getPageElementAtPoint(x: number, y: number): HTMLElement | null {
    const list = (document.elementsFromPoint(x, y) || []) as Element[];
    for (const el of list) {
      if (!(el instanceof HTMLElement)) continue;
      if (containerRef.current && containerRef.current.contains(el)) continue; // skip our overlay
      return el;
    }
    return null;
  }

  function getElementColorAtPoint(x: number, y: number): string | null {
    let el: HTMLElement | null = getPageElementAtPoint(x, y);
    if (!el) return null;
    // Walk up ancestors until we find a non-transparent color candidate
    let depth = 0;
    while (el && depth < 6) {
      const cs = getComputedStyle(el);
      const candidates = [
        cs.backgroundColor,
        cs.color,
        cs.borderTopColor,
        cs.borderRightColor,
        cs.borderBottomColor,
        cs.borderLeftColor,
      ];
      const chosen = pickMostOpaque(candidates);
      if (chosen) return chosen;
      el = el.parentElement;
      depth += 1;
    }
    return null;
  }

  async function openEyeDropper() {
    endPress();
    try {
      // @ts-ignore
      if (typeof (window as any).EyeDropper !== 'function') {
        alert('Pick from screen is not supported in this browser.');
        return;
      }
      // @ts-ignore
      const ed = new (window as any).EyeDropper();
      const res = await ed.showPicker();
      if (res && res.sRGBHex) setPickedColor(res.sRGBHex);
    } catch (e) {
      // user cancelled or not available
    }
  }

  const swatchColor = useMemo(() => pickedColor || previewColor, [pickedColor, previewColor]);
  const swatchLabel = useMemo(() => (pickedColor ? 'Picked' : (previewColor ? 'Preview' : '')), [pickedColor, previewColor]);

  return (
    <div ref={containerRef} style={{ position: "fixed", top: pos.y, left: pos.x, zIndex: 2147483647 }}>
      <button
        ref={btnRef}
        type="button"
        aria-label={open ? "Close color picker" : "Open color picker"}
        title={swatchColor ? `${swatchLabel} color ${swatchColor}` : undefined}
        onClick={() => setOpen((v) => !v)}
        onMouseDown={startDrag}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStart={startDrag}
        onTouchEnd={endPress}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: 20,
          border: "1px solid #d1d5db",
          background: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          cursor: "grab",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        <EyedropperIcon size={18} />
      </button>

      {swatchColor && (
        <div
          style={{
            position: "absolute",
            top: -6,
            left: -6,
            width: 14,
            height: 14,
            borderRadius: 7,
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            background: swatchColor,
          }}
          title={`${swatchLabel} ${swatchColor}`}
          aria-label={`${swatchLabel} ${swatchColor}`}
        />
      )}

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          style={{
            position: "absolute",
            bottom: 48,
            right: 0,
            width: 320,
            maxWidth: "90vw",
            padding: 8,
            background: "#fff",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <button
              type="button"
              onClick={openEyeDropper}
              disabled={!pickerSupported}
              style={{ padding: '6px 8px', border: '1px solid #d1d5db', background: '#fff', borderRadius: 6, cursor: pickerSupported ? 'pointer' : 'not-allowed' }}
            >
              Pick from screen
            </button>
            {swatchColor && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 16, height: 16, border: '1px solid #e5e7eb', borderRadius: 3, background: swatchColor }} />
                <span style={{ fontSize: 12, color: '#6b7280' }}>{swatchLabel}:</span>
                <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{swatchColor}</span>
              </div>
            )}
          </div>
          <ColorPickerComponent />
        </div>
      )}
    </div>
  );
}
