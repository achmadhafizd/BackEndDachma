import express, { type RequestHandler } from "express";
import { Cart } from "../models/Cart";
import { protect } from "../middleware/auth.middleware";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { Order } from "../models/Order";
import type { ICheckoutBody } from "../types/checkoutRoutes";
import { Checkout } from "../models/Checkout";
import type mongoose from "mongoose";

const router = express.Router();

// @route POST /api/checkout
// @desc Create a new checkout session
// @access Private
const createCheckout: RequestHandler<{}, {}, ICheckoutBody> = async (
  req,
  res
) => {
  // Extract product ID from request body
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } =
    req.body;
  // Check if the cart is empty
  if (!checkoutItems || checkoutItems.length === 0) {
    res.status(400).json({ message: "No items in cart" });
  }

  try {
    // Create a new checkout session
    const newCheckout = await Checkout.create({
      user: req.user?._id,
      checkoutItems: checkoutItems,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      totalPrice: totalPrice,
      paymentStatus: "Pending",
      isPaid: false,
    });
    console.log(`Checkout created for user: ${req.user?._id}`);
    res.status(201).json(newCheckout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route PUT /api/checkout/:id/pay
// @desc Update the payment status of a checkout session after successful payment
// @access Private
const updatePaymentStatus: RequestHandler<
  { id: string },
  {},
  ICheckoutBody
> = async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;
  try {
    // find the checkout session
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      res.status(404).json({ message: "Checkout not found" });
      return;
    }

    // update the payment status
    if (paymentStatus === "paid") {
      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails as mongoose.Schema.Types.Mixed;
      checkout.paidAt = new Date(Date.now());
      await checkout.save();

      res.status(200).json(checkout);
    } else {
      res.status(400).json({ message: "Payment not successful" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route POST /api/checkout/:id/finalize
// @desc Finalize checkout and convert to an order after payment confirmation
// @access Private
const finalizeCheckout: RequestHandler = async (req, res) => {
  try {
    // find the checkout session
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      res.status(404).json({ message: "Checkout not found" });
      return;
    }

    if (checkout.isPaid && !checkout.isFinalized) {
      // Create final order based on the checkout details
      const finalOrder = await Order.create({
        user: checkout.user,
        orderItems: checkout.checkoutItems,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: checkout.paymentMethod,
        totalPrice: checkout.totalPrice,
        isPaid: true,
        paidAt: checkout.paidAt,
        isDelivered: false,
        paymentStatus: "paid",
        paymentDetails: checkout.paymentDetails,
      });
      // Mark the checkout as finalized
      checkout.isFinalized = true;
      checkout.isFinalizedAt = new Date(Date.now());
      await checkout.save();
      // Delete the cart associated with the user
      await Cart.findOneAndDelete({ user: checkout.user });
      res.status(201).json(finalOrder);
    } else if (checkout.isFinalized) {
      res.status(400).json({ message: "Checkout already finalized" });
    } else {
      res.status(400).json({ message: "Checkout is not paid" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

router.post("/", protect as RequestHandler, createCheckout); // General route
router.put("/:id/pay", protect as RequestHandler, updatePaymentStatus); //Dynamic route
router.post("/:id/finalize", protect as RequestHandler, finalizeCheckout); //Dynamic route

export default router;
