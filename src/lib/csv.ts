/** CSV dengan koma, kutip ganda, dan baris baru di dalam sel. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') { cell += '"'; index++; }
      else quoted = !quoted;
    } else if (!quoted && character === ",") {
      row.push(cell.trim()); cell = "";
    } else if (!quoted && (character === "\n" || character === "\r")) {
      if (character === "\r" && source[index + 1] === "\n") index++;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = "";
    } else cell += character;
  }
  if (quoted) throw new Error("Kutip CSV belum ditutup. Periksa kembali isian Anda.");
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

export function serializeCsv(rows: readonly (readonly unknown[])[]): string {
  return "\uFEFF" + rows.map((row) => row.map((value) => {
    const text = String(value ?? "");
    // Mencegah nilai pengguna diperlakukan sebagai rumus saat dibuka di spreadsheet.
    const safe = /^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  }).join(",")).join("\r\n");
}
