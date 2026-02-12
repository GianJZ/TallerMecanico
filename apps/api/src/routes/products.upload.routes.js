import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "../db.js";

export const productUploadRouter = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "products");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${req.params.id}-${Date.now()}${ext || ".jpg"}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only JPG/PNG/WEBP allowed"), ok);
  },
});

productUploadRouter.post("/:id/image", upload.single("image"), async (req, res) => {
  try {
    const id = req.params.id;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No image uploaded" });

    const imageUrl = `/uploads/products/${file.filename}`;

    const updated = await prisma.product.update({
      where: { id },
      data: { imageUrl },
    });

    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: "Upload failed", error: String(e) });
  }
});
