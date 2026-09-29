import { Search, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

interface HeaderProps {
  totalItems: number;
  onCartClick: () => void;
  searchValue: string;
  onSearchChange: (v: string) => void;
  onFilterClick: () => void;
  onSearchSubmit: () => void;
  activeFilters: number;
}

export function Header({ totalItems, onCartClick, searchValue, onSearchChange, onFilterClick, onSearchSubmit, activeFilters }: HeaderProps) {
  return (
    <header className="catalog-header sticky top-0 z-40 border-b border-white/10 bg-abyss">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:gap-5">
        <a href="/" className="min-w-0 flex-1 sm:flex-none" aria-label="Fishing and More, inicio"><Logo /></a>
        <form role="search" onSubmit={(e) => { e.preventDefault(); onSearchSubmit(); }}
          className="order-3 flex w-full items-center rounded-xl bg-white p-1 shadow-sm sm:order-none sm:w-auto sm:flex-1">
          <Search size={20} aria-hidden="true" className="ml-3 shrink-0 text-slate-500" />
          <label htmlFor="catalog-search" className="sr-only">Buscar productos por nombre, marca o modelo</label>
          <input id="catalog-search" type="search" value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)} placeholder="Buscar productos, marcas…"
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-500 focus:outline-none" />
          {searchValue && <button type="button" onClick={() => onSearchChange("")} aria-label="Borrar búsqueda" className="rounded-lg p-2.5 text-slate-600"><X size={18} /></button>}
          <button type="submit" className="rounded-lg bg-electric-deep px-3 py-2.5 text-sm font-bold text-white">Buscar</button>
        </form>
        <button type="button" onClick={onCartClick} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm font-semibold text-white">
          <ShoppingBag size={19} /><span>Mi pedido</span><span className="rounded-full bg-strike px-1.5 text-xs text-white">{totalItems}</span>
        </button>
      </div>
      <div className="border-t border-white/10">
        <nav aria-label="Accesos al catálogo" className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
          <button type="button" onClick={onFilterClick} className="flex min-h-10 items-center gap-2 rounded-lg bg-electric/15 px-3 text-sm font-bold text-sky-200">
            <SlidersHorizontal size={17} /> Categorías y filtros {activeFilters > 0 && <span className="rounded-full bg-electric-deep px-2 text-white">{activeFilters}</span>}
          </button>
          <span className="hidden text-xs text-ice-soft sm:block">Elige · Agrega · Pide por WhatsApp</span>
        </nav>
      </div>
    </header>
  );
}
