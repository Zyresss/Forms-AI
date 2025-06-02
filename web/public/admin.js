function downloadFile(formIndex, fileName) {
    const url = `/api/data/download/${formIndex}/${fileName}`;
    window.open(url, '_blank');
}

document.addEventListener('DOMContentLoaded', async () => {
    const formModal = document.getElementById('formModal');
    const closeModal = document.getElementById('closeModal');
    const table = document.getElementById('admin-table');
    let forms = null;

    closeModal.addEventListener('click', () => {
        formModal.style.display = 'none';
    });

    try {
        const response = await fetch('/api/data/get-forms', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('An error occured when fetching data from MongoDB');
        }

        const responseText = await response.json();
        forms = responseText;
    }
    catch (error) {
        console.error(error);
    }

    document.getElementById('download-all-data-btn').addEventListener('click', async () => {
        if (forms.length === 0) {
            alert('No forms saved, Please create a form in the form generator page.');
            return;
        }

        let data = null;
        try {
            const formsIndexes = [];
            forms.forEach((form) => {
                formsIndexes.push(form.formIndex);
            });

            const postResponse = await fetch('/api/data/send-form-indexes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formsIndexes)
            });

            if (!postResponse.ok) {
                throw new Error('An error occured when sending form indexes to the server');
            }

            data = await postResponse.json();
            console.log(`postResponse: `, data);
        }
        catch (error) {
            console.error(error);
            alert(error);
            return;
        }

        const excludedKeys = ['CN', 'files'];

        const workbook = XLSX.utils.book_new();

        data.forEach((sheetData, index) => {
            const cleanedData = sheetData.map(row => {
                const newRow = {};
                for (const key in row) {
                    if (!excludedKeys.includes(key)) {
                        newRow[key] = row[key];
                    }
                }
                return newRow;
            });

            const worksheet = XLSX.utils.json_to_sheet(cleanedData);
            XLSX.utils.book_append_sheet(workbook, worksheet, `Sheet${index + 1}`);
        });
        XLSX.writeFile(workbook, 'data.xlsx');
    });

    loadForms();

    function loadForms() {
        const savedForms = forms || [];

        // We have to fix this
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
                        <button class="button is-link view-btn" data-form-id="${form.formIndex}" style="color:#325947;" data-index=${index}>View Data</button>
                        <button class="button is-danger delete-btn" style="color:#325947;" data-form-id="${form.formIndex}" data-index="${index}">Delete</button>
                    </div>
                </div>
            `;

            console.log('Form index: ', form.formIndex);
            formsList.appendChild(formCard);
        });

        document.querySelectorAll('.view-btn').forEach((button) => {
            button.addEventListener('click', async () => {
                const formId = button.dataset.formId;
                const index = button.dataset.index;
                const formData = await getFormData(formId);
                console.log('Form data: ', formData);
                console.log('Form id: ', formId);
                if (formData.length === 0) {
                    alert('No data');
                }
                buildSingleFormDataTable(formData, formId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach((button) => {
            button.addEventListener('click', async (event) => {
                event.stopPropagation();
                const formId = button.dataset.formId;
                const index = button.dataset.index;
                console.log('Form index: ', formId);
                await deleteForm(formId);
                // forms.splice(index, 1);
                // loadForms();
            });
        });
    }

    async function deleteForm(index) {
        console.log('index received: ', index);
        if (!confirm('Are you sure you want to delete this form?')) return;

        try {
            const response = await fetch('/api/data/delete-form', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ index })
            });

            if (!response.ok) {
                throw new Error('An error occued when deleteing the form');
            }

            console.log('response: ', response);
            console.log('responseText: ', await response.json());
            // Only remove from forms and reload if deletion succeeded
            const idx = forms.findIndex(f => f.formIndex == index);
            if (idx !== -1) {
                forms.splice(idx, 1);
            }
            loadForms();
        }
        catch (error) {
            console.error(error);
            alert(error);
        }
    }

    async function getFormData(index) {
        try {
            const getResponse = await fetch(`/api/data/get-form-data?index=${index}`);

            if (!getResponse.ok) {
                throw new Error('An error occured when geting the form data from the server');
            }

            return await getResponse.json()
        }
        catch (error) {
            console.log(error);
            alert(error);
        }
    }

    function buildSingleFormDataTable(formData, formIndex) {
        console.log(formData);

        let htmlTableBody = '<thead> <tr class="is-success">';

        for (const label of Object.keys(formData[0])) {
            if (label === 'CN') continue;
            if (label === 'files') {
                for (const [k, v] of Object.entries(label)) {
                    console.log(`k: ${k}, v: ${v}`);
                }
                htmlTableBody += '<th>Files<th>';
                continue;
            }

            htmlTableBody += `<th>${label}</th>`;
        }
        htmlTableBody += '</tr> </thead> <tbody class="custom-text-color">';

        formData.forEach((field) => {
            htmlTableBody += '<tr>';
            for (const [label, value] of Object.entries(field)) {
                console.log(label, value);
                if (label === 'CN') continue;

                if (label === 'files') {
                    for (const [fileName, fileData] of Object.entries(value)) {
                        const buttonId = `download-${formIndex}-${fileName}`;
                        console.log(formIndex, fileName);
                        htmlTableBody += `<td>
                            <button onclick="downloadFile('${formIndex}', '${fileName}')">
                                Download ${fileName}
                            </button>
                        </td>`;
                    }
                    continue;
                }

                if (label === 'files') {
                    console.log(`label: ${label}, value: ${value}`);
                    for (const [k, v] of Object.entries(value)) {
                        console.log(`k: ${k}, v: ${v}`);
                        for (const [a, b] of Object.entries(v)) {
                            console.log(`a: ${a}, b: ${b}`);
                        }
                    }
                    continue;
                }

                htmlTableBody += `<td>${value}</td>`;
            }
            htmlTableBody += '</tr>';
        });

        htmlTableBody += '</tbody>';
        console.log(htmlTableBody);

        table.innerHTML = htmlTableBody;
        document.getElementById('table-container').classList.remove('is-hidden');
        formModal.style.display = 'block';
    }
});