import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: 'AIzaSyBpHR3RGw4ANYtOjerJYrHX6kPPmKO8zVE' });

const aiPrompt = `I have a university project where i have to make a form to incribe new students into the university,
                    but heres the catch, the form has to be made with ai, so here is what you have to do for me
                    make me a json object so i would make the form dynamically using javascript where it hase this layout:
                    1) the json object has to be an array.
                    2) each element of the array has to be an object.
                    3) an object has tw elemenst where:
                        a) the first one has to be "section": "section title" (section title hase to be like Personal Information, Contact Information, ect).
                        b) the second object has to be "fields": {} where in this nsedted object we have the differente fields the students has to fill, it has to be written in this format:
                        "Input Label": "Input type" for example "Last Name": "text",
                        if the input type would be radio for example gender then make the input type an array, like this: "Gender": ["Male", "Female"]
                    when you make this json object i would use Json.stringify() so dont include any other text just the json object, then i would make the form dynamically using javascript.
                        `;

async function googleAPITest() {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: aiPrompt
    });
    console.log('Response text: ', response.text);

    const formFields = JSON.stringify(response.text);
    console.log('Response form: ', formFields);
}

googleAPITest();