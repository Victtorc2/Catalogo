import axios from "axios";

const BASE =
  (
    import.meta.env.VITE_API_URL ||
    "https://web-production-1e1c3.up.railway.app"
  ).replace(/\/$/, "");
  
export const catalogoApi = axios.create({
  baseURL: BASE,
  headers: { "X-API-Key": import.meta.env.VITE_CATALOG_API_KEY || "" },
});

export const adminApi = axios.create({ baseURL: BASE });

export function setAdminToken(token: string | null) {
  if (token) {
    adminApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete adminApi.defaults.headers.common["Authorization"];
  }
}

export function getError(err: unknown, fallback = "Error"): string {
  if (axios.isAxiosError(err)) return err.response?.data?.detail || err.message || fallback;
  return err instanceof Error ? err.message : fallback;
}

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "51991180718";
export const STORE_NAME = import.meta.env.VITE_STORE_NAME || "Fishing and More - Nasca";
export const TIKTOK_URL = import.meta.env.VITE_TIKTOK_URL || "";
export const FACEBOOK_URL = import.meta.env.VITE_FACEBOOK_URL || "";
// Logo: coloca tu archivo en public/logo.png (o cambia la ruta aquí).
export const LOGO_URL = "/logo.png";
export const UPLOADS_BASE = `${BASE}/uploads`;
