import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

console.log("Cloudinary Config Check:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Missing");
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Set" : "Missing");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Set (Masked)" : "Missing");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // defaults
    let folder = "smart-assignment-system";
    let resource_type = "auto";

    // For PDFs and Docs, we want 'raw' or 'auto' but ensure no image transformations are applied by default.
    // Cloudinary's "auto" should handle it, but sometimes "raw" is safer for non-images like .doc/.docx
    if (file.mimetype === "application/pdf") {
      resource_type = "auto"; // PDF can be 'image' or 'raw', auto usually works best for previews
    } else if (file.mimetype === "application/msword" || file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      resource_type = "raw";
    }

    return {
      folder: folder,
      resource_type: resource_type,
      allowed_formats: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
      // explicit public_id can be added here if needed
    };
  },
});

export { cloudinary, storage };
