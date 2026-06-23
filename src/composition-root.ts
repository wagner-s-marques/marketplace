import { ProductController } from "./domain/controller/product.js";
import { SellerProductController } from "./domain/controller/seller-product.js";
import { Connection } from "./ports/database/connection.js";
import { SqliteDatabase } from "./ports/database/database.js";
import { Server } from "./ports/http-server/server.js";
import { SellerProductEndpoint } from "./ports/http-server/seller-product.endpoint.js";

export function composeApp(): Server {
  const dbPath = process.env.DATABASE_PATH ?? "./data/catalog.db";
  const connection = new Connection(dbPath);
  const database = new SqliteDatabase(connection.db);
  const productController = new ProductController({ database });
  const controller = new SellerProductController({ database, productController });
  const endpoint = new SellerProductEndpoint(controller);
  return new Server([endpoint.router]);
}
