const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // There isn't a direct listModels in the client SDK like this usually, 
        // but it might be in the rest api.
        // Let's just try to call gemini-1.5-flash with a tiny prompt.
        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
        const result = await model.generateContent("Bonjour, réponds juste 'OK' si tu me reçois.");
        console.log("✅ Gemini API fonctionne ! Réponse:", result.response.text());
    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) {
            console.error("Status:", e.status);
        }
    }
}

listModels();
