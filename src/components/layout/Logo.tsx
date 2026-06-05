import { useState } from "react";
import { Fish } from "lucide-react";
import { LOGO_URL, STORE_NAME } from "@/api/client";

/**
 * Logo de la tienda.
 *
 * Intenta mostrar la imagen en `public/logo.png`. Si no existe o falla la
 * carga, muestra un respaldo con ícono + nombre, para que el header nunca
 * se vea roto.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-electric-deep text-white shadow-[0_8px_20px_-8px_rgba(14,165,233,0.9)] sm:h-10 sm:w-10">
          <Fish size={20} />
        </div>
        {!compact && (
          <span className="truncate font-display text-base font-extrabold tracking-tight text-ice sm:text-lg">
            {STORE_NAME}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={LOGO_URL}
      alt={STORE_NAME}
      onError={() => setFailed(true)}
      className={
        compact
          ? "h-9 w-auto object-contain"
          : "h-9 w-auto max-w-[150px] object-contain sm:h-11 sm:max-w-[240px]"
      }
    />
  );
}
