import { z } from "zod";

export const ProductCreateSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1).optional().nullable(),
  barcode: z.string().min(1).optional().nullable(),
  brand: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  costPrice: z.number().int().nonnegative().optional().nullable(),
  salePrice: z.number().int().nonnegative().optional().nullable(),
  stock: z.number().int().optional().default(0),
  minStock: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true)
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export const MovementCreateSchema = z
  .object({
    productId: z.string().min(1).optional(),
    barcode: z.string().min(1).optional(),

    type: z.enum(["IN", "OUT", "ADJUST"]),
    quantity: z.number().int().positive(),

    unitPrice: z.number().int().nonnegative().optional().nullable(),
    note: z.string().optional().nullable(),
    happenedAt: z.string().optional().nullable(),
    estimateId: z.string().optional().nullable(),
  })
  .refine((v) => v.productId || v.barcode, {
    message: "productId or barcode is required",
  });

export const CustomerCreateSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable()
});
export const CustomerUpdateSchema = CustomerCreateSchema.partial();

export const VehicleCreateSchema = z.object({
  plate: z.string().min(3),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  vin: z.string().optional().nullable(),
  customerId: z.string().min(1),
});
export const VehicleUpdateSchema = VehicleCreateSchema.partial().omit({ customerId: true });

export const EstimateCreateSchema = z.object({
  customerName: z.string().min(3),
  customerPhone: z.string().min(6),
  customerEmail: z.string().email().optional().nullable(),

  vehicleName: z.string().min(2),
  vehicleYear: z.number().int().optional().nullable(),

  notes: z.string().optional().nullable(),
  laborCost: z.number().int().nonnegative().optional().default(0),
  discount: z.number().int().nonnegative().optional().default(0),
  taxRate: z.number().int().nonnegative().optional().default(19),

  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPrice: z.number().int().nonnegative()
    })
  ).min(1),
});

