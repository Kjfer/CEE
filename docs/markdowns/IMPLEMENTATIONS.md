# IMPLEMENTATIONS.md — Registro de Implementaciones CEE-FIIS

> **Documento vivo.** Cada cambio, tarea completada o modificación se documenta aquí con contexto, archivos afectados y decisiones tomadas.
> Actualizar conforme avanza el desarrollo.

---

## Fase 2 — Layout y Navegación

### ✅ Elvis — Contrato Compartido (Tarea 1)

**Estado:** Completada  
**Fecha:** 2026-06-17  
**Rama:** `feature/fase2-navigation-contract`

#### Objetivo
Crear la única fuente de verdad de navegación + stubs de stores para que el equipo (Santiago, Isabel, Diana, Tom, Renato) trabaje en paralelo contra un contrato estable, sin duplicar links en Navbar/Footer/MobileMenu.

#### Cambios realizados

##### 1. Crear `apps/web/src/config/navigation.ts`
- **Propósito:** Array tipado `navigationLinks: NavLink[]` con todos los links públicos del sitio
- **Contenido:**
  - `Inicio` → `/`
  - `Nosotros` → `/nosotros`
  - `Programas` → `/programas`
  - `Multimedia` → `/multimedia`
  - `Contacto` → `/contacto`
- **Decisión C documentada:** "Especializaciones" es un filtro dentro de `/programas`, no ruta propia
- **Interfaz:** `NavLink { label: string; path: string }`

##### 2. Refactorizar `apps/web/src/components/layout/Navbar.tsx`
- **Antes:** 
  - Array `links` hardcodeado localmente
  - `useAuthStore()` directa
- **Después:**
  - Importa `navigationLinks` desde `@/config/navigation`
  - Usa `useAuth()` hook (ya existía)
  - Itera `navigationLinks.map()` en lugar de `links.map()`
  - MobileMenu ya no recibe `links` por props

##### 3. Refactorizar `apps/web/src/components/layout/Footer.tsx`
- **Antes:** Array `links` hardcodeado localmente
- **Después:**
  - Importa `navigationLinks` desde `@/config/navigation`
  - Itera `navigationLinks.map()` en la sección de "Enlaces rápidos"

##### 4. Refactorizar `apps/web/src/components/layout/MobileMenu.tsx`
- **Antes:** Recibía `links` por props desde Navbar
- **Después:**
  - Importa `navigationLinks` desde `@/config/navigation`
  - Itera `navigationLinks.map()` directamente
  - Simplifica Props: solo `onClose`
  - Usa `useAuth()` hook en lugar de acceso directo a store

##### 5. Mantener `apps/web/src/hooks/useAuth.ts`
- Ya existía como wrapper limpio de `authStore`
- Sin cambios requeridos

#### Archivos nuevos
- ✅ `apps/web/src/config/navigation.ts`

#### Archivos modificados
- ✅ `apps/web/src/components/layout/Navbar.tsx`
- ✅ `apps/web/src/components/layout/Footer.tsx`
- ✅ `apps/web/src/components/layout/MobileMenu.tsx`
- ✅ `apps/web/src/hooks/useAuth.ts` (sin cambios, solo confirmado)

#### Estado pre-existente notable
- `authStore` ya tenía lógica completa desde el scaffold inicial; no se tocó porque ya funcionaba correctamente

#### Verificación
- ✅ TypeScript compila sin errores en los archivos modificados
- ✅ Único error de build preexistente: `CourseCard.tsx` (Property 'hours' does not exist) — corresponde a Fase 3, fuera de alcance
- ✅ No rompe routing ni componentes de layout
- ✅ Navbar, Footer, MobileMenu funcionan con `navigationLinks` centralizado

#### Bloqueadores desbloqueados
- ✅ Santiago puede construir Navbar desktop contra `navigationLinks` + `useAuth()`
- ✅ Isabel puede construir MobileMenu contra `navigationLinks` + `useAuth()`
- ✅ Diana puede construir Footer contra `navigationLinks`
- ✅ Tom puede construir Router contra paths de `navigationLinks`
- ✅ Renato puede integrar todo contra Layout estable

#### Próximas tareas (Fase 2 restante)
- **Santiago:** Terminar Navbar desktop con logo, sticky, responsive
- **Isabel:** Terminar MobileMenu con Sheet de shadcn
- **Diana:** Terminar Footer con estructura de columnas, copyright dinámico
- **Tom:** Configurar Router v6 con lazy/Suspense para todas las rutas
- **Renato:** Integrar en Layout y validar responsive en mobile/tablet/desktop

---

### ✅ Eliminación del Carrito de Compras (decisión de alcance)

**Estado:** Completada  
**Fecha:** 2026-06-17

#### Objetivo
El carrito de compras se descartó del alcance del proyecto: ya no existe checkout ni flujo de compra mediada por carrito. Se elimina toda la lógica, UI y tipos relacionados.

#### Cambios realizados
- **Eliminado** `apps/web/src/store/cartStore.ts` (store de Zustand completo: `items`, `addItem`, `removeItem`, `clear`, `total`)
- **Eliminado** `CartItem` de `packages/types/src/index.ts` (interfaz `@cee/types`)
- **`apps/web/src/components/shared/CourseCard.tsx`:**
  - Removido `useCartStore` y la llamada a `addItem(course)`
  - El botón "Añadir" (al carrito) se reemplazó por un link "Ver detalles" que navega a `ROUTES.COURSE`
- **`apps/web/src/components/layout/Navbar.tsx`:**
  - Removido el icono `ShoppingCart` y el badge de cantidad
  - Removido `useCartStore` y el import de `lucide-react` correspondiente

#### Archivos eliminados
- ❌ `apps/web/src/store/cartStore.ts`

#### Archivos modificados
- ✅ `packages/types/src/index.ts` (sección "Carrito" eliminada)
- ✅ `apps/web/src/components/shared/CourseCard.tsx`
- ✅ `apps/web/src/components/layout/Navbar.tsx`

#### Verificación
- ✅ `grep` confirma cero referencias residuales a `cartStore`, `CartItem`, `useCartStore` en `apps/` y `packages/`
- ✅ Build (`pnpm --filter web build`) no introduce errores nuevos; el único error reportado (`CourseCard.tsx` — `Property 'hours' does not exist`) es preexistente del scaffold y no relacionado con el carrito

#### Impacto en el embudo de conversión
El flujo de conversión deja de pasar por "carrito → checkout mock" y termina directamente en la página de detalle del curso, desde donde el usuario continúa hacia contacto/registro. Si en el futuro se requiere "Inscribirse" o un flujo equivalente, debe diseñarse sin reintroducir el concepto de carrito.

---

## Notas de Arquitectura

### Decisión C — Especializaciones
- Resuelta como: **filtro dentro de /programas**, no ruta propia
- Alineado con `ROUTES.CATALOG = '/programas'`
- Plan: implementar en Fase 3 o 4 como filtro en la pantalla de catálogo

### Convenciones respetadas
- ✅ Solo `pnpm` (no npm/yarn)
- ✅ `@cee/types` como única fuente de tipos compartidos
- ✅ No editar `components/ui/` (shadcn)
- ✅ `localStorage` solo en `authStore`
- ✅ Alias `@/` funcional en Vite y TypeScript

### Patrón de hooks
- `useAuth()` → acceso limpio a `{ user, token, isAuthenticated, setAuth, logout }`

---
