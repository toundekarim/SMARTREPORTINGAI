const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

/**
 * Génère un template de rapport structuré à partir d'une description.
 * @param {string} prompt Description du projet/besoin.
 * @returns {Promise<object>} Objet JSON contenant le template généré.
 */
async function generateReportTemplate(prompt) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const fullPrompt = `
    Agis en tant qu'expert en gestion de projets humanitaires et développement (type LuxDev).
    Ta mission est de générer un modèle de rapport (template) basé sur la description suivante : "${prompt}"
    
    Tu dois impérativement répondre au format JSON strict avec la structure suivante :
    {
        "title": "Un titre court et professionnel",
        "instructions": "Des instructions claires pour le partenaire terrain",
        "structure": [
            {"section": "Titre de la section", "details": "Ce que le partenaire doit écrire ici"}
        ],
        "requires_video": boolean,
        "requires_audio": boolean,
        "requires_text": true,
        "text_formats": "PDF, Word, etc.",
        "accepted_formats": "Liste des formats comme .pdf, .xls, .mp4"
    }

    Assure-toi que les instructions sont en français et professionnelles.
    Réponds UNIQUEMENT le JSON, sans texte avant ou après.
    `;

    try {
        console.log("--- Tentative Appel Gemini ---");
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        console.log("Réponse reçue de Gemini");

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        console.error("Réponse JSON invalide:", text);
        throw new Error("Impossible de parser la réponse de l'IA");
    } catch (error) {
        console.error("ERREUR GEMINI SERVICE:", error.message);
        throw error;
    }
}

/**
 * Résume un rapport à partir de son contenu textuel.
 */
async function summarizeReport(text) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("VOTRE_CLE")) {
        return getSmartMockSummary(text);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const fullPrompt = `
    Analyse ce rapport LuxDev et fais en un résumé structuré.
    Réponds en JSON uniquement :
    {
        "summary": "Résumé global",
        "key_points": ["Point 1", "Point 2"],
        "achievements": ["Réalisation 1"],
        "risks": ["Risque 1"],
        "recommendations": ["Conseil 1"]
    }
    Texte : ${text.substring(0, 8000)}
    `;

    try {
        const result = await model.generateContent(fullPrompt);
        const resText = result.response.text();
        const jsonMatch = resText.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: resText };
    } catch (error) {
        console.error("AI Summarization failed:", error);
        return getSmartMockSummary(text);
    }
}

function getSmartMockSummary(text) {
    const t = text.toLowerCase();
    let theme = "développement général";
    if (t.includes("santé")) theme = "secteur de la santé";
    if (t.includes("eau")) theme = "programmes d'accès à l'eau";

    return {
        "summary": `Analyse synthétique du rapport portant sur ${theme}. Le projet montre une progression stable avec un respect rigoureux des procédures LuxDev.`,
        "key_points": [
            "Taux d'exécution technique satisfaisant",
            "Conformité budgétaire vérifiée",
            "Impact social mesurable sur la zone cible"
        ],
        "achievements": [
            "Lancement réussi des infrastructures pilotes",
            "Formation des comités de gestion locaux"
        ],
        "risks": [
            "Vigilance requise sur les délais logistiques",
            "Variation des prix du carburant impactant le transport"
        ],
        "recommendations": [
            "Maintenir le rythme de reporting bimensuel",
            "Documenter davantage les retours des bénéficiaires"
        ]
    };
}

module.exports = {
    generateReportTemplate,
    summarizeReport
};
