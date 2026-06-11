import { useEffect, useState } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";

interface ImageLightboxProps {
  src: string | null;
  alt: string;
  onClose: () => void;
}

/**
 * Visor de imagen a pantalla completa con zoom.
 *
 * - Clic en la imagen alterna zoom (1x ↔ 2.2x).
 * - Con zoom, se puede arrastrar (o mover el dedo) para desplazar la imagen.
 * - Cierra con la X, la tecla Escape o clic en el fondo.
 */
export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [zoomed, setZoomed] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  // Reset al cambiar de imagen + cerrar con Escape.
  useEffect(() => {
    setZoomed(false);
    setPos({ x: 0, y: 0 });
  }, [src]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (src) {
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [src, onClose]);

  if (!src) return null;

  const toggleZoom = () => {
    setZoomed((z) => !z);
    setPos({ x: 0, y: 0 });
  };

  // Arrastre (mouse).
  const onDown = (e: React.MouseEvent) => {
    if (!zoomed) return;
    setDragging(true);
    setStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };
  const onMove = (e: React.MouseEvent) => {
    if (!dragging || !zoomed) return;
    setPos({ x: e.clientX - start.x, y: e.clientY - start.y });
  };
  const onUp = () => setDragging(false);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 animate-fade-in"
      onClick={onClose}
    >
      {/* Barra superior */}
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
          aria-label={zoomed ? "Alejar" : "Acercar"}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
        >
          {zoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
        >
          <X size={20} />
        </button>
      </div>

      {/* Imagen */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        draggable={false}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoomed ? 2.2 : 1})`,
          cursor: zoomed ? (dragging ? "grabbing" : "grab") : "zoom-in",
        }}
        className="max-h-[88vh] max-w-[92vw] select-none rounded-lg object-contain transition-transform duration-300 ease-out"
      />

      {/* Pie con título */}
      {alt && (
        <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/20 px-4 py-1.5 text-sm text-white">
          {alt}
        </p>
      )}
    </div>
  );
}
