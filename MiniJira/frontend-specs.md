# Frontend Specification — Mini Jira MVP (v0.1)

**Fecha:** 2026-04-22  
**Basado en:** specs.md (PRD v0.1), backlog.md (BDD Gherkin validado), DESIGN.md (Lucid Efficiency)  
**Estado:** Pendiente de confirmación antes de escribir código

---

## 1. Stack y Versiones

| Capa | Tecnología | Versión |
|---|---|---|
| Framework UI | React | 18.3.x (latest stable) |
| Lenguaje | TypeScript | 5.4.x (latest stable) |
| Build tool | Vite | 5.x (latest stable) |
| Routing | React Router | 6.23.x (latest stable) |
| Server state | TanStack Query (React Query) | 5.x (latest stable) |
| Client state | Zustand | 4.5.x (latest stable) |
| Drag and drop | @dnd-kit/core + @dnd-kit/sortable | 6.x (latest stable) |
| Auth OAuth | @react-oauth/google | latest stable |
| UI Components | shadcn/ui | latest |
| Styling | Tailwind CSS | 3.x (peer dep de shadcn) |
| Toasts | Sonner (vía shadcn) | latest |
| Linting | ESLint + Prettier | latest |
| Testing | Vitest + Testing Library | latest |

> El lockfile (`pnpm-lock.yaml` recomendado) es la fuente de verdad de los patch versions. Ninguna dependencia se actualiza sin revisión de breaking changes.

### Dependencias de producción completas

```
react, react-dom
react-router-dom
@tanstack/react-query
zustand
@dnd-kit/core
@dnd-kit/sortable
@dnd-kit/utilities
@react-oauth/google
@radix-ui/*          (vía shadcn CLI)
sonner
tailwind-merge
clsx
date-fns             ← formateo de fechas ISO 8601 en CSV y UI
```

### Dependencias de desarrollo

```
typescript
vite
@vitejs/plugin-react
vitest
@testing-library/react
@testing-library/user-event
eslint
prettier
tailwindcss, postcss, autoprefixer
```

---

## 2. Modelo de Datos (Frontend)

Los tipos derivan directamente del PRD §2.2 y §2.3. Son los contratos de la API que el frontend consume.

```typescript
// --- Enums ---

type TicketStatus = 'todo' | 'in_progress' | 'review' | 'done';
type Priority     = 'low' | 'medium' | 'high';
type UserRole     = 'admin' | 'member';

// --- Entidades principales ---

interface User {
  id:        string;   // uuid
  name:      string;
  email:     string;
  role:      UserRole;
  avatarUrl?: string;
}

interface Ticket {
  id:          string;          // uuid
  title:       string;          // ≤ 120 chars
  description?: string;         // markdown
  status:      TicketStatus;
  priority:    Priority;
  isBlocked:   boolean;         // flag lateral; no cambia columna
  assignees:   User[];
  labels:      string[];
  createdBy:   User;
  createdAt:   string;          // ISO 8601 UTC
  updatedAt:   string;          // ISO 8601 UTC
  archivedAt?: string;          // ISO 8601 UTC; presente = archivado
  version:     number;          // Optimistic Locking — SIEMPRE enviado en PATCH
}

interface Comment {
  id:         string;
  ticketId:   string;
  author:     User;
  body:       string;           // texto plano
  createdAt:  string;           // ISO 8601 UTC
  archivedAt?: string;          // soft delete
}

// --- Auth ---

interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
}

interface AuthSession {
  user:   User;
  tokens: AuthTokens;
}

// --- Métricas ---

interface MetricsSummary {
  closedByMonth: { month: string; count: number }[];   // month = 'YYYY-MM'
  byStatus:      { status: TicketStatus; count: number }[];
  byMember:      { user: User; activeCount: number }[];
}

// --- Filtros del tablero (URL + Zustand) ---

interface BoardFilters {
  status?:     TicketStatus[];
  priority?:   Priority[];
  assigneeId?: string;
  labelIds?:   string[];
  dateFrom?:   string;          // YYYY-MM-DD
  dateTo?:     string;          // YYYY-MM-DD
}

// --- CSV Export (espejo de query params del endpoint) ---

interface ExportFilters {
  from?:       string;          // YYYY-MM-DD
  to?:         string;          // YYYY-MM-DD
  status?:     TicketStatus[];
  assigneeId?: string;
}
```

---

## 3. Autenticación — Flujo Frontend con Google Workspace

El frontend gestiona el flujo OAuth 2.0 directamente usando `@react-oauth/google`.

### Variable de entorno requerida

```
VITE_GOOGLE_CLIENT_ID=<client_id_del_proyecto_en_google_cloud>
```

### Flujo

1. `LoginPage` renderiza el botón de Google (`<GoogleLogin>` de `@react-oauth/google`).
2. El usuario completa el flujo en el popup de Google; el callback recibe un `credential` (Google ID Token).
3. El frontend envía el token al backend: `POST /api/auth/google { credential }`.
4. El backend valida el ID Token contra Google, verifica que la cuenta esté aprovisionada, y devuelve `{ accessToken, user }`.
5. El frontend persiste `accessToken` en `sessionStorage` y almacena `user` en `authStore`.
6. El `refreshToken` viaja como `httpOnly cookie`; el frontend nunca lo lee directamente.
7. Toda petición incluye `Authorization: Bearer <accessToken>` inyectado en `src/lib/api.ts`.
8. Cuando el backend devuelve `401`, el cliente llama a `POST /api/auth/refresh`. Si falla, limpia la sesión y redirige a `/login`.

### Rehidratación al recargar

Al montar `App.tsx`, si existe `accessToken` en `sessionStorage`, se llama a `GET /api/auth/me` para rehidratar `authStore.user`. Si falla, se limpia el token y se redirige a `/login`.

### Rutas protegidas

`<ProtectedRoute>` envuelve todas las rutas excepto `/login`. Si `authStore.user` es `null`, redirige a `/login`.

---

## 4. Gestión de Estado

### División de responsabilidades

| Responsabilidad | Herramienta |
|---|---|
| Datos del servidor (tickets, usuarios, métricas) | TanStack Query |
| Sesión y usuario autenticado | Zustand `authStore` |
| Filtros activos del tablero | Zustand `boardFilterStore` + URL query params |
| Cambios locales del formulario tras 409 | Zustand `ticketDraftStore` |
| UI state efímero (modal abierto, loading local) | `useState` local |

### Stores de Zustand

```typescript
// authStore
{ user: User | null, accessToken: string | null, setSession, clearSession }

// boardFilterStore — sincronizado bidireccionalmente con URL query params
{ filters: BoardFilters, setFilter(key, value), resetFilters() }

// ticketDraftStore — preserva cambios locales del usuario tras un 409
{ draft: Partial<Ticket> | null, conflictVersion: number | null, setDraft, clearDraft }
```

### Sincronización de filtros con la URL

Los filtros del tablero persisten en los query params para permitir links compartibles. El `boardFilterStore` se inicializa leyendo los params actuales al montar `BoardPage`. Cada `setFilter` actualiza simultáneamente el store y la URL con `useSearchParams` de React Router.

Ejemplo: `/board?status=todo,in_progress&priority=high&assigneeId=uuid-123`

### Invalidación de caché (TanStack Query)

- Crear / editar / archivar ticket → invalidar `['tickets']` y `['ticket', id]`.
- Agregar / archivar comentario → invalidar `['comments', ticketId]`.
- Cambiar estado de ticket → invalidar `['tickets']` y `['metrics']`.

---

## 5. Gestión de Concurrencia — Optimistic Locking

1. Al abrir el formulario de edición, `ticket.version` se almacena en `ticketDraftStore`.
2. Cada `PATCH /api/tickets/:id` incluye `version` en el body.
3. Si el servidor responde `409 Conflict`:
   - El formulario **permanece abierto** con los cambios locales intactos.
   - Se muestra `<ConflictBanner>` dentro del formulario: *"Alguien modificó este ticket mientras lo editabas. Recarga para ver los cambios o guarda los tuyos."*
   - El banner ofrece un botón "Recargar versión actual" que hace `refetch` del ticket y actualiza `version` en el draft sin pisar los campos editados por el usuario.
   - El banner desaparece al guardar con éxito o al hacer clic en "Descartar mis cambios".
4. El `ConflictBanner` nunca es un toast; vive dentro del formulario.

---

## 6. Drag-and-Drop en el Tablero Kanban

Se usa `@dnd-kit/core` + `@dnd-kit/sortable`.

### Comportamiento

- Se puede arrastrar una `TicketCard` de cualquier columna a cualquier otra.
- Al soltar en columna distinta, se dispara `PATCH /api/tickets/:id` con el nuevo `status` y el `version` actual.
- Durante el arrastre: ghost en posición original + placeholder en columna de destino.
- Si el servidor devuelve `409` tras el drop: se muestra `ConflictBanner` y el ticket revierte visualmente a su columna original (rollback optimista).
- Si el servidor devuelve otro error: toast de error + rollback visual.

### Estructura de componentes DnD

```
DndContext (PointerSensor + KeyboardSensor)
└── KanbanBoard
    ├── DroppableColumn (×4)           ← useDroppable
    │   └── SortableContext
    │       └── DraggableTicketCard    ← useSortable
    └── DragOverlay                    ← clon flotante durante el arrastre
```

La actualización es **optimista**: el store local se actualiza antes de la respuesta del servidor. `KeyboardSensor` garantiza accesibilidad.

---

## 7. Arquitectura de Componentes

### Rutas

```
/login               → LoginPage
/board               → BoardPage          (ruta principal)
/board/:ticketId     → BoardPage con TicketDetailPanel como panel lateral
/metrics             → MetricsPage
```

### Árbol por vista

#### BoardPage

```
BoardPage
├── BoardFilters                         ← sincroniza con URL query params
│   ├── StatusFilter (multi-select)
│   ├── PriorityFilter (multi-select)
│   ├── AssigneeFilter (single-select)
│   ├── LabelFilter (multi-select)
│   └── DateRangeFilter
├── CreateTicketButton                   → abre TicketFormPanel (modal)
└── KanbanBoard                          ← DndContext; overflow-x: auto
    ├── DroppableColumn (×4, 280px c/u)
    │   ├── ColumnHeader (título + contador)
    │   └── DraggableTicketCard (×n)
    │       ├── PriorityBadge
    │       ├── StatusChip
    │       ├── BlockedBadge             ← solo si isBlocked = true
    │       ├── AssigneesAvatars
    │       └── LabelsRow
    └── DragOverlay
```

#### TicketDetailPanel

```
TicketDetailPanel
├── TicketHeader
│   ├── TicketIdLabel                    ← label-sm uppercase (ISSUE-124)
│   ├── TitleField (editable inline)
│   ├── PrioritySelector
│   ├── StatusSelector
│   ├── BlockedToggle
│   └── ArchiveButton                    ← dice "Eliminar" en UI
├── ConflictBanner                       ← visible solo tras 409
├── DescriptionField (markdown, editable)
├── AssigneesSelector
├── LabelsInput
├── CommentList
│   └── CommentItem
│       └── ArchiveCommentButton         ← visible para autor o admin
└── CommentForm
```

#### MetricsPage

```
MetricsPage
├── MetricsFilters
│   ├── DateRangePicker
│   ├── StatusMultiSelect
│   └── AssigneeSingleSelect
├── ExportCSVButton                      ← deshabilitado + tooltip si no hay datos
└── MetricsCharts
    ├── ClosedByMonthChart
    ├── ByStatusChart
    └── ByMemberChart
```

> Polling de métricas: `refetchInterval: 30_000` (30 segundos) en TanStack Query. `refetchOnWindowFocus: false` en el `QueryClient` global.

### Componentes compartidos

```
src/components/ui/           ← generados por shadcn CLI; no modificar directamente
src/components/common/
├── ProtectedRoute
├── AppLayout                ← sidebar fijo + área de contenido
├── Sidebar
├── Avatar
├── PriorityBadge
├── StatusChip
├── BlockedBadge
├── ConflictBanner
└── ToastProvider            ← <Toaster> de Sonner; montado una vez en App.tsx
```

---

## 8. Permisos en el Frontend

El frontend aplica la matriz del PRD §2.1 para ocultar/deshabilitar controles. No es una barrera de seguridad (responsabilidad del backend), sino UX correcta.

| Control | Condición de renderizado |
|---|---|
| Botón "Editar ticket" | `user.id === ticket.createdBy.id` OR `user.role === 'admin'` |
| Botón "Cambiar estado" | mismo que editar |
| Botón "Eliminar" (archivar ticket) | mismo que editar |
| Botón "Archivar comentario" | `user.id === comment.author.id` OR `user.role === 'admin'` |
| Vista de tickets archivados | solo si `user.role === 'admin'` (fuera de scope v1) |

---

## 9. Estructura de Carpetas

```
src/
├── assets/
├── components/
│   ├── ui/                        ← shadcn generados
│   └── common/                    ← sistema de diseño compartido
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── authStore.ts
│   ├── board/
│   │   ├── BoardPage.tsx
│   │   ├── BoardFilters.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── DroppableColumn.tsx
│   │   ├── DraggableTicketCard.tsx
│   │   ├── TicketCard.tsx
│   │   └── boardFilterStore.ts
│   ├── tickets/
│   │   ├── TicketDetailPanel.tsx
│   │   ├── TicketFormPanel.tsx
│   │   ├── CommentList.tsx
│   │   ├── CommentItem.tsx
│   │   ├── CommentForm.tsx
│   │   ├── ConflictBanner.tsx
│   │   └── ticketDraftStore.ts
│   └── metrics/
│       ├── MetricsPage.tsx
│       ├── MetricsFilters.tsx
│       ├── MetricsCharts.tsx
│       └── ExportCSVButton.tsx
├── hooks/
│   ├── useTickets.ts
│   ├── useTicket.ts
│   ├── useComments.ts
│   ├── useMetrics.ts
│   └── useCurrentUser.ts
├── lib/
│   ├── api.ts                     ← fetch wrapper con auth header + 401 handler + refresh
│   ├── queryClient.ts             ← QueryClient con refetchOnWindowFocus: false
│   └── utils.ts                   ← cn(), formatDate(), buildExportUrl()
├── router/
│   ├── index.tsx
│   └── ProtectedRoute.tsx
├── styles/
│   ├── globals.css                ← variables CSS del design system
│   └── tailwind.config.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

---

## 10. Design System — Variables CSS y Reglas de Implementación

Derivado de DESIGN.md (Lucid Efficiency). Estas variables se declaran en `globals.css` y son la única fuente de colores y sombras en todo el proyecto.

### Variables CSS

```css
:root {
  /* Surfaces */
  --surface:                    #f9f9fb;
  --surface-container-low:      #f2f4f6;
  --surface-container-lowest:   #ffffff;
  --surface-container:          #eaeff3;
  --surface-container-high:     #e4e9ee;
  --surface-container-highest:  #dde3e9;

  /* Primary */
  --primary:                    #005bbf;
  --primary-dim:                #0050a8;
  --primary-container:          #d7e2ff;
  --on-primary:                 #ffffff;
  --on-primary-fixed:           #003d84;

  /* Tertiary (Listo) */
  --tertiary-container:         #69f6b8;
  --on-tertiary-fixed:          #00452d;

  /* Error / Bloqueado */
  --error-container:            #fe8983;
  --on-error-container:         #752121;

  /* Neutral */
  --outline-variant:            #acb3b8;
  --inverse-surface:            #0c0e10;
  --on-surface:                 #0c0e10;

  /* Shadows */
  --shadow-ambient:             0px 12px 32px rgba(12, 14, 16, 0.04);

  /* Radii */
  --radius-md:                  0.375rem;
  --radius-xl:                  0.75rem;

  /* Typography */
  --font-family:                'Inter', sans-serif;
}
```

### Reglas obligatorias

1. **No usar `#000000`.** Usar `var(--inverse-surface)`.
2. **No usar bordes `1px solid`.** Los límites se definen por cambio de fondo entre niveles de Surface.
3. **No usar drop shadows estándar.** Solo `var(--shadow-ambient)` (4% opacidad) para elementos flotantes.
4. **Botón primario:** gradiente `var(--primary)` → `var(--primary-dim)` a 145°. Nunca color plano.
5. **Botón secundario:** sin fondo; `outline-variant` al 20% de opacidad; texto `var(--primary)`.
6. **Glassmorphism** (dropdowns): `background: rgba(255,255,255,0.8)`, `backdrop-filter: blur(24px)`, radio `var(--radius-xl)`.
7. **Separación de tarjetas:** `gap: 1.5rem` en el contenedor flex. Nunca `<hr>` ni `border-bottom`.
8. **Padding asimétrico:** top y left siempre mayor que bottom y right.
9. **Columnas Kanban:** ancho fijo `280px`. El tablero usa `display: flex; overflow-x: auto` para scroll horizontal.
10. **Layout:** solo desktop ≥ 1280px en v1. Sin breakpoints responsive.

### Tipografía

| Token | rem | Uso |
|---|---|---|
| `display-md` | 2.75rem | Títulos; `letter-spacing: -0.02em` |
| `body-md` | 0.875rem | Cuerpo; `line-height: 1.6` |
| `label-sm` | 0.6875rem | Metadatos (ISSUE-124); UPPERCASE; `letter-spacing: +0.05em` |

### Status Chips

| Estado | Background | Text |
|---|---|---|
| Listo | `var(--tertiary-container)` | `var(--on-tertiary-fixed)` |
| Bloqueado (badge) | `var(--error-container)` | `var(--on-error-container)` |
| En progreso | `var(--primary-container)` | `var(--on-primary-fixed)` |
| Por hacer | `var(--surface-container-high)` | `var(--on-surface)` |
| Review | `var(--surface-container-highest)` | `var(--on-surface)` |

---

## 11. Exportación CSV — Implementación Frontend

Endpoint: `GET /api/metrics/export` con query params.

1. Botón **"Exportar CSV"** deshabilitado cuando la query de métricas activa devuelve 0 tickets.
2. Al estar deshabilitado: `Tooltip` con *"No hay datos para el rango seleccionado"*.
3. Al hacer clic (habilitado):

```typescript
const handleExport = () => {
  const params = new URLSearchParams();
  if (filters.from)        params.set('from', filters.from);
  if (filters.to)          params.set('to', filters.to);
  filters.status?.forEach(s => params.append('status', s));
  if (filters.assigneeId)  params.set('assignee_id', filters.assigneeId);

  const a = document.createElement('a');
  a.href = `/api/metrics/export?${params.toString()}`;
  a.click();
};
```

4. `400` del servidor → toast error: *"El rango de fechas es inválido."*
5. `401` → limpiar sesión y redirigir a `/login`.
6. El nombre del archivo lo define el header `Content-Disposition` del servidor.

---

## 12. Notificaciones Toast

`<Toaster>` de Sonner montado una sola vez en `App.tsx`.

| Evento | Tipo | Mensaje |
|---|---|---|
| Ticket creado | success | "Ticket creado correctamente" |
| Ticket actualizado | success | "Cambios guardados" |
| Ticket archivado | success | "Ticket eliminado" |
| Comentario archivado | success | "Comentario eliminado" |
| 409 Conflict | — | No toast; usar `ConflictBanner` dentro del formulario |
| Error de red / 500 | error | "Ocurrió un error. Intenta de nuevo." |
| 400 en export CSV | error | "El rango de fechas es inválido." |
| 401 (sesión expirada) | — | No toast; redirect silencioso a `/login` |

---

## 13. Idioma

La UI es íntegramente en **español**. Sin i18n en v1. Todos los strings están hardcodeados en los componentes.

---

## 14. Reglas de Negocio Implementadas en el Frontend

| Regla | Implementación |
|---|---|
| Un `member` no puede editar tickets ajenos | Controles ocultos/deshabilitados según §8 |
| `Bloqueado` es un flag, no una columna | `BlockedBadge` superpuesto; columnas siguen siendo 4 |
| Mover tarjeta = cambiar estado | Drop en columna distinta → `PATCH` con nuevo `status` + `version` |
| "Eliminar" en UI = archivar subyacentemente | Llama a `PATCH /tickets/:id` con `{ archivedAt: now }` |
| Tickets archivados desaparecen del tablero | El frontend filtra `archivedAt !== null` del resultado de la query |
| No se editan comentarios | `CommentItem` nunca renderiza campo de edición |
| `version` siempre acompaña al PATCH | El hook `useUpdateTicket` lo incluye automáticamente |
| Botón Exportar CSV deshabilitado si no hay datos | Derivado del `data.length === 0` de la query de métricas |
| Rango `from > to` es inválido | El servidor devuelve `400`; sin validación preventiva en el cliente (v1) |
| Filtros del tablero son compartibles | Persistidos en URL query params; inicializados desde la URL al montar |
| Polling de métricas cada 30 s | `refetchInterval: 30_000` en la query de métricas |

---

## 15. Decisiones Fuera de Scope (v1 Frontend)

| Funcionalidad | Motivo |
|---|---|
| Modo oscuro | Excluido del PRD |
| Responsive / mobile | Solo desktop ≥ 1280px |
| i18n / multiidioma | UI en español hardcodeado |
| Adjuntos en tickets | Excluido del PRD |
| Notificaciones in-app | Solo email; sin UI de notificaciones |
| Vista de tickets archivados para admin | Out of scope v1 |
| Log de auditoría | Aplazado a v1.1 |
| Sub-tareas / tickets enlazados | Excluido del PRD |

---

*Este documento es el contrato del frontend. Cualquier desviación durante la implementación debe quedar registrada aquí antes de escribir código.*
