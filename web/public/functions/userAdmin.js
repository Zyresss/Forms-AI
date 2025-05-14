export async function getData() {
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

export function buildAdminTable(data) {
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

    return htmlTableBody;
}

export function downloadAsExcel(data) {
    const wb = XLSX.utils.book_new();
    const ws = buildStyledSheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Admin Data");
    XLSX.writeFile(wb, "admin_data.xlsx");
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





function downloadAsExcel___() {
    const table = document.getElementById('admin-table');

    // Convert HTML table to worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.table_to_sheet(table, { raw: true });

    // Add sheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write to file
    XLSX.writeFile(workbook, "table.xlsx");
}

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