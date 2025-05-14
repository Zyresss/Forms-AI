import generateGeminiContent from '../services/googleGeminiService.js';

export default async function getGeminiResponse(request, response) {
    try {
        const { prompt } = request.body;
        if (!prompt) {
            return response.status(400).json({ error: 'Prompt is required' });
        }

        const result = await generateGeminiContent(prompt);
        console.log('Received response from Gemini');
        return response.status(200).json({ result: result });
    }
    catch (error) {
        console.error('Gemini API error: ', error);
        return response.status(500).json({ error: 'Failed to fetch Gemini response' });
    }
}