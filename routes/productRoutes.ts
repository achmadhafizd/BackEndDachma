import express, { type RequestHandler } from "express";
import { Product } from "../models/Product";
import { protect, admin } from "../middleware/auth.middleware";
import type { IProduct } from "../types/productModel";
import type { QueryParams } from "../types/productRoutes";
import type { SortOrder } from "mongoose";

const router = express.Router();

// @route POST /api/products
// @desc Create a new Product
// @access Private/Admin
const newProduct: RequestHandler<{}, {}, IProduct> = async (req, res) => {
  // Extract product details from request body
  const {
    name,
    description,
    price,
    discountPrice,
    countInStock,
    category,
    brand,
    sizes,
    colors,
    collections,
    material,
    gender,
    images,
    isFeatured,
    isPublished,
    tags,
    dimensions,
    weight,
    sku,
  } = req.body;

  try {
    // Check if a product with the same sku already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      res.status(400).send({ message: "Product with this sku already exists" });
      return;
    }

    // Create a new product
    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
      user: req.user?._id, // reference to the admin user who created it
    });

    // Save the product
    const createdProduct = await product.save();

    // Send the created product as a response
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Something went wrong" });
  }
};

// @route PUT /api/products/:id
// @desc Update an existing Product ID
// @access Private/Admin
const updateProduct: RequestHandler<{ id: string }, {}, IProduct> = async (
  req,
  res
) => {
  // Extract product ID from request params
  const { id } = req.params;

  // Extract product details from request body
  const {
    name,
    description,
    price,
    discountPrice,
    countInStock,
    category,
    brand,
    sizes,
    colors,
    collections,
    material,
    gender,
    images,
    isFeatured,
    isPublished,
    tags,
    dimensions,
    weight,
    sku,
  } = req.body;

  try {
    //   Find Product by ID
    const product = await Product.findById(id);

    if (product) {
      // update product fields
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.discountPrice = discountPrice || product.discountPrice;
      product.countInStock = countInStock || product.countInStock;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.sizes = sizes || product.sizes;
      product.colors = colors || product.colors;
      product.collections = collections || product.collections;
      product.material = material || product.material;
      product.gender = gender || product.gender;
      product.images = images || product.images;
      product.isFeatured =
        isFeatured !== undefined ? isFeatured : product.isFeatured;
      product.isPublished =
        isPublished !== undefined ? isPublished : product.isPublished;
      product.tags = tags || product.tags;
      product.dimensions = dimensions || product.dimensions;
      product.weight = weight || product.weight;
      product.sku = sku || product.sku;

      // Save the updated product
      const updatedProduct = await product?.save();

      // Send the updated product as a response
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @route DELETE .api/products/:id
// @desc Delete a Product by ID
// @access Private/Admin
const deleteProduct: RequestHandler<{ id: string }, {}, IProduct> = async (
  req,
  res
) => {
  // Extract product ID from request params
  const { id } = req.params;

  try {
    // Find Product by ID
    const product = await Product.findById(id);
    // Check if product exists
    if (product) {
      // Remove from product from DB
      await product.deleteOne();

      // Send a response
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @route GET /api/products
// @desc Get all products with optional query filters
// @access Public
const getProducts: RequestHandler<{}, {}, IProduct, QueryParams> = async (
  req,
  res
) => {
  // Extract query parameters
  const {
    collection,
    size,
    color,
    gender,
    minPrice,
    maxPrice,
    sortBy,
    search,
    category,
    material,
    brand,
    limit,
  } = req.query;

  // Create a query object for filtering
  let query: Record<string, any> = {};

  // Define sort options
  const sortOptions: Record<string, SortOrder> = {
    priceAsc: "asc",
    priceDesc: "desc",
    popularity: -1,
  };

  try {
    // Apply query filters
    if (collection && collection.toLocaleLowerCase() !== "all") {
      query.collections = collection;
    }
    if (category && category.toLocaleLowerCase() !== "all") {
      query.category = category;
    }
    if (material) {
      // Convert comma-separated material values to an array
      query.material = { $in: material.split(",") };
    }
    if (brand) {
      query.brand = { $in: brand.split(",") };
    }
    if (size) {
      query.sizes = { $in: size.split(",") };
    }
    if (color) {
      query.colors = { $in: [color] };
    }
    if (gender) {
      query.gender = gender;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        // Convert minPrice to a number || $gte for greater than
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        // Convert maxPrice to a number || $lt for less than
        query.price.$lte = Number(maxPrice);
      }
    }
    if (search) {
      // Create a regex pattern for case-insensitive || $options: 'i' for case-insensitive || $or for global search
      query.$or = [
        {
          // Search by name or description
          name: { $regex: search, $options: "i" },
          description: { $regex: search, $options: "i" },
        },
      ];
    }

    // Apply sorting based on the sortBy parameter
    const sort: { [key: string]: SortOrder } = sortOptions[sortBy as string]
      ? {
          [sortBy === "popularity" ? "rating" : "price"]:
            sortOptions[sortBy as string],
        }
      : { createdAt: -1 };

    // Fetch products and apply sorting and limit
    let products = await Product.find(query)
      // Sort the products
      .sort(sort)
      // Limit the number of products
      .limit(Number(limit) || 0);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @route GET /api/products/best-sellers
// @desc Retrieve the product with the highest rating
// @access Public
const bestSellers: RequestHandler = async (req, res) => {
  try {
    // Find the product with the highest rating
    const bestSeller = await Product.findOne().sort({ rating: -1 });
    // Check if product exists
    if (bestSeller) {
      res.json(bestSeller);
    } else {
      res.status(404).json({ message: "No best seller found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @route GET /api/products/new-arrivals
// @desc Retrieve new arrivals products
// @access Public
const newArrivals: RequestHandler = async (req, res) => {
  try {
    // Find the product with the New Arrivals
    const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);

    if (newArrivals) {
      res.json(newArrivals);
    } else {
      res.status(404).json({ message: "No new arrivals found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @route GET /api/products/:id
// @desc Get a single product by ID
// @access Public
const detailsProduct: RequestHandler<{ id: string }, {}, IProduct> = async (
  req,
  res
) => {
  // Extract product ID from request params
  const { id } = req.params;

  try {
    // Find Product by ID
    const product = await Product.findById(id);

    // Check if product exists
    if (product) {
      res.json(product);
    } else {
      res.status(400).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @route GET /api/product/similar/:id
// @desc Retrieve based on the current product's gender and category
// @access Public
const similarProduct: RequestHandler<{ id: string }> = async (req, res) => {
  // Extract product ID from request params
  const { id } = req.params;
  try {
    // Find Product by ID
    const product = await Product.findById(id);

    // Check if product exists
    if (!product) {
      res.status(400).json({ message: "Product not found" });
      // Should ended with return statement because the RequestHandler doesn't return anything
      return;
    }

    // Find similar products based on gender and category
    const similarProducts = await Product.find({
      _id: { $ne: id },
      gender: product.gender,
      category: product.category,
    }).limit(4);

    // Return similar products
    res.json(similarProducts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Routes should be defined in the order: static -> dynamic -> and then general to ensure proper functionality.
router.post(
  "/",
  protect as RequestHandler,
  admin as RequestHandler,
  newProduct
);
router.put(
  "/:id",
  protect as RequestHandler,
  admin as RequestHandler,
  updateProduct
);
router.delete(
  "/:id",
  protect as RequestHandler,
  admin as RequestHandler,
  deleteProduct
);
router.get("/new-arrivals", newArrivals); // Static Route
router.get("/best-sellers", bestSellers); // Static Route
router.get("/similar/:id", similarProduct); // Dynamic Route
router.get("/:id", detailsProduct); // Dynamic Route
router.get("/", getProducts); // General Route

export default router;
