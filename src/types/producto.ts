export interface CatalogoProducto {
  id: number;
  codigo: string;
  nombre: string;
  marca: string;
  modelo: string | null;
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

/** Respuesta paginada genérica del backend ({ items, total, page, ... }). */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
