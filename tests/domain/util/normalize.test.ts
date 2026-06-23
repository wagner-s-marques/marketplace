import { normalize } from "../../../src/domain/util/normalize.js";

describe("normalize", () => {
  it("returns null for null input", () => {
    expect(normalize(null)).toBeNull();
  });

  it("lowercases the string", () => {
    expect(normalize("HELLO WORLD")).toBe("hello world");
  });

  it("removes diacritics", () => {
    expect(normalize("café")).toBe("cafe");
    expect(normalize("ção")).toBe("cao");
    expect(normalize("über")).toBe("uber");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalize("  hello  ")).toBe("hello");
  });

  it("collapses multiple spaces into one", () => {
    expect(normalize("hello   world")).toBe("hello world");
  });

  it("removes special characters", () => {
    expect(normalize("hello-world!")).toBe("hello world");
  });

  it("handles empty string", () => {
    expect(normalize("")).toBe("");
  });

  it("handles string with only special characters", () => {
    expect(normalize("!@#$%")).toBe("");
  });
});
