import express from "express";
import { prisma } from "../db.js";
import { ProductCreateSchema, ProductUpdateSchema } from "../validation.js";

export const productsRouter = express.Router();

/* =========================
   LISTAR PRODUCTOS
========================= */
productsRouter.get("/", async (req, res) => {
  const q = (req.query.q ?? "").toString().trim();

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { barcode: q },
          { sku: q },
        ],
      }
    : {};

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ name: "asc" }],
  });

  res.json(products);
});

/* =========================
   OBTENER POR ID
========================= */
productsRouter.get("/:id", async (req, res) => {
  const p = await prisma.product.findUnique({
    where: { id: req.params.id },
  });

  if (!p) return res.status(404).json({ message: "Product not found" });
  res.json(p);
});

/* =========================
   OBTENER POR BARCODE
========================= */
productsRouter.get("/by-barcode/:barcode", async (req, res) => {
  const p = await prisma.product.findUnique({
    where: { barcode: req.params.barcode },
  });

  if (!p) return res.status(404).json({ message: "Product not found" });
  res.json(p);
});

/* =========================
   CREAR PRODUCTO
========================= */
productsRouter.post("/", async (req, res) => {
  const parsed = ProductCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  try {
    const created = await prisma.product.create({
      data: parsed.data,
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({
      message: "Could not create product",
      error: String(e),
    });
  }
});

/* =========================
   ACTUALIZAR PRODUCTO
========================= */
productsRouter.put("/:id", async (req, res) => {
  const parsed = ProductUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  try {
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(updated);
  } catch (e) {
    res.status(400).json({
      message: "Could not update product",
      error: String(e),
    });
  }
});

/* =========================
   ELIMINAR PRODUCTO (SOFT DELETE)
========================= */
productsRouter.delete("/:id", async (req, res) => {
  try {
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json(updated);
  } catch (e) {
    res.status(400).json({
      message: "Could not delete product",
      error: String(e),
    });
  }
});
