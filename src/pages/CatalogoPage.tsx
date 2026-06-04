import { useCallback, useEffect, useMemo, useState } from "react";
import { Fish, Loader2, MessageCircle, Sparkles, LayoutGrid } from "lucide-react";
import { catalogoApi } from "@/api/client";
import { useCarrito } from "@/hooks/useCarrito";
import { Header } from "@/components/layout/Header";
import { BannerCarousel } from "@/components/catalogo/BannerCarousel";
import { CategoryFilter } from "@/components/catalogo/CategoryFilter";
import { BrandFilter } from "@/components/catalogo/BrandFilter";
import { ProductoCard } from "@/components/catalogo/ProductoCard";
import { Pagination } from "@/components/catalogo/Pagination";
import { CarritoDrawer } from "@/components/catalogo/CarritoDrawer";
import { ImageLightbox } from "@/components/catalogo/ImageLightbox";
import { ProductDetailModal } from "@/components/catalogo/ProductDetailModal";
import { FloatingSocial } from "@/components/catalogo/FloatingSocial";
import { Footer } from "@/components/catalogo/Footer";
import type { CatalogoProducto, CatalogoCategoria, CatalogoMarca } from "@/types/producto";
import type { Banner } from "@/types/banner";

const PAGE_SIZE = 12;

export function CatalogoPage() {
  const carrito = useCarrito();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [productos, setProductos] = useState<CatalogoProducto[]>([]);
  const [destacados, setDestacados] = useState<CatalogoProducto[]>([]);
  const [categorias, setCategorias] = useState<CatalogoCategoria[]>([]);
  const [marcas, setMarcas] = useState<CatalogoMarca[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [marcaFilter, setMarcaFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Imagen ampliada (lightbox) y producto en detalle.
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [detalle, setDetalle] = useState<CatalogoProducto | null>(null);
  const openLightbox = useCallback((src: string, alt: string) => setLightbox({ src, alt }), []);

  const sinFiltros = !search.trim() && catFilter === null && marcaFilter === null;

  // Productos (con filtros) + destacados (solo sin filtros).
  const loadProductos = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [prod, dest] = await Promise.all([
        catalogoApi.get<CatalogoProducto[]>("/catalogo/productos", {
          params: {
            search: search.trim() || undefined,
            categoria_id: catFilter ?? undefined,
            marca: marcaFilter ?? undefined,
          },
        }),
        sinFiltros
          ? catalogoApi.get<CatalogoProducto[]>("/catalogo/productos", { params: { solo_destacados: true } })
          : Promise.resolve({ data: [] as CatalogoProducto[] }),
      ]);
      setProductos(prod.data);
      setDestacados(dest.data.slice(0, 4));
    } catch { setError("No se pudo cargar el catálogo."); }
    finally { setLoading(false); }
  }, [search, catFilter, marcaFilter, sinFiltros]);

  useEffect(() => { const t = setTimeout(loadProductos, 350); return () => clearTimeout(t); }, [loadProductos]);

  // Categorías y banners (una vez).
  useEffect(() => {
    catalogoApi.get<CatalogoCategoria[]>("/catalogo/categorias").then((r) => setCategorias(r.data)).catch(() => {});
    catalogoApi.get<Banner[]>("/catalogo/banners").then((r) => setBanners(r.data)).catch(() => {});
  }, []);

  // Marcas: siempre disponibles. Si hay categoría elegida, se acotan a ella.
  useEffect(() => {
    catalogoApi
      .get<CatalogoMarca[]>("/catalogo/marcas", { params: { categoria_id: catFilter ?? undefined } })
      .then((r) => setMarcas(r.data))
      .catch(() => setMarcas([]));
  }, [catFilter]);

  // Al cambiar categoría: resetear marca (puede no existir en la nueva) y página.
  const handleCategoria = (id: number | null) => {
    setCatFilter(id);
    setMarcaFilter(null);
    setPage(1);
  };
  const handleMarca = (m: string | null) => { setMarcaFilter(m); setPage(1); };
  useEffect(() => { setPage(1); }, [search]);

  // Paginación (cliente).
  const totalPages = Math.max(1, Math.ceil(productos.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => productos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [productos, page],
  );
  const goToPage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="min-h-screen bg-sand/40">
      <Header totalItems={carrito.totalItems} onCartClick={() => setDrawerOpen(true)} searchValue={search} onSearchChange={setSearch} />

      <main className="mx-auto max-w-6xl px-4 py-6">
        {banners.length > 0 && (
          <section className="mb-8 animate-fade-in">
            <BannerCarousel banners={banners} onImageClick={openLightbox} />
          </section>
        )}

        {/* Destacados (solo sin filtros) */}
        {sinFiltros && destacados.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-coral" />
              <h2 className="font-display text-xl font-bold text-ink">Productos destacados</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {destacados.map((p) => (
                <ProductoCard key={p.id} producto={p} onAdd={carrito.addItem} onShowDetail={setDetalle} featured />
              ))}
            </div>
          </section>
        )}

        {/* Filtros: categoría y marca (ambos siempre visibles) */}
        {categorias.length > 0 && (
          <section className="mb-3">
            <CategoryFilter categorias={categorias} selected={catFilter} onChange={handleCategoria} />
          </section>
        )}
        {marcas.length > 1 && (
          <section className="mb-5">
            <BrandFilter marcas={marcas} selected={marcaFilter} onChange={handleMarca} />
          </section>
        )}

        {/* Catálogo */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <LayoutGrid size={20} className="text-ocean" />
            <h2 className="font-display text-xl font-bold text-ink">
              {sinFiltros ? "Todos los productos" : "Resultados"}
            </h2>
          </div>

          {error ? (
            <div className="rounded-2xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
              <p className="text-sm text-danger">{error}</p>
              <button type="button" onClick={loadProductos} className="mt-3 rounded-full bg-ocean px-5 py-2 text-sm font-medium text-white">Reintentar</button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-ocean" /></div>
          ) : productos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Fish size={48} className="text-ink-faint/30" />
              <p className="text-sm text-ink-faint">No se encontraron productos{search ? ` para "${search}"` : ""}.</p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-ink-faint">
                {productos.length} producto{productos.length !== 1 ? "s" : ""}
                {totalPages > 1 ? ` · página ${page} de ${totalPages}` : ""}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {pageItems.map((p) => (
                  <ProductoCard key={p.id} producto={p} onAdd={carrito.addItem} onShowDetail={setDetalle} featured={p.destacado} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
            </>
          )}
        </section>
      </main>

      <Footer />

      <FloatingSocial />

      <CarritoDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} carrito={carrito} />

      {!carrito.isEmpty && !drawerOpen && (
        <button type="button" onClick={() => setDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-2xl bg-[#25d366] px-5 py-3.5 font-display text-sm font-bold text-white shadow-xl transition-all hover:bg-[#20bf5b] active:scale-95">
          <MessageCircle size={20} />Pedir ({carrito.totalItems})
        </button>
      )}

      {/* Detalle del producto */}
      <ProductDetailModal
        producto={detalle}
        onClose={() => setDetalle(null)}
        onAdd={carrito.addItem}
        onImageClick={openLightbox}
      />

      {/* Lightbox de imágenes */}
      <ImageLightbox src={lightbox?.src ?? null} alt={lightbox?.alt ?? ""} onClose={() => setLightbox(null)} />
    </div>
  );
}
