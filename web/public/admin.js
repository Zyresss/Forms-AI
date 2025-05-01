const table = document.getElementById('admin-table');
const downloadTableButton = document.createElement('button');
downloadTableButton.textContent = 'Download as excel';
downloadTableButton.id = 'download-btn';

async function getData() {
    try {
        const response = await fetch('/api/data/get-data', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response from the server: ', errorText);
            throw new Error('Error fetching data from server: ', errorText);
        }

        return await response.json();
    }
    catch (error) {
        console.error(error);
        alert(error);
    }
}

function buildStyledSheet(data) {
    const header = Object.keys(data[0]);
    const body = data.map(row => header.map(h => row[h]));
    const sheetData = [header, ...body];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell_address]) continue;
        ws[cell_address].s = {
          font: { bold: R === 0 },
          fill: R === 0 ? { fgColor: { rgb: "D9E1F2" } } : undefined,
          border: {
            top: { style: "thin", color: { auto: 1 } },
            bottom: { style: "thin", color: { auto: 1 } },
            left: { style: "thin", color: { auto: 1 } },
            right: { style: "thin", color: { auto: 1 } },
          },
        };
      }
    }

    ws['!cols'] = header.map(() => ({ wch: 15 }));
    return ws;
}

function downloadAsExcel(data) {
    const wb = XLSX.utils.book_new();
    const ws = buildStyledSheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Admin Data");
    XLSX.writeFile(wb, "admin_data.xlsx");
}

document.getElementById('get-admin-data-btn').addEventListener('click', async () => {
    document.getElementById('text').classList.add('is-hidden');
    document.getElementById('show').classList.add('invisible');
    document.getElementById('table-container').classList.remove('is-hidden');

    const data = await getData();

    if (!data || data.length === 0) {
        console.error('Error fetching data');
        return;
    }

    let htmlTableBody = '<thead> <tr class="is-success">';

    // for the table head
    for (const label of Object.keys(data[0])) {
        htmlTableBody += `<th>${label}</th>`;
    }
    htmlTableBody += '</tr> </thead> <tbody class="custom-text-color">';

    // for the table body
    data.forEach((row) => {
        htmlTableBody += '<tr>';
        for (const info of Object.values(row)) {
            htmlTableBody += `<td>${info}</td>`;
        }
        htmlTableBody += '</tr>';
    });

    htmlTableBody += '</tbody>';

    table.innerHTML = htmlTableBody;
    if (!document.getElementById('download-btn')) {
        downloadTableButton.addEventListener('click', () => downloadAsExcel(data));
        document.getElementById('table-container').appendChild(downloadTableButton);
    }

    console.log(table);
});