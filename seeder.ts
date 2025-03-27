import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "./models/Product";
import { User } from "./models/User";
import { Cart } from "./models/Cart";
import products from "./data/products";

dotenv.config();

// connect to DB
mongoose.connect(process.env.MONGO_URI!);

// Function to seed data
const seedData = async () => {
  try {
    // clear xxisting data
    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();

    // Create Default Admin User
    const createdUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "1234567890",
      role: "admin",
    });

    // Assign the default user ID to each product
    const userID = createdUser._id;

    const sampleProducts = products.map((product) => {
      return { ...product, user: userID };
    });

    // Insert the products into the DB
    await Product.insertMany(sampleProducts);
    console.log("Product Data seeder successfully");
    process.exit();
  } catch (error) {
    console.error(`Error seeding data: ${error}`);
    process.exit(1);
  }
};

seedData();
