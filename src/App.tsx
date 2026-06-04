import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CatalogoPage } from "@/pages/CatalogoPage";
import { AdminLoginPage } from "@/pages/AdminLoginPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { AdminProductosPage } from "@/pages/AdminProductosPage";
import { AdminBannersPage } from "@/pages/AdminBannersPage";
import { setAdminToken } from "@/api/client";

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
        <Route path="/admin" element={
          isAdmin
            ? <AdminDashboardPage onLogout={() => setIsAdmin(false)} />
            : <AdminLoginPage onLogin={() => setIsAdmin(true)} />
        } />
        <Route path="/admin/productos" element={isAdmin ? <AdminProductosPage /> : <Navigate to="/admin" replace />} />
        <Route path="/admin/banners" element={isAdmin ? <AdminBannersPage /> : <Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
