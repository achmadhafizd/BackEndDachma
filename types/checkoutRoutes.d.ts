export interface ICheckoutBody {
  checkoutItems: ICheckoutItem[];
  shippingAddress: {};
  paymentMethod: string;
  totalPrice: number;
  paymentStatus: string;
  isPaid: boolean;
  paymentDetails: {};
}
