export interface IOrderItem {
  productId: mongo.Schema.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
}

export interface IOrder {
  user: mongo.Schema.Types.ObjectId;
  orderItems: IOrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  totalPrice: number;
  isPaid?: boolean;
  paidAt?: Date;
  isDelivered?: boolean;
  deliveredAt?: Date;
  paymentStatus?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}
