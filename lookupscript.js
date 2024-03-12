// lookupscript.js

// Function to handle search
function searchdata() {
    const query = document.getElementById('searchQuery').value.toLowerCase().trim();

    if (!query) { // Checks if the query is empty after trimming whitespace
        document.getElementById('searchresults').innerHTML = 'Enter a triber\'s name to search.';
        return; // Exit the function early if no query is provided
    }

    const results = racedata.filter(entry => 
        entry['Captain wt name'].toLowerCase() === query || 
        entry['Crew wt name'].toLowerCase() === query ||
        entry['YEAR'].toString() === query // Assuming you still want to allow YEAR searches
    );

    displayResults(results);
}

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

    // // Prepend a summary line with the total number of races entered
    // const query = document.getElementById('searchQuery').value; // Get the original query for display
    // const summaryLine = document.createElement('p');
    // summaryLine.textContent = `${query} has entered ${results.length} Everglades Challenges.`;
    // resultsDiv.appendChild(summaryLine);

    // // Example: Create a list of matches
    // const ul = document.createElement('ul');
    // results.forEach(result => {
    //     const li = document.createElement('li');
    //     li.textContent = `YEAR: ${result.YEAR}, Captain: ${result['Captain wt name']}, Crew: ${result['Crew wt name']}, Total (hrs): ${result['Total (hrs)']}`;
    //     ul.appendChild(li);
    // });
    // resultsDiv.appendChild(ul);

    // Create a table
    const table = document.createElement('table');
    table.classList.add('search-results-table');


    // Create header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
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
    results.forEach(result => {
        const row = document.createElement('tr');
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

// Event listener for input in the search box
document.getElementById('searchQuery').addEventListener('input', function(event) {
    const inputVal = event.target.value.toLowerCase();
    const nameOptions = document.getElementById('nameOptions');
    
    // Clear previous options
    nameOptions.innerHTML = '';
    
    // Filter and collect all unique names that start with the input value
    const uniqueNames = new Set();
    racedata.forEach(entry => {
        const captainName = entry['Captain wt name'].toLowerCase();
        const crewName = entry['Crew wt name'].toLowerCase();
        if (captainName.startsWith(inputVal)) uniqueNames.add(entry['Captain wt name']);
        if (crewName.startsWith(inputVal)) uniqueNames.add(entry['Crew wt name']);
    });

    // Create and append option elements for each unique name
    uniqueNames.forEach(name => {
        const optionElement = document.createElement('option');
        optionElement.value = name;
        nameOptions.appendChild(optionElement);
    });
});

// Event listener for change in dropdown selection
document.getElementById('nameOptions').addEventListener('change', function(event) {
    // Get the selected name from the dropdown
    const selectedName = event.target.value;
    // Set the search query to the selected name
    document.getElementById('searchQuery').value = selectedName;
    // Initiate the search
    searchdata();
});

// Event listener for click on search button
document.getElementById('searchButton').addEventListener('click', function() {
    // Initiate the search when the search button is clicked
    searchdata();
});


// Helper function to convert hours to days, hours, minutes
function convertHoursToDHM(totalHours) {
    const hours = Number(totalHours);
    const days = Math.floor(hours / 24);
    const remainderHours = hours % 24;
    const minutes = Math.floor((remainderHours - Math.floor(remainderHours)) * 60);
    return `${days}d ${Math.floor(remainderHours)}h ${minutes}m`;
}
