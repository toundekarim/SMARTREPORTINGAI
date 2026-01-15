const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const aiService = require('./services/aiService');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const sqlite3 = require('sqlite3').verbose();

// Configure Multer for disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });
const uploadMemory = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log("Created uploads directory");
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- AI ROUTE ---
app.post('/api/ai/generate-template', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Le prompt est requis" });

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const isMockKey = !apiKey || apiKey === "VOTRE_CLE_ICI" || apiKey.includes("VOTRE_CLE");

        if (!isMockKey) {
            try {
                const template = await aiService.generateReportTemplate(prompt);
                return res.json(template);
            } catch (aiErr) {
                console.error("AI Generation failed, falling back to smart mock:", aiErr.message);
            }
        }

        // --- SMART MOCK (Dynamic simulation) ---
        const isHealth = prompt.toLowerCase().includes('santé') || prompt.toLowerCase().includes('médical');
        const isWater = prompt.toLowerCase().includes('eau') || prompt.toLowerCase().includes('forage');

        res.json({
            title: `Rapport : ${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}`,
            instructions: `Ce modèle a été généré pour répondre à votre besoin : "${prompt}". Veuillez détailler les impacts directs sur les bénéficiaires.`,
            structure: [
                { section: "Contexte du Projet", details: `Présentez l'état d'avancement spécifique pour : ${prompt}.` },
                { section: "Objectifs de la Période", details: "Quels étaient les résultats attendus pour cette phase ?" },
                { section: isHealth ? "Indicateurs Sanitaires" : isWater ? "Données Techniques (Débit/Qualité)" : "Indicateurs de Performance", details: "Données chiffrées et vérifiables." },
                { section: "Analyse des Risques", details: "Quels sont les freins rencontrés sur le terrain ?" },
                { section: "Recommandations", details: "Suggérez des ajustements pour la suite du projet." }
            ],
            requires_video: isWater || prompt.toLowerCase().includes('chantier'),
            requires_audio: prompt.toLowerCase().includes('témoignage') || prompt.toLowerCase().includes('social'),
            requires_text: true,
            text_formats: "PDF, Word",
            accepted_formats: ".pdf, .doc, .docx"
        });
    } catch (err) {
        console.error("AI Route Error:", err);
        res.status(500).json({ error: "Erreur critique lors de la génération" });
    }
});

// Mock Data Fallback
let MOCK_PARTNERS = [
    { id: 1, name: 'Alpha Solutions', contact_email: 'contact@alpha.lu', description: 'Partenaire technologique spécialisé en infrastructure.', contract_start_date: '2024-01-01', contract_end_date: '2027-01-01' },
    { id: 2, name: 'Green Energy Co', contact_email: 'info@green.lu', description: 'Consultants en développement durable.', contract_start_date: '2023-06-01', contract_end_date: '2025-06-01' },
    { id: 19, name: 'EPITECH', contact_email: 'contact@epitech.eu', description: 'Expertise en formation et développement.', contract_start_date: '2024-01-01', contract_end_date: '2027-01-01', meeting_frequency: 'hebdomadaire' },
    { id: 20, name: 'Alpha Solutions', contact_email: 'support@alpha.lu', description: 'Solutions IT avancées.', contract_start_date: '2024-01-01', contract_end_date: '2026-01-01', meeting_frequency: 'mensuelle' },
    { id: 21, name: 'ergi', contact_email: 'info@ergi.lu', description: 'Énergies renouvelables et innovation.', contract_start_date: '2024-06-01', contract_end_date: '2027-06-01', meeting_frequency: 'hebdomadaire' }
];

const MOCK_PROJECTS = [
    {
        id: 101,
        partner_id: 19,
        title: 'Expansion Infrastructure Cloud',
        description: 'Migration des services critiques vers une architecture hybride hautement disponible.',
        status: 'active',
        evolution_data: [
            { date: '2025-10', prog: 15 },
            { date: '2025-11', prog: 30 },
            { date: '2025-12', prog: 55 },
            { date: '2026-01', prog: 75 }
        ]
    },
    {
        id: 102,
        partner_id: 20,
        title: 'Modernisation Logicielle Alpha',
        description: 'Refonte complète de l' + "'" + 'interface utilisateur et mise à jour des frameworks core.',
        status: 'active',
        evolution_data: [
            { date: '2025-11', prog: 20 },
            { date: '2025-12', prog: 45 },
            { date: '2026-01', prog: 60 }
        ]
    },
    {
        id: 103,
        partner_id: 21,
        title: 'Optimisation Réseau ergi',
        description: 'Amélioration de la bande passante et sécurité des points d' + "'" + 'accès.',
        status: 'active',
        evolution_data: [
            { date: '2025-12', prog: 10 },
            { date: '2026-01', prog: 25 }
        ]
    }
];

const MOCK_TEMPLATES = [
    { id: 1, partner_id: 1, title: 'Template de Rapport Technique Infra', requires_video: true, requires_audio: true, requires_text: true, text_formats: 'Word, PDF, Texte Simple', instructions: 'Merci d\'inclure une vidéo de démonstration de l\'infrastructure, un audio explicatif des choix techniques et le document PDF détaillé.' },
    { id: 2, partner_id: 2, title: 'Modèle d' + "'" + 'Audit Écologique', requires_video: false, requires_audio: true, requires_text: true, text_formats: 'Word, PDF', instructions: 'Audio court pour résumer les points clés + rapport Word complet.' }
];

const MOCK_REPORTS = [
    { id: 1001, project_id: 101, partner_id: 1, title: 'Rapport Urgent Test', status: 'pending', submission_date: new Date(Date.now() + 86400000).toISOString(), deadline: new Date(Date.now() + 86400000).toISOString(), reviewer: 'Jean Dupont' },
    { id: 1002, project_id: 101, partner_id: 1, title: 'Rapport Mensuel Février - Digitalisation', status: 'en attente', submission_date: '2026-02-02', reviewer: 'Jean Dupont' },
    { id: 1003, project_id: 102, partner_id: 2, title: 'Audit Mi-parcours - Écomobilité', status: 'validé', submission_date: '2025-12-15', reviewer: 'Marie Curie' },
    { id: 1004, project_id: 102, partner_id: 2, title: 'Rapport Trimestriel Q1 - Écomobilité', status: 'brouillon', submission_date: '2026-01-20', reviewer: 'Marie Curie' }
];

const MOCK_EVENTS = [
    { id: 1, partner_id: 1, title: 'Réunion de Pilotage', description: 'Discussion sur la phase 2 du projet.', event_date: '2026-02-15T10:00:00', type: 'meeting' },
    { id: 2, partner_id: 2, title: 'Présentation Audit', description: 'Restitution finale de l\'audit écomobilité.', event_date: '2026-02-20T14:30:00', type: 'meeting' },
    { id: 3, partner_id: 1, title: 'Deadline Rapport Trimestriel', description: 'Échéance pour la soumission du rapport Q1.', event_date: '2026-03-31T23:59:59', type: 'deadline' }
];

let pool;
let sqliteDb;
const dbType = process.env.DB_TYPE || 'postgres';

if (dbType === 'sqlite') {
    const dbPath = path.join(__dirname, 'database.sqlite');
    sqliteDb = new sqlite3.Database(dbPath);
    sqliteDb.run('PRAGMA foreign_keys = ON');

    // Wrapper to mimic pg-style pool.query
    pool = {
        query: (text, params = []) => {
            const sqliteText = text.replace(/\$(\d+)/g, '?');
            return new Promise((resolve, reject) => {
                const isSelect = sqliteText.trim().toLowerCase().startsWith('select');
                const hasReturning = sqliteText.toLowerCase().includes('returning');

                if (isSelect || hasReturning) {
                    sqliteDb.all(sqliteText, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve({ rows, rowCount: rows.length });
                    });
                } else {
                    sqliteDb.run(sqliteText, params, function (err) {
                        if (err) reject(err);
                        else resolve({ rows: [], rowCount: this.changes, lastID: this.lastID });
                    });
                }
            });
        }
    };
} else {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres'
    });
}

let useMock = false;

// Init DB
const initDb = async () => {
    try {
        const schemaFile = dbType === 'sqlite' ? 'schema_sqlite.sql' : 'schema.sql';
        const schema = fs.readFileSync(path.join(__dirname, schemaFile), 'utf8');

        // Check if database is already seeded
        const checkResult = await pool.query("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='partners'");
        const tableExists = checkResult.rows[0].count > 0;

        let alreadyHasData = false;
        if (tableExists) {
            const partnerCount = await pool.query("SELECT count(*) as count FROM partners");
            alreadyHasData = partnerCount.rows[0].count > 0;
        }

        if (!alreadyHasData) {
            console.log('Database empty, seeding...');
            if (dbType === 'sqlite') {
                const statements = schema.split(';').filter(s => s.trim() !== '');
                for (let statement of statements) {
                    await pool.query(statement);
                }
            } else {
                await pool.query(schema);
            }
        } else {
            console.log('Database already has data, skipping seed.');
        }

        // Add file_path column if missing - basic migration
        try {
            await pool.query("ALTER TABLE reports ADD COLUMN file_path TEXT");
            console.log("Migration: Added file_path column to reports table");
        } catch (e) {
            // Ignore if column already exists
        }

        console.log(`Database (${dbType}) ready`);
        useMock = false;
    } catch (err) {
        console.error('Database connection failed:', err.message);
        console.log('Mode Simulation activé (Pas de base de données détectée). Tout fonctionne normalement.');
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
        const staticTemplates = MOCK_TEMPLATES.filter(t => t.partner_id === id);

        const templates = staticTemplates;
        const reports = MOCK_REPORTS.filter(r => r.partner_id === id);
        return res.json({ ...partner, projects, templates, reports, events: [] });
    }
    try {
        const partnerRes = await pool.query('SELECT * FROM partners WHERE id = $1', [id]);
        if (partnerRes.rows.length === 0) {
            return res.status(404).json({ error: "Partenaire non trouvé" });
        }

        const projects = await pool.query('SELECT * FROM projects WHERE partner_id = $1', [id]);
        const events = await pool.query('SELECT * FROM events WHERE partner_id = $1', [id]);
        const templates = await pool.query('SELECT * FROM report_templates WHERE partner_id = $1', [id]);
        const reports = await pool.query('SELECT r.*, p.title as project_title FROM reports r JOIN projects p ON r.project_id = p.id WHERE p.partner_id = $1 ORDER BY r.submission_date DESC', [id]);

        // Parse JSON fields for SQLite
        const parsedProjects = projects.rows.map(p => {
            if (p.evolution_data && typeof p.evolution_data === 'string') {
                try { p.evolution_data = JSON.parse(p.evolution_data); } catch (e) { }
            }
            return p;
        });

        const parsedTemplates = templates.rows.map(t => {
            if (t.structure && typeof t.structure === 'string') {
                try { t.structure = JSON.parse(t.structure); } catch (e) { }
            }
            return t;
        });

        res.json({
            ...partnerRes.rows[0],
            projects: parsedProjects,
            events: events.rows,
            templates: parsedTemplates,
            reports: reports.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/partners', async (req, res) => {
    console.log("POST /api/partners hit with:", req.body);
    const { name, contact_email, description, contract_start_date, contract_end_date, country, meeting_frequency } = req.body;
    if (useMock) {
        const newPartner = {
            id: MOCK_PARTNERS.length + 1,
            name,
            contact_email,
            description,
            country: country || 'Luxembourg',
            meeting_frequency: meeting_frequency || 'mensuelle',
            contract_start_date: contract_start_date || new Date().toISOString().split('T')[0],
            contract_end_date: contract_end_date || new Date(Date.now() + 31536000000).toISOString().split('T')[0]
        };
        MOCK_PARTNERS.push(newPartner);
        return res.json(newPartner);
    }
    try {
        const result = await pool.query(
            'INSERT INTO partners (name, contact_email, description, contract_start_date, contract_end_date, country, meeting_frequency) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, contact_email, description, contract_start_date, contract_end_date, country || 'Luxembourg', meeting_frequency || 'mensuelle']
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/partners/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`DELETE /api/partners/${id} hit`);

    if (useMock) {
        const index = MOCK_PARTNERS.findIndex(p => p.id === id);
        if (index !== -1) {
            const deleted = MOCK_PARTNERS.splice(index, 1)[0];

            // Cascade delete: Remove all associated data
            console.log(`Cascade deleting data for partner ${id}...`);

            // Delete projects
            const deletedProjects = MOCK_PROJECTS.filter(p => p.partner_id === id);
            MOCK_PROJECTS = MOCK_PROJECTS.filter(p => p.partner_id !== id);
            console.log(`Deleted ${deletedProjects.length} projects`);

            // Delete reports
            const deletedReports = MOCK_REPORTS.filter(r => r.partner_id === id);
            MOCK_REPORTS = MOCK_REPORTS.filter(r => r.partner_id !== id);
            console.log(`Deleted ${deletedReports.length} reports`);

            // Delete events
            const deletedEvents = MOCK_EVENTS.filter(e => e.partner_id === id);
            MOCK_EVENTS = MOCK_EVENTS.filter(e => e.partner_id !== id);
            console.log(`Deleted ${deletedEvents.length} events`);

            // Delete report files if they exist
            deletedReports.forEach(report => {
                if (report.file_path && fs.existsSync(report.file_path)) {
                    try {
                        fs.unlinkSync(report.file_path);
                        console.log(`Deleted file: ${report.file_path}`);
                    } catch (e) {
                        console.error("Error deleting file:", e.message);
                    }
                }
            });

            return res.json({
                message: "Partenaire et données associées supprimés avec succès",
                deleted,
                cascade: {
                    projects: deletedProjects.length,
                    reports: deletedReports.length,
                    events: deletedEvents.length
                }
            });
        }
        return res.status(404).json({ error: "Partenaire non trouvé dans les données mock" });
    }

    try {
        // Start transaction
        await pool.query('BEGIN');

        // Get all reports to delete their files (reports are linked via projects)
        // We do this BEFORE deleting the data
        const reportsResult = await pool.query(
            'SELECT r.file_path FROM reports r JOIN projects p ON r.project_id = p.id WHERE p.partner_id = $1',
            [id]
        );

        // Delete files from filesystem
        reportsResult.rows.forEach(report => {
            if (report.file_path && fs.existsSync(report.file_path)) {
                try {
                    fs.unlinkSync(report.file_path);
                    console.log(`Deleted file: ${report.file_path}`);
                } catch (e) {
                    console.error("Error deleting file:", e.message);
                }
            }
        });

        // Delete the partner. 
        // Thanks to ON DELETE CASCADE defined in schema (both SQLite and Postgres), 
        // this will automatically delete related projects, reports, events, and templates.
        const result = await pool.query('DELETE FROM partners WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: "Partenaire non trouvé" });
        }

        await pool.query('COMMIT');

        console.log(`Partner ${id} and all associated data deleted successfully`);
        res.json({
            message: "Partenaire et données associées supprimés avec succès",
            deleted: result.rows[0]
        });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Error deleting partner:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/projects/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (useMock) {
        const project = MOCK_PROJECTS.find(p => p.id === id);
        if (project) return res.json(project);
        return res.status(404).json({ error: "Projet non trouvé" });
    }
    try {
        const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Projet non trouvé" });

        let project = result.rows[0];
        if (project.evolution_data && typeof project.evolution_data === 'string') {
            try {
                project.evolution_data = JSON.parse(project.evolution_data);
            } catch (e) {
                console.error("Error parsing evolution_data", e);
            }
        }

        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/projects', async (req, res) => {
    console.log("POST /api/projects hit with:", req.body);
    const { partner_id, title, description } = req.body;
    if (useMock) {
        const newProject = {
            id: 100 + MOCK_PROJECTS.length + 1,
            partner_id: parseInt(partner_id),
            title,
            description,
            status: 'active',
            report_template_type: null,
            evolution_data: [{ "date": new Date().toISOString().split('T')[0].substring(0, 7), "prog": 0 }],
            created_at: new Date().toISOString()
        };
        MOCK_PROJECTS.push(newProject);
        return res.json(newProject);
    }
    try {
        const result = await pool.query(
            'INSERT INTO projects (partner_id, title, description, evolution_data) VALUES ($1, $2, $3, $4) RETURNING *',
            [partner_id, title, description, JSON.stringify([{ "date": new Date().toISOString().split('T')[0].substring(0, 7), "prog": 0 }])]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/projects/:id/template', async (req, res) => {
    const id = parseInt(req.params.id);
    const { type } = req.body; // 'narrative' or 'financial'
    console.log(`PUT /api/projects/${id}/template hit with type:`, type);

    if (useMock) {
        const project = MOCK_PROJECTS.find(p => p.id === id);
        if (project) {
            project.report_template_type = type;
            return res.json(project);
        }
        return res.status(404).json({ error: "Projet non trouvé" });
    }

    try {
        const result = await pool.query(
            'UPDATE projects SET report_template_type = $1 WHERE id = $2 RETURNING *',
            [type, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Projet non trouvé" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats/global', async (req, res) => {
    if (useMock) {
        // Mock data with expected vs actual
        return res.json([
            { date: 'JAN', expected: 20, actual: 20 },
            { date: 'FEV', expected: 40, actual: 35 },
            { date: 'MAR', expected: 60, actual: 50 },
            { date: 'AVR', expected: 80, actual: 65 },
            { date: 'MAI', expected: 90, actual: 80 },
            { date: 'JUN', expected: 100, actual: 95 },
        ]);
    }
    try {
        // 1. Determine timeline range
        // Start: Earliest project creation or default to 6 months ago
        const startResult = await pool.query('SELECT MIN(created_at) as min_date FROM projects');
        let startDate = new Date();
        if (startResult.rows[0].min_date) {
            startDate = new Date(startResult.rows[0].min_date);
        } else {
            startDate.setMonth(startDate.getMonth() - 6);
        }
        // Normalize to start of month
        startDate.setDate(1);

        // End: Latest deadline/submission or at least 3 months ahead
        const endResult = await pool.query('SELECT MAX(deadline) as max_deadline, MAX(submission_date) as max_sub FROM reports');
        let endDate = new Date();
        const maxDeadline = endResult.rows[0].max_deadline ? new Date(endResult.rows[0].max_deadline) : null;
        const maxSub = endResult.rows[0].max_sub ? new Date(endResult.rows[0].max_sub) : null;

        if (maxDeadline && maxDeadline > endDate) endDate = maxDeadline;
        if (maxSub && maxSub > endDate) endDate = maxSub;
        // Ensure at least some future visibility
        const futureBuffer = new Date();
        futureBuffer.setMonth(futureBuffer.getMonth() + 3);
        if (endDate < futureBuffer) endDate = futureBuffer;

        // 2. Fetch all Reports
        const reportsResult = await pool.query('SELECT deadline, submission_date FROM reports');
        const reports = reportsResult.rows;
        const totalReports = reports.length || 1;

        // 3. Generate Timeline & Calculate Stats
        const stats = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().slice(0, 7); // YYYY-MM

            // Comparison string for "End of Month" logic
            // We count everything up to this month inclusive

            const expectedCount = reports.filter(r => r.deadline && r.deadline.substring(0, 7) <= dateStr).length;
            const actualCount = reports.filter(r => r.submission_date && r.submission_date.substring(0, 7) <= dateStr).length;

            stats.push({
                date: currentDate.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
                rawDate: dateStr,
                expected: Math.round((expectedCount / totalReports) * 100),
                actual: Math.round((actualCount / totalReports) * 100)
            });

            // Next month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats/summary', async (req, res) => {
    if (useMock) {
        return res.json({
            partnersCount: MOCK_PARTNERS.length,
            projectsCount: MOCK_PROJECTS.length,
            reportsPending: MOCK_REPORTS.filter(r => r.status === 'en attente').length,
            alertsCount: 3
        });
    }
    try {
        const partners = await pool.query('SELECT COUNT(*) as count FROM partners');
        const projects = await pool.query('SELECT COUNT(*) as count FROM projects WHERE status = \'active\'');
        const reports = await pool.query('SELECT COUNT(*) as count FROM reports WHERE status = \'pending\'');

        // Alerts: reports with deadlines in the next 3 days
        const alerts = await pool.query(`
            SELECT COUNT(*) as count FROM reports 
            WHERE status = 'pending' 
            AND deadline IS NOT NULL 
            AND deadline <= date('now', '+3 days')
            AND deadline >= date('now')
        `);

        const validatedReports = await pool.query('SELECT COUNT(*) as count FROM reports WHERE submission_date IS NOT NULL');

        res.json({
            partnersCount: parseInt(partners.rows[0].count),
            projectsCount: parseInt(projects.rows[0].count),
            reportsPending: parseInt(reports.rows[0].count),
            alertsCount: parseInt(alerts.rows[0].count),
            reportsValidated: parseInt(validatedReports.rows[0].count)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/events', async (req, res) => {
    const { partner_id, title, description, event_date, type } = req.body;
    if (useMock) {
        const newEvent = {
            id: MOCK_EVENTS.length + 1,
            partner_id: parseInt(partner_id),
            title,
            description,
            event_date,
            type
        };
        MOCK_EVENTS.push(newEvent);
        return res.json(newEvent);
    }
    try {
        const result = await pool.query(
            'INSERT INTO events (partner_id, title, description, event_date, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [partner_id, title, description, event_date, type]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/events', async (req, res) => {
    let partnerId = req.query.partnerId ? parseInt(req.query.partnerId) : null;
    if (isNaN(partnerId)) partnerId = null;

    if (useMock) {
        // ... existing mock logic
        let events = MOCK_EVENTS;
        let reports = MOCK_REPORTS;
        if (partnerId) {
            events = MOCK_EVENTS.filter(e => e.partner_id === partnerId);
            reports = MOCK_REPORTS.filter(r => r.partner_id === partnerId);
        }

        const eventItems = events.map(e => ({
            ...e,
            partner_name: MOCK_PARTNERS.find(p => p.id === e.partner_id)?.name || 'Général'
        }));

        const deadlineItems = reports.map(r => ({
            id: `rep-${r.id}`,
            title: `Deadline: ${r.title}`,
            event_date: r.submission_date + 'T23:59:59',
            type: 'deadline',
            description: 'Date limite de soumission du rapport.',
            partner_name: MOCK_PARTNERS.find(p => p.id === r.partner_id)?.name
        }));

        const all = [...eventItems, ...deadlineItems].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
        return res.json(all);
    }

    try {
        // 1. Fetch standard events from DB
        let eventQuery = 'SELECT e.*, p.name as partner_name FROM events e LEFT JOIN partners p ON e.partner_id = p.id';
        const eventParams = [];
        if (partnerId) {
            eventQuery += ' WHERE e.partner_id = $1';
            eventParams.push(partnerId);
        }
        const eventRes = await pool.query(eventQuery, eventParams);

        // 2. Fetch report deadlines as events
        let reportQuery = 'SELECT r.id, r.title, r.deadline as event_date, p.name as partner_name, \'deadline\' as type FROM reports r JOIN projects pr ON r.project_id = pr.id JOIN partners p ON pr.partner_id = p.id';
        const reportParams = [];
        if (partnerId) {
            reportQuery += ' WHERE pr.partner_id = $1';
            reportParams.push(partnerId);
        }
        const reportRes = await pool.query(reportQuery, reportParams);

        // 3. GENERATE RECURRING MEETINGS BASE ON PARTNER FREQUENCY
        let partnerQuery = 'SELECT id, name, meeting_frequency, contract_start_date FROM partners';
        const pParams = [];
        if (partnerId) {
            partnerQuery += ' WHERE id = $1';
            pParams.push(partnerId);
        }
        const partnersRes = await pool.query(partnerQuery, pParams);

        const recurringEvents = [];
        const today = new Date();
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(today.getMonth() + 3);

        partnersRes.rows.forEach(p => {
            if (!p.meeting_frequency || p.meeting_frequency === 'aucune') return;

            let currentDate = p.contract_start_date ? new Date(p.contract_start_date) : new Date();
            // Reset to 10:00 AM for consistency
            currentDate.setHours(10, 0, 0, 0);

            // Skip dates in the far past, start from roughly now or contract start
            while (currentDate < today && currentDate < threeMonthsLater) {
                if (p.meeting_frequency === 'hebdomadaire') currentDate.setDate(currentDate.getDate() + 7);
                else if (p.meeting_frequency === 'mensuelle') currentDate.setMonth(currentDate.getMonth() + 1);
                else if (p.meeting_frequency === 'annuelle') currentDate.setFullYear(currentDate.getFullYear() + 1);
                else break;
            }

            // Generate next occurrences
            let count = 0;
            while (currentDate <= threeMonthsLater && count < 12) {
                recurringEvents.push({
                    id: `recur-${p.id}-${count}`,
                    partner_id: p.id,
                    partner_name: p.name,
                    title: `Réunion Régulière (${p.meeting_frequency})`,
                    event_date: currentDate.toISOString(),
                    type: 'meeting',
                    description: `Réunion automatique basée sur la fréquence ${p.meeting_frequency}.`
                });

                if (p.meeting_frequency === 'hebdomadaire') currentDate.setDate(currentDate.getDate() + 7);
                else if (p.meeting_frequency === 'mensuelle') currentDate.setMonth(currentDate.getMonth() + 1);
                else if (p.meeting_frequency === 'annuelle') currentDate.setFullYear(currentDate.getFullYear() + 1);
                else break;
                count++;
            }
        });

        const all = [...eventRes.rows, ...reportRes.rows, ...recurringEvents].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

        // Add alert flag if date is in the next 3 days
        const processed = all.map(ev => {
            const evDate = new Date(ev.event_date);
            const diffDays = (evDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
            return {
                ...ev,
                is_alert: diffDays >= -0.5 && diffDays <= 3 // Buffer for today's events
            };
        });

        res.json(processed);
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/reports', upload.single('report_file'), async (req, res) => {
    const { project_id, partner_id, title, deadline, status } = req.body;
    const submissionDate = new Date().toISOString().split('T')[0];
    const filePath = req.file ? req.file.path : null;

    if (useMock) {
        const newReport = {
            id: MOCK_REPORTS.length + 1000,
            project_id: parseInt(project_id || 0),
            partner_id: parseInt(partner_id || 0) || (MOCK_PROJECTS.find(p => p.id === parseInt(project_id))?.partner_id),
            title,
            deadline: deadline || submissionDate,
            submission_date: submissionDate,
            status: status || 'en attente',
            file_path: filePath,
            created_at: new Date().toISOString()
        };
        MOCK_REPORTS.push(newReport);
        console.log("Mock Report added with file:", newReport.title, filePath);
        return res.json(newReport);
    }
    try {
        const result = await pool.query(
            'INSERT INTO reports (project_id, title, deadline, submission_date, status, file_path) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [project_id, title, deadline || submissionDate, submissionDate, status || 'en attente', filePath]
        );
        res.json(result.rows[0]);
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
            JOIN projects prj ON r.project_id = prj.id 
            JOIN partners p ON prj.partner_id = p.id
            ORDER BY r.submission_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/reports/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    if (useMock) {
        const index = MOCK_REPORTS.findIndex(r => r.id === id);
        if (index === -1) {
            return res.status(404).json({ error: "Rapport non trouvé" });
        }

        const deleted = MOCK_REPORTS.splice(index, 1)[0];
        console.log(`Mock Report deleted: ${deleted.title}`);

        // Delete associated file if exists
        if (deleted.file_path && fs.existsSync(deleted.file_path)) {
            try {
                fs.unlinkSync(deleted.file_path);
                console.log(`Deleted file: ${deleted.file_path}`);
            } catch (e) {
                console.error("Error deleting file:", e.message);
            }
        }

        return res.json({ message: "Rapport supprimé avec succès", deleted });
    }

    try {
        // Get report info before deletion to delete file
        const reportResult = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
        if (reportResult.rows.length === 0) {
            return res.status(404).json({ error: "Rapport non trouvé" });
        }

        const report = reportResult.rows[0];

        // Delete from database
        await pool.query('DELETE FROM reports WHERE id = $1', [id]);

        // Delete associated file if exists
        if (report.file_path && fs.existsSync(report.file_path)) {
            try {
                fs.unlinkSync(report.file_path);
                console.log(`Deleted file: ${report.file_path}`);
            } catch (e) {
                console.error("Error deleting file:", e.message);
            }
        }

        res.json({ message: "Rapport supprimé avec succès", deleted: report });
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
        const parsed = result.rows.map(p => {
            if (p.evolution_data && typeof p.evolution_data === 'string') {
                try { p.evolution_data = JSON.parse(p.evolution_data); } catch (e) { }
            }
            return p;
        });
        res.json(parsed);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/templates', async (req, res) => {
    if (useMock) return res.json(MOCK_TEMPLATES);
    try {
        const result = await pool.query('SELECT t.*, p.name as partner_name FROM report_templates t JOIN partners p ON t.partner_id = p.id ORDER BY t.created_at DESC');
        const parsed = result.rows.map(t => {
            if (t.structure && typeof t.structure === 'string') {
                try { t.structure = JSON.parse(t.structure); } catch (e) { }
            }
            return t;
        });
        res.json(parsed);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/templates', async (req, res) => {
    console.log("POST /api/templates hit with:", req.body);
    const { partner_id, title, instructions, structure, requires_video, requires_audio, requires_text, text_formats } = req.body;

    if (useMock) {
        const newTemplate = {
            id: MOCK_TEMPLATES.length + 1,
            partner_id,
            title,
            instructions,
            structure,
            requires_video: requires_video || false,
            requires_audio: requires_audio || false,
            requires_text: requires_text || true,
            text_formats: text_formats || "PDF, Word",
            created_at: new Date().toISOString()
        };
        MOCK_TEMPLATES.unshift(newTemplate);
        return res.json(newTemplate);
    }

    try {
        const result = await pool.query(
            `INSERT INTO report_templates 
            (partner_id, title, instructions, structure, requires_video, requires_audio, requires_text, text_formats) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [partner_id, title, instructions, JSON.stringify(structure), requires_video, requires_audio, requires_text, text_formats]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error saving template:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ai/summarize', uploadMemory.single('report'), async (req, res) => {
    console.log("Summarize request received");
    try {
        if (!req.file) {
            console.log("No file received");
            return res.status(400).json({ error: "Fichier requis" });
        }
        console.log("File received:", req.file.originalname, "Size:", req.file.size, "Mime:", req.file.mimetype);

        let text = "";
        const buffer = req.file.buffer;

        if (req.file.mimetype === 'application/pdf') {
            const result = await pdfParse(buffer);
            text = result.text;
        } else if (req.file.mimetype.includes('word')) {
            const data = await mammoth.extractRawText({ buffer });
            text = data.value;
        } else {
            text = buffer.toString('utf8');
        }

        const isFinancial = req.file.originalname.toLowerCase().includes('financier') ||
            req.file.originalname.toLowerCase().includes('budget') ||
            req.file.originalname.toLowerCase().includes('finance');

        const type = isFinancial ? 'financial' : 'narrative';
        console.log(`Analyzing file as ${type}: ${req.file.originalname}`);

        const summary = await aiService.summarizeReport(text, type);
        res.json(summary);
    } catch (err) {
        console.error("Route Error:", err);
        res.status(500).json({ error: "Erreur lors de l'analyse du rapport : " + err.message });
    }
});

app.post('/api/reports/:id/analyze', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`POST /api/reports/${id}/analyze hit`);

    let report = null;
    let textContent = "";

    try {
        if (useMock) {
            report = MOCK_REPORTS.find(r => r.id === id);
            if (!report) return res.status(404).json({ error: "Rapport non trouvé" });
        } else {
            const result = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
            if (result.rows.length === 0) return res.status(404).json({ error: "Rapport non trouvé" });
            report = result.rows[0];
        }

        const isFinancial = report.title.toLowerCase().includes('financier') || report.title.toLowerCase().includes('budget');
        const type = isFinancial ? 'financial' : 'narrative';

        if (report.file_path && fs.existsSync(report.file_path)) {
            const buffer = fs.readFileSync(report.file_path);
            const ext = path.extname(report.file_path).toLowerCase();

            if (ext === '.pdf') {
                const data = await pdfParse(buffer);
                textContent = data.text;
            } else if (ext === '.docx' || ext === '.doc') {
                const data = await mammoth.extractRawText({ buffer });
                textContent = data.value;
            } else {
                textContent = buffer.toString('utf8');
            }
            console.log(`[ANALYSIS] Text extracted from ${report.file_path}. Length: ${textContent.length}`);
            console.log(`[ANALYSIS] Text preview: ${textContent.substring(0, 200)}...`);
        } else {
            console.warn(`[ANALYSIS] No real file found at ${report.file_path}, using placeholder`);
            textContent = `Contenu simulé pour l'analyse du rapport "${report.title}". 
            ${isFinancial ? "Ceci est un rapport financier détaillant les dépenses de la période. Budget alloué : 150000 EUR. Dépenses effectuées: 125000 EUR." : "Ceci est un rapport narratif détaillant les progrès sur le terrain, les réunions avec les parties prenantes et les formations réalisées."}`;
        }

        const analysis = await aiService.summarizeReport(textContent, type);
        res.json({ ...analysis, type });

    } catch (err) {
        console.error("Error analyzing report:", err);
        res.status(500).json({ error: err.message });
    }
});



const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initDb();
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});
