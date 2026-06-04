export interface Banner {
  id: number;
  titulo: string;
  descripcion: string | null;
  imagen_url: string;
  orden: number;
  is_active?: boolean;
}
