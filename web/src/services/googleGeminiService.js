import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptPath = path.join(__dirname, 'prompt.txt');
const promptTemplate = fs.readFileSync(promptPath, 'utf8');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export default async function generateGeminiContent(prompt) {
    const fullUserPrompt = promptTemplate + "\n\nHere is the user prompt: " + prompt;
    console.log('Full user prompt: ', fullUserPrompt);
    
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: fullUserPrompt
        });
        console.log(result.text);
        return result.text;
    }
    catch (error) {
        console.error('Gemini API error: ', error);
    }
}