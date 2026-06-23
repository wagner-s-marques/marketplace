CREATE INDEX idx_product_normalized
  ON Product (normalize(Name), normalize(Brand), normalize(Category));
