export function normalize(s: string | null): string | null {
  if (s == null) return null;
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
