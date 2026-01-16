import * as XLSX from "xlsx";

export function downloadJSON(data, filename = "data.json") {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadExcel(data, filename = "data.xlsx") {
  // Prepare data for Excel
  const rows = [
    ["Personeel", "Kinderen"], // Header row
  ];

  Object.entries(data).forEach(([person, children]) => {
    const childrenList = Array.isArray(children) ? children.join(", ") : children;
    rows.push([person, childrenList]);
  });

  // Create workbook and worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "VGC List");

  // Generate Excel file
  XLSX.writeFile(wb, filename);
}

export function downloadDOC(data, filename = "data.docx") {
  // For DOC, we'll create an HTML format that Word can open
  let html = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>VGC List</title>
      </head>
      <body>
        <h1>VGC Lijst</h1>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background-color: #23BD92; color: white;">
              <th>Personeel</th>
              <th>Kinderen</th>
            </tr>
          </thead>
          <tbody>
  `;

  Object.entries(data).forEach(([person, children]) => {
    const childrenList = Array.isArray(children) ? children.join(", ") : children;
    html += `
      <tr>
        <td>${person}</td>
        <td>${childrenList}</td>
      </tr>
    `;
  });

  html += `
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

