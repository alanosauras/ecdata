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
    const dnsEntries = results.filter(entry => entry['Total (hrs)'] === "DNS").length;
    const startedEntries = results.length - dnsEntries;
    const finishers = results.filter(entry => !isNaN(entry['Total (hrs)'])).length;
    const nonFinishers = startedEntries - finishers;
    const successRate = startedEntries > 0 ? (finishers / startedEntries) * 100 : 0;

    const summaryLine = document.createElement('p');
    summaryLine.innerHTML = `In ${query}, ${startedEntries} entries started the EC. ${dnsEntries} entries did not start.<br>` +
                            `${finishers} entries completed the challenge, while ${nonFinishers} entries did not.<br>` +
                            `The overall success rate was ${successRate.toFixed(1)}%.<br>`;
    resultsDiv.appendChild(summaryLine);
} else {
    const summaryLine = document.createElement('p');
    const wwCount = results.filter(entry => entry.WW === 'ww').length;
    let summaryHTML = `${query}: ${results.length} Everglades Challenge Entr${results.length !== 1 ? 'ies' : 'y'}.`;
    if (wwCount > 0) {
        summaryHTML += `<br>${wwCount} Wilderness Waterway Finish${wwCount !== 1 ? 'es' : ''}.`;
    }
    summaryLine.innerHTML = summaryHTML;
    resultsDiv.appendChild(summaryLine);
}

    // Create a table
    const table = document.createElement('table');
    table.classList.add('search-results-table');
    table.id = 'outputTable';

    // Create header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Empty header for the number column
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

    // Legend line under the header
    const legendRow = document.createElement('tr');
    const legendCell = document.createElement('td');
    legendCell.colSpan = 12;
    legendCell.style.cssText = 'font-size:12px; color:#666; padding:2px 8px 4px;';
    const toothLegend = document.createElement('img');
    toothLegend.src = 'alligator_tooth.JPG';
    toothLegend.alt = 'WW';
    toothLegend.style.cssText = 'height:14px; width:auto; vertical-align:middle; margin-right:4px;';
    legendCell.appendChild(toothLegend);
    legendCell.appendChild(document.createTextNode('Alligator tooth symbol denotes a Wilderness Waterway finish'));
    legendRow.appendChild(legendCell);
    thead.appendChild(legendRow);

    // Create and fill table body
    const tbody = document.createElement('tbody');
    results.forEach((result, index) => {
        const row = document.createElement('tr');

        const numberCell = document.createElement('td');
        numberCell.textContent = index + 1;
        row.appendChild(numberCell);
    
        const tribers = result['Crew wt name'] ? `${result['Captain wt name']} and ${result['Crew wt name']}` : result['Captain wt name'];
        const classValue = result['C#'];
        const totalDHM = convertHoursToDHM(result['Total (hrs)']);
        const cp1Value = result['PB?'] === "planB" ? `${result['cp1']} - B` : result['cp1'];
    
        const dataValues = [
            result['YEAR'],
            tribers,
            classValue,
            result['Group/Gender'],
            result['BOAT'],
            cp1Value,
            result['cp2'],
            result['cp3'],
            result['finish'],
            result['Total (hrs)'],
            totalDHM,
        ];
    
        dataValues.forEach((value, i) => {
            const cell = document.createElement('td');
            cell.className = 'myDataClass';

            // CP3 column (index 7): place tooth inline if WW finish
            if (i === 7 && result['WW'] === 'ww') {
                cell.style.whiteSpace = 'nowrap';
                const span = document.createElement('span');
                span.textContent = value;
                const tooth = document.createElement('img');
                tooth.src = 'alligator_tooth.JPG';
                tooth.alt = 'WW';
                tooth.title = 'Wilderness Waterway Finish';
                tooth.style.cssText = 'height:26px; width:auto; vertical-align:middle; margin-left:4px;';
                cell.appendChild(span);
                cell.appendChild(tooth);
            } else {
                cell.textContent = value;
            }
        
            // Highlight record times if defined
            if (window.recordTimes) {
                let recordTime;
                switch(i) {
                    case 5: recordTime = recordTimes.cp1.toFixed(2); break;
                    case 6: recordTime = recordTimes.cp2.toFixed(2); break;
                    case 7: recordTime = recordTimes.cp3.toFixed(2); break;
                    case 8: recordTime = recordTimes.cp4.toFixed(2); break;
                }
                if (parseFloat(value).toFixed(2) === recordTime) {
                    cell.style.backgroundColor = 'yellow';
                }
            }
        
            row.appendChild(cell);
        });
    
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    resultsDiv.appendChild(table);

    // Call linkifyTable with the ID of the newly created table
    linkifyTable('#outputTable');
}

// Helper function to convert hours to days, hours, minutes
function convertHoursToDHM(totalHours) {
    const hours = Number(totalHours);
    const days = Math.floor(hours / 24);
    const remainderHours = hours % 24;
    const minutes = Math.floor((remainderHours - Math.floor(remainderHours)) * 60);
    return `${days}d ${Math.floor(remainderHours)}h ${minutes}m`;
}
