import multer from "multer";
import { storage } from "../config/cloudinary.js";

const uploadMiddleware = multer({ storage });

export default uploadMiddleware;
