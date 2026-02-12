import { useEffect, useState } from "react";
import { api } from "../api/client";
import { EstimateBuilder } from "../components/EstimateBuilder";

const KEY = "last_estimate_summary_v1";
const DAY_MS = 24 * 60 * 60 * 1000;

export function EstimateNew() {
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");
  const [last, setLast] = useState(null);

  async function loadProducts() {
    const { data } = await api.get("/products");
    setProducts(data.filter((x) => x.isActive));
  }

  useEffect(() => {
    loadProducts();

    // cargar resumen guardado y borrar si tiene +24h
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (!obj?.createdAt || Date.now() - obj.createdAt > DAY_MS) {
        localStorage.removeItem(KEY);
        return;
      }
      setLast(obj);
    } catch {
      localStorage.removeItem(KEY);
    }
  }, []);

  async function createEstimate(payload) {
    try {
      const { data } = await api.post("/estimates", payload);
      setMsg(`Presupuesto creado (#${data.folio}) ✅`);

      const summary = {
        id: data.id,
        folio: data.folio,
        createdAt: Date.now(),
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        vehicleName: data.vehicleName,
        vehicleYear: data.vehicleYear ?? null,
        total: data.total ?? null, // si tu API no devuelve total, lo omitimos
      };

      setLast(summary);
      localStorage.setItem(KEY, JSON.stringify(summary));
    } catch (e) {
      setMsg(`Error: ${e?.response?.data?.message ?? "No se pudo crear presupuesto"}`);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="font-semibold mb-3">Crear presupuesto</div>
        <EstimateBuilder products={products} onCreate={createEstimate} />
        {msg && <div className="mt-2 text-sm text-slate-700">{msg}</div>}
      </div>

      {/* Resumen SOLO para el último, y dura máximo 1 día */}
      {last && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="font-semibold mb-2">Resumen último presupuesto (válido 24h)</div>
          <div className="text-sm text-slate-700 grid gap-1">
            <div><b>Folio:</b> #{last.folio}</div>
            <div><b>Cliente:</b> {last.customerName} — {last.customerPhone}</div>
            <div><b>Vehículo:</b> {last.vehicleName}{last.vehicleYear ? ` (${last.vehicleYear})` : ""}</div>
          </div>

          <div className="mt-3 flex gap-2">
            <a
              className="rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800"
              href={`http://localhost:3001/estimates/${last.id}/pdf`}
            >
              Descargar PDF
            </a>

            <button
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 hover:bg-slate-100"
              onClick={() => {
                setLast(null);
                localStorage.removeItem(KEY);
              }}
            >
              Limpiar resumen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
