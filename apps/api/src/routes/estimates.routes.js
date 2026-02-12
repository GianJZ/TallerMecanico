import express from "express";
import { prisma } from "../db.js";
import { EstimateCreateSchema } from "../validation.js";
import { renderEstimatePdf } from "../services/estimatePdf.service.js";

export const estimatesRouter = express.Router();

// Genera folio consecutivo usando Counter (SQLite friendly)
async function nextFolio(tx) {
  // Si no existe, lo crea en 1
  // Si existe, incrementa +1
  const row = await tx.counter.upsert({
    where: { key: "estimate_folio" },
    create: { key: "estimate_folio", value: 1 },
    update: { value: { increment: 1 } },
  });

  return row.value; // 1,2,3...
}

// Crear presupuesto (datos manuales)
estimatesRouter.post("/", async (req, res) => {
  const parsed = EstimateCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid payload",
      issues: parsed.error.issues,
    });
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const folio = await nextFolio(tx);

      const estimate = await tx.estimate.create({
        data: {
          folio,

          // ✅ Datos manuales
          customerName: parsed.data.customerName,
          customerPhone: parsed.data.customerPhone,
          customerEmail: parsed.data.customerEmail ?? null,
          vehicleName: parsed.data.vehicleName,
          vehicleYear: parsed.data.vehicleYear ?? null,

          notes: parsed.data.notes ?? null,
          laborCost: parsed.data.laborCost ?? 0,
          discount: parsed.data.discount ?? 0,
          taxRate: parsed.data.taxRate ?? 19,

          items: {
            create: parsed.data.items.map((it) => ({
              productId: it.productId,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      return estimate;
    });

    res.status(201).json(created);
  } catch (e) {
    console.error("[estimates POST] error:", e);
    res.status(400).json({
      message: "Could not create estimate",
      error: String(e),
    });
  }
});

// Listar presupuestos (para historial)
estimatesRouter.get("/", async (req, res) => {
  const list = await prisma.estimate.findMany({
    include: { items: { include: { product: true } } },
    orderBy: [{ createdAt: "desc" }],
  });
  res.json(list);
});

// Obtener uno
estimatesRouter.get("/:id", async (req, res) => {
  const est = await prisma.estimate.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } } },
  });

  if (!est) return res.status(404).json({ message: "Estimate not found" });
  res.json(est);
});

// (Opcional) Anular presupuesto
// OJO: agrega CANCELED en el enum EstimateStatus en prisma si lo usas
estimatesRouter.delete("/:id", async (req, res) => {
  try {
    const updated = await prisma.estimate.update({
      where: { id: req.params.id },
      data: { status: "CANCELED" },
    });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: "Could not cancel estimate", error: String(e) });
  }
});

// PDF (descarga)
estimatesRouter.get("/:id/pdf", async (req, res) => {
  const est = await prisma.estimate.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } } },
  });

  if (!est) return res.status(404).json({ message: "Estimate not found" });

  const pdf = await renderEstimatePdf(est);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="presupuesto_${est.folio}.pdf"`
  );
  res.send(pdf);
});
