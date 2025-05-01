document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/gemini');

        if (!response.ok) {
            throw new Error('Failed to fetch Gemini response');
        }

        const rawText = await response.text();
        console.log('Raw response text: ', rawText);

        // parse outer json
        const parsedOuter = JSON.parse(rawText);

        const cleanedResponseText = parsedOuter.result
                .replace(/^\s*```json\s*/i, '')
                .replace(/\s*```$/, '')
                .trim();
                
        const parsedJSON = JSON.parse(cleanedResponseText);

        localStorage.setItem('userForm', JSON.stringify(parsedJSON));

        window.location.href = 'form.html';
    }
    catch (error) {
        console.error('Error getting Gemini data: ', error);
    }
});