import express from "express";
import { prisma } from "../db.js";

export const reportsRouter = express.Router();

/**
 * GET /reports/monthly?year=2026&month=2
 * Aggregates OUT movements by product in that month.
 */
reportsRouter.get("/monthly", async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month); // 1-12
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return res.status(400).json({ message: "Provide year and month (1-12)" });
  }

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));

  const outs = await prisma.movement.findMany({
    where: { type: "OUT", happenedAt: { gte: start, lt: end } },
    include: { product: true }
  });

  const map = new Map();
  for (const m of outs) {
    const key = m.productId;
    const prev = map.get(key) ?? { productId: key, name: m.product.name, barcode: m.product.barcode, quantity: 0, revenue: 0 };
    prev.quantity += m.quantity;
    const price = m.unitPrice ?? (m.product.salePrice ?? 0);
    prev.revenue += m.quantity * price;
    map.set(key, prev);
  }

  const rows = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  res.json({ year, month, start, end, rows });
});
