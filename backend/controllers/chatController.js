const fetch = require('node-fetch');
require('dotenv').config();

exports.chat = async (req, res) => {
    const { history } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    const MODEL = "gemini-1.5-flash";

    if (!API_KEY) {
        return res.status(500).json({ error: "API Key not configured on the server." });
    }

    // Extract latest user message text for quick, lightweight scope check
    let latestUserText = "";
    try {
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i]?.role === 'user') {
                latestUserText = history[i]?.parts?.[0]?.text || '';
                break;
            }
        }
    } catch (_) {}

    const medicalRegex = /(medicine|drug|pill|tablet|capsule|syrup|prescription|side\s*effect|dose|dosage|contraindication|interaction|hospital|clinic|pharmacy|doctor|physician|nurse|appointment|ER|emergency|symptom|diagnosis|treatment|therapy|vaccine|immuni[sz]ation|infection|antibiotic|antiviral|analgesic|fever|cough|cold|allergy|asthma|diabetes|hypertension|bp|blood\s*pressure|heart|cardio|first\s*aid|wound|burn|cut|sprain|fracture|injury|mental\s*health|anxiety|depression|stress|nutrition|diet|health|wellness)/i;

    if (!medicalRegex.test(latestUserText)) {
        return res.json({
            candidates: [
                {
                    content: {
                        parts: [
                            { text: "I can help with medical-related questions only (medicines, hospitals, symptoms, first aid, health, etc.). Please ask a healthcare-related question." }
                        ]
                    }
                }
            ]
        });
    }

    // Strong instruction to constrain model responses to medical topics only
    const systemInstruction = {
        role: "user",
        parts: [{
            text: (
`You are MediGuide, a helpful medical information assistant.
SCOPE: Answer ONLY healthcare-related questions: medicines, side effects, interactions, hospitals/clinics/pharmacies, symptoms, first aid, wellness, and general health.
OUT OF SCOPE: If asked about anything non-medical, politely refuse and ask for a medical-related question.
SAFETY RULES:
- Include a brief disclaimer when advice might influence health decisions.
- Do NOT provide specific personalized dosages. Offer general safety and timing guidance only.
- For emergencies or red-flag symptoms, advise contacting local emergency services.
Keep answers concise, clear, and non-technical.`)
        }]
    };

    try {
        const contents = [systemInstruction, ...(Array.isArray(history) ? history : [])];
        const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents })
        });

        if (!apiRes.ok) {
            const errorData = await apiRes.json();
            console.error("Gemini API Error:", errorData);
            return res.status(apiRes.status).json({ error: "Failed to get response from AI model.", details: errorData });
        }

        const data = await apiRes.json();
        res.json(data);

    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ error: "An error occurred while communicating with the AI model." });
    }
};