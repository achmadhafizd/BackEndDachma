import express, { type RequestHandler } from "express";
import { Order } from "../models/Order";
import { protect } from "../middleware/auth.middleware";
import e from "express";

const router = express.Router();

// @route GET /api/orders/my-orders
// @desc Get logged in user's orders
// @access Private
const allOrder: RequestHandler = async (req, res) => {
  try {
    // Find the user's orders
    const orders = await Order.find({ user: req.user?._id }).sort({
      createdAt: -1,
    }); //sort by most recent orders
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @route GET /api/orders/:id
// @desc Get a single order by ID
// @access Private
const detailOrders: RequestHandler = async (req, res) => {
  try {
    // Find the user's orders populate user
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

router.get("/my-orders", protect as RequestHandler, allOrder); //Static route
router.get("/:id", protect as RequestHandler, detailOrders); //Dynamic route
export default router;
