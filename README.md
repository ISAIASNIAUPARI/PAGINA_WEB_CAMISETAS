# LAMS STUDIO — tienda de camisetas

Sitio público + panel de edición (`/admin`) en un solo proyecto **Next.js 16 + TypeScript + Tailwind v4**, desplegado en Vercel desde este repo.

## Estructura

| Carpeta | Qué hay |
|---|---|
| `app/` | Rutas: `/` (tienda), `/carrito`, `/privacidad`, `/admin`, `/admin/login`, y `api/` (login, guardar, subidas, chat) |
| `components/site/` | Secciones del sitio. Cada una recibe `data` y un `onChange` opcional (solo en `/admin`) |
| `components/editable/` | Capa de edición en línea: textos (`Txt`), cambiar imagen/video, campos de precio/enlace |
| `components/motion.tsx` | Animaciones propias (entradas al hacer scroll, titulares por palabras, parallax, inclinación 3D, botones magnéticos) |
| `content/*.json` | **Todo el contenido del sitio.** El panel `/admin` guarda aquí con un commit |
| `public/images/` | Fotos de producto optimizadas (WebP) — viven en el repo, no en Cloudinary |
| `cloudinary-manifest.json` | Videos y modelo 3D que viven en Cloudinary (public_id, versión, transformaciones) |
| `source-originals/` | Diseño original de Claude Design y archivos fuente sin comprimir (no se despliega) |

## Desarrollo

```bash
npm install
npm run dev   # abrir http://localhost:3000 (no 127.0.0.1)
```

`.env.local` mínimo para probar el admin en local: `ADMIN_PASSWORD=lo-que-quieras`.

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Valor |
|---|---|
| `ADMIN_PASSWORD` | contraseña del panel |
| `GITHUB_TOKEN` | token fine-grained, solo este repo, permiso **Contents: Read and write** |
| `GITHUB_OWNER` | `ISAIASNIAUPARI` |
| `GITHUB_REPO` | `PAGINA_WEB_CAMISETAS` |
| `GITHUB_BRANCH` | `main` |
| `CLOUDINARY_CLOUD_NAME` | `foewxv45` |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | del panel de Cloudinary |
| `N8N_WEBHOOK_URL` | (opcional) webhook del asistente; si falta usa el del diseño original |

## Cómo funciona el panel

1. Entrar a `/admin` con la contraseña.
2. Clic en cualquier texto para escribir encima; "Cambiar imagen" / "Cambiar video" sobre cada medio; precios, colores y enlaces en los campos morados.
3. **Guardar** crea un commit con los `content/*.json` cambiados → Vercel redespliega solo en ~1 minuto.

Las imágenes que se suben desde el panel se comprimen en el navegador y van a Cloudinary; los videos suben directo navegador → Cloudinary (sin pasar por el límite de 4.5 MB de Vercel).
