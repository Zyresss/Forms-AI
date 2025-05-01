document.addEventListener('DOMContentLoaded', async () => {
    const data = localStorage.getItem('userForm');

    const userForm = JSON.parse(data);
    if (!userForm) {
        console.error('user form not loaded');
        return;
    }
    console.log(userForm);

    if (!Array.isArray(userForm)) {
        console.error('The response is not an array: ');
        return;
    }

    let htmlBody = '<div class="m-3"></div>';
    userForm.forEach(element => {

        htmlBody += `<div class="shadow is-flex is-justify-content-center mx-6" 
        style="background-color:rgb(185, 189, 62); padding: 1rem; margin-bottom: 1.5rem; 
        border-radius: 20px; font-weight: bold; font-size: large; color: #325947;">
        <p style="">=== ${element.section} ===</p>
        </div><div class="is-flex is-justify-content-center is-align-items-center"><div>`;

        for (const [label, type] of Object.entries(element.fields)) {
            if (Array.isArray(type)) {

                htmlBody += `<div class="is-flex field is-horizontal">
                <div class="mt-2 mx-3 wid field is-horizontal" style="width: 330px ;">
                    <label style="font-size: large; color: black;">${label} :</label>
                </div> 
                <div class="is-flex is-justify-content-center wid">
                <div class="select custom-select"><select class="user-input" name="${label}" style="width: 240px;">`;
                for (const index in type) {
                    htmlBody += `<option>${type[index]}</option>`;
                }

                htmlBody += "</select></div></div></div> <br>";
            }
            else {
                htmlBody += `<div class="field is-horizontal">
                <div class="mt-2 mx-3 wid field is-horizontal" style="width: 330px ;">
                    <label style="font-size: large; color: black;">${label} :</label>
                </div> 
                <div class="is-flex is-justify-content-center wid">
                <input class="user-input input custom-input w" name="${label}" placeholder="${label}" type="${type}"></div>
                </div> <br>`;
            }
        }
        htmlBody += "</div></div><br>";
    });

    document.getElementById('user-form').innerHTML = htmlBody;

    localStorage.removeItem('userForm');
});

document.getElementById('submit-btn').addEventListener('click', async (event) => {
    event.preventDefault();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const userInput = document.querySelectorAll('.user-input');
    const formData = {};

    try {
        userInput.forEach((input) => {
            if (!input.value) {
                throw new Error('All fields need to be filled!!');
            }

            formData[input.name] = input.value;
        });

        clearTimeout(timeoutId);

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