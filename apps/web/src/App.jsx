import { useState } from "react";
import { Inventory } from "./pages/Inventory";
import { Alerts } from "./pages/Alerts";
import { Reports } from "./pages/Reports";
import { EstimateNew } from "./pages/EstimateNew";
import { EstimateHistory } from "./pages/EstimateHistory";
import logo from "./assets/logo.png";
import homero from "./assets/homero.gif";


const tabs = [
  { id: "inventory", label: "Inventario" },
  { id: "alerts", label: "Alertas" },
  { id: "estimateNew", label: "Crear Presupuesto" },
  { id: "estimateHistory", label: "Historial Presupuestos" },
  { id: "reports", label: "Reportes" },
];

export default function App() {
  const [tab, setTab] = useState("inventory");

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
          {/* Logo + título */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10 w-10 rounded-xl object-contain" />
            <div>
              <div className="text-lg font-bold">Taller Inventario</div>
              <div className="text-sm text-slate-600">
                Local-first • Barcode • Presupuestos PDF
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-2 flex-wrap justify-end">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-xl px-3 py-2 text-sm border ${
                  tab === t.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white border-slate-300 hover:bg-slate-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === "inventory" && <Inventory />}
        {tab === "alerts" && <Alerts />}
        {tab === "estimateNew" && <EstimateNew />}
        {tab === "estimateHistory" && <EstimateHistory />}
        {tab === "reports" && <Reports />}
      </main>

      <footer className="py-6 text-center text-sm text-slate-500">
        <center><img src={homero} alt="Homero"/></center>
        Hecho para el taller de mi compare: escanea, descuenta stock y saca PDF de una pa.
      </footer>
    </div>
  );
}
