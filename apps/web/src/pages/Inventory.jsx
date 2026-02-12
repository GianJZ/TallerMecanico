import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { BarcodeInput } from "../components/BarcodeInput";
import { ProductForm } from "../components/ProductForm";
import { Badge } from "../components/Badge";
import { ProductCard } from "../components/ProductCard";

function usageTone(products, p) {
  const active = products.filter((x) => x.isActive);
  const sorted = [...active].sort(
    (a, b) => (b.usageCount || 0) - (a.usageCount || 0)
  );
  const idx = sorted.findIndex((x) => x.id === p.id);
  if (idx < 0 || sorted.length < 5) return "gray";
  const frac = (idx + 1) / sorted.length;
  if (frac <= 0.2) return "red";
  if (frac <= 0.8) return "yellow";
  return "green";
}

export function Inventory() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [view, setView] = useState("cards"); // "cards" | "table"
  const [showCreate, setShowCreate] = useState(false); // ✅ toggle crear producto

  async function load() {
    const { data } = await api.get("/products", { params: q ? { q } : {} });
    setProducts(data);
  }

  useEffect(() => {
    load();
  }, []);

  const shown = useMemo(() => {
    return products
      .filter((p) => p.isActive)
      .filter((p) => {
        if (!onlyLowStock) return true;
        return (p.stock ?? 0) <= (p.minStock ?? 0);
      });
  }, [products, onlyLowStock]);

  async function addProduct(payload) {
    try {
      await api.post("/products", payload);
      setMsg("Producto creado ✅");
      setShowCreate(false); // ✅ cerrar panel al crear
      await load();
    } catch (e) {
      setMsg(`Error: ${e?.response?.data?.message ?? "No se pudo crear producto"}`);
    }
  }

  async function scanOut(barcode) {
    try {
      const { data } = await api.post("/movements", {
        barcode,
        type: "OUT",
        quantity: 1,
        note: "Salida por escaneo",
      });
      setMsg(`Salida registrada: ${data.product.name} (-1) ✅`);
      await load();
    } catch (e) {
      setMsg(`Error: ${e?.response?.data?.message ?? "No se pudo registrar salida"}`);
    }
  }

  // ✅ Actualiza solo 1 producto (ej: cambiar imagen / stock desde card)
  function handleProductUpdated(updated) {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  return (
    <div className="grid gap-6">
      {/* Escaneo */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="font-semibold mb-3">Escaneo rápido (Salida)</div>
        <BarcodeInput onScan={scanOut} />
        {msg && <div className="mt-2 text-sm text-slate-700">{msg}</div>}
      </div>

      {/* Inventario + botón crear */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="font-semibold">Inventario</div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex gap-2">
              <input
                className="rounded-xl border border-slate-300 px-3 py-2 w-full md:w-72"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nombre o barcode..."
              />
              <button
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 hover:bg-slate-100"
                onClick={load}
              >
                Buscar
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={onlyLowStock}
                onChange={(e) => setOnlyLowStock(e.target.checked)}
              />
              Solo stock bajo
            </label>

            <div className="flex gap-2">
              <button
                className={`rounded-xl px-3 py-2 border ${
                  view === "cards"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white border-slate-300 hover:bg-slate-100"
                }`}
                onClick={() => setView("cards")}
              >
                Cards
              </button>
              <button
                className={`rounded-xl px-3 py-2 border ${
                  view === "table"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white border-slate-300 hover:bg-slate-100"
                }`}
                onClick={() => setView("table")}
              >
                Tabla
              </button>

              {/* ✅ Botón desplegar crear producto */}
              <button
                className={`rounded-xl px-3 py-2 border ${
                  showCreate
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white border-slate-300 hover:bg-slate-100"
                }`}
                onClick={() => setShowCreate((v) => !v)}
              >
                {showCreate ? "Cerrar" : "+ Producto"}
              </button>
            </div>
          </div>
        </div>

        {/* Panel desplegable Crear Producto */}
        {showCreate && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="font-semibold mb-3">Crear producto</div>
            <ProductForm onSubmit={addProduct} />
          </div>
        )}

        {/* Vista Cards */}
        {view === "cards" && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {shown.map((p) => {
              const tone = usageTone(shown, p);
              const low = (p.stock ?? 0) <= (p.minStock ?? 0);
              return (
                <ProductCard
                  key={p.id}
                  p={p}
                  tone={tone}
                  low={low}
                  onUpdated={handleProductUpdated}
                  onMsg={setMsg}
                />
              );
            })}

            {shown.length === 0 && (
              <div className="text-slate-600">No hay productos con ese filtro.</div>
            )}
          </div>
        )}

        {/* Vista Tabla */}
        {view === "table" && (
          <div className="mt-4 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr>
                  <th className="text-left py-2">Producto</th>
                  <th className="text-left">Barcode</th>
                  <th className="text-right">Stock</th>
                  <th className="text-right">Mín</th>
                  <th className="text-right">Uso</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => {
                  const tone = usageTone(shown, p);
                  const low = (p.stock ?? 0) <= (p.minStock ?? 0);
                  return (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="py-2">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-slate-500">
                          {p.category ?? ""} {p.brand ? `• ${p.brand}` : ""}
                        </div>
                      </td>
                      <td className="text-slate-700">{p.barcode ?? "-"}</td>
                      <td className={`text-right font-semibold ${low ? "text-red-700" : ""}`}>
                        {p.stock ?? 0}
                      </td>
                      <td className="text-right text-slate-700">{p.minStock ?? 0}</td>
                      <td className="text-right">
                        <Badge tone={tone}>{p.usageCount ?? 0}</Badge>
                      </td>
                    </tr>
                  );
                })}

                {shown.length === 0 && (
                  <tr>
                    <td className="py-6 text-slate-600" colSpan={5}>
                      No hay productos con ese filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
