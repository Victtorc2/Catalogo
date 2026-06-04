import { Plus, Package, Eye } from "lucide-react";
import { UPLOADS_BASE } from "@/api/client";
import type { CatalogoProducto } from "@/types/producto";

function toNum(v: string | number) { return typeof v === "string" ? parseFloat(v) : v; }

interface ProductoCardProps {
  producto: CatalogoProducto;
  onAdd: (p: CatalogoProducto) => void;
  onShowDetail?: (p: CatalogoProducto) => void;
  featured?: boolean;
}

export function ProductoCard({ producto: p, onAdd, onShowDetail, featured }: ProductoCardProps) {
  const agotado = p.estado === "agotado";
  const tieneImg = Boolean(p.imagen_url);
  const imgUrl = tieneImg ? `${UPLOADS_BASE}/${p.imagen_url}` : "";
  const abrirDetalle = () => onShowDetail?.(p);

  return (
    <div className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 ${
      agotado ? "border-line opacity-70" : "border-line hover:shadow-xl hover:-translate-y-1"
    } ${featured ? "ring-1 ring-coral/20" : ""}`}>
      <div className="relative aspect-square overflow-hidden bg-sand">
        {tieneImg ? (
          <img
            src={imgUrl}
            alt={p.nombre}
            onClick={abrirDetalle}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${onShowDetail ? "cursor-pointer" : ""}`}
            loading="lazy"
          />
        ) : (
          <button type="button" onClick={abrirDetalle} className="flex h-full w-full items-center justify-center text-ink-faint/40">
            <Package size={48} strokeWidth={1} />
          </button>
        )}

        {/* Botón ver detalle (hover) */}
        {onShowDetail && (
          <button
            type="button"
            onClick={abrirDetalle}
            aria-label="Ver detalle"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-ocean opacity-0 backdrop-blur-sm transition-opacity hover:bg-white group-hover:opacity-100"
          >
            <Eye size={16} />
          </button>
        )}

        {featured ? (
          <span className="absolute left-2 top-2 rounded-full bg-coral px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            Destacado
          </span>
        ) : (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ocean backdrop-blur-sm">
            {p.categoria}
          </span>
        )}

        {agotado && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-danger">
              No disponible
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3
          onClick={abrirDetalle}
          className={`text-sm font-semibold leading-snug text-ink line-clamp-2 ${onShowDetail ? "cursor-pointer hover:text-ocean" : ""}`}
        >
          {p.nombre}
        </h3>
        <p className="text-xs text-ink-faint">{p.marca}{p.modelo ? ` · ${p.modelo}` : ""}</p>
        <div className="mt-auto flex items-end justify-between pt-2">
          <span className="font-display text-lg font-bold text-ocean">S/ {toNum(p.precio_venta).toFixed(2)}</span>
          {!agotado && (
            <button
              type="button"
              onClick={() => onAdd(p)}
              aria-label={`Agregar ${p.nombre}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-white shadow-sm transition-all hover:bg-coral/90 hover:scale-110 active:scale-90"
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
