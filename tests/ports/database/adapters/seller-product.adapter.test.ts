import { SellerProductAdapter } from "../../../../src/ports/database/adapters/seller-product.adapter.js";
import type { SellerProduct } from "../../../../src/domain/model/seller-product.js";

describe("SellerProductAdapter.toRow", () => {
  const baseSellerProduct: SellerProduct = {
    sellerName: "Shop Name",
    productId: 42,
    sellerProductId: "seller-abc-123",
  };

  it("maps all fields correctly", () => {
    const row = SellerProductAdapter.toRow(baseSellerProduct);

    expect(row).toEqual({
      SellerName: "Shop Name",
      ProductId: 42,
      SellerProductId: "seller-abc-123",
    });
  });
});
