import { TIKTOK_URL, FACEBOOK_URL } from "@/api/client";

/** Íconos de marca como SVG inline (lucide no trae TikTok). */
function TikTokIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1-2.59-2.59 2.59 2.59 0 0 1 3.43-2.45V9.7a5.67 5.67 0 0 0-.84-.06A5.68 5.68 0 0 0 4.2 15.3a5.68 5.68 0 0 0 9.7 4.02 5.68 5.68 0 0 0 1.66-4.02V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.26-1.48z" />
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
 * Solo se muestran los que tengan URL configurada en el .env.
 */
export function FloatingSocial() {
  if (!TIKTOK_URL && !FACEBOOK_URL) return null;

  return (
    <div className="fixed bottom-6 left-6 z-30 flex flex-col gap-3">
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
