document.addEventListener('DOMContentLoaded', function() {
    calculateAndDisplayUniqueTribers();
    calculateAndDisplayFinishRate();
    calculateAndDisplayFirstTimeEntrantSuccessRate();
    calculateAndDisplayGroupSuccessRates();
});

function calculateAndDisplayUniqueTribers() {
    const uniqueTribers = new Set();

    // Go through each entry and add captain and crew names to the Set
    racedata.forEach(entry => {
        uniqueTribers.add(entry['Captain wt name'].trim().toLowerCase());
        if (entry['Crew wt name'] && entry['Crew wt name'].trim() !== "") {
            uniqueTribers.add(entry['Crew wt name'].trim().toLowerCase());
        }
    });

    // Display the count of unique Tribers
    const triberInfoDiv = document.getElementById('triberInfo');
    triberInfoDiv.innerHTML = `The total number of unique WaterTribers who have attempted the EC is ${uniqueTribers.size}`;
}

function calculateAndDisplayFinishRate() {
    let totalStarts = 0; // To count only entries that started the race
    let finishedEntries = 0;

    racedata.forEach(entry => {
        if (entry['Total (hrs)'] !== "DNS") { // Count as a started entry if not DNS
            totalStarts += 1;
            if (!isNaN(entry['Total (hrs)'])) { // Check if 'Total (hrs)' is a number, indicating a finish
                finishedEntries += 1;
            }
        }
    });

    const finishRate = totalStarts > 0 ? (finishedEntries / totalStarts * 100).toFixed(1) : '0.00'; // To one decimal place
    displayFinishRate(finishRate);
}

function displayFinishRate(rate) {
    const finishRateDiv = document.getElementById('finishRateInfo');
    if (finishRateDiv) {
        finishRateDiv.innerHTML = `The overall success rate is ${rate}% out of all entries that started. `;
    }
}


function calculateAndDisplayFirstTimeEntrantSuccessRate() {
    let captainFirstAppearances = {}; // Object to track the first appearance and if they started/finished
    let firstTimeStarts = 0; // Entries that started, excluding DNS
    let firstTimeFinishes = 0;

    racedata.forEach(entry => {
        const captainName = entry['Captain wt name'].toLowerCase().trim();
        // Assume a 'DNS' is indicated in 'Total (hrs)' field
        const started = entry['Total (hrs)'] !== "DNS";
        const finished = !isNaN(entry['Total (hrs)']);

        // Update captain's first appearance if this entry is earlier or if they haven't been recorded yet
        if (started && (!captainFirstAppearances[captainName] || captainFirstAppearances[captainName].year > parseInt(entry['YEAR'], 10))) {
            captainFirstAppearances[captainName] = { year: parseInt(entry['YEAR'], 10), finished: finished };
        }
    });

    // Iterate through the appearances to calculate totals
    Object.values(captainFirstAppearances).forEach(appearance => {
        firstTimeStarts += 1; // Every recorded captain is a first-time starter
        if (appearance.finished) {
            firstTimeFinishes += 1; // Count as a finish if they finished
        }
    });

    const successRate = (firstTimeStarts > 0 ? (firstTimeFinishes / firstTimeStarts * 100) : 0).toFixed(1);
    displayFirstTimeEntrantSuccessRate(successRate);
}

function displayFirstTimeEntrantSuccessRate(rate) {
    const successRateDiv = document.getElementById('firstTimeEntrantSuccessRate');
    if (successRateDiv) {
        successRateDiv.innerHTML = `The overall success rate of first-time entrants is ${rate}%.`;
    }
}


function calculateAndDisplayGroupSuccessRates() {
    let soloAttempts = 0;
    let soloFinishes = 0;
    let doubleAttempts = 0;
    let doubleFinishes = 0;

    racedata.forEach(entry => {
        const started = entry['Total (hrs)'] !== "DNS"; // Entry started the race if not "DNS"
        const finished = !isNaN(entry['Total (hrs)']); // Entry finished the race if 'Total (hrs)' is a number

        if (entry['Group'] === 'Single' && started) {
            soloAttempts += 1; // Count only if the entry started
            if (finished) {
                soloFinishes += 1;
            }
        } else if (entry['Group'] === 'Double' && started) {
            doubleAttempts += 1; // Count only if the entry started
            if (finished) {
                doubleFinishes += 1;
            }
        }
    });

    const soloSuccessRate = (soloAttempts > 0 ? (soloFinishes / soloAttempts * 100) : 0).toFixed(1);
    const doubleSuccessRate = (doubleAttempts > 0 ? (doubleFinishes / doubleAttempts * 100) : 0).toFixed(1);

    displayGroupSuccessRates(soloAttempts, soloSuccessRate, doubleAttempts, doubleSuccessRate);
}

function displayGroupSuccessRates(soloAttempts, soloSuccessRate, doubleAttempts, doubleSuccessRate) {
    const resultsDiv = document.getElementById('groupSuccessRates');
    if (resultsDiv) {
        resultsDiv.innerHTML = `
        <p>The number of Solo entries is ${soloAttempts}</p>
        <p>The overall success rate of solo entries is ${soloSuccessRate}%</p>
        <p>The total number of 2 person entries is ${doubleAttempts}</p>
        <p>The overall success rate of 2 person entries is ${doubleSuccessRate}%</p>
    `;
    }
}

function calculateAndDisplayFirstTimeGroupSuccessRates() {
    let firstTimeSoloEntries = 0;
    let firstTimeSoloFinishes = 0;
    let firstTimeDoubleEntries = 0;
    let firstTimeDoubleFinishes = 0;
    let captainFirstAppearances = {};

    racedata.forEach(entry => {
        const captainName = entry['Captain wt name'].toLowerCase().trim();
        const group = entry['Group'];
        const started = entry['Total (hrs)'] !== "DNS";
        const finished = !isNaN(entry['Total (hrs)']);
        const entryYear = parseInt(entry['YEAR'], 10);

        if (started && (!captainFirstAppearances[captainName] || captainFirstAppearances[captainName].year > entryYear)) {
            captainFirstAppearances[captainName] = { year: entryYear, group: group, finished: finished };
        }
    });

    // Iterate through the appearances to calculate totals for solo and double
    Object.values(captainFirstAppearances).forEach(appearance => {
        if (appearance.group === 'Single') {
            firstTimeSoloEntries += 1;
            if (appearance.finished) {
                firstTimeSoloFinishes += 1;
            }
        } else if (appearance.group === 'Double') {
            firstTimeDoubleEntries += 1;
            if (appearance.finished) {
                firstTimeDoubleFinishes += 1;
            }
        }
    });

    const soloSuccessRate = (firstTimeSoloEntries > 0 ? (firstTimeSoloFinishes / firstTimeSoloEntries * 100) : 0).toFixed(1);
    const doubleSuccessRate = (firstTimeDoubleEntries > 0 ? (firstTimeDoubleFinishes / firstTimeDoubleEntries * 100) : 0).toFixed(1);

    displayFirstTimeGroupSuccessRates(soloSuccessRate, doubleSuccessRate);
}

function displayFirstTimeGroupSuccessRates(soloRate, doubleRate) {
    const successRateDiv = document.getElementById('firstTimeGroupSuccessRates');
    if (successRateDiv) {
        successRateDiv.innerHTML = `The success rate for first-time solo entrants is ${soloRate}% vs. ${doubleRate}% for first-time 2 person entries.`;
    }
}

// Ensure you call the calculateAndDisplayFirstTimeGroupSuccessRates function similarly to other stats functions
document.addEventListener('DOMContentLoaded', function() {
    // Other stat calculations
    calculateAndDisplayFirstTimeGroupSuccessRates();
});


