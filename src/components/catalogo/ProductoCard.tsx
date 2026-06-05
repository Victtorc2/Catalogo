import { Plus, Package, Eye, Flame } from "lucide-react";
import { UPLOADS_BASE } from "@/api/client";
import type { CatalogoProducto } from "@/types/producto";

function toNum(v: string | number) { return typeof v === "string" ? parseFloat(v) : v; }

export type CardBadge = "TOP" | "NUEVO" | "PRO" | "HOT" | null;

interface ProductoCardProps {
  producto: CatalogoProducto;
  onAdd: (p: CatalogoProducto) => void;
  onShowDetail?: (p: CatalogoProducto) => void;
  featured?: boolean;
  badge?: CardBadge;
}

const BADGE_STYLES: Record<NonNullable<CardBadge>, string> = {
  TOP: "bg-gradient-to-r from-strike to-strike-deep text-white shadow-[0_6px_18px_-6px_rgba(249,115,22,0.8)]",
  HOT: "bg-gradient-to-r from-strike to-strike-deep text-white shadow-[0_6px_18px_-6px_rgba(249,115,22,0.8)]",
  NUEVO: "bg-gradient-to-r from-electric to-electric-deep text-white shadow-[0_6px_18px_-6px_rgba(14,165,233,0.8)]",
  PRO: "bg-ice/95 text-abyss shadow-sm",
};

export function ProductoCard({ producto: p, onAdd, onShowDetail, featured, badge }: ProductoCardProps) {
  const agotado = p.estado === "agotado";
  const bajoStock = p.estado === "bajo_stock";
  const tieneImg = Boolean(p.imagen_url);
  const imgUrl = tieneImg ? `${UPLOADS_BASE}/${p.imagen_url}` : "";
  const abrirDetalle = () => onShowDetail?.(p);
  const efectivo = badge ?? (featured ? "TOP" : null);

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-steel/60 backdrop-blur-sm transition-all duration-300 ${
        agotado
          ? "border-steel-light/40 opacity-70"
          : "border-steel-light/50 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)] hover:-translate-y-1.5 hover:border-electric/50 hover:shadow-[0_24px_50px_-18px_rgba(14,165,233,0.45)]"
      }`}
    >
      {/* Halo eléctrico al hacer hover */}
      <div className="pointer-events-none absolute inset-0 -z-0 rounded-2xl bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(14,165,233,0.16),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="sweep-host relative aspect-square overflow-hidden bg-abyss-deep">
        {tieneImg ? (
          <img
            src={imgUrl}
            alt={p.nombre}
            onClick={abrirDetalle}
            className={`h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.12] ${onShowDetail ? "cursor-pointer" : ""}`}
            loading="lazy"
          />
        ) : (
          <button type="button" onClick={abrirDetalle} className="flex h-full w-full items-center justify-center text-steel-light">
            <Package size={48} strokeWidth={1} />
          </button>
        )}

        {/* Degradado inferior para fundir con la card */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-steel/90 to-transparent" />

        {/* Botón ver detalle (hover) */}
        {onShowDetail && (
          <button
            type="button"
            onClick={abrirDetalle}
            aria-label="Ver detalle"
            className="absolute right-2 top-2 z-10 flex h-9 w-9 translate-y-1 items-center justify-center rounded-xl border border-electric/30 bg-abyss/70 text-electric opacity-0 backdrop-blur-md transition-all hover:bg-electric hover:text-white group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Eye size={16} />
          </button>
        )}

        {/* Badge principal */}
        {efectivo ? (
          <span className={`absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider ${BADGE_STYLES[efectivo]}`}>
            {(efectivo === "TOP" || efectivo === "HOT") && <Flame size={11} />}
            {efectivo}
          </span>
        ) : (
          <span className="absolute left-2 top-2 z-10 rounded-lg border border-steel-light/50 bg-abyss/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ice-soft backdrop-blur-md">
            {p.categoria}
          </span>
        )}

        {bajoStock && !agotado && (
          <span className="absolute bottom-2 left-2 z-10 rounded-md bg-strike/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Últimas unidades
          </span>
        )}

        {agotado && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-abyss/60 backdrop-blur-[2px]">
            <span className="rounded-lg border border-danger/40 bg-abyss/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-danger">
              No disponible
            </span>
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-1 p-3.5">
        <h3
          onClick={abrirDetalle}
          className={`font-display text-sm font-bold leading-snug text-ice line-clamp-2 ${onShowDetail ? "cursor-pointer transition-colors hover:text-electric" : ""}`}
        >
          {p.nombre}
        </h3>
        <p className="text-xs font-medium uppercase tracking-wide text-ice-faint">
          {p.marca}{p.modelo ? ` · ${p.modelo}` : ""}
        </p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <span className="block text-[10px] font-medium uppercase tracking-wider text-ice-faint">Precio</span>
            <span className="font-display text-lg font-extrabold text-ice">
              <span className="text-electric">S/</span> {toNum(p.precio_venta).toFixed(2)}
            </span>
          </div>
          {!agotado && (
            <button
              type="button"
              onClick={() => onAdd(p)}
              aria-label={`Agregar ${p.nombre}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-strike to-strike-deep text-white shadow-[0_8px_20px_-8px_rgba(249,115,22,0.8)] transition-all hover:scale-110 hover:shadow-[0_10px_24px_-6px_rgba(249,115,22,0.95)] active:scale-90"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
