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
        const totalEntries = results.length;
        const finishers = results.filter(entry => !isNaN(entry['Total (hrs)'])).length;
        const nonFinishers = results.filter(entry => isNaN(entry['Total (hrs)'])).length;
        const successRate = (finishers / totalEntries) * 100;

        const summaryLine = document.createElement('p');
        summaryLine.innerHTML = `In ${query} there were ${totalEntries} entries into the EC.<br>` +
                                `${finishers} entries completed the challenge.<br>` +
                                `${nonFinishers} entries did not.<br>` +
                                `The overall success rate was ${successRate.toFixed(1)}%.`;
        resultsDiv.appendChild(summaryLine);
    } else {
        // Prepend a summary line with the total number of races entered
        const summaryLine = document.createElement('p');
        summaryLine.textContent = `${query} has entered ${results.length} Everglades Challenges.`;
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
    
    ["Year", "Triber/s", "Group", "Boat", "Class", "Total (hrs)", "cp1", "cp2", "cp3", "Total (days/hrs/min)"].forEach(headerText => {
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

            // Add a cell at the start for the row number, but with no header
            const numberCell = document.createElement('td');
            numberCell.textContent = index + 1; // Row numbering
            row.appendChild(numberCell);


        const tribers = result['Crew wt name'] ? `${result['Captain wt name']} and ${result['Crew wt name']}` : result['Captain wt name'];
        const classValue = result['C#'];
        const totalDHM = convertHoursToDHM(result['Total (hrs)']);

        // Define the order of keys as per the new structure including calculated or combined fields
        const dataValues = [
            result['YEAR'],
            tribers,
            result['Group'],
            result['BOAT'],
            classValue,
            result['Total (hrs)'],
            result['cp1'],
            result['cp2'],
            result['cp3'],
            totalDHM,
        ];

        dataValues.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            cell.className = 'myDataClass';
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