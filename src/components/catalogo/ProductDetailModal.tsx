import { useEffect } from "react";
import { X, Plus, Package, ZoomIn, ClipboardList, FileText } from "lucide-react";
import { UPLOADS_BASE } from "@/api/client";
import type { CatalogoProducto } from "@/types/producto";

interface ProductDetailModalProps {
  producto: CatalogoProducto | null;
  onClose: () => void;
  onAdd: (p: CatalogoProducto) => void;
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
 * Cierra con la X, Escape o clic en el fondo.
 */
export function ProductDetailModal({ producto, onClose, onAdd, onImageClick }: ProductDetailModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (producto) {
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [producto, onClose]);

  if (!producto) return null;

  const p = producto;
  const agotado = p.estado === "agotado";
  const tieneImg = Boolean(p.imagen_url);
  const imgUrl = tieneImg ? `${UPLOADS_BASE}/${p.imagen_url}` : "";
  const specs = p.ficha_tecnica ? parseFicha(p.ficha_tecnica) : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm animate-fade-in sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-slide-up sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-soft shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-ink"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col overflow-y-auto sm:flex-row">
          {/* Imagen */}
          <div className="relative aspect-square w-full shrink-0 bg-sand sm:w-1/2">
            {tieneImg ? (
              <>
                <img
                  src={imgUrl}
                  alt={p.nombre}
                  onClick={() => onImageClick?.(imgUrl, p.nombre)}
                  className={`h-full w-full object-cover ${onImageClick ? "zoom-cursor" : ""}`}
                />
                {onImageClick && (
                  <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-ocean backdrop-blur-sm">
                    <ZoomIn size={13} /> Ampliar
                  </span>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-ink-faint/30">
                <Package size={64} strokeWidth={1} />
              </div>
            )}
            {p.destacado && (
              <span className="absolute left-3 top-3 rounded-full bg-coral px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                Destacado
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-coral">{p.categoria}</p>
              <h2 className="mt-1 font-display text-2xl font-bold leading-tight text-ink">{p.nombre}</h2>
              <p className="mt-1 text-sm text-ink-faint">
                {p.marca}{p.modelo ? ` · ${p.modelo}` : ""}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-display text-3xl font-extrabold text-ocean">
                S/ {toNum(p.precio_venta).toFixed(2)}
              </span>
              {agotado ? (
                <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-bold uppercase text-danger">
                  No disponible
                </span>
              ) : (
                <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  Disponible
                </span>
              )}
            </div>

            {/* Descripción */}
            {p.descripcion && (
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <FileText size={15} className="text-ocean" /> Descripción
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{p.descripcion}</p>
              </div>
            )}

            {/* Ficha técnica */}
            {specs.length > 0 && (
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <ClipboardList size={15} className="text-ocean" /> Ficha técnica
                </div>
                <dl className="overflow-hidden rounded-xl border border-line">
                  {specs.map((s, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 px-3 py-2 text-sm ${i % 2 ? "bg-sand/40" : "bg-white"}`}
                    >
                      {s.etiqueta ? (
                        <>
                          <dt className="w-2/5 shrink-0 font-medium text-ink-soft">{s.etiqueta}</dt>
                          <dd className="flex-1 text-ink">{s.valor}</dd>
                        </>
                      ) : (
                        <dd className="text-ink">{s.valor}</dd>
                      )}
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {!p.descripcion && specs.length === 0 && (
              <p className="text-sm text-ink-faint">Este producto aún no tiene descripción detallada.</p>
            )}

            {/* Agregar al pedido */}
            {!agotado && (
              <button
                type="button"
                onClick={() => { onAdd(p); onClose(); }}
                className="mt-auto flex items-center justify-center gap-2 rounded-2xl bg-coral px-6 py-3.5 font-display text-base font-bold text-white shadow-sm transition-all hover:bg-coral/90 active:scale-[0.98]"
              >
                <Plus size={20} /> Agregar al pedido
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
