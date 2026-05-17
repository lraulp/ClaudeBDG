# Frontend Specs — Mini Jira V1

**Versión:** 1.0  
**Fecha:** 2026-05-09  
**Basado en:** specs.md (PRD v0.1) · backlog.md v1.0 · mermaid_design.md v1.0  
**Decisiones incorporadas:** visibilidad solo propios+asignados · tickets archivados nunca visibles · sin OAuth V1 · WebSockets · @dnd-kit/core · Drawer lateral (`/board?ticket=:id`) · Tremor para dashboard · descripción Markdown tabs sin deps extra · página `/admin` · menciones con @handle + autocomplete

---

## 1. Stack y Versiones

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Runtime entorno dev | Node.js | 20 LTS |
| Lenguaje | TypeScript | 5.x |
| Framework UI | React | 19.x |
| Build tool | Vite | 5.x |
| Librería de componentes base | shadcn/ui | 1.x |
| Componentes de dashboard + gráficos | Tremor | 3.x |
| Estilos | Tailwind CSS | 3.x |
| Routing | React Router | 6.x |
| Estado servidor + cache API | TanStack Query (React Query) | 5.x |
| HTTP client | Axios | 1.x |
| Estado cliente/UI | Zustand | 4.x |
| Tiempo real | Socket.io-client | 4.x |
| Formularios | React Hook Form | 7.x |
| Validación de esquemas | Zod | 3.x |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable | 6.x |
| Utilidades de fecha | date-fns | 3.x |
| Linter | ESLint | 9.x |
| Formatter | Prettier | 3.x |
| Testing unitario | Vitest + React Testing Library | latest |

> **Tremor** es una dependencia adicional sobre shadcn/ui. Ambas conviven sobre Tailwind CSS. Tremor se usa exclusivamente en `features/dashboard/`.  
> **Markdown:** sin librería externa — parser mínimo propio en `lib/markdown.ts`.  
> **Browsers objetivo (PRD §7):** Chrome y Edge.

---

## 2. Dependencias

### Producción

```
react  react-dom  react-router-dom
@tanstack/react-query
axios
zustand
socket.io-client
react-hook-form  zod  @hookform/resolvers
@dnd-kit/core  @dnd-kit/sortable  @dnd-kit/utilities
@tremor/react
shadcn/ui  (@radix-ui/* internamente)
tailwindcss  tailwind-merge  class-variance-authority  clsx
lucide-react
date-fns
```

### Desarrollo

```
vite  @vitejs/plugin-react
typescript  @types/react@19  @types/react-dom@19  @types/node
eslint  @typescript-eslint/eslint-plugin  eslint-plugin-react-hooks
prettier  eslint-config-prettier
vitest  @vitest/ui  @testing-library/react  @testing-library/user-event  jsdom
```

---

## 3. Modelo de Datos (Frontend)

Definidos en `src/types/index.ts`.

```typescript
type Role = 'Admin' | 'Usuario'
type Priority = 'Alta' | 'Media' | 'Baja'
type TicketStatus = 'Por hacer' | 'En progreso' | 'Listo'

interface UserSummary {
  id: number
  handle: string              // identificador único para menciones: @handle
  name: string
  email: string
  role: Role
}

interface CurrentUser extends UserSummary {}  // usuario en sesión (authStore)

interface User extends UserSummary {
  active: boolean              // false = cuenta desactivada por Admin
  createdAt: string
}

interface Tag {
  id: number
  name: string
}

interface PresenceIndicator {
  userId: number
  userName: string
  expiresAt: string  // ISO 8601 — TTL 5 min
}

interface Ticket {
  id: number
  title: string               // requerido, máx 255 chars, sin HTML
  description: string | null  // texto plano Markdown
  status: TicketStatus
  priority: Priority
  assignedTo: UserSummary | null
  tags: Tag[]
  createdAt: string
  dueDate: string | null
  createdBy: UserSummary
  version: number             // optimistic locking — enviar en cada PATCH
  editingBy: PresenceIndicator | null
}

interface Comment {
  id: number
  ticketId: number
  author: UserSummary
  text: string                // puede contener @handle para menciones
  createdAt: string
}

interface DashboardMetrics {
  closedByMonth: Array<{ month: string; count: number }>
  openCount: number
  closedCount: number
  byStatus: Array<{ status: TicketStatus; count: number }>
}
```

### Reglas de visibilidad de datos

| Recurso | Admin | Usuario |
|---------|-------|---------|
| Tickets en tablero | Todos los no archivados | Solo creados por él O asignados a él |
| Tickets archivados | Nunca visibles | Nunca visibles |
| Página `/admin` | Acceso completo | Redirige a `/board` |
| Dashboard metrics | Datos globales del equipo | Datos globales del equipo |
| Etiquetas (catálogo) | CRUD | Solo lectura |

---

## 4. Rutas y Navegación

```
/login              LoginPage          — pública
/register           RegisterPage       — pública
/                   → redirect a /board
/board              BoardPage          — protegida (cualquier rol)
/board?ticket=:id   BoardPage          — protegida; abre Drawer con el ticket :id
/board?ticket=new   BoardPage          — protegida; abre Drawer en modo creación
/dashboard          DashboardPage      — protegida (cualquier rol)
/admin              AdminPage          — protegida (solo Admin)
*                   → redirect a /board (o /login si no autenticado)
```

**Detalle de ticket:** Drawer lateral (shadcn/ui `Sheet`, `position="right"`, ~480 px). El tablero permanece visible e interactivo detrás. URL: `?ticket=:id`.

- Abrir: `navigate('/board?ticket=42')` · Crear: `navigate('/board?ticket=new')` · Cerrar: `navigate('/board')`.
- Recargar `/board?ticket=42` abre el tablero con el Drawer desplegado.

**Protección de rutas:** `ProtectedRoute` lee `authStore`. Sin token → `/login`. Usuario en `/admin` → `/board`.

---

## 5. Arquitectura de Componentes

### 5.1 Árbol por página

#### `LoginPage` / `RegisterPage`

```
AuthLayout
└── AuthCard
    ├── LogoHeader
    ├── LoginForm / RegisterForm   (React Hook Form + Zod)
    └── AuthFooter (enlace login ↔ registro)
```

#### `BoardPage`

```
AppLayout
├── Navbar
│   ├── Logo
│   ├── NavLinks (Board, Dashboard)
│   ├── AdminLink (solo Admin → /admin)
│   └── UserMenu (perfil, cerrar sesión)
└── BoardPage
    ├── BoardToolbar
    │   ├── CreateTicketButton     → navigate('/board?ticket=new')
    │   └── FilterToggleButton
    ├── FilterPanel (panel lateral izquierdo, deslizable)
    │   ├── FilterByStatus
    │   ├── FilterByPriority
    │   ├── FilterByAssignee
    │   ├── FilterByTags
    │   ├── FilterByCreatedAt      (date range)
    │   ├── FilterByDueDate        (date range)
    │   └── ClearFiltersButton
    ├── KanbanBoard                (DndContext de @dnd-kit/core)
    │   ├── KanbanColumn ("Por hacer")
    │   │   ├── ColumnHeader       (título + contador)
    │   │   ├── TicketCard[]       (Draggable)
    │   │   │   ├── CardTitle      → click: navigate('/board?ticket=:id')
    │   │   │   ├── PriorityBadge
    │   │   │   ├── AssigneeAvatar
    │   │   │   ├── DueDateLabel
    │   │   │   ├── TagList
    │   │   │   ├── EditingIndicator
    │   │   │   └── StatusSelector
    │   │   └── AddTicketInlineButton
    │   ├── KanbanColumn ("En progreso")
    │   └── KanbanColumn ("Listo")
    └── TicketDrawer               (Sheet lateral derecho — shadcn/ui)
```

#### `TicketDrawer`

```
TicketDrawer
├── DrawerHeader
│   ├── TicketId + StatusBadge
│   ├── EditingIndicatorBanner
│   └── CloseButton                → navigate('/board')
├── TicketForm                     (React Hook Form + Zod)
│   ├── TitleInput
│   ├── DescriptionEditor          (tabs Escribir / Vista previa — Markdown)
│   ├── PrioritySelect
│   ├── AssigneeSelect
│   ├── TagsMultiSelect
│   ├── DueDatePicker
│   ├── StatusSelect
│   ├── SaveButton
│   └── ArchiveButton              ("Eliminar" + ConfirmDialog)
├── CommentSection
│   ├── CommentItem[]              (@handle resaltado en el texto)
│   └── NewCommentForm
│       ├── MentionTextarea        (autocomplete al escribir @)
│       └── SubmitCommentButton
├── ConflictResolutionDialog
│   ├── ConflictDescription
│   ├── PendingChangesSummary
│   ├── SavedVersionSummary
│   ├── DiscardButton
│   └── ForceOverwriteButton
└── TicketArchivedBanner
    ├── WarningMessage
    └── CopyToNewTicketButton
```

#### `DescriptionEditor`

```
DescriptionEditor
└── Tabs (shadcn/ui)
    ├── TabsTrigger "Escribir"
    ├── TabsTrigger "Vista previa"
    ├── TabsContent "Escribir"
    │   └── <textarea>             (controlled por React Hook Form)
    └── TabsContent "Vista previa"
        └── MarkdownPreview        (dangerouslySetInnerHTML ← parseMarkdown())
```

#### `DashboardPage`

```
AppLayout
└── DashboardPage
    ├── MetricCards                (Tremor Card + Metric + Text)
    │   ├── OpenTicketsCard
    │   └── ClosedTicketsCard
    ├── ClosedByMonthChart         (Tremor BarChart)
    └── StatusDistributionChart    (Tremor DonutChart)
```

#### `AdminPage` — ruta `/admin`, solo Admin

```
AppLayout
└── AdminPage
    ├── PageHeader ("Administración de usuarios")
    ├── InviteUserButton
    └── UsersTable
        ├── TableHeader
        └── UserRow[]
            ├── UserInfo           (avatar, nombre, @handle, email)
            ├── RoleSelector       (Admin / Usuario)
            ├── StatusBadge        (Activo / Inactivo)
            └── ActionMenu
                ├── CambiarRolOption
                └── DesactivarCuentaOption
```

### 5.2 Componentes compartidos

| Componente | Descripción |
|---|---|
| `PriorityBadge` | Chip de color por prioridad |
| `StatusBadge` | Chip de estado (ticket o cuenta de usuario) |
| `TagBadge` | Chip de etiqueta |
| `UserAvatar` | Avatar con iniciales y tooltip |
| `DueDateLabel` | Rojo si vencido y no en Listo |
| `EditingIndicator` | Icono lápiz + nombre del editor activo |
| `ConfirmDialog` | Dialog genérico de confirmación |
| `DateRangePicker` | Rango de fechas para filtros |
| `MentionTextarea` | Textarea con autocomplete de @handle al escribir `@` |
| `DescriptionEditor` | Tabs Escribir / Vista previa para Markdown |
| `MarkdownPreview` | Renderiza `parseMarkdown()` con `dangerouslySetInnerHTML` |
| `LoadingSpinner` | Indicador de carga |
| `ErrorBoundary` | Captura errores no manejados |
| `Toaster` | Toast notifications (shadcn/ui Sonner) |

---

## 6. Estructura de Carpetas

```
src/
├── api/
│   ├── auth.ts
│   ├── tickets.ts
│   ├── comments.ts
│   ├── users.ts           # list, create, updateRole, toggleActive
│   ├── tags.ts
│   └── dashboard.ts
│
├── components/
│   ├── ui/                          # generados por shadcn/ui — no editar
│   ├── ConfirmDialog.tsx
│   ├── DateRangePicker.tsx
│   ├── DescriptionEditor.tsx
│   ├── DueDateLabel.tsx
│   ├── EditingIndicator.tsx
│   ├── ErrorBoundary.tsx
│   ├── LoadingSpinner.tsx
│   ├── MarkdownPreview.tsx
│   ├── MentionTextarea.tsx
│   ├── PriorityBadge.tsx
│   ├── StatusBadge.tsx
│   ├── TagBadge.tsx
│   └── UserAvatar.tsx
│
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── AuthLayout.tsx
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── authSchemas.ts
│   ├── board/
│   │   ├── BoardPage.tsx
│   │   ├── BoardToolbar.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── TicketCard.tsx
│   │   ├── useBoardFilters.ts
│   │   └── mockTickets.ts
│   ├── tickets/
│   │   ├── TicketDrawer.tsx
│   │   ├── TicketForm.tsx
│   │   ├── ConflictResolutionDialog.tsx
│   │   ├── TicketArchivedBanner.tsx
│   │   ├── StatusSelector.tsx
│   │   └── ticketSchemas.ts
│   ├── comments/
│   │   ├── CommentSection.tsx
│   │   ├── CommentItem.tsx        # resalta @handle en el texto
│   │   └── NewCommentForm.tsx
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   ├── MetricCards.tsx
│   │   ├── ClosedByMonthChart.tsx
│   │   └── StatusDistributionChart.tsx
│   └── admin/
│       ├── AdminPage.tsx
│       ├── UsersTable.tsx
│       ├── UserRow.tsx
│       └── InviteUserForm.tsx
│
├── hooks/
│   ├── useSocket.ts
│   └── usePresence.ts
│
├── lib/
│   ├── axios.ts
│   ├── markdown.ts                  # parseMarkdown(): Markdown → HTML sanitizado
│   ├── queryClient.ts
│   └── socket.ts
│
├── router/
│   ├── AppRouter.tsx
│   └── ProtectedRoute.tsx
│
├── stores/
│   └── authStore.ts
│
├── types/
│   └── index.ts
│
├── App.tsx
└── main.tsx
```

---

## 7. Reglas de Negocio

### 7.1 Autenticación

- JWT en `localStorage` bajo la clave `mj_token`.
- Interceptor de request: agrega `Authorization: Bearer <token>`.
- Interceptor de response: en 401 limpia `authStore` y redirige a `/login`.
- Payload del JWT: `{ sub, role, name, handle, email }`.
- Sin OAuth ni SSO en V1. Registro público con rol `'Usuario'` por defecto.
- Usuarios con `active: false` reciben 401; el frontend los trata como credenciales inválidas.

### 7.2 Visibilidad de tickets

- **Admin:** todos los tickets no archivados.
- **Usuario:** `filter=mine` aplicado por la API. El frontend no filtra localmente.
- **Archivados:** nunca visibles.

### 7.3 Permisos de operación sobre tickets

| Operación | Admin | Usuario (propio/asignado) | Usuario (ajeno) |
|---|---|---|---|
| Ver en tablero | ✅ | ✅ | ❌ |
| Crear | ✅ | ✅ | — |
| Editar campos | ✅ | ✅ | ❌ |
| Cambiar estado | ✅ | ✅ (si asignado) | ❌ |
| Archivar | ✅ | ✅ (si es creador) | ❌ |
| Comentar | ✅ | ✅ | ✅ (si visible) |
| Forzar unlock | ✅ | ❌ | ❌ |

### 7.4 Administración de usuarios (`/admin`)

- Solo accesible para `role === 'Admin'`; link en Navbar visible solo para Admin.
- **Aprovisionar cuenta:** Admin crea usuario con email, nombre, handle y rol.
- **Cambiar rol:** `PATCH /users/:id { role }` desde el dropdown de la fila.
- **Desactivar / reactivar:** `PATCH /users/:id { active }`. Badge cambia de Activo a Inactivo.
- Admin no puede desactivar su propia cuenta (botón deshabilitado en su propia fila).

### 7.5 Menciones con @handle en comentarios

- El campo `handle` de `UserSummary` es único en el sistema (ej. `jperez`, `msanchez`).
- **`MentionTextarea`:** al escribir el carácter `@`, se abre un dropdown flotante con la lista de usuarios cargada desde `useQuery(['users'])`.
  - El dropdown filtra la lista en tiempo real según los caracteres escritos tras `@`.
  - Seleccionar un usuario inserta `@handle` en el texto y cierra el dropdown.
  - Cerrar con `Escape` o click fuera descarta el dropdown sin insertar.
- El texto del comentario se envía a la API tal cual (con `@handle` en texto plano).
- El backend resuelve `@handle` → `userId` para disparar la notificación de email.
- **`CommentItem`:** parsea el texto en display y resalta cada `@handle` válido con negrita y color de acento (sin modificar el texto almacenado).

### 7.6 Drag & Drop (`@dnd-kit/core`)

- `KanbanBoard` es el `DndContext` raíz.
- `KanbanColumn` → `useDroppable` con `id = status`.
- `TicketCard` → `useDraggable` con `id = ticket.id`.
- `onDragEnd`: si `over.id !== ticket.status` → `PATCH /tickets/:id { status: over.id, version }`.
- Optimistic update; revert con `onError`.
- Desarrollo: `mockTickets.ts`. Producción: `useQuery(['tickets', filters])`.

### 7.7 Apertura del Drawer y URL

- Click en tarjeta → `navigate('/board?ticket=42')`.
- `BoardPage` lee param con `useSearchParams()` y renderiza `<TicketDrawer />`.
- Cerrar → `navigate('/board')`.

### 7.8 Descripción Markdown — `DescriptionEditor`

- Se almacena como texto plano Markdown en la DB.
- Tab **"Escribir"**: `<textarea>` controlado por React Hook Form.
- Tab **"Vista previa"**: `parseMarkdown(value)` + `dangerouslySetInnerHTML`.
- `parseMarkdown()` en `lib/markdown.ts` — sin dependencias extra. Sanitiza HTML antes de procesar. Sintaxis soportada:

  | Sintaxis | HTML |
  |---|---|
  | `# H1` `## H2` `### H3` | `<h1>` `<h2>` `<h3>` |
  | `**texto**` | `<strong>` |
  | `*texto*` | `<em>` |
  | `` `código` `` | `<code>` |
  | ` ```bloque``` ` | `<pre><code>` |
  | `- ítem` | `<ul><li>` |
  | `1. ítem` | `<ol><li>` |
  | `[texto](url)` | `<a href>` (solo http/https) |
  | Línea en blanco | `<p>` |

### 7.9 Ciclo de vida del ticket

1. Creación: estado `'Por hacer'`; `createdBy` y `createdAt` asignados por el servidor.
2. Movimiento: drag-and-drop o status selector → `PATCH /tickets/:id { status, version }`.
3. Archivado: `PATCH /tickets/:id { archived: true }`. Si `editingBy !== null` → `ConfirmDialog` primero.

### 7.10 Indicador de vencimiento

Condición: `dueDate !== null && new Date(dueDate) < new Date() && status !== 'Listo'`  
→ `DueDateLabel` en rojo · borde izquierdo de `TicketCard` en rojo.

### 7.11 Validación de formularios (EC-02)

| Campo | Regla Zod |
|---|---|
| `title` | requerido · trim · min 1 · max 255 · strip HTML |
| `description` | opcional · Markdown plano |
| `priority` | enum `['Alta','Media','Baja']` |
| `status` | enum `['Por hacer','En progreso','Listo']` |
| `assignedTo` | ID o null |
| `dueDate` | fecha futura o null |
| `tags` | array de IDs, puede ser vacío |

Errores todos a la vez. Submit deshabilitado si inválido o petición en curso.

### 7.12 Dashboard de métricas (Tremor)

| Métrica | Componente Tremor | Datos |
|---|---|---|
| Abiertos vs. cerrados | `Card` + `Metric` + `Text` | `openCount`, `closedCount` |
| Tickets cerrados por mes | `BarChart` | `closedByMonth[]` |
| Distribución por estado | `DonutChart` | `byStatus[]` |

`staleTime: 5 min`. Archivados excluidos de todas las cifras.

---

## 8. Comunicación en Tiempo Real (Socket.io)

### 8.1 Conexión

Singleton en `src/lib/socket.ts`. `auth: { token }` validado en el handshake. Conecta al iniciar sesión; desconecta al hacer logout.

### 8.2 Eventos

| Dirección | Evento | Payload | Acción en frontend |
|---|---|---|---|
| C → S | `ticket:lock` | `{ ticketId }` | Al abrir `TicketDrawer` |
| C → S | `ticket:unlock` | `{ ticketId }` | Al cerrar el Drawer |
| C → S | `ticket:heartbeat` | `{ ticketId }` | Cada 60 s con Drawer abierto |
| S → C | `ticket:locked` | `{ ticketId, userId, userName, expiresAt }` | Muestra `EditingIndicator` en tarjeta y banner en Drawer |
| S → C | `ticket:unlocked` | `{ ticketId }` | Elimina `EditingIndicator` |
| S → C | `ticket:conflict` | `{ ticketId, savedBy, savedAt, currentVersion }` | Abre `ConflictResolutionDialog` |
| S → C | `ticket:archived` | `{ ticketId, archivedBy }` | Muestra `TicketArchivedBanner`; invalida query |
| S → C | `ticket:updated` | `{ ticketId }` | Invalida query del ticket |

### 8.3 Hook `usePresence`

Montado en `TicketDrawer`. `onMount` → `ticket:lock`. `onUnmount` → `ticket:unlock` + limpia intervalo. Heartbeat 60 s.

---

## 9. Gestión de Estado

### 9.1 TanStack Query + Axios

| Query key | Dato | Se invalida tras |
|---|---|---|
| `['tickets', filters]` | Lista de tickets | Crear, editar, archivar, mover, `ticket:updated` |
| `['ticket', id]` | Detalle de ticket | Guardar, `ticket:updated` |
| `['comments', ticketId]` | Comentarios | Crear comentario |
| `['users']` | Lista de usuarios (también fuente del autocomplete @handle) | Aprovisionar, cambiar rol, activar/desactivar |
| `['tags']` | Catálogo de etiquetas | Alta/baja (admin) |
| `['dashboard']` | Métricas | staleTime 5 min |

`staleTime` global: 30 s.

### 9.2 Zustand — `authStore`

```typescript
interface AuthStore {
  currentUser: CurrentUser | null
  token: string | null
  login: (user: CurrentUser, token: string) => void
  logout: () => void
}
```

### 9.3 Estado local

- Drawer + ticket: `useSearchParams()` — URL como fuente de verdad.
- Filtros: `useBoardFilters.ts`.
- Conflicto: `useState<ConflictData | null>` en `TicketDrawer`.
- Dropdown @mention: `useState` local en `MentionTextarea` (query de filtrado + visibilidad).

---

## 10. Decisiones de Implementación Adicionales

| Aspecto | Decisión |
|---|---|
| Tremor vs. shadcn/ui | Tremor solo en `features/dashboard/` |
| Markdown | Parser propio en `lib/markdown.ts`; sin dependencias extra |
| @handle | Campo único por usuario; fuente del autocomplete de menciones |
| Dropdown @mention | Usa `useQuery(['users'])` ya cacheado; sin petición adicional |
| Admin en tablero | Sin `filter=mine`; todos los tickets no archivados |
| Admin no se desactiva a sí mismo | Botón deshabilitado en su propia fila |
| Archivado con editor activo | `ConfirmDialog` si `editingBy !== null` |
| Formato de fechas | `date-fns` locale `es`; ISO 8601 para transfer |
| Sanitización | Strip HTML en `title` antes de enviar; `parseMarkdown()` sanitiza `description` al renderizar |
| Drag a misma columna | Permitido; PATCH devuelve 200 sin efecto |
| Sesión expirada durante edición | Interceptor 401 limpia store; `usePresence` emite `ticket:unlock` en cleanup |
| Toasts | Éxito al guardar, error de red, conflicto, ticket archivado por tercero |
| Columna vacía | Contador 0 + área droppable visible |
| URL compartible | `/board?ticket=42` abre tablero con Drawer desplegado |

---

*Este documento requiere confirmación del autor antes de comenzar la implementación.*
