import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Fish, MessageCircle, Flame, LayoutGrid, Layers, ChevronLeft, ArrowUp, Check, ArrowDownUp } from "lucide-react";
import { catalogoApi } from "@/api/client";
import { useCarrito } from "@/hooks/useCarrito";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/catalogo/Hero";
import { BannerCarousel } from "@/components/catalogo/BannerCarousel";
import { CategoryFilter } from "@/components/catalogo/CategoryFilter";
import { BrandFilter } from "@/components/catalogo/BrandFilter";
import { ProductoCard } from "@/components/catalogo/ProductoCard";
import { ModeloCard } from "@/components/catalogo/ModeloCard";
import { ProductSection } from "@/components/catalogo/ProductSection";
import { Pagination } from "@/components/catalogo/Pagination";
import { CarritoDrawer } from "@/components/catalogo/CarritoDrawer";
import { ImageLightbox } from "@/components/catalogo/ImageLightbox";
import { ProductDetailModal } from "@/components/catalogo/ProductDetailModal";
import { FloatingSocial } from "@/components/catalogo/FloatingSocial";
import { Footer } from "@/components/catalogo/Footer";
import type { CatalogoProducto, CatalogoCategoria, CatalogoMarca, CatalogoModelo, Paginated } from "@/types/producto";
import type { Banner } from "@/types/banner";

const PAGE_SIZE = 12;

/** Opciones de ordenamiento (coinciden con el backend). */
const ORDEN_OPCIONES = [
  { value: "destacados", label: "Recomendado" },
  { value: "precio_asc", label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre (A-Z)" },
  { value: "reciente", label: "Novedades" },
];

export function CatalogoPage() {
  const carrito = useCarrito();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [productos, setProductos] = useState<CatalogoProducto[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [destacados, setDestacados] = useState<CatalogoProducto[]>([]);
  const [categorias, setCategorias] = useState<CatalogoCategoria[]>([]);
  const [marcas, setMarcas] = useState<CatalogoMarca[]>([]);
  const [modelos, setModelos] = useState<CatalogoModelo[]>([]);
  const [modelosLoading, setModelosLoading] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== Estado de navegación en la URL (links compartibles + botón "atrás") =====
  const [searchParams, setSearchParams] = useSearchParams();
  const catFilter = searchParams.get("cat") ? Number(searchParams.get("cat")) : null;
  const marcaFilter = searchParams.get("marca");
  const modeloFilter = searchParams.get("modelo");
  const orden = searchParams.get("orden") || "destacados";
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const qParam = searchParams.get("q") || "";

  // Texto de búsqueda: estado local (para que escribir sea fluido) + debounce.
  const [search, setSearch] = useState(qParam);
  const [debouncedSearch, setDebouncedSearch] = useState(qParam);

  const updateParams = useCallback(
    (mutate: (p: URLSearchParams) => void, opts?: { replace?: boolean }) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        mutate(next);
        return next;
      }, { replace: opts?.replace });
    },
    [setSearchParams],
  );

  // Vista de MODELOS: tras elegir una marca (sin buscar) y antes de elegir un
  // modelo, se muestran los modelos de esa marca en lugar de los productos.
  const enVistaModelos =
    marcaFilter !== null && modeloFilter === null && !debouncedSearch.trim();
  // Solo mostramos la grilla de modelos si la marca realmente tiene modelos
  // (o aún se están cargando). Si no tiene ninguno, caemos a sus productos.
  const mostrarModelos = enVistaModelos && (modelosLoading || modelos.length > 0);

  // La búsqueda de texto se aplica con un pequeño retraso (mientras se escribe).
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Refleja la búsqueda (debounced) en la URL y reinicia página/modelo. El
  // guard evita reescrituras en el montaje y bucles.
  useEffect(() => {
    if (debouncedSearch === qParam) return;
    updateParams((p) => {
      if (debouncedSearch.trim()) p.set("q", debouncedSearch.trim());
      else p.delete("q");
      p.delete("page");
      p.delete("modelo");
    }, { replace: true });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Imagen ampliada (lightbox) y producto en detalle.
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [detalle, setDetalle] = useState<CatalogoProducto | null>(null);
  const openLightbox = useCallback((src: string, alt: string) => setLightbox({ src, alt }), []);

  // Toast de confirmación al agregar al carrito.
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 2200);
  }, []);
  const handleAdd = useCallback(
    (p: CatalogoProducto, cantidad: number = 1) => {
      carrito.addItem(p, cantidad);
      showToast(cantidad > 1 ? `${cantidad}× ${p.nombre} agregado` : `${p.nombre} agregado`);
    },
    [carrito, showToast],
  );

  // Botón "volver arriba": aparece tras desplazarse hacia abajo.
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const catalogoRef = useRef<HTMLDivElement>(null);
  const scrollToCatalogo = () => catalogoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const sinFiltros = !debouncedSearch.trim() && catFilter === null && marcaFilter === null;

  // Productos (con filtros, paginados en el servidor) + destacados (sin filtros).
  const loadProductos = useCallback(async () => {
    // En la vista de modelos no se cargan productos: se muestran los modelos.
    if (mostrarModelos) {
      setProductos([]); setTotal(0); setTotalPages(1); setLoading(false);
      return;
    }
    setLoading(true); setError(null);
    try {
      const [prod, dest] = await Promise.all([
        catalogoApi.get<Paginated<CatalogoProducto>>("/catalogo/productos", {
          params: {
            search: debouncedSearch.trim() || undefined,
            categoria_id: catFilter ?? undefined,
            marca: marcaFilter ?? undefined,
            modelo: modeloFilter ?? undefined,
            orden: orden !== "destacados" ? orden : undefined,
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
  }, [debouncedSearch, catFilter, marcaFilter, modeloFilter, orden, sinFiltros, page, mostrarModelos]);

  useEffect(() => { void loadProductos(); }, [loadProductos]);

  // Modelos de la marca seleccionada (paso intermedio Marca → Modelo). Solo se
  // cargan cuando hay marca y no hay búsqueda de texto activa.
  useEffect(() => {
    if (marcaFilter === null || debouncedSearch.trim()) { setModelos([]); return; }
    setModelosLoading(true);
    catalogoApi
      .get<CatalogoModelo[]>("/catalogo/modelos", {
        params: { marca: marcaFilter, categoria_id: catFilter ?? undefined },
      })
      .then((r) => setModelos(r.data))
      .catch(() => setModelos([]))
      .finally(() => setModelosLoading(false));
  }, [marcaFilter, catFilter, debouncedSearch]);

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

  // Al cambiar categoría: resetear marca (puede no existir en la nueva), modelo
  // y página. Cada handler escribe en la URL (estado compartible / atrás).
  const handleCategoria = (id: number | null) =>
    updateParams((p) => {
      if (id == null) p.delete("cat"); else p.set("cat", String(id));
      p.delete("marca"); p.delete("modelo"); p.delete("page");
    });
  // Al cambiar marca: resetear el modelo (se vuelve a la vista de modelos).
  const handleMarca = (m: string | null) =>
    updateParams((p) => {
      if (!m) p.delete("marca"); else p.set("marca", m);
      p.delete("modelo"); p.delete("page");
    });
  const handleModelo = (m: string | null) =>
    updateParams((p) => {
      if (!m) p.delete("modelo"); else p.set("modelo", m);
      p.delete("page");
    });
  const handleOrden = (o: string) =>
    updateParams((p) => {
      if (o === "destacados") p.delete("orden"); else p.set("orden", o);
      p.delete("page");
    });

  // ===== Showcase de destacados: SOLO los productos marcados como destacados.
  const destacadosTop = useMemo(() => destacados.slice(0, 8), [destacados]);

  // Paginación: el servidor devuelve solo la página actual.
  const goToPage = (p: number) => {
    updateParams((prev) => prev.set("page", String(p)));
    catalogoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Selector de orden reutilizado en las cabeceras de listado.
  const ordenSelect = (
    <label className="flex shrink-0 items-center gap-1.5 text-xs text-ice-faint">
      <ArrowDownUp size={14} className="text-electric" />
      <select
        value={orden}
        onChange={(e) => handleOrden(e.target.value)}
        className="rounded-lg border border-steel-light/50 bg-steel/60 px-2.5 py-1.5 text-xs font-semibold text-ice-soft focus:border-electric/60 focus:outline-none"
        aria-label="Ordenar productos"
      >
        {ORDEN_OPCIONES.map((o) => (
          <option key={o.value} value={o.value} className="bg-steel text-ice">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );

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
              onAdd={handleAdd}
              onShowDetail={setDetalle}
            />
          </div>
        )}

        {/* ===== Filtros + catálogo completo ===== */}
        <div ref={catalogoRef} className={sinFiltros ? "mt-16 scroll-mt-20" : "scroll-mt-20"}>
          {(categorias.length > 0 || marcas.length > 0) && (
            <section className="mb-6 flex flex-wrap items-center gap-3">
              {categorias.length > 0 && (
                <CategoryFilter categorias={categorias} selected={catFilter} onChange={handleCategoria} />
              )}
              {marcas.length > 0 && (
                <BrandFilter marcas={marcas} selected={marcaFilter} onChange={handleMarca} />
              )}
            </section>
          )}

          <section>
            {mostrarModelos ? (
              <>
                {/* ===== Encabezado de la vista de MODELOS ===== */}
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-electric/30 bg-electric/10 text-electric">
                    <Layers size={22} />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-extrabold tracking-tight text-ice sm:text-2xl">
                      Modelos {marcaFilter}
                    </h2>
                    <p className="text-xs font-medium uppercase tracking-wider text-ice-faint">
                      Elige un modelo para ver sus colores
                    </p>
                  </div>
                </div>

                {modelosLoading ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="overflow-hidden rounded-2xl border border-steel-light/40 bg-steel/40">
                        <div className="skeleton aspect-square" />
                        <div className="space-y-2 p-3.5">
                          <div className="skeleton h-4 w-3/4 rounded" />
                          <div className="skeleton mt-3 h-6 w-1/3 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="mb-5 text-sm text-ice-faint">
                      <span className="font-bold text-ice">{modelos.length}</span> modelo{modelos.length !== 1 ? "s" : ""}
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                      {modelos.map((m) => (
                        <ModeloCard key={m.modelo} modelo={m} onSelect={handleModelo} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {/* ===== Encabezado: colores de un modelo, o catálogo/resultados ===== */}
                {modeloFilter ? (
                  <div className="mb-5">
                    <button
                      type="button"
                      onClick={() => handleModelo(null)}
                      className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-steel-light/50 bg-steel/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ice-soft transition-colors hover:border-electric/50 hover:text-electric"
                    >
                      <ChevronLeft size={15} /> Modelos de {marcaFilter}
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-electric/30 bg-electric/10 text-electric">
                        <LayoutGrid size={22} />
                      </span>
                      <div>
                        <h2 className="font-display text-xl font-extrabold tracking-tight text-ice sm:text-2xl">
                          {modeloFilter}
                        </h2>
                        <p className="text-xs font-medium uppercase tracking-wider text-ice-faint">
                          Colores disponibles
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
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
                )}

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
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-ice-faint">
                        <span className="font-bold text-ice">{total}</span> {modeloFilter ? "color" : "producto"}{total !== 1 ? (modeloFilter ? "es" : "s") : ""}
                        {totalPages > 1 ? ` · página ${page} de ${totalPages}` : ""}
                      </p>
                      {ordenSelect}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                      {productos.map((p) => (
                        <ProductoCard key={p.id} producto={p} onAdd={handleAdd} onShowDetail={setDetalle} featured={p.destacado} />
                      ))}
                    </div>
                    <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
                  </>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />

      <FloatingSocial />

      <CarritoDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} carrito={carrito} />

      {/* Volver arriba (se apila sobre el botón "Pedir" cuando este está visible) */}
      {showTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Volver arriba"
          className={`fixed right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-electric/40 bg-abyss/90 text-electric shadow-[0_10px_28px_-10px_rgba(14,165,233,0.8)] transition-all hover:bg-electric hover:text-white active:scale-95 ${
            !carrito.isEmpty && !drawerOpen ? "bottom-24" : "bottom-6"
          }`}
        >
          <ArrowUp size={20} />
        </button>
      )}

      {!carrito.isEmpty && !drawerOpen && (
        <button type="button" onClick={() => setDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-2xl bg-[#25d366] px-5 py-3.5 font-display text-sm font-bold text-white shadow-[0_18px_40px_-12px_rgba(37,211,102,0.7)] transition-all hover:-translate-y-0.5 active:scale-95">
          <MessageCircle size={20} />Pedir ({carrito.totalItems})
        </button>
      )}

      {/* Toast de confirmación al agregar al carrito */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-electric/40 bg-abyss/95 px-4 py-3 text-sm font-semibold text-ice shadow-[0_18px_40px_-12px_rgba(14,165,233,0.6)] animate-slide-up">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-white">
            <Check size={13} strokeWidth={3} />
          </span>
          {toastMsg}
        </div>
      )}

      {/* Detalle del producto */}
      <ProductDetailModal
        producto={detalle}
        onClose={() => setDetalle(null)}
        onAdd={handleAdd}
        onImageClick={openLightbox}
      />

      {/* Lightbox de imágenes */}
      <ImageLightbox src={lightbox?.src ?? null} alt={lightbox?.alt ?? ""} onClose={() => setLightbox(null)} />
    </div>
  );
}
