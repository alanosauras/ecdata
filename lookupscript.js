// lookupscript.js

// Function to handle search
function searchdata() {
    const query = document.getElementById('searchQuery').value.toLowerCase().trim();
    const classFilterValue = document.getElementById('classFilter').value;
    const groupFilterValue = groupFilter.value; // Use the global variable
    const boatFilterValue = boatQuery.value.toLowerCase(); // Use the global variable

    let results = racedata.filter(entry => {
        const matchesNameOrYear = entry['Captain wt name'].toLowerCase().includes(query) ||
                                  entry['Crew wt name'].toLowerCase().includes(query) ||
                                  entry['YEAR'].toString() === query;

        const matchesClass = classFilterValue === "ALL" || entry['C#'] === `C${classFilterValue}`;
        const matchesGroup = groupFilterValue === "ALL" || entry['Group'].toLowerCase() === groupFilterValue.toLowerCase();
        const matchesBoat = !boatFilterValue || entry['BOAT'].toLowerCase().includes(boatFilterValue);

        return matchesNameOrYear && matchesClass && matchesGroup && matchesBoat;
    });

    displayResults(results);
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

document.addEventListener('DOMContentLoaded', function() {
    populateBoatOptions();
    });

function populateBoatOptions() {
    const boatOptions = document.getElementById('boatOptions');
    const uniqueBoats = new Set();

    racedata.forEach(entry => {
        uniqueBoats.add(entry['BOAT']); // Adjust 'BOAT' if the actual property name differs.
    });

    uniqueBoats.forEach(boat => {
        const option = document.createElement('option');
        option.value = boat;
        boatOptions.appendChild(option);
    });
}

