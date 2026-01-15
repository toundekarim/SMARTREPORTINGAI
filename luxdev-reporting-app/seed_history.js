const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server/database.sqlite');
const db = new sqlite3.Database(dbPath);

const reports = [
    { project_id: 1, title: 'Rapport Janvier 2025', deadline: '2025-01-31', submission_date: '2025-01-28' },
    { project_id: 1, title: 'Rapport Mars 2025', deadline: '2025-03-31', submission_date: '2025-04-02' }, // Late
    { project_id: 2, title: 'Bilan Technique Q1', deadline: '2025-04-15', submission_date: '2025-04-10' },
    { project_id: 1, title: 'Rapport Juin 2025', deadline: '2025-06-30', submission_date: '2025-06-30' },
    { project_id: 2, title: 'Audit Sécurité', deadline: '2025-09-15', submission_date: '2025-09-20' },
    { project_id: 1, title: 'Rapport Annuel 2025', deadline: '2025-12-15', submission_date: '2025-12-10' }
];

db.serialize(() => {
    const stmt = db.prepare("INSERT INTO reports (project_id, title, deadline, submission_date, status) VALUES (?, ?, ?, ?, 'validé')");
    reports.forEach(r => {
        stmt.run(r.project_id, r.title, r.deadline, r.submission_date);
    });
    stmt.finalize();
    console.log("Historical reports inserted.");
});

db.close();
