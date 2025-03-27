import express, { type RequestHandler } from "express";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { protect } from "../middleware/auth.middleware";
import type { ICartBody, ICartQuery } from "../types/cartRoutes";

const router = express.Router();

// Helper function to get cart for a guest or logged in user
const getCart = async (guestId: string, userId: string) => {
  // Determine if the user is logged in or guest
  if (userId) {
    // find the cart for the logged in user
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    // find the cart for the guest
    return await Cart.findOne({ guestId: guestId });
  }
  return null;
};

// @route POST /api/cart
// @desc Add product to cart for a guest or logged in  user
// @access Public
const addCart: RequestHandler = async (req, res) => {
  // Extract product ID from request body
  const { productId, quantity, size, color, guestId, userId } = req.body;

  try {
    // Find product by ID
    const product = await Product.findById(productId);
    // Check if product exists
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    //Determine if the user is logged in or guest
    let cart = await getCart(guestId, userId);

    // if the cart exists, update it
    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) =>
          p.productId.toString() === productId &&
          p.size === size &&
          p.color === color
      );

      if (productIndex > -1) {
        // if the product already exists in the cart, update the quantity
        cart.products[productIndex].quantity += quantity;
      } else {
        // add the product to the cart
        cart.products.push({
          productId,
          name: product.name,
          image: product.images[0].url,
          price: product.price,
          size,
          color,
          quantity,
        });
      }
      //  Recalculate the total price
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + (item.price ?? 0) * item.quantity,
        0
      );

      //   Save the updated cart
      await cart.save();
      res.status(200).json(cart);
      return;
    } else {
      // Create a new cart for the guest or user
      const newCart = await Cart.create({
        // check if the user is logged in
        user: userId ? userId : undefined,
        // check if the user is a guest
        guestId: guestId ?? "guest_" + new Date().getTime(),
        // add the product to the cart
        products: [
          {
            productId,
            name: product.name,
            image: product.images[0]?.url ?? "",
            price: product.price,
            size,
            color,
            quantity,
          },
        ],
        // calculate the total price
        totalPrice: product.price * quantity,
      });
      //   Save the new cart
      res.status(201).json(newCart);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @route PUT /api/cart
// @desc Update product quantity in the cart for guest or logged in user
// @access Public
const updateCart: RequestHandler<{}, {}, ICartBody> = async (req, res) => {
  // Extract product ID from request body
  const { productId, quantity, size, color, guestId, userId } = req.body;

  try {
    // Determine if the user is logged in or guest
    let cart = await getCart(guestId, userId);
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    // Find the product in the cart
    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
    );
    // If the product exists in the cart
    if (productIndex > -1) {
      // update quantity
      if (quantity > 0) {
        cart.products[productIndex].quantity = quantity;
      } else {
        // remove the product
        cart.products.splice(productIndex, 1); //Remove the product if quantity is 0
      }
      // Recalculate the total price
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + (item.price ?? 0) * item.quantity,
        0
      );
      // Save the updated cart
      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @route DELETE /api/cart
// @desc Delete cart for guest or logged in user
// @access Public
const deleteCart: RequestHandler<{}, {}, ICartBody> = async (req, res) => {
  // Extract product ID from request body
  const { productId, size, color, guestId, userId } = req.body;

  try {
    // Determine if the user is logged in or guest
    let cart = await getCart(guestId, userId);
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }
    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
    );

    // If the product exists in the cart
    if (productIndex > -1) {
      // Remove the product
      cart.products.splice(productIndex, 1);
      // Recalculate the total price
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + (item.price ?? 0) * item.quantity,
        0
      );
      // Save the updated cart
      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @route GET /api/cart
// @desc Get cart for guest or logged in user
// @access Public
const allCarts: RequestHandler<{}, {}, ICartBody, ICartQuery> = async (
  req,
  res
) => {
  // Extract product ID from request body
  const { userId, guestId } = req.query;

  console.log("Received userId:", userId);
  console.log("Received guestId:", guestId);

  try {
    //  Determine if the user is logged in or guest
    const cart = await getCart(guestId, userId);
    if (cart) {
      // Return the cart
      res.json(cart);
    } else {
      // Return a 404 error
      console.log(
        `Cart not found for: Guest ID: ${guestId}, User ID: ${userId}`
      );
      res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @route POST /api/cart/merge
// @desc Merge guest cart into user cart on login
// @access Private
const mergeCart: RequestHandler<{}, {}, ICartBody> = async (req, res) => {
  const { guestId } = req.body;
  try {
    // Find the guest and user cart
    const guestCart = await Cart.findOne({ guestId: guestId });
    const userCart = await Cart.findOne({ user: req.user?._id });

    if (guestCart) {
      // Check if the guest cart is empty
      if (guestCart.products.length === 0) {
        res.status(400).json({ message: "Guest cart is empty" });
      }

      // If the user cart exists, merge the guest cart into it
      if (userCart) {
        // Merge guest cart into the user cart
        guestCart.products.forEach((guestItem) => {
          // Check if the product already exists in the user cart
          const productIndex = userCart.products.findIndex(
            (p) =>
              p.productId.toString() === guestItem.productId.toString() && // Check if the product ID matches
              p.size === guestItem.size && // Check if the size matches
              p.color === guestItem.color // Check if the color matches
          );

          if (productIndex > -1) {
            // If the product already exists in the user cart, update the quantity
            userCart.products[productIndex].quantity += guestItem.quantity;
          } else {
            // Otherwise, add the guest item to the cart
            userCart.products.push(guestItem);
          }
        });

        // Recalculate the total price
        userCart.totalPrice = userCart.products.reduce(
          (acc, item) => acc + (item.price ?? 0) * item.quantity,
          0
        );
        await userCart.save();

        // Delete the guest cart
        try {
          await Cart.findOneAndDelete({ guestId: guestId });
        } catch (error) {
          console.error(error);
          res.status(404).json({ message: "Guest cart not found" });
        }

        res.status(200).json(userCart);
      } else {
        // If the user cart does not exist, create it and merge the guest cart into it
        guestCart.user = req.user?._id; // Assign the user ID to the guest cart
        guestCart.guestId = undefined; // Remove the guest ID from the guest cart
        await guestCart.save(); // Save the guest cart

        res.status(200).json(guestCart);
      }
    } else {
      if (userCart) {
        // Guest cart has been merged, return the user cart
        res.status(200).json(userCart);
      }
      res.status(404).json({ message: "Guest cart not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

router.post("/", addCart); //General route
router.put("/", updateCart); // General route
router.delete("/", deleteCart); // General route
router.get("/", allCarts); // General route
router.post("/merge", protect as RequestHandler, mergeCart); // Static route
export default router;
