    <script>

    function searchData() {
        const query = document.getElementById('searchQuery').value.toLowerCase();
        const results = raceData.filter(entry => 
            entry['Captain wt name'].toLowerCase().includes(query) || 
            entry['Crew wt name'].toLowerCase().includes(query) ||
            entry['YEAR'].toString() === query // Convert YEAR to string if it's a number
        );

        displayResults(results);
    }

    function displayResults(results) {
        const resultsDiv = document.getElementById('searchResults');
        resultsDiv.innerHTML = ''; // Clear previous results

        if (results.length === 0) {
            resultsDiv.innerHTML = 'No matches found.';
            return;
        }

        // Example: Create a list of matches
        const ul = document.createElement('ul');
        results.forEach(result => {
            const li = document.createElement('li');
            li.textContent = `YEAR: ${result.YEAR}, Captain: ${result['Captain wt name']}, Crew: ${result['Crew wt name']}, Total (hrs): ${result['Total (hrs)']}`;
            ul.appendChild(li);
        });
        resultsDiv.appendChild(ul);
    }
    </script>
