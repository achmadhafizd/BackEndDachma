import express from "express";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import multer from "multer";
import streamifier from "streamifier";
import router from "./userRoutes";

// Interface untuk hasil dari Cloudinary
interface CloudinaryResult {
  secure_url: string;
}

dotenv.config();

// cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer setup using memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(404).json({ message: "No file uploaded" });
      return;
    }

    // Function to handle the stream upload to cloudinary
    const streamUpload = (fileBuffer: Buffer) => {
      return new Promise<CloudinaryResult>((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder: "uploads" },
          (error, result) => {
            if (result) {
              resolve(result as CloudinaryResult);
            } else {
              reject(error);
            }
          }
        );
        // use streamifier to convert file buffer to a stream
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };
    // Call the streamUpload function
    const result = await streamUpload(req.file.buffer);

    // Respond with the uploaded image URL
    res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

export default router;
