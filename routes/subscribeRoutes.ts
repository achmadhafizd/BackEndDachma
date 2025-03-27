import express from "express";
import { Subscriber } from "../models/Subscribers";

const router = express.Router();

// @route POST /api/subscribe
// @desc Handle newsletter subscription
// @access Public
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  try {
    // Check if email already subscribed
    let subscriber = await Subscriber.findOne({ email });
    if (subscriber) {
      res.status(400).json({ message: "Email is already subscribed" });
      return;
    }

    // Create new subscriber
    subscriber = new Subscriber({ email });
    await subscriber.save();

    res
      .status(201)
      .json({ message: "Successfully subscribed to the newsletter" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
    return;
  }
});

export default router;
