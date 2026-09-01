---
name: import-revista-articulo
description: >-
  Importa artículos MDX generados con docs/prompt-articulos.md a la landing
  Cosmopolitican: copia el .mdx a src/content/revista/, mueve imágenes a
  src/assets/revista/imagenes/{slug}/, valida frontmatter y ejecuta
  validate:images. Usar cuando el usuario suba una carpeta de salida de IA
  (p. ej. ~/Downloads/...), pida agregar un artículo a la revista, o
  integrar contenido Word→MDX al proyecto.
---

# Importar artículo a la landing Cosmopolitican

Integra en el repo una carpeta de salida generada con [docs/prompt-articulos.md](../../../docs/prompt-articulos.md).

## Estructura esperada del origen

La carpeta de salida suele contener:

```
{carpeta-origen}/
├── src/content/revista/{issue}/{menuSection}/{slug}.mdx   ← obligatorio
├── uploads/                                                ← imágenes sueltas (nombres arbitrarios)
└── src/assets/revista/imagenes/{slug}/                     ← opcional, si ya vienen nombradas
```

Ejemplo real: `~/Downloads/Ana Cosmopolitana diseño web 2`

## Destinos en el proyecto

| Tipo | Ruta |
|------|------|
| MDX | `src/content/revista/{issue}/{menuSection}/{slug}.mdx` |
| Imagen hero + cuerpo | `src/assets/revista/imagenes/{slug}/{archivo}.jpg` |

Rutas relativas en frontmatter (`image:`) y en `<ArticleFigure src="...">` ya apuntan a esos destinos; **no reescribir** salvo error evidente.

## Workflow

Copia este checklist y marca cada paso:

```
Importación:
- [ ] 1. Inventariar origen (MDX + imágenes)
- [ ] 2. Copiar MDX con el script
- [ ] 3. Mapear y copiar imágenes
- [ ] 4. Resolver PENDIENTE: en frontmatter
- [ ] 5. Validar (validate:images + build)
- [ ] 6. Evaluar calidad editorial del artículo
- [ ] 7. Informar al usuario qué falta
```

### 1. Inventariar origen

Leer el MDX en `{origen}/src/content/revista/**/*.mdx` y anotar:

- `slug`, `menuSection`, `issueNumber` del frontmatter
- Imágenes esperadas: campo `image:` + atributos `src` de `<ArticleFigure>`
- Comentarios `{/* PENDIENTE: ... → ruta destino */}` (indican qué falta exportar)

Listar imágenes en `{origen}/uploads/` y subcarpetas.

### 2. Copiar MDX

Desde la raíz del proyecto:

```bash
node .cursor/skills/import-revista-articulo/scripts/import-articulo.mjs \
  --source "~/Downloads/Nombre de la carpeta" \
  --dry-run
```

Si la salida es correcta, repetir sin `--dry-run`.

El script copia el `.mdx` preservando la ruta bajo `src/content/revista/`.

### 3. Mapear y copiar imágenes

Si el origen **no** trae `src/assets/revista/imagenes/{slug}/` ya nombrado, el script genera `{origen}/imagenes-map.json` y sale con código 2.

Completar el mapa (destino → origen relativo al `--source`):

```json
{
  "nina-muneca.jpg": "uploads/130606202_f7bc7aa147_o.jpg",
  "ninez-habitacion.jpg": "uploads/55381740919_0610b8cb35_o.jpg",
  "nina-tras-adulto.jpg": "uploads/7512666696_7c46ba2bfe_o.jpg"
}
```

Para identificar qué archivo corresponde a cada destino:

1. Leer los comentarios `PENDIENTE` y los `alt`/`caption` del MDX
2. Abrir/leer las imágenes en `uploads/` si hace falta
3. Confirmar con el usuario si hay ambigüedad

Importar con mapa:

```bash
node .cursor/skills/import-revista-articulo/scripts/import-articulo.mjs \
  --source "~/Downloads/Nombre de la carpeta" \
  --map "~/Downloads/Nombre de la carpeta/imagenes-map.json"
```

### 4. Resolver placeholders `PENDIENTE:`

Revisar frontmatter e `<ArticleFigure>`:

| Campo | Acción |
|-------|--------|
| `imageCredit`, `imageLicense`, etc. con `PENDIENTE:` | Pedir datos al editor o eliminar campos opcionales vacíos |
| `imageLicense` + `PENDIENTE:` en credit | El build exige `imageCredit` si hay `imageLicense`; no dejar licencia ficticia |
| Comentarios `{/* PENDIENTE: ... */}` | Eliminar tras copiar las imágenes |

Corregir `menuSection` si falta comillas: `"columnas"`, `"reportajes"`, etc.

Valores válidos de `menuSection`: `editorial`, `reportajes`, `columnas`, `entrevistas`, `podcast`, `internacional`.

### 5. Validar

```bash
pnpm validate:images
pnpm build
```

Si `validate:images` falla, corregir según el mensaje (alt, caption, créditos).

### 6. Evaluar calidad editorial del artículo

Releer el texto ya importado (no el de origen) y devolver al editor una evaluación honesta, no una validación automática de trámite. Contrastar el tono contra [docs/revista-editorial.md](../../../docs/revista-editorial.md) si hay dudas sobre la línea editorial.

Entregar:

- **Nota general 1-5** (5 = listo para publicar tal cual, 1 = necesita reescritura sustancial), ponderando:
  - **Extensión**: ¿es corta/larga para su `menuSection` y formato? (compara con artículos ya publicados de la misma sección)
  - **Tono**: ¿calza con la línea editorial de Cosmopolitican y con el resto de la pieza (no cambia de registro a mitad de camino)?
  - **Imágenes**: ¿hay suficientes, están bien ubicadas respecto al texto que ilustran, y los `alt`/`caption`/`credit` son descriptivos y no placeholders?
- **Alertas obligatorias** (listar cada instancia con la cita textual o línea aproximada, no solo decir "hay errores"):
  - Faltas de ortografía y tipeos (acentos, concordancia, mayúsculas)
  - Falta de claridad sintáctica: oraciones demasiado largas o enredadas, sujetos ambiguos, párrafos que mezclan varias ideas sin transición
  - Otros problemas vitales para un artículo de revista: título/bajada poco atractivos o que no reflejan el contenido, remate (`ArticuloCierre`) que no cierra la idea, citas (`blockquote`) mal elegidas o repetidas, fuentes/datos sin respaldo cuando el texto afirma cifras, inconsistencias de nombres/fechas dentro del propio texto
- Si todo está limpio, decirlo explícitamente ("sin observaciones de ortografía/claridad") en vez de omitir la sección.

Este resumen es para el editor humano, no bloquea el import ni reemplaza la validación técnica del paso 5.

### 7. Informar al usuario

Resumir:

- Ruta final del MDX
- Imágenes copiadas
- Placeholders `PENDIENTE:` que quedaron
- URL local tras `pnpm dev` (ruta `/revista/...` según slug)
- La evaluación editorial del paso 6

## Reglas importantes

- **No editar** el texto del autor al importar; solo metadatos técnicos y rutas.
- **No sobrescribir** un artículo existente sin confirmar con el usuario.
- Ignorar en el origen: `.html`, `support.js`, `.docx`, `.DS_Store`, subcarpetas `jurgol/` u otros artefactos del generador.
- La imagen hero usa ruta relativa desde el MDX hacia assets, ej. `../../../../assets/revista/imagenes/{slug}/archivo.jpg`.
- `<ArticleFigure src="...">` usa solo el path bajo `imagenes/`, ej. `{slug}/archivo.jpg`.

## Referencias del proyecto

- Esquema frontmatter: [src/content.config.ts](../../../src/content.config.ts)
- Prompt de generación: [docs/prompt-articulos.md](../../../docs/prompt-articulos.md)
- Artículo modelo: [src/content/revista/n01/reportajes/modo-avion.mdx](../../../src/content/revista/n01/reportajes/modo-avion.mdx)

## Ejemplo completo (Ana Cosmopolitana)

Origen: `~/Downloads/Ana Cosmopolitana diseño web 2`

MDX: `src/content/revista/n01/columnas/de-la-infancia-precarizada-al-estado-punitivo.mdx`

Imágenes esperadas en `src/assets/revista/imagenes/de-la-infancia-precarizada-al-estado-punitivo/`:

- `nina-muneca.jpg` (hero)
- `ninez-habitacion.jpg`
- `nina-tras-adulto.jpg`

Tras importar, resolver créditos `PENDIENTE:` con el editor antes de publicar.
