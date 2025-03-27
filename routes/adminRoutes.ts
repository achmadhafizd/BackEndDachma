import express, { type RequestHandler } from "express";
import { User } from "../models/User";
import { protect, admin } from "../middleware/auth.middleware";
import type { IAdminBody } from "../types/adminRoutes";

const router = express.Router();

// @route GET /api/admin/users
// @desc get all users (Admin Only)
// @access Private
const getAllUsers: RequestHandler = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @route POST /api/admin/users
// @desc Add a new user (Admin Only)
// @access Private
const addUser: RequestHandler<{}, {}, IAdminBody> = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    user = new User({ name, email, password, role: role || "customer" });
    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @route PUT /api/admin/users/:id
// @desc Update user information (Admin Only) ~ Name, Email, Role
// @access Private
const updateUser: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
    }
    const updatedUser = await user.save();

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @route DELETE /api/admin/users/:id
// @desc Delete a user (Admin Only)
// @access Private/Admin
const deleteUser: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
      return;
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
  getAllUsers
);
router.post("/", protect as RequestHandler, admin as RequestHandler, addUser);
router.put(
  "/:id",
  protect as RequestHandler,
  admin as RequestHandler,
  updateUser
);
router.delete(
  "/:id",
  protect as RequestHandler,
  admin as RequestHandler,
  deleteUser
);

export default router;
