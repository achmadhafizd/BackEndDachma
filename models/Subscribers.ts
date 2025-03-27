import { subscribe } from "diagnostics_channel";
import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema<ISubscribers>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Subscriber = mongoose.model<ISubscribers>(
  "Subscriber",
  subscriberSchema
);
