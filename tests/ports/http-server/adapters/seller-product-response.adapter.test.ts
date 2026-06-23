import { SellerProductResponseAdapter } from "../../../../src/ports/http-server/adapters/seller-product-response.adapter.js";
import type { ConsolidationResult } from "../../../../src/domain/controller/seller-product.js";

describe("SellerProductResponseAdapter.toDto", () => {
  it("maps all fields correctly", () => {
    const result: ConsolidationResult = {
      total: 10,
      linked: 7,
      notFound: 3,
      notFoundRequests: ["id-1", "id-2", "id-3"],
    };

    const dto = SellerProductResponseAdapter.toDto(result);

    expect(dto).toEqual({
      total: 10,
      linked: 7,
      notFound: 3,
      notFoundRequests: ["id-1", "id-2", "id-3"],
    });
  });

  it("maps empty notFoundRequests", () => {
    const result: ConsolidationResult = {
      total: 5,
      linked: 5,
      notFound: 0,
      notFoundRequests: [],
    };

    const dto = SellerProductResponseAdapter.toDto(result);

    expect(dto.notFoundRequests).toEqual([]);
  });

  it("maps when all requests are not found", () => {
    const result: ConsolidationResult = {
      total: 3,
      linked: 0,
      notFound: 3,
      notFoundRequests: ["id-a", "id-b", "id-c"],
    };

    const dto = SellerProductResponseAdapter.toDto(result);

    expect(dto.linked).toBe(0);
    expect(dto.notFound).toBe(3);
    expect(dto.notFoundRequests).toHaveLength(3);
  });

  it("maps zero totals", () => {
    const result: ConsolidationResult = {
      total: 0,
      linked: 0,
      notFound: 0,
      notFoundRequests: [],
    };

    const dto = SellerProductResponseAdapter.toDto(result);

    expect(dto.total).toBe(0);
    expect(dto.linked).toBe(0);
    expect(dto.notFound).toBe(0);
  });
});
