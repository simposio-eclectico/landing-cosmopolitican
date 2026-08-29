---
name: import-horoscopo
description: >-
  Crea una nueva entrada de horóscopo en src/content/revista/columnas/ a
  partir de un texto plano o markdown con el pronóstico de cada signo (estilo
  columna "Simposio Ecléctico"). Aplica el formato con <ZodiacIcon /> igual al
  horóscopo modelo. Usar cuando el usuario pida agregar/importar el
  horóscopo del mes, pegue o adjunte el texto de un horóscopo nuevo.
---

# Importar horóscopo a la landing Cosmopolitican

Genera `src/content/revista/columnas/horoscopo-{mes}.mdx` a partir del texto crudo del horóscopo (pegado por el usuario o en un archivo), con el mismo formato que el artículo modelo.

Artículo modelo: [src/content/revista/columnas/horoscopo-jul.mdx](../../../src/content/revista/columnas/horoscopo-jul.mdx)

## Qué necesitas del usuario antes de generar

Si falta alguno de estos datos, pregúntalos (no inventes valores):

- **Texto del horóscopo**: introducción general (opcional) + un párrafo por cada uno de los 12 signos, cada uno en su propia línea/encabezado (ej. `Aries`, `## Aries`, `**Aries**`, con o sin `:` al final). No hace falta que traiga los íconos, el script los agrega.
- **Mes** (ej. "Agosto") — determina el slug (`horoscopo-ago`) y el título.
- **Fecha de publicación** (`pubDate`, formato `YYYY-MM-DD`) — no asumas el día 1 del mes; el modelo usa fechas específicas (ej. `2026-07-20`).
- **Imagen de portada** (opcional): si el usuario la da, pide también un `imageAlt`/`imageCaption` o usa el default genérico ("Servicio de utilidad pública: Horóscopo Cosmopolitican - {Mes}."). Sin imagen, la entrada queda con `theme: "default"` (sin portada destacada) — está bien, no es obligatorio tener imagen.

No hace falta pedir `author`, `category`, `section`, `menuSection`, `tags` ni `summary`: por defecto siguen el mismo patrón del modelo (`Simposio Ecléctico`, columna en `columnas`). Solo ajústalos si el usuario pide algo distinto.

## Workflow

1. Si el usuario pega el texto directamente en el chat, vuélcalo a un archivo temporal (ej. `/tmp/horoscopo-{mes}.txt`) con Write.
2. Ejecuta el script en modo `--dry-run` para revisar el resultado antes de escribir nada:

```bash
node .cursor/skills/import-horoscopo/scripts/import-horoscopo.mjs \
  --source "/tmp/horoscopo-agosto.txt" \
  --month Agosto \
  --pubDate 2026-08-17 \
  --dry-run
```

Con imagen de portada:

```bash
node .cursor/skills/import-horoscopo/scripts/import-horoscopo.mjs \
  --source "/tmp/horoscopo-agosto.txt" \
  --month Agosto \
  --pubDate 2026-08-17 \
  --image "~/Downloads/portada-agosto.png" \
  --imageAlt "Horóscopo Cosmopolitican - Agosto." \
  --imageCaption "Servicio de utilidad pública: Horóscopo Cosmopolitican - Agosto." \
  --dry-run
```

3. Revisa la salida del dry-run: que estén los 12 signos, en orden, sin texto cortado o duplicado, y que la introducción (si existe) haya quedado separada del primer signo.
4. Si todo está bien, repite el comando sin `--dry-run`.
5. Corre las validaciones del repo:

```bash
pnpm validate:images
pnpm build
```

6. Informa al usuario: ruta del MDX generado, signos detectados/faltantes (el script avisa con `⚠` si falta alguno o si alguno quedó sin texto), y la URL local (`/revista/{slug}`) tras `pnpm dev`.

## Cómo funciona el script

- Reconoce los 12 signos (con o sin tilde) en cualquier línea que contenga solo el nombre del signo, incluso con `#`, `**` o `:` alrededor.
- Reordena siempre los signos al orden canónico del zodíaco (Aries → Piscis), sin importar el orden del texto de origen.
- Todo lo que aparece antes del primer signo se toma como introducción del horóscopo.
- Genera cada bloque como `<h3><ZodiacIcon sign="{signo}" /> {Nombre}</h3>` seguido del párrafo, igual que el modelo.
- Falla (sin escribir nada) si no encuentra ningún signo, si falta `--month`/`--pubDate`, o si el slug destino ya existe.
- Avisa con `⚠` (pero no falla) si falta algún signo de los 12 o si alguno quedó con el cuerpo vacío — revisa esos casos a mano antes de dar por buena la importación.

## Reglas importantes

- **No inventar** contenido de ningún signo: si el texto de origen no trae un signo, o el párrafo quedó vacío, dilo al usuario y pide el texto faltante en vez de rellenar con contenido genérico.
- **No editar el tono/texto** del horóscopo al importar, solo el formato (encabezados + `<ZodiacIcon />`).
- Si ya existe un `.mdx` con el mismo slug, no lo sobrescribas sin confirmar con el usuario (usa `--slug` para un nombre alternativo si corresponde).

## Referencias del proyecto

- Esquema frontmatter: [src/content.config.ts](../../../src/content.config.ts)
- Componente de íconos: [src/components/revista/ZodiacIcon.astro](../../../src/components/revista/ZodiacIcon.astro)
- Artículo modelo: [src/content/revista/columnas/horoscopo-jul.mdx](../../../src/content/revista/columnas/horoscopo-jul.mdx)
