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

    // For PDFs and Docs, we want 'raw' to ensure no image transformations (like q_auto) are applied.
    if (file.mimetype === "application/pdf") {
      resource_type = "raw";
    } else if (file.mimetype === "application/msword" || file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      resource_type = "raw";
    }

    return {
      folder: folder,
      resource_type: resource_type,
      allowed_formats: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
      public_id: file.originalname.split('.')[0] + "-" + Date.now() // Use original name + timestamp
    };
  },
});

export { cloudinary, storage };
