export const formKey = 'userForm';

export function buildUserForm(userFormObject) {
    let htmlFormBody = '<div class="m-3"></div>';
    userFormObject.forEach(element => {

        htmlFormBody += `<div class="shadow is-flex is-justify-content-center mx-6" 
        style="background-color:rgb(185, 189, 62); padding: 1rem; margin-bottom: 1.5rem; 
        border-radius: 20px; font-weight: bold; font-size: large; color: #325947;">
        <p style="">${element.section}</p>
        </div><div class="is-flex is-justify-content-center is-align-items-center"><div>`;

        for (const [label, type] of Object.entries(element.fields)) {
            if (type === 'file') continue;
            
            if (Array.isArray(type)) {

                htmlFormBody += `<div class="is-flex field is-horizontal">
                <div class="mt-2 mx-3 wid field is-horizontal" style="width: 330px ;">
                    <label style="font-size: large; color: black;">${label} :</label>
                </div> 
                <div class="is-flex is-justify-content-center wid">
                <div class="select custom-select"><select class="user-input" name="${label}" style="width: 240px;">`;
                for (const index in type) {
                    htmlFormBody += `<option>${type[index]}</option>`;
                }

                htmlFormBody += "</select></div></div></div> <br>";
            }
            else {
                htmlFormBody += `<div class="field is-horizontal">
                <div class="mt-2 mx-3 wid field is-horizontal" style="width: 330px ;">
                    <label style="font-size: large; color: black;">${label} :</label>
                </div> 
                <div class="is-flex is-justify-content-center wid">
                <input class="user-input input custom-input w" name="${label}" placeholder="${label}" type="${type}"></div>
                </div> <br>`;
            }
        }
        htmlFormBody += "</div></div><br>";
    });

    if (htmlFormBody === '<div class="m-3"></div>') {
        htmlFormBody = '<h1>Form couldnt be loaded</h1>';
    }

    return htmlFormBody;
}

export async function getResponseFromGemini(prompt) {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch Gemini response');
        }

        const { result } = await response.json();
        const cleanedResponseText = result
                .replace(/^```(?:json)?\s*/i, '')
                .replace(/\s*```$/, '')
                .replace(/\s*```[\s\n]*$/, '');
                
        return cleanedResponseText;
    }
    catch (error) {
        console.error('Error getting Gemini data: ', error);
    }
}





function buildUserFormWIP(formObject) {
    let htmlFormBody = ``;

    formObject.forEach((sec) => {
        htmlFormBody += `${sec.section}`;

        sec.fields.forEach((field, index) => {
            const required = field.required;
            switch (field.type) {
                case 'text': case 'email': case 'password': case 'number':
                    htmlFormBody += `
                        <label>${field.label}</label>
                        <input type="${field.type}" placeholder="Enter ${field.label}" ${field.required ? required : ''}>
                        <br>`;
                break;
                
            }
        });
    });
}