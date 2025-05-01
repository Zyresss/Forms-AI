const table = document.getElementById('admin-table');
const downloadTableButton = document.createElement('button');

async function getData() {
    try {
        const response = await fetch('./admin.json', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error fetching data from server');
        }

        return await response.json();
    }
    catch (error) {
        console.error(error);
        alert(error);
    }
}

function downloadAsExcel() {
    const table = document.getElementById('admin-table');

    // Convert HTML table to worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.table_to_sheet(table, { raw: true });

    // Add sheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write to file
    XLSX.writeFile(workbook, "table.xlsx");
}

document.getElementById('get-admin-data-btn').addEventListener('click', async () => {
    document.getElementById('text').classList.add('is-hidden');
    document.getElementById('show').classList.add('invisible');
    document.getElementById('table').classList.remove('is-hidden');

    const data = await getData();

    if (!data || data.length === 0) {
        console.error('Error fetching data');
        return;
    }

    let htmlTableBody = '<thead> <tr class="is-link">';

    // for the table head
    for (const label of Object.keys(data[0])) {
        htmlTableBody += `<th>${label}</th>`;
    }
    htmlTableBody += '</tr> </thead> <tbody class="custom-text-color">';

    // for the table body
    data.forEach((row) => {
        htmlTableBody += '<tr>';
        for (const value of Object.values(row)) {
            htmlTableBody += `<td>${value}</td>`;
        }
        htmlTableBody += '</tr>';
    });

    htmlTableBody += '</tbody>';

    downloadTableButton.textContent = 'Download as excel';
    downloadTableButton.onclick = downloadAsExcel;

    table.innerHTML = htmlTableBody;
    table.parentElement.appendChild(downloadTableButton);

    console.log(table);
});

function downloadAsExcel__THISWORKS() {
    const table = document.getElementById('admin-table');
    const tableHTML = table.outerHTML;

    const blob = new Blob(["\ufeff", tableHTML], {
        type: "application/vnd.ms-excel"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "table.xls";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadAsExcel__() {
    const table = document.getElementById('admin-table');

    // Convert HTML table to worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.table_to_sheet(table, { raw: true });

    // Add sheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write to file
    XLSX.writeFile(workbook, "table.xlsx");
}