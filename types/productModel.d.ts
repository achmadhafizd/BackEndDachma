import type { Document, ObjectId } from "mongoose";

interface IProduct extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  countInStock: number;
  sku: string;
  category: string;
  brand?: string;
  sizes: string[];
  colors: string[];
  collections: string;
  material?: string;
  gender: string;
  images: {
    url: string;
    altText?: string;
  }[];
  isFeatured: boolean;
  isPublished: boolean;
  rating?: number;
  numReviews?: number;
  tags?: string[];
  user: ObjectId;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}
