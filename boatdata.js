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
    const uniqueCrewCombinations = {};
    
    let totalAttempts = 0;
    let identifiedAttempts = 0;

    // Iterate through race data
    racedata.forEach(entry => {
        if (selectedClass === 'ALL' || entry['C#'] === `C${selectedClass}`) {
            const boat = entry['BOAT'];
            totalAttempts += 1;

            if (boat !== "?") {
                identifiedAttempts += 1;
                const uniqueKey = `${boat}|${entry['Captain wt name']}${entry['Crew wt name'] ? '|' + entry['Crew wt name'] : ''}`;

                if (!uniqueCrewCombinations[boat]) {
                    uniqueCrewCombinations[boat] = new Set();
                }
                uniqueCrewCombinations[boat].add(uniqueKey);

                if (entry['Total (hrs)'] !== "DNS") {
                    boatStarts[boat] = (boatStarts[boat] || 0) + 1;
                    if (!isNaN(entry['Total (hrs)'])) {
                        boatFinishes[boat] = (boatFinishes[boat] || 0) + 1;
                    }
                }
                boatOccurrences[boat] = (boatOccurrences[boat] || 0) + 1;
            }
        }
    });

    const identifiedPercentage = ((identifiedAttempts / totalAttempts) * 100).toFixed(1);
    displayIdentifiedPercentage(identifiedPercentage);

    const weightedScores = calculateWeightedScores(boatOccurrences, boatFinishes, uniqueCrewCombinations);

    // Sort boats based on the sort method selected
    let sortedBoats = Object.keys(boatOccurrences).sort((a, b) => boatOccurrences[b] - boatOccurrences[a]);
    if (sortMethod === "weightedScore") {
        sortedBoats.sort((a, b) => weightedScores[b] - weightedScores[a] || uniqueCrewCombinations[b].size - uniqueCrewCombinations[a].size);
    } else if (sortMethod === "mostFinishes") {
        sortedBoats.sort((a, b) => boatFinishes[b] - boatFinishes[a]);
    } else if (sortMethod === "finishRate") {
        sortedBoats.sort((a, b) => (boatFinishes[b] / boatStarts[b]) - (boatFinishes[a] / boatStarts[a]));
    }

    // Additional sorting logic to move boats with only 1 finish to the bottom for the weightedScore sort method
    if (sortMethod === "weightedScore") {
        const boatsWithMoreThanOneFinish = sortedBoats.filter(boat => boatFinishes[boat] > 1);
        const boatsWithOneFinish = sortedBoats.filter(boat => boatFinishes[boat] === 1);
        sortedBoats = [...boatsWithMoreThanOneFinish, ...boatsWithOneFinish];
    }

    document.querySelector('#boatDataTable tbody').innerHTML = '';
    populateTable(sortedBoats, boatOccurrences, boatFinishes, boatStarts, uniqueCrewCombinations, weightedScores);
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

function populateTable(sortedBoats, boatOccurrences, boatFinishes, boatStarts, uniqueCrewCombinations, weightedScores) {
    const tbody = document.querySelector('#boatDataTable tbody');

    sortedBoats.forEach((boat, index) => {
        const row = tbody.insertRow();
        row.insertCell().textContent = index + 1;
        row.insertCell().textContent = boat;
        row.insertCell().textContent = boatStarts[boat] || 0;
        row.insertCell().textContent = boatFinishes[boat] || 0;
        row.insertCell().textContent = uniqueCrewCombinations[boat] ? uniqueCrewCombinations[boat].size : 0;
        row.insertCell().textContent = ((boatFinishes[boat] || 0) / (boatStarts[boat] || 1) * 100).toFixed(1) + '%';
        row.insertCell().textContent = weightedScores[boat].toFixed(1);
    });
}
