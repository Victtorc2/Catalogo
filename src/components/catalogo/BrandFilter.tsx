import { FilterDropdown } from "@/components/catalogo/FilterDropdown";
import type { CatalogoMarca } from "@/types/producto";

interface BrandFilterProps {
  marcas: CatalogoMarca[];
  selected: string | null;
  onChange: (marca: string | null) => void;
}

/** Filtro de marcas como menú desplegable con buscador (segundo nivel). */
export function BrandFilter({ marcas, selected, onChange }: BrandFilterProps) {
  if (marcas.length === 0) return null;

  return (
    <FilterDropdown
      label="Marca"
      allLabel="Todas"
      options={marcas.map((m) => ({
        key: m.nombre,
        label: m.nombre,
        count: m.cantidad_productos,
      }))}
      selectedKey={selected}
      onSelect={onChange}
    />
  );
}
