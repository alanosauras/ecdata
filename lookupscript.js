// Function to handle search

document.addEventListener('DOMContentLoaded', function() {

    // Initialize search to display all data immediately upon page load
    searchdata();
 
    // Event listener for real-time search update in the search query input field
    document.getElementById('searchQuery').addEventListener('input', function(event) {
        // No need to prevent default action here; we want the text field to handle input as normal
        searchdata(); // Call searchdata to update results based on current input value
    });
    
    // Simplified event listener for the "Enter" key in the search query input field
    document.getElementById('searchQuery').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default action to avoid form submission
            searchdata();
        }
    });

    // Attach event listeners to the class and group filter dropdowns to trigger search on change
    document.getElementById('classFilter').addEventListener('change', searchdata);
    document.getElementById('groupFilter').addEventListener('change', searchdata);
    document.getElementById('boatQuery').addEventListener('input', searchdata);
});

function searchdata() {
    const query = document.getElementById('searchQuery').value.toLowerCase().trim();
    const classFilterValue = document.getElementById('classFilter').value;
    const groupFilterValue = document.getElementById('groupFilter').value; // Adjusted to fetch correctly
    const boatFilterValue = document.getElementById('boatQuery').value.toLowerCase(); // Adjusted to fetch correctly

    let results = racedata.filter(entry => {
        const matchesNameOrYear = entry['Captain wt name'].toLowerCase().includes(query) ||
                                  entry['Crew wt name'].toLowerCase().includes(query) ||
                                  entry['YEAR'].toString() === query;

        const matchesClass = classFilterValue === "ALL" || entry['C#'] === `C${classFilterValue}`;

        // Updated group matching logic
        const matchesGroup = groupFilterValue === "ALL" || 
                             (groupFilterValue === "All Single" && entry['Group/Gender'].includes("Single")) ||
                             (groupFilterValue === "All Double" && entry['Group/Gender'].includes("Double")) ||
                             entry['Group/Gender'].toLowerCase().includes(groupFilterValue.toLowerCase());

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

// Event listener for input in the boat search box
document.getElementById('boatQuery').addEventListener('input', function(event) {
    const inputVal = event.target.value.toLowerCase();
    const boatOptions = document.getElementById('boatOptions');
    // Clear previous options
    boatOptions.innerHTML = '';
    // Filter and collect all unique boat names that start with the input value
    const uniqueBoatNames = new Set();
    racedata.forEach(entry => {
        const boat = entry['BOAT'].toLowerCase();
        if (boat.startsWith(inputVal)) uniqueBoatNames.add(entry['BOAT']);
    });
    // Create and append option elements for each unique boat name
    uniqueBoatNames.forEach(boat => {
        const optionElement = document.createElement('option');
        optionElement.value = boat;
        boatOptions.appendChild(optionElement);
    });
});

// // Event listener for click on search button
// document.getElementById('searchButton').addEventListener('click', function() {
// });

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('resetButton').addEventListener('click', function() {
        window.location.reload();
    });
});




