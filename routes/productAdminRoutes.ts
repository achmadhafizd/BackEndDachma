import express, { type RequestHandler } from "express";
import { Product } from "../models/Product";
import { protect, admin } from "../middleware/auth.middleware";

const router = express.Router();

// @route GET /api/admin/products
// @desc Get all products (Admin Only)
// @access Private / Admin
const getAllProducts: RequestHandler = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

router.get(
  "/",
  protect as RequestHandler,
  admin as RequestHandler,
  getAllProducts
);

export default router;
