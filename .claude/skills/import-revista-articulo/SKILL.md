---
name: import-revista-articulo
description: >-
  Importa un artículo MDX a la revista Cosmopolitican desde una carpeta o un
  ZIP (usando scripts/import-articulo.mjs en la raíz del repo, con soporte de
  descompresión automática y symlinks opcionales). Usar cuando el usuario pida
  importar/agregar un artículo a la revista y entregue un .zip o carpeta de
  salida generada con docs/prompt-articulos.md.
---

# Importar artículo a Cosmopolitican (Claude)

Integra un artículo MDX a la revista desde un directorio o ZIP usando symlinks para desarrollo.

⚠️ **IMPORTANTE**: Tu rol es SOLO transformar formato. NO inventar, NO agregar conclusiones, NO resumir, NO "mejorar" el texto. El contenido viene del usuario; tú solo lo conviertes de Word → MDX.

## Uso rápido

```bash
node scripts/import-articulo.mjs --source ~/Downloads/carpeta-articulo
node scripts/import-articulo.mjs --source ~/Downloads/articulo.zip
node scripts/import-articulo.mjs --source ... --use-symlinks  # desarrollo: symlinks en lugar de copias
```

## Características

✓ **ZIP automático**: detecta `.zip` y descomprime a temporal
✓ **Symlinks opcionales**: `--use-symlinks` para desarrollo (no duplica archivos)
✓ **Mapeo de imágenes**: genera plantilla `imagenes-map.json` si faltan imágenes
✓ **Validación**: valida frontmatter al importar, integraciones construidas en `src/content.config.ts`

## Flujo típico

### 1. Con ZIP
```bash
node scripts/import-articulo.mjs --source ~/Downloads/articulo.zip --dry-run
node scripts/import-articulo.mjs --source ~/Downloads/articulo.zip --map /tmp/imagenes-map.json
```

El script:
- Descomprime el ZIP a temporal
- Busca `.mdx` bajo `src/content/revista/`
- Coloca el MDX en `src/content/revista/{menuSection}/{slug}.mdx`, descartando cualquier carpeta de edición (`n01`, `n02`, …) que traiga la fuente: el repo no organiza el contenido por edición, `issueNumber` es solo un campo de frontmatter
- Mapea imágenes desde directorios raíz y `uploads/`
- Copia (o linkea con `--use-symlinks`) a `src/assets/revista/imagenes/{slug}/`

### 2. Con carpeta
```bash
node scripts/import-articulo.mjs --source ~/Downloads/Nombre\ Carpeta
```

Mismo flujo, pero sin descomprimir.

### 3. Desarrollo con symlinks
```bash
node scripts/import-articulo.mjs --source ... --use-symlinks
```

Crea links a imágenes en lugar de copiar. Útil durante iteración; fallback automático a copia si los symlinks no funcionan.

## Después de importar

```bash
npm run validate:images  # valida frontmatter + alt/captions
npm run build            # compila y optimiza imágenes
npm run dev              # previsualiza en http://localhost:4321
```

Navega a `/revista/{slug}` para ver el artículo.

## Mapeo de imágenes

Si faltan imágenes, el script genera una plantilla `imagenes-map.json`:

```json
{
  "_comentario": "Claves = nombre destino en assets. Valores = ruta relativa al --source",
  "hero.jpg": "",
  "figura-1.jpg": "",
  "_imagenes_disponibles_en_origen": [
    "uploads/imagen.jpg",
    "assets/otra.png"
  ]
}
```

Completa los valores y rerun:

```bash
node scripts/import-articulo.mjs --source ... --map ruta/a/imagenes-map.json
```

## Notas

- El MDX siempre se copia (nunca symlink)
- Imágenes usan symlink/copia según `--use-symlinks`
- Soporta caracteres especiales en rutas (usa `ditto` en lugar de `unzip`)
- Comentarios `PENDIENTE:` deben resolverse manualmente en frontmatter
- El destino nunca incluye una carpeta de edición (`n01/`, `n02/`, …), aunque la fuente sí la traiga: se aplana a `src/content/revista/{menuSection}/{slug}.mdx`

## Referencia: campos obligatorios del frontmatter

| Campo | Valores | Notas |
|-------|---------|-------|
| `title` | string | — |
| `author` | string | default: `"Cosmopolitican"` |
| `pubDate` | `YYYY-MM-DD` | — |
| `summary` | string | 1–2 frases, puede incluir `**negritas**` |
| `issueNumber` | `"Nº 01"`, `"Nº 02"`, etc. | Solo metadata de frontmatter; no determina la carpeta destino |
| `menuSection` | enum | `editorial`, `reportajes`, `columnas`, `entrevistas`, `podcast`, `internacional` |
| `slug` | kebab-case | sin acentos; derivado del título si falta |
| `image` | ruta relativa | obligatorio si `theme: featured` |
| `imageAlt` | string | obligatorio si hay `image` |
| `imageCaption` | string | obligatorio si `theme: featured` + `image` |
| `imageCredit` | string | obligatorio si hay `imageLicense` |

Ver `src/content.config.ts` para el esquema completo y reglas `.refine()`.
