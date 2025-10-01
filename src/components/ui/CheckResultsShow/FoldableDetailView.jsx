import React, { useRef, useState } from "react";
export default function FoldableDetailView({ children }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);

  return (
    <div className="w-full shadow">
      <div className="w-full">
        <button
          onClick={() => setOpen(!open)}
          className="flex justify-between items-center px-4 py-1 gap-1 hover:underline"
        >
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span className="font-medium text-sm">
            {open ? "hide" : "view more"}
          </span>
        </button>
      </div>

      <div
        ref={contentRef}
        className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${
          open ? "max-h-96" : "max-h-0"
        }`}
        style={{ maxHeight: open ? contentRef.current?.scrollHeight : 0 }}
      >
        <div className="px-4 py-3 bg-white border-t">{children}</div>
      </div>
    </div>
  );
}
