import { jest } from "@jest/globals";
import { ProductController } from "../../../src/domain/controller/product.js";
import type { Database } from "../../../src/domain/model/database.js";
import type { Product } from "../../../src/domain/model/product.js";

const makeProduct = (id: number, name: string): Product => ({
  id,
  name,
  brand: "Nike",
  category: "Clothing",
});

const makeDatabase = () =>
  ({
    findProductByExactMatch: jest.fn(),
    findProductsByNameAndBrand: jest.fn(),
    findProductsByBrand: jest.fn(),
    saveSellerProduct: jest.fn(),
    runTransaction: jest.fn(),
  }) as jest.Mocked<Database>;

describe("ProductController.find", () => {
  let db: jest.Mocked<Database>;
  let controller: ProductController;

  beforeEach(() => {
    db = makeDatabase();
    controller = new ProductController({ database: db });
  });

  describe("exact match strategy", () => {
    it("returns the product when exact match is found", () => {
      const product = makeProduct(1, "Nike Shirt");
      db.findProductByExactMatch.mockReturnValue(product);

      const result = controller.find({ name: "Nike Shirt", brand: "Nike", category: "Clothing" });

      expect(result).toBe(product);
    });

    it("does not query further strategies when exact match is found", () => {
      db.findProductByExactMatch.mockReturnValue(makeProduct(1, "Nike Shirt"));

      controller.find({ name: "Nike Shirt", brand: "Nike", category: "Clothing" });

      expect(db.findProductsByNameAndBrand).not.toHaveBeenCalled();
      expect(db.findProductsByBrand).not.toHaveBeenCalled();
    });
  });

  describe("name and brand strategy", () => {
    beforeEach(() => {
      db.findProductByExactMatch.mockReturnValue(null);
    });

    it("returns the product when exactly one name+brand candidate is found", () => {
      const product = makeProduct(1, "Nike Running Shirt");
      db.findProductsByNameAndBrand.mockReturnValue([product]);

      const result = controller.find({ name: "Nike Shirt", brand: "Nike", category: null });

      expect(result).toBe(product);
    });

    it("does not return when more than one name+brand candidate is found", () => {
      db.findProductsByNameAndBrand.mockReturnValue([
        makeProduct(1, "Nike Shirt Blue"),
        makeProduct(2, "Nike Shirt Red"),
      ]);
      db.findProductsByBrand.mockReturnValue([]);

      const result = controller.find({ name: "Nike Shirt", brand: "Nike", category: null });

      expect(result).toBeNull();
    });

    it("does not return when no name+brand candidates are found", () => {
      db.findProductsByNameAndBrand.mockReturnValue([]);
      db.findProductsByBrand.mockReturnValue([]);

      const result = controller.find({ name: "Nike Shirt", brand: "Nike", category: null });

      expect(result).toBeNull();
    });
  });

  describe("brand similarity strategy", () => {
    beforeEach(() => {
      db.findProductByExactMatch.mockReturnValue(null);
      db.findProductsByNameAndBrand.mockReturnValue([]);
    });

    it("returns best similarity match when brand candidates exist", () => {
      const product = makeProduct(1, "Nike Running Shirt 2024");
      db.findProductsByBrand.mockReturnValue([product]);

      const result = controller.find({ name: "Nike Running Shirt 2024", brand: "Nike", category: null });

      expect(result).toBe(product);
    });

    it("returns null when brand candidates do not meet similarity threshold", () => {
      db.findProductsByBrand.mockReturnValue([makeProduct(1, "Nike Pants")]);

      const result = controller.find({ name: "Nike Shirt", brand: "Nike", category: null });

      expect(result).toBeNull();
    });

    it("skips brand similarity when brand is null", () => {
      const result = controller.find({ name: "Shirt", brand: null, category: null });

      expect(db.findProductsByBrand).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("fallthrough", () => {
    it("returns null when all strategies fail", () => {
      db.findProductByExactMatch.mockReturnValue(null);
      db.findProductsByNameAndBrand.mockReturnValue([]);
      db.findProductsByBrand.mockReturnValue([]);

      const result = controller.find({ name: "Unknown Product", brand: "Unknown", category: null });

      expect(result).toBeNull();
    });
  });
});
