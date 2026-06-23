export interface SellerProductRequest {
  sellerProductId: string;
  sellerName: string;
  name: string;
  brand: string | null;
  category: string | null;
}

export interface SellerProduct {
  sellerName: string;
  productId: number;
  sellerProductId: string;
}
