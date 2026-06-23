import type { Database } from "../model/database.js";
import type { Product } from "../model/product.js";
import { findBestMatch } from "../util/token-similarity.js";

export interface FindProductCriteria {
  name: string;
  brand: string | null;
  category: string | null;
}

export interface ProductDeps {
  database: Database;
}

export class ProductController {
  constructor(private readonly deps: ProductDeps) {}

  find(criteria: FindProductCriteria): Product | null {
    const exact = this.deps.database.findProductByExactMatch(
      criteria.name,
      criteria.brand,
      criteria.category,
    );
    if (exact) return exact;

    const nameBrandCandidates = this.deps.database.findProductsByNameAndBrand(
      criteria.name,
      criteria.brand,
    );
    if (nameBrandCandidates.length === 1) return nameBrandCandidates[0]!;

    if (criteria.brand != null) {
      const brandCandidates = this.deps.database.findProductsByBrand(criteria.brand);
      const best = findBestMatch(criteria.name, brandCandidates);
      if (best) return best.product;
    }

    return null;
  }
}
