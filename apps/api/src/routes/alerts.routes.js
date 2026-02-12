import express from "express";
import { getLowStockProductsSafe } from "../services/stockAlerts.service.js";

export const alertsRouter = express.Router();

alertsRouter.get("/low-stock", async (req, res) => {
  const products = await getLowStockProductsSafe();
  res.json(products);
});
