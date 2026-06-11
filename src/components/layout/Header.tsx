import { useState } from "react";
import { Search, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

interface HeaderProps {
  totalItems: number;
  onCartClick: () => void;
  searchValue: string;
  onSearchChange: (v: string) => void;
}

export function Header({ totalItems, onCartClick, searchValue, onSearchChange }: HeaderProps) {
  const [mobileSearch, setMobileSearch] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-steel-light/40 bg-abyss">
      {/* Línea de glow superior */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-electric/60 to-transparent" />

      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3">
        <a href="/" className="flex min-w-0 shrink items-center" aria-label="Inicio">
          <Logo />
        </a>

        <div className="relative mx-4 hidden flex-1 sm:block">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ice-faint" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar cañas, carretes, señuelos, líneas…"
            className="w-full rounded-xl border border-steel-light/50 bg-steel/50 py-2.5 pl-10 pr-4 text-sm text-ice placeholder:text-ice-faint transition-all focus:border-electric/60 focus:bg-steel/70 focus:outline-none focus:ring-2 focus:ring-electric/25"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
          <button
            type="button"
            onClick={() => setMobileSearch(!mobileSearch)}
            className="rounded-xl p-2.5 text-ice-soft transition-colors hover:bg-steel/60 hover:text-ice sm:hidden"
          >
            {mobileSearch ? <X size={20} /> : <Search size={20} />}
          </button>
          <button
            type="button"
            onClick={onCartClick}
            className="relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-strike to-strike-deep px-4 py-2.5 font-display text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(249,115,22,0.8)] transition-all hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Mi Pedido</span>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-extrabold text-strike-deep">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {mobileSearch && (
        <div className="border-t border-steel-light/40 px-4 pb-3 pt-2 sm:hidden">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ice-faint" />
            <input
              type="search"
              autoFocus
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar productos…"
              className="w-full rounded-xl border border-steel-light/50 bg-steel/50 py-2.5 pl-10 pr-4 text-sm text-ice placeholder:text-ice-faint focus:border-electric/60 focus:bg-steel/70 focus:outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
}
