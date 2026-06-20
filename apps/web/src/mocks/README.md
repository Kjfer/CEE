# Capa de datos mock

Los fixtures de esta carpeta alimentan los services cuando `VITE_USE_MOCKS=true`.
Con el backend listo, basta cambiar esa variable para que los services apunten a la API real sin tocar ninguna firma de función.

## Apagar los mocks

En `apps/web/.env.local` (o `.env`):

```dotenv
VITE_USE_MOCKS=false
VITE_API_URL=http://localhost:3000/api   # URL del backend real
```

## Qué tocar cuando llegue el backend

| Archivo | Qué revisar |
|---|---|
| `packages/types/src/index.ts` | Confirmar que los campos y tipos coinciden con los contratos reales devueltos por la API (especialmente los marcados `TODO(backend)`). |
| `apps/web/src/services/*.service.ts` | Verificar que los endpoints (`API_ENDPOINTS`) y los tipos de respuesta de la rama real (`if (!USE_MOCKS)`) coinciden con la API. |
| `data/courses.mock.ts` | Los valores de `CourseModality` (`'Virtual'`, `'Presencial'`, `'Híbrido'`) y `CourseStatus` (`'published'`, `'draft'`, `'review'`) deben coincidir exactamente con los que devuelva el backend. |
| `data/sales.mock.ts` | `breakdown` cubre todos los cursos publicados; `kpis.totalSales` y `kpis.totalRevenue` coinciden con las sumas del array. Si el backend calcula los KPIs de forma distinta, ajustar el fixture para que los tests de UI sigan siendo coherentes. |
