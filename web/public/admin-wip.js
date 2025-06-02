import { getData, buildAdminTable, downloadAsExcel } from '../functions/userAdmin.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('get-admin-data-btn').addEventListener('click', async () => {
        document.getElementById('text').classList.add('is-hidden');
        document.getElementById('show').classList.add('invisible');
        document.getElementById('table-container').classList.remove('is-hidden');

        loadForms();

        function loadForms() {
            const savedForms = JSON.parse(localStorage.getItem('savedForms')) || [];

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
                    <div class="form-info">
                        <strong>${fieldCount}</strong> fields | 
                        ${fieldTypes.length > 0 ? fieldTypes.join(', ') : 'No fields'}
                    </div>
                    <div class="form-preview">
                        ${fieldsPreview || 'No fields added to this form.'}
                    </div>
                    <div class="form-bottom">
                        <div class="form-actions">
                            <button class="button is-link fill-btn" style="color: #325947 ;" data-index="${index}">Fill Form</button>
                            <button class="button is-danger delete-btn" style="color: #325947 ;" data-index="${index}">Delete</button>
                        </div>
                    </div>
                `;

                formsList.appendChild(formCard);
            });

            document.querySelectorAll('.fill-btn').forEach((button) => {
                button.addEventListener('click', () => {
                    const index = parseInt(button.getAttribute('data-index'));
                    openForm(index);
                });
            });

            document.querySelectorAll('.delete-btn').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const index = parseInt(this.getAttribute('data-index'));
                    deleteForm(index);
                });
            });
        }
    
        /*
        const data = await getData();
    
        // Add a failed page here
        if (!data || data.length === 0) {
            console.error('Error fetching data');
            return;
        }
    
        document.getElementById('admin-table').innerHTML = buildAdminTable(data);
        document.getElementById('download-btn').classList.remove('invisible');
        document.getElementById('download-btn').addEventListener('click', () => downloadAsExcel(data));
        */
    });
});