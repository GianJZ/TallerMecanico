import { useState } from "react";
import { api } from "../api/client";

export function Reports() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [rows, setRows] = useState([]);

  async function load() {
    const { data } = await api.get("/reports/monthly", { params: { year, month } });
    setRows(data.rows);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="font-semibold mb-3">Reporte mensual (salidas/ventas)</div>

      <div className="flex gap-2 items-end">
        <div>
          <label className="text-sm text-slate-700">Año</label>
          <input type="number" className="w-32 rounded-xl border border-slate-300 px-3 py-2" value={year} onChange={e=>setYear(Number(e.target.value)||year)} />
        </div>
        <div>
          <label className="text-sm text-slate-700">Mes</label>
          <input type="number" className="w-24 rounded-xl border border-slate-300 px-3 py-2" value={month} min={1} max={12} onChange={e=>setMonth(Number(e.target.value)||month)} />
        </div>
        <button className="rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800" onClick={load}>
          Generar
        </button>
      </div>

      <div className="overflow-auto mt-4">
        <table className="min-w-full text-sm">
          <thead className="text-slate-600">
            <tr>
              <th className="text-left py-2">Producto</th>
              <th className="text-right">Cantidad</th>
              <th className="text-right">Ingresos (CLP)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.productId} className="border-t border-slate-100">
                <td className="py-2">{r.name}</td>
                <td className="text-right">{r.quantity}</td>
                <td className="text-right">{r.revenue.toLocaleString("es-CL")}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="py-6 text-slate-600" colSpan={3}>Sin datos (genera un mes con movimientos OUT).</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
