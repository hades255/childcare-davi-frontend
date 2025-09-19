import React from "react";
import { checkResult } from "../../mockdata";

const CheckResults = () => {
  const data = checkResult;

  if (
    !data ||
    !data.result ||
    !Array.isArray(data.result) ||
    data.result.length < 2
  ) {
    return <p>No data available</p>;
  }

  const resultData = data.result[1];
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

  const vgcSummary = slices.reduce(
    (acc, slice) => {
      if (slice.VGC === "Yes") acc.yes++;
      else if (slice.VGC === "No") acc.no++;
      return acc;
    },
    { yes: 0, no: 0 }
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h2 className="text-xl font-semibold">
        Check Results for {resultData.day}
      </h2>

      <div className="overflow-x-auto max-h-[60vh] overflow-y-scroll">
        <table className="min-w-full border border-gray-300 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-3 py-2 text-left">
                From Time
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left">
                To Time
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                # Children
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                Required Staff
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                # Staff
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                BKR
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                VGC
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                3-UURS
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {slices.map((slice, idx) => (
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
                <td className="border border-gray-300 px-3 py-1 text-center">
                  {slice["VGC"]}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-center">
                  {slice["3-UURS"]}
                </td>
                <td className="border border-gray-300 px-3 py-1">
                  {slice.Details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-100 p-4 rounded space-y-2 max-w-md">
        <h3 className="font-semibold text-lg">Summary</h3>
        <p>
          <strong>BKR:</strong> Yes ({bkrSummary.yes}), No ({bkrSummary.no})
        </p>
        <p>
          <strong>VGC:</strong> Yes ({vgcSummary.yes}), No ({vgcSummary.no})
        </p>
        <p>
          <strong>3-UURS:</strong> {summary["3-UURS"] || "N/A"}
        </p>
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
      </div>
    </div>
  );
};

export default CheckResults;
