
document.addEventListener('DOMContentLoaded', function() {
    updateTable(); // Initial table population

    // Listen for changes on the class filter dropdown
    document.getElementById('classFilter').addEventListener('change', updateTable);
});

function updateTable() {
    const selectedClass = document.getElementById('classFilter').value;
    const boatOccurrences = {};
    const boatFinishes = {};
    const boatStarts = {}; // To track boats that actually started (excluding DNS)

    // Filter data based on the selected class (if not 'ALL')
    const filteredData = racedata.filter(entry => selectedClass === 'ALL' || entry['C#'] === `C${selectedClass}`);

    filteredData.forEach(entry => {
        const boat = entry['BOAT'];
        if (entry['Total (hrs)'] !== "DNS") { // Count only boats that did not have DNS status
            boatStarts[boat] = (boatStarts[boat] || 0) + 1; // Increment the start count
            if (!isNaN(entry['Total (hrs)'])) { // Check if Total (hrs) is a number, indicating a finish
                boatFinishes[boat] = (boatFinishes[boat] || 0) + 1;
            }
        }
        boatOccurrences[boat] = (boatOccurrences[boat] || 0) + 1; // Total occurrences regardless of DNS status
    });

    const sortedBoats = Object.keys(boatOccurrences).sort((a, b) => boatOccurrences[b] - boatOccurrences[a]);

    const table = document.getElementById('boatDataTable');
    table.classList.add('search-results-table'); // Add the class to the table
    
    // Clear the existing table body before repopulating
    document.querySelector('#boatDataTable tbody').innerHTML = '';

    populateTable(sortedBoats, boatOccurrences, boatFinishes, boatStarts);
}

function populateTable(sortedBoats, occurrences, finishes, starts) {
    const tbody = document.querySelector('#boatDataTable tbody');

    sortedBoats.forEach((boat, index) => {
        const row = tbody.insertRow(-1); // Add row to the end of the table body
        const numberCell = row.insertCell(0);
        numberCell.textContent = index + 1;
        
        const boatCell = row.insertCell(1);
        boatCell.textContent = boat;
        
        const occurrencesCell = row.insertCell(2);
        occurrencesCell.textContent = starts[boat] || 0; // Display starts instead of total occurrences
        
        const finishesCell = row.insertCell(3);
        finishesCell.textContent = finishes[boat] || 0;

        // Calculate and display success rate
        const successRateCell = row.insertCell(4);
        const successRate = starts[boat] ? ((finishes[boat] / starts[boat]) * 100).toFixed(1) : '0.00';
        successRateCell.textContent = `${successRate}%`;
    });
}



// function updateTable() {
//     const selectedClass = document.getElementById('classFilter').value;
//     const boatOccurrences = {};
//     const boatFinishes = {};

//     // Filter data based on the selected class (if not 'ALL')
//     const filteredData = racedata.filter(entry => selectedClass === 'ALL' || entry['C#'] === `C${selectedClass}`);

//     filteredData.forEach(entry => {
//         const boat = entry['BOAT'];
//         boatOccurrences[boat] = (boatOccurrences[boat] || 0) + 1;
//         if (!isNaN(entry['finish'])) { // Assuming 'finish' is the field to check
//             boatFinishes[boat] = (boatFinishes[boat] || 0) + 1;
//         }
//     });

//     const sortedBoats = Object.keys(boatOccurrences).sort((a, b) => boatOccurrences[b] - boatOccurrences[a]);

//     const table = document.getElementById('boatDataTable');
//     table.classList.add('search-results-table'); // Add the class to the table
    
//     // Clear the existing table body before repopulating
//     document.querySelector('#boatDataTable tbody').innerHTML = '';

//     populateTable(sortedBoats, boatOccurrences, boatFinishes);
// }

// function populateTable(sortedBoats, occurrences, finishes) {
//     const tbody = document.querySelector('#boatDataTable tbody');

//     sortedBoats.forEach((boat, index) => {
//         const row = tbody.insertRow(-1); // Add row to the end of the table body
//         const numberCell = row.insertCell(0);
//         numberCell.textContent = index + 1;
        
//         const boatCell = row.insertCell(1);
//         boatCell.textContent = boat;
        
//         const occurrencesCell = row.insertCell(2);
//         occurrencesCell.textContent = occurrences[boat];
        
//         const finishesCell = row.insertCell(3);
//         finishesCell.textContent = finishes[boat] || 0;

//         // Calculate and display success rate
//         const successRateCell = row.insertCell(4);
//         const successRate = finishes[boat] ? ((finishes[boat] / occurrences[boat]) * 100).toFixed(1) : '0.00';
//         successRateCell.textContent = `${successRate}%`;

//     });
// }
