import { useState } from "react";
import { Fish, LogIn } from "lucide-react";
import { adminApi, setAdminToken, STORE_NAME } from "@/api/client";

export function AdminLoginPage({ onLogin }: { onLogin: () => void }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const { data } = await adminApi.post("/auth/login", { correo, password });
      setAdminToken(data.access_token);
      localStorage.setItem("admin_token", data.access_token);
      onLogin();
    } catch { setError("Credenciales incorrectas"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand/40 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ocean text-white"><Fish size={24} /></div>
          <h1 className="font-display text-xl font-bold text-ink">{STORE_NAME}</h1>
          <p className="text-sm text-ink-faint">Panel de administración</p>
        </div>
        {error && <div className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-center text-sm text-danger">{error}</div>}
        <div className="flex flex-col gap-4">
          <div><label className="mb-1 block text-sm font-medium text-ink-soft">Correo</label>
            <input type="email" required value={correo} onChange={e => setCorreo(e.target.value)} placeholder="admin@sistema.com"
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20" /></div>
          <div><label className="mb-1 block text-sm font-medium text-ink-soft">Contraseña</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20" /></div>
          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-ocean py-3 font-display text-sm font-bold text-white transition-all hover:bg-ocean-light disabled:opacity-60">
            <LogIn size={16} />{loading ? "Ingresando…" : "Ingresar"}
          </button>
        </div>
      </form>
    </div>
  );
}
