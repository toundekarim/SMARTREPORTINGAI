-- Create Partners Table
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    logo_url TEXT,
    contract_start_date DATE NOT NULL,
    contract_end_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    evolution_data JSONB, -- Example: [{"date": "2024-01", "progress": 10}, ...]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
INSERT INTO partners (name, contact_email, contract_start_date, contract_end_date, description)
VALUES 
('Alpha Solutions', 'contact@alpha.lu', '2024-01-01', '2027-01-01', 'Partenaire technologique spécialisé en infrastructure.'),
('Green Energy Co', 'info@green.lu', '2023-06-01', '2025-06-01', 'Consultants en développement durable.');

INSERT INTO projects (partner_id, title, description, evolution_data)
VALUES 
(1, 'Digitalisation Phase 1', 'Mise en place de serveurs cloud.', '[{"date": "2024-01", "prog": 10}, {"date": "2024-03", "prog": 35}, {"date": "2024-06", "prog": 60}, {"date": "2024-09", "prog": 85}]'),
(2, 'Audit Écomobilité', 'Analyse du parc automobile du partenaire.', '[{"date": "2023-06", "prog": 5}, {"date": "2023-12", "prog": 45}, {"date": "2024-06", "prog": 90}]');

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
