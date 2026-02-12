import express from "express";
import { prisma } from "../db.js";
import { CustomerCreateSchema, CustomerUpdateSchema } from "../validation.js";

export const customersRouter = express.Router();

customersRouter.get("/", async (req, res) => {
  const q = (req.query.q ?? "").toString().trim();
  const where = q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {};
  const customers = await prisma.customer.findMany({ where, orderBy: [{ name: "asc" }] });
  res.json(customers);
});

customersRouter.post("/", async (req, res) => {
  const parsed = CustomerCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  const created = await prisma.customer.create({ data: parsed.data });
  res.status(201).json(created);
});

customersRouter.put("/:id", async (req, res) => {
  const parsed = CustomerUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  const updated = await prisma.customer.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(updated);
});
