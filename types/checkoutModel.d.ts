import type { Mixed, mongo } from "mongoose";

export interface ICheckoutItem {
  productId: mongo.Schema.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
}

export interface ICheckout {
  user: mongo.Schema.Types.ObjectId;
  checkoutItems: ICheckoutItem[];
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
  paymentStatus?: string;
  paymentDetails?: Mixed;
  isFinalized?: boolean;
  isFinalizedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

