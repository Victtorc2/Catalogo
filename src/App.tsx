import { lazy, Suspense, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CatalogoPage } from "@/pages/CatalogoPage";
import { setAdminToken } from "@/api/client";

// El panel admin se carga bajo demanda (code-splitting): así no viaja en el
// bundle del catálogo público, que es lo que cargan los clientes.
const AdminLoginPage = lazy(() =>
  import("@/pages/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage })),
);
const AdminDashboardPage = lazy(() =>
  import("@/pages/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminProductosPage = lazy(() =>
  import("@/pages/AdminProductosPage").then((m) => ({ default: m.AdminProductosPage })),
);
const AdminBannersPage = lazy(() =>
  import("@/pages/AdminBannersPage").then((m) => ({ default: m.AdminBannersPage })),
);

/** Indicador de carga mientras se descarga el chunk del admin. */
function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-abyss text-ice-faint">
      <span className="animate-pulse text-sm">Cargando…</span>
    </div>
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => {
    const token = localStorage.getItem("admin_token");
    if (token) { setAdminToken(token); return true; }
    return false;
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CatalogoPage />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminFallback />}>
              {isAdmin ? (
                <AdminDashboardPage onLogout={() => setIsAdmin(false)} />
              ) : (
                <AdminLoginPage onLogin={() => setIsAdmin(true)} />
              )}
            </Suspense>
          }
        />
        <Route
          path="/admin/productos"
          element={
            isAdmin ? (
              <Suspense fallback={<AdminFallback />}>
                <AdminProductosPage />
              </Suspense>
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
        <Route
          path="/admin/banners"
          element={
            isAdmin ? (
              <Suspense fallback={<AdminFallback />}>
                <AdminBannersPage />
              </Suspense>
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
