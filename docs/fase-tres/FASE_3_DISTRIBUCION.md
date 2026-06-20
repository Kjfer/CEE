# Fase 3 — Páginas Públicas
## Distribución de Tareas por Miembro del Equipo

> **Período:** Inicio hoy (18 de junio, 2026)  
> **Objetivo Principal:** Construir el sitio público con datos mock, completamente responsivo.  
> **Criterio de cierre:** Las páginas renderizan con datos mock, responsive en desktop, tablet y móvil, sin errores de consola.

---

## 📋 Resumen Ejecutivo

Se distribuyen **5 frentes de trabajo** entre los miembros del equipo de IDI. Cada miembro es responsable de:
- Implementación de componentes específicos
- Integración con `@cee/types` y servicios mock
- Testing responsivo en desktop, tablet y móvil
- Documentación de cambios en el código

**Flujo de entrega:** Cada miembro harán PR contra `main` cuando su componente esté listo; se revisan para mantener consistencia visual y de código.

---

## 🎯 Distribución de Frentes de Trabajo

### **Frente 1: Home + CourseCard**
**Responsable:** [Nombre Desarrollador 1]

#### Tareas
- **Landing Hero**
  - Sección hero con título, subtítulo y CTA principal ("Explorar Cursos")
  - Imagen de fondo o degradado según guía gráfica
  - Responsive: ajustar tamaño de fuentes y espacios en móvil
  
- **Catálogo de Cursos en Home**
  - Mostrar grid de cursos (mínimo 6 cursos de fixtures en `mocks/`)
  - Filtro por categoría (dropdown/select, no necesario busca texto)
  - Button "Ver más" que linkea a `/catalogo`
  
- **Componente CourseCard**
  - Tarjeta reutilizable con:
    - Imagen del curso (lazy load con fallback)
    - Nombre y descripción corta (truncada a 80 caracteres)
    - Categoría (badge)
    - Precio tachado (antes) y precio actual (rojo/destacado)
    - Botón "Añadir al carrito" (integración inicial con `cartStore`)
  - Hover effect (sombra, escala leve)
  - Estados: disponible / agotado (visual)
  
- **Tipos a usar:** `@cee/types` — `Course`, `Category`
- **Servicios:** `courseService.getAllCourses()` (mock)
- **Entrega esperada:** 
  - `pages/Home.tsx`
  - `components/CourseCard.tsx`
  - `components/CourseFilter.tsx` (si es modular)
  - Tests básicos de responsividad

---

### **Frente 2: Catálogo Avanzado**
**Responsable:** [Nombre Desarrollador 2]

#### Tareas
- **Página de Catálogo Full**
  - URL: `/catalogo` o `/programas`
  - Sidebar con filtros (desktop) / offcanvas (móvil)
  
- **Filtros**
  - Por categoría (checkbox o dropdown)
  - Por modalidad (síncrono, asíncrono, híbrido)
  - Rango de precio (slider o inputs range)
  - Aplicar / Limpiar filtros
  
- **Búsqueda y Paginación**
  - Input text que filtra por título y descripción
  - Paginación (ej. 12 cursos por página)
  - Indicador "Mostrando X de Y resultados"
  - Links de página (1, 2, 3... Siguiente)
  
- **Ordenamiento**
  - Dropdown: Relevancia / Precio (menor-mayor) / Precio (mayor-menor) / Más recientes
  
- **Tipos a usar:** `Course`, `Category`, `Modality`
- **Servicios:** `courseService.filterCourses(params)` (mock)
- **Entrega esperada:**
  - `pages/Catalog.tsx`
  - `components/FilterSidebar.tsx`
  - `components/PaginationControls.tsx`
  - Integración con `CourseCard` del Frente 1

---

### **Frente 3: Detalle de Curso**
**Responsable:** [Nombre Desarrollador 3]

#### Tareas
- **Página de Detalle** (`/curso/:id`)
  - Breadcrumb navegable (Home > Programas > [Nombre Curso])
  - Información completa del curso:
    - Título grande
    - Descripción larga
    - Docentes (si aplica)
    - Modalidad y duración
    - Requisitos previos (si existen)
  
- **Perfil del Egresado**
  - Sección con información de competencias adquiridas
  - Lista de puntos clave (logros, habilidades)
  
- **Sílabo en Acordeón**
  - Estructura modular (unidad 1, unidad 2, etc.)
  - Cada unidad expandible
  - Lista de temas dentro de cada unidad
  - Iconos de expandir/contraer
  
- **Plana Docente**
  - Tarjetas con foto (placeholder), nombre, especialidad
  - Email o enlace (opcional)
  
- **Sidebar (Desktop) / Footer (Mobile)**
  - Precio con tachado
  - Botón "Añadir al carrito" (grande, coloreado)
  - Botón "Descargar Sílabo" (PDF)
  - Información de inscripción (fecha límite, cupos, etc.)
  - Reviews / calificaciones (opcional, mock)
  
- **Tipos a usar:** `Course`, `Teacher`, `Syllabus`, `CourseDetail`
- **Servicios:** `courseService.getCourseById(id)`, `syllabusService.getSyllabusByCourse(id)` (mock)
- **Entrega esperada:**
  - `pages/CourseDetail.tsx`
  - `components/Breadcrumb.tsx` (reutilizable)
  - `components/SyllabusAccordion.tsx`
  - `components/TeacherCard.tsx`
  - `components/CourseSidebar.tsx`

---

### **Frente 4: Nosotros + Multimedia**
**Responsable:** [Nombre Desarrollador 4]

#### Tareas
- **Página "Nosotros"** (`/nosotros` o `/about`)
  - Hero section con misión/visión del CEE
  - Historia del CEE (párrafo + imagen)
  - Valores (3-4 cards con icono + descripción)
  - Estadísticas destacadas (número de egresados, años, etc.)
  - Llamada a acción final
  
- **Sección de Multimedia**
  - Galería de videos (lazy load)
  - Cada video con:
    - Thumbnail (imagen placeholder)
    - Título y descripción corta
    - Icono de play en hover
    - Click abre lightbox o reproductor embebido
  - Considerar **CDN o almacenamiento externo** (requisito de rendimiento)
    - Si se usa YouTube: embed directo
    - Si se usa servidor propio: implementar lazy load agresivo
  - Grid responsive (3 columnas desktop, 2 tablet, 1 móvil)
  
- **Optimización de Rendimiento**
  - Imágenes con `<img loading="lazy">`
  - Videos no autoplay
  - Docstring en código: "Videos de CDN para no penalizar carga inicial"
  
- **Tipos a usar:** `Video`, `Media`, `Organization` (si aplica)
- **Servicios:** `mediaService.getVideos()` (mock)
- **Entrega esperada:**
  - `pages/About.tsx`
  - `components/VideoGallery.tsx`
  - `components/ValueCard.tsx`
  - Documentación de estrategia CDN/lazy load

---

### **Frente 5: Contacto + Autenticación**
**Responsable:** [Nombre Desarrollador 5]

#### Tareas
- **Página de Contacto** (`/contacto`)
  - Formulario con validación:
    - Nombre (required, min 3 caracteres)
    - Email (required, email válido)
    - Teléfono (optional, formato)
    - Asunto (required)
    - Mensaje (required, min 10 caracteres)
  - Anti-spam (honeypot field opcional)
  - Submit → Servicios mock envia datos (`contactService.submitForm()`)
  - Toast/alert de éxito o error
  - Información de contacto en columna lateral (teléfono, email, ubicación)
  - Mapa embebido (Google Maps o Leaflet, opcional)
  
- **Login y Registro** (Modal/Drawer o página dedicada)
  - Ubicación: Navbar → Botón "Ingresar"
  - Layout split (dos columnas en desktop, stack en móvil)
    - Columna izquierda: Formulario de login
    - Columna derecha: Información de beneficios o link a registro
  
  - **Login:**
    - Email + contraseña
    - Checkbox "Recordarme"
    - Link "¿Olvidó contraseña?"
    - Validación de tipos
    - Integración con `authStore.login()`
    - Redirect a `/dashboard` o home tras éxito
  
  - **Registro:**
    - Nombre completo, Email, Contraseña, Confirmar contraseña
    - Términos y condiciones (checkbox)
    - Botón enviar
    - Integración con `authStore.register()`
  
- **Flujo de Autenticación Mock**
  - `authService.login(email, password)` devuelve usuario + token mock
  - Token se guarda en `authStore` (y localStorage vía store)
  - Botón "Ingresar" en Navbar cambia a "Mi Perfil" cuando autenticado
  
- **Tipos a usar:** `User`, `AuthResponse`, `Contact`, `LoginRequest`
- **Servicios:** `authService.login()`, `authService.register()`, `contactService.submitForm()` (mock)
- **Entrega esperada:**
  - `pages/Contact.tsx`
  - `pages/Login.tsx` (o modal `components/LoginModal.tsx`)
  - `components/ContactForm.tsx`
  - `components/AuthLayout.tsx` (layout split)
  - Integración con stores (`authStore`, `cartStore`)

---

## 📦 Dependencias Compartidas y Requisitos

### Archivos ya existentes (de Fase 2)
- ✅ Layout.tsx (con Navbar, Footer, Outlet)
- ✅ Navbar.tsx (con badge carrito, botón sesión)
- ✅ MobileMenu.tsx
- ✅ Footer.tsx
- ✅ Router configurado con lazy()

### Archivos a usar / completar en Fase 3
- `@cee/types` (tipos base: Course, Category, User, etc.)
- `mocks/courses.ts` (fixtures de cursos)
- `mocks/users.ts` (fixtures de usuarios, opcional)
- `services/courseService.ts` (mock, retorna datos de fixtures)
- `services/authService.ts` (mock)
- `services/contactService.ts` (mock)
- `services/mediaService.ts` (mock para videos)
- `stores/authStore.ts` (Zustand store)
- `stores/cartStore.ts` (Zustand store)
- Componentes de `shadcn/ui` ya disponibles

### Reglas de código
- ✅ Usar TypeScript en todo (.tsx)
- ✅ Importar tipos de `@cee/types`
- ✅ Usar Tailwind para estilos
- ✅ Componentes en PascalCase
- ✅ Alias `@/` obligatorio
- ✅ Sin `localStorage` directo; usar `authStore`
- ✅ Validaciones en formularios con Zod (si es necesario) o validación manual
- ✅ Responsive-first: CSS mobile-first, luego media queries

---

## 🔄 Workflow de Entrega

### Checklist por Frente

**Antes de hacer PR:**
1. ✅ Componentes creados en carpeta correcta (`pages/`, `components/`)
2. ✅ Importaciones usan alias `@/`
3. ✅ Tipos importados de `@cee/types`
4. ✅ Servicios usando `VITE_USE_MOCKS=true`
5. ✅ Sin errores en consola (ejecutar `pnpm dev` y revisar DevTools)
6. ✅ Responsivo en 3 breakpoints: 
   - Mobile: 375px (iPhone SE)
   - Tablet: 768px (iPad)
   - Desktop: 1200px+
7. ✅ Imágenes con `loading="lazy"` (si aplica)
8. ✅ Botones con feedback visual (hover, focus)
9. ✅ PR incluye descripción de cambios

### Entregables finales por Frente

| Frente | Archivos | Líneas aprox | Dependencias |
|--------|----------|--------------|-------------|
| 1 | Home.tsx, CourseCard.tsx, CourseFilter.tsx | 300-400 | courseService, @cee/types |
| 2 | Catalog.tsx, FilterSidebar.tsx, PaginationControls.tsx | 400-500 | courseService, CourseCard |
| 3 | CourseDetail.tsx, Breadcrumb.tsx, SyllabusAccordion.tsx, TeacherCard.tsx | 500-700 | courseService, syllabusService |
| 4 | About.tsx, VideoGallery.tsx, ValueCard.tsx | 300-400 | mediaService |
| 5 | Contact.tsx, Login.tsx, ContactForm.tsx, AuthLayout.tsx | 400-500 | authService, contactService, authStore |

---

## ⚠️ Decisiones Pendientes

Antes de finalizar esta fase, el equipo debe cerrar:

1. **¿"Especializaciones" es página o filtro?**
   - Si es página: añadir a router y a Navbar
   - Si es filtro: incluir en Frente 2 (Catálogo)
   
2. **¿Auth es Modal o Página separada?**
   - Recomendación: Modal/Drawer en Navbar (mejor UX)
   - Si es página: cambiar Frente 5 a `/login` como ruta independiente

3. **¿Dónde se guarda el token de autenticación?**
   - Decidido: `authStore` (Zustand)
   - `authStore` puede persistir a `localStorage` si es necesario

4. **Estrategia exacta de CDN para videos (Frente 4)**
   - ¿YouTube embeds? → No se compra storage
   - ¿Vimeo? → Opción profesional
   - ¿Servidor propio + AWS S3? → Requiere backend

---

## 📅 Estimación de Tiempo

Asumiendo sprint de 1-2 semanas:

| Frente | Estimación | Notas |
|--------|-----------|-------|
| 1 | 2-3 días | Más rapido, componentes simples |
| 2 | 2-3 días | Filtros + paginación requiere lógica |
| 3 | 3-4 días | Más contenido, acordeón, sidebar |
| 4 | 2 días | Multimedia es la parte clave |
| 5 | 3-4 días | Formularios + auth + validación |
| **Total** | **12-17 días** | Con work en paralelo: ~1 semana |

---

## 📞 Comunicación y Escaladas

- **Meetings diarios:** 15 min standup (qué hiciste, qué harás, bloqueos)
- **Bloqueadores:**
  - Si falta un tipo en `@cee/types`: comenta en el PR de tipos
  - Si un servicio mock no funciona: valida con el responsable de Fase 1 (capa mock)
  - Si hay conflicto de estilos: revisar `MANUAL_GRAFIC.pdf` o preguntar a diseño

---

## ✅ Criterios de Aceptación (Definition of Done)

La Fase 3 se considera **COMPLETA** cuando:

1. ✅ Las 5 páginas públicas renderizan sin errores de consola
2. ✅ Los datos provienen de fixtures mock (`VITE_USE_MOCKS=true`)
3. ✅ El carrito captura clics de "Añadir" y muestra badge en Navbar
4. ✅ Auth guarda estado en `authStore` (logout borra el estado)
5. ✅ Contacto submite datos sin error (mock)
6. ✅ Responsive verificado en:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop 1920px
7. ✅ Todos los componentes usan `@cee/types`
8. ✅ Sin warnings de ESLint (excepto los declarados)
9. ✅ PR reviews aprobadas por al menos un miembro del equipo
10. ✅ Documentación en README de `/packages/types` si hay nuevos tipos

---

**Documento preparado:** 18 de junio, 2026  
**Fase anterior completada:** Fase 2 (Layout y Navegación)  
**Siguiente fase:** Fase 4 (Carrito y Flujo de Conversión)
