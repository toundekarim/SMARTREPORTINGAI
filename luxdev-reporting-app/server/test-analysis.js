const aiService = require('./services/aiService');

const sampleText = `
RAPPORT DE PROJET - SECTEUR SANTÉ
Date: Janvier 2026

RÉSUMÉ EXÉCUTIF:
Le projet a réalisé des progrès significatifs au cours du trimestre. 
Nous avons accompli la formation de 45 agents de santé communautaire.
La construction du centre de santé de Kigali est terminée avec succès.

RÉALISATIONS:
- Formation de 45 agents de santé
- Construction du centre médical achevée
- Distribution de 1200 kits médicaux
- Installation de 3 systèmes solaires

DÉFIS ET RISQUES:
- Retard dans la livraison des équipements médicaux (2 semaines)
- Difficulté d'accès pendant la saison des pluies
- Manque de personnel qualifié dans certaines zones

BUDGET:
Budget alloué: 150000 EUR
Dépenses effectuées: 125000 EUR (83%)
Solde disponible: 25000 EUR
`;

async function test() {
    console.log("🧪 Test de l'analyse IA avec fallback intelligent...\n");

    const result = await aiService.summarizeReport(sampleText, 'narrative');

    console.log("\n📊 RÉSULTAT DE L'ANALYSE:\n");
    console.log("Summary:", result.summary);
    console.log("\nAchievements:", result.achievements);
    console.log("\nRisks:", result.risks);
    console.log("\nRecommendations:", result.recommendations);
}

test();
