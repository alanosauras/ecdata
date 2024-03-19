function linkifyTable(tableSelector) {
    const table = document.querySelector(tableSelector);
    if (!table) return; // Exit if the table isn't found

    const rows = table.querySelectorAll('tbody tr'); // Select only rows within tbody to avoid header
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const boatCell = cells[4]; // Assuming "Boat" is the fifth column
        if (!boatCell) return; // Skip rows where the boat cell isn't found (just in case)
        textLinks.forEach(link => {
            if (boatCell.textContent.trim() === link.text) { // Check for exact match
                boatCell.innerHTML = `<a href="${link.url}" target="_blank">${boatCell.textContent}</a>`;
            }
        });
    });
}
