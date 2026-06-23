import type { Database } from "../model/database.js";
import type { Product } from "../model/product.js";
import type { SellerProductRequest } from "../model/seller-product.js";
import { findBestMatch } from "../util/token-similarity.js";

export interface CategoryMismatchLink {
  request: SellerProductRequest;
  matchedProduct: Product;
}

export interface TokenSimilarityLink {
  request: SellerProductRequest;
  matchedProduct: Product;
  jaccard: number;
  sharedStrongTokens: string[];
}

export interface ConsolidationResult {
  total: number;
  linked: number;
  notFound: number;
  notFoundRequests: SellerProductRequest[];
  linkedWithCategoryMismatch: CategoryMismatchLink[];
  linkedByTokenSimilarity: TokenSimilarityLink[];
}

export interface ConsolidateDeps {
  database: Database;
}

export class SellerProductController {
  constructor(private readonly deps: ConsolidateDeps) {}

  consolidate(requests: SellerProductRequest[]): ConsolidationResult {
    return this.deps.database.runTransaction(() => {
      const result: ConsolidationResult = {
        total: requests.length,
        linked: 0,
        notFound: 0,
        notFoundRequests: [],
        linkedWithCategoryMismatch: [],
        linkedByTokenSimilarity: [],
      };

      for (const request of requests) {
        const exact = this.deps.database.findProductByExactMatch(
          request.name,
          request.brand,
          request.category,
        );

        if (exact) {
          this.link(request, exact.id);
          result.linked++;
          continue;
        }

        const nameBrandCandidates =
          this.deps.database.findProductsByNameAndBrand(
            request.name,
            request.brand,
          );

        if (nameBrandCandidates.length === 1) {
          const matchedProduct = nameBrandCandidates[0]!;
          this.link(request, matchedProduct.id);
          result.linked++;
          result.linkedWithCategoryMismatch.push({ request, matchedProduct });
          continue;
        }

        if (request.brand != null) {
          const brandCandidates = this.deps.database.findProductsByBrand(
            request.brand,
          );
          const best = findBestMatch(request.name, brandCandidates);
          if (best) {
            this.link(request, best.product.id);
            result.linked++;
            result.linkedByTokenSimilarity.push({
              request,
              matchedProduct: best.product,
              jaccard: best.jaccard,
              sharedStrongTokens: best.sharedStrongTokens,
            });
            continue;
          }
        }

        result.notFound++;
        result.notFoundRequests.push(request);
      }

      return result;
    });
  }

  private link(request: SellerProductRequest, productId: number): void {
    this.deps.database.saveSellerProduct({
      sellerName: request.sellerName,
      productId,
      sellerProductId: request.sellerProductId,
    });
  }
}
