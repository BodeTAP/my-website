import "server-only";

/**
 * Standard PDF fonts (Helvetica et al.) only support WinAnsi (CP1252) encoding.
 * Any code point outside that table (emoji, CJK, Arabic, Latin Extended, etc.)
 * makes pdf-lib's `drawText` / `widthOfTextAtSize` throw, which previously
 * surfaced as a 500 when a user typed e.g. an emoji into a business name.
 *
 * These are the WinAnsi characters that live outside the Latin-1 range
 * (the 0x80–0x9F Windows extension block) and are still safely encodable.
 */
const WIN_ANSI_EXTRA = new Set<number>([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030,
  0x0160, 0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022,
  0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
]);

/**
 * Strips/normalizes characters that the standard WinAnsi PDF fonts cannot
 * encode so PDF generation never throws on user-supplied text.
 *
 * - Preserves newlines (callers wrap on them).
 * - Converts tabs to spaces.
 * - Keeps printable ASCII, Latin-1 supplement, and the WinAnsi extras.
 * - Drops anything else (emoji, CJK, etc.).
 */
export function sanitizeWinAnsi(input: unknown): string {
  if (input === null || input === undefined) return "";
  const str = String(input);
  let out = "";
  for (const ch of str) {
    if (ch === "\n") {
      out += "\n";
      continue;
    }
    const code = ch.codePointAt(0)!;
    if (code === 0x09) {
      out += " ";
      continue;
    }
    if (code >= 0x20 && code <= 0x7e) {
      out += ch;
      continue;
    }
    if (code >= 0xa0 && code <= 0xff) {
      out += ch;
      continue;
    }
    if (WIN_ANSI_EXTRA.has(code)) {
      out += ch;
      continue;
    }
    // Unsupported (emoji, CJK, surrogate pairs, control chars) — drop it.
  }
  return out;
}
