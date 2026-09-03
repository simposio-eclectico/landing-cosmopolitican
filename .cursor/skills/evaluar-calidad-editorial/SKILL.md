---
name: evaluar-calidad-editorial
description: >-
  Evalúa la calidad editorial de artículos ya publicados en
  src/content/revista/ (extensión, cantidad de imágenes, ortografía,
  claridad sintáctica, tono, remate, etc.), ya sea de un artículo puntual
  elegido por el usuario o de la revista completa. Usar cuando pidan
  "evaluar la calidad editorial", "revisar artículos publicados",
  "auditar la revista" o un chequeo de calidad que no sea parte de un
  import nuevo.
---

# Evaluar calidad editorial de la revista

Audita artículos que **ya están en el repo**. La rúbrica de este documento es
la fuente única de verdad: [import-revista-articulo](../import-revista-articulo/SKILL.md)
la reutiliza en su paso 6 invocando este mismo skill sobre el artículo recién
importado, en vez de duplicarla.

## Modo de uso

Al invocarse, pregunta al usuario (si no lo especificó ya en su mensaje) cuál modo quiere:

1. **Artículo puntual**: elige uno de la lista (por slug, título o sección).
2. **Evaluación completa**: recorre todos los artículos de `src/content/revista/`.

## Workflow

```
- [ ] 1. Listar artículos disponibles
- [ ] 2. Confirmar alcance con el usuario (uno vs. todos)
- [ ] 3. Leer cada artículo objetivo (MDX completo, no solo frontmatter)
- [ ] 4. Evaluar cada uno con la rúbrica
- [ ] 5. Entregar el/los informes (+ ranking si es evaluación completa)
```

### 1. Listar artículos disponibles

```bash
node .cursor/skills/evaluar-calidad-editorial/scripts/list-articulos.mjs
```

Esto agrupa por `menuSection` y muestra slug, título, palabras, minutos de
lectura, cantidad de imágenes y fecha — sirve tanto para que el usuario elija
como para tener el punto de comparación de "extensión típica de la sección"
que pide la rúbrica. Filtrar con `--menu-section {sección}` o `--slug {slug}`
si ya se sabe el objetivo. Con `--json` devuelve el mismo detalle en JSON.

### 2. Confirmar alcance

Si el usuario no fue explícito, pregunta si quiere evaluar un artículo
específico (dar la lista para elegir) o la revista completa. En evaluación
completa, avisa de antemano cuántos artículos hay (el listado del paso 1 ya
lo indica) porque leer todos puede ser una tarea larga.

### 3. Leer cada artículo objetivo

Leer el `.mdx` completo (frontmatter + cuerpo), no solo lo que muestra el
listado. Si hay dudas sobre la línea editorial o el tono esperado, contrastar
con [docs/revista-editorial.md](../../../docs/revista-editorial.md).

Nota: artículos con `format: "video"` (ver frontmatter) tienen el contenido
real en `transcriptionFragments`, no en el cuerpo MDX — el conteo de palabras
del listado no aplica a ellos; evaluar la transcripción en su lugar.

### 4. Evaluar con la rúbrica

- **Nota general 1-5** (5 = listo para publicar tal cual, 1 = necesita
  reescritura sustancial), ponderando:
  - **Extensión**: ¿es corta/larga para su `menuSection` y `format`?
    (comparar contra el promedio de palabras de esa sección, dato que da el
    script del paso 1)
  - **Tono**: ¿calza con la línea editorial de Cosmopolitican y es
    consistente dentro del propio artículo (no cambia de registro a mitad
    de camino)?
  - **Imágenes**: ¿hay suficientes para la extensión, están bien ubicadas
    respecto al texto que ilustran, y los `alt`/`caption`/`credit` son
    descriptivos y no placeholders o genéricos?
- **Alertas obligatorias** (listar cada instancia con la cita textual o
  línea aproximada, no solo decir "hay errores"):
  - Faltas de ortografía y tipeos (acentos, concordancia, mayúsculas)
  - Falta de claridad sintáctica: oraciones demasiado largas o enredadas,
    sujetos ambiguos, párrafos que mezclan varias ideas sin transición
  - **Afirmaciones numéricas sin fuente**: por cada cifra, porcentaje, monto
    o dato estadístico que el cuerpo del artículo presente como hecho
    (no como opinión), verificar que exista respaldo — cita inline con
    atribución («según X», nota al pie) o entrada correspondiente en el
    bloque `<div class="articulo__fuentes">` al final. Si el artículo no
    tiene sección de Fuentes y hace afirmaciones numéricas, es una alerta
    en sí misma, no solo la ausencia de la sección. Listar cada cifra sin
    respaldo con su cita textual; no basta con revisar si la sección
    "Fuentes" existe, hay que confirmar que cada número relevante esté
    efectivamente cubierto por alguna de sus entradas.
  - Otros problemas vitales: título/bajada poco atractivos o que no
    reflejan el contenido, remate (`ArticuloCierre`) que no cierra la idea,
    citas (`blockquote`) mal elegidas o repetidas, inconsistencias de
    nombres/fechas dentro del propio texto
  - **Cobertura de un evento** (concierto, festival, feria, activación,
    etc.) **sin ficha del evento**: debe cerrar con una sección tipo
    "Ficha del evento" (tabla con campos como evento, lugar, fecha,
    organizador), como en
    `src/content/revista/reportajes/descuelgate-punk-funk-suicidio.mdx`
  - **Tema sensible sin advertencia**: artículos que traten suicidio,
    autolesión, abuso o violencia sexual explícita deben abrir con el
    componente `<ArticleAlert>` (`src/components/revista/ArticleAlert.astro`),
    no basta con mencionarlo de paso en el cuerpo del texto
- Si un artículo está limpio, decirlo explícitamente ("sin observaciones de
  ortografía/claridad/fuentes") en vez de omitir la sección — no asumir que
  "no encontré nada" significa "no lo revisé bien".

Esta es una lectura editorial real, no una corrida de linter: no basta con
que `pnpm validate:images` pase.

### 5. Entregar el informe

**Artículo puntual**: informe con la estructura de la rúbrica de arriba.

**Evaluación completa**: informe por artículo (agrupado por `menuSection`,
igual que el listado) más una tabla resumen con columnas slug, sección,
**palabras** (del listado del paso 1; para `format: "video"` usar la
cantidad de palabras de la transcripción, no la del cuerpo MDX), nota 1-5 y
la alerta más grave, ordenada de menor a mayor nota para que el editor
priorice qué revisar primero.

## Reglas importantes

- **No editar** el contenido del artículo como parte de este skill — es solo
  diagnóstico. Si el usuario pide corregir algo puntual después de leer el
  informe, tratarlo como una tarea aparte y confirmar antes de tocar el MDX.
- No reemplaza `pnpm validate:images` ni el build; esos siguen siendo la
  validación técnica de frontmatter/imágenes.

## Referencias del proyecto

- Usado también por: [import-revista-articulo](../import-revista-articulo/SKILL.md) (paso 6, tras cada import)
- Línea editorial: [docs/revista-editorial.md](../../../docs/revista-editorial.md)
- Esquema frontmatter: [src/content.config.ts](../../../src/content.config.ts)
