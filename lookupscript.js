// lookupscript.js

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

    // Example: Create a list of matches
    const ul = document.createElement('ul');
    results.forEach(result => {
        const li = document.createElement('li');
        li.textContent = `YEAR: ${result.YEAR}, Captain: ${result['Captain wt name']}, Crew: ${result['Crew wt name']}, Total (hrs): ${result['Total (hrs)']}`;
        ul.appendChild(li);
    });
    resultsDiv.appendChild(ul);
}

