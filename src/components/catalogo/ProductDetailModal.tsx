import { useCallback, useEffect, useRef, useState } from "react";
import { X, Plus, Minus, Package, ZoomIn, ClipboardList, FileText, Palette, ChevronDown } from "lucide-react";
import { UPLOADS_BASE } from "@/api/client";
import type { CatalogoProducto } from "@/types/producto";

interface ProductDetailModalProps {
  producto: CatalogoProducto | null;
  onClose: () => void;
  onAdd: (p: CatalogoProducto, cantidad?: number) => void;
  onImageClick?: (url: string, alt: string) => void;
}

function toNum(v: string | number) {
  return typeof v === "string" ? parseFloat(v) : v;
}

/** Parsea la ficha técnica (una línea por spec, "Etiqueta: valor"). */
function parseFicha(texto: string): { etiqueta: string; valor: string }[] {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((linea) => {
      const i = linea.indexOf(":");
      if (i === -1) return { etiqueta: "", valor: linea };
      return { etiqueta: linea.slice(0, i).trim(), valor: linea.slice(i + 1).trim() };
    });
}

/**
 * Detalle del producto: imagen ampliable, descripción y ficha técnica.
 *
 * El modal mantiene un tamaño fijo: la imagen y el botón de pedido quedan
 * anclados, y la información larga (descripción + ficha) se desplaza dentro de
 * un área con scroll. Una flecha indica (y permite) bajar cuando hay más texto.
 * Cierra con la X, Escape o clic en el fondo.
 */
export function ProductDetailModal({ producto, onClose, onAdd, onImageClick }: ProductDetailModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hayMas, setHayMas] = useState(false);
  const [cantidad, setCantidad] = useState(1);

  // Comprueba si queda contenido por debajo para mostrar la flecha.
  const actualizarFlecha = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setHayMas(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
  }, []);

  const bajar = () => {
    scrollRef.current?.scrollBy({ top: 240, behavior: "smooth" });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (producto) {
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      // Resetea el scroll, la cantidad y recalcula la flecha al abrir.
      setCantidad(1);
      const el = scrollRef.current;
      if (el) el.scrollTop = 0;
      requestAnimationFrame(actualizarFlecha);
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [producto, onClose, actualizarFlecha]);

  if (!producto) return null;

  const p = producto;
  const agotado = p.estado === "agotado";
  const tieneImg = Boolean(p.imagen_url);
  const imgUrl = tieneImg ? `${UPLOADS_BASE}/${p.imagen_url}` : "";
  const specs = p.ficha_tecnica ? parseFicha(p.ficha_tecnica) : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-abyss-deep/90 animate-fade-in sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative flex h-[88vh] max-h-[600px] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-steel-light/40 bg-steel shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95)] animate-slide-up sm:flex-row sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow superior */}
        <div className="absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-electric/60 to-transparent" />

        {/* Cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-xl border border-steel-light/50 bg-abyss/90 text-ice-soft transition-colors hover:bg-electric hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Imagen (anclada: no se desplaza con el texto) */}
        <div className="relative aspect-square w-full shrink-0 bg-abyss-deep sm:aspect-auto sm:h-full sm:w-1/2">
          {tieneImg ? (
            <>
              <img
                src={imgUrl}
                alt={p.nombre}
                onClick={() => onImageClick?.(imgUrl, p.nombre)}
                className={`h-full w-full object-cover ${onImageClick ? "zoom-cursor" : ""}`}
              />
              {onImageClick && (
                <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg border border-electric/30 bg-abyss/90 px-2.5 py-1 text-xs font-medium text-electric">
                  <ZoomIn size={13} /> Ampliar
                </span>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-steel-light">
              <Package size={64} strokeWidth={1} />
            </div>
          )}
          {p.destacado && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-strike to-strike-deep px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-[0_8px_20px_-8px_rgba(249,115,22,0.9)]">
              Destacado
            </span>
          )}
        </div>

        {/* Columna de información (tamaño fijo; el texto largo hace scroll aquí) */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            ref={scrollRef}
            onScroll={actualizarFlecha}
            className="flex flex-1 flex-col gap-4 overflow-y-auto dark-scroll p-5 sm:p-6"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-electric">{p.categoria}</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight text-ice">{p.nombre}</h2>
              <p className="mt-1 text-sm uppercase tracking-wide text-ice-faint">
                {p.marca}{p.modelo ? ` · ${p.modelo}` : ""}
              </p>
              {p.color && (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-electric/30 bg-electric/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-electric">
                  <Palette size={13} /> {p.color}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="font-display text-3xl font-extrabold text-ice">
                <span className="text-electric">S/</span> {toNum(p.precio_venta).toFixed(2)}
              </span>
              {agotado ? (
                <span className="rounded-lg bg-danger/15 px-3 py-1 text-xs font-bold uppercase text-danger">
                  No disponible
                </span>
              ) : (
                <span className="rounded-lg bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                  Disponible
                </span>
              )}
            </div>

            {/* Descripción */}
            {p.descripcion && (
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-ice">
                  <FileText size={15} className="text-electric" /> Descripción
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ice-soft">{p.descripcion}</p>
              </div>
            )}

            {/* Ficha técnica */}
            {specs.length > 0 && (
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-ice">
                  <ClipboardList size={15} className="text-electric" /> Ficha técnica
                </div>
                <dl className="overflow-hidden rounded-xl border border-steel-light/50">
                  {specs.map((s, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 px-3 py-2 text-sm ${i % 2 ? "bg-abyss/40" : "bg-steel/40"}`}
                    >
                      {s.etiqueta ? (
                        <>
                          <dt className="w-2/5 shrink-0 font-medium text-ice-faint">{s.etiqueta}</dt>
                          <dd className="flex-1 text-ice">{s.valor}</dd>
                        </>
                      ) : (
                        <dd className="text-ice">{s.valor}</dd>
                      )}
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {!p.descripcion && specs.length === 0 && (
              <p className="text-sm text-ice-faint">Este producto aún no tiene descripción detallada.</p>
            )}
          </div>

          {/* Flecha: indica que hay más información hacia abajo */}
          {hayMas && (
            <button
              type="button"
              onClick={bajar}
              aria-label="Ver más información"
              className={`pointer-events-auto absolute left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 animate-bounce items-center justify-center rounded-full border border-electric/40 bg-abyss/90 text-electric shadow-[0_8px_20px_-6px_rgba(14,165,233,0.7)] transition-colors hover:bg-electric hover:text-white ${agotado ? "bottom-3" : "bottom-[76px]"}`}
            >
              <ChevronDown size={18} />
            </button>
          )}

          {/* Cantidad + Agregar al pedido (anclado abajo, siempre visible) */}
          {!agotado && (
            <div className="flex items-center gap-3 border-t border-steel-light/40 bg-steel/95 p-4">
              <div className="flex shrink-0 items-center gap-1 rounded-xl border border-steel-light/50 bg-abyss/40 p-1">
                <button
                  type="button"
                  onClick={() => setCantidad((q) => Math.max(1, q - 1))}
                  aria-label="Quitar uno"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ice-soft transition-colors hover:bg-steel hover:text-ice disabled:opacity-40"
                  disabled={cantidad <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="w-7 text-center font-display text-base font-bold tabular-nums text-ice">
                  {cantidad}
                </span>
                <button
                  type="button"
                  onClick={() => setCantidad((q) => q + 1)}
                  aria-label="Agregar uno"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ice-soft transition-colors hover:bg-steel hover:text-ice"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => { onAdd(p, cantidad); onClose(); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-strike to-strike-deep px-4 py-3.5 font-display text-base font-bold text-white shadow-[0_18px_40px_-14px_rgba(249,115,22,0.8)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Plus size={20} /> Agregar{cantidad > 1 ? ` ${cantidad}` : ""} al pedido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
