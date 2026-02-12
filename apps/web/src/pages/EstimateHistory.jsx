import { useEffect, useState } from "react";
import { api } from "../api/client";

export function EstimateHistory() {
  const [estimates, setEstimates] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const { data } = await api.get("/estimates");
    setEstimates(data);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="font-semibold mb-3">Historial de presupuestos</div>
      {msg && <div className="mb-2 text-sm text-slate-700">{msg}</div>}

      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-600">
            <tr>
              <th className="text-left py-2">Folio</th>
              <th className="text-left">Cliente</th>
              <th className="text-left">Vehículo</th>
              <th className="text-right">PDF</th>
            </tr>
          </thead>
          <tbody>
            {estimates.map((est) => (
              <tr key={est.id} className="border-t border-slate-100">
                <td className="py-2 font-semibold">#{est.folio}</td>
                <td>{est.customerName}</td>
                <td>
                  {est.vehicleName}
                  {est.vehicleYear ? ` (${est.vehicleYear})` : ""}
                </td>
                <td className="text-right">
                  <a
                    className="text-slate-900 underline"
                    href={`http://localhost:3001/estimates/${est.id}/pdf`}
                  >
                    Descargar PDF
                  </a>
                </td>
              </tr>
            ))}

            {estimates.length === 0 && (
              <tr>
                <td className="py-6 text-slate-600" colSpan={4}>
                  Aún no hay presupuestos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
