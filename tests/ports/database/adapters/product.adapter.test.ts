import { ProductAdapter } from "../../../../src/ports/database/adapters/product.adapter.js";
import type { ProductRow } from "../../../../src/ports/database/wire/in/product.row.js";

describe("ProductAdapter.toProduct", () => {
  const baseRow: ProductRow = {
    Id: 1,
    Name: "Blue T-Shirt",
    Brand: "Nike",
    Category: "Clothing",
  };

  it("maps all fields correctly", () => {
    const product = ProductAdapter.toProduct(baseRow);

    expect(product).toEqual({
      id: 1,
      name: "Blue T-Shirt",
      brand: "Nike",
      category: "Clothing",
    });
  });

  it("maps null brand", () => {
    const row: ProductRow = { ...baseRow, Brand: null };

    const product = ProductAdapter.toProduct(row);

    expect(product.brand).toBeNull();
  });

  it("maps null category", () => {
    const row: ProductRow = { ...baseRow, Category: null };

    const product = ProductAdapter.toProduct(row);

    expect(product.category).toBeNull();
  });

  it("maps null brand and category simultaneously", () => {
    const row: ProductRow = { ...baseRow, Brand: null, Category: null };

    const product = ProductAdapter.toProduct(row);

    expect(product.brand).toBeNull();
    expect(product.category).toBeNull();
  });
});
