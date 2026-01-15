
const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch in Node 18+

async function run() {
    const baseUrl = 'http://localhost:3000/api';

    try {
        // 1. Get initial count
        const initialRes = await fetch(`${baseUrl}/stats/summary`);
        const initialData = await initialRes.json();
        console.log(`Compteur initial : ${initialData.reportsValidated}`);

        // 2. Create a dummy validated report
        // We need a project ID first. Let's get the first one.
        const projectsRes = await fetch(`${baseUrl}/partners/1`); // Assuming partner 1 exists
        // Actually easier to just pick project 1 if it exists, or create one.
        // Let's assume project 1 exists for simplicity of the test
        const projectId = 1;

        console.log("Simulation d'une soumission de rapport...");
        await fetch(`${baseUrl}/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: projectId,
                title: "Rapport de Test Validation " + Date.now(),
                submission_date: new Date().toISOString(), // This makes it 'validated'
                status: 'validé',
                deadline: new Date().toISOString()
            })
        });

        // 3. Get new count
        const finalRes = await fetch(`${baseUrl}/stats/summary`);
        const finalData = await finalRes.json();
        console.log(`Compteur final   : ${finalData.reportsValidated}`);

        if (finalData.reportsValidated > initialData.reportsValidated) {
            console.log("SUCCÈS : Le compteur a bien augmenté !");
        } else {
            console.log("ÉCHEC : Le compteur n'a pas bougé.");
        }

    } catch (e) {
        console.error("Erreur:", e.message);
    }
}

run();
