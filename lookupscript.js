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

    // Prepend a summary line with the total number of races entered
    const query = document.getElementById('searchQuery').value; // Get the original query for display
    const summaryLine = document.createElement('p');
    summaryLine.textContent = `${query} has entered ${results.length} Everglades Challenges.`;
    resultsDiv.appendChild(summaryLine);

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
    ['Year', 'Captain', 'Crew', 'Total (hrs)'].forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create and fill table body
    const tbody = document.createElement('tbody');
    results.forEach(result => {
        const row = document.createElement('tr');
        ['YEAR', 'Captain wt name', 'Crew wt name', 'Total (hrs)'].forEach(column => {
            const cell = document.createElement('td');
            cell.textContent = result[column];
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
