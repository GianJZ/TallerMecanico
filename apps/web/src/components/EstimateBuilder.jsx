import { useState } from "react";

export function EstimateBuilder({ products, onCreate }) {
  // Datos manuales cliente/vehículo
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");

  const [notes, setNotes] = useState("");
  const [laborCost, setLaborCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState([]);

  function addItem(productId) {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setItems((prev) => [
      ...prev,
      { productId, name: p.name, quantity: 1, unitPrice: p.salePrice ?? 0 },
    ]);
  }

  function updateItem(idx, patch) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  const canCreate =
    customerName.trim().length >= 3 &&
    customerPhone.trim().length >= 6 &&
    vehicleName.trim().length >= 2 &&
    items.length > 0;

  return (
    <div className="grid gap-3">
      {/* Datos manuales */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 grid gap-3">
        <div className="font-semibold">Datos del cliente</div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-sm text-slate-700">Nombre completo</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej: Juan Pérez Soto"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Teléfono</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Ej: +56 9 1234 5678"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Correo (opcional)</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Ej: cliente@correo.cl"
            />
          </div>
        </div>

        <div className="font-semibold mt-2">Datos del vehículo</div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-slate-700">Vehículo</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
              placeholder="Ej: Toyota Yaris / Hyundai Accent"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Año (opcional)</label>
            <input
              type="number"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={vehicleYear}
              onChange={(e) => setVehicleYear(e.target.value)}
              placeholder="Ej: 2018"
              min={1900}
              max={2100}
            />
          </div>
        </div>
      </div>

      {/* Mano de obra / descuento / agregar producto */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm text-slate-700">Mano de obra</label>
          <input
            type="number"
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            value={laborCost}
            onChange={(e) => setLaborCost(Number(e.target.value) || 0)}
            min={0}
          />
        </div>
        <div>
          <label className="text-sm text-slate-700">Descuento</label>
          <input
            type="number"
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value) || 0)}
            min={0}
          />
        </div>
        <div>
          <label className="text-sm text-slate-700">Agregar producto</label>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            onChange={(e) => {
              if (e.target.value) addItem(e.target.value);
              e.target.value = "";
            }}
          >
            <option value="">-- Selecciona --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="text-sm text-slate-700">Notas</label>
        <textarea
          className="w-full rounded-xl border border-slate-300 px-3 py-2"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Ítems */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="p-3 border-b border-slate-200 font-semibold">Ítems</div>
        <div className="p-3 grid gap-2">
          {items.length === 0 && (
            <div className="text-slate-500">Agrega productos para armar el presupuesto.</div>
          )}

          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-6">{it.name}</div>

              <input
                className="col-span-2 rounded-xl border border-slate-300 px-2 py-1"
                type="number"
                value={it.quantity}
                min={1}
                onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) || 1 })}
              />

              <input
                className="col-span-3 rounded-xl border border-slate-300 px-2 py-1"
                type="number"
                value={it.unitPrice}
                min={0}
                onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) || 0 })}
              />

              <button
                type="button"
                className="col-span-1 text-slate-600 hover:text-red-600"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Crear */}
      <div className="flex justify-end">
        <button
          className="rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 disabled:opacity-50"
          disabled={!canCreate}
          onClick={() =>
            onCreate({
              customerName: customerName.trim(),
              customerPhone: customerPhone.trim(),
              customerEmail: customerEmail.trim() || null,
              vehicleName: vehicleName.trim(),
              vehicleYear: vehicleYear ? Number(vehicleYear) : null,

              notes: notes || null,
              laborCost,
              discount,
              taxRate: 19,
              items: items.map((it) => ({
                productId: it.productId,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
              })),
            })
          }
        >
          Crear presupuesto
        </button>
      </div>
    </div>
  );
}
