import mongoose, { Schema } from "mongoose";
import type { ICart, ICartItems } from "../types/cartModel";

const cartItemSchema = new mongoose.Schema<ICartItems>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
    },
    image: {
      type: String,
    },
    price: {
      type: Number,
    },
    size: {
      type: String,
    },
    color: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    guestId: {
      type: String,
    },
    products: {
      type: [cartItemSchema],
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Cart: mongoose.Model<ICart> = mongoose.model<ICart>(
  "Cart",
  cartSchema
);
