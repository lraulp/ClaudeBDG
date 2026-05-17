-- ============================================================
-- seed_data.sql — MiniJira MVP — Mock Data
-- Ejecutar DESPUÉS de init_db.sql
-- ============================================================
-- Credenciales de prueba (bcrypt cost=10, contraseña: Test1234!)
--   laura.garcia@minijira.dev   / Test1234!
--   marcos.lopez@minijira.dev   / Test1234!
--   sofia.martinez@minijira.dev / Test1234!
-- ============================================================

BEGIN;

-- ============================================================
-- USUARIOS
-- ============================================================
INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at)
VALUES
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'laura.garcia@minijira.dev',
        'Laura García',
        '$2b$10$LDIoobB1s2HPeRuHqNz7EuXHbzNfJApoFPodFCeMy5RVGe8pRw55m',
        'admin',
        '2026-04-17 09:00:00+00',
        '2026-04-17 09:00:00+00'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'marcos.lopez@minijira.dev',
        'Marcos López',
        '$2b$10$LDIoobB1s2HPeRuHqNz7EuXHbzNfJApoFPodFCeMy5RVGe8pRw55m',
        'admin',
        '2026-04-17 09:05:00+00',
        '2026-04-17 09:05:00+00'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'sofia.martinez@minijira.dev',
        'Sofía Martínez',
        '$2b$10$LDIoobB1s2HPeRuHqNz7EuXHbzNfJApoFPodFCeMy5RVGe8pRw55m',
        'usuario',
        '2026-04-17 09:10:00+00',
        '2026-04-17 09:10:00+00'
    );


-- ============================================================
-- ETIQUETAS  (creadas por Laura — Admin)
-- ============================================================
INSERT INTO labels (id, name, created_by, created_at)
VALUES
    ('b1ff1111-0000-0000-0000-000000000001', 'frontend',  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-04-17 10:00:00+00'),
    ('b1ff1111-0000-0000-0000-000000000002', 'backend',   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-04-17 10:00:00+00'),
    ('b1ff1111-0000-0000-0000-000000000003', 'bug',       'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-04-17 10:00:00+00'),
    ('b1ff1111-0000-0000-0000-000000000004', 'feature',   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-04-17 10:00:00+00'),
    ('b1ff1111-0000-0000-0000-000000000005', 'database',  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '2026-04-17 10:05:00+00');


-- ============================================================
-- TICKETS
-- ============================================================
--
--  T-001  Diseñar esquema de base de datos          → LISTO      (Alta)
--  T-002  Implementar autenticación JWT              → EN PROGRESO (Alta)
--  T-003  Construir tablero Kanban                   → EN PROGRESO (Media)
--  T-004  Configurar cola de notificaciones BullMQ   → POR HACER  (Media)
--  T-005  Corregir validación de fechas en el form   → POR HACER  (Baja)
--
INSERT INTO tickets (
    id, title, description, status, priority,
    created_by, assigned_to,
    due_date, version,
    created_at, updated_at
)
VALUES
    -- T-001 — LISTO
    (
        'c2000000-0000-0000-0000-000000000001',
        'Diseñar esquema de base de datos',
        'Definir tablas, relaciones, índices y campo version para optimistic locking. '
        'Incluir ENUMs para estado y prioridad. Entregar init_db.sql revisado por Marcos.',
        'listo',
        'alta',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',   -- creado por Marcos
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',   -- asignado a Marcos
        '2026-04-25',
        2,                                          -- version > 1: fue editado al menos una vez
        '2026-04-17 11:00:00+00',
        '2026-04-24 16:30:00+00'
    ),
    -- T-002 — EN PROGRESO
    (
        'c2000000-0000-0000-0000-000000000002',
        'Implementar autenticación JWT',
        'Endpoints POST /auth/register y POST /auth/login. '
        'Hash de contraseña con bcrypt (cost=10). '
        'JWT firmado con HS256, expiración 8h. Middleware de autorización por rol.',
        'en_progreso',
        'alta',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',   -- creado por Marcos
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',   -- asignado a Sofía
        '2026-05-05',
        1,
        '2026-04-25 09:00:00+00',
        '2026-05-02 14:00:00+00'
    ),
    -- T-003 — EN PROGRESO
    (
        'c2000000-0000-0000-0000-000000000003',
        'Construir tablero Kanban con drag-and-drop',
        'Tres columnas: Por hacer, En progreso, Listo. '
        'Usar @dnd-kit/core para drag-and-drop. '
        'Cada tarjeta muestra: título, prioridad (badge de color), asignado y fecha de vencimiento.',
        'en_progreso',
        'media',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',   -- creado por Sofía
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',   -- asignado a Sofía
        '2026-05-09',
        1,
        '2026-04-28 10:30:00+00',
        '2026-05-06 11:00:00+00'
    ),
    -- T-004 — POR HACER
    (
        'c2000000-0000-0000-0000-000000000004',
        'Configurar cola de notificaciones con BullMQ',
        'Instalar BullMQ + ioredis. Crear worker que consuma la cola email-notifications. '
        'Implementar reintentos automáticos x3 con backoff exponencial. '
        'En caso de fallo definitivo, insertar registro en notification_log.',
        'por_hacer',
        'media',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',   -- creado por Marcos
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',   -- asignado a Marcos
        '2026-05-12',
        1,
        '2026-05-02 09:00:00+00',
        '2026-05-02 09:00:00+00'
    ),
    -- T-005 — POR HACER (sin asignar, baja prioridad)
    (
        'c2000000-0000-0000-0000-000000000005',
        'Corregir validación de fecha de vencimiento en formulario',
        'El campo due_date permite seleccionar fechas pasadas sin mostrar error. '
        'Agregar validación en el frontend (antes de submit) y en el backend (middleware Zod).',
        'por_hacer',
        'baja',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',   -- creado por Sofía
        NULL,                                        -- sin asignar
        NULL,
        1,
        '2026-05-07 16:45:00+00',
        '2026-05-07 16:45:00+00'
    );


-- ============================================================
-- ETIQUETAS POR TICKET  (ticket_labels)
-- ============================================================
INSERT INTO ticket_labels (ticket_id, label_id)
VALUES
    -- T-001: database + backend
    ('c2000000-0000-0000-0000-000000000001', 'b1ff1111-0000-0000-0000-000000000005'),
    ('c2000000-0000-0000-0000-000000000001', 'b1ff1111-0000-0000-0000-000000000002'),
    -- T-002: backend + feature
    ('c2000000-0000-0000-0000-000000000002', 'b1ff1111-0000-0000-0000-000000000002'),
    ('c2000000-0000-0000-0000-000000000002', 'b1ff1111-0000-0000-0000-000000000004'),
    -- T-003: frontend + feature
    ('c2000000-0000-0000-0000-000000000003', 'b1ff1111-0000-0000-0000-000000000001'),
    ('c2000000-0000-0000-0000-000000000003', 'b1ff1111-0000-0000-0000-000000000004'),
    -- T-004: backend
    ('c2000000-0000-0000-0000-000000000004', 'b1ff1111-0000-0000-0000-000000000002'),
    -- T-005: frontend + bug
    ('c2000000-0000-0000-0000-000000000005', 'b1ff1111-0000-0000-0000-000000000001'),
    ('c2000000-0000-0000-0000-000000000005', 'b1ff1111-0000-0000-0000-000000000003');


-- ============================================================
-- COMENTARIOS
-- ============================================================
INSERT INTO comments (id, ticket_id, author_id, body, created_at)
VALUES
    -- Comentarios en T-001 (LISTO)
    (
        'e3000000-0000-0000-0000-000000000001',
        'c2000000-0000-0000-0000-000000000001',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'Revisado. El campo version para optimistic locking está bien modelado. Aprobado para merge.',
        '2026-04-24 17:00:00+00'
    ),
    -- Comentarios en T-002 (EN PROGRESO)
    (
        'e3000000-0000-0000-0000-000000000002',
        'c2000000-0000-0000-0000-000000000002',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        '@sofia.martinez recuerda agregar el middleware de roles antes del handler, no después. Revisa la estructura de Express.',
        '2026-04-30 10:15:00+00'
    ),
    (
        'e3000000-0000-0000-0000-000000000003',
        'c2000000-0000-0000-0000-000000000002',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'Entendido @marcos.lopez. Ya moví el middleware. Los tests de integración para /auth/login pasan en local.',
        '2026-04-30 11:40:00+00'
    ),
    -- Comentario en T-003 (EN PROGRESO)
    (
        'e3000000-0000-0000-0000-000000000004',
        'c2000000-0000-0000-0000-000000000003',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'El drag-and-drop se ve bien en desktop. Verificar que también funcione en tablet (mínimo 768px) antes de cerrar el ticket.',
        '2026-05-06 12:00:00+00'
    );


-- ============================================================
-- NOTIFICATION_LOG — fallo de email simulado
-- ============================================================
-- Simula un email de asignación (T-002 → Sofía) que falló tras 3 intentos
INSERT INTO notification_log (id, ticket_id, recipient, event_type, error_msg, attempts, created_at)
VALUES
    (
        'f4000000-0000-0000-0000-000000000001',
        'c2000000-0000-0000-0000-000000000002',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        'assigned',
        'SMTP 550 5.1.1 The email account does not exist. Retry limit reached after 3 attempts.',
        3,
        '2026-04-25 09:05:00+00'
    );


COMMIT;
