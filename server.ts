import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import checkoutRoutes from "./routes/checkoutRoutes";
import orderRoutes from "./routes/orderRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import subscribeRoutes from "./routes/subscribeRoutes";
import adminRoutes from "./routes/adminRoutes";
import productAdminRoutes from "./routes/productAdminRoutes";
import adminOrderRoutes from "./routes/adminOrderRoutes";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Set port
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// Routes Test Endpoint
app.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to Dachma E-Commerce`);
});

// API ROUTES FOR APP
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", subscribeRoutes);

// API ROUTES FOR ADMIN
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ message: "Internal Server Error" });
});
