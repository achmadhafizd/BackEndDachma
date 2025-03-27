export interface ICartBody {
  userId: string;
  guestId: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export interface ICartQuery {
  userId: string;
  guestId: string;
}