import { buildUserForm, getResponseFromGemini, formKey } from './functions/userForm.js';

const loadingPage = document.getElementById('loading-page');
const noResponsePage = document.getElementById('no-response-page');
const formPage = document.getElementById('form-page');
const form = document.getElementById('user-form');
const submitButton = document.getElementById('submit-btn');

const userPrompt = '"' + window.localStorage.getItem('userPrompt') + '"';
console.log('userPrompt: ', userPrompt);

document.addEventListener('DOMContentLoaded', async () => {
    const data = localStorage.getItem(formKey);
    let userFormData;

    // No response from Gemini has been saved
    if (data === null) {
        const responseText = await getResponseFromGemini(userPrompt);
        console.log('Response received form Gemini: ', responseText);
        userFormData = JSON.parse(responseText);
        window.localStorage.setItem(formKey, responseText);
        window.localStorage.removeItem('userPrompt');

        // We didn't get any respose from Gemini (for one reason or another)
        if (!userFormData || !Array.isArray(userFormData) || userFormData.length === 0) {
            loadingPage.classList.add('invisible');
            noResponsePage.classList.remove('invisible');
            return;
        }
    }
    // A response has been saved (means the user refreshed the form page)
    else {
        console.log('data fetched from localStorage: ', data);
        userFormData = JSON.parse(data);
        console.log('Page refreshed or Form not filled: ', userFormData);
    }
    console.log('Data fetched: ', data);
    console.log('userFormData', userFormData);
    const formCode = buildUserForm(userFormData);
    console.log('Form code: ', formCode);

    // Here we dynamically build the user form with string concatonation ;)
    form.innerHTML = formCode;

    // Then we display the form :)
    loadingPage.classList.add('invisible');
    formPage.classList.remove('invisible');
});

submitButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const userInput = document.querySelectorAll('.user-input');
    const formData = {};

    try {
        userInput.forEach((input) => {
            if (!input.value) {
                input.style.border = '5px solid red';
                console.log(userInput, input);
                throw new Error('All fields need to be filled!!');
            }

            formData[input.name] = input.value;
        });

        console.log('Form data: ', formData);

        const response = await fetch('/api/data/add-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        console.log('Response: ', response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response from the server: ', errorText);
            throw new Error('Error sending data to the server: ', errorText);
        }

        window.localStorage.removeItem(formKey);
        console.log('userForm removed from local storage');

        const responseData = await response.json();
        console.log('Response from the server: ', responseData);
        alert('Data sent to the database!!');
        console.log('Response status: ', response.status);
        console.log('Response headers: ', response.headers);
    }
    catch (error) {
        console.error(error);
        alert(error);
    }
});