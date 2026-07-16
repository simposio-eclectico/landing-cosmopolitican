**COSMOPOLITICAN**

Guía de diseño web — Portada tipo «Especial»

## **1\. Objetivo del documento**

Esta guía describe con exactitud todos los elementos visuales de la portada de Cosmopolitican en su versión de número especial, tal como aparece en la captura de referencia. Incluye paleta de colores, tipografía, espaciados, componentes y lógica de grilla. El diseñador/a puede implementar esta portada desde cero siguiendo esta guía sin necesidad de acceder a los archivos originales.

## **2\. Paleta de colores**

Todos los colores son planos (sin gradientes). El diseño usa una paleta mínima de cinco valores:

| Muestra | Nombre | Hex | Uso |
| :---- | :---- | :---- | :---- |
| \#E8327A | Magenta principal | E8327A | Bloques de especial, títulos de cards, CTAs, bordes activos |
| \#1A1A1A | Negro marca | 1A1A1A | Fondo logo, texto oscuro principal, headers de tabla |
| \#FFFFFF | Blanco | FFFFFF | Fondo general página, texto sobre magenta o negro |
| \#F5F5F5 | Gris fondo | F5F5F5 | Fondo muy sutil de página; separación de zonas |
| \#555555 | Gris texto | 555555 | Bajadas, fechas, autores, labels secundarios |
| \#CCCCCC | Gris borde | CCCCCC | Líneas divisorias, bordes de imágenes si aplica |
| \#2A5C9A | Azul nav activo | 2A5C9A | Link de navegación activo (ej. «Inicio») |
| \#333333 | Gris nav | 333333 | Links de navegación inactivos |

**Regla de uso:** el magenta \#E8327A es el único color de acento. No se usan colores adicionales. Las fotografías pueden ser a color o en blanco y negro; ambas conviven en la misma página.

## **3\. Tipografía**

El sistema tipográfico usa exclusivamente la familia Arial (o Helvetica Neue como primera opción en Mac/iOS). No se usan fuentes serif ni de display externas. La personalidad visual se logra mediante peso, tamaño, color y caja alta, no mediante familias tipográficas múltiples.

| Elemento | Fuente | Peso | Tamaño | Notas |
| :---- | :---- | :---- | :---- | :---- |
| Logo / marca | Helvetica Neue / Arial | 700 | 14px / uppercase | letter-spacing: 0.15em; color blanco sobre negro |
| Tagline nav | Arial | 400 | 12px | Gris claro: «tu revista con clase» |
| Nav links | Arial | 400 | 14px | Color: \#333333 (inactivo); \#2A5C9A \+ subrayado (activo) |
| Eyebrow sección | Arial | 700 | 11px uppercase | Color \#E8327A; letter-spacing: 0.2em |
| Título especial H1 | Arial / Impact | 900 | 52–60px | Fondo bloque magenta \#E8327A; texto blanco; line-height 1.1 |
| Bajada especial | Arial | 400 | 16px | Texto \#333; debajo del bloque magenta |
| CTA «Leer» | Arial | 600 | 13px uppercase | Color \#E8327A; con ícono ⊙; letter-spacing 0.1em |
| Fecha artículo | Arial | 400 | 12px | Color \#888888 |
| Título card | Arial | 700 | 20–22px | Color \#E8327A; line-height 1.25 |
| Autor card | Arial | 400 italic | 13px | Color \#333; precedido de «por» |
| Bajada card | Arial | 400 | 14px | Color \#333; line-height 1.6 |
| Label lateral | Arial | 700 | 10px uppercase | Rotado 90°; letter-spacing 0.25em; color \#555 |

**Notas importantes:** (1) El título del especial (H1) puede ocupar 2–3 líneas en el bloque magenta; esto es intencional y forma parte del diseño. (2) El logo usa letra blanca sobre círculo negro sólido; el tagline «tu revista con clase» va a la derecha del círculo en gris claro, tamaño pequeño. (3) Todos los tamaños son aproximados desde la captura; ajustar con la regla del diseñador en pantalla.

## **4\. Estructura de grilla y layout**

### **4.1 Contenedor general**

max-width: 1440px; margin: 0 auto; padding: 0 80px;

El contenido nunca toca los bordes de la ventana. El fondo de página es \#F5F5F5 o blanco puro (verificar con captura a escala completa).

### **4.2 Navbar**

Altura: \~72px. Fondo blanco. Estructura:

* Izquierda: logo (círculo negro 52×52px) \+ tagline

* Centro: links de navegación (Inicio, Reportajes, Crónicas, Entrevistas, Memes, Reels, Archivo, Somos, Contacto)

* Derecha: lupa \+ Facebook \+ Instagram \+ YouTube

display: flex; justify-content: space-between; align-items: center;

Separador vertical (1px, color \#CCCCCC) entre el link «Contacto» y el ícono de lupa.

### **4.3 Sección hero (especial)**

Grilla de dos columnas desiguales:

* **Columna izquierda (\~55% ancho):** imagen circular del personaje central

* **Columna derecha (\~45% ancho):** eyebrow \+ bloque magenta \+ bajada \+ CTA

display: grid; grid-template-columns: 55fr 45fr; gap: 0; align-items: center;

La imagen circular usa border-radius: 50%. Ocupa casi toda la altura de la columna izquierda. No tiene borde ni sombra.

El bloque magenta no ocupa el 100% de la columna derecha; su ancho lo determina el texto (display: inline-block o width: fit-content con padding).

### **4.4 Grid de cards (3 columnas)**

display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;

Cada card: imagen arriba (relación \~16:10, object-fit: cover, sin border-radius) \+ bloque de texto abajo sin padding interno adicional (el gap de la grilla ya los separa).

### **4.5 Label lateral rotado**

Texto «FLECHAS DE SENTIDO» rotado 90° antihorario, pegado al borde izquierdo del viewport. Implementación: position: fixed; left: \-60px; top: 50%; transform: rotate(-90deg); font-size: 10px; letter-spacing: 0.25em; color: \#555;

Debajo del label hay un ícono circular (⊙) en magenta, también en posición fija.

## **5\. Espaciados y márgenes**

| Elemento | Valor | CSS / nota |
| :---- | :---- | :---- |
| Margen lateral | \~80px (desktop) | max-width: 1440px; padding: 0 80px |
| Ancho contenedor | \~1280px | margin: 0 auto |
| Gutter entre columnas | \~24px | gap: 24px en grid de 3 cols |
| Padding hero imagen circular | 0 | La imagen circular llega al borde del contenedor izq. |
| Espacio entre nav y hero | 0 | El hero va inmediatamente bajo el nav |
| Altura navbar | \~72px | Con logo y links centrados verticalmente |
| Radio imagen hero | 50% | border-radius: 50%; overflow: hidden |
| Padding bloque magenta especial | 24px 28px | Arriba/abajo: 24px; izq/der: 28px |
| Espacio entre cards | 24px | gap en CSS grid |
| Padding interno card | 0 | Las cards no tienen padding propio; se separan por gap |
| Margen texto bajo imagen card | 12px arriba | margin-top: 12px en el bloque de texto |
| Separador entre secciones | borde bottom 1px \#eee | O espacio en blanco de \~48px |

## **6\. Componentes detallados**

| Componente | Descripción visual | Notas de implementación |
| :---- | :---- | :---- |
| Navbar | Logo (círculo negro \+ tipografía blanca) \+ tagline gris \+ links \+ íconos búsqueda/redes | Sticky en scroll. Link activo: color azul \#2A5C9A \+ underline. Separador vertical antes de íconos sociales. |
| Hero especial | Imagen circular flotante a la izquierda (aprox. 55% del ancho) \+ bloque texto a la derecha | Bloque magenta ocupa \~45% ancho col. derecha. Imagen va sin marco, con sombra suave opcional. |
| Bloque magenta | Rectángulo sólido \#E8327A con texto H1 blanco, sin bordes redondeados | No usar border-radius. Ocupa el ancho del texto, no 100% de la columna. Puede quebrarse en dos líneas. |
| Bajada especial | Texto regular bajo el bloque magenta, seguido de CTA con ícono | El ícono CTA es un círculo con punto central (⊙), color magenta. |
| Grid de cards | 3 columnas iguales, imagen arriba (rectangular, relación \~16:10), texto abajo | Imágenes: algunas en blanco y negro, algunas a color. Sin border-radius en imágenes. Sin sombra en cards. |
| Card texto | Fecha (gris) → Título (magenta, bold) → «por Nombre» (itálica gris) → Bajada (gris regular) | El nombre del autor va en itálica y color más oscuro que la bajada. |
| Label lateral «Flechas de sentido» | Texto rotado 90° antihorario, pegado al borde izquierdo | font-size: 10px; letter-spacing: 0.25em; color: \#555; transform: rotate(-90deg) |
| Ícono navegación inferior | Círculo con punto, color magenta, alineado bajo el label lateral | Puede ser SVG simple: círculo externo \+ punto interno, stroke magenta. |
| Divisor de secciones | Línea 1px color \#EEEEEE o espacio en blanco generoso | No usar líneas decorativas adicionales. |

## **7\. Variables CSS recomendadas**

Definir en :root para mantener consistencia en toda la implementación:

:root {  
  \--color-magenta:     \#E8327A;  
  \--color-negro:       \#1A1A1A;  
  \--color-blanco:      \#FFFFFF;  
  \--color-fondo:       \#F5F5F5;  
  \--color-gris-txt:    \#555555;  
  \--color-gris-borde:  \#CCCCCC;  
  \--color-nav-activo:  \#2A5C9A;  
  \--color-nav-link:    \#333333;

  \--font-principal:    'Helvetica Neue', Arial, sans-serif;

  \--size-logo:         52px;  
  \--size-h1-especial:  clamp(40px, 4.5vw, 60px);  
  \--size-card-titulo:  clamp(18px, 1.5vw, 22px);  
  \--size-nav-link:     14px;  
  \--size-eyebrow:      11px;  
  \--size-fecha:        12px;

  \--radio-hero:        50%;  
  \--contenedor-max:    1440px;  
  \--padding-lateral:   80px;  
  \--gap-cards:         24px;  
}

## **8\. Comportamiento e interacción**

1. **Navbar sticky:** permanece visible al hacer scroll. Sin cambio de color ni sombra al hacer scroll (fondo blanco siempre).

2. **Hover en links de nav:** color cambia a \#E8327A. Sin subrayado adicional.

3. **Hover en títulos de cards:** leve oscurecimiento del magenta (\#C4275F). Sin transición de posición.

4. **Hover en imagen de card:** leve zoom (scale: 1.03, transition: 0.3s ease) sobre el contenedor con overflow: hidden.

5. **CTA «Leer especial completo»:** hover cambia opacidad a 0.75. Sin cambio de fondo.

6. **Sin animaciones de entrada:** el diseño no usa fade-in ni slide en carga. El contenido aparece instantáneamente.

## **9\. Comportamiento responsive (indicativo)**

La captura de referencia es desktop (\~1440px). Para versiones móviles, aplicar estas adaptaciones:

* **≤ 768px:** Hero pasa a 1 columna; imagen circular queda arriba, texto abajo. Grid de cards pasa a 1 columna.

* **≤ 1024px:** Grid de cards pasa a 2 columnas. Padding lateral reduce a 32px.

* **Navbar móvil:** hamburguesa. Links en menú desplegable vertical. Tagline se oculta.

* **Label lateral:** se oculta en móvil (display: none en ≤ 768px).

## **10\. Checklist de entrega**

Antes de entregar la implementación, verificar:

7. ☐  El magenta es exactamente \#E8327A (no rosado, no rojo)

8. ☐  El bloque especial NO tiene border-radius

9. ☐  La imagen hero es perfectamente circular (no ovalada)

10. ☐  Las imágenes de cards NO tienen border-radius

11. ☐  El eyebrow está en mayúsculas y color magenta

12. ☐  El autor de cada card va en itálica precedido de «por»

13. ☐  El navbar es sticky y el link activo está en azul \#2A5C9A

14. ☐  El label lateral está rotado y en posición fija

15. ☐  Las variables CSS están definidas en :root

Guía elaborada a partir de captura de referencia. Julio 2026\.