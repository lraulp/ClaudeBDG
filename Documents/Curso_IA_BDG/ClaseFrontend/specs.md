# PRD — Mini Jira (Herramienta Interna de Gestión de Tickets)

**Versión:** 0.1 — Draft  
**Fecha:** 2026-05-07  
**Fuente:** Transcripción Kick-off 24 de Octubre  
**Autor PRD:** PM Senior (síntesis de reunión)  
**Stakeholders:** Laura (PO), Marcos (Tech Lead), Sofía (Dev Junior), Roberto (PM)

---

## 1. Contexto y Objetivo

Herramienta interna de gestión de tareas para un equipo de 10 personas. Sustituye el uso informal de Jira con una solución ligera, visualmente moderna y sin curva de aprendizaje. La primera versión debe estar en producción en **3 semanas** desde el kick-off.

---

## 2. In-Scope — V1

### 2.1 Autenticación y Roles

| Rol | Capacidades |
|-----|-------------|
| **Admin** | CRUD completo sobre todos los tickets, gestión de usuarios, acceso al dashboard |
| **Usuario** | Crear y editar sus propios tickets, comentar, cambiar estado de tickets asignados a sí mismo |

> **Decisión pendiente:** Confirmar si un usuario puede ver tickets de compañeros o solo los propios.

### 2.2 Gestión de Tickets

**Campos del ticket:**

| Campo | Tipo | Notas |
|-------|------|-------|
| Título | Texto corto (requerido) | |
| Descripción | Texto largo | |
| Estado | Selector | Ver sección 2.3 |
| Prioridad | Selector: Alta / Media / Baja | |
| Asignado a | Usuario del sistema | |
| Etiquetas | Multi-selector | Catálogo gestionado por Admin |
| Fecha de creación | Auto | |
| Fecha de vencimiento | Date picker | Opcional |
| Creado por | Auto | |

**Operaciones:**

- Crear ticket
- Editar ticket (campos individuales)
- Archivar ticket — el botón se etiqueta "Eliminar" pero la acción es archivo lógico; el ticket no se borra físicamente
- Asignar / reasignar ticket a un usuario

### 2.3 Estados del Ticket

Acordado en reunión: **3 columnas** (posición de Laura / PO).

```
Por hacer  →  En progreso  →  Listo
```

> **Decisión pendiente:** Marcos solicitó añadir "Review" y "Blocked". Queda como backlog para V2 salvo que el equipo acuerde antes del inicio del sprint.

### 2.4 Filtros y Búsqueda

Vista de lista con filtros por:

- Estado
- Prioridad
- Asignado a
- Etiquetas
- Fecha de creación (rango)
- Fecha de vencimiento (rango)

### 2.5 Comentarios

- Cualquier usuario puede comentar en cualquier ticket visible
- Cada comentario registra: autor, timestamp y texto
- Los comentarios no son editables ni borrables en V1

### 2.6 Notificaciones por Email

Disparadores:

| Evento | Destinatario |
|--------|-------------|
| Ticket asignado a ti | Usuario asignado |
| Mención con @usuario en comentario | Usuario mencionado |

- Envío **asíncrono** (cola de mensajes para no bloquear la UI)
- En caso de fallo de envío: reintentos automáticos x3, luego log de error

### 2.7 Dashboard de Métricas

Visible para todos los roles. Métricas de V1:

- Tickets cerrados por mes (gráfica de barras)
- Tickets abiertos vs. cerrados (totales actuales)
- Distribución por estado (donut chart)

### 2.8 Diseño y UX

- Estética: blanco, limpio, sombras suaves — referencia visual Apple / minimalista
- Librería de componentes: **a definir por Tech Lead** (sugerencia: shadcn/ui o Radix UI)
- Sin manual de usuario: la interfaz debe ser autoexplicativa

---

## 3. Out-of-Scope — V1

Los siguientes ítems fueron mencionados en la reunión pero **no entran en la primera versión** por restricciones de tiempo o por falta de definición suficiente.

| Ítem | Razón de exclusión |
|------|--------------------|
| Modo oscuro | Solicitado al cierre de reunión sin acuerdo; backlog V2 |
| Estados "Review" y "Blocked" | Rechazado por PO en reunión; backlog V2 |
| Bloqueo / resolución de conflictos en edición concurrente | Sin política definida; requiere decisión antes de V2 |
| Historial de cambios por ticket (audit log) | No mencionado; complejidad media-alta |
| Roles granulares más allá de Admin / Usuario | Sin definición suficiente; backlog V2 |
| Restauración de tickets archivados | Sin política definida |
| Configuración de notificaciones por usuario | No discutido; backlog V2 |
| Métricas por usuario o por proyecto | Solo métricas globales en V1 |
| Integración con herramientas externas (Slack, GitHub, etc.) | No mencionado |
| App móvil | No mencionado |

---

## 4. Decisiones Técnicas Pendientes (Blockers)

Estas decisiones deben resolverse en la **primera semana** antes de que bloqueen el desarrollo:

1. **Concurrencia:** ¿"Último en guardar gana" o detección de conflicto con aviso al usuario? — Asignado a: Marcos + Roberto
2. **Visibilidad de tickets:** ¿Un usuario ve todos los tickets del equipo o solo los creados/asignados a él? — Asignado a: Laura
3. **Estados de ticket:** Confirmación final de 3 vs. 4 columnas — Asignado a: Laura + Marcos
4. **Archivado:** ¿Los tickets archivados aparecen en filtros y dashboard? — Asignado a: Laura

---

## 5. Stack Tecnológico

| Capa | Tecnología | Fuente de la decisión |
|------|-----------|----------------------|
| Frontend | **React** | Explícito — Marcos en reunión |
| Backend | **Node.js** | Explícito — Marcos en reunión |
| Base de datos | **Relacional (PostgreSQL recomendado)** | Marcos asumió relacional; PostgreSQL recomendado por PM para JSON fields y full-text search |
| ORM | **Prisma** (recomendado) | Sofía preguntó sin respuesta; Prisma facilita migraciones ante cambios de esquema probable en V1 |
| Servicio de email | **Resend / Nodemailer + SMTP** | Requerido por notificaciones; pendiente de confirmar con infraestructura |
| Autenticación | **JWT + bcrypt** | Inferido de requisito de roles; sin SSO por ahora |
| Librería UI | **Por definir (shadcn/ui recomendado)** | Laura pidió estética moderna; decisión de Tech Lead |
| Hosting / Deploy | **Por definir** | No discutido en reunión |

---

## 6. Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Plazo de 3 semanas inviable con el alcance actual | Alta | Alto | Negociar exclusión de email + dashboard para V1; lanzar con ticket core |
| Requisitos de permisos sin definir bloquean el modelo de datos | Alta | Alto | Workshop de 1h con Laura esta semana para cerrar la tabla de permisos |
| Edición concurrente sin política genera corrupción silenciosa de datos | Media | Alto | Decidir política antes de construir el endpoint de PATCH |
| Scope creep continuo (modo oscuro, métricas avanzadas) | Alta | Medio | Congelar alcance V1 con firma del PO sobre este documento |

---

## 7. Criterios de Aceptación — MVP

- [ ] Un usuario puede registrarse/loguearse y ver el tablero de tickets
- [ ] Un usuario puede crear, editar y archivar sus tickets
- [ ] Los tickets se pueden mover entre los 3 estados mediante drag-and-drop o selector
- [ ] Un Admin puede gestionar todos los tickets y usuarios
- [ ] Los filtros de estado, prioridad y asignado funcionan correctamente
- [ ] Al asignar un ticket se envía email al destinatario
- [ ] El dashboard muestra tickets cerrados por mes con datos reales
- [ ] La interfaz es usable en Chrome/Edge sin manual de usuario

---

*Este documento requiere revisión y aprobación de Laura (PO) y Marcos (Tech Lead) antes de iniciar el desarrollo.*
