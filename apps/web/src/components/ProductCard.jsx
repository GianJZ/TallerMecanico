import { useRef, useState } from "react";
import { api } from "../api/client";
import { Badge } from "./Badge";

export function ProductCard({
  p,
  tone = "gray",
  low = false,
  onUpdated,
  onDeleted,
  onMsg,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const [qty, setQty] = useState(1);
  const [busyIn, setBusyIn] = useState(false);
  const [busyOut, setBusyOut] = useState(false);
  const [busyDel, setBusyDel] = useState(false);

  const imgSrc = p.imageUrl
  ? `http://localhost:3001${p.imageUrl}`
  : "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
        <rect width='100%' height='100%' fill='#f1f5f9'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
          fill='#64748b' font-family='Arial' font-size='28'>
          Sin imagen
        </text>
      </svg>
    `);


  /* =========================
     SUBIR / CAMBIAR IMAGEN
  ========================= */
  async function uploadImage(file) {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);

      const { data } = await api.post(`/products/${p.id}/image`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUpdated?.(data);
      onMsg?.("Imagen actualizada ✅");
    } catch (e) {
      onMsg?.(`Error imagen: ${e?.response?.data?.message ?? "No se pudo subir"}`);
    } finally {
      setUploading(false);
    }
  }

  /* =========================
     AGREGAR STOCK (IN)
  ========================= */
  async function addStock() {
    const q = Math.max(1, Number(qty) || 1);
    setBusyIn(true);
    try {
      const { data } = await api.post("/movements", {
        productId: p.id,
        type: "IN",
        quantity: q,
        note: "Ingreso manual",
      });

      onUpdated?.(data.product);
      onMsg?.(`Stock agregado: ${p.name} (+${q}) ✅`);
    } catch (e) {
      onMsg?.(`Error ingreso: ${e?.response?.data?.message ?? "No se pudo agregar stock"}`);
    } finally {
      setBusyIn(false);
    }
  }

  /* =========================
     DESCONTAR STOCK (OUT)
  ========================= */
  async function removeStock() {
    const q = Math.max(1, Number(qty) || 1);
    setBusyOut(true);
    try {
      const { data } = await api.post("/movements", {
        productId: p.id,
        type: "OUT",
        quantity: q,
        note: "Salida manual",
      });

      onUpdated?.(data.product);
      onMsg?.(`Salida registrada: ${p.name} (-${q}) ✅`);
    } catch (e) {
      onMsg?.(`Error salida: ${e?.response?.data?.message ?? "No se pudo descontar stock"}`);
    } finally {
      setBusyOut(false);
    }
  }

  /* =========================
     ELIMINAR PRODUCTO
  ========================= */
  async function deleteProduct() {
    const ok = confirm(`¿Eliminar "${p.name}" del inventario?`);
    if (!ok) return;

    setBusyDel(true);
    try {
      await api.delete(`/products/${p.id}`);
      onDeleted?.(p.id);
      onMsg?.("Producto eliminado ✅");
    } catch (e) {
      onMsg?.(`Error eliminar: ${e?.response?.data?.message ?? "No se pudo eliminar"}`);
    } finally {
      setBusyDel(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Imagen */}
      <div className="aspect-[3/2] bg-slate-100 relative">
        <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" />
        {low && (
          <div className="absolute top-2 left-2 text-xs bg-red-600 text-white px-2 py-1 rounded-full">
            Stock bajo
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge tone={tone}>{p.usageCount ?? 0}</Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 grid gap-2">
        <div>
          <div className="font-semibold">{p.name}</div>
          <div className="text-sm text-slate-600 font-mono">{p.barcode ?? "-"}</div>
          <div className="flex justify-between text-sm mt-1">
            <div>
              Stock: <b className={low ? "text-red-700" : ""}>{p.stock ?? 0}</b> / mín{" "}
              <span className="text-slate-500">{p.minStock ?? 0}</span>
            </div>
            <div className="font-semibold">
              ${(p.salePrice ?? 0).toLocaleString("es-CL")}
            </div>
          </div>
        </div>

        {/* Imagen */}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => uploadImage(e.target.files?.[0])}
        />

        <button
          className="rounded-xl border border-slate-300 px-3 py-2 hover:bg-slate-50 disabled:opacity-50"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Subiendo..." : p.imageUrl ? "Cambiar imagen" : "Agregar imagen"}
        </button>

        {/* Cantidad */}
        <input
          type="number"
          min={1}
          className="rounded-xl border border-slate-300 px-3 py-2"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />

        {/* Botones IN / OUT */}
        <div className="grid grid-cols-2 gap-2">
          <button
            className="rounded-xl bg-green-600 text-white px-3 py-2 hover:bg-green-700 disabled:opacity-50"
            disabled={busyIn}
            onClick={addStock}
          >
            {busyIn ? "Agregando..." : "➕ Agregar"}
          </button>

          <button
            className="rounded-xl bg-slate-900 text-white px-3 py-2 hover:bg-slate-800 disabled:opacity-50"
            disabled={busyOut}
            onClick={removeStock}
          >
            {busyOut ? "Descontando..." : "➖ Descontar"}
          </button>
        </div>

        {/* Eliminar */}
        <button
          className="rounded-xl border border-red-300 text-red-700 px-3 py-2 hover:bg-red-50 disabled:opacity-50"
          disabled={busyDel}
          onClick={deleteProduct}
        >
          {busyDel ? "Eliminando..." : "Eliminar producto"}
        </button>
      </div>
    </div>
  );
}
