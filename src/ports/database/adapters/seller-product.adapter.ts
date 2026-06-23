import type { SellerProduct } from "../../../domain/model/seller-product.js";
import type { SellerProductInsertRow } from "../wire/out/seller-product.row.js";

export class SellerProductAdapter {
  static toRow(sellerProduct: SellerProduct): SellerProductInsertRow {
    return {
      SellerName: sellerProduct.sellerName,
      ProductId: sellerProduct.productId,
      SellerProductId: sellerProduct.sellerProductId,
    };
  }
}
