import { FilterDropdown } from "@/components/catalogo/FilterDropdown";
import type { CatalogoCategoria } from "@/types/producto";

/** Filtro de categorías como menú desplegable con buscador. */
export function CategoryFilter({ categorias, selected, onChange }: {
  categorias: CatalogoCategoria[]; selected: number | null; onChange: (id: number | null) => void;
}) {
  return (
    <FilterDropdown
      label="Categoría"
      allLabel="Todas"
      options={categorias.map((c) => ({
        key: String(c.id),
        label: c.nombre,
        count: c.cantidad_productos,
      }))}
      selectedKey={selected != null ? String(selected) : null}
      onSelect={(key) => onChange(key == null ? null : Number(key))}
    />
  );
}
