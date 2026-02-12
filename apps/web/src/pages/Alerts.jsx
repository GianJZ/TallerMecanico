import { useEffect, useState } from "react";
import { api } from "../api/client";

export function Alerts() {
  const [low, setLow] = useState([]);

  async function load() {
    const { data } = await api.get("/alerts/low-stock");
    setLow(data);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="font-semibold mb-3">Alertas por stock mínimo</div>
      {low.length === 0 ? (
        <div className="text-slate-600">No hay productos en stock mínimo ✅</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-600">
              <tr>
                <th className="text-left py-2">Producto</th>
                <th className="text-right">Stock</th>
                <th className="text-right">Mín</th>
              </tr>
            </thead>
            <tbody>
              {low.map(p => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-2 font-medium">{p.name}</td>
                  <td className="text-right text-red-700 font-semibold">{p.stock ?? 0}</td>
                  <td className="text-right">{p.minStock ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button className="mt-3 rounded-xl border border-slate-300 bg-white px-3 py-2 hover:bg-slate-100" onClick={load}>
        Actualizar
      </button>
    </div>
  );
}
