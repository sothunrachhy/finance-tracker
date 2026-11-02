// Builds RFC 4180 CSV. Text cells that start with = + - @ are prefixed with a
// quote so spreadsheet apps don't run them as formulas (CSV injection).

type Cell = string | number | null;

function escapeCell(value: Cell, isText: boolean): string {
  if (value === null) return "";
  let text = String(value);
  if (isText && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(headers: string[], rows: Cell[][], textColumns: number[] = []): string {
  const text = new Set(textColumns);
  const lines = [headers, ...rows].map((row, rowIndex) =>
    row.map((cell, col) => escapeCell(cell, rowIndex > 0 && text.has(col))).join(","),
  );
  return lines.join("\r\n") + "\r\n";
}
