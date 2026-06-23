import type Sqlite from "better-sqlite3";
import type { Database } from "../../domain/model/database.js";
import type { Product } from "../../domain/model/product.js";
import type { SellerProduct } from "../../domain/model/seller-product.js";
import { ProductAdapter } from "./adapters/product.adapter.js";
import { SellerProductAdapter } from "./adapters/seller-product.adapter.js";
import type { ProductRow } from "./wire/in/product.row.js";

export class SqliteDatabase implements Database {
  private readonly findStmt: Sqlite.Statement;
  private readonly insertStmt: Sqlite.Statement;

  constructor(private readonly conn: Sqlite.Database) {
    this.findStmt = conn.prepare(
      "SELECT Id, Name, Brand, Category FROM Product WHERE Name IS ? AND Brand IS ? AND Category IS ?",
    );
    this.insertStmt = conn.prepare(
      "INSERT INTO SellerProduct (SellerName, ProductId, SellerProductId) VALUES (@SellerName, @ProductId, @SellerProductId)",
    );
  }

  findProductByExactMatch(
    name: string,
    brand: string | null,
    category: string | null,
  ): Product | null {
    const row = this.findStmt.get(name, brand, category) as
      | ProductRow
      | undefined;
    if (!row) return null;
    return ProductAdapter.toProduct(row);
  }

  saveSellerProduct(sellerProduct: SellerProduct): void {
    this.insertStmt.run(SellerProductAdapter.toRow(sellerProduct));
  }

  runTransaction<T>(fn: () => T): T {
    return this.conn.transaction(fn)();
  }
}
