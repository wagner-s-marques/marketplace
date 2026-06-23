import { jest } from "@jest/globals";
import { SellerProductController } from "../../../src/domain/controller/seller-product.js";
import type { Database } from "../../../src/domain/model/database.js";
import type { ProductController } from "../../../src/domain/controller/product.js";
import type { SellerProductRequest } from "../../../src/domain/model/seller-product.js";
import type { Product } from "../../../src/domain/model/product.js";

const makeRequest = (overrides?: Partial<SellerProductRequest>): SellerProductRequest => ({
  sellerProductId: "seller-1",
  sellerName: "Shop A",
  name: "Nike Shirt",
  brand: "Nike",
  category: "Clothing",
  ...overrides,
});

const makeProduct = (id: number): Product => ({
  id,
  name: "Nike Shirt",
  brand: "Nike",
  category: "Clothing",
});

const makeDatabase = () =>
  ({
    findProductByExactMatch: jest.fn(),
    findProductsByNameAndBrand: jest.fn(),
    findProductsByBrand: jest.fn(),
    saveSellerProduct: jest.fn(),
    runTransaction: jest.fn().mockImplementation((fn) => (fn as () => unknown)()),
  }) as jest.Mocked<Database>;

const makeProductController = () =>
  ({
    find: jest.fn(),
  }) as unknown as jest.Mocked<ProductController>;

describe("SellerProductController.consolidate", () => {
  let db: jest.Mocked<Database>;
  let productController: jest.Mocked<ProductController>;
  let controller: SellerProductController;

  beforeEach(() => {
    db = makeDatabase();
    productController = makeProductController();
    controller = new SellerProductController({ database: db, productController });
  });

  it("returns zero counts for empty request list", () => {
    const result = controller.consolidate([]);

    expect(result).toEqual({ total: 0, linked: 0, notFound: 0, notFoundRequests: [] });
  });

  it("runs inside a transaction", () => {
    controller.consolidate([]);

    expect(db.runTransaction).toHaveBeenCalledTimes(1);
  });

  it("sets total to the number of requests", () => {
    productController.find.mockReturnValue(null);

    const result = controller.consolidate([makeRequest(), makeRequest()]);

    expect(result.total).toBe(2);
  });

  it("increments linked and saves when product is found", () => {
    const product = makeProduct(42);
    productController.find.mockReturnValue(product);

    const request = makeRequest({ sellerProductId: "seller-1", sellerName: "Shop A" });
    const result = controller.consolidate([request]);

    expect(result.linked).toBe(1);
    expect(result.notFound).toBe(0);
    expect(db.saveSellerProduct).toHaveBeenCalledWith({
      sellerName: "Shop A",
      productId: 42,
      sellerProductId: "seller-1",
    });
  });

  it("increments notFound and records sellerProductId when product is not found", () => {
    productController.find.mockReturnValue(null);

    const request = makeRequest({ sellerProductId: "missing-1" });
    const result = controller.consolidate([request]);

    expect(result.notFound).toBe(1);
    expect(result.linked).toBe(0);
    expect(result.notFoundRequests).toContain("missing-1");
  });

  it("handles mixed found and not found requests correctly", () => {
    const product = makeProduct(1);
    productController.find
      .mockReturnValueOnce(product)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(product);

    const result = controller.consolidate([
      makeRequest({ sellerProductId: "found-1" }),
      makeRequest({ sellerProductId: "missing-1" }),
      makeRequest({ sellerProductId: "found-2" }),
    ]);

    expect(result.total).toBe(3);
    expect(result.linked).toBe(2);
    expect(result.notFound).toBe(1);
    expect(result.notFoundRequests).toEqual(["missing-1"]);
  });

  it("does not call saveSellerProduct when product is not found", () => {
    productController.find.mockReturnValue(null);

    controller.consolidate([makeRequest()]);

    expect(db.saveSellerProduct).not.toHaveBeenCalled();
  });
});
