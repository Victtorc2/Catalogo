import { Link, useNavigate } from "react-router-dom";
import { Package, Image, ExternalLink, LogOut, Fish } from "lucide-react";
import { setAdminToken, STORE_NAME } from "@/api/client";

export function AdminDashboardPage({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const logout = () => { setAdminToken(null); localStorage.removeItem("admin_token"); onLogout(); navigate("/admin"); };

  return (
    <div className="min-h-screen bg-sand/40">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ocean text-white"><Fish size={22} /></div>
            <div><h1 className="font-display text-xl font-bold text-ink">Admin · {STORE_NAME}</h1><p className="text-sm text-ink-faint">Gestión del catálogo</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-ink-soft hover:bg-sand"><ExternalLink size={14} />Ver catálogo</Link>
            <button type="button" onClick={logout} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-ink-soft hover:bg-danger/5 hover:text-danger"><LogOut size={14} />Salir</button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { to: "/admin/productos", icon: Package, title: "Productos", desc: "Gestiona imágenes y visibilidad del catálogo.", color: "bg-ocean/10 text-ocean" },
            { to: "/admin/banners", icon: Image, title: "Promociones", desc: "Sube banners de ofertas para el catálogo.", color: "bg-coral/10 text-coral" },
          ].map(c => (
            <Link key={c.to} to={c.to} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.color}`}><c.icon size={22} /></div>
              <div><h2 className="font-display text-lg font-bold text-ink">{c.title}</h2><p className="mt-1 text-sm text-ink-faint">{c.desc}</p></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
