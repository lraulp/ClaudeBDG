-- ============================================================
-- init_db.sql — MiniJira MVP
-- PostgreSQL 15
-- ============================================================

-- ------------------------------------------------------------
-- EXTENSIONES
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()


-- ------------------------------------------------------------
-- TIPOS ENUMERADOS
-- ------------------------------------------------------------
CREATE TYPE user_role       AS ENUM ('admin', 'usuario');
CREATE TYPE ticket_status   AS ENUM ('por_hacer', 'en_progreso', 'listo');
CREATE TYPE ticket_priority AS ENUM ('alta', 'media', 'baja');


-- ------------------------------------------------------------
-- FUNCIÓN COMPARTIDA: actualiza updated_at automáticamente
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TABLA: users
-- ============================================================
CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    name          VARCHAR(255) NOT NULL,
    password_hash TEXT         NOT NULL,
    role          user_role    NOT NULL DEFAULT 'usuario',
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_users_email_format CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ============================================================
-- TABLA: labels  (catálogo gestionado por Admin)
-- ============================================================
CREATE TABLE labels (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL UNIQUE,
    created_by UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TABLA: tickets
-- ============================================================
CREATE TABLE tickets (
    id          UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(255)     NOT NULL,
    description TEXT,
    status      ticket_status    NOT NULL DEFAULT 'por_hacer',
    priority    ticket_priority  NOT NULL DEFAULT 'media',

    -- Relaciones de usuario
    created_by  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to UUID          REFERENCES users(id) ON DELETE SET NULL,

    -- Fechas
    due_date    DATE,
    archived_at TIMESTAMPTZ,          -- NULL = activo | NOT NULL = archivado lógico

    -- Optimistic locking (mermaid_design.md — campo version en PostgreSQL)
    version     INTEGER NOT NULL DEFAULT 1,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_tickets_title_not_empty CHECK (char_length(TRIM(title)) > 0),
    CONSTRAINT chk_tickets_version_positive CHECK (version >= 1)
);

CREATE TRIGGER trg_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Índices parciales para filtros frecuentes (solo tickets activos)
CREATE INDEX idx_tickets_status      ON tickets (status)      WHERE archived_at IS NULL;
CREATE INDEX idx_tickets_priority    ON tickets (priority)    WHERE archived_at IS NULL;
CREATE INDEX idx_tickets_assigned_to ON tickets (assigned_to) WHERE archived_at IS NULL;
CREATE INDEX idx_tickets_due_date    ON tickets (due_date)    WHERE archived_at IS NULL;
CREATE INDEX idx_tickets_created_at  ON tickets (created_at);
CREATE INDEX idx_tickets_created_by  ON tickets (created_by);


-- ============================================================
-- TABLA: ticket_labels  (relación N:M tickets ↔ labels)
-- ============================================================
CREATE TABLE ticket_labels (
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    label_id  UUID NOT NULL REFERENCES labels(id)  ON DELETE CASCADE,

    PRIMARY KEY (ticket_id, label_id)
);

CREATE INDEX idx_ticket_labels_label_id ON ticket_labels (label_id);


-- ============================================================
-- TABLA: comments
-- ============================================================
CREATE TABLE comments (
    id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID        NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id UUID        NOT NULL REFERENCES users(id)   ON DELETE RESTRICT,
    body      TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Sin updated_at: los comentarios no son editables ni borrables en V1 (specs §2.5)

    CONSTRAINT chk_comments_body_not_empty CHECK (char_length(TRIM(body)) > 0)
);

CREATE INDEX idx_comments_ticket_id ON comments (ticket_id);
CREATE INDEX idx_comments_author_id ON comments (author_id);


-- ============================================================
-- TABLA: notification_log
-- Registra los envíos fallidos tras agotar los 3 reintentos (specs §2.6)
-- BullMQ/Redis gestiona la cola; esta tabla es el log persistente de errores.
-- ============================================================
CREATE TABLE notification_log (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   UUID        REFERENCES tickets(id) ON DELETE SET NULL,
    recipient   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type  VARCHAR(50) NOT NULL,   -- 'assigned' | 'mentioned'
    error_msg   TEXT,
    attempts    SMALLINT    NOT NULL DEFAULT 3,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_log_ticket_id ON notification_log (ticket_id);
