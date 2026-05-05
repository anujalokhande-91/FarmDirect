export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  emoji?: string;
  farmerName?: string;
  farmerId?: string;
}

export interface TrackingEntry {
  status: string;
  message: string;
  timestamp: string;
  updatedBy?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  orderStatus:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'out-for-delivery'
    | 'delivered'
    | 'cancelled'
    | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  deliveryAddress: DeliveryAddress;
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  gstAmount: number;
  finalAmount: number;
  invoiceAmount?: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceData {
  orderNumber: string;
  invoiceNumber?: string;
  invoiceDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  gstPercent: number;
  gstAmount: number;
  invoiceAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  paidAt?: string;
}