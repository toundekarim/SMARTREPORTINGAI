const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock Data Fallback
const MOCK_PARTNERS = [
    { id: 1, name: 'Alpha Solutions', contact_email: 'contact@alpha.lu', description: 'Partenaire technologique spécialisé en infrastructure.', contract_start_date: '2024-01-01', contract_end_date: '2027-01-01' },
    { id: 2, name: 'Green Energy Co', contact_email: 'info@green.lu', description: 'Consultants en développement durable.', contract_start_date: '2023-06-01', contract_end_date: '2025-06-01' }
];

const MOCK_PROJECTS = [
    { id: 101, partner_id: 1, title: 'Digitalisation Phase 1', description: 'Mise en place de serveurs cloud.', status: 'active', evolution_data: [{ "date": "2024-01", "prog": 10 }, { "date": "2024-03", "prog": 35 }, { "date": "2024-06", "prog": 60 }, { "date": "2024-09", "prog": 85 }], created_at: '2024-01-10' },
    { id: 102, partner_id: 2, title: 'Audit Écomobilité', description: 'Analyse du parc automobile du partenaire.', status: 'active', evolution_data: [{ "date": "2023-06", "prog": 5 }, { "date": "2023-12", "prog": 45 }, { "date": "2024-06", "prog": 90 }], created_at: '2023-06-15' }
];

const MOCK_TEMPLATES = [
    { id: 1, partner_id: 1, title: 'Template de Rapport Technique Infra', requires_video: true, requires_audio: true, requires_text: true, text_formats: 'Word, PDF, Texte Simple', instructions: 'Merci d\'inclure une vidéo de démonstration de l\'infrastructure, un audio explicatif des choix techniques et le document PDF détaillé.' },
    { id: 2, partner_id: 2, title: 'Modèle d' + "'" + 'Audit Écologique', requires_video: false, requires_audio: true, requires_text: true, text_formats: 'Word, PDF', instructions: 'Audio court pour résumer les points clés + rapport Word complet.' }
];

const MOCK_REPORTS = [
    { id: 1001, project_id: 101, partner_id: 1, title: 'Rapport Mensuel Janvier - Digitalisation', status: 'validé', submission_date: '2025-01-05', reviewer: 'Jean Dupont' },
    { id: 1002, project_id: 101, partner_id: 1, title: 'Rapport Mensuel Février - Digitalisation', status: 'en attente', submission_date: '2025-02-02', reviewer: 'Jean Dupont' },
    { id: 1003, project_id: 102, partner_id: 2, title: 'Audit Mi-parcours - Écomobilité', status: 'validé', submission_date: '2024-12-15', reviewer: 'Marie Curie' },
    { id: 1004, project_id: 102, partner_id: 2, title: 'Rapport Trimestriel Q1 - Écomobilité', status: 'brouillon', submission_date: '2025-01-20', reviewer: 'Marie Curie' }
];

const MOCK_EVENTS = [
    { id: 1, partner_id: 1, title: 'Réunion de Pilotage', description: 'Discussion sur la phase 2 du projet.', event_date: '2025-02-15T10:00:00', type: 'meeting' },
    { id: 2, partner_id: 2, title: 'Présentation Audit', description: 'Restitution finale de l\'audit écomobilité.', event_date: '2025-02-20T14:30:00', type: 'meeting' },
    { id: 3, partner_id: 1, title: 'Deadline Rapport Trimestriel', description: 'Échéance pour la soumission du rapport Q1.', event_date: '2025-03-31T23:59:59', type: 'deadline' }
];

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres'
});

let useMock = false;

// Init DB
const initDb = async () => {
    try {
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await pool.query(schema);
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Database connection failed or schema error. Using Mock Mode.');
        useMock = true;
    }
};

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', mock: useMock }));

app.get('/api/partners', async (req, res) => {
    if (useMock) return res.json(MOCK_PARTNERS);
    try {
        const result = await pool.query('SELECT * FROM partners ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/partners/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (useMock) {
        const partner = MOCK_PARTNERS.find(p => p.id === id);
        const projects = MOCK_PROJECTS.filter(p => p.partner_id === id);
        const templates = MOCK_TEMPLATES.filter(t => t.partner_id === id);
        return res.json({ ...partner, projects, templates, events: [] });
    }
    try {
        const partner = await pool.query('SELECT * FROM partners WHERE id = $1', [id]);
        const projects = await pool.query('SELECT * FROM projects WHERE partner_id = $1', [id]);
        const events = await pool.query('SELECT * FROM events WHERE partner_id = $1', [id]);
        const templates = await pool.query('SELECT * FROM report_templates WHERE partner_id = $1', [id]);

        res.json({
            ...partner.rows[0],
            projects: projects.rows,
            events: events.rows,
            templates: templates.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats/global', async (req, res) => {
    // Return combined evolution for all projects as example
    if (useMock) {
        const allPoints = MOCK_PROJECTS.flatMap(p => p.evolution_data.map(d => ({ ...d, project: p.title })));
        return res.json(allPoints);
    }
    try {
        const result = await pool.query('SELECT title, evolution_data FROM projects');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/events', async (req, res) => {
    if (useMock) return res.json(MOCK_EVENTS);
    try {
        const result = await pool.query('SELECT e.*, p.name as partner_name FROM events e JOIN partners p ON e.partner_id = p.id ORDER BY event_date');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports', async (req, res) => {
    if (useMock) {
        const reports = MOCK_REPORTS.map(r => {
            const partner = MOCK_PARTNERS.find(p => p.id === r.partner_id);
            const project = MOCK_PROJECTS.find(p => p.id === r.project_id);
            return { ...r, partner_name: partner?.name, project_title: project?.title };
        });
        return res.json(reports);
    }
    try {
        const result = await pool.query(`
            SELECT r.*, p.name as partner_name, prj.title as project_title 
            FROM reports r 
            JOIN partners p ON r.partner_id = p.id 
            JOIN projects prj ON r.project_id = prj.id 
            ORDER BY submission_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/partners/:id/projects', async (req, res) => {
    const id = parseInt(req.params.id);
    if (useMock) {
        return res.json(MOCK_PROJECTS.filter(p => p.partner_id === id));
    }
    try {
        const result = await pool.query('SELECT * FROM projects WHERE partner_id = $1', [id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/templates', async (req, res) => {
    if (useMock) return res.json(MOCK_TEMPLATES);
    try {
        const result = await pool.query('SELECT t.*, p.name as partner_name FROM report_templates t JOIN partners p ON t.partner_id = p.id ORDER BY t.created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initDb();
});

// Prevent exiting
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});
