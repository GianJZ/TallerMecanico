import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import { prisma } from "./db.js";
import path from "path";


import { productUploadRouter } from "./routes/products.upload.routes.js";
import { productsRouter } from "./routes/products.routes.js";
import { movementsRouter } from "./routes/movements.routes.js";
import { alertsRouter } from "./routes/alerts.routes.js";
import { customersRouter } from "./routes/customers.routes.js";
import { vehiclesRouter } from "./routes/vehicles.routes.js";
import { estimatesRouter } from "./routes/estimates.routes.js";
import { reportsRouter } from "./routes/reports.routes.js";
import { getLowStockProductsSafe } from "./services/stockAlerts.service.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => res.json({ ok: true, service: "taller-api" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/products", productUploadRouter);

app.use("/products", productsRouter);
app.use("/movements", movementsRouter);
app.use("/alerts", alertsRouter);
app.use("/customers", customersRouter);
app.use("/vehicles", vehiclesRouter);
app.use("/estimates", estimatesRouter);
app.use("/reports", reportsRouter);

// Simple scheduled check (every day at 9am) - for now only logs.
// Later you can plug Nodemailer/WhatsApp.
cron.schedule("0 9 * * *", async () => {
  try {
    const low = await getLowStockProductsSafe();
    if (low.length) {
      console.log(`[ALERT] Low stock (${low.length}) ->`, low.map(p => `${p.name}(${p.stock}/${p.minStock})`).join(", "));
    }
  } catch (e) {
    console.error("Cron low-stock error:", e);
  }
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`API running on http://localhost:${port}`));

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
