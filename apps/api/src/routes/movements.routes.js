import express from "express";
import { prisma } from "../db.js";
import { MovementCreateSchema } from "../validation.js";

export const movementsRouter = express.Router();

// Create movement (IN/OUT/ADJUST) + updates stock + usageCount
movementsRouter.post("/", async (req, res) => {
  const parsed = MovementCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });

  const { productId, barcode, type, quantity, unitPrice, note, happenedAt, estimateId } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = productId
        ? await tx.product.findUnique({ where: { id: productId } })
        : await tx.product.findUnique({ where: { barcode } });

      if (!product) throw new Error("Product not found");

      let newStock = product.stock ?? 0;

      if (type === "IN") newStock += quantity;
      else if (type === "OUT") newStock -= quantity;
      else if (type === "ADJUST") newStock = quantity; // treat as absolute set

      if (newStock < 0) throw new Error("Stock cannot be negative");

      const movement = await tx.movement.create({
        data: {
          type,
          quantity,
          unitPrice: unitPrice ?? null,
          note: note ?? null,
          happenedAt: happenedAt ? new Date(happenedAt) : undefined,
          productId: product.id,
          estimateId: estimateId ?? null
        }
      });

      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: {
          stock: newStock,
          usageCount: type === "OUT" ? (product.usageCount + quantity) : product.usageCount
        }
      });

      return { movement, product: updatedProduct };
    });

    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ message: "Could not create movement", error: String(e) });
  }
});

// List movements with filters
movementsRouter.get("/", async (req, res) => {
  const type = req.query.type?.toString();
  const from = req.query.from?.toString();
  const to = req.query.to?.toString();

  const where = {};
  if (type) where.type = type;
  if (from || to) {
    where.happenedAt = {};
    if (from) where.happenedAt.gte = new Date(from);
    if (to) where.happenedAt.lte = new Date(to);
  }

  const list = await prisma.movement.findMany({
    where,
    include: { product: true, estimate: true },
    orderBy: [{ happenedAt: "desc" }]
  });

  res.json(list);
});
