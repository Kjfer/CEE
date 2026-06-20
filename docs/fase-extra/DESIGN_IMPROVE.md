# Propuesta de Mejora de Diseño — CEE-FIIS

> Objetivo: llevar la interfaz actual (web pública + admin) hacia un lenguaje visual **más minimalista**, sin alterar la distribución/estructura de páginas ya construida, manteniendo los colores e identidad oficiales del Centro de Especialización Ejecutiva según el `MANUAL_GRAFIC.pdf`.

---

## 1. Base: lo que dice el manual de marca

Del manual de identidad visual del CEE se extraen las reglas que **no son negociables** y deben seguir siendo la base de cualquier mejora:

| Elemento | Especificación oficial |
|---|---|
| Tipografía principal | **Poppins** (Bold para el logo y títulos, familia completa para el resto) |
| Color guinda (primario) | `#682222` — RGB (104, 34, 34) |
| Color negro | `#000000` |
| Color plomo/gris | `#A9A9A9` |
| Color blanco | `#FFFFFF` |
| Regla de uso | "Para publicidad se usan máximo 4 colores, y solo estos con diferente luminosidad" |
| Errores a evitar | Sobrecarga de íconos/símbolos que no aportan, exceso de elementos visuales, ausencia de jerarquía clara en títulos, fondos que "desentonan", relleno innecesario |

**Lectura para UI/UX:** el manual ya pide minimalismo a su manera — "no sobrecargar de textos o símbolos", "usar el espacio adecuadamente". Esta propuesta simplemente traduce esa filosofía (pensada para piezas gráficas/flyers) al lenguaje de un sistema de diseño web.

### 1.1 Brecha actual entre el código y el manual

Revisando `tailwind.config.ts` (web y admin) y `index.css`, el proyecto **ya usa el guinda institucional** correctamente:

```ts
cee: {
  red: '#8B1A1A',       // ⚠️ no coincide exactamente con el manual (#682222)
  'red-dark': '#6B1212',
  cream: '#F5F0E8',      // no está en el manual
}
```

```css
--primary: 0 72% 31%;   /* ≈ #8B1A1A */
```

**Hallazgo principal:** el rojo/guinda usado en todo el frontend (`#8B1A1A`) es una variación más clara y saturada que el guinda oficial del manual (`#682222`). No es un error grave —ambos están en la misma familia—, pero para alinear 100% con el manual conviene corregirlo. El `cee-cream` (`#F5F0E8`) tampoco existe en el manual; el plomo institucional (`#A9A9A9`) es el sustituto correcto para fondos/acentos neutros.

---

## 2. Principios de la propuesta minimalista

1. **Menos color, más jerarquía tipográfica.** El guinda se reserva para acciones primarias, estados activos y acentos puntuales — no para decorar. Hoy se usa en demasiados lugares simultáneos (fondos de hero, badges, bordes, hovers, iconos), lo que le resta peso a las acciones reales (CTAs).
2. **Tipografía como protagonista.** Cambiar la fuente del body de "Inter / system-ui" a **Poppins** en ambas apps (actualmente solo está declarada en el manual, pero el código usa `Inter`). Esto es la corrección más importante para alinear con marca.
3. **Espacio en blanco generoso.** Reducir bordes duros, sombras pesadas y "cajas dentro de cajas". Aumentar el `padding`/`gap` en vez de añadir líneas divisorias.
4. **Menos bordes, más espaciado y contraste sutil.** Sustituir `border` + `shadow-sm` simultáneos por **un** recurso a la vez.
5. **Paleta reducida a 4 colores + escala de grises**, tal como indica el manual ("máximo 4 colores, solo con diferente luminosidad"): guinda, negro, plomo y blanco, con variaciones de opacidad/luminosidad en vez de colores nuevos (nada de verdes/ámbares para estados, ver sección 5).
6. **Iconografía con propósito.** Mantener `lucide-react` (ya es minimalista por diseño) pero reducir su densidad en dashboards y tarjetas: un ícono por componente, no por cada micro-elemento.
7. **Mantener intacta la distribución/estructura.** No se proponen cambios de layout, rutas, ni reordenamiento de secciones — todo el catálogo de páginas, el grid de cursos, el sidebar del admin, etc. permanecen donde están. Los cambios son de **superficie visual**: color, tipografía, espaciado, bordes, sombras.

---

## 3. Sistema de diseño actualizado (tokens)

### 3.1 Colores — alineación exacta con el manual

Reemplazar en `apps/web/tailwind.config.ts` y `apps/admin/tailwind.config.ts`:

```ts
// ANTES
cee: {
  red: '#8B1A1A',
  'red-dark': '#6B1212',
  cream: '#F5F0E8',
},

// PROPUESTA — colores exactos del manual de marca
cee: {
  red: '#682222',        // guinda institucional exacto
  'red-dark': '#4F1A1A', // versión oscurecida del mismo guinda (misma familia, -25% luminosidad)
  'red-light': '#8C3A3A',// versión clara para hovers sutiles (+20% luminosidad)
  gray: '#A9A9A9',        // plomo institucional — reemplaza a "cream"
  ink: '#000000',         // negro institucional, para texto de alto contraste puntual
},
```

Y en `index.css` (ambas apps), ajustar las variables HSL para que `--primary` apunte al guinda real:

```css
:root {
  --primary: 0 43% 27%;       /* #682222 en HSL */
  --primary-foreground: 0 0% 100%;

  --secondary: 0 0% 95%;      /* gris muy claro, casi blanco — sustituye el tono crema */
  --secondary-foreground: 0 0% 10%;

  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 42%;

  --accent: 0 0% 95%;
  --accent-foreground: 0 0% 10%;

  --border: 0 0% 90%;         /* borde más sutil que el actual 24 16% 88% */
  --ring: 0 43% 27%;
}
```

> **Nota práctica:** esto NO rompe ningún componente porque todos consumen las variables CSS (`hsl(var(--primary))`, `bg-cee-red`, etc.) — solo cambia el valor final del color, no su uso.

### 3.2 Tipografía — adoptar Poppins

`apps/web/src/index.css` y `apps/admin/src/index.css` actualmente declaran:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

**Propuesta:**

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

body {
  font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, sans-serif;
}
```

Y en `tailwind.config.ts` (ambas apps), agregar el token de fuente para poder usar `font-sans` consistentemente:

```ts
theme: {
  extend: {
    fontFamily: {
      sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    // ...resto igual
  },
},
```

**Jerarquía tipográfica minimalista sugerida:**

| Uso | Peso | Tamaño (web) | Tamaño (admin) |
|---|---|---|---|
| H1 hero | 800 (extrabold) | `text-4xl sm:text-5xl` | — |
| H1 página | 700 (bold) | `text-3xl` | `text-2xl` |
| H2 sección | 600 (semibold) | `text-2xl` | `text-lg` |
| Body | 400 (regular) | `text-base` | `text-sm` |
| Etiquetas / labels | 500 (medium), `tracking-wide`, uppercase | `text-xs` | `text-xs` |

Reducir el uso de `font-bold` indiscriminado (hoy aparece en casi todos los `<p>` de precio, badges y nav) a solo **un nivel de énfasis por componente**.

### 3.3 Bordes, sombras y radios

- Reemplazar `shadow-sm` + `border` simultáneos (ver `Card`, `CourseCard`, `ValueCard`) por **uno de los dos**, priorizando el borde sutil sobre la sombra. Las sombras se reservan para elementos flotantes reales (modales, dropdowns, toasts).
- Aumentar levemente el radio base para un look más suave y actual:

```ts
// tailwind.config.ts
borderRadius: {
  lg: '0.75rem',                 // antes var(--radius) = 0.5rem
  md: 'calc(0.75rem - 4px)',
  sm: 'calc(0.75rem - 6px)',
},
```

- Quitar `hover:shadow-lg` agresivos (`ValueCard`, `VideoGallery` article) y sustituir por `hover:border-cee-red/40` o un sutil `hover:-translate-y-0.5 transition`.

---

## 4. Cambios concretos por componente/página

### 4.1 Navbar (`Navbar.tsx`)
- Mantener estructura (logo izq., links centro, acciones der.) — **sin cambios de layout**.
- Quitar el `backdrop-blur` + `bg-background/95` por un `bg-background` sólido con `border-b border-border` más delgado (`border-b` en vez de combinarlo con blur, que añade "ruido" visual sobre contenido con imágenes).
- Logo: usar el isotipo oficial (la "C" guinda/negro/plomo) en vez del texto suelto "CEE-FIIS" en `font-bold`, para reforzar marca real, no solo color.

### 4.2 Hero (Home, About, Multimedia)
Actualmente: `bg-gradient-to-br from-cee-red to-cee-red-dark text-white` en las tres páginas — funciona, pero el manual no usa degradados en su sistema de color (solo color plano con variación de luminosidad puntual). 

**Propuesta:** sustituir el degradado por:
```html
<section className="bg-cee-red text-white">
```
Color plano + tipografía Poppins en bold ya genera suficiente impacto visual sin degradados, que tienden a verse "genéricos" / no-institucionales. Si se quiere mantener algo de profundidad, usar el plomo como acento de borde inferior (`border-b-4 border-cee-gray`) en vez de gradiente.

### 4.3 CourseCard / tarjetas de catálogo
- Quitar `shadow-sm` del estado base; dejar sombra solo en `hover`.
- El badge de categoría (`bg-secondary ... text-cee-red`) pasa a `border border-cee-red/30 text-cee-red bg-transparent` — outline en vez de relleno, más limpio y permite que el guinda real destaque solo en el precio y el CTA.
- Precio: mantener en guinda y bold (es información jerárquica real, no decorativa) — coherente con el principio "menos color, pero donde importa".

### 4.4 Botones (`button.tsx`, ambas apps)
- El variant `default` ya usa `bg-primary` correctamente — solo se beneficia del nuevo valor de `--primary`.
- Quitar `variant="outline"` con doble peso visual (border + hover invertido) en contextos secundarios; usar `variant="ghost"` con texto en guinda para acciones terciarias (ej. "Cancelar" en formularios).

### 4.5 Dashboard / SummaryCard (admin)
- El ícono actualmente vive en un círculo `bg-cee-red/10 text-cee-red` — mantener, es un buen ejemplo de "color con propósito" (no decorativo, comunica la categoría de la métrica).
- Quitar el color condicional verde/rojo en el indicador de tendencia (`text-emerald-600` vs `text-destructive`) y sustituirlo por la lectura del manual ("máximo 4 colores, solo con diferente luminosidad"): usar **guinda para positivo, plomo/gris para negativo**, con un ícono de flecha (▲/▼ de `lucide-react`) que refuerce el sentido sin depender solo del color (mejor accesibilidad también).

```tsx
// ANTES
isPositive ? 'text-emerald-600' : 'text-destructive'

// PROPUESTA
isPositive ? 'text-cee-red' : 'text-muted-foreground'
// + <ArrowUp /> o <ArrowDown /> de lucide-react junto al texto
```

### 4.6 StatusBadge (admin — cursos)
Misma lógica: los tres estados (`published`, `draft`, `review`) hoy usan verde/gris/ámbar. Para alinearse estrictamente al manual, la propuesta es:

| Estado | Color propuesto | Razonamiento |
|---|---|---|
| `published` | guinda sólido (`bg-cee-red text-white`) | estado "completo", máxima jerarquía |
| `review` | guinda outline (`border-cee-red text-cee-red`) | en progreso, menor peso que published |
| `draft` | gris/plomo (`bg-cee-gray/15 text-foreground`) | neutro, sin urgencia |

Esto es un cambio de color con impacto en UX (semáforo verde/ámbar/gris es un patrón muy reconocible) — se documenta como **opcional**: si el equipo prefiere mantener semáforo de colores por claridad funcional, se puede dejar como está, ya que no rompe el manual (son colores de estado del sistema, no de marca). La recomendación minimalista es usar la versión guinda/plomo si se prioriza pureza de marca sobre convención de semáforo.

### 4.7 Tablas (admin)
- Quitar el `hover:bg-muted/50` de cada fila si se usan muchas filas (genera "parpadeo" visual al recorrer la tabla); dejar solo borde inferior sutil entre filas, sin highlight de hover salvo que la fila sea clickeable como unidad completa.
- Mismo criterio de "outline en vez de relleno" para `StatusBadge` dentro de tablas, ya cubierto en 4.6.

### 4.8 Toasts
- Reemplazar fondo de color suave (`bg-green-50`, `bg-red-50`) por **borde de color + fondo blanco/neutro + ícono de color**, que es más minimalista y reduce el "ruido" de superficies de color:

```tsx
// PROPUESTA
success: 'border-l-4 border-l-cee-red bg-background text-foreground',
error:   'border-l-4 border-l-foreground bg-background text-foreground',
info:    'border-l-4 border-l-cee-gray bg-background text-foreground',
```

### 4.9 Formularios (CourseFormPage, ContactPage, Login/Register)
- Mantener distribución de campos (grid actual) intacta.
- Inputs: quitar el `ring-2` de foco por un `ring-1 ring-cee-red border-cee-red` más sutil — el foco debe notarse sin "saltar".
- Reducir el uso de `border-input` genérico de Tailwind/shadcn por `border-border` (ya está casi así, validar consistencia entre web y admin, hoy ambos usan tokens distintos sin diferencia real — unificar).

### 4.10 Footer
- Mantener 4 columnas. Quitar el ícono de red social con fondo circular `border` + hover `bg-white/10` (correcto) pero reducir tamaño de iconos sociales (`h-4 w-4` → mantener, ya es discreto) y aligerar el peso del texto de copyright (`text-xs text-white/70` ya está bien, sin cambios).

---

## 5. Reglas de paleta funcional (estados de UI)

El manual no cubre estados de sistema (error, éxito, advertencia) porque está pensado para piezas gráficas, no para una interfaz. Para no inventar colores fuera de marca pero sin sacrificar usabilidad, se proponen dos niveles:

1. **Dentro del producto (admin, formularios, toasts):** usar guinda/plomo/negro como exige el manual (ver 4.5, 4.6, 4.8).
2. **Validación de formularios (errores de campo):** se mantiene un rojo de error semántico estándar (`--destructive`) porque es un patrón de accesibilidad universal (WCAG) que los usuarios reconocen instantáneamente como "algo salió mal" — un guinda oscuro podría confundirse con el color de marca y no comunicar urgencia. Este es el **único** color fuera de la paleta de marca que se mantiene, y ya existe en el sistema actual (`--destructive: 0 84% 60%`).

---

## 6. Resumen ejecutable (checklist de implementación)

- [ ] Actualizar `cee.red` a `#682222` y derivados en `tailwind.config.ts` (web + admin)
- [ ] Reemplazar `cee.cream` por `cee.gray` (`#A9A9A9`)
- [ ] Importar y aplicar tipografía Poppins en `index.css` (web + admin)
- [ ] Agregar `fontFamily.sans` en `tailwind.config.ts` (web + admin)
- [ ] Ajustar variables HSL de `--primary`, `--secondary`, `--muted`, `--border` en `index.css`
- [ ] Aumentar `border-radius` base a `0.75rem`
- [ ] Quitar degradados de hero (Home, About, Multimedia) → color plano `bg-cee-red`
- [ ] Badges de categoría: relleno → outline (`border-cee-red text-cee-red bg-transparent`)
- [ ] SummaryCard: tendencia verde/rojo → guinda/plomo + ícono de flecha
- [ ] Toasts: fondo de color → borde lateral de color + fondo neutro
- [ ] Tarjetas: sombra solo en hover, no en estado base
- [ ] Revisar consistencia de `border-input` vs `border-border` entre web y admin
- [ ] (Opcional) Unificar StatusBadge a escala guinda/plomo en vez de semáforo verde/ámbar/gris

---

## 7. Lo que **no** cambia

Para que quede explícito y se pueda usar este documento como contrato de alcance:

- No se modifica el árbol de rutas (`router.tsx` en ninguna de las dos apps).
- No se modifica la estructura de datos (`@cee/types`), servicios, mocks, ni lógica de negocio.
- No se modifica el grid/layout de ninguna página (catálogo, dashboard, ventas, curso, etc.) — solo estilos de superficie.
- No se agregan ni quitan secciones, módulos o funcionalidades.
- Los componentes `ui/*` (shadcn) mantienen su API — solo cambian las clases/tokens que consumen.
