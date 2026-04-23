# MiniJira — Frontend

Stack: React 18 · TypeScript 5 · Vite 5 · TanStack Query 5 · Zustand 4 · dnd-kit 6 · shadcn/ui · Tailwind 3

## Setup

```bash
# 1. Instalar dependencias
pnpm install

# 2. Variables de entorno
cp .env.example .env
# Editar .env con tu VITE_GOOGLE_CLIENT_ID

# 3. Desarrollo
pnpm dev
```

El frontend espera el backend corriendo en `http://localhost:3000`.  
El proxy de Vite reenvía `/api/*` al backend automáticamente.

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm preview` | Preview del build |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm test` | Vitest |

## Estructura

```
src/
├── features/
│   ├── auth/          LoginPage + authStore
│   ├── board/         BoardPage + KanbanBoard + DnD
│   ├── tickets/       TicketDetailPanel + Comments
│   └── metrics/       MetricsPage (próxima iteración)
├── hooks/             TanStack Query wrappers
├── lib/               api.ts · queryClient.ts · utils.ts
├── components/
│   ├── common/        Avatar, Badges, ConflictBanner, AppLayout
│   └── ui/            shadcn (generar con: pnpm dlx shadcn@latest add ...)
├── router/            Rutas + ProtectedRoute
├── styles/            globals.css (design system CSS vars)
└── types/             Todos los tipos del spec
```

## shadcn/ui — componentes a instalar

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input select dialog tooltip switch label popover
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google Cloud Console |
