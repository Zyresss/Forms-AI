import { getResponseFromGemini } from "./functions/userForm.js";

document.addEventListener('DOMContentLoaded', () => {
    const fieldNameMap = {
        'section': 1,
        'text': 4,
        'email': 1,
        'password': 0,
        'number': 1,
        'textarea': 0,
        'radio': 1,
        'checkbox': 0,
        'select': 0,
        'file': 0,
        'date': 1
    };

    let formFields = [
        { type: 'section', label: 'Personal Information', name: 'Personal Information', required: true, fixedField: true },
        { type: 'text', label: 'First Name', name: 'First Name', required: true, fixedField: true },
        { type: 'text', label: 'Last Name', name: 'Last Name', required: true, fixedField: true },
        { type: 'date', label: 'Date of birth', name: 'Date of birth', required: true, fixedField: true },
        { type: 'radio', label: 'Gender', options: ['Male', 'Female'], name: 'Gender', required: true, fixedField: true },
        { type: 'email', label: 'Email Address', name: 'Email Address', required: true, fixedField: true },
        { type: 'number', label: 'Phone Number', name: 'Phone Number', required: true, fixedField: true },
        { type: 'text', label: 'Matricule', name: 'Matricule', required: true, fixedField: true }
    ];

    const fixedFormFields = [...formFields];
    let editingFieldIndex = -1;

    const formFieldsList = document.getElementById('formFieldsList');
    const generatedForm = document.getElementById('generatedForm');
    const formTitle = document.getElementById('formTitle');
    const formDescription = document.getElementById('formDescription');
    const previewTitle = document.getElementById('previewTitle');
    const fieldModal = document.getElementById('fieldModal');
    const modalContent = document.getElementById('modalContent');
    const codeOutput = document.getElementById('codeOutput');
    const aiSubmit = document.getElementById('generate-form');

    document.getElementById('addSection').addEventListener('click', () => openFieldModal('section'));
    document.getElementById('addText').addEventListener('click', () => openFieldModal('text'));
    document.getElementById('addEmail').addEventListener('click', () => openFieldModal('email'));
    document.getElementById('addPassword').addEventListener('click', () => openFieldModal('password'));
    document.getElementById('addTextarea').addEventListener('click', () => openFieldModal('textarea'));
    document.getElementById('addCheckbox').addEventListener('click', () => openFieldModal('checkbox'));
    document.getElementById('addRadio').addEventListener('click', () => openFieldModal('radio'));
    document.getElementById('addSelect').addEventListener('click', () => openFieldModal('select'));
    document.getElementById('addNumber').addEventListener('click', () => openFieldModal('number'));
    document.getElementById('addFile').addEventListener('click', () => openFieldModal('file'));
    document.getElementById('addDate').addEventListener('click', () => openFieldModal('date'));
    document.getElementById('generateCode').addEventListener('click', () => {
        codeOutput.style.display = 'block';
        document.getElementById('prompt-scen').style.display = 'block';
    });

    document.getElementById('saveField').addEventListener('click', saveField);
    document.getElementById('cancelField').addEventListener('click', closeFieldModal);
    document.getElementById('cancelAI').addEventListener('click', () => {
        codeOutput.style.display = 'none';
        document.getElementById('prompt-scen').style.display = 'block';
    });

    formTitle.addEventListener('input', updatePreview);

    aiSubmit.addEventListener('click', async () => {
        const userPrompt = document.getElementById('user-prompt');

        if (!userPrompt) {
            alert('An error occured');
            return;
        }

        if (userPrompt.value.length === 0) {
            alert('Enter a valid response');
            return;
        }

        aiSubmit.classList.add('is-loading');
        const responseText = await getResponseFromGemini(userPrompt.value);
        console.log(responseText);
        
        let json = null;

        try {
            json = JSON.parse(responseText);
        }
        catch (error) {
            console.error(error);
            aiSubmit.classList.remove('is-loading');
            userPrompt.value = '';
            codeOutput.style.display = 'none';
            document.getElementById('prompt-scen').style.display = 'none';
            alert('The AI response was not in valid format. Please try again or adjust your prompt.');
            return;
        }

        const responseArray = json;
        console.log('Response from Gemini: ', responseArray);

       if (!Array.isArray(json)) {
            aiSubmit.classList.remove('is-loading');
            alert('An error occured with the response received from Gemini. Please try a different prompt.');
            return;
        }

        responseArray.forEach((field) => {
            formFields.push(field);
        });

        aiSubmit.classList.remove('is-loading');
        userPrompt.value = '';
        codeOutput.style.display = 'none';
        document.getElementById('prompt-scen').style.display = 'none';
        
        updatePreview();
        updateFieldsList();
    });

    document.getElementById('saveForm').addEventListener('click', async (event) => {
        event.preventDefault();

        const savedForms = JSON.parse(localStorage.getItem('savedForms')) || [];

        const formData = {
            title: formTitle.value || 'Untitled Form',
            description: formDescription.value || 'Form with no desciption',
            fields: [...formFields],
            formIndex: savedForms.length + new Date().toISOString(),
        };

        if (formData.title.length > 50) {
            throw new Error('Max title length is 50 characters');
        }

        if (formData.description.length > 500) {
            throw new Error('Max description size is 500 characters!');
        }

        try {
            const response = await fetch('/api/data/save-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                alert('An error occured ahen saving data');
                throw new Error('An error occured ahen saving data');
            }

            const responseText = await response.json();
            console.log(responseText, response);
            alert('Form saved successfully! You can access it in the "My Forms" page.');
        }
        catch (error) {
            alert(error);
            console.error(error);
        }

        savedForms.push(formData);
        localStorage.setItem('savedForms', JSON.stringify(savedForms));

        console.log('Saved forms:', savedForms);

        //window.location.href = 'form-selector.html';
    });

    document.getElementById('resetForm').addEventListener('click', () => {
        formFields = [...fixedFormFields];
        updatePreview();
        updateFieldsList();
    });

    updatePreview();
    let formFieldsSize = formFields.length;

    function openFieldModal(fieldType, fieldIndex = -1) {
        editingFieldIndex = fieldIndex;

        let modalHTML = '';
        const fieldData = fieldIndex >= 0 ? formFields[fieldIndex] : null;

        modalHTML += `
        <div class="control-group">
            <label for="fieldLabel">Field Label</label>
            <input type="text" id="fieldLabel" placeholder="Enter field label" value="${fieldData ? fieldData.label : ''}">
        </div>`;

        switch (fieldType) {
            case 'section':
                modalHTML += `<input type="hidden" id="fieldType" value="${fieldType}">`;
                modalContent.innerHTML = modalHTML;
                fieldModal.style.display = 'block';
            return;

            case 'text': case 'email': case 'password': case 'number':
                modalHTML += `
                <div class="control-group">
                    <label for="fieldPlaceholder">Placeholder</label>
                    <input type="text" id="fieldPlaceholder" placeholder="Enter placeholder text" value="${fieldData && fieldData.placeholder ? fieldData.placeholder : ''}">
                </div>`;
            break;
            

            case 'textarea':
                modalHTML += `
                <div class="control-group">
                    <label for="fieldPlaceholder">Placeholder</label>
                    <input type="text" id="fieldPlaceholder" placeholder="Enter placeholder text" value="${fieldData && fieldData.placeholder ? fieldData.placeholder : ''}">
                </div>
                <div class="control-group">
                    <label for="fieldRows">Rows</label>
                    <input type="number" id="fieldRows" min="2" value="${fieldData && fieldData.rows ? fieldData.rows : '4'}">
                </div>`;
            break;

            case 'radio':
                modalHTML += `
                <div class="control-group">
                    <label>Options (one per line)</label>
                    <textarea id="fieldOptions" rows="4" placeholder="Option 1&#10;Option 2&#10;Option 3" style="resize: none;">${fieldData && fieldData.options ? fieldData.options.join('\n') : ''}</textarea>
                </div>`;
            break;

            case 'select':
                modalHTML += `
                <div class="control-group">
                    <label for="fieldOptions">Options (one per line)</label>
                    <textarea id="fieldOptions" rows="4" placeholder="Option 1&#10;Option 2&#10;Option 3" style="resize: none;">${fieldData && fieldData.options ? fieldData.options.join('\n') : ''}</textarea>
                </div>`;
            break;

            case 'file':
                modalHTML += `
                <div class="control-group">
                    <label for="fileMaxSize">Max File Size: 16MB</label>
                </div>`;
            break;

            case 'checkbox':
                modalHTML += `
                <div class="control-group">
                    <label>
                        <input type="checkbox" id="fieldChecked" ${fieldData && fieldData.checked ? 'checked' : ''}>
                        Checked by default
                    </label>
                </div>`;
            break;
        }

        modalHTML += `
        <div class="control-group">
            <label for="fieldRequired">
                <input type="checkbox" id="fieldRequired" ${fieldData && fieldData.required ? 'checked' : ''}>
                Required field
            </label>
        </div>`;

        modalHTML += `<input type="hidden" id="fieldType" value="${fieldType}">`;

        modalContent.innerHTML = modalHTML;
        fieldModal.style.display = 'block';
    }

    function closeFieldModal() {
        fieldModal.style.display = 'none';
        editingFieldIndex = -1;
    }

    function saveField() {
        const fieldType = document.getElementById('fieldType').value || '';
        const fieldLabel = document.getElementById('fieldLabel').value || 'Untitled Field';
        const fieldName = fieldType + fieldNameMap[fieldType] || fieldLabel.toLowerCase().replace(/\s+/g, '_') || '';
        fieldNameMap[fieldType]++;

        const fieldData = {
            type: fieldType,
            label: fieldLabel,
            name: fieldName,
            fieldIndex: formFieldsSize
        };

        formFieldsSize++;
        console.log('fieldData: ', fieldData);

        switch (fieldType) {
            case 'section':
                fieldData.title = fieldLabel;
            break;

            case 'date':
                fieldData.required = document.getElementById('fieldRequired').checked;
            break;

            case 'text': case 'email': case 'password': case 'number':
                fieldData.placeholder = document.getElementById('fieldPlaceholder').value;
                fieldData.required = document.getElementById('fieldRequired').checked;
            break;

            case 'textarea':
                fieldData.placeholder = document.getElementById('fieldPlaceholder').value;
                fieldData.rows = document.getElementById('fieldRows').value;
                fieldData.required = document.getElementById('fieldRequired').checked;
            break;

            case 'checkbox':
                fieldData.checked = document.getElementById('fieldChecked').checked;
            break;

            case 'radio': case 'select':
                fieldData.required = document.getElementById('fieldRequired').checked;
                const options = document.getElementById('fieldOptions').value
                    .split('\n')
                    .map(opt => opt.trim())
                    .filter(opt => opt !== '');
                fieldData.options = options.length > 0 ? options : ['Option 1', 'Option 2'];
            break;

            case 'file':
                fieldData.required = document.getElementById('fieldRequired').checked;
            break;
        }

        if (editingFieldIndex >= 0) {
            formFields[editingFieldIndex] = fieldData;
        } else {
            formFields.push(fieldData);
        }

        closeFieldModal();
        updateFieldsList();
        updatePreview();
    }

    function updateFieldsList() {
        formFieldsList.innerHTML = '';

        if (formFields.length === 0) {
            formFieldsList.innerHTML = '<div class="empty-message">No fields added yet. Click the buttons above to add form fields.</div>';
            return;
        }

        formFields.forEach((field, index) => {
            if (field.fixedField) return;

            const borderDiv = document.createElement('div');

            const fieldItem = document.createElement('div');
            fieldItem.className = 'field-item';
            fieldItem.setAttribute('data-index', field.fieldIndex);

            let details = `Type: ${field.type ? field.type.charAt(0).toUpperCase() + field.type.slice(1) : 'section title'}`;
            if (field.required) details += ' | Required';

            fieldItem.innerHTML = `
            <div class="field-title">${field.label ? field.label : 'Untitled Section'}</div>
            <div class="field-details">${details}</div>
            <button class="delete-field" data-index="${index}">×</button>`;

            fieldItem.addEventListener('click', (event) => {
                if (!event.target.classList.contains('delete-field')) {
                    openFieldModal(field.type, index);
                }
            });

            borderDiv.appendChild(fieldItem);
            formFieldsList.appendChild(borderDiv);
        });

        document.querySelectorAll('.delete-field').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const index = parseInt(event.target.getAttribute('data-index'));
                formFields.splice(index, 1);
                updateFieldsList();
                updatePreview();
            });
        });

    
        console.log('Fields List', formFields);
    }

    function updatePreview() {
        const titleText = formTitle.value || 'Untitled Form';
        previewTitle.textContent = titleText;

        generatedForm.innerHTML = '';

        if (formFields.length === 0) {
            generatedForm.innerHTML = '<p class="empty-preview">Add form fields to see a preview here.</p>';
            return;
        }

        formFields.forEach(field => {
            console.log('field: ', field);

            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            if (field.type === 'section') {
                const label = document.createElement('label');
                label.style.fontSize = '1.5rem';
                label.setAttribute('for', field.name);
                label.textContent = field.label;
                formGroup.appendChild(label);
            }
            
            if (field.type !== 'checkbox' && field.type !== 'section') {
                const label = document.createElement('label');
                label.setAttribute('for', field.name);
                label.textContent = field.label;
                if (field.required) {
                    const requiredMark = document.createElement('span');
                    requiredMark.textContent = ' *';
                    requiredMark.style.color = 'red';
                    label.appendChild(requiredMark);
                }
                formGroup.appendChild(label);
            }

            switch (field.type) {
                case 'text': case 'email': case 'password': case 'number': case 'date':
                    const input = document.createElement('input');
                    input.type = field.type;
                    input.id = field.name;
                    input.name = field.name;
                    if (field.placeholder) input.placeholder = field.placeholder;
                    if (field.required) input.required = true;
                    formGroup.appendChild(input);
                break;

                case 'textarea':
                    const textarea = document.createElement('textarea');
                    textarea.id = field.name;
                    textarea.name = field.name;
                    textarea.style.resize = 'none';
                    if (field.placeholder) textarea.placeholder = field.placeholder;
                    if (field.required) textarea.required = true;
                    textarea.rows = field.rows || 4;
                    formGroup.appendChild(textarea);
                break;

                case 'checkbox':
                    const checkboxContainer = document.createElement('div');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = field.name;
                    checkbox.name = field.name;
                    if (field.checked) checkbox.checked = true;
                    if (field.required) checkbox.required = true;

                    const checkboxLabel = document.createElement('label');
                    checkboxLabel.setAttribute('for', field.name);
                    checkboxLabel.textContent = field.label;

                    checkboxContainer.appendChild(checkboxLabel);
                    checkboxContainer.appendChild(checkbox);
                    formGroup.appendChild(checkboxContainer);
                break;

                case 'radio':
                    const radioContainer = document.createElement('div');
                    radioContainer.className = 'radio-group';

                    field.options.forEach((option, i) => {
                        const radioId = `${field.name}_${i}`;
                        const radioWrapper = document.createElement('div');
                        const radioslot = document.createElement('div');
                        radioslot.className = 'radio-slot';
                        const radio = document.createElement('input');

                        radio.type = 'radio';
                        radio.id = radioId;
                        radio.name = field.label;
                        radio.className = 'user-input';
                        radio.value = option.toLowerCase().replace(/\s+/g, '_');
                        if (i === 0 && field.required) radio.required = true;

                        const radioLabel = document.createElement('p');
                        radioLabel.setAttribute('for', radioId);
                        radioLabel.textContent = option;
                        radioWrapper.appendChild(radioslot);
                        radioslot.appendChild(radioLabel);
                        radioslot.appendChild(radio);
                        radioContainer.appendChild(radioWrapper);
                    });

                    formGroup.appendChild(radioContainer);
                break;

                case 'select':
                    const select = document.createElement('select');
                    select.id = field.name;
                    select.name = field.name;
                    if (field.required) select.required = true;

                    if (field.required) {
                        const emptyOption = document.createElement('option');
                        emptyOption.value = '';
                        emptyOption.textContent = '-- Please select --';
                        select.appendChild(emptyOption);
                    }

                    field.options.forEach(option => {
                        const optionEl = document.createElement('option');
                        optionEl.value = option.toLowerCase().replace(/\s+/g, '_');
                        optionEl.textContent = option;
                        select.appendChild(optionEl);
                    });

                    formGroup.appendChild(select);
                break;

                case 'file':
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.id = field.name;
                    fileInput.name = field.name;
                    if (field.accept) fileInput.accept = field.accept;
                    if (field.required) fileInput.required = true;

                    const fileInfo = document.createElement('div');
                    fileInfo.style.fontSize = '12px';
                    fileInfo.style.color = '#666';
                    fileInfo.style.marginTop = '5px';

                    let infoText = 'Max file size: 16MB.';

                    fileInfo.textContent = infoText;
                    formGroup.appendChild(fileInput);
                    formGroup.appendChild(fileInfo);
                break;
            }

            generatedForm.appendChild(formGroup);
        });
    }
});