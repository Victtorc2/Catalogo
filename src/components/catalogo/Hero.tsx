import { ArrowDown, Waves, MessageCircle } from "lucide-react";
interface HeroProps { onExplore?: () => void; productCount?: number; brandCount?: number; }
export function Hero({ onExplore, productCount, brandCount }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#123e52] via-abyss to-[#123348]">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-[1fr_auto] sm:items-center sm:py-12">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200"><Waves size={17} /> Fishing and More · Nasca</p>
          <h1 className="max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">Tu próxima pesca<br /><span className="text-sky-200">empieza aquí.</span></h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ice-soft sm:text-base">Encuentra cañas, carretes y señuelos. Compara, arma tu pedido y coordina con nosotros por WhatsApp.</p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button type="button" onClick={onExplore} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-strike-deep px-5 py-3 text-sm font-bold text-white">Ver productos <ArrowDown size={17} /></button>
            <span className="flex items-center gap-2 text-xs text-ice-soft"><MessageCircle size={16} /> Compra con atención personalizada</span>
          </div>
        </div>
        <div className="hidden min-w-44 border-l border-white/15 pl-8 sm:block">
          <p className="font-display text-3xl font-semibold text-white">{productCount ?? 0}</p><p className="mt-1 text-sm text-ice-soft">productos en el catálogo</p>
          <p className="mt-5 font-display text-3xl font-semibold text-white">{brandCount ?? 0}</p><p className="mt-1 text-sm text-ice-soft">marcas para explorar</p>
        </div>
      </div>
    </section>
  );
}
