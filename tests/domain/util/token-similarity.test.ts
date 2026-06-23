import {
  tokenize,
  isStrongToken,
  score,
  findBestMatch,
} from "../../../src/domain/util/token-similarity.js";
import type { Product } from "../../../src/domain/model/product.js";

const makeProduct = (id: number, name: string): Product => ({
  id,
  name,
  brand: null,
  category: null,
});

describe("tokenize", () => {
  it("returns empty set for null", () => {
    expect(tokenize(null).size).toBe(0);
  });

  it("returns empty set for empty string", () => {
    expect(tokenize("").size).toBe(0);
  });

  it("returns a token for each word", () => {
    expect(tokenize("blue shirt")).toEqual(new Set(["blue", "shirt"]));
  });

  it("normalizes tokens before splitting", () => {
    expect(tokenize("Café")).toEqual(new Set(["cafe"]));
  });

  it("deduplicates repeated words", () => {
    expect(tokenize("blue blue shirt")).toEqual(new Set(["blue", "shirt"]));
  });
});

describe("isStrongToken", () => {
  it("returns true for token with length >= 4", () => {
    expect(isStrongToken("abcd")).toBe(true);
    expect(isStrongToken("shirt")).toBe(true);
  });

  it("returns false for short token with no digit", () => {
    expect(isStrongToken("ab")).toBe(false);
    expect(isStrongToken("abc")).toBe(false);
  });

  it("returns true for short token that mixes letter and digit", () => {
    expect(isStrongToken("a1")).toBe(true);
    expect(isStrongToken("x9")).toBe(true);
  });

  it("returns false for short digit-only token", () => {
    expect(isStrongToken("12")).toBe(false);
    expect(isStrongToken("123")).toBe(false);
  });
});

describe("score", () => {
  it("returns jaccard 1 and all strong tokens for identical strings", () => {
    const result = score("nike shirt 2024", "nike shirt 2024");

    expect(result.jaccard).toBe(1);
    expect(result.sharedStrongTokens).toContain("nike");
    expect(result.sharedStrongTokens).toContain("shirt");
    expect(result.sharedStrongTokens).toContain("2024");
  });

  it("returns jaccard 0 and no shared tokens for completely different strings", () => {
    const result = score("blue shirt", "red pants");

    expect(result.jaccard).toBe(0);
    expect(result.sharedStrongTokens).toHaveLength(0);
  });

  it("computes correct jaccard for partial overlap", () => {
    const result = score("blue shirt", "blue pants");

    expect(result.jaccard).toBeCloseTo(1 / 3);
  });

  it("does not include weak tokens in sharedStrongTokens", () => {
    const result = score("shirt by nike", "pants by nike");

    expect(result.sharedStrongTokens).toContain("nike");
    expect(result.sharedStrongTokens).not.toContain("by");
  });
});

describe("findBestMatch", () => {
  it("returns null when candidates list is empty", () => {
    expect(findBestMatch("blue shirt", [])).toBeNull();
  });

  it("returns null when no candidate meets the jaccard threshold", () => {
    const candidates = [makeProduct(1, "red pants")];

    expect(findBestMatch("blue shirt", candidates)).toBeNull();
  });

  it("returns null when jaccard is above threshold but no strong token in common", () => {
    const candidates = [makeProduct(1, "ab")];

    expect(findBestMatch("ab", candidates)).toBeNull();
  });

  it("returns the matching product when above threshold with a strong token", () => {
    const candidates = [makeProduct(1, "nike running shirt")];

    const result = findBestMatch("nike running shirt", candidates);

    expect(result).not.toBeNull();
    expect(result!.product.id).toBe(1);
  });

  it("returns null when two candidates tie on jaccard", () => {
    const candidates = [
      makeProduct(1, "nike blue shirt"),
      makeProduct(2, "nike red shirt"),
    ];

    const result = findBestMatch("nike shirt", candidates);

    expect(result).toBeNull();
  });

  it("returns the candidate with higher jaccard when no tie", () => {
    const candidates = [
      makeProduct(1, "nike shirt"),
      makeProduct(2, "nike blue running shirt 2024"),
    ];

    const result = findBestMatch("nike shirt", candidates);

    expect(result).not.toBeNull();
    expect(result!.product.id).toBe(1);
  });
});
