import type { ConsolidationResult } from "../../../domain/controller/seller-product.js";
import type { ConsolidationResultDto } from "../wire/out/consolidation-result.dto.js";

export class ConsolidationResultAdapter {
  static toDto(result: ConsolidationResult): ConsolidationResultDto {
    return {
      total: result.total,
      linked: result.linked,
      notFound: result.notFound,
      notFoundRequests: result.notFoundRequests.map((r) => ({
        Id: r.sellerProductId,
        SellerName: r.sellerName,
        Name: r.name,
        Brand: r.brand,
        Category: r.category,
      })),
    };
  }
}
