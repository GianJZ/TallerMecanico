import { useEffect, useRef, useState } from "react";

/**
 * Designed for USB barcode scanner (keyboard wedge).
 * User scans -> input fills -> Enter triggers onScan(code).
 */
export function BarcodeInput({ onScan, placeholder = "Escanea código de barras y presiona Enter..." }) {
  const ref = useRef(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    // auto focus for fast workflow
    ref.current?.focus();
  }, []);

  return (
    <div className="flex gap-2 items-center">
      <input
        ref={ref}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const code = value.trim();
            if (code) onScan(code);
            setValue("");
          }
        }}
      />
      <button
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 hover:bg-slate-100"
        onClick={() => {
          const code = value.trim();
          if (code) onScan(code);
          setValue("");
          ref.current?.focus();
        }}
      >
        OK
      </button>
    </div>
  );
}
