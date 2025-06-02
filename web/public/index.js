const homeScene = document.getElementById('home-scene');
const promptArea = document.getElementById('user-prompt');
const promptScene = document.getElementById('prompt-scene');

// When the user presses 'Get Started', we switch scenes
document.getElementById('get-started').addEventListener('click', () => {
    homeScene.classList.add('invisible');
    promptScene.classList.remove('invisible');
});

// An event for when the user wants to generate the form
document.getElementById('generate-form').addEventListener('click', () => {
    // We check if we have a valid input, if not then we notify the user
    if (!promptArea.value) {
        promptArea.style.border = '5px solid red';
        alert('Enter a valid input');
        return;
    }

    // We save the prompt to local storage and we change web pages
    window.localStorage.setItem('userPrompt', promptArea.value);
    window.location.href = 'form.html';
});