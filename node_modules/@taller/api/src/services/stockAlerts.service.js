import { prisma } from "../db.js";

export async function getLowStockProducts() {
  return prisma.product.findMany({
    where: { isActive: true, stock: { lte: prisma.product.fields.minStock } },
    orderBy: [{ stock: "asc" }, { name: "asc" }],
  });
}

/**
 * A more compatible SQLite query: we can't reference fields like above in Prisma reliably.
 * We'll do it in JS.
 */
export async function getLowStockProductsSafe() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ stock: "asc" }, { name: "asc" }],
  });
  return products.filter(p => (p.stock ?? 0) <= (p.minStock ?? 0));
}
