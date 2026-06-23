import { jest } from "@jest/globals";
import request from "supertest";
import { ProductController } from "../../src/domain/controller/product.js";
import { SellerProductController } from "../../src/domain/controller/seller-product.js";
import type { Database } from "../../src/domain/model/database.js";
import type { Product } from "../../src/domain/model/product.js";
import { SellerProductEndpoint } from "../../src/ports/http-server/seller-product.endpoint.js";
import { Server } from "../../src/ports/http-server/server.js";

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

const buildApp = (db: jest.Mocked<Database>) => {
  const productController = new ProductController({ database: db });
  const sellerProductController = new SellerProductController({ database: db, productController });
  const endpoint = new SellerProductEndpoint(sellerProductController);
  return new Server([endpoint.router]).app;
};

const asFile = (data: unknown) =>
  Buffer.from(JSON.stringify(data));

describe("POST /catalog/import", () => {
  let db: jest.Mocked<Database>;
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    db = makeDatabase();
    app = buildApp(db);
  });

  describe("success", () => {
    it("returns 200 with correct counts when all products are found", async () => {
      db.findProductByExactMatch.mockReturnValue(makeProduct(1));

      const payload = [
        { Id: "s-1", SellerName: "Shop A", Name: "Nike Shirt", Brand: "Nike", Category: "Clothing" },
        { Id: "s-2", SellerName: "Shop A", Name: "Nike Shirt", Brand: "Nike", Category: "Clothing" },
      ];

      const res = await request(app)
        .post("/catalog/import")
        .attach("file", asFile(payload), { filename: "products.json", contentType: "application/json" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ total: 2, linked: 2, notFound: 0, notFoundRequests: [] });
    });

    it("returns 200 with correct counts when no products are found", async () => {
      db.findProductByExactMatch.mockReturnValue(null);
      db.findProductsByNameAndBrand.mockReturnValue([]);
      db.findProductsByBrand.mockReturnValue([]);

      const payload = [
        { Id: "s-1", SellerName: "Shop A", Name: "Unknown", Brand: "Unknown", Category: null },
      ];

      const res = await request(app)
        .post("/catalog/import")
        .attach("file", asFile(payload), { filename: "products.json", contentType: "application/json" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ total: 1, linked: 0, notFound: 1, notFoundRequests: ["s-1"] });
    });

    it("returns 200 with correct counts for mixed results", async () => {
      db.findProductByExactMatch
        .mockReturnValueOnce(makeProduct(1))
        .mockReturnValueOnce(null);
      db.findProductsByNameAndBrand.mockReturnValue([]);
      db.findProductsByBrand.mockReturnValue([]);

      const payload = [
        { Id: "s-1", SellerName: "Shop A", Name: "Nike Shirt", Brand: "Nike", Category: "Clothing" },
        { Id: "s-2", SellerName: "Shop A", Name: "Unknown", Brand: null, Category: null },
      ];

      const res = await request(app)
        .post("/catalog/import")
        .attach("file", asFile(payload), { filename: "products.json", contentType: "application/json" });

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
      expect(res.body.linked).toBe(1);
      expect(res.body.notFound).toBe(1);
      expect(res.body.notFoundRequests).toEqual(["s-2"]);
    });

    it("returns 200 with zero counts for empty file", async () => {
      const res = await request(app)
        .post("/catalog/import")
        .attach("file", asFile([]), { filename: "products.json", contentType: "application/json" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ total: 0, linked: 0, notFound: 0, notFoundRequests: [] });
    });
  });

  describe("validation errors", () => {
    it("returns 400 when no file is uploaded", async () => {
      const res = await request(app).post("/catalog/import");

      expect(res.status).toBe(400);
    });

    it("returns 400 when file is not valid JSON", async () => {
      const res = await request(app)
        .post("/catalog/import")
        .attach("file", Buffer.from("not json"), { filename: "products.json", contentType: "application/json" });

      expect(res.status).toBe(400);
    });

    it("returns 400 when JSON does not match the expected schema", async () => {
      const payload = [{ InvalidField: "value" }];

      const res = await request(app)
        .post("/catalog/import")
        .attach("file", asFile(payload), { filename: "products.json", contentType: "application/json" });

      expect(res.status).toBe(400);
    });

    it("returns 400 when a required field is missing", async () => {
      const payload = [{ Id: "s-1", SellerName: "Shop A", Name: "Nike Shirt" }];

      const res = await request(app)
        .post("/catalog/import")
        .attach("file", asFile(payload), { filename: "products.json", contentType: "application/json" });

      expect(res.status).toBe(400);
    });
  });
});
