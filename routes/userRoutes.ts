import express from "express";
import type { RequestHandler } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import type { ILoginBody, IRegisterBody } from "../types/userRoutes";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();
router.use(express.json());

// @route POST /api/users/Register
// @desc Register a new user
// @access Public
const registerUser = async (
  req: express.Request<{}, {}, IRegisterBody>,
  res: express.Response,
  next: express.NextFunction
) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Create new user
    user = new User({ name, email, password });
    await user.save();

    // Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } };

    // Sign and return the token along with user data
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "60m",
    });

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @Route POST /api/users/login
// @desc Authentication user
// @access Public
const loginUser = async (
  req: express.Request<{}, {}, ILoginBody>,
  res: express.Response,
  next: express.NextFunction
) => {
  const { email, password } = req.body;
  try {
    // find user by email
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User Not Found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    // Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } };

    // Sign and return the token along with user data
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "60m",
    });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
    next(error);
  }
};

// @Route GET /api/users/profile
// @desc Get logged-in user's profile
// @access Private
const profileUser: RequestHandler = async (req, res) => {
  res.json(req.user);
};

router.post("/register", registerUser as RequestHandler); // Static route
router.post("/login", loginUser as RequestHandler); // Static route
router.get("/profile", protect as RequestHandler, profileUser); //Static route

export default router;
