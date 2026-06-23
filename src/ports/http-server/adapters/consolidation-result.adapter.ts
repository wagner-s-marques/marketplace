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
      linkedWithCategoryMismatch: result.linkedWithCategoryMismatch.map(
        ({ request, matchedProduct }) => ({
          Id: request.sellerProductId,
          SellerName: request.sellerName,
          Name: request.name,
          Brand: request.brand,
          Category: request.category,
          MatchedProductId: matchedProduct.id,
          MatchedCategory: matchedProduct.category,
        }),
      ),
      linkedByTokenSimilarity: result.linkedByTokenSimilarity.map(
        ({ request, matchedProduct, jaccard, sharedStrongTokens }) => ({
          Id: request.sellerProductId,
          SellerName: request.sellerName,
          Name: request.name,
          Brand: request.brand,
          Category: request.category,
          MatchedProductId: matchedProduct.id,
          MatchedName: matchedProduct.name,
          MatchedCategory: matchedProduct.category,
          Jaccard: jaccard,
          SharedStrongTokens: sharedStrongTokens,
        }),
      ),
    };
  }
}
