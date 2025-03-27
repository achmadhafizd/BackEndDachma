import type { mongo } from "mongoose";

export interface ICartItems {
  productId: mongo.Schema.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}[]

export interface ICart {
  user: mongo.Schema.Types.ObjectId;
  guestId: string | undefined;
  products: ICartItems[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}
