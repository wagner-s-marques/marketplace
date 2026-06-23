DROP INDEX IF EXISTS idx_product_normalized;

CREATE INDEX idx_product_normalized
  ON Product (normalize(Name), normalize(Brand), normalize(Category));
