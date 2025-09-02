import React, { useEffect, useRef, useState } from "react";
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

  // Draggable position (fixed coordinates)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRef = useRef<{ dragging: boolean; dx: number; dy: number }>({ dragging: false, dx: 0, dy: 0 });

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
  }

  return (
    <div style={{ position: "fixed", top: pos.y, left: pos.x, zIndex: 2147483647 }}>
      <button
        ref={btnRef}
        type="button"
        aria-label={open ? "Close color picker" : "Open color picker"}
        onClick={() => setOpen((v) => !v)}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
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
          <ColorPickerComponent />
        </div>
      )}
    </div>
  );
}
