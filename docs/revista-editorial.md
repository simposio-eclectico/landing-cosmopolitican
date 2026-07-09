# Cosmopolitican — memoria editorial

Documento de referencia sintetizado desde las actas **Notas reunión 2026-01-06**, **2026-01-31** y **2026-03-08**. Usar para alinear contenido, diseño y decisiones del sitio.

## Qué es

Cosmopolitican es una revista mensual digital (este repositorio es su sitio web) con flujo semanal de piezas ligeras y un número central mensual. No es solo una cuenta de redes: integra textos, video, memes, podcast, cómic y RRSS.

- **Slogan:** «Tu revista con Clase»
- **Lanzamiento Nº 01:** 27 de abril de 2026 (número del 1 de mayo)
- **Editor jefe:** Pablo
- **Estética:** pop/brutalista del sitio; experimental, fordiana (publicar mucho, iterar); humor y circulación cotidiana como vector; piezas densas conviven con contenido ligero compartible

## Tema del Nº 01

**Cooptación de espacios de base por parte de la política institucional** (Concertación / Frente Amplio / gobiernos progresistas).

Los tres textos publicados en `src/content/revista/n01/` pertenecen a este mismo número:

| Archivo | Sección | Rol en el número |
|---------|---------|------------------|
| `reportajes/modo-avion.md` | Reportajes | Reportaje central — instrumentalización de movimientos sociales (Boric 2022–2026) |
| `reportajes/deuda-que-nos-ensenaron-a-deber.md` | Reportajes | Segundo reportaje — CAE, banca y movimiento estudiantil |
| `opinion/dieta-per-capita.md` | Opinión | Columna de Ana Tania Toro — APS y per cápita |

## Propósito político-cultural

- Construir **imaginario de izquierdas**, no solo programas.
- Hablar al **público flotante**: no a la izquierda identitaria/militante; identificación de **clase**, no moral.
- Disputar sentido común; expandir la ventana de Overton.
- Radicalizar sin moralismo pedagógico; interpelar a quienes rechazan la izquierda por caricatura o ignorancia.
- Evitar cámara de eco, miserabilismo paralizante y autocensura anticipada.
- Centralidad del **conflicto de clase** y autodeterminación de los pueblos.

### Imaginarios en disputa

1. Esperanza progresista como motor (cuestionada como paralizante)
2. Indignación moral como acción
3. Verdad/denuncia que no produce efectos por sí sola

### Alternativa editorial (aún en tensión)

- Emoción antes que verdad (sin caer en propaganda reaccionaria)
- Performance política (kayfabe), ficción operativa
- Miedo/cinismo organizado como límite al poder — cuidado con la parálisis

### Acuerdos estéticos informales

- Mirada clasista «a la antigua»
- Iconoclastas; recuperar izquierda sin palomas
- Negación de fantasía de pasado virtuoso
- Referencias de tono: chini_cuil, Pilar Ducci, Al Jazeera en Español, LaBase, brigada alienígena, Plastic Pills

## Público

- Trabajador/a precarizado/a (retail, salud primaria, educación, apps)
- Profesional joven
- Militante desilusionado
- Horizonte cultural globalizado (MrBeast, Trump, IShowSpeed) + eje local chileno según edad

**KPIs:** no solo algoritmo; penetrancia de ideas, circulación discursiva, apropiación por actores comunes. Fidelizar no militantes = éxito.

## Estructura de secciones (acta 2026-03-08)

### Contenido narrativo

| Sección | Estado Nº 01 | Notas |
|---------|--------------|-------|
| Reportajes | 2 publicados | Piezas densas, tema central del mes |
| Entrevistas | pendiente | Incluye figuras hostiles («entrevistar fachos») como herramienta |
| Opinión | 1 publicada | Columnas; «Tu falta de querer» reservada a Jaime Coloma |

### Contenido ligero («Lado B» en el menú)

| Sección | Responsable / notas |
|---------|---------------------|
| Horóscopo | Cecilia |
| Quién X eres? | tests virales |
| Memes | Curadora, Roao, Simposio |
| Chismes | |
| Moda | |
| vino de honor | cultura |
| cosas que no puedes hacer con un sueldo mínimo | placeholder menú: «Saldo insuficiente» |
| 11 organízate entonces | espacio a orgs políticas sin panfleto |
| las mujeres ya no lloran (emprenden y facturan) | |
| Tu falta de querer | columna Jaime Coloma |

### Contenido audiovisual

| Sección | Equipo |
|---------|--------|
| Videos | Papas, AOH |
| Reels | derivados de piezas largas; mostrar duración al inicio |
| Podcast | Roao |

## Forma de trabajo

- Comités con roles; reuniones operativas (forma, no fondo interminable)
- Votación WhatsApp: 5 sí publica, 3 no frena
- Drive + Miro + web (Simposio)
- Personaje «chico/chica Cosmopolitican» para portada/fotos (heterónimos)
- Producción fordiana; derecho a fallar

## Calendario de referencia (reunión marzo)

- 27 abril: lanzamiento web / campaña
- 1 mayo: Nº 01
- Fechas de circulación: 14 feb, 28 feb, 8 mar, 11 mar, super lunes marzo

## Riesgos editoriales explícitos

- Humor hiperreferencial que cierra a no iniciados
- Anti-oficialismo que sea consumido solo por derecha o nichos
- Memes decorativos sin desplazamiento de imaginario
- Simular hablar a sectores populares desde códigos universitarios
- Ficción/manipulación sin criterio ético (votación + editor jefe como filtro)

## Preguntas abiertas (actas)

- Registro dominante: ¿sátira, periodismo o cultura pop política?
- Proporción ligero / denso / audiovisual
- Concepto guía mensual: ¿abstracto o contingente?
- Línea roja: ¿qué se descarta aunque «funcione»?

## Implementación en el repo

- Frontmatter `issueNumber`: siempre `Nº 01` para el primer número
- Frontmatter `category` + `section`: deben coincidir con `src/consts.ts` → `CATEGORIES` / `SECTIONS`
- Frontmatter `sectionOrder`: orden dentro del menú del número
- Menú lateral (`ElegantLayout`): generado desde `DRAWER_MENU_GROUPS` + artículos del número actual
- Rutas de contenido: `src/content/revista/n01/{reportajes,opinion,...}/`
