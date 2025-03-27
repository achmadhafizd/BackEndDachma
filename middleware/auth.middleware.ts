import jwt, { type JwtPayload } from "jsonwebtoken";
import { User } from "../models/User";
import type { Request, Response, NextFunction } from "express";

// Middleware to protect routes
const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (
    // Check for token in header
    req.headers.authorization &&
    // Check if the token starts with "Bearer"
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header and remove "Bearer "
      token = req.headers.authorization.split(" ")[1];
      // Verify token 
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      // Get user from the token
      req.user = await User.findById(decoded.user.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error(`Token verification failed!`);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// Middleware to check if the user is an admin
const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

export { protect, admin };
