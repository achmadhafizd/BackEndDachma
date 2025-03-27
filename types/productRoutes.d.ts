export interface IProduct {
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
  tags?: string[];
  dimensions: {
    length: number;
    height: number;
    width: number;
  };
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductParams {
  id: string;
}

export interface QueryParams {
  collection?: string;
  size?: string;
  color?: string;
  gender?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  search?: string;
  category?: string;
  material?: string;
  brand?: string;
  limit?: string;
}
