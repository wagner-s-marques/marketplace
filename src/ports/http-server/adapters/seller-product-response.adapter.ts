import type { ConsolidationResult } from "../../../domain/controller/seller-product.js";
import type { ConsolidationResultDto } from "../wire/out/consolidation-result.dto.js";

export class SellerProductResponseAdapter {
  static toDto(result: ConsolidationResult): ConsolidationResultDto {
    return {
      total: result.total,
      linked: result.linked,
      notFound: result.notFound,
      notFoundRequests: result.notFoundRequests,
    };
  }
}
