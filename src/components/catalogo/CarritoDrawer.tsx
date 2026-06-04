import { X, Minus, Plus, Trash2, MessageCircle, ShoppingBag } from "lucide-react";
import { UPLOADS_BASE } from "@/api/client";
import type { useCarrito } from "@/hooks/useCarrito";

type Cart = ReturnType<typeof useCarrito>;
function toNum(v: string | number) { return typeof v === "string" ? parseFloat(v) : v; }

export function CarritoDrawer({ open, onClose, carrito }: { open: boolean; onClose: () => void; carrito: Cart }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" onClick={onClose} />}
      <div className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-coral" />
            <h2 className="font-display text-lg font-bold text-ink">Mi pedido</h2>
            {carrito.totalItems > 0 && <span className="rounded-full bg-coral/10 px-2 py-0.5 text-xs font-semibold text-coral">{carrito.totalItems}</span>}
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-ink-faint hover:bg-sand"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {carrito.isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingBag size={48} className="text-ink-faint/30" />
              <p className="text-sm text-ink-faint">Tu lista está vacía.<br />¡Agrega productos del catálogo!</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {carrito.items.map(item => {
                const precio = toNum(item.producto.precio_venta);
                return (
                  <li key={item.producto.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-sand">
                      {item.producto.imagen_url
                        ? <img src={`${UPLOADS_BASE}/${item.producto.imagen_url}`} alt="" className="h-full w-full object-cover" />
                        : <div className="flex h-full items-center justify-center text-ink-faint/30"><ShoppingBag size={20} /></div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{item.producto.nombre}</p>
                      <p className="text-xs text-ink-faint">S/ {precio.toFixed(2)} c/u</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <button type="button" onClick={() => carrito.setQuantity(item.producto.id, item.cantidad - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink-soft hover:bg-sand"><Minus size={14} /></button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.cantidad}</span>
                        <button type="button" onClick={() => carrito.setQuantity(item.producto.id, item.cantidad + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink-soft hover:bg-sand"><Plus size={14} /></button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold tabular-nums text-ocean">S/ {(precio * item.cantidad).toFixed(2)}</span>
                      <button type="button" onClick={() => carrito.removeItem(item.producto.id)} className="rounded-md p-1 text-ink-faint hover:text-danger"><Trash2 size={14} /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!carrito.isEmpty && (
          <div className="border-t border-line p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-ink-soft">Total aproximado</span>
              <span className="font-display text-xl font-bold text-ink">S/ {carrito.totalPrice.toFixed(2)}</span>
            </div>
            <a href={carrito.whatsappUrl()} target="_blank" rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25d366] px-6 py-3.5 font-display text-base font-bold text-white shadow-lg transition-all hover:bg-[#20bf5b] active:scale-[0.98]">
              <MessageCircle size={22} />Pedir por WhatsApp
            </a>
            <button type="button" onClick={carrito.clear} className="mt-2 w-full rounded-xl py-2 text-center text-sm font-medium text-ink-faint hover:text-danger">Vaciar lista</button>
          </div>
        )}
      </div>
    </>
  );
}
