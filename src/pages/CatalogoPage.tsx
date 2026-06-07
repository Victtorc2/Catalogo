import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fish, MessageCircle, Flame, LayoutGrid } from "lucide-react";
import { catalogoApi } from "@/api/client";
import { useCarrito } from "@/hooks/useCarrito";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/catalogo/Hero";
import { BannerCarousel } from "@/components/catalogo/BannerCarousel";
import { CategoryFilter } from "@/components/catalogo/CategoryFilter";
import { BrandFilter } from "@/components/catalogo/BrandFilter";
import { ProductoCard } from "@/components/catalogo/ProductoCard";
import { ProductSection } from "@/components/catalogo/ProductSection";
import { Pagination } from "@/components/catalogo/Pagination";
import { CarritoDrawer } from "@/components/catalogo/CarritoDrawer";
import { ImageLightbox } from "@/components/catalogo/ImageLightbox";
import { ProductDetailModal } from "@/components/catalogo/ProductDetailModal";
import { FloatingSocial } from "@/components/catalogo/FloatingSocial";
import { Footer } from "@/components/catalogo/Footer";
import type { CatalogoProducto, CatalogoCategoria, CatalogoMarca, Paginated } from "@/types/producto";
import type { Banner } from "@/types/banner";

const PAGE_SIZE = 12;

export function CatalogoPage() {
  const carrito = useCarrito();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [productos, setProductos] = useState<CatalogoProducto[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [destacados, setDestacados] = useState<CatalogoProducto[]>([]);
  const [categorias, setCategorias] = useState<CatalogoCategoria[]>([]);
  const [marcas, setMarcas] = useState<CatalogoMarca[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [marcaFilter, setMarcaFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // La búsqueda de texto se aplica con un pequeño retraso (mientras se escribe);
  // los filtros de categoría/marca y la paginación se aplican al instante.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Imagen ampliada (lightbox) y producto en detalle.
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [detalle, setDetalle] = useState<CatalogoProducto | null>(null);
  const openLightbox = useCallback((src: string, alt: string) => setLightbox({ src, alt }), []);

  const catalogoRef = useRef<HTMLDivElement>(null);
  const scrollToCatalogo = () => catalogoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const sinFiltros = !debouncedSearch.trim() && catFilter === null && marcaFilter === null;

  // Productos (con filtros, paginados en el servidor) + destacados (sin filtros).
  const loadProductos = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [prod, dest] = await Promise.all([
        catalogoApi.get<Paginated<CatalogoProducto>>("/catalogo/productos", {
          params: {
            search: debouncedSearch.trim() || undefined,
            categoria_id: catFilter ?? undefined,
            marca: marcaFilter ?? undefined,
            page,
            page_size: PAGE_SIZE,
          },
        }),
        sinFiltros
          ? catalogoApi.get<Paginated<CatalogoProducto>>("/catalogo/productos", { params: { solo_destacados: true, page_size: 12 } })
          : Promise.resolve({ data: { items: [] as CatalogoProducto[] } as Paginated<CatalogoProducto> }),
      ]);
      setProductos(prod.data.items);
      setTotal(prod.data.total);
      setTotalPages(Math.max(1, prod.data.total_pages));
      setDestacados(dest.data.items);
    } catch { setError("No se pudo cargar el catálogo."); }
    finally { setLoading(false); }
  }, [debouncedSearch, catFilter, marcaFilter, sinFiltros, page]);

  useEffect(() => { void loadProductos(); }, [loadProductos]);

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
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  // ===== Showcase de destacados: SOLO los productos marcados como destacados.
  // Sin fallback: si no hay ninguno marcado, la sección no se muestra (antes
  // mostraba "los más recientes", que parecían destacados sin serlo).
  const destacadosTop = useMemo(() => destacados.slice(0, 8), [destacados]);

  // Paginación: el servidor devuelve solo la página actual; `total` y
  // `totalPages` vienen en la respuesta.
  const goToPage = (p: number) => { setPage(p); catalogoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-abyss text-ice">
      {/* Fondo global oceánico */}
      <div className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-abyss via-abyss to-abyss-deep" />
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(80%_50%_at_80%_0%,rgba(14,165,233,0.10),transparent_60%)]" />

      <Header totalItems={carrito.totalItems} onCartClick={() => setDrawerOpen(true)} searchValue={search} onSearchChange={setSearch} />

      {/* Hero solo cuando no hay búsqueda/filtros activos */}
      {sinFiltros && (
        <Hero
          onExplore={scrollToCatalogo}
          productCount={total}
          brandCount={marcas.length}
        />
      )}

      <main className="mx-auto max-w-6xl px-4 py-10">
        {banners.length > 0 && sinFiltros && (
          <section className="mb-12 animate-fade-in">
            <BannerCarousel banners={banners} onImageClick={openLightbox} />
          </section>
        )}

        {/* ===== Showcase: solo productos realmente marcados como destacados ===== */}
        {sinFiltros && !loading && destacadosTop.length > 0 && (
          <div className="space-y-14">
            <ProductSection
              id="destacados"
              icon={Flame}
              accent="strike"
              title="Productos destacados"
              subtitle="Selección élite del arsenal"
              productos={destacadosTop}
              badge="TOP"
              onAdd={carrito.addItem}
              onShowDetail={setDetalle}
            />
          </div>
        )}

        {/* ===== Filtros + catálogo completo ===== */}
        <div ref={catalogoRef} className={sinFiltros ? "mt-16 scroll-mt-20" : "scroll-mt-20"}>
          {categorias.length > 0 && (
            <section className="mb-3">
              <CategoryFilter categorias={categorias} selected={catFilter} onChange={handleCategoria} />
            </section>
          )}
          {marcas.length > 1 && (
            <section className="mb-6">
              <BrandFilter marcas={marcas} selected={marcaFilter} onChange={handleMarca} />
            </section>
          )}

          <section>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-electric/30 bg-electric/10 text-electric">
                <LayoutGrid size={22} />
              </span>
              <div>
                <h2 className="font-display text-xl font-extrabold tracking-tight text-ice sm:text-2xl">
                  {sinFiltros ? "Todo el arsenal" : "Resultados"}
                </h2>
                <p className="text-xs font-medium uppercase tracking-wider text-ice-faint">
                  {sinFiltros ? "Catálogo completo" : "Búsqueda filtrada"}
                </p>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-danger/30 bg-danger/5 px-6 py-12 text-center">
                <p className="text-sm text-danger">{error}</p>
                <button type="button" onClick={loadProductos} className="mt-4 rounded-xl bg-gradient-to-r from-electric to-electric-deep px-5 py-2.5 font-display text-sm font-bold text-white">Reintentar</button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-2xl border border-steel-light/40 bg-steel/40">
                    <div className="skeleton aspect-square" />
                    <div className="space-y-2 p-3.5">
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <div className="skeleton h-3 w-1/2 rounded" />
                      <div className="skeleton mt-3 h-6 w-1/3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : productos.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-steel-light/40 bg-steel/30 py-20 text-center">
                <Fish size={48} className="text-steel-light" />
                <p className="text-sm text-ice-faint">No se encontraron productos{search ? ` para "${search}"` : ""}.</p>
              </div>
            ) : (
              <>
                <p className="mb-5 text-sm text-ice-faint">
                  <span className="font-bold text-ice">{total}</span> producto{total !== 1 ? "s" : ""}
                  {totalPages > 1 ? ` · página ${page} de ${totalPages}` : ""}
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                  {productos.map((p) => (
                    <ProductoCard key={p.id} producto={p} onAdd={carrito.addItem} onShowDetail={setDetalle} featured={p.destacado} />
                  ))}
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />

      <FloatingSocial />

      <CarritoDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} carrito={carrito} />

      {!carrito.isEmpty && !drawerOpen && (
        <button type="button" onClick={() => setDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-2xl bg-[#25d366] px-5 py-3.5 font-display text-sm font-bold text-white shadow-[0_18px_40px_-12px_rgba(37,211,102,0.7)] transition-all hover:-translate-y-0.5 active:scale-95">
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
