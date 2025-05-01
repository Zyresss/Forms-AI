const { GoogleGenAI } = require('@google/genai');

require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const aiPrompt = process.env.AI_PROMPT;

async function generateGeminiContent() {
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: aiPrompt
        });
        console.log(result.text);
        return result.text;
    }
    catch (error) {
        console.error('Gemini API error: ', error);
    }
}

module.exports = { generateGeminiContent };