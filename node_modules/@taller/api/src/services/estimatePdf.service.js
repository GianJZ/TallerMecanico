import { PDFDocument, StandardFonts } from "pdf-lib";
import { clp } from "../utils/money.js";

export async function renderEstimatePdf(estimate) {
  const pdfDoc = await PDFDocument.create();

  // OJO: page debe ser let para poder cambiar al crear nuevas páginas
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 (pt)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 40;
  let y = 800;

  const drawText = (text, x, y, size = 11, bold = false) => {
    page.drawText(String(text ?? ""), {
      x,
      y,
      size,
      font: bold ? fontBold : font,
    });
  };

  const newPageIfNeeded = (minY = 80) => {
    if (y < minY) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 800;
    }
  };

  // Header
  drawText(`Presupuesto #${estimate.folio}`, margin, y, 18, true);
  y -= 22;
  drawText(`Fecha: ${new Date(estimate.createdAt).toLocaleString("es-CL")}`, margin, y, 10);
  y -= 18;

  // Cliente (manual)
  drawText("Cliente:", margin, y, 12, true);
  y -= 14;
  drawText(`${estimate.customerName ?? ""}`, margin, y, 11);
  y -= 14;

  drawText(`Tel: ${estimate.customerPhone ?? ""}`, margin, y, 10);
  y -= 12;

  if (estimate.customerEmail) {
    drawText(`Email: ${estimate.customerEmail}`, margin, y, 10);
    y -= 12;
  }

  y -= 8;

  // Vehículo (manual)
  drawText("Vehículo:", margin, y, 12, true);
  y -= 14;
  drawText(
    `${estimate.vehicleName ?? ""}${estimate.vehicleYear ? " (" + estimate.vehicleYear + ")" : ""}`,
    margin,
    y,
    11
  );
  y -= 18;

  // Tabla
  newPageIfNeeded(140);
  drawText("Producto", margin, y, 11, true);
  drawText("Cant.", 360, y, 11, true);
  drawText("Precio", 420, y, 11, true);
  drawText("Total", 500, y, 11, true);
  y -= 10;

  page.drawLine({ start: { x: margin, y }, end: { x: 555, y }, thickness: 1 });
  y -= 14;

  let itemsSubtotal = 0;

  for (const it of estimate.items) {
    newPageIfNeeded(120);

    const name = it.product?.name ?? "Producto";
    const qty = it.quantity ?? 0;
    const price = it.unitPrice ?? 0;
    const lineTotal = qty * price;
    itemsSubtotal += lineTotal;

    const trimmedName = name.length > 45 ? name.slice(0, 45) + "…" : name;

    drawText(trimmedName, margin, y, 10);
    drawText(String(qty), 370, y, 10);
    drawText(clp(price), 420, y, 10);
    drawText(clp(lineTotal), 500, y, 10);
    y -= 14;
  }

  y -= 10;

  const subtotal = itemsSubtotal + (estimate.laborCost ?? 0) - (estimate.discount ?? 0);
  const iva = Math.round(subtotal * ((estimate.taxRate ?? 19) / 100));
  const total = subtotal + iva;

  // Totales
  newPageIfNeeded(160);
  const rightX = 420;

  drawText("Subtotal:", rightX, y, 11, true);
  drawText(clp(itemsSubtotal), 500, y, 11);
  y -= 14;

  drawText("Mano de obra:", rightX, y, 10, true);
  drawText(clp(estimate.laborCost ?? 0), 500, y, 10);
  y -= 14;

  drawText("Descuento:", rightX, y, 10, true);
  drawText(`- ${clp(estimate.discount ?? 0)}`, 500, y, 10);
  y -= 14;

  drawText("Neto:", rightX, y, 11, true);
  drawText(clp(subtotal), 500, y, 11);
  y -= 14;

  drawText(`IVA (${estimate.taxRate ?? 19}%):`, rightX, y, 10, true);
  drawText(clp(iva), 500, y, 10);
  y -= 18;

  drawText("TOTAL:", rightX, y, 14, true);
  drawText(clp(total), 500, y, 14, true);
  y -= 18;

  // Notas
  if (estimate.notes) {
    newPageIfNeeded(120);
    y -= 6;
    drawText("Notas:", margin, y, 11, true);
    y -= 14;

    const notes = String(estimate.notes);
    const chunks = wrapText(notes, 85);
    for (const line of chunks) {
      newPageIfNeeded(80);
      drawText(line, margin, y, 10);
      y -= 12;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

function wrapText(text, maxLen) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const next = (line + " " + w).trim();
    if (next.length > maxLen) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}
