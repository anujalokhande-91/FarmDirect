export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  unit: 'kg' | 'litre' | 'dozen' | 'piece' | 'gram' | 'ml' | 'packet' | 'box';
  category: 'vegetables' | 'fruits' | 'grains' | 'dairy' | 'spices' | 'flowers' | 'seeds';
  images: string[];
  farmer: {
    _id: string;
    name: string;
  };
  farmerName: string;
  isOrganic: boolean;
  rating: {
    average: number;
    count: number;
  };
  reviews: any[];
  tags: string[];
  season?: string;
  harvestDate?: string;
  expiryDate?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  minimumOrderQuantity: number;
  maximumOrderQuantity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  sortBy?: 'price-low' | 'price-high' | 'rating' | 'newest';
  search?: string;
  page?: number;
  limit?: number;
}
