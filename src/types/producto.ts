export interface CatalogoProducto {
  id: number;
  codigo: string;
  nombre: string;
  marca: string;
  modelo: string | null;
  color: string | null;
  categoria: string;
  precio_venta: string | number;
  stock: number;
  estado: "disponible" | "bajo_stock" | "agotado";
  imagen_url: string | null;
  destacado: boolean;
  descripcion: string | null;
  ficha_tecnica: string | null;
}

export interface CatalogoCategoria {
  id: number;
  nombre: string;
  cantidad_productos: number;
}

export interface CatalogoMarca {
  nombre: string;
  cantidad_productos: number;
}

/** Modelo agrupado de una marca (paso Categoría → Marca → Modelo → colores). */
export interface CatalogoModelo {
  modelo: string;
  /** Número de variantes de color del modelo. */
  cantidad_productos: number;
  /** Imagen representativa de alguna variante (puede ser null). */
  imagen_url: string | null;
  /** Precio de venta más bajo entre las variantes. */
  precio_desde: string | number;
}

/** Respuesta paginada genérica del backend ({ items, total, page, ... }). */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
