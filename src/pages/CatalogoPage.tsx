import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Fish, MessageCircle, LayoutGrid, Layers, ChevronLeft, ArrowUp, Check, ArrowDownUp, SlidersHorizontal, X } from "lucide-react";
import { catalogoApi } from "@/api/client";
import { useCarrito } from "@/hooks/useCarrito";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/catalogo/Hero";
import { BannerCarousel } from "@/components/catalogo/BannerCarousel";
import { CategoryFilter } from "@/components/catalogo/CategoryFilter";
import { BrandFilter } from "@/components/catalogo/BrandFilter";
import { ProductoCard } from "@/components/catalogo/ProductoCard";
import { ModeloCard } from "@/components/catalogo/ModeloCard";
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
  const [categorias, setCategorias] = useState<CatalogoCategoria[]>([]);
  const [marcas, setMarcas] = useState<CatalogoMarca[]>([]);
  const [modelos, setModelos] = useState<CatalogoModelo[]>([]);
  const [modelosLoading, setModelosLoading] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== Estado de navegación en la URL (links compartibles + botón "atrás") =====
  const [searchParams, setSearchParams] = useSearchParams();
  const vistaParam = searchParams.get("vista");
  const vista = vistaParam === "destacados" || vistaParam === "promociones" ? vistaParam : "todos";
  const [bannersLoading, setBannersLoading] = useState(true);
  const [bannersError, setBannersError] = useState(false);
  const catFilter = searchParams.get("cat") ? Number(searchParams.get("cat")) : null;
  const marcaFilter = searchParams.get("marca");
  const modeloFilter = searchParams.get("modelo");
  const orden = searchParams.get("orden") || "destacados";
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const qParam = searchParams.get("q") || "";

  // Texto de búsqueda: estado local (para que escribir sea fluido) + debounce.
  const [search, setSearch] = useState(qParam);
  const debouncedSearch = qParam;

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
    vista === "todos" && marcaFilter !== null && modeloFilter === null && !debouncedSearch.trim();
  // Solo mostramos la grilla de modelos si la marca realmente tiene modelos
  // (o aún se están cargando). Si no tiene ninguno, caemos a sus productos.
  const mostrarModelos = enVistaModelos && (modelosLoading || modelos.length > 0);

  // La URL es la fuente de los filtros, también al usar atrás/adelante.
  useEffect(() => { setSearch(qParam); }, [qParam]);
  useEffect(() => {
    if (search.trim() === qParam) return;
    const timer = window.setTimeout(() => updateParams((p) => {
      if (search.trim()) p.set("q", search.trim()); else p.delete("q");
      p.delete("page"); p.delete("modelo");
      if (p.get("vista") === "promociones") p.delete("vista");
    }, { replace: true }), 350);
    return () => window.clearTimeout(timer);
  }, [search, qParam, updateParams]);

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

  const filtersRef = useRef<HTMLElement>(null);
  const catalogoRef = useRef<HTMLDivElement>(null);
  const scrollToCatalogo = () => catalogoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const focusFilters = () => {
    if (vista === "promociones") updateParams(p => p.delete("vista"));
    filtersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    filtersRef.current?.focus({ preventScroll: true });
  };
  const submitSearch = () => {
    updateParams(p => {
      if (search.trim()) p.set("q", search.trim()); else p.delete("q");
      p.delete("page"); p.delete("modelo");
      if (p.get("vista") === "promociones") p.delete("vista");
    }, { replace: true });
    catalogoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const clearFilters = () => {
    setSearch("");
    updateParams(p => { ["q", "cat", "marca", "modelo", "page"].forEach(key => p.delete(key)); });
  };
  const activeFilters = Number(!!qParam) + Number(catFilter !== null) + Number(!!marcaFilter) + Number(!!modeloFilter);
  const productRequest = useRef(0);
  const sinFiltros = !debouncedSearch.trim() && catFilter === null && marcaFilter === null;

  // Productos (con filtros, paginados en el servidor) + destacados (sin filtros).
  const loadProductos = useCallback(async () => {
    const request = ++productRequest.current;
    // En la vista de modelos no se cargan productos: se muestran los modelos.
    if (mostrarModelos || vista === "promociones") {
      setProductos([]); setTotal(0); setTotalPages(1); setLoading(false);
      return;
    }
    setLoading(true); setError(null);
    try {
      const prod = await catalogoApi.get<Paginated<CatalogoProducto>>("/catalogo/productos", {
          params: {
            solo_destacados: vista === "destacados" || undefined,
            search: debouncedSearch.trim() || undefined,
            categoria_id: catFilter ?? undefined,
            marca: marcaFilter ?? undefined,
            modelo: modeloFilter ?? undefined,
            orden: orden !== "destacados" ? orden : undefined,
            page,
            page_size: PAGE_SIZE,
          },
        });
      if (request !== productRequest.current) return;
      setProductos(prod.data.items);
      setTotal(prod.data.total);
      setTotalPages(Math.max(1, prod.data.total_pages));
    } catch { if (request === productRequest.current) setError("No se pudo cargar el catálogo."); }
    finally { if (request === productRequest.current) setLoading(false); }
  }, [debouncedSearch, catFilter, marcaFilter, modeloFilter, orden, sinFiltros, page, mostrarModelos, vista]);

  useEffect(() => { void loadProductos(); return () => { productRequest.current += 1; }; }, [loadProductos]);

  // Modelos de la marca seleccionada (paso intermedio Marca → Modelo). Solo se
  // cargan cuando hay marca y no hay búsqueda de texto activa.
  useEffect(() => {
    if (marcaFilter === null || debouncedSearch.trim()) { setModelos([]); setModelosLoading(false); return; }
    let active = true;
    setModelos([]);
    setModelosLoading(true);
    catalogoApi
      .get<CatalogoModelo[]>("/catalogo/modelos", {
        params: { marca: marcaFilter, categoria_id: catFilter ?? undefined },
      })
      .then((r) => { if (active) setModelos(r.data); })
      .catch(() => { if (active) setModelos([]); })
      .finally(() => { if (active) setModelosLoading(false); });
    return () => { active = false; };
  }, [marcaFilter, catFilter, debouncedSearch]);

  // Categorías y banners (una vez).
  useEffect(() => {
    catalogoApi.get<CatalogoCategoria[]>("/catalogo/categorias").then((r) => setCategorias(r.data)).catch(() => {});

  }, []);

  const loadBanners = useCallback(async () => {
    setBannersLoading(true); setBannersError(false);
    try { setBanners((await catalogoApi.get<Banner[]>("/catalogo/banners")).data); }
    catch { setBannersError(true); }
    finally { setBannersLoading(false); }
  }, []);
  useEffect(() => { void loadBanners(); }, [loadBanners]);

  // Marcas: siempre disponibles. Si hay categoría elegida, se acotan a ella.
  useEffect(() => {
    let active = true;
    catalogoApi
      .get<CatalogoMarca[]>("/catalogo/marcas", { params: { categoria_id: catFilter ?? undefined } })
      .then((r) => { if (active) setMarcas(r.data); })
      .catch(() => { if (active) setMarcas([]); });
    return () => { active = false; };
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

  // Retroceder un nivel de filtro: marca → categoría → búsqueda.
  const goBack = () => {
    if (marcaFilter) { handleMarca(null); return; }
    if (catFilter != null) { handleCategoria(null); return; }
    if (debouncedSearch.trim()) setSearch("");
  };

  // Al cambiar de filtro/búsqueda, volver al inicio de la página. Evita que al
  // filtrar (se ocultan Hero/banners/destacados) el navegador deje la vista
  // pegada al footer. useLayoutEffect corrige antes de pintar (sin salto visible).
  const firstFilterRender = useRef(true);
  const filterSig = `${catFilter}|${marcaFilter}|${modeloFilter}|${debouncedSearch.trim()}`;
  useLayoutEffect(() => {
    if (firstFilterRender.current) { firstFilterRender.current = false; return; }
    window.scrollTo({ top: 0 });
  }, [filterSig]);



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
    <div className="relative min-h-screen overflow-x-clip bg-abyss text-ice">
      {/* Fondo global oceánico */}
      <div className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-abyss via-abyss to-abyss-deep" />
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(80%_50%_at_80%_0%,rgba(14,165,233,0.10),transparent_60%)]" />

      <Header totalItems={carrito.totalItems} onCartClick={() => setDrawerOpen(true)} searchValue={search} onSearchChange={setSearch} onFilterClick={focusFilters} onSearchSubmit={submitSearch} activeFilters={activeFilters} />

      {/* Hero solo cuando no hay búsqueda/filtros activos */}
      {sinFiltros && vista === "todos" && (
        <Hero
          onExplore={scrollToCatalogo}
          productCount={total}
          brandCount={marcas.length}
        />
      )}

      <main className="mx-auto max-w-6xl px-4 py-10">
        <nav aria-label="Secciones del catálogo" className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-steel-light bg-steel/40 p-2">
          {([{ key: "todos", label: "Todos los productos" }, { key: "destacados", label: "Destacados" }, { key: "promociones", label: "Promociones" }] as const).map(item => (
            <button key={item.key} type="button" aria-current={vista === item.key ? "page" : undefined}
              onClick={() => updateParams(p => { if (item.key === "todos") p.delete("vista"); else p.set("vista", item.key); p.delete("page"); })}
              className={"min-h-12 flex-1 whitespace-nowrap rounded-xl px-4 text-sm font-bold transition-colors " + (vista === item.key ? "bg-sky-100 text-slate-900" : "text-ice-soft hover:bg-white/10")}>
              {item.label}
            </button>
          ))}
        </nav>
        {vista === "promociones" ? (
          <section aria-labelledby="promociones-title" className="rounded-2xl border border-steel-light bg-steel/30 p-5">
            <h2 id="promociones-title" className="font-display text-2xl font-bold">Promociones</h2>
            <p className="mb-6 mt-2 text-sm text-ice-soft">Conoce las promociones publicadas por nuestra tienda.</p>
            {bannersLoading ? <p role="status">Cargando promociones…</p> : bannersError ? <div role="alert"><p>No se pudieron cargar las promociones.</p><button type="button" onClick={loadBanners} className="mt-4 rounded-lg bg-electric-deep px-4 py-3 text-white">Reintentar</button></div> : banners.length ? <BannerCarousel banners={banners} onImageClick={openLightbox} /> : <p className="py-10 text-center text-ice-soft">Por ahora no hay promociones publicadas. Puedes explorar todos nuestros productos o los destacados.</p>}
          </section>
        ) : <>
        {/* ===== Filtros + catálogo completo ===== */}
        <div ref={catalogoRef} className="scroll-mt-52">
          {/* Flecha para retroceder un nivel de filtro (la vista de colores tiene la suya). */}
          {!sinFiltros && !modeloFilter && (
            <button
              type="button"
              onClick={goBack}
              className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-steel-light/50 bg-steel/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ice-soft transition-colors hover:border-electric/50 hover:text-electric"
            >
              <ChevronLeft size={15} /> Volver
            </button>
          )}
          <section ref={filtersRef} tabIndex={-1} aria-labelledby="filter-title" className="catalog-filters mb-8 scroll-mt-52 rounded-2xl border border-sky-300/30 bg-[#123044] p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 id="filter-title" className="flex items-center gap-2 font-display text-lg font-bold"><SlidersHorizontal size={21} className="text-sky-200" /> Encuentra tu equipo</h2>
              <p className="mt-1 text-sm text-ice-soft">Combina nombre, marca y modelo; por ejemplo: señuelo Rapala X-Rap.</p></div>
              {activeFilters > 0 && <button type="button" onClick={clearFilters} className="min-h-11 rounded-lg border border-white/25 px-3 text-sm font-semibold text-white">Limpiar filtros ({activeFilters})</button>}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <CategoryFilter categorias={categorias} selected={catFilter} onChange={handleCategoria} />
              <BrandFilter marcas={marcas} selected={marcaFilter} onChange={handleMarca} />
            </div>
            {categorias.length > 0 && <div aria-label="Categorías rápidas" className="mt-4 flex flex-wrap gap-2">
              <button type="button" aria-pressed={catFilter === null} onClick={() => handleCategoria(null)} className={"category-chip " + (catFilter === null ? "is-selected" : "")}>Todas las categorías</button>
              {categorias.slice(0, 8).map(c => <button key={c.id} type="button" aria-pressed={catFilter === c.id} onClick={() => handleCategoria(c.id)} className={"category-chip " + (catFilter === c.id ? "is-selected" : "")}>{c.nombre} <span className="opacity-75">{c.cantidad_productos}</span></button>)}
            </div>}
            {activeFilters > 0 && <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4" aria-label="Filtros activos">
              {qParam && <button type="button" onClick={() => setSearch("")} className="active-filter">Búsqueda: {qParam} <X size={15} /></button>}
              {catFilter !== null && <button type="button" onClick={() => handleCategoria(null)} className="active-filter">{categorias.find(c => c.id === catFilter)?.nombre ?? "Categoría"} <X size={15} /></button>}
              {marcaFilter && <button type="button" onClick={() => handleMarca(null)} className="active-filter">{marcaFilter} <X size={15} /></button>}
              {modeloFilter && <button type="button" onClick={() => handleModelo(null)} className="active-filter">{modeloFilter} <X size={15} /></button>}
            </div>}
          </section>

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
                        {vista === "destacados" ? "Productos destacados" : sinFiltros ? "Todos los productos" : "Resultados"}
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
                    <p className="text-sm text-ice-soft">No se encontraron productos{search ? ` para "${search}"` : ""}.</p>
                    <p className="text-sm text-ice-soft">Prueba otra palabra o elimina los filtros para ver más opciones.</p>
                    <button type="button" onClick={clearFilters} className="mt-2 min-h-11 rounded-xl bg-electric-deep px-5 font-semibold text-white">Ver todos los productos</button>
                  </div>
                ) : (
                  <>
                    <div role="status" aria-live="polite" className="mb-5 flex flex-wrap items-center justify-between gap-3">
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
        </>}
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
        <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-electric/40 bg-abyss/95 px-4 py-3 text-sm font-semibold text-ice shadow-[0_18px_40px_-12px_rgba(14,165,233,0.6)] animate-slide-up">
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
