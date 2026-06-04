import { useCallback, useEffect, useState } from "react";
import type { CatalogoProducto } from "@/types/producto";
import { WHATSAPP_NUMBER, STORE_NAME } from "@/api/client";

interface CarritoItem { producto: CatalogoProducto; cantidad: number; }

function toNum(v: string | number): number {
  return typeof v === "string" ? parseFloat(v) : v;
}

const KEY = "catalogo_carrito";
function load(): CarritoItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function useCarrito() {
  const [items, setItems] = useState<CarritoItem[]>(load);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const addItem = useCallback((p: CatalogoProducto) => {
    setItems(prev => {
      const ex = prev.find(it => it.producto.id === p.id);
      return ex
        ? prev.map(it => it.producto.id === p.id ? { ...it, cantidad: it.cantidad + 1 } : it)
        : [...prev, { producto: p, cantidad: 1 }];
    });
  }, []);

  const setQuantity = useCallback((id: number, qty: number) => {
    if (qty <= 0) setItems(p => p.filter(it => it.producto.id !== id));
    else setItems(p => p.map(it => it.producto.id === id ? { ...it, cantidad: qty } : it));
  }, []);

  const removeItem = useCallback((id: number) => setItems(p => p.filter(it => it.producto.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, it) => s + it.cantidad, 0);
  const totalPrice = items.reduce((s, it) => s + toNum(it.producto.precio_venta) * it.cantidad, 0);

  const whatsappUrl = useCallback(() => {
    if (!items.length) return "";
    const lines = items.map(it =>
      `• ${it.cantidad}x ${it.producto.nombre} — S/ ${toNum(it.producto.precio_venta).toFixed(2)} c/u`
    );
    const msg = encodeURIComponent(
      `Hola *${STORE_NAME}*, quiero pedir:\n\n${lines.join("\n")}\n\n*Total aprox: S/ ${totalPrice.toFixed(2)}*\n\n¡Gracias!`
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }, [items, totalPrice]);

  return { items, totalItems, totalPrice, isEmpty: !items.length, addItem, setQuantity, removeItem, clear, whatsappUrl };
}
