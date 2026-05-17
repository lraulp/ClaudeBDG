# Modelo C4 — Nivel Contenedores: Mini Jira

**Versión:** 1.0  
**Fecha:** 2026-05-08  
**Autor:** Arquitecto de Software (síntesis de PRD v0.1 + backlog.md v1.0)

---

## Diagrama de Contenedores

```mermaid
C4Container
    title Modelo C4 — Nivel Contenedores: Mini Jira

    Person(admin, "Admin", "Gestiona todos los tickets, usuarios y configuración del sistema")
    Person(usuario, "Usuario", "Crea y gestiona sus propios tickets; comenta y consulta el tablero")

    System_Boundary(minijira, "Mini Jira") {
        Container(spa, "SPA React", "React 18 · TypeScript · shadcn/ui", "Tablero Kanban, filtros, dashboard de métricas y formularios de tickets")
        Container(api, "API REST", "Node.js · Express · Prisma ORM", "Lógica de negocio: CRUD tickets, auth JWT/OAuth, control de roles y detección de conflictos concurrentes")
        ContainerDb(db, "Base de Datos", "PostgreSQL 15", "Usuarios, tickets, comentarios, etiquetas y campo version para control de concurrencia optimista")
        Container(cache, "Caché / Cola", "Redis", "Locks de edición con TTL de 5 min, indicadores de presencia y cola de notificaciones via BullMQ")
        Container(worker, "Email Worker", "Node.js · BullMQ", "Consume cola de Redis y envía notificaciones de asignación y menciones con reintentos automáticos x3")
    }

    System_Ext(smtp, "Proveedor de Email", "Resend o Nodemailer+SMTP — entrega de correos de notificación")
    System_Ext(oauth, "OAuth 2.0 Corporativo", "Azure AD o Google Workspace — proveedor de identidad corporativo (decisión D1 pendiente)")

    Rel(admin, spa, "Usa", "HTTPS")
    Rel(usuario, spa, "Usa", "HTTPS")

    Rel(spa, api, "Peticiones REST", "HTTPS · Bearer JWT")
    Rel(spa, oauth, "Redirige para login", "OAuth 2.0 Authorization Code")

    Rel(api, db, "Lee y escribe", "Prisma ORM · TCP 5432")
    Rel(api, cache, "Gestiona locks y encola emails", "ioredis · TCP 6379")
    Rel(api, oauth, "Valida identity token", "HTTPS · JWKS endpoint")

    Rel(worker, cache, "Consume cola de notificaciones", "BullMQ · TCP 6379")
    Rel(worker, smtp, "Envía emails", "SMTP / REST API")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

---

## Decisiones de Diseño

| Contenedor | Justificación |
|---|---|
| **Redis (doble rol)** | Unifica locks de edición (H3) y cola de emails (PRD §2.6) en un solo contenedor; evita introducir una segunda dependencia de infraestructura en V1 |
| **Email Worker separado** | El PRD exige envío asíncrono para no bloquear la UI; un worker independiente permite reintentos x3 sin acoplar la API |
| **OAuth como `System_Ext`** | Sigue el PRD: "sin SSO por ahora". Se modela como sistema externo opcional — la decisión D1 (Laura) determina si entra en V1 |
| **Campo `version` en PostgreSQL** | Implementa el optimistic locking de H3 sin necesitar un endpoint adicional; el `PATCH /tickets/:id` valida la versión en la misma transacción |

> **Advertencia:** las relaciones `spa → oauth` y `api → oauth` están condicionadas a que Laura apruebe incluir OAuth en V1 (decisión D1 del backlog).
