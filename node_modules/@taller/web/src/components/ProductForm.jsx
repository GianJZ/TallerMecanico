import { useState } from "react";

export function ProductForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    barcode: "",
    sku: "",
    category: "",
    brand: "",
    location: "",
    unit: "unidad",
    salePrice: 0,
    costPrice: 0,
    stock: 0,
    minStock: 0
  });

  function set(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  return (
    <form
      className="grid grid-cols-2 gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...form,
          salePrice: Number(form.salePrice) || 0,
          costPrice: Number(form.costPrice) || 0,
          stock: Number(form.stock) || 0,
          minStock: Number(form.minStock) || 0,
          barcode: form.barcode?.trim() || null,
          sku: form.sku?.trim() || null
        });
        setForm({ ...form, name: "", barcode: "", sku: "" });
      }}
    >
      <div className="col-span-2">
        <label className="text-sm text-slate-700">Nombre</label>
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2" value={form.name} onChange={e=>set("name", e.target.value)} required />
      </div>

      <div>
        <label className="text-sm text-slate-700">Código de barras</label>
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2" value={form.barcode} onChange={e=>set("barcode", e.target.value)} />
      </div>

      <div>
        <label className="text-sm text-slate-700">SKU</label>
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2" value={form.sku} onChange={e=>set("sku", e.target.value)} />
      </div>

      <div>
        <label className="text-sm text-slate-700">Categoría</label>
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2" value={form.category} onChange={e=>set("category", e.target.value)} />
      </div>

      <div>
        <label className="text-sm text-slate-700">Marca</label>
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2" value={form.brand} onChange={e=>set("brand", e.target.value)} />
      </div>

      <div>
        <label className="text-sm text-slate-700">Ubicación</label>
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2" value={form.location} onChange={e=>set("location", e.target.value)} />
      </div>

      <div>
        <label className="text-sm text-slate-700">Unidad</label>
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2" value={form.unit} onChange={e=>set("unit", e.target.value)} />
      </div>

      <div>
        <label className="text-sm text-slate-700">Precio venta (CLP)</label>
        <input type="number" className="w-full rounded-xl border border-slate-300 px-3 py-2" value={form.salePrice} onChange={e=>set("salePrice", e.target.value)} />
      </div>

      <div>
        <label className="text-sm text-slate-700">Costo (CLP)</label>
        <input type="number" className="w-full rounded-xl border border-slate-300 px-3 py-2" value={form.costPrice} onChange={e=>set("costPrice", e.target.value)} />
      </div>

      <div>
        <label className="text-sm text-slate-700">Stock inicial</label>
        <input type="number" className="w-full rounded-xl border border-slate-300 px-3 py-2" value={form.stock} onChange={e=>set("stock", e.target.value)} />
      </div>

      <div>
        <label className="text-sm text-slate-700">Stock mínimo</label>
        <input type="number" className="w-full rounded-xl border border-slate-300 px-3 py-2" value={form.minStock} onChange={e=>set("minStock", e.target.value)} />
      </div>

      <div className="col-span-2 flex justify-end">
        <button className="rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800">Agregar</button>
      </div>
    </form>
  );
}
