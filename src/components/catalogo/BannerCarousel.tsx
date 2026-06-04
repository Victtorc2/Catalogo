import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { UPLOADS_BASE } from "@/api/client";
import type { Banner } from "@/types/banner";

interface BannerCarouselProps {
  banners: Banner[];
  onImageClick?: (url: string, alt: string) => void;
}

/**
 * Carrusel de promociones.
 *
 * Muestra la imagen COMPLETA (object-contain) sobre un fondo difuminado de la
 * misma imagen, para que nada se recorte y se vea profesional. Auto-avanza,
 * tiene controles, indicadores, y se puede ampliar a pantalla completa.
 */
export function BannerCarousel({ banners, onImageClick }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);
  const count = banners.length;

  const goTo = useCallback((i: number) => setCurrent(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    timer.current = window.setTimeout(() => goTo(current + 1), 5500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [current, paused, count, goTo]);

  if (count === 0) return null;

  return (
    <div
      className="group relative overflow-hidden rounded-3xl shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Más grande: alto generoso en todos los tamaños */}
      <div className="relative h-64 w-full sm:h-80 lg:h-[26rem]">
        {banners.map((b, i) => {
          const url = `${UPLOADS_BASE}/${b.imagen_url}`;
          const activo = i === current;
          return (
            <div
              key={b.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                activo ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {/* Fondo difuminado (relleno del espacio sin recortar la imagen real) */}
              <div
                className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
                style={{ backgroundImage: `url(${url})` }}
              />
              <div className="absolute inset-0 bg-ink/30" />

              {/* Imagen completa, sin recortar */}
              <img
                src={url}
                alt={b.titulo}
                onClick={() => onImageClick?.(url, b.titulo)}
                className={`relative z-10 mx-auto h-full w-auto max-w-full object-contain ${onImageClick ? "zoom-cursor" : ""} ${
                  activo ? "animate-fade-in" : ""
                }`}
              />

              {/* Botón ampliar */}
              {onImageClick && (
                <button
                  type="button"
                  onClick={() => onImageClick(url, b.titulo)}
                  aria-label="Ampliar imagen"
                  className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-ocean opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:bg-white group-hover:opacity-100"
                >
                  <Maximize2 size={17} />
                </button>
              )}

              {/* Caption sutil (no tapa la imagen) */}
              {(b.titulo || b.descripcion) && (
                <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink/75 to-transparent px-5 pb-5 pt-12">
                  <p className="font-display text-base font-bold text-white drop-shadow sm:text-lg">{b.titulo}</p>
                  {b.descripcion && <p className="text-xs text-white/85 sm:text-sm">{b.descripcion}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button" onClick={() => goTo(current - 1)} aria-label="Anterior"
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ocean opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-white group-hover:opacity-100"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button" onClick={() => goTo(current + 1)} aria-label="Siguiente"
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ocean opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-white group-hover:opacity-100"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {banners.map((_, i) => (
              <button
                key={i} type="button" onClick={() => goTo(i)} aria-label={`Ir a promoción ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
