import type { Response } from "../../../domain/controller/seller-product.js";
import type { SellerProductResponseDto } from "../wire/out/seller-product-response.dto.js";

export class SellerProductResponseAdapter {
  static toDto(result: Response): SellerProductResponseDto {
    return {
      total: result.total,
      linked: result.linked,
      notFound: result.notFound,
      notFoundRequests: result.notFoundRequests,
    };
  }
}
