document.addEventListener('DOMContentLoaded', function() {
    updateTable(); // Initial table population
    document.getElementById('classFilter').addEventListener('change', updateTable);
    document.getElementById('sortFilter').addEventListener('change', updateTable); // Listen for sort changes

});

function updateTable() {
    const selectedClass = document.getElementById('classFilter').value;
    const sortMethod = document.getElementById('sortFilter').value; // Get the selected sort method
    const boatOccurrences = {};
    const boatFinishes = {};
    const boatStarts = {};
    const uniqueFinishCrewCombinations = {}; // Use this to store unique crews for boats that finished

    let totalAttempts = 0;
    let identifiedAttempts = 0;

    // Iterate through race data
    racedata.forEach(entry => {
        if (selectedClass === 'ALL' || entry['C#'] === `C${selectedClass}`) {
            const boat = entry['BOAT'];
            totalAttempts += 1;

            if (boat !== "?") {
                identifiedAttempts += 1;

                if (entry['Total (hrs)'] !== "DNS") {
                    boatStarts[boat] = (boatStarts[boat] || 0) + 1;
                    if (!isNaN(entry['Total (hrs)'])) {
                        boatFinishes[boat] = (boatFinishes[boat] || 0) + 1;

                        const uniqueKey = `${entry['Captain wt name']}${entry['Crew wt name'] ? '|' + entry['Crew wt name'] : ''}`;
                        if (!uniqueFinishCrewCombinations[boat]) {
                            uniqueFinishCrewCombinations[boat] = new Set();
                        }
                        uniqueFinishCrewCombinations[boat].add(uniqueKey);
                    }
                }
                boatOccurrences[boat] = (boatOccurrences[boat] || 0) + 1;
            }
        }
    });

    const identifiedPercentage = ((identifiedAttempts / totalAttempts) * 100).toFixed(1);
    displayIdentifiedPercentage(identifiedPercentage);

    const weightedScores = calculateWeightedScores(boatOccurrences, boatFinishes, uniqueFinishCrewCombinations);

    // Sort boats based on the sort method selected
    let sortedBoats = Object.keys(boatOccurrences).sort((a, b) => boatOccurrences[b] - boatOccurrences[a]);
    if (sortMethod === "weightedScore") {
        // Filter out boats with less than 3 unique crews from the ones that finished
        sortedBoats = sortedBoats.filter(boat => uniqueFinishCrewCombinations[boat] && uniqueFinishCrewCombinations[boat].size >= 2);
        // Sort by weighted score
        sortedBoats.sort((a, b) => weightedScores[b] - weightedScores[a]);
    } else if (sortMethod === "mostFinishes") {
        sortedBoats.sort((a, b) => boatFinishes[b] - boatFinishes[a]);
    } else if (sortMethod === "finishRate") {
        sortedBoats.sort((a, b) => (boatFinishes[b] / boatStarts[b]) - (boatFinishes[a] / boatStarts[a]));
    }

    document.querySelector('#boatDataTable tbody').innerHTML = '';
    populateTable(sortedBoats, boatOccurrences, boatFinishes, boatStarts, uniqueFinishCrewCombinations, weightedScores);
}



function displayIdentifiedPercentage(percentage) {
    const noteDiv = document.getElementById('dataNote');
    noteDiv.textContent = `This data includes ${percentage}% of all the entries (the ones for which I was able to identify the boat used).`;
}

function calculateWeightedScores(boatOccurrences, boatFinishes, uniqueCrewCombinations) {
    const weightedScores = {};

    Object.keys(boatOccurrences).forEach(boat => {
        const successRate = boatFinishes[boat] ? (boatFinishes[boat] / boatOccurrences[boat]) * 100 : 0;
        const diversityRate = uniqueCrewCombinations[boat] ? (uniqueCrewCombinations[boat].size / boatOccurrences[boat]) * 100 : 0;

        weightedScores[boat] = (successRate + diversityRate) / 2; // Weighted score as the average of success and diversity rates
    });

    return weightedScores;
}

function populateTable(sortedBoats, boatOccurrences, boatFinishes, boatStarts, uniqueFinishCrewCombinations, weightedScores) {
    const tbody = document.querySelector('#boatDataTable tbody');

    sortedBoats.forEach((boat, index) => {
        const row = tbody.insertRow();
        row.insertCell().textContent = index + 1;
        row.insertCell().textContent = getBoatClass(boat); // Insert boat class as the second cell
        row.insertCell().textContent = boat;
        row.insertCell().textContent = boatStarts[boat] || 0;
        row.insertCell().textContent = boatFinishes[boat] || 0;
        row.insertCell().textContent = uniqueFinishCrewCombinations[boat] ? uniqueFinishCrewCombinations[boat].size : 0;
        row.insertCell().textContent = ((boatFinishes[boat] || 0) / (boatStarts[boat] || 1) * 100).toFixed(1) + '%';
        row.insertCell().textContent = weightedScores[boat].toFixed(1);
    });
}

// Function to get boat class based on boat name
function getBoatClass(boatName) {
    // Find the entry in racedata corresponding to the boatName
    const entry = racedata.find(data => data['BOAT'] === boatName);
    if (entry) {
        // Return the boat class from the entry
        return entry['C#'] || 'Unknown';
    } else {
        return 'Unknown';
    }
}

