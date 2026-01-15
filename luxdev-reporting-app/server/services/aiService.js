const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

/**
 * Génère un template de rapport structuré à partir d'une description.
 * @param {string} prompt Description du projet/besoin.
 * @returns {Promise<object>} Objet JSON contenant le template généré.
 */
async function generateReportTemplate(prompt) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
async function summarizeReport(text, reportType = 'narrative') {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("VOTRE_CLE")) {
        return getSmartMockSummary(text, reportType);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Try multiple models in order of preference
    const modelsToTry = ['gemini-pro', 'gemini-1.5-flash-latest', 'gemini-1.5-pro'];
    let model = null;

    for (const modelName of modelsToTry) {
        try {
            model = genAI.getGenerativeModel({ model: modelName });
            // Test if model is accessible
            await model.generateContent("test");
            console.log(`[AI] Using model: ${modelName}`);
            break;
        } catch (e) {
            console.log(`[AI] Model ${modelName} not available, trying next...`);
            model = null;
        }
    }

    if (!model) {
        console.warn("[AI] No Gemini model available, using local analysis");
        return analyzeTextLocally(text, reportType);
    }

    let specificInstruction = "";
    if (reportType === 'financial') {
        specificInstruction = `
        C'est un rapport FINANCIER de projet de développement.
        
        INSTRUCTIONS STRICTES :
        1. Cherche les montants, budgets, dépenses mentionnés dans le texte
        2. Identifie les lignes budgétaires et leur exécution
        3. Repère les écarts ou anomalies mentionnés
        4. Extrais UNIQUEMENT les chiffres présents dans le document
        
        Structure ta réponse en JSON STRICT :
        {
            "summary": "Résumé de l'exécution budgétaire basé sur les chiffres du rapport",
            "budget_total_used": "Montant total utilisé ou pourcentage trouvé dans le texte (ou 'Non spécifié' si absent)",
            "key_figures": ["Chiffre clé 1 avec montant exact", "Chiffre clé 2", "Maximum 5 points"],
            "anomalies": ["Anomalie ou écart mentionné dans le rapport", "Ou liste vide [] si aucune"],
            "recommendations": ["Conseil financier basé sur les données du rapport", "Maximum 3 points"]
        }
        
        IMPORTANT : N'invente AUCUN chiffre. Si un montant n'est pas dans le texte, indique "Non spécifié".
        `;
    } else {
        specificInstruction = `
        C'est un rapport NARRATIF de projet de développement.
        
        INSTRUCTIONS STRICTES :
        1. Lis ATTENTIVEMENT tout le texte fourni
        2. Identifie les sections principales du rapport (contexte, activités, résultats, défis, etc.)
        3. Extrais UNIQUEMENT les informations présentes dans le texte
        4. Si une information n'est pas dans le texte, ne l'invente PAS
        
        Structure ta réponse en JSON STRICT :
        {
            "summary": "Résumé détaillé en 3-5 phrases des activités et résultats principaux mentionnés dans le rapport",
            "achievements": ["Liste des réalisations concrètes mentionnées", "Maximum 5 points"],
            "risks": ["Liste des défis, problèmes ou risques explicitement mentionnés", "Maximum 5 points"],
            "recommendations": ["Suggestions basées sur les besoins identifiés dans le rapport", "Maximum 3 points"]
        }
        
        IMPORTANT : Base-toi UNIQUEMENT sur le contenu du texte ci-dessous.
        `;
    }

    console.log(`[summarizeReport] Starting analysis for ${reportType}. Text length: ${text.length}`);

    if (text.length < 50) {
        console.warn("[summarizeReport] Text too short for meaningful analysis.");
        return {
            summary: "Le document semble vide ou illisible (scan sans texte). L'IA ne peut pas extraire d'informations précises.",
            risks: ["Document peut-être non-OCRisé"],
            recommendations: ["Veuillez soumettre un fichier contenant du texte sélectionnable."]
        };
    }

    const fullPrompt = `
    Tu es un analyste expert pour LuxDev (Agence Luxembourgeoise pour la Coopération au Développement).
    
    CONTEXTE : LuxDev finance des projets de développement dans divers secteurs (santé, éducation, eau, agriculture, etc.).
    Les partenaires terrain soumettent des rapports périodiques que tu dois analyser.
    
    TA MISSION : Analyser le rapport ci-dessous de manière STRICTEMENT FIDÈLE au contenu.
    
    RÈGLES ABSOLUES :
    - NE génère AUCUNE information qui n'est pas explicitement dans le texte
    - Si une information manque, indique "Non spécifié" ou laisse le champ vide
    - Cite des éléments concrets du rapport (chiffres, dates, lieux, activités)
    - Si le texte est incompréhensible ou vide, indique-le clairement
    
    ${specificInstruction}
    
    ═══════════════════════════════════════════════════════════
    CONTENU DU RAPPORT À ANALYSER (${text.length} caractères) :
    ═══════════════════════════════════════════════════════════
    
    ${text.substring(0, 25000)}
    
    ═══════════════════════════════════════════════════════════
    
    Réponds UNIQUEMENT avec le JSON demandé, sans texte avant ou après.
    `;

    try {
        console.log(`[AI] Sending ${text.length} chars to Gemini for ${reportType} analysis...`);
        const result = await model.generateContent(fullPrompt);
        const resText = result.response.text();
        console.log(`[AI] Received response (${resText.length} chars)`);

        const jsonMatch = resText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log(`[AI] Successfully parsed JSON response`);
            return parsed;
        } else {
            console.warn(`[AI] No JSON found in response. Raw text: ${resText.substring(0, 500)}`);
            return {
                summary: resText.substring(0, 500),
                achievements: [],
                risks: ["Format de réponse inattendu de l'IA"],
                recommendations: ["Réessayer l'analyse"]
            };
        }
    } catch (error) {
        console.error("[AI] Gemini API failed:", error.message);
        console.log("[AI] Switching to local intelligent analysis...");

        // Fallback: Intelligent local analysis
        return analyzeTextLocally(text, reportType);
    }
}

/**
 * Analyse locale intelligente quand l'API Gemini n'est pas disponible
 */
function analyzeTextLocally(text, reportType) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const words = text.toLowerCase().split(/\s+/);

    // Mots-clés pour identifier les sections
    const achievementKeywords = ['réalisé', 'accompli', 'succès', 'atteint', 'formation', 'construit', 'installé', 'livré', 'completed', 'achieved'];
    const riskKeywords = ['risque', 'problème', 'défi', 'retard', 'difficulté', 'obstacle', 'manque', 'insuffisant', 'risk', 'challenge', 'delay'];
    const financialKeywords = ['budget', 'eur', 'euro', 'dépense', 'coût', 'montant', 'financement'];

    // Extraction des réalisations
    const achievements = sentences
        .filter(s => achievementKeywords.some(kw => s.toLowerCase().includes(kw)))
        .slice(0, 5)
        .map(s => s.trim().substring(0, 150));

    // Extraction des risques
    const risks = sentences
        .filter(s => riskKeywords.some(kw => s.toLowerCase().includes(kw)))
        .slice(0, 5)
        .map(s => s.trim().substring(0, 150));

    // Génération du résumé
    const summary = sentences.slice(0, 5).join('. ').substring(0, 500) + '...';

    if (reportType === 'financial') {
        // Extraction des montants
        const amounts = text.match(/\d+[,.]?\d*\s*(EUR|€|euro)/gi) || [];
        const keyFigures = amounts.slice(0, 5).map(a => `Montant identifié: ${a}`);

        return {
            summary: `Analyse locale du rapport financier. ${summary}`,
            budget_total_used: amounts.length > 0 ? amounts[0] : "Non spécifié dans le texte",
            key_figures: keyFigures.length > 0 ? keyFigures : ["Aucun montant explicite détecté"],
            anomalies: risks.length > 0 ? risks : [],
            recommendations: ["Vérifier les montants avec le partenaire", "Demander des clarifications si nécessaire"]
        };
    } else {
        return {
            summary: `Analyse locale du rapport narratif. ${summary}`,
            achievements: achievements.length > 0 ? achievements : ["Informations à extraire manuellement du document"],
            risks: risks.length > 0 ? risks : ["Aucun risque explicite détecté dans le texte"],
            recommendations: [
                "Contacter le partenaire pour plus de détails",
                "Vérifier la cohérence avec les rapports précédents"
            ]
        };
    }
}

function getSmartMockSummary(text, reportType) {
    const t = text.toLowerCase();

    if (reportType === 'financial' || t.includes('budget') || t.includes('eur') || t.includes('dépense')) {
        return {
            "summary": "Analyse financière simulée : Le taux d'absorption budgétaire est conforme aux prévisions trimestrielles.",
            "budget_total_used": "125,000 EUR (78%)",
            "key_figures": [
                "Dépenses RH : 45,000 EUR",
                "Matériel : 60,000 EUR",
                "Frais de mission : 20,000 EUR"
            ],
            "anomalies": [],
            "recommendations": [
                "Préparer le réalignement budgétaire pour le Q4",
                "Justifier les écarts sur la ligne 'Transport'"
            ]
        };
    }

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
