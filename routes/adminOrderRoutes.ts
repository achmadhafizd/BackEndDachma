import express, { type RequestHandler } from "express";
import { Order } from "../models/Order";
import { protect, admin } from "../middleware/auth.middleware";

const router = express.Router();

// @route GET /api/admin/orders
// @desc Get all orders (Admin Only)
// @access Private / Admin
const getAllOrders: RequestHandler = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email");
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @route PUT /api/admin/orders/:id/
// @desc Update order status (Admin Only)
// @access Private / Admin
const updateOrder: RequestHandler = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name");
    if (order) {
      order.status = req.body.status || order.status;
      order.isDelivered =
        req.body.status === "Delivered" ? true : order.isDelivered;
      order.deliveredAt =
        req.body.status === "Delivered"
          ? new Date(Date.now())
          : order.deliveredAt;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @route DELETE /api/admin/orders/:id
// @desc Delete an order (Admin Only)
// @access Private / Admin
const deleteOrder: RequestHandler = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: "Order deleted successfully" });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

router.get(
  "/",
  protect as RequestHandler,
  admin as RequestHandler,
  getAllOrders
);
router.put(
  "/:id",
  protect as RequestHandler,
  admin as RequestHandler,
  updateOrder
);
router.delete(
  "/:id",
  protect as RequestHandler,
  admin as RequestHandler,
  deleteOrder
);

export default router;
