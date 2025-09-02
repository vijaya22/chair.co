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
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={btnRef}
        type="button"
        aria-label={open ? "Close color picker" : "Open color picker"}
        onClick={() => setOpen((v) => !v)}
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
          cursor: "pointer",
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

