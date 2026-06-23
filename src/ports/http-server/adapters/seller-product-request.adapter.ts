import type { SellerProductRequest } from "../../../domain/model/seller-product.js";
import type { SellerProductRequestDto } from "../wire/in/seller-product-request.dto.js";

export class SellerProductRequestAdapter {
  static toDomain(dto: SellerProductRequestDto): SellerProductRequest {
    return {
      sellerProductId: dto.Id,
      sellerName: dto.SellerName,
      name: dto.Name,
      brand: dto.Brand,
      category: dto.Category,
    };
  }
}
