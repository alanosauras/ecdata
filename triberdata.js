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
    let totalEntries = 0;
    let finishedEntries = 0;

    racedata.forEach(entry => {
        totalEntries += 1;
        // Assuming 'finish' is the field and checking if it's a number
        if (!isNaN(entry['finish']) && entry['finish'] !== null && entry['finish'] !== "") {
            finishedEntries += 1;
        }
    });

    const finishRate = (finishedEntries / totalEntries * 100).toFixed(1); // To one decimal place
    displayFinishRate(finishRate);
}

function displayFinishRate(rate) {
    const finishRateDiv = document.getElementById('finishRateInfo');
    if (finishRateDiv) {
        finishRateDiv.innerHTML = `The overall success rate is ${rate}% out of all entries.`;
    }
}

function calculateAndDisplayFirstTimeEntrantSuccessRate() {
    let captainFirstAppearances = {}; // Object to track the first year and success of each captain
    let firstTimeEntries = 0;
    let firstTimeFinishes = 0;

    racedata.forEach(entry => {
        const captainName = entry['Captain wt name'].toLowerCase().trim();
        const entryYear = parseInt(entry['YEAR'], 10); // Ensure the year is treated as a number
        const finished = !isNaN(entry['finish']) && entry['finish'] !== null && entry['finish'] !== "";

        // If the captain hasn't been encountered yet or this entry is earlier than what we've recorded
        if (!captainFirstAppearances[captainName] || captainFirstAppearances[captainName].year > entryYear) {
            captainFirstAppearances[captainName] = { year: entryYear, success: finished };
        }
    });

    // Now calculate total first-time entries and finishes
    Object.values(captainFirstAppearances).forEach(appearance => {
        firstTimeEntries += 1; // Every captain counted here is a first-time entry
        if (appearance.success) {
            firstTimeFinishes += 1; // Count this as a successful first-time finish
        }
    });

    const successRate = (firstTimeEntries > 0 ? (firstTimeFinishes / firstTimeEntries * 100) : 0).toFixed(1);
    displayFirstTimeEntrantSuccessRate(successRate);
}

function displayFirstTimeEntrantSuccessRate(rate) {
    const successRateDiv = document.getElementById('firstTimeEntrantSuccessRate');
    if (successRateDiv) {
        successRateDiv.innerHTML = `The success rate of first time captains ${rate}%`;
    }
}

function calculateAndDisplayGroupSuccessRates() {
    let soloAttempts = 0;
    let soloFinishes = 0;
    let doubleAttempts = 0;
    let doubleFinishes = 0;

    racedata.forEach(entry => {
        // Count solo attempts and finishes
        if (entry['Group'] === 'Single') {
            soloAttempts += 1;
            if (!isNaN(entry['finish']) && entry['finish'] !== null && entry['finish'] !== "") {
                soloFinishes += 1;
            }
        }
        // Count double attempts and finishes
        else if (entry['Group'] === 'Double') {
            doubleAttempts += 1;
            if (!isNaN(entry['finish']) && entry['finish'] !== null && entry['finish'] !== "") {
                doubleFinishes += 1;
            }
        }
    });

    // Calculate success rates
    const soloSuccessRate = (soloAttempts > 0 ? (soloFinishes / soloAttempts * 100) : 0).toFixed(1);
    const doubleSuccessRate = (doubleAttempts > 0 ? (doubleFinishes / doubleAttempts * 100) : 0).toFixed(1);

    // Display the results
    displayGroupSuccessRates(soloAttempts, soloSuccessRate, doubleAttempts, doubleSuccessRate);
}

function displayGroupSuccessRates(soloAttempts, soloSuccessRate, doubleAttempts, doubleSuccessRate) {
    const resultsDiv = document.getElementById('groupSuccessRates');
    if (resultsDiv) {
        resultsDiv.innerHTML = `
        <p style="margin: 0;">The number of Solo entries is ${soloAttempts}</p>
        <p style="margin: 0;">The overall success rate of solo entries is ${soloSuccessRate}%</p>
        <p style="margin: 0;">The total number of 2 person entries is ${doubleAttempts}</p>
        <p style="margin: 0;">The overall success rate of 2 person entries is ${doubleSuccessRate}%</p>
    `;
    }
}
