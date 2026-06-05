import { Anchor, ChevronDown, Compass, Waves, Zap } from "lucide-react";

interface HeroProps {
  onExplore?: () => void;
  productCount?: number;
  brandCount?: number;
}

/**
 * Hero cinematográfico "ocean tactical".
 * Fondo marino profundo con rejilla táctica, halo de luz eléctrica y
 * elementos flotantes. Transmite fuerza, aventura y tecnología premium.
 */
export function Hero({ onExplore, productCount, brandCount }: HeroProps) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Capas de fondo marino */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-abyss-deep via-abyss to-steel" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(120%_80%_at_70%_-10%,rgba(14,165,233,0.28),transparent_60%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(90%_70%_at_10%_110%,rgba(249,115,22,0.16),transparent_55%)]" />
      <div className="tactical-grid tactical-grid-anim absolute inset-0 -z-10 opacity-70" />

      {/* Olas decorativas inferiores */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-[radial-gradient(60%_100%_at_50%_100%,rgba(14,165,233,0.18),transparent_70%)]" />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24 lg:py-28">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-electric backdrop-blur-sm animate-slide-up">
            <Waves size={14} />
            Pesca deportiva · Edición premium
          </div>

          <h1
            className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ice sm:text-6xl lg:text-7xl animate-slide-up"
            style={{ animationDelay: "0.08s" }}
          >
            Domina el agua con
            <br className="hidden sm:block" />
            <span className="gradient-text text-glow"> equipo táctico</span>
            <span className="gradient-text-strike"> letal</span>.
          </h1>

          <p
            className="mt-6 max-w-xl text-base leading-relaxed text-ice-soft sm:text-lg animate-slide-up"
            style={{ animationDelay: "0.16s" }}
          >
            Cañas, carretes, señuelos y líneas de las marcas líderes del mundo.
            Tecnología de élite para el pescador que no acepta perder la batalla.
          </p>

          {/* CTA */}
          <div
            className="mt-9 flex flex-wrap items-center gap-3 animate-slide-up"
            style={{ animationDelay: "0.24s" }}
          >
            <button
              type="button"
              onClick={onExplore}
              className="sweep-host group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-strike to-strike-deep px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-white shadow-[0_18px_40px_-12px_rgba(249,115,22,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-10px_rgba(249,115,22,0.75)] active:scale-95"
            >
              <Zap size={18} className="transition-transform group-hover:scale-110" />
              Explorar arsenal
            </button>
            <a
              href="#destacados"
              onClick={onExplore}
              className="inline-flex items-center gap-2 rounded-2xl border border-electric/30 bg-electric/5 px-6 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-electric backdrop-blur-sm transition-all hover:border-electric/60 hover:bg-electric/15"
            >
              <Compass size={18} />
              Ver destacados
            </a>
          </div>

          {/* Métricas */}
          <div
            className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 animate-slide-up"
            style={{ animationDelay: "0.32s" }}
          >
            <Stat value={productCount ? `${productCount}+` : "100+"} label="Productos en stock" />
            <div className="hidden h-10 w-px bg-steel-light/60 sm:block" />
            <Stat value={brandCount ? `${brandCount}+` : "12+"} label="Marcas premium" />
            <div className="hidden h-10 w-px bg-steel-light/60 sm:block" />
            <Stat value="100%" label="Originales garantizados" />
          </div>
        </div>
      </div>

      {/* Ancla flotante decorativa */}
      <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 lg:block">
        <div className="animate-floaty rounded-3xl border border-electric/20 bg-steel/30 p-8 backdrop-blur-sm">
          <Anchor size={120} strokeWidth={1} className="text-electric/30" />
        </div>
      </div>

      {/* Indicador de scroll */}
      <button
        type="button"
        onClick={onExplore}
        aria-label="Desplazar"
        className="absolute bottom-5 left-1/2 -translate-x-1/2 text-ice-faint transition-colors hover:text-electric"
      >
        <ChevronDown size={26} className="animate-bounce" />
      </button>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-extrabold text-ice sm:text-3xl">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wider text-ice-faint">{label}</p>
    </div>
  );
}
