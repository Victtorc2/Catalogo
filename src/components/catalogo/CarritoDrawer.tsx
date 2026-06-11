import { X, Minus, Plus, Trash2, MessageCircle, ShoppingBag } from "lucide-react";
import { UPLOADS_BASE } from "@/api/client";
import type { useCarrito } from "@/hooks/useCarrito";

type Cart = ReturnType<typeof useCarrito>;
function toNum(v: string | number) { return typeof v === "string" ? parseFloat(v) : v; }

export function CarritoDrawer({ open, onClose, carrito }: { open: boolean; onClose: () => void; carrito: Cart }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-50 bg-abyss-deep/80" onClick={onClose} />}
      <div className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-steel-light/40 bg-steel shadow-[0_0_90px_-10px_rgba(0,0,0,0.9)] transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-steel-light/40 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-strike" />
            <h2 className="font-display text-lg font-extrabold text-ice">Mi pedido</h2>
            {carrito.totalItems > 0 && <span className="rounded-lg bg-strike/15 px-2 py-0.5 text-xs font-bold text-strike">{carrito.totalItems}</span>}
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-ice-faint transition-colors hover:bg-abyss/60 hover:text-ice"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto dark-scroll px-5 py-4">
          {carrito.isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingBag size={48} className="text-steel-light" />
              <p className="text-sm text-ice-faint">Tu lista está vacía.<br />¡Agrega productos del catálogo!</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {carrito.items.map(item => {
                const precio = toNum(item.producto.precio_venta);
                return (
                  <li key={item.producto.id} className="flex items-center gap-3 rounded-xl border border-steel-light/40 bg-abyss/40 p-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-abyss-deep">
                      {item.producto.imagen_url
                        ? <img src={`${UPLOADS_BASE}/${item.producto.imagen_url}`} alt="" className="h-full w-full object-cover" />
                        : <div className="flex h-full items-center justify-center text-steel-light"><ShoppingBag size={20} /></div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ice">{item.producto.nombre}</p>
                      <p className="text-xs text-ice-faint">S/ {precio.toFixed(2)} c/u</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <button type="button" onClick={() => carrito.setQuantity(item.producto.id, item.cantidad - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-steel-light/50 text-ice-soft transition-colors hover:border-electric/50 hover:text-electric"><Minus size={14} /></button>
                        <span className="w-6 text-center text-sm font-bold tabular-nums text-ice">{item.cantidad}</span>
                        <button type="button" onClick={() => carrito.setQuantity(item.producto.id, item.cantidad + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-steel-light/50 text-ice-soft transition-colors hover:border-electric/50 hover:text-electric"><Plus size={14} /></button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold tabular-nums text-electric">S/ {(precio * item.cantidad).toFixed(2)}</span>
                      <button type="button" onClick={() => carrito.removeItem(item.producto.id)} className="rounded-md p-1 text-ice-faint transition-colors hover:text-danger"><Trash2 size={14} /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!carrito.isEmpty && (
          <div className="border-t border-steel-light/40 bg-abyss/30 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-ice-soft">Total aproximado</span>
              <span className="font-display text-xl font-extrabold text-ice">S/ {carrito.totalPrice.toFixed(2)}</span>
            </div>
            <a href={carrito.whatsappUrl()} target="_blank" rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25d366] px-6 py-3.5 font-display text-base font-bold text-white shadow-[0_18px_40px_-14px_rgba(37,211,102,0.7)] transition-all hover:bg-[#20bf5b] active:scale-[0.98]">
              <MessageCircle size={22} />Pedir por WhatsApp
            </a>
            <button type="button" onClick={carrito.clear} className="mt-2 w-full rounded-xl py-2 text-center text-sm font-medium text-ice-faint transition-colors hover:text-danger">Vaciar lista</button>
          </div>
        )}
      </div>
    </>
  );
}
