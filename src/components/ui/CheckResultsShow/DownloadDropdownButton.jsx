import React, { useRef, useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import Button from "../Button";
import { toLocaleDateString } from "../../../helpers/date";

export default function DownloadDropdownButton({ day, data, modules }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function downloadBlob(content, mime, filename) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: filename,
    });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /* ---------- CSV ---------- */
  function toCSV(rows, columns) {
    if (!rows || !rows.length) return "";

    const cols =
      columns && columns.length
        ? columns
        : rows.reduce((acc, r) => {
            Object.keys(r).forEach((k) => {
              if (!acc.includes(k)) acc.push(k);
            });
            return acc;
          }, []);

    const escapeCell = (val) => {
      let s =
        val == null
          ? ""
          : Array.isArray(val)
          ? val.join(", ")
          : typeof val === "object"
          ? JSON.stringify(val)
          : String(val);
      s = s.replace(/"/g, '""');
      if (/[",\n]/.test(s)) s = `"${s}"`;
      return s;
    };

    const header = cols.map(escapeCell).join(",");
    const body = rows
      .map((r) => cols.map((c) => escapeCell(r[c])).join(","))
      .join("\n");
    return header + "\n" + body;
  }
  const handleClickCSV = useCallback(() => {
    const rows = data[1].slices;
    const day = data[1].day;
    const columns = Object.keys(rows[0]);
    const csv = toCSV(rows, columns);
    downloadBlob(csv, "text/csv;charset=utf-8", `${day}.csv`);
  }, [data, modules]);

  const handleClickJSON = useCallback(() => {
    const day = data[1].day;
    const json = JSON.stringify(data, null, 2);
    downloadBlob(json, "application/json;charset=utf-8", `${day}.json`);
  }, [data]);

  const handleClickPDF = useCallback(() => {
    const rows = data[1].slices;
    const day = data[1].day;
    const title = `Compliance check ${day}`;

    if (!rows || !rows.length) {
      alert("No data to export");
      return;
    }

    const columns = Object.keys(rows[0]);
    const body = rows.map((r) =>
      columns.map((c) => {
        const v = r[c];
        if (v == null) return "";
        if (Array.isArray(v)) return v.join(", ");
        if (typeof v === "object") return JSON.stringify(v);
        return String(v);
      })
    );

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;

    doc.setFontSize(14);
    doc.text(title, margin, margin);

    autoTable(doc, {
      startY: margin + 10,
      head: [columns],
      body,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [66, 66, 66] },
      margin: { left: margin, right: margin },
      tableWidth: "auto",
    });

    doc.save(`${day}.pdf`);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        onClick={() => setOpen(!open)}
        className="inline-flex justify-center items-center text-sm !py-1"
        variant="normal"
      >
        Download
        <svg
          className={`ml-2 h-5 w-5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {open && (
        <div className="absolute right-0 w-40 bg-white rounded-md border shadow-lg ring-1 ring-black ring-opacity-5 z-10 animate-fade-in">
          <div className="py-1">
            {day && (
              <>
                <p className="block w-full text-right px-4 border-b text-xs text-gray-500">
                  Download {toLocaleDateString(day)}
                </p>
                <button
                  onClick={handleClickCSV}
                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  Download to CSV
                </button>
                <button
                  onClick={handleClickJSON}
                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  Download to JSON
                </button>
                <button
                  onClick={handleClickPDF}
                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  Download to PDF
                </button>
              </>
            )}
            <p className="block w-full text-right px-4 border-b text-xs text-gray-500">
              Download all
            </p>
            <button
              onClick={handleClickCSV}
              className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              Download to CSV
            </button>
            <button
              onClick={handleClickJSON}
              className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              Download to JSON
            </button>
            <button
              onClick={handleClickPDF}
              className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              Download to PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
