# Plataforma Multi-Restaurante — React + Vite

Prototipo administrable listo para editar, correr y exportar como app web instalable (PWA básica via manifest).

## Requisitos
- Node.js 18+
- npm o pnpm o yarn

## Instalación
```bash
npm install
npm run dev
```
Abre http://localhost:5173

## Build de producción
```bash
npm run build
npm run preview
```

## Estructura
- `src/App.jsx`: toda la lógica UI (menú, pedidos, zonas, reportes, QR, inventario).
- `src/styles.css`: utilidades CSS (no usa Tailwind).
- `index.html`: incluye (opcional) los SDK de Firebase si los habilitas.
- `public/manifest.webmanifest`: manifiesto básico PWA.

## Firebase (opcional)
1. En `src/App.jsx`, busca `firebaseCfg` y pon `enabled: true`, agrega tus credenciales (apiKey, authDomain, projectId).
2. En `index.html`, descomenta el bloque `<script type="module">` con los imports de Firebase (v9).
3. La app leerá/escribirá el `state` en el documento `multi-restaurante/state` de Firestore.

> Siguiente paso (recomendado): sustituir el state global por colecciones por restaurante para escalar (restaurants/{id}/...)

## Exportar reportes
- Pestaña **Reportes** → botones para CSV (ventas, inventario) y PDF (usa print del navegador).

## QR & Link público
- Pestaña **QR & Link** → genera URL pública `/#/{slug}` y código QR para que los clientes pidan.

## Pagos en línea
- Aún placeholder. Próximo paso: Stripe (Checkout) o MercadoPago (Preference) en el flujo de `closeOrderAsSale` o `Checkout.jsx` externo.

## Pregunta
- ¿Prefieres CSV con coma (,) o punto y coma (;) para Excel regional? Puedo cambiarlo fácilmente.
