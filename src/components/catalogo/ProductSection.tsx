import type { LucideIcon } from "lucide-react";
import { ProductoCard, type CardBadge } from "@/components/catalogo/ProductoCard";
import type { CatalogoProducto } from "@/types/producto";

type Accent = "electric" | "strike";

interface ProductSectionProps {
  id?: string;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  accent?: Accent;
  productos: CatalogoProducto[];
  badge?: CardBadge;
  layout?: "grid" | "rail";
  onAdd: (p: CatalogoProducto) => void;
  onShowDetail: (p: CatalogoProducto) => void;
}

const ACCENT = {
  electric: {
    icon: "text-electric",
    chip: "border-electric/30 bg-electric/10 text-electric",
    bar: "from-electric to-transparent",
  },
  strike: {
    icon: "text-strike",
    chip: "border-strike/30 bg-strike/10 text-strike",
    bar: "from-strike to-transparent",
  },
} as const;

/** Sección temática de productos con cabecera táctica. */
export function ProductSection({
  id, icon: Icon, title, subtitle, accent = "electric",
  productos, badge, layout = "grid", onAdd, onShowDetail,
}: ProductSectionProps) {
  if (productos.length === 0) return null;
  const a = ACCENT[accent];

  return (
    <section id={id} className="scroll-mt-24">
      {/* Cabecera */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${a.chip}`}>
            <Icon size={22} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-ice sm:text-2xl">{title}</h2>
            {subtitle && <p className="text-xs font-medium uppercase tracking-wider text-ice-faint sm:text-sm">{subtitle}</p>}
          </div>
        </div>
        <span className={`hidden h-px w-24 shrink-0 bg-gradient-to-r ${a.bar} sm:block`} />
      </div>

      {layout === "rail" ? (
        <div className="dark-scroll -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:gap-4">
          {productos.map((p) => (
            <div key={p.id} className="w-[46%] shrink-0 sm:w-[31%] lg:w-[23%]">
              <ProductoCard producto={p} onAdd={onAdd} onShowDetail={onShowDetail} badge={badge} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {productos.map((p) => (
            <ProductoCard key={p.id} producto={p} onAdd={onAdd} onShowDetail={onShowDetail} badge={badge} />
          ))}
        </div>
      )}
    </section>
  );
}
