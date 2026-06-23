import type { Product } from "../model/product.js";
import { normalize } from "./normalize.js";

const MIN_JACCARD = 0.5;
const MIN_STRONG_TOKENS_IN_COMMON = 1;

export interface SimilarityScore {
  jaccard: number;
  sharedStrongTokens: string[];
}

export interface BestMatch {
  product: Product;
  jaccard: number;
  sharedStrongTokens: string[];
}

export function tokenize(s: string | null): Set<string> {
  const normalized = normalize(s);
  if (normalized == null || normalized === "") return new Set();
  return new Set(normalized.split(" ").filter((t) => t.length > 0));
}

// A "strong" token is one likely to be a distinguishing identifier:
// either a model code (mixes digits and letters, e.g. "7950x", "m2") or
// a sufficiently long word (≥4 chars, e.g. "wifi", "iphone").
// Short generic tokens like "9", "15", "pro", "x" are excluded to avoid
// spurious matches.
export function isStrongToken(token: string): boolean {
  const hasDigit = /\d/.test(token);
  const hasLetter = /\p{L}/u.test(token);
  return (hasDigit && hasLetter) || token.length >= 4;
}

export function score(a: string, b: string): SimilarityScore {
  const ta = tokenize(a);
  const tb = tokenize(b);
  const intersection = new Set([...ta].filter((t) => tb.has(t)));
  const union = new Set([...ta, ...tb]);
  const jaccard = union.size === 0 ? 0 : intersection.size / union.size;
  const sharedStrongTokens = [...intersection].filter(isStrongToken);
  return { jaccard, sharedStrongTokens };
}

export function findBestMatch(
  name: string,
  candidates: Product[],
): BestMatch | null {
  const scored = candidates
    .map((product) => ({ product, ...score(name, product.name) }))
    .filter(
      (s) =>
        s.jaccard >= MIN_JACCARD &&
        s.sharedStrongTokens.length >= MIN_STRONG_TOKENS_IN_COMMON,
    );
  if (scored.length === 0) return null;
  scored.sort((a, b) => b.jaccard - a.jaccard);
  const top = scored[0]!;
  const tied = scored.filter((s) => s.jaccard === top.jaccard);
  if (tied.length > 1) return null;
  return top;
}
