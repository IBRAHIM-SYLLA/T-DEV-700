export function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // RFC4180-ish escaping: wrap in quotes if it contains delimiter, quotes, or newlines.
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function sanitizeFilenamePart(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

export function buildCsvContent(header, rows, { separator = ",", addBom = true, excelSeparatorHint = true } = {}) {
  const sepLine = excelSeparatorHint ? `sep=${separator}\n` : "";
  const headerLine = (header || []).map(csvEscape).join(separator);
  const dataLines = (rows || []).map((r) => (r || []).map(csvEscape).join(separator));
  const body = [headerLine, ...dataLines].join("\n");
  const csv = `${sepLine}${body}`;
  return addBom ? `\uFEFF${csv}` : csv;
}

export function downloadCsvFile(filename, header, rows, options) {
  const content = buildCsvContent(header, rows, options);
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
