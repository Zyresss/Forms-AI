document.addEventListener('DOMContentLoaded', async () => {
    const formsList = document.getElementById('formsList');
    const noForms = document.getElementById('noForms');
    const formModal = document.getElementById('formModal');
    const formContainer = document.getElementById('formContainer');
    const closeModal = document.getElementById('closeModal');
    const successMessage = document.getElementById('successMessage');

    closeModal.addEventListener('click', () => {
        formModal.style.display = 'none';
        successMessage.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === formModal) {
            formModal.style.display = 'none';
            successMessage.style.display = 'none';
        }
    });

    let forms = null;

    try {
        const response = await fetch('/api/data/get-forms', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        console.log(response);
        if (!response.ok) {
            throw new Error('An error occured when fetching data from MongoDB');
        }

        const responseText = await response.json();
        console.log(responseText, response);
        forms = responseText;
    }
    catch (error) {
        console.error(error);
    }

    loadForms();

    function loadForms() {
        const savedForms = forms || [];

        if (savedForms.length === 0) {
            formsList.style.display = 'none';
            noForms.style.display = 'block';
            return;
        }

        formsList.innerHTML = '';
        savedForms.forEach((form, index) => {
            const formCard = document.createElement('div');
            formCard.className = 'form-card';

            const fieldCount = form.fields.length;
            const fieldTypes = [...new Set(form.fields.map(field => field.type))];

            let fieldsPreview = '';
            if (fieldCount > 0) {
                fieldsPreview = form.fields.slice(0, 3).map(field => field.label).join(', ');
                if (fieldCount > 3) {
                    fieldsPreview += '...';
                }
            }

            formCard.innerHTML = `
                <h3>${form.title || 'Untitled Form'}</h3>
                <div>
                    <div class="form-description mb-3" style="color: #325947; max-width: 100%; word-wrap: break-word;">
                        ${form.description}
                    </div>
                </div>
                <div class="form-preview">
                    ${fieldsPreview || 'No fields added to this form.'}
                </div>
                <div class="form-bottom">
                    <div class="form-actions">
                        <button class="button is-link fill-btn" style="color: #325947 ;" data-form-index="${form.formIndex}" data-index="${index}">Fill Form</button>
                    </div>
                </div>`;

            formsList.appendChild(formCard);
        });

        document.querySelectorAll('.fill-btn').forEach((button) => {
            button.addEventListener('click', () => {
                const dataIndex = button.dataset.formIndex;
                const index = button.dataset.index;
                console.log(dataIndex, index);
                openForm(dataIndex, index);
            });
        });
    }

    function openForm(dataIndex, index) {
        const savedForms = forms || [];
        const form = savedForms[index];

        if (!form) return;

        let formHTML = `
            <p class="is-size-3 has-text-weight-bold my-5">${form.title || 'Untitled Form'}</p>
            <form id="viewForm" class="view-form" data-index="${index}">
        `;

        form.fields.forEach((field, fieldIndex) => {
            formHTML += `<div class="form-group">`;

            switch (field.type) {
                case 'section':
                    formHTML += `<label for="field_${fieldIndex}" style="font-size: 1.4rem;">${field.label}</label>`;
                    break;
                case 'text': case 'email': case 'password': case 'number': case 'date':
                    formHTML += `
                        <label for="field_${fieldIndex}">${field.label}${field.required ? ' <span style="color: red;">*</span>' : ''}</label>
                        <input type="${field.type}" class="user-input" id="field_${fieldIndex}" name="${field.label}" 
                            ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}  ${field.required ? 'required' : ''}>
                    `;
                    break;

                case 'file':
                    formHTML += `
                        <label for="field_${fieldIndex}">${field.label}${field.required ? ' <span style="color: red;">*</span>' : ''}</label>
                        <input type="${field.type}" class="user-input" id="field_${fieldIndex}" ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                        ${field.required ? 'required' : ''} accept="${field.accept || ''}" name="${field.label}">
                            
                        <div style="font-size: 12px; color: #666; margin-top: 5px;">`;

                    let infoText = '';
                    if (field.accept) infoText += `Accepted: ${field.accept.replace(/\*/g, 'all')} `;
                    formHTML += `${infoText}</div>
                        `;
                break;

                case 'textarea':
                    formHTML += `
                        <label for="field_${fieldIndex}">${field.label}${field.required ? ' <span style="color: red;">*</span>' : ''}</label>
                        <textarea id="field_${fieldIndex}" class="user-input" name="${field.label}" rows="${field.rows || 4}" style="resize: none;"
                            ${field.required ? 'required' : ''} placeholder="${field.placeholder || ''}"></textarea>
                    `;
                    break;

                case 'checkbox':
                    formHTML += `
                        <div>
                            <label for="field_${fieldIndex}">${field.label}${field.required ? ' <span style="color: red;">*</span>' : ''}</label>
                            <input type="checkbox" class="user-input" id="field_${fieldIndex}" name="${field.label}" ${field.required ? 'required' : ''}>
                        </div>
                    `;
                    break;

                case 'radio':
                    formHTML += `<label>${field.label}${field.required ? ' <span style="color: red;">*</span>' : ''}</label>`;
                    formHTML += `<div class="radio-group user-input" data-value="" data-name="${field.label}" data-type="radio" data-required="${field.required ? 'required' : ''}">`;

                    field.options.forEach((option) => {
                        formHTML += `
                            <div>
                                <div class="radio-slot is-flex">
                                    <input type="radio" name="${field.label}" value="${option.toLowerCase().replace(/\s+/g, '_')}"  ${field.required ? 'required' : ''}>
                                    <p>${option}</p>
                                </div>
                            </div>
                        `;
                    });

                    formHTML += `</div>`;
                break;

                case 'select':
                    formHTML += `
                        <label for="field_${fieldIndex}">${field.label}${field.required ? ' <span style="color: red;">*</span>' : ''}</label>
                        <select id="field_${fieldIndex}" class="user-input" name="${field.label}" ${field.required ? 'required' : ''}>
                    `;

                    if (field.required) {
                        formHTML += `<option value="">-- Please select --</option>`;
                    }

                    field.options.forEach(option => {
                        formHTML += `
                            <option value="${option.toLowerCase().replace(/\s+/g, '_')}">${option}</option>
                        `;
                    });

                    formHTML += `</select>`;
                    break;
            }

            formHTML += `</div>`;
        });

        formHTML += `
            <button class="button is-link" id="submit-button" type="submit" style="color: #325947;">Submit</button>
            </form>
        `;

        formContainer.innerHTML = formHTML;
        formModal.style.display = 'block';

        document.getElementById('submit-button').addEventListener('click', async (event) => {
            event.preventDefault();

            try {
                const formData = new FormData();

                document.querySelectorAll('.user-input').forEach((input) => {
                    if (input.required && !input.value) {
                        input.style.border = '3px solid red';
                        throw new Error('All required fields need to be filled');
                    }

                    if ((input.type === 'tel' || input.type === 'number')) {
                        if (!input.required && !input.value) {
                            input.value = '';
                        }
                        else if (!validator.isNumeric(input.value)) {
                            input.style.border = '3px solid red';
                            throw new Error('Enter a valid number');
                        }
                    }

                    if (input.type === 'date') {
                        if (!input.required && !input.value) {
                            input.value = '';
                        }
                        else if (!validator.isDate(input.value)) {
                            input.style.border = '3px solid red';
                            throw new Error('Enter a valid date');
                        }
                    }

                    if (input.type === 'section') {
                        if (input.value === '-- Please Select --' && !input.required) {
                            input.value = '';
                        }
                        else if (input.value === '-- Please Select --' && input.required) {
                            input.style.border = '3px solid red';
                            throw new Error('Select a valid choice');
                        }
                    }

                    if (input.type === 'email') {
                        const email = input.value.trim();
                        if (!email && !input.required) {
                            input.value = '';
                        }
                        else if (!email && input.required) {
                            throw new Error('All required fields need to be filled');
                        }
                        else if (email) {
                            if (!validator.isEmail(email)) {
                                input.style.border = '3px solid red';
                                input.setCustomValidity('Enter a valid email address');
                                input.reportValidity();
                                throw new Error('Invalid email format');
                            }
                            else {
                                input.setCustomValidity('');
                            }
                        }
                    }
                    if (input.type === 'checkbox') formData.append(input.name, input.checked);

                    if (input.dataset.type === 'radio') {
                        const checkedRadio = input.querySelector('input[type="radio"]:checked');
                        console.log('Im here: ', checkedRadio);

                        if (!checkedRadio && input.dataset.required === 'required') {
                            throw new Error('All required fields need to be filled');
                        }

                        const value = checkedRadio ? checkedRadio.value : '';
                        input.dataset.value = value;
                        formData.append(input.dataset.name, value);
                    }

                    if (!input.dataset.type && input.type !== 'checkbox') formData.append(input.name, input.value.trim());
                });

                formData.append('CN', form.formIndex);

                document.querySelectorAll('input[type="file"]').forEach((input) => {
                    const maxSize = 16000000;
                    const file = input.files[0];
                    const name = input.name || 'file' || input.id;
                    console.log(file);
                    if (file) {
                        console.log(`Input ID: ${input.id}, File name: ${file.name}, File size (bytes): ${file.size}, MIME type: ${file.type}`);

                        if (maxSize < file.size) throw new Error("Files can't be over 16MB");
                        formData.append(name, file);
                    }
                    else {
                        console.log(`Input ID: ${input.id} — No file selected.`);
                    }
                });

                console.log('Form data: ', formData);

                const response = await fetch('/api/data/send-form-data', {
                    method: 'POST',
                    body: formData
                });

                console.log(response);
                if (!response.ok) {
                    throw new Error('An error occued when sending the data to MongoDB');
                }

                successMessage.style.display = 'block';
                successMessage.scrollIntoView({ behavior: 'smooth' });

                document.getElementById('viewForm').reset();

                const responseText = await response.json();
                console.log(responseText);
                alert('Data sent, congratulations dear, you won a no prize');
            }
            catch (error) {
                console.error(error);
                alert(error);
            }
        });
    }
});