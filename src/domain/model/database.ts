import type { Product } from "./product.js";
import type { SellerProduct } from "./seller-product.js";

export interface Database {
  findProductByExactMatch(
    name: string,
    brand: string | null,
    category: string | null,
  ): Product | null;
  saveSellerProduct(sellerProduct: SellerProduct): void;
  runTransaction<T>(fn: () => T): T;
}
