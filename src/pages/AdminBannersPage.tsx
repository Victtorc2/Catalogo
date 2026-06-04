import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { adminApi, getError, UPLOADS_BASE } from "@/api/client";
import type { Banner } from "@/types/banner";

export function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [creating, setCreating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [titulo, setTitulo] = useState("Promoción");

  const load = useCallback(async () => { setLoading(true); try { setBanners((await adminApi.get<Banner[]>("/banners")).data); } catch (e) { setMsg({ text: getError(e), ok: false }); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);

  const create = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setMsg({ text: "Selecciona una imagen", ok: false }); return; }
    setCreating(true);
    const form = new FormData(); form.append("file", file); form.append("titulo", titulo); form.append("orden", String(banners.length));
    try { await adminApi.post("/banners", form); setMsg({ text: "Banner creado", ok: true }); setTitulo("Promoción"); if (fileRef.current) fileRef.current.value = ""; await load(); }
    catch (e) { setMsg({ text: getError(e), ok: false }); } finally { setCreating(false); }
  };

  const toggle = async (b: Banner) => { try { await adminApi.put(`/banners/${b.id}`, { is_active: !b.is_active }); await load(); } catch (e) { setMsg({ text: getError(e), ok: false }); } };
  const del = async (id: number) => { if (!confirm("¿Eliminar?")) return; try { await adminApi.delete(`/banners/${id}`); setMsg({ text: "Eliminado", ok: true }); await load(); } catch (e) { setMsg({ text: getError(e), ok: false }); } };

  return (
    <div className="min-h-screen bg-sand/40">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/admin" className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-ink-soft hover:bg-sand"><ArrowLeft size={18} /></Link>
          <div><h1 className="font-display text-xl font-bold text-ink">Promociones</h1><p className="text-sm text-ink-faint">Imágenes que se muestran en el catálogo</p></div>
        </div>
        {msg && <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${msg.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>{msg.text}</div>}

        <div className="mb-6 rounded-2xl border border-line bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">Nuevo banner</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1"><label className="mb-1 block text-xs text-ink-faint">Título</label>
              <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej. Oferta de verano"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-ocean focus:outline-none" /></div>
            <div className="flex-1"><label className="mb-1 block text-xs text-ink-faint">Imagen</label>
              <input ref={fileRef} type="file" accept="image/*" className="w-full text-sm text-ink-soft file:mr-2 file:rounded-lg file:border-0 file:bg-ocean/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ocean" /></div>
            <button type="button" onClick={create} disabled={creating}
              className="flex items-center gap-2 rounded-lg bg-ocean px-4 py-2.5 text-sm font-semibold text-white hover:bg-ocean-light disabled:opacity-60"><Plus size={16} />{creating ? "Subiendo…" : "Crear"}</button>
          </div>
        </div>

        {loading ? <p className="py-20 text-center text-ink-faint">Cargando…</p> : !banners.length ? <p className="py-10 text-center text-sm text-ink-faint">No hay banners.</p> : (
          <div className="grid gap-3">
            {banners.map(b => (
              <div key={b.id} className={`flex items-center gap-4 rounded-xl border border-line bg-white p-3 ${!b.is_active ? "opacity-50" : ""}`}>
                <img src={`${UPLOADS_BASE}/${b.imagen_url}`} alt={b.titulo} className="h-16 w-28 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1"><p className="truncate font-medium text-ink">{b.titulo}</p><p className="text-xs text-ink-faint">Orden: {b.orden} · {b.is_active ? "Activo" : "Inactivo"}</p></div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => toggle(b)} title={b.is_active ? "Desactivar" : "Activar"}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-soft hover:bg-sand">{b.is_active ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  <button type="button" onClick={() => del(b.id)} title="Eliminar"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-soft hover:bg-danger/5 hover:text-danger"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
