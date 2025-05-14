import { getData, buildAdminTable, downloadAsExcel } from './functions/userAdmin.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('get-admin-data-btn').addEventListener('click', async () => {
        document.getElementById('text').classList.add('is-hidden');
        document.getElementById('show').classList.add('invisible');
        document.getElementById('table-container').classList.remove('is-hidden');
    
        const data = await getData();
    
        // Add a failed page here
        if (!data || data.length === 0) {
            console.error('Error fetching data');
            return;
        }
    
        document.getElementById('admin-table').innerHTML = buildAdminTable(data);
        document.getElementById('download-btn').classList.remove('invisible');
        document.getElementById('download-btn').addEventListener('click', () => downloadAsExcel(data));
    });
});