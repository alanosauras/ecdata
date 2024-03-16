// Function to display search results
function displayResults(results) {
    const resultsDiv = document.getElementById('searchresults');
    resultsDiv.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
        resultsDiv.innerHTML = 'No matches found.';
        return;
    }

    const query = document.getElementById('searchQuery').value; // Get the original query for display

// Check if the query is a year
if (/\b\d{4}\b/.test(query)) {
    const dnsEntries = results.filter(entry => entry['Total (hrs)'] === "DNS").length; // Count DNS entries
    const startedEntries = results.length - dnsEntries; // Calculate started entries by excluding DNS
    const finishers = results.filter(entry => !isNaN(entry['Total (hrs)'])).length;
    const nonFinishers = startedEntries - finishers; // Adjust nonFinishers to only include started entries
    const successRate = startedEntries > 0 ? (finishers / startedEntries) * 100 : 0; // Calculate success rate based on started entries

    const summaryLine = document.createElement('p');
    summaryLine.innerHTML = `In ${query}, ${startedEntries} entries started the EC. ${dnsEntries} entries did not start.<br>` +
                            `${finishers} entries completed the challenge, while ${nonFinishers} entries did not.<br>` +
                            `The overall success rate was ${successRate.toFixed(1)}%.<br>` 
                            resultsDiv.appendChild(summaryLine);
} else {
    // Prepend a summary line with the total number of races entered
    const summaryLine = document.createElement('p');
    summaryLine.textContent = `${query}: ${results.length} Everglades Challenge Entries.`;
    resultsDiv.appendChild(summaryLine);
}


    // Create a table
    const table = document.createElement('table');
    table.classList.add('search-results-table');

    // Create header row and add an empty cell for the "No." column
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Add an empty header for the number sequence column
    const emptyHeader = document.createElement('th');
    headerRow.appendChild(emptyHeader);

    ["Year", "Triber/s", "Class", "Group", "Boat", "CP1", "CP2", "CP3", "CP4", "Total (hr)", "D:H:M"].forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        header.className = 'myHeaderClass';
        headerRow.appendChild(header);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create and fill table body
    const tbody = document.createElement('tbody');
    results.forEach((result, index) => {
        const row = document.createElement('tr');
        const numberCell = document.createElement('td');
        numberCell.textContent = index + 1; // Row numbering
        row.appendChild(numberCell);
    
        const tribers = result['Crew wt name'] ? `${result['Captain wt name']} and ${result['Crew wt name']}` : result['Captain wt name'];
        const classValue = result['C#'];
        const totalDHM = convertHoursToDHM(result['Total (hrs)']);
        // Check if entry used Plan B and amend CP1 value accordingly
        const cp1Value = result['PB?'] === "planB" ? `${result['cp1']} - B` : result['cp1'];
    
        // Define the order of keys as per the new structure including calculated or combined fields
        const dataValues = [
            result['YEAR'],
            tribers,
            classValue,
            result['Group/Gender'],
            result['BOAT'],
            cp1Value, // Use amended CP1 value
            result['cp2'],
            result['cp3'],
            result['finish'],
            result['Total (hrs)'],
            totalDHM,
        ];
    
        dataValues.forEach((value, i) => {
            const cell = document.createElement('td');
            cell.textContent = value;
            cell.className = 'myDataClass';

            // Safely check for recordTimes before attempting to access it
            if (typeof recordTimes !== 'undefined') {
                if (i === 5 && parseFloat(value) === recordTimes.cp1 || 
                    i === 6 && parseFloat(value) === recordTimes.cp2 || 
                    i === 7 && parseFloat(value) === recordTimes.cp3 || 
                    i === 8 && parseFloat(value) === recordTimes.cp4) {
                    cell.style.backgroundColor = 'yellow';
                }
            }
            
            row.appendChild(cell);
        });
    
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);

    // Append the table to the resultsDiv
    resultsDiv.appendChild(table);
}

// Helper function to convert hours to days, hours, minutes
function convertHoursToDHM(totalHours) {
    const hours = Number(totalHours);
    const days = Math.floor(hours / 24);
    const remainderHours = hours % 24;
    const minutes = Math.floor((remainderHours - Math.floor(remainderHours)) * 60);
    return `${days}d ${Math.floor(remainderHours)}h ${minutes}m`;
}