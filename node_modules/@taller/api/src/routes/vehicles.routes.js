import express from "express";
import { prisma } from "../db.js";
import { VehicleCreateSchema, VehicleUpdateSchema } from "../validation.js";

export const vehiclesRouter = express.Router();

vehiclesRouter.get("/", async (req, res) => {
  const q = (req.query.q ?? "").toString().trim();
  const where = q ? { OR: [{ plate: { contains: q } }, { brand: { contains: q } }, { model: { contains: q } }] } : {};
  const vehicles = await prisma.vehicle.findMany({ where, include: { customer: true }, orderBy: [{ plate: "asc" }] });
  res.json(vehicles);
});

vehiclesRouter.post("/", async (req, res) => {
  const parsed = VehicleCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  try {
    const created = await prisma.vehicle.create({ data: parsed.data });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ message: "Could not create vehicle", error: String(e) });
  }
});

vehiclesRouter.put("/:id", async (req, res) => {
  const parsed = VehicleUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  const updated = await prisma.vehicle.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(updated);
});
