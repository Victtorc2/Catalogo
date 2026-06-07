import { TIKTOK_URL, FACEBOOK_URL, WHATSAPP_NUMBER } from "@/api/client";

/** Íconos de marca como SVG inline (lucide no trae TikTok). */
function TikTokIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1-2.59-2.59 2.59 2.59 0 0 1 3.43-2.45V9.7a5.67 5.67 0 0 0-.84-.06A5.68 5.68 0 0 0 4.2 15.3a5.68 5.68 0 0 0 9.7 4.02 5.68 5.68 0 0 0 1.66-4.02V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.26-1.48z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.06 24l1.68-6.13A11.86 11.86 0 0 1 .14 11.9C.14 5.33 5.48 0 12.05 0a11.82 11.82 0 0 1 8.41 3.49 11.82 11.82 0 0 1 3.48 8.41c0 6.57-5.34 11.9-11.9 11.9a11.9 11.9 0 0 1-5.7-1.45L.06 24zM6.6 20.2a9.86 9.86 0 0 0 5.03 1.38h.01c5.45 0 9.89-4.43 9.9-9.88a9.82 9.82 0 0 0-2.9-7 9.82 9.82 0 0 0-6.99-2.9c-5.46 0-9.9 4.43-9.9 9.88 0 1.87.52 3.69 1.5 5.26l.24.38-1 3.63 3.73-.98.38.23zm10.95-5.6c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41z" />
    </svg>
  );
}

function FacebookIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

/**
 * Botones flotantes a redes sociales (abajo a la izquierda).
 * WhatsApp aparece arriba (siempre, usa el número del negocio); Facebook y
 * TikTok solo se muestran si tienen URL configurada en el .env.
 */
export function FloatingSocial() {
  if (!WHATSAPP_NUMBER && !TIKTOK_URL && !FACEBOOK_URL) return null;

  return (
    <div className="fixed bottom-6 left-6 z-30 flex flex-col gap-3">
      {WHATSAPP_NUMBER && (
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            "¡Hola! Vengo del catálogo y quisiera más información.",
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escríbenos por WhatsApp"
          title="WhatsApp"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-all hover:scale-110 active:scale-95"
        >
          <WhatsAppIcon />
        </a>
      )}
      {FACEBOOK_URL && (
        <a
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Síguenos en Facebook"
          title="Facebook"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877f2] text-white shadow-lg transition-all hover:scale-110 active:scale-95"
        >
          <FacebookIcon />
        </a>
      )}
      {TIKTOK_URL && (
        <a
          href={TIKTOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Síguenos en TikTok"
          title="TikTok"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-lg transition-all hover:scale-110 active:scale-95"
        >
          <TikTokIcon />
        </a>
      )}
    </div>
  );
}
