# CLAUDE.md — MiniJira Frontend

Reglas globales de desarrollo para este proyecto. Todo el código generado en esta sesión DEBE cumplirlas.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Estilos | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| UI base | shadcn/ui (style: base-nova, iconos: lucide-react) |
| Estado servidor | TanStack Query v5 |
| Estado cliente | Zustand v5 |
| Formularios | React Hook Form + Zod |
| Routing | React Router v7 |
| HTTP | axios con interceptor JWT en `@/lib/axios` |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable |
| Tiempo real | socket.io-client (hooks: `useSocket`, `usePresence`) |
| Dashboard charts | @tremor/react |
| Notificaciones | sonner |
| Tests | Vitest + React Testing Library |
| Package manager | pnpm |

Archivos `.tsx` para componentes React. Archivos `.ts` para utilidades, hooks, stores, tipos y API.

---

## Colores — REGLA ESTRICTA

**NUNCA uses colores inventados. NUNCA uses clases Tailwind con hex arbitrarios como `bg-[#abc]` salvo las excepciones de sombra documentadas abajo.**

Los tokens de color del sistema están definidos en `DESIGN.md` y deben estar registrados en `src/index.css` bajo `@theme`. Usa ÚNICAMENTE las clases Tailwind derivadas de esos tokens.

### Configuración requerida en `src/index.css`

```css
@import "tailwindcss";

@theme {
  /* Surfaces */
  --color-surface:                    #f9f9fb;
  --color-surface-dim:                #d9dadc;
  --color-surface-bright:             #f9f9fb;
  --color-surface-container-lowest:   #ffffff;
  --color-surface-container-low:      #f3f3f5;
  --color-surface-container:          #eeeef0;
  --color-surface-container-high:     #e8e8ea;
  --color-surface-container-highest:  #e2e2e4;
  --color-surface-variant:            #e2e2e4;
  --color-surface-tint:               #005bc1;

  /* On-surface (texto sobre superficies) */
  --color-on-surface:                 #1a1c1d;
  --color-on-surface-variant:         #414755;
  --color-inverse-surface:            #2f3132;
  --color-inverse-on-surface:         #f0f0f2;

  /* Outline (bordes) */
  --color-outline:                    #717786;
  --color-outline-variant:            #c1c6d7;

  /* Primary */
  --color-primary:                    #0058bc;
  --color-on-primary:                 #ffffff;
  --color-primary-container:          #0070eb;
  --color-on-primary-container:       #fefcff;
  --color-inverse-primary:            #adc6ff;

  /* Secondary */
  --color-secondary:                  #5e5e63;
  --color-on-secondary:               #ffffff;
  --color-secondary-container:        #e0dfe4;
  --color-on-secondary-container:     #626267;

  /* Tertiary */
  --color-tertiary:                   #9e3d00;
  --color-on-tertiary:                #ffffff;
  --color-tertiary-container:         #c64f00;
  --color-on-tertiary-container:      #fffbff;

  /* Error */
  --color-error:                      #ba1a1a;
  --color-on-error:                   #ffffff;
  --color-error-container:            #ffdad6;
  --color-on-error-container:         #93000a;

  /* Background */
  --color-background:                 #f9f9fb;
  --color-on-background:              #1a1c1d;

  /* Fixed variants */
  --color-primary-fixed:              #d8e2ff;
  --color-primary-fixed-dim:          #adc6ff;
  --color-on-primary-fixed:           #001a41;
  --color-on-primary-fixed-variant:   #004493;
  --color-secondary-fixed:            #e3e2e7;
  --color-secondary-fixed-dim:        #c7c6cb;
  --color-on-secondary-fixed:         #1a1b1f;
  --color-on-secondary-fixed-variant: #46464b;
  --color-tertiary-fixed:             #ffdbcc;
  --color-tertiary-fixed-dim:         #ffb595;
  --color-on-tertiary-fixed:          #351000;
  --color-on-tertiary-fixed-variant:  #7c2e00;

  /* Tipografía */
  --font-sans: 'Inter', system-ui, sans-serif;

  /* Border radius */
  --radius-sm:      0.25rem;
  --radius-DEFAULT: 0.5rem;
  --radius-md:      0.75rem;
  --radius-lg:      1rem;
  --radius-xl:      1.5rem;
  --radius-full:    9999px;
}
```

### Tabla de uso de colores

| Token | Clase Tailwind | Cuándo usar |
|-------|---------------|-------------|
| `primary` | `bg-primary`, `text-primary` | CTA principal, botones primarios, links activos |
| `on-primary` | `text-on-primary` | Texto sobre botones azules |
| `primary-container` | `bg-primary-container` | Hover state de botón primario |
| `background` | `bg-background` | Fondo de página |
| `surface-container-lowest` | `bg-surface-container-lowest` | Tarjetas sobre fondo (blanco puro) |
| `surface-container-low` | `bg-surface-container-low` | Sidebars, paneles secundarios |
| `surface-container` | `bg-surface-container` | Fondo de inputs, dropdowns |
| `surface-container-high` | `bg-surface-container-high` | Hover sobre listas/filas |
| `on-surface` | `text-on-surface` | Texto principal |
| `on-surface-variant` | `text-on-surface-variant` | Texto secundario, labels, placeholders |
| `outline` | `border-outline` | Bordes de separadores |
| `outline-variant` | `border-outline-variant` | Bordes sutiles de inputs en reposo |
| `error` | `text-error`, `bg-error` | Mensajes de error, campos inválidos |
| `error-container` | `bg-error-container` | Fondo de banners de error |
| `on-error-container` | `text-on-error-container` | Texto dentro de banners de error |
| `secondary-container` | `bg-secondary-container` | Chips/badges neutros |
| `tertiary-container` | `bg-tertiary-container` | Badges de alta prioridad/urgente |

### Sombra (única excepción a hex arbitrario)

Elevación de tarjetas y modals: `shadow-[0px_4px_12px_rgba(0,0,0,0.05)]`

---

## Tipografía

Fuente: **Inter** en todos los niveles. Usar como `font-sans`.

| Escala de diseño | Clases Tailwind equivalentes |
|-----------------|------------------------------|
| `display-lg` (34px/700/−0.022em) | `text-[34px] font-bold tracking-[-0.022em] leading-[41px]` |
| `headline-md` (24px/600/−0.019em) | `text-2xl font-semibold tracking-[-0.019em] leading-[30px]` |
| `headline-sm` (20px/600/−0.017em) | `text-xl font-semibold tracking-[-0.017em] leading-[25px]` |
| `body-lg` (17px/400/−0.015em) | `text-[17px] font-normal tracking-[-0.015em] leading-6` |
| `body-md` (15px/400/−0.012em) | `text-[15px] font-normal tracking-[-0.012em] leading-[22px]` |
| `label-md` (13px/500/−0.006em) | `text-[13px] font-medium tracking-[-0.006em] leading-[18px]` |
| `label-sm` (12px/500/0em) | `text-xs font-medium leading-4` |

---

## Espaciado

Incrementos de 8px estrictos. No usar valores arbitrarios fuera de la escala del sistema.

| Token | Valor | Tailwind |
|-------|-------|---------|
| `xs` | 4px | `p-1`, `gap-1`, `m-1` |
| `sm` | 8px | `p-2`, `gap-2`, `m-2` |
| `md` | 16px | `p-4`, `gap-4`, `m-4` |
| `lg` | 24px | `p-6`, `gap-6`, `m-6` |
| `xl` | 32px | `p-8`, `gap-8`, `m-8` |
| `container-margin` | 40px | `px-10` |
| `gutter` | 20px | `gap-5`, `px-5` |

---

## Convenciones de código

### Estructura de archivos

```
src/
  api/          # funciones HTTP puras, retornan datos tipados
  components/   # componentes reutilizables sin lógica de negocio
    ui/         # shadcn/ui generados — no modificar manualmente
  features/     # módulos por funcionalidad (auth, board, tickets, ...)
  hooks/        # custom hooks genéricos
  lib/          # utilidades y singletons (axios, queryClient, socket, ...)
  router/       # AppRouter + ProtectedRoute
  stores/       # Zustand stores
  types/        # interfaces TypeScript globales en index.ts
```

### Componentes

- Un componente por archivo. Nombre en PascalCase, igual que el archivo.
- Props tipadas con `interface Props {}` local, no exportar salvo que otro módulo la necesite.
- No usar `any`. Usar los tipos de `@/types/index.ts`; extender si es necesario.
- Variantes de estilo con `class-variance-authority` (cva), no con ternarios inline largos.

### Llamadas a la API

```ts
// Patrón estándar con TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['tickets', filters],
  queryFn: () => ticketsApi.list(filters),
})

// Mutaciones
const mutation = useMutation({
  mutationFn: ticketsApi.create,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
})
```

El cliente axios vive en `@/lib/axios`. El token JWT se inyecta automáticamente via interceptor — no pasarlo manualmente.

### Formularios

```ts
const form = useForm<TicketValues>({
  resolver: zodResolver(ticketSchema),
  defaultValues: { ... },
})
```

Schemas Zod en archivos `*Schemas.ts` dentro del feature correspondiente. No duplicar validación — si el schema ya existe, importarlo.

### Estado global

- `authStore` (`@/stores/authStore`): token + usuario autenticado. Único store de auth.
- Estado de UI local (modales, paneles): `useState` dentro del componente o componente padre inmediato.
- No crear stores Zustand adicionales salvo que el estado sea genuinamente global y compartido entre múltiples features.

---

## Reglas de negocio (del backlog)

### Roles

| Acción | Admin | Usuario |
|--------|-------|---------|
| Crear ticket | ✓ | ✓ (propio) |
| Editar cualquier ticket | ✓ | ✗ |
| Editar ticket propio | ✓ | ✓ |
| Archivar ticket | ✓ | ✓ (propio) |
| Gestionar usuarios | ✓ | ✗ |
| Ver dashboard | ✓ | ✗ |
| Mover tickets ajenos entre columnas | ✓ | ✗ |

### Tickets

- **Estados válidos:** `backlog` | `en_progreso` | `hecho` — exactamente 3, no agregar más.
- **Prioridades válidas:** `baja` | `media` | `alta` | `critica` — usar los valores del enum en `@/types/index.ts`.
- Archivado es **lógico** (`archived: true`), nunca físico. Los tickets archivados no aparecen en el tablero.
- Título obligatorio, máximo 255 caracteres. Sanitizar HTML/scripts antes de persistir.
- El campo `version` (integer) se envía en cada PATCH. Si el backend responde `409`, mostrar `ConflictResolutionDialog`.

### Concurrencia

- Usar `usePresence` para heartbeat cada 60 s al editar un ticket.
- Si llega evento `ticket:archived` via socket mientras el drawer está abierto, mostrar `TicketArchivedBanner`.
- Si llega `ticket:conflict`, mostrar `ConflictResolutionDialog` con los cambios propios vs. la versión del servidor.
- El indicador de edición en el tablero usa `EditingIndicator` y muestra el nombre del usuario.

### Validación

- Validar en cliente con Zod **y** asumir que el backend valida independientemente.
- Mostrar **todos** los errores de validación a la vez (no uno por uno).
- Fechas de vencimiento no pueden ser anteriores a hoy.

---

## Mock de autenticación (desarrollo sin backend)

Usuarios de demo en `@/lib/mockAuth.ts`. El `LoginForm` los expone como botones de acceso rápido. No llaman a la API — setean el store directamente. Eliminar estos botones cuando el backend esté listo.

---

## Out of scope (V1) — no implementar

- Modo oscuro
- Estados `en_revision` / `bloqueado`
- Audit log / historial de cambios
- Restauración de tickets archivados
- Configuración de notificaciones por usuario
- Métricas por usuario o por proyecto
- OAuth real / SSO corporativo
- App móvil nativa
- Roles granulares más allá de Admin / Usuario
