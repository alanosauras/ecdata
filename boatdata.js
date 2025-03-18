let sortedBoats = [];
let boatFinishes = {};
let boatStarts = {};
let uniqueFinishCrewCombinations = {};
let myChart; // Declare this globally to reference and update/destroy the chart as needed


document.addEventListener('DOMContentLoaded', function() {
    updateTable(); // Initial table population
    document.getElementById('classFilter').addEventListener('change', updateTable);
    document.getElementById('sortFilter').addEventListener('change', updateTable); // Listen for sort changes

});

function updateTable() {
    const selectedClass = document.getElementById('classFilter').value;
    const sortMethod = document.getElementById('sortFilter').value; // Get the selected sort method
    const boatOccurrences = {};

    boatFinishes = {};
    boatStarts = {};
    uniqueFinishCrewCombinations = {};

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
    
    if (sortMethod === "mostFinishes") {
        sortedBoats.sort((a, b) => boatFinishes[b] - boatFinishes[a]);
    } else if (sortMethod === "mostUniqueCrews") {
        sortedBoats.sort((a, b) => {
            const uniqueCrewsA = uniqueFinishCrewCombinations[a] ? uniqueFinishCrewCombinations[a].size : 0;
            const uniqueCrewsB = uniqueFinishCrewCombinations[b] ? uniqueFinishCrewCombinations[b].size : 0;
            return uniqueCrewsB - uniqueCrewsA;
        });
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

function populateTable(sortedBoats, boatOccurrences, boatFinishes, boatStarts, uniqueFinishCrewCombinations) {
    const tbody = document.querySelector('#boatDataTable tbody');
    let chartDataPoints = []; // Prepare dataPoints for the scatter plot

    sortedBoats.forEach((boat, index) => {
        const finishes = boatFinishes[boat] || 0;
        const starts = boatStarts[boat] || 1; // Avoid division by zero
        const uniqueCrews = uniqueFinishCrewCombinations[boat] ? uniqueFinishCrewCombinations[boat].size : 0;

        // Calculate successRate and percentUnique here
        const successRate = parseFloat((finishes / starts * 100).toFixed(1));
        const percentUnique = parseFloat((uniqueCrews / finishes * 100).toFixed(1));

        // Populate the table
        const row = tbody.insertRow();
        row.insertCell().textContent = index + 1;
        row.insertCell().textContent = getBoatClass(boat);
        row.insertCell().textContent = boat;
        row.insertCell().textContent = starts;
        row.insertCell().textContent = finishes;
        row.insertCell().textContent = uniqueCrews;
        row.insertCell().textContent = `${percentUnique}%`; // Display percent unique
        row.insertCell().textContent = `${successRate}%`;

        // Add to chartDataPoints only if the number of finishes is greater than 1
        if (finishes > 5) {
            chartDataPoints.push({
                x: parseFloat(((finishes / starts) * 100).toFixed(1)),
                y: parseFloat(((uniqueCrews / finishes) * 100).toFixed(1)),
                boatName: boat // Include the boat name here for tooltip
            });
        }
    });

    // After populating the table, create the scatter plot with the correctly prepared chartDataPoints
    createScatterPlot(chartDataPoints);
}


function createScatterPlot(chartDataPoints) {
    const ctx = document.getElementById('scatterPlot').getContext('2d');

    // Explicitly check and destroy the existing chart instance if it exists
    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    // Now proceed to create a new chart instance
    window.myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Boats',
                data: chartDataPoints,
                backgroundColor: 'red', // Make dots red
                pointRadius: 2, // Adjust dot size if needed
            }, {
                type: 'line',
                label: 'Equality Line',
                data: [{x: 0, y: 0}, {x: 100, y: 100}], // Example line data
                borderColor: 'grey', // Line color
                borderWidth: 1,
                fill: false,
                pointRadius: 0, // No dots for the line dataset
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Success Rate (%)'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Percent Unique (%)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.raw.boatName || ''; // Display the boat name on hover
                        }
                    }
                },
                legend: {
                    display: false // Optionally hide the legend
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
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

