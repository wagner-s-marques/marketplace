import type { Database } from "../model/database.js";
import type { SellerProductRequest } from "../model/seller-product.js";

export interface ConsolidationResult {
  total: number;
  linked: number;
  notFound: number;
  notFoundRequests: SellerProductRequest[];
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
      };

      for (const request of requests) {
        const product = this.deps.database.findProductByExactMatch(
          request.name,
          request.brand,
          request.category,
        );

        if (!product) {
          result.notFound++;
          result.notFoundRequests.push(request);
          continue;
        }

        this.deps.database.saveSellerProduct({
          sellerName: request.sellerName,
          productId: product.id,
          sellerProductId: request.sellerProductId,
        });
        result.linked++;
      }

      return result;
    });
  }
}
