import React, { useRef, useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import Icon from "./Icon";
import Button from "./Button";

const CheckResults = ({ data }) => {
  // const data = checkResult;

  const modules = data.modules;
  const resultData = data.result;

  return (
    <>
      <div className="py-6 space-y-6 max-w-7xl">
        <h2 className="text-xl font-semibold">Resultaten {data.date}</h2>

        {resultData && resultData.length >= 2 ? (
          <ComplianceDetailView
            checkResult={data}
            groupName="Dolfijntjes"
            groupType="Baby Group"
            bkrDailyLimitHours={3}
          />
        ) : (
          <p>No data available</p>
        )}

        <FoldableDetailView>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-lg">Summary</h3>
            <p>{data.summary}</p>
            <div>
              <p>Files</p>
              {data.references.flat().map((item, index) => (
                <p key={index} className="pl-2 text-sm">
                  {item.substring(9)}
                </p>
              ))}
            </div>
            <SummaryView result={resultData} modules={modules} />
          </div>

          <ResultTable resultData={resultData} modules={modules} />
        </FoldableDetailView>
      </div>
    </>
  );
};

export default CheckResults;

const SummaryView = ({ result, modules }) => {
  if (!result || result.length < 2) return <></>;
  const checkVGC = modules.includes("vgc");
  const checkThreeHours = modules.includes("threeHours");

  const resultData = result[1];
  const slices = resultData.slices || [];
  const summary = resultData.three_uurs_summary || {};

  // Calculate BKR and VGC summaries
  const bkrSummary = slices.reduce(
    (acc, slice) => {
      if (slice.BKR === "Yes") acc.yes++;
      else if (slice.BKR === "No") acc.no++;
      return acc;
    },
    { yes: 0, no: 0 }
  );

  const vgcSummary = checkVGC
    ? slices.reduce(
        (acc, slice) => {
          if (slice.VGC === "Yes") acc.yes++;
          else if (slice.VGC === "No") acc.no++;
          return acc;
        },
        { yes: 0, no: 0 }
      )
    : null;

  return (
    <>
      <p>
        <strong>BKR:</strong> Yes ({bkrSummary.yes}), No ({bkrSummary.no})
      </p>
      {checkVGC && (
        <p>
          <strong>VGC:</strong> Yes ({vgcSummary.yes}), No ({vgcSummary.no})
        </p>
      )}
      {checkThreeHours && (
        <p>
          <strong>3-UURS:</strong> {summary["3-UURS"] || "N/A"}
        </p>
      )}
      {summary.Reason && (
        <p>
          <strong>Reason:</strong> {summary.Reason}
        </p>
      )}
      {summary.Deviations && summary.Deviations.length > 0 && (
        <div>
          <strong>Deviations:</strong>
          <ul className="list-disc list-inside ml-4">
            {summary.Deviations.map((dev, i) => (
              <li key={i}>{dev}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

const ResultTable = ({ resultData, modules }) => {
  if (!resultData || resultData.length < 2 || !resultData[1].slices)
    return <></>;
  const checkVGC = modules.includes("vgc");
  const checkThreeHours = modules.includes("threeHours");

  return (
    <>
      <div className="flex justify-end mb-2">
        <DownloadDropdownButton data={resultData} modules={modules} />
      </div>
      <div className="overflow-x-auto max-h-[60vh] overflow-y-scroll border">
        <table className="min-w-full border border-gray-300 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-3 py-2 text-left">
                From
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left">To</th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                Children
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                Required Staff
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                Staff
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                BKR
              </th>
              {checkVGC && (
                <th className="border border-gray-300 px-3 py-2 text-center">
                  VGC
                </th>
              )}
              {checkThreeHours && (
                <th className="border border-gray-300 px-3 py-2 text-center">
                  3-UURS
                </th>
              )}
              <th className="border border-gray-300 px-3 py-2 text-left">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {resultData[1].slices.map((slice, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="border border-gray-300 px-3 py-1">
                  {slice["From Time"]}
                </td>
                <td className="border border-gray-300 px-3 py-1">
                  {slice["To Time"]}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-center">
                  {slice["#Children"]}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-center">
                  {slice["RequiredStaff"]}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-center">
                  {slice["#Staff"]}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-center">
                  {slice["BKR"]}
                </td>
                {checkVGC && (
                  <td className="border border-gray-300 px-3 py-1 text-center">
                    {slice["VGC"]}
                  </td>
                )}
                {checkThreeHours && (
                  <td className="border border-gray-300 px-3 py-1 text-center">
                    {slice["3-UURS"]}
                  </td>
                )}
                <td className="border border-gray-300 px-3 py-1">
                  {slice.Details.map((item, index) => (
                    <p key={index}>{item}</p>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

/** ----------------- helpers ----------------- */
function toMin(t) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function minToStr(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}
function mergeFailRanges(slices, key /* "BKR" | "VGC" */) {
  const failing = (slices || []).filter((s) => s && s[key] === "No");
  if (!failing.length) return { ranges: [], totalFailMins: 0, slots: 0 };

  failing.sort((a, b) => toMin(a["From Time"]) - toMin(b["From Time"]));
  const merged = [];
  let total = 0;

  for (const s of failing) {
    const a = toMin(s["From Time"]);
    const b = toMin(s["To Time"]);
    total += b - a;

    if (!merged.length) {
      merged.push([a, b]);
      continue;
    }
    const last = merged[merged.length - 1];
    if (a === last[1]) last[1] = b; // contiguous -> extend
    else merged.push([a, b]);
  }

  const ranges = merged.map(([a, b]) => ({
    text: `${minToStr(a)}-${minToStr(b)}`,
    durMins: b - a,
  }));
  return { ranges, totalFailMins: total, slots: failing.length };
}
function minutesToHoursStr(mins) {
  const hours = mins / 60;
  // show with 1 decimal if needed
  return (Math.round(hours * 10) / 10).toFixed(hours % 1 === 0 ? 0 : 1);
}
function countUnknownVgc(slices) {
  return (slices || []).filter((s) => s && s.VGC === "Unknown").length;
}
function recommendStaffFromDetails(slices) {
  const counts = new Map();
  for (const s of slices || []) {
    for (const line of s.Details || []) {
      // "VGC failed: A, B for Child X"
      const m = line.match(/^VGC failed:\s*(.+?)\s+for\s+/i);
      if (!m) continue;
      const namesPart = m[1];
      const names = namesPart
        .split(/[,;&]/)
        .map((x) => x.trim())
        .filter(Boolean);
      for (const nm of names) counts.set(nm, (counts.get(nm) || 0) + 1);
    }
  }
  if (!counts.size) return null;
  let best = null,
    bestCnt = -1;
  for (const [name, cnt] of counts.entries()) {
    if (cnt > bestCnt) {
      best = name;
      bestCnt = cnt;
    }
  }
  return best;
}

/** ----------------- main component ----------------- */
function ComplianceDetailView({
  checkResult,
  groupName, // optional: "Dolfijntjes"
  groupType = "Group", // optional: "Baby Group"
  showUnknownNote = true, // show note about Unknown slots for VGC
}) {
  // Pull the day object with slices
  const dayObj = Array.isArray(checkResult?.result)
    ? checkResult.result.find((x) => x && typeof x === "object" && x.slices)
    : null;

  const dateStr = dayObj?.day || checkResult?.date || "";
  const slices = dayObj?.slices || [];
  const three = dayObj?.three_uurs_summary || {};

  const checkVGC = checkResult?.modules.includes("vgc");
  const checkThreeHours = checkResult?.modules.includes("threeHours");

  const groupLabel = groupName ? `${groupType} "${groupName}"` : groupType;

  // Module computations
  const bkr = mergeFailRanges(slices, "BKR");
  const vgc = mergeFailRanges(slices, "VGC");
  const vgcUnknownSlots = countUnknownVgc(slices);
  const vgcRec = recommendStaffFromDetails(slices);

  // 3-UURS block straight from summary
  const threeFlag = three["3-UURS"];
  const threeReason = three.Reason;
  const threeDevs = Array.isArray(three.Deviations) ? three.Deviations : [];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        {dateStr} — {groupLabel}
      </div>

      {/* BKR */}
      <section style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>BKR</div>
        {bkr.ranges.length ? (
          <>
            {bkr.ranges.map((r, i) => (
              <div key={`bkr-range-${i}`} className="flex items-center gap-1">
                <Icon name="redRoundWarning" /> {r.text}
              </div>
            ))}
            <div style={{ marginTop: 6, color: "#333" }}>
              {`BKR failed in ${bkr.slots} slot${
                bkr.slots !== 1 ? "s" : ""
              } (${minutesToHoursStr(bkr.totalFailMins)} ${
                bkr.totalFailMins === 60 ? "hour" : "hours"
              } total).`}{" "}
              The 3-hours allowance is evaluated separately below.
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1">
            <Icon name="greenRoundCheck" /> All slots compliant.
          </div>
        )}
      </section>

      {/* VGC */}
      {checkVGC && (
        <section style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>VGC</div>
          {vgc.ranges.length ? (
            <>
              {vgc.ranges.map((r, i) => (
                <div key={`vgc-range-${i}`} className="flex items-center gap-1">
                  <Icon name="redRoundWarning" /> {r.text}
                </div>
              ))}
              <div style={{ marginTop: 6, color: "#333" }}>
                {`VGC not met in ${vgc.slots} slot${
                  vgc.slots !== 1 ? "s" : ""
                } (${minutesToHoursStr(vgc.totalFailMins)} ${
                  vgc.totalFailMins === 60 ? "hour" : "hours"
                } total).`}
                {vgcRec
                  ? ` Recommendation: try scheduling staff member ${vgcRec}.`
                  : ""}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Icon name="greenRoundCheck" /> All slots compliant.
            </div>
          )}
          {showUnknownNote && vgcUnknownSlots > 0 ? (
            <div style={{ marginTop: 6, color: "#777", fontSize: 12 }}>
              {`${vgcUnknownSlots} slot${
                vgcUnknownSlots !== 1 ? "s were" : " was"
              } marked as "Unknown" and not counted in VGC results (likely outside staffed windows or missing data).`}
            </div>
          ) : null}
        </section>
      )}

      {/* 3-UURS */}
      {checkThreeHours && (
        <section>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>3-UURS</div>
          {threeFlag && (
            <div>
              {threeFlag === "Yes" ? (
                <Icon name="greenRoundCheck" />
              ) : (
                <Icon name="redRoundWarning" />
              )}
            </div>
          )}
          {threeReason ? (
            <div style={{ marginTop: 6 }}>{threeReason}</div>
          ) : null}
          {threeDevs.length ? (
            <ul style={{ margin: "6px 0 0 16px" }}>
              {threeDevs.map((d, i) => (
                <li key={`dev-${i}`}>{d}</li>
              ))}
            </ul>
          ) : null}
        </section>
      )}
    </div>
  );
}

/** ----------------- foldable detail view ----------- */

function FoldableDetailView({ children }) {
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

function DownloadDropdownButton({ data, modules }) {
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
        className="inline-flex justify-center items-center text-sm"
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
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 animate-fade-in">
          <div className="py-1">
            <button
              onClick={handleClickCSV}
              className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              CSV
            </button>
            <button
              onClick={handleClickJSON}
              className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              JSON
            </button>
            <button
              onClick={handleClickPDF}
              className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
