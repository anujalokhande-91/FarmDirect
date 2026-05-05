export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
    discountPrice?: number;
    quantity: number;
    unit: string;
    farmer: {
      _id: string;
      name: string;
    };
    isAvailable: boolean;
  };
  quantity: number;
  price: number;
  farmer: string;
  addedAt: string;
}

export interface Cart {
  _id: string;
  customer: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  totalItems: number;
}
