-- Create Partners Table
CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_email TEXT,
    logo_url TEXT,
    contract_start_date TEXT NOT NULL,
    contract_end_date TEXT NOT NULL,
    description TEXT,
    meeting_frequency TEXT DEFAULT 'mensuelle',
    country TEXT DEFAULT 'Luxembourg',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    evolution_data TEXT, -- JSON string
    report_template_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Report Templates Table
CREATE TABLE IF NOT EXISTS report_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    requires_video INTEGER DEFAULT 0,
    requires_audio INTEGER DEFAULT 0,
    requires_text INTEGER DEFAULT 1,
    text_formats TEXT DEFAULT 'Word, PDF, Texte Simple',
    instructions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    deadline TEXT NOT NULL,
    submission_date TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Events Table
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_date TEXT NOT NULL,
    type TEXT NOT NULL, -- 'meeting', 'report'
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
(1, 'Template de Rapport Technique Infra', 1, 1, 1, 'Merci d''inclure une vidéo de démonstration de l''infrastructure, un audio explicatif des choix techniques et le document PDF détaillé.'),
(2, 'Modèle d''Audit Écologique', 0, 1, 1, 'Audio court pour résumer les points clés + rapport Word complet.');

INSERT INTO reports (project_id, title, deadline)
VALUES 
(1, 'Rapport Technique Mensuel', '2026-02-15'),
(2, 'Étude de Faisabilité', '2026-03-01');

INSERT INTO events (partner_id, title, event_date, type)
VALUES 
(1, 'Réunion de suivi hebdomadaire', '2026-01-15 10:00:00', 'meeting'),
(2, 'Présentation des résultats', '2026-01-20 14:30:00', 'meeting');
