// const fetch = require('node-fetch');

// exports.getMedicineInfo = async (req, res) => {
//     const { medicineName } = req.params;
//     if (!medicineName) return res.status(400).json({ msg: 'Medicine name is required' });

//     const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${medicineName}"&limit=1`;

//     try {
//         const apiRes = await fetch(url);
//         const data = await apiRes.json();

//         if (data.error || !data.results || data.results.length === 0) {
//             return res.status(404).json({ msg: `No information found for '${medicineName}'. Please check the spelling.` });
//         }

//         const result = data.results[0];
//         let foodInteraction = 'Information not available. Always consult a healthcare professional.';
        
//         const textToSearch = (result.dosage_and_administration || []).join(' ') + (result.spl_patient_package_insert || []).join(' ');

//         if (textToSearch.toLowerCase().includes('with food') || textToSearch.toLowerCase().includes('after a meal')) {
//             foodInteraction = 'Should be taken with or after food.';
//         } else if (textToSearch.toLowerCase().includes('empty stomach') || textToSearch.toLowerCase().includes('before a meal')) {
//             foodInteraction = 'Should be taken on an empty stomach, before a meal.';
//         }

//         const responseData = {
//             brand_name: result.openfda?.brand_name?.[0] || 'N/A',
//             generic_name: result.openfda?.generic_name?.[0] || 'N/A',
//             manufacturer_name: result.openfda?.manufacturer_name?.[0] || 'N/A',
//             food_interaction: foodInteraction
//         };
        
//         res.json(responseData);

//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// };
const fetch = require('node-fetch');
require('dotenv').config();
const Medicine = require('../models/Medicine');

exports.getMedicineInfo = async (req, res) => {
    const { medicineName } = req.params;
    if (!medicineName) {
        return res.status(400).json({ msg: 'Medicine name is required' });
    }

    // Common aliases to improve matching (brand/regional names → canonical generic)
    const aliasToGeneric = {
        'paracetamol': 'Acetaminophen',
        'tylenol': 'Acetaminophen',
        'advil': 'Ibuprofen',
        'motrin': 'Ibuprofen',
        'asa': 'Acetylsalicylic acid',
        'panadol': 'Acetaminophen'
    };

    const normalized = medicineName.trim().toLowerCase();
    const canonical = aliasToGeneric[normalized] || medicineName;

    // We will now ask our own Gemini API for information
    const API_KEY = process.env.GEMINI_API_KEY;
    const MODEL = "gemini-1.5-flash";
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    // First try database: find by genericName or brandName (case-insensitive contains)
    try {
        const dbDoc = await Medicine.findOne({
            $or: [
                { genericName: new RegExp(`^${canonical}$`, 'i') },
                { brandName: new RegExp(`^${canonical}$`, 'i') }
            ]
        }).lean();

        if (dbDoc) {
            return res.json({
                brand_name: dbDoc.brandName || undefined,
                generic_name: dbDoc.genericName || undefined,
                manufacturer_name: undefined,
                food_interaction: dbDoc.foodInteraction || undefined
            });
        }
    } catch (e) {
        console.error('DB lookup failed:', e.message);
        // continue to Gemini fallback
    }

    // Prompt: request STRICT JSON only with the required fields
    const prompt = `
Return ONLY a JSON object (no markdown, no backticks, no extra text) with these exact keys about the medicine "${medicineName}":
{
  "brand_name": string | null,
  "generic_name": string | null,
  "manufacturer_name": string | null,
  "food_interaction": string | null
}

Rules:
- If you are unsure or the information is not available, set the value to null.
- Keep values concise and layperson-friendly.
- For "food_interaction", summarize typical guidance (e.g., with food, empty stomach) when known; otherwise null.
- Do not include any other keys or text.
`;

    try {
        const apiRes = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await apiRes.json();

        if (!apiRes.ok || !data.candidates) {
            console.error("Gemini API Error:", data);
            return res.status(500).json({ msg: 'Failed to get information from the AI model.' });
        }

        const aiText = data.candidates[0]?.content?.parts[0]?.text || '';

        // Try to parse strict JSON response
        let parsed;
        try {
            parsed = JSON.parse(aiText);
        } catch (e) {
            // Sometimes models wrap JSON in code fences or add text. Try to extract JSON substring.
            const match = aiText.match(/\{[\s\S]*\}/);
            if (match) {
                try {
                    parsed = JSON.parse(match[0]);
                } catch (_) {
                    parsed = null;
                }
            }
        }

        // Normalize to expected shape; undefined to surface "undefined" in UI
        const responseData = {
            brand_name: parsed?.brand_name ?? undefined,
            generic_name: parsed?.generic_name ?? undefined,
            manufacturer_name: parsed?.manufacturer_name ?? undefined,
            food_interaction: parsed?.food_interaction ?? undefined
        };

        return res.json(responseData);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};