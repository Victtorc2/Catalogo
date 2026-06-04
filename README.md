# Catálogo Virtual de Pesca

Página web para mostrar tus productos de pesca. Los clientes eligen y piden por WhatsApp.

## Requisitos

- Node.js 18+ (compatible con tu v20.17.0)
- El backend de inventario corriendo con los endpoints de catálogo

## Instalación

```bash
npm install
cp .env.example .env   # edita con tus datos
npm run dev            
```

## Configuración (.env)

```env
VITE_API_URL=       # URL de tu backend
VITE_CATALOG_API_KEY=tu-api-key           # Coincide con CATALOG_API_KEY del backend
VITE_WHATSAPP_NUMBER=51999888777          # Tu número con código país (sin +)
VITE_STORE_NAME=Pesca Total               # Nombre de tu tienda
```

## Rutas

| Ruta | Quién la usa | Descripción |
|------|-------------|-------------|
| `/` | Tus clientes | Catálogo público con productos, búsqueda y WhatsApp |
| `/admin` | Tú | Login + panel de gestión |
| `/admin/productos` | Tú | Subir/cambiar fotos de productos |
| `/admin/banners` | Tú | Crear/editar banners de promociones |
