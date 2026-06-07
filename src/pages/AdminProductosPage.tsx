import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Image, Trash2, ArrowLeft, Star, Search, FileText, X } from "lucide-react";
import { Link } from "react-router-dom";
import { adminApi, getError, UPLOADS_BASE } from "@/api/client";
import type { Paginated } from "@/types/producto";

interface Producto {
  id: number; codigo: string; nombre: string; marca: string;
  modelo: string | null;
  precio_venta: string | number; stock: number; estado: string;
  imagen_url: string | null; destacado: boolean;
  descripcion: string | null; ficha_tecnica: string | null;
}

interface Categoria { id: number; nombre: string; }

const PAGE_SIZE = 10;

export function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [q, setQ] = useState("");
  const [soloDestacados, setSoloDestacados] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);

  // Filtro encadenado categoría → marca y paginación (lado servidor).
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [marcaFilter, setMarcaFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [destacadosCount, setDestacadosCount] = useState(0);

  // Categorías para el primer nivel del filtro (una sola vez).
  useEffect(() => {
    adminApi.get<Categoria[]>("/categorias").then((r) => setCategorias(r.data)).catch(() => {});
  }, []);

  // Marcas del segundo nivel: se acotan a la categoría elegida.
  useEffect(() => {
    adminApi
      .get<string[]>("/productos/marcas", { params: { categoria: catFilter ?? undefined } })
      .then((r) => setMarcas(r.data))
      .catch(() => setMarcas([]));
  }, [catFilter]);

  // Conteo total de destacados para el badge del botón.
  const refreshDestacadosCount = useCallback(() => {
    adminApi
      .get<Paginated<Producto>>("/productos", { params: { destacado: true, page_size: 1 } })
      .then((r) => setDestacadosCount(r.data.total))
      .catch(() => {});
  }, []);
  useEffect(() => { refreshDestacadosCount(); }, [refreshDestacadosCount]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.get<Paginated<Producto>>("/productos", {
        params: {
          search: q.trim() || undefined,
          categoria: catFilter ?? undefined,
          marca: marcaFilter ?? undefined,
          destacado: soloDestacados ? true : undefined,
          page,
          page_size: PAGE_SIZE,
        },
      });
      setProductos(r.data.items);
      setTotal(r.data.total);
      setTotalPages(Math.max(1, r.data.total_pages));
    } catch (e) { setMsg({ text: getError(e), ok: false }); }
    finally { setLoading(false); }
  }, [q, catFilter, marcaFilter, soloDestacados, page]);

  // Debounce: evita una petición por cada tecla en la búsqueda.
  useEffect(() => { const t = setTimeout(() => { void load(); }, 300); return () => clearTimeout(t); }, [load]);

  const upload = async (id: number, file: File) => {
    const f = new FormData(); f.append("file", file);
    try { await adminApi.post(`/productos/${id}/imagen`, f); setMsg({ text: "Imagen actualizada", ok: true }); await load(); }
    catch (e) { setMsg({ text: getError(e), ok: false }); }
  };
  const delImg = async (id: number) => {
    try { await adminApi.delete(`/productos/${id}/imagen`); setMsg({ text: "Imagen eliminada", ok: true }); await load(); }
    catch (e) { setMsg({ text: getError(e), ok: false }); }
  };
  const toggleDestacado = async (p: Producto) => {
    try {
      await adminApi.put(`/productos/${p.id}/destacado`, null, { params: { destacado: !p.destacado } });
      setMsg({ text: p.destacado ? "Quitado de destacados" : "Marcado como destacado", ok: true });
      await load();
      refreshDestacadosCount();
    } catch (e) { setMsg({ text: getError(e), ok: false }); }
  };
  const guardarInfo = async (id: number, descripcion: string, ficha: string) => {
    try {
      await adminApi.put(`/productos/${id}`, { descripcion: descripcion || null, ficha_tecnica: ficha || null });
      setMsg({ text: "Información actualizada", ok: true });
      setEditando(null);
      await load();
    } catch (e) { setMsg({ text: getError(e), ok: false }); }
  };

  // Handlers de filtros: al cambiar cualquiera se vuelve a la página 1.
  const handleCategoria = (id: number | null) => { setCatFilter(id); setMarcaFilter(null); setPage(1); };
  const handleMarca = (m: string | null) => { setMarcaFilter(m); setPage(1); };
  const handleSearch = (v: string) => { setQ(v); setPage(1); };
  const handleDestacados = () => { setSoloDestacados((v) => !v); setPage(1); };

  return (
    <div className="min-h-screen bg-sand/40">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/admin" className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-ink-soft hover:bg-sand"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="font-display text-xl font-bold text-ink">Productos</h1>
            <p className="text-sm text-ink-faint">Imágenes, destacados, descripción y ficha técnica</p>
          </div>
        </div>

        {msg && <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${msg.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>{msg.text}</div>}

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input type="search" value={q} onChange={(e) => handleSearch(e.target.value)} placeholder="Buscar producto…"
              className="w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-ocean focus:outline-none" />
          </div>
          <button type="button" onClick={handleDestacados}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              soloDestacados ? "border-coral bg-coral text-white" : "border-line bg-white text-ink-soft hover:border-coral/40"
            }`}>
            <Star size={15} className={soloDestacados ? "fill-white" : ""} /> Destacados ({destacadosCount})
          </button>
        </div>

        {/* Filtro encadenado: primero la categoría, luego la marca */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select value={catFilter ?? ""} onChange={(e) => handleCategoria(e.target.value ? Number(e.target.value) : null)}
            className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-ocean focus:outline-none">
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select value={marcaFilter ?? ""} onChange={(e) => handleMarca(e.target.value || null)} disabled={marcas.length === 0}
            className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-ocean focus:outline-none disabled:opacity-50">
            <option value="">Todas las marcas</option>
            {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {loading ? <p className="py-20 text-center text-ink-faint">Cargando…</p> : productos.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-faint">No hay productos que coincidan.</p>
        ) : (
          <>
            <p className="mb-3 text-sm text-ink-faint">
              <span className="font-semibold text-ink">{total}</span> producto{total !== 1 ? "s" : ""}
              {totalPages > 1 ? ` · página ${page} de ${totalPages}` : ""}
            </p>
            <div className="grid gap-3">
              {productos.map((p) => (
                <Row key={p.id} p={p} onUpload={upload} onDelImg={delImg} onToggleDestacado={toggleDestacado} onEdit={() => setEditando(p)} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink-soft hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40">Anterior</button>
                <span className="text-sm text-ink-faint">Página {page} de {totalPages}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink-soft hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40">Siguiente</button>
              </div>
            )}
          </>
        )}
      </div>

      {editando && <InfoModal producto={editando} onClose={() => setEditando(null)} onSave={guardarInfo} />}
    </div>
  );
}

function Row({ p, onUpload, onDelImg, onToggleDestacado, onEdit }: {
  p: Producto;
  onUpload: (id: number, f: File) => void;
  onDelImg: (id: number) => void;
  onToggleDestacado: (p: Producto) => void;
  onEdit: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const precio = typeof p.precio_venta === "string" ? parseFloat(p.precio_venta) : p.precio_venta;
  const tieneInfo = Boolean(p.descripcion || p.ficha_tecnica);
  return (
    <div className={`flex items-center gap-4 rounded-xl border bg-white p-4 ${p.destacado ? "border-coral/40 ring-1 ring-coral/10" : "border-line"}`}>
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">
        {p.imagen_url ? <img src={`${UPLOADS_BASE}/${p.imagen_url}`} alt="" className="h-full w-full object-cover" />
          : <div className="flex h-full items-center justify-center text-ink-faint/30"><Image size={24} /></div>}
        {p.destacado && (
          <span className="absolute left-0 top-0 flex h-5 w-5 items-center justify-center rounded-br-lg bg-coral text-white"><Star size={11} className="fill-white" /></span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">
          {p.nombre}
          {p.modelo ? <span className="ml-1.5 font-normal text-ink-soft">· {p.modelo}</span> : null}
        </p>
        <p className="text-xs text-ink-faint">{p.marca} · {p.codigo} · S/ {precio.toFixed(2)} · Stock: {p.stock}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs">
            <span className={`inline-block h-2 w-2 rounded-full ${p.estado === "agotado" ? "bg-danger" : p.estado === "bajo_stock" ? "bg-amber-500" : "bg-success"}`} />
            <span className="capitalize text-ink-faint">{p.estado.replace("_", " ")}</span>
          </span>
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${tieneInfo ? "bg-ocean/10 text-ocean" : "bg-line/60 text-ink-faint"}`}>
            {tieneInfo ? "Con ficha" : "Sin ficha"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onEdit} title="Editar descripción y ficha técnica"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-soft hover:bg-ocean/5 hover:text-ocean"><FileText size={16} /></button>
        <button type="button" onClick={() => onToggleDestacado(p)} title={p.destacado ? "Quitar de destacados" : "Marcar como destacado"}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
            p.destacado ? "border-coral bg-coral/10 text-coral" : "border-line text-ink-soft hover:border-coral/40 hover:text-coral"
          }`}><Star size={16} className={p.destacado ? "fill-coral" : ""} /></button>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(p.id, f); e.target.value = ""; }} />
        <button type="button" onClick={() => ref.current?.click()} title="Subir imagen"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-soft hover:bg-ocean/5 hover:text-ocean"><Upload size={16} /></button>
        {p.imagen_url && <button type="button" onClick={() => onDelImg(p.id)} title="Eliminar imagen"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-soft hover:bg-danger/5 hover:text-danger"><Trash2 size={16} /></button>}
      </div>
    </div>
  );
}

function InfoModal({ producto, onClose, onSave }: {
  producto: Producto;
  onClose: () => void;
  onSave: (id: number, descripcion: string, ficha: string) => void;
}) {
  const [descripcion, setDescripcion] = useState(producto.descripcion ?? "");
  const [ficha, setFicha] = useState(producto.ficha_tecnica ?? "");
  const [saving, setSaving] = useState(false);

  const guardar = async () => { setSaving(true); await onSave(producto.id, descripcion.trim(), ficha.trim()); setSaving(false); };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Editar información</h2>
            <p className="text-xs text-ink-faint">{producto.nombre}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-ink-faint hover:bg-sand"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">Descripción</label>
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4}
            placeholder="Describe el producto: para qué sirve, ventajas, uso recomendado…"
            className="w-full resize-y rounded-lg border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ocean focus:outline-none" />

          <label className="mb-1.5 mt-4 block text-sm font-medium text-ink-soft">Ficha técnica</label>
          <textarea value={ficha} onChange={(e) => setFicha(e.target.value)} rows={6}
            placeholder={"Una característica por línea, así:\nLongitud: 3.6 m\nMaterial: Grafito\nAcción: Media\nPeso: 250 g"}
            className="w-full resize-y rounded-lg border border-line px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-ocean focus:outline-none" />
          <p className="mt-1.5 text-xs text-ink-faint">
            Escribe cada característica en una línea con el formato <span className="font-medium text-ink-soft">Etiqueta: valor</span>. Se mostrará como una tabla en el catálogo.
          </p>
        </div>

        <div className="flex gap-2 border-t border-line px-5 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-line py-2.5 text-sm font-medium text-ink-soft hover:bg-sand">Cancelar</button>
          <button type="button" onClick={guardar} disabled={saving}
            className="flex-1 rounded-lg bg-ocean py-2.5 text-sm font-bold text-white hover:bg-ocean-light disabled:opacity-60">
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
