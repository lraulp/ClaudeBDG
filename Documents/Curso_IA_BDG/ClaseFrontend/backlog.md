# Product Backlog — Mini Jira MVP

**Versión:** 1.0  
**Fecha:** 2026-05-08  
**Estado:** Validado — pendiente firma de Laura (PO) y Marcos (Tech Lead)  
**Basado en:** PRD v0.1 · user-stories.md v1.0  
**Stakeholders:** Laura (PO), Marcos (Tech Lead), Sofía (Dev Junior), Roberto (PM)

---

## Resumen del backlog

| ID | Historia | Prioridad | Estado | Escenarios | Decisiones bloqueantes |
|----|----------|-----------|--------|------------|------------------------|
| H1 | Autenticación y Control de Acceso por Rol | Alta | Validado | 9 | 3 abiertas |
| H2 | Gestión del Ciclo de Vida en Tablero Kanban | Alta | Validado | 11 | 0 |
| H3 | Edición Segura ante Cambios Concurrentes | Alta | Validado | 10 | 0 |
| EC-01 | Edge Case: Ticket archivado durante edición activa | Media | Validado | 4 | 1 abierta |
| EC-02 | Edge Case: Campos nulos, vacíos o malformados | Alta | Validado | 6 | 1 abierta |

**Total de escenarios Gherkin:** 40

---

## Decisiones bloqueantes abiertas

Las siguientes decisiones deben cerrarse **antes del inicio del sprint** o bloquearán el desarrollo:

| # | Decisión | Asignado a | Afecta a |
|---|----------|------------|----------|
| D1 | ¿Qué proveedor OAuth? (Azure AD, Google Workspace, otro) | Laura | H1 |
| D2 | ¿Auto-creación de cuenta OAuth o aprobación previa de Admin? | Laura | H1 |
| D3 | ¿Usuarios OAuth pueden tener también contraseña local? | Laura + Marcos | H1 |
| D4 | ¿Tickets archivados aparecen en filtros y dashboard? | Laura | EC-01 |
| D5 | ¿Validación de campos solo en frontend o también en `POST /tickets`? | Marcos | EC-02 |

> **Nota de alcance — H1:** OAuth 2.0 corporativo equivale a SSO, marcado como out-of-scope en PRD v0.1 ("sin SSO por ahora"). Su inclusión en V1 requiere aprobación explícita de Laura.

---

## H1 — Autenticación y Control de Acceso por Rol

**Prioridad:** Alta  
**Estado:** Validado  
**Por qué es crítica:** prerequisito de todo lo demás; sin roles no hay modelo de datos válido.

```gherkin
Feature: Autenticación y control de acceso
  As a member of the team
  I want to authenticate — either with credentials or through the corporate
  identity provider — and access the system according to my role
  So that ticket information is protected and each user has only
  the appropriate permissions

  Background:
    Given the system has registered users with roles "Admin" and "Usuario"
    And the corporate OAuth 2.0 provider is configured in the system

  # ── Autenticación local (JWT + bcrypt) ──────────────────────────────────

  Scenario: Successful local login redirects to the ticket board
    Given a registered user with valid credentials
    When the user authenticates with email and password
    Then the user should access the ticket board
    And the user should only see the actions permitted for their role

  Scenario: Login with invalid credentials is rejected
    Given a user with incorrect credentials
    When the user attempts to authenticate with email and password
    Then the system should deny access
    And the user should remain on the login screen

  # ── Autenticación corporativa OAuth 2.0 ─────────────────────────────────

  Scenario: Successful corporate login via OAuth 2.0
    Given a user with an active corporate account in the identity provider
    When the user authenticates through the corporate OAuth 2.0 provider
    Then the system should validate the identity token issued by the provider
    And the user should access the ticket board with their assigned role
    And the session should be maintained through an internal JWT

  Scenario: First-time OAuth login creates a user account automatically
    Given a corporate user who has never logged into the system before
    When the user authenticates successfully through OAuth 2.0
    Then the system should create a user account using the corporate profile data
    And the account should be assigned the "Usuario" role by default
    And an Admin should be notified to review the new account

  Scenario: Corporate user without a system account is rejected
    Given a valid corporate user in the identity provider
    And the system is configured to require prior Admin approval
    When the user attempts to authenticate through OAuth 2.0
    Then the system should deny access
    And the user should receive a message indicating that their account
    requires activation by an administrator

  Scenario: OAuth 2.0 provider unavailable falls back gracefully
    Given the corporate identity provider is temporarily unavailable
    When a user attempts to authenticate through OAuth 2.0
    Then the system should display a service unavailability notice
    And the user should be able to authenticate using local credentials instead

  Scenario: Expired or invalid OAuth token is rejected
    Given a user who presents an OAuth token that has expired or been revoked
    When the system validates the token
    Then the system should deny access
    And the user should be redirected to re-authenticate through the provider

  # ── Control de acceso por rol (compartido ambos métodos) ─────────────────

  Scenario: Admin has full access to all tickets and users
    Given an authenticated user with role "Admin"
    And the user authenticated via local credentials or OAuth 2.0
    When the admin accesses the system
    Then the admin should be able to create, edit, and archive any ticket
    And the admin should be able to manage any user in the system

  Scenario: Regular user can only manage their own tickets
    Given an authenticated user with role "Usuario"
    And the user authenticated via local credentials or OAuth 2.0
    When the user accesses the system
    Then the user should be able to create and edit their own tickets
    And the user should not be able to edit or archive tickets belonging
    to other users
```

---

## H2 — Gestión del Ciclo de Vida de un Ticket en Tablero Kanban

**Prioridad:** Alta  
**Estado:** Validado  
**Por qué es crítica:** es el producto; sin esto no hay MVP entregable.

```gherkin
Feature: Gestión del ciclo de vida de un ticket en tablero Kanban
  As an authenticated team member
  I want to create, edit, move between columns, and archive tickets
  on a Kanban board
  So that I can visualize and manage the progress of my work at a glance

  Background:
    Given an authenticated user with role "Usuario"
    And the Kanban board displays three columns: "Por hacer", "En progreso",
    and "Listo"
    And each column shows all tickets currently in that state

  # ── Visualización del tablero ────────────────────────────────────────────

  Scenario: The board shows all active tickets organized by state
    Given the user accesses the ticket board
    Then each ticket should appear in the column that matches its current state
    And archived tickets should not be visible on the board

  Scenario: Each column shows the ticket count
    Given the board has tickets distributed across columns
    When the user views the Kanban board
    Then each column header should display the number of tickets it contains

  # ── Creación de tickets ──────────────────────────────────────────────────

  Scenario: Create a ticket from a specific column
    Given the user is viewing the Kanban board
    When the user creates a new ticket from the "Por hacer" column
    Then the ticket should appear immediately in that column
    And the ticket should record the creation date and creator automatically

  Scenario: Create a ticket with all optional fields
    Given the user is on the Kanban board
    When the user creates a ticket with title, description,
         priority "<priority>", due date, assignee, and tags
    Then the ticket should be saved with all the provided fields
    And the missing optional fields should remain empty without error

    Examples:
      | priority |
      | Alta     |
      | Media    |
      | Baja     |

  # ── Movimiento entre columnas ────────────────────────────────────────────

  Scenario: Move a ticket by dragging it to another column
    Given the user has a ticket assigned to them in any column
    When the user drags the ticket to a different column
    Then the ticket should appear in the target column immediately
    And the ticket state should reflect the new column

  Scenario: Move a ticket using the state selector
    Given the user has a ticket assigned to them in any column
    When the user changes the ticket state using the selector inside the card
    Then the ticket should move to the column that corresponds to the new state
    And the source column count should decrease by one
    And the target column count should increase by one

  Scenario: A regular user cannot move tickets assigned to others
    Given a ticket on the board that belongs to another user
    When a "Usuario" role user attempts to change its state
    Then the system should deny the action
    And the ticket should remain in its current column

  # ── Edición de tickets ───────────────────────────────────────────────────

  Scenario: Edit individual fields from the board card
    Given the user has a ticket they own visible on the board
    When the user modifies one or more fields of the ticket
    Then the changes should be persisted
    And the card on the board should reflect the updated data
    And the ticket should remain in its current column

  # ── Archivado de tickets ─────────────────────────────────────────────────

  Scenario: Archive a ticket removes it from the board without deleting it
    Given the user has a ticket in any column
    When the user archives the ticket
    Then the ticket should disappear from the Kanban board immediately
    And the column count should decrease by one
    And the ticket data should remain preserved in the system

  # ── Experiencia visual del tablero ───────────────────────────────────────

  Scenario: Ticket cards show key information at a glance
    Given the board has tickets in various columns
    When the user views the Kanban board
    Then each card should display at minimum: title, priority, assignee,
         and due date if set

  Scenario: Overdue tickets are visually distinguished on the board
    Given a ticket whose due date has passed and is not in "Listo" state
    When the user views the board
    Then the ticket card should have a visual indicator marking it as overdue
```

---

## H3 — Edición Segura ante Cambios Concurrentes

**Prioridad:** Alta  
**Estado:** Validado  
**Por qué es crítica:** protege la integridad de los datos; sin política hay riesgo de corrupción silenciosa.  
**Decisión PRD que cierra:** "¿Último gana vs detección de conflicto?" → **detección de conflicto**.

```gherkin
Feature: Edición segura de tickets ante cambios concurrentes
  As an authenticated team member
  I want to be warned when another user is editing the same ticket I am editing
  and to be protected from silently overwriting their changes
  So that no work is lost due to concurrent modifications

  Background:
    Given the system assigns a version number to each ticket on every save
    And the version number is sent to the client when the ticket is opened

  # ── Edición sin concurrencia (camino feliz) ──────────────────────────────

  Scenario: User saves a ticket with no concurrent modifications
    Given a user has opened a ticket and made changes
    And no other user has modified that ticket since it was opened
    When the user saves the ticket
    Then the changes should be persisted successfully
    And the ticket version number should be incremented

  # ── Detección de conflicto ───────────────────────────────────────────────

  Scenario: System detects a conflict when a ticket was modified by another user
    Given two users have opened the same ticket simultaneously
    When the first user saves their changes
    And the second user attempts to save their changes afterwards
    Then the system should detect that the ticket version has changed
    And the system should reject the second user's save
    And the second user should receive a conflict notification

  Scenario: Conflict notification shows what changed
    Given a conflict has been detected for a user editing a ticket
    When the conflict notification is displayed
    Then the user should see their own pending changes
    And the user should see the current state of the ticket as saved by the other user
    And the user should see who made the conflicting change and when

  # ── Resolución de conflicto ──────────────────────────────────────────────

  Scenario: User discards their changes and accepts the current version
    Given a conflict notification is displayed to the user
    When the user chooses to discard their changes
    Then the ticket should reload with the version saved by the other user
    And the user's unsaved changes should be discarded

  Scenario: User overwrites the current version with their own changes
    Given a conflict notification is displayed to the user
    When the user chooses to force-save their changes
    Then the system should persist the user's version
    And the ticket version number should be incremented
    And the other user's changes should be overridden

  # ── Indicador de edición activa ──────────────────────────────────────────

  Scenario: Board shows a visual indicator when a ticket is being edited
    Given a user has opened a ticket for editing
    When another user views the Kanban board or the ticket list
    Then the ticket card should display a visual indicator showing it is
    currently being edited
    And the indicator should show the name of the user editing it

  Scenario: Editing indicator is released when the user exits the ticket
    Given a ticket shows an active editing indicator for a user
    When that user closes the ticket without saving or after saving
    Then the editing indicator should be removed from the ticket card

  Scenario: Editing indicator expires automatically after inactivity
    Given a ticket shows an active editing indicator for a user
    When that user has been inactive for more than 5 minutes
    Then the system should automatically release the editing indicator
    And other users should be able to edit the ticket without a conflict warning

  # ── Resiliencia ──────────────────────────────────────────────────────────

  Scenario: User session drops while editing does not permanently lock the ticket
    Given a user has a ticket open for editing
    When the user's session ends unexpectedly due to disconnection or timeout
    Then the editing indicator should be released automatically
    And the ticket should remain editable by other users

  Scenario: Admin can force-release an editing lock on any ticket
    Given a ticket is showing an editing indicator that appears to be stale
    When an Admin force-releases the editing lock
    Then the indicator should be removed immediately
    And the ticket should be available for editing by any authorized user
```

> **Implicaciones técnicas para Marcos:**
> - Campo `version` (integer) en el modelo `tickets`, incrementa en cada PATCH.
> - `PATCH /tickets/:id` valida el `version` del cliente; si no coincide → `409 Conflict`.
> - Presencia efímera con TTL (Redis o similar) para el indicador de edición y el timeout de 5 min.
> - El force-save es un segundo PATCH con `version` actualizado; no requiere endpoint adicional.

---

## EC-01 — Edge Case: Ticket Archivado Durante una Edición Activa

**Prioridad:** Media  
**Estado:** Validado  
**Origen:** race condition entre H2 (archivado) y H3 (edición concurrente).  
**Riesgo si no se cubre:** pérdida silenciosa del trabajo del usuario editor.

```gherkin
Feature: Ticket archivado durante una edición activa
  As an authenticated team member currently editing a ticket
  I want to be notified immediately if the ticket is archived by someone else
  So that I do not lose my work silently or reach a confusing dead-end

  Background:
    Given user A has a ticket open for editing with unsaved changes
    And the ticket has an active editing indicator visible on the board

  Scenario: Admin archives a ticket while another user is editing it
    Given user A is actively editing ticket #42
    When an Admin archives ticket #42 from the Kanban board
    Then user A should receive an immediate in-app notification
    stating that the ticket has been archived by an administrator
    And user A's unsaved changes should be preserved in the notification
    so they are not silently lost

  Scenario: Editing user attempts to save a ticket that was archived mid-session
    Given user A has unsaved changes on ticket #42
    And ticket #42 was archived by an Admin before user A attempted to save
    When user A tries to save their changes
    Then the system should reject the save with a clear archived-ticket error
    And the system should offer user A the option to copy their changes
    to a new ticket

  Scenario: Editing indicator is removed immediately when a ticket is archived
    Given ticket #42 shows an active editing indicator for user A
    When an Admin archives ticket #42
    Then the editing indicator should be released immediately
    And the ticket should no longer appear on the Kanban board for any user

  Scenario: Admin is warned before archiving a ticket with an active editor
    Given ticket #42 shows an active editing indicator for user A
    When an Admin attempts to archive ticket #42
    Then the system should display a warning indicating that user A
    is currently editing the ticket
    And the Admin should be required to confirm the archive action
    before it is executed
```

---

## EC-02 — Edge Case: Campos Requeridos Nulos, Vacíos o Malformados

**Prioridad:** Alta  
**Estado:** Validado  
**Origen:** el PRD marca `título` como requerido (sección 2.2) pero no define el comportamiento ante entradas inválidas.  
**Riesgo si no se cubre:** registros corruptos en DB, superficie de ataque XSS.

```gherkin
Feature: Validación de campos al crear o editar un ticket
  As the system
  I want to reject ticket submissions with invalid or missing required fields
  So that the database never contains corrupt records and users receive
  clear feedback about what needs to be corrected

  Background:
    Given an authenticated user with permission to create tickets

  # ── Título vacío o nulo ───────────────────────────────────────────────────

  Scenario: Create ticket with empty title is rejected
    Given the user submits a new ticket with an empty title field
    When the system processes the request
    Then the ticket should not be created
    And the system should return a validation error indicating
    that the title is required

  Scenario: Create ticket with whitespace-only title is rejected
    Given the user submits a new ticket whose title contains only spaces or tabs
    When the system processes the request
    Then the ticket should not be created
    And the system should treat the title as empty and return a validation error

  # ── Longitud excesiva ─────────────────────────────────────────────────────

  Scenario: Create ticket with title exceeding the maximum allowed length
    Given the user submits a new ticket with a title longer than 255 characters
    When the system processes the request
    Then the ticket should not be created
    And the system should return a validation error indicating
    the maximum allowed length

  # ── Contenido potencialmente malicioso ───────────────────────────────────

  Scenario: Create ticket with script tags in title is sanitized
    Given the user submits a new ticket whose title contains HTML or script tags
    When the system processes and stores the ticket
    Then the system should sanitize the input before persisting it
    And the stored title should contain no executable markup
    And the sanitized title should be displayed safely to all users

  # ── Campos opcionales con formato inválido ────────────────────────────────

  Scenario Outline: Create ticket with malformed optional field is rejected
    Given the user submits a new ticket with a valid title
    And the "<field>" field contains an invalid value "<invalid_value>"
    When the system processes the request
    Then the ticket should not be created
    And the system should return a validation error identifying
    the "<field>" field as invalid

    Examples:
      | field       | invalid_value         |
      | due_date    | not-a-date            |
      | due_date    | 2020-01-01            |
      | assigned_to | 99999 (nonexistent)   |
      | priority    | Urgente (out of enum) |

  # ── Comportamiento ante fallo parcial ────────────────────────────────────

  Scenario: Validation errors are returned as a list, not one at a time
    Given the user submits a new ticket with multiple invalid fields simultaneously
    When the system processes the request
    Then the ticket should not be created
    And the system should return all validation errors in a single response
    so the user can correct all issues at once
```

---

## Criterios de Aceptación del MVP

Extraídos del PRD v0.1, sección 7. El backlog está completo cuando todos estén marcados:

- [ ] Un usuario puede registrarse / loguearse y ver el tablero de tickets
- [ ] Un usuario puede crear, editar y archivar sus tickets
- [ ] Los tickets se pueden mover entre los 3 estados mediante drag-and-drop o selector
- [ ] Un Admin puede gestionar todos los tickets y usuarios
- [ ] Los filtros de estado, prioridad y asignado funcionan correctamente
- [ ] Al asignar un ticket se envía email al destinatario
- [ ] El dashboard muestra tickets cerrados por mes con datos reales
- [ ] La interfaz es usable en Chrome / Edge sin manual de usuario

---

*Aprobación requerida de Laura (PO) y Marcos (Tech Lead) antes de iniciar el desarrollo.*
