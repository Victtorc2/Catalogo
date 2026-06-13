import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

export interface FilterOption {
  /** Clave estable para comparar la selección. */
  key: string;
  label: string;
  count?: number;
}

interface FilterDropdownProps {
  /** Etiqueta del control (ej. "Categoría"). */
  label: string;
  options: FilterOption[];
  /** Clave seleccionada, o null = "todas". */
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  /** Texto de la opción "sin filtro" (ej. "Todas"). */
  allLabel?: string;
}

/**
 * Selector desplegable con buscador, pensado para listas largas (categorías,
 * marcas). Muestra un botón compacto con la selección actual; al abrir despliega
 * una lista filtrable. Cierra al elegir, al hacer clic fuera o con Escape.
 */
export function FilterDropdown({
  label,
  options,
  selectedKey,
  onSelect,
  allLabel = "Todas",
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.key === selectedKey) ?? null;

  // Cierra al hacer clic fuera o con Escape.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Limpia la búsqueda al cerrar.
  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? options.filter((o) => o.label.toLowerCase().includes(t)) : options;
  }, [q, options]);

  const choose = (key: string | null) => {
    onSelect(key);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 font-display text-sm font-semibold transition-all ${
          selected
            ? "border-electric/60 bg-electric/15 text-ice"
            : "border-steel-light/50 bg-steel/50 text-ice-soft hover:border-electric/40 hover:text-ice"
        }`}
      >
        <span className="text-ice-faint">{label}:</span>
        <span className="max-w-[160px] truncate">{selected ? selected.label : allLabel}</span>
        <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-64 max-w-[80vw] overflow-hidden rounded-xl border border-steel-light/50 bg-steel shadow-[0_24px_50px_-18px_rgba(0,0,0,0.9)]">
          {options.length > 6 && (
            <div className="relative border-b border-steel-light/40 p-2">
              <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ice-faint" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Buscar ${label.toLowerCase()}…`}
                className="w-full rounded-lg border border-steel-light/50 bg-abyss/40 py-2 pl-8 pr-3 text-sm text-ice placeholder:text-ice-faint focus:border-electric/60 focus:outline-none"
              />
            </div>
          )}
          <ul className="max-h-64 overflow-y-auto dark-scroll py-1">
            <li>
              <button
                type="button"
                onClick={() => choose(null)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-abyss/40"
              >
                <span className={selectedKey === null ? "font-semibold text-electric" : "text-ice-soft"}>
                  {allLabel}
                </span>
                {selectedKey === null && <Check size={15} className="shrink-0 text-electric" />}
              </button>
            </li>
            {filtered.map((o) => (
              <li key={o.key}>
                <button
                  type="button"
                  onClick={() => choose(o.key)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-abyss/40"
                >
                  <span className={`truncate ${o.key === selectedKey ? "font-semibold text-electric" : "text-ice"}`}>
                    {o.label}
                    {typeof o.count === "number" && (
                      <span className="ml-1 text-xs text-ice-faint">({o.count})</span>
                    )}
                  </span>
                  {o.key === selectedKey && <Check size={15} className="shrink-0 text-electric" />}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-center text-xs text-ice-faint">Sin coincidencias</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
