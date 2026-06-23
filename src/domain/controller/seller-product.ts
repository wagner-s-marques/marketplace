import type { Database } from "../model/database.js";
import type { SellerProductRequest } from "../model/seller-product.js";
import type { ProductController } from "./product.js";

export interface Response {
  total: number;
  linked: number;
  notFound: number;
  notFoundRequests: string[];
}

export interface Deps {
  database: Database;
  productController: ProductController;
}

export class SellerProductController {
  constructor(private readonly deps: Deps) {}

  consolidate(requests: SellerProductRequest[]): Response {
    return this.deps.database.runTransaction(() => {
      const result: Response = {
        total: requests.length,
        linked: 0,
        notFound: 0,
        notFoundRequests: [],
      };

      for (const request of requests) {
        const product = this.deps.productController.find({
          name: request.name,
          brand: request.brand,
          category: request.category,
        });

        if (product) {
          this.deps.database.saveSellerProduct({
            sellerName: request.sellerName,
            productId: product.id,
            sellerProductId: request.sellerProductId,
          });
          result.linked++;
        } else {
          result.notFound++;
          result.notFoundRequests.push(request.sellerProductId);
        }
      }

      return result;
    });
  }
}
