DELETE FROM SellerProduct;

ALTER TABLE SellerProduct DROP COLUMN SellerProductId;

ALTER TABLE SellerProduct ADD COLUMN SellerProductId TEXT NOT NULL DEFAULT '';
