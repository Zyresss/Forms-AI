const navbar = document.getElementById('navbar');
const homeScene = document.getElementById('home-scene');
const promptArea = document.getElementById('user-prompt');
const promptScene = document.getElementById('prompt-scene');
const getStartedButton = document.getElementById('get-started');
const generateFormButton = document.getElementById('generate-form');

getStartedButton.addEventListener('click', () => {
    homeScene.classList.add('invisible');
    navbar.classList.add('invisible');
    promptScene.classList.remove('invisible');
});

generateFormButton.addEventListener('click', () => {
    if (!promptArea.value) {
        promptArea.style.border = '5px solid red';
        alert('Enter a valid input');
        return;
    }

    window.localStorage.setItem('userPrompt', promptArea.value);
    window.location.href = 'form.html';
});