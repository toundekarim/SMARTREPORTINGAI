-- Create Partners Table
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    logo_url TEXT,
    contract_start_date DATE NOT NULL,
    contract_end_date DATE NOT NULL,
    description TEXT,
    meeting_frequency VARCHAR(50) DEFAULT 'mensuelle',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE partners ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Luxembourg';

-- Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    evolution_data JSONB, -- Example: [{"date": "2024-01", "progress": 10}, ...]
    report_template_type VARCHAR(50), -- 'narrative' or 'financial'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS report_template_type VARCHAR(50);

-- Create Report Templates Table
CREATE TABLE IF NOT EXISTS report_templates (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    requires_video BOOLEAN DEFAULT FALSE,
    requires_audio BOOLEAN DEFAULT FALSE,
    requires_text BOOLEAN DEFAULT TRUE,
    text_formats TEXT DEFAULT 'Word, PDF, Texte Simple',
    instructions TEXT,
    structure JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure structure column exists for existing tables
ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS structure JSONB;

-- Create Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    deadline DATE NOT NULL,
    submission_date DATE,
    file_url TEXT,
    video_url TEXT,
    audio_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE reports ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Create Events Table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'meeting', 'report'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Demo Data
INSERT INTO partners (name, contact_email, contract_start_date, contract_end_date, description, country)
VALUES
('Alpha Solutions', 'contact@alpha.lu', '2024-01-01', '2027-01-01', 'Partenaire technologique.', 'Luxembourg');

-- Removed default project as per previous request, assuming DB is clean or this runs on empty
-- But if I need to update existing schema, the ALTER TABLE handles it.
-- Ignoring insert into projects for demo data to keep it clean if requested.

INSERT INTO report_templates (partner_id, title, requires_video, requires_audio, requires_text, instructions)
VALUES 
(1, 'Template de Rapport Technique Infra', TRUE, TRUE, TRUE, 'Merci d\'inclure une vidéo de démonstration de l\'infrastructure, un audio explicatif des choix techniques et le document PDF détaillé.'),
(2, 'Modèle d'Audit Écologique', FALSE, TRUE, TRUE, 'Audio court pour résumer les points clés + rapport Word complet.');

INSERT INTO reports (project_id, title, deadline)
VALUES 
(1, 'Rapport Technique Mensuel', '2026-02-15'),
(2, 'Étude de Faisabilité', '2026-03-01');

INSERT INTO events (partner_id, title, event_date, type)
VALUES 
(1, 'Réunion de suivi hebdomadaire', '2026-01-15 10:00:00', 'meeting'),
(2, 'Présentation des résultats', '2026-01-20 14:30:00', 'meeting');
