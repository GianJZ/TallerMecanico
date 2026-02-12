export function Badge({ children, tone = "gray" }) {
  const cls = {
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    green: "bg-green-100 text-green-800",
    gray: "bg-slate-100 text-slate-800",
    blue: "bg-blue-100 text-blue-800"
  }[tone] ?? "bg-slate-100 text-slate-800";

  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>;
}
