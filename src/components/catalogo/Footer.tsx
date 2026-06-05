import {
  Fish,
  MapPin,
  Phone,
  Clock,
  Truck,
  CreditCard,
  Smartphone,
  Banknote,
  ShieldCheck,
} from "lucide-react";
import { STORE_NAME, WHATSAPP_NUMBER, FACEBOOK_URL, TIKTOK_URL } from "@/api/client";

/** Footer con información de la tienda, pagos, envíos y contacto. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-20 overflow-hidden bg-abyss-deep text-ice">
      {/* Glow + rejilla táctica */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-electric/60 to-transparent" />
      <div className="tactical-grid pointer-events-none absolute inset-0 opacity-40" />

      {/* Franja de confianza */}
      <div className="relative border-b border-steel-light/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-7 sm:grid-cols-4">
          {[
            { icon: Truck, title: "Envíos a todo el Perú", desc: "Por agencia de tu preferencia" },
            { icon: ShieldCheck, title: "Productos garantizados", desc: "Marcas originales" },
            { icon: Smartphone, title: "Pide por WhatsApp", desc: "Atención personalizada" },
            { icon: CreditCard, title: "Pago fácil", desc: "Yape, Plin, efectivo y más" },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-electric/25 bg-electric/10">
                <f.icon size={20} className="text-electric" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-ice">{f.title}</p>
                <p className="text-xs text-ice-faint">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cuerpo */}
      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Marca */}
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-electric-deep text-white shadow-[0_8px_20px_-8px_rgba(14,165,233,0.9)]">
              <Fish size={20} />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight">{STORE_NAME}</span>
          </div>
          <p className="text-sm leading-relaxed text-ice-soft">
            Tu tienda de artículos de pesca en Nasca. Anzuelos, tanzas, señuelos,
            cañas, carretes y todo lo que necesitas para tu próxima jornada.
          </p>
          {/* Redes sociales */}
          {(FACEBOOK_URL || TIKTOK_URL) && (
            <div className="mt-4 flex items-center gap-2">
              {FACEBOOK_URL && (
                <a
                  href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-steel-light/40 bg-steel/50 text-ice transition-colors hover:bg-[#1877f2]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>
                </a>
              )}
              {TIKTOK_URL && (
                <a
                  href={TIKTOK_URL} target="_blank" rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-steel-light/40 bg-steel/50 text-ice transition-colors hover:bg-black"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1-2.59-2.59 2.59 2.59 0 0 1 3.43-2.45V9.7a5.67 5.67 0 0 0-.84-.06A5.68 5.68 0 0 0 4.2 15.3a5.68 5.68 0 0 0 9.7 4.02 5.68 5.68 0 0 0 1.66-4.02V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.26-1.48z"/></svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Contacto */}
        <div>
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-electric">
            Contacto
          </h3>
          <ul className="flex flex-col gap-3 text-sm text-ice-soft">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-strike" />
              <span>Nasca, Ica — Perú</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone size={16} className="mt-0.5 shrink-0 text-strike" />
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-electric"
              >
                WhatsApp: +{WHATSAPP_NUMBER}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 shrink-0 text-strike" />
              <span>Lun a Sáb: 8:00 am – 8:00 pm</span>
            </li>
          </ul>
        </div>

        {/* Métodos de pago */}
        <div>
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-electric">
            Métodos de pago
          </h3>
          <ul className="flex flex-col gap-2.5 text-sm text-ice-soft">
            <li className="flex items-center gap-2">
              <Smartphone size={16} className="text-strike" /> Yape / Plin
            </li>
            <li className="flex items-center gap-2">
              <Banknote size={16} className="text-strike" /> Efectivo (recojo en tienda)
            </li>
            <li className="flex items-center gap-2">
              <CreditCard size={16} className="text-strike" /> Transferencia bancaria
            </li>
            <li className="flex items-center gap-2">
              <Truck size={16} className="text-strike" /> Contra entrega (según zona)
            </li>
          </ul>
        </div>

        {/* Envíos */}
        <div>
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-electric">
            Agencias de envío
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-ice-soft">
            <li>• Shalom</li>
            <li>• Olva Courier</li>
            <li>• Marvisur</li>
            <li>• Transportes Flores (encomiendas)</li>
          </ul>
          <p className="mt-3 text-xs text-ice-faint">
            El costo del envío se coordina por WhatsApp según tu ubicación.
          </p>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="relative border-t border-steel-light/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-ice-faint sm:flex-row sm:text-left">
          <p>© {year} {STORE_NAME}. Todos los derechos reservados.</p>
          <p>Los precios pueden variar. Confirma tu pedido por WhatsApp.</p>
        </div>
      </div>
    </footer>
  );
}
