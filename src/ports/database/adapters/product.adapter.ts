import type { Product } from "../../../domain/model/product.js";
import type { ProductRow } from "../wire/in/product.row.js";

export class ProductAdapter {
  static toProduct(row: ProductRow): Product {
    return {
      id: row.Id,
      name: row.Name,
      brand: row.Brand,
      category: row.Category,
    };
  }
}
