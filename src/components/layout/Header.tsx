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
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3">
        <a href="/" className="flex min-w-0 shrink items-center" aria-label="Inicio">
          <Logo />
        </a>
        <div className="relative mx-4 hidden flex-1 sm:block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input type="search" value={searchValue} onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar anzuelos, tanzas, señuelos…"
            className="w-full rounded-full border border-line bg-sand/50 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint transition-all focus:border-ocean focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean/20" />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
          <button type="button" onClick={() => setMobileSearch(!mobileSearch)}
            className="rounded-full p-2 text-ink-soft transition-colors hover:bg-sand sm:hidden">
            {mobileSearch ? <X size={20} /> : <Search size={20} />}
          </button>
          <button type="button" onClick={onCartClick}
            className="relative flex items-center gap-2 rounded-full bg-coral px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-coral/90 active:scale-[0.97]">
            <ShoppingBag size={18} /><span className="hidden sm:inline">Mi Pedido</span>
            {totalItems > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-coral">{totalItems}</span>}
          </button>
        </div>
      </div>
      {mobileSearch && (
        <div className="border-t border-line px-4 pb-3 pt-2 sm:hidden">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input type="search" autoFocus value={searchValue} onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar productos…"
              className="w-full rounded-full border border-line bg-sand/50 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-ocean focus:bg-white focus:outline-none" />
          </div>
        </div>
      )}
    </header>
  );
}
