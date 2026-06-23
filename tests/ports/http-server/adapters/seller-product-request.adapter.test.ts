import { SellerProductRequestAdapter } from "../../../../src/ports/http-server/adapters/seller-product-request.adapter.js";
import type { SellerProductRequestDto } from "../../../../src/ports/http-server/wire/in/seller-product-request.dto.js";

describe("SellerProductRequestAdapter.toDomain", () => {
  const baseDto: SellerProductRequestDto = {
    Id: "seller-abc-123",
    SellerName: "Shop Name",
    Name: "Blue T-Shirt",
    Brand: "Nike",
    Category: "Clothing",
  };

  it("maps all fields correctly", () => {
    const result = SellerProductRequestAdapter.toDomain(baseDto);

    expect(result).toEqual({
      sellerProductId: "seller-abc-123",
      sellerName: "Shop Name",
      name: "Blue T-Shirt",
      brand: "Nike",
      category: "Clothing",
    });
  });

  it("maps without brand", () => {
    const dto: SellerProductRequestDto = { ...baseDto, Brand: null };

    const result = SellerProductRequestAdapter.toDomain(dto);

    expect(result.brand).toBeNull();
  });

  it("maps without category", () => {
    const dto: SellerProductRequestDto = { ...baseDto, Category: null };

    const result = SellerProductRequestAdapter.toDomain(dto);

    expect(result.category).toBeNull();
  });

  it("maps without brand and category", () => {
    const dto: SellerProductRequestDto = {
      ...baseDto,
      Brand: null,
      Category: null,
    };

    const result = SellerProductRequestAdapter.toDomain(dto);

    expect(result.brand).toBeNull();
    expect(result.category).toBeNull();
  });

});
