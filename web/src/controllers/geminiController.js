const { generateGeminiContent } = require('../services/googleGeminiService');

async function getGeminiResponse(request, response) {
    try {
        const result = await generateGeminiContent();
        response.status(200).json({ result: result });
    }
    catch (error) {
        console.error('Gemini API error: ', error);
        response.status(500).json({ error: 'Failed to fetch Gemini response' });
    }
}

module.exports = { getGeminiResponse };