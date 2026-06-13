import { Package, Palette, ChevronRight } from "lucide-react";
import { UPLOADS_BASE } from "@/api/client";
import type { CatalogoModelo } from "@/types/producto";

function toNum(v: string | number) {
  return typeof v === "string" ? parseFloat(v) : v;
}

interface ModeloCardProps {
  modelo: CatalogoModelo;
  onSelect: (modelo: string) => void;
}

/**
 * Card de un MODELO dentro de una marca. Al pulsarla se entra a ver los
 * colores (variantes) de ese modelo. Mantiene la estética de ProductoCard:
 * imagen cuadrada, halo eléctrico al hover y badge con el nº de colores.
 */
export function ModeloCard({ modelo: m, onSelect }: ModeloCardProps) {
  const tieneImg = Boolean(m.imagen_url);
  const imgUrl = tieneImg ? `${UPLOADS_BASE}/${m.imagen_url}` : "";
  const colores = m.cantidad_productos;

  return (
    <button
      type="button"
      onClick={() => onSelect(m.modelo)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-steel-light/50 bg-steel text-left shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:border-electric/50 hover:shadow-[0_24px_50px_-18px_rgba(14,165,233,0.45)]"
    >
      {/* Halo eléctrico al hacer hover */}
      <div className="pointer-events-none absolute inset-0 -z-0 rounded-2xl bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(14,165,233,0.16),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative aspect-square overflow-hidden bg-abyss-deep">
        {tieneImg ? (
          <img
            src={imgUrl}
            alt={m.modelo}
            className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.12]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-steel-light">
            <Package size={48} strokeWidth={1} />
          </div>
        )}

        {/* Degradado inferior para fundir con la card */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-steel/90 to-transparent" />

        {/* Badge: cantidad de colores */}
        <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-lg border border-electric/30 bg-abyss/90 px-2.5 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider text-electric">
          <Palette size={11} /> {colores} {colores === 1 ? "color" : "colores"}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="font-display text-sm font-bold leading-snug text-ice line-clamp-2 transition-colors group-hover:text-electric">
          {m.modelo}
        </h3>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <span className="block text-[10px] font-medium uppercase tracking-wider text-ice-faint">Desde</span>
            <span className="font-display text-lg font-extrabold text-ice">
              <span className="text-electric">S/</span> {toNum(m.precio_desde).toFixed(2)}
            </span>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-electric/30 bg-electric/10 text-electric transition-all group-hover:bg-electric group-hover:text-white">
            <ChevronRight size={18} strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </button>
  );
}
