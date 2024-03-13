const entriesPerClassByYear = {}; // { year: { 'C1': count, 'C2': count, ... } }

racedata.forEach(entry => {
    if (!['C1', 'C2', 'C3', 'C4', 'C5'].includes(entry['C#'])) {
        return; // Ignore classes outside C1-C5
    }
    const year = entry['YEAR'];
    const className = entry['C#'];
    entriesPerClassByYear[year] = entriesPerClassByYear[year] || {};
    entriesPerClassByYear[year][className] = (entriesPerClassByYear[year][className] || 0) + 1;
});


const classColors = { 'C1': 'rgb(255, 99, 132)', 'C2': 'rgb(54, 162, 235)', 'C3': 'rgb(255, 206, 86)', 'C4': 'rgb(75, 192, 192)', 'C5': 'rgb(153, 102, 255)' };
const datasets = Object.keys(classColors).map(className => ({
    label: className,
    data: Object.keys(entriesPerClassByYear).map(year => entriesPerClassByYear[year][className] || 0),
    borderColor: classColors[className],
    fill: false,
    tension: 0.1
}));

const ctx = document.getElementById('entriesByYearChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Object.keys(entriesPerClassByYear).sort(),
        datasets: datasets
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Number of Entries in each Class by Year'
            }
        }
    }
});

//Total number of entries by year

const totalEntriesByYear = {};

Object.keys(entriesPerClassByYear).forEach(year => {
    totalEntriesByYear[year] = Object.values(entriesPerClassByYear[year]).reduce((sum, count) => sum + count, 0);
});

const totalEntriesDataset = {
    label: 'Total Entries',
    data: Object.keys(totalEntriesByYear).sort().map(year => totalEntriesByYear[year]),
    backgroundColor: 'rgba(255, 99, 132, 0.5)',
    borderColor: 'rgb(255, 99, 132)',
    fill: false,
    tension: 0.1
};


const totalCtx = document.getElementById('totalEntriesByYearChart').getContext('2d');
const totalEntriesChart = new Chart(totalCtx, {
    type: 'bar', // A bar chart might work well for this data, but you can choose any type
    data: {
        labels: Object.keys(totalEntriesByYear).sort(), // Ensure years are sorted
        datasets: [totalEntriesDataset]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Total Entries by Year'
            }
        }
    }
});

//success rate chart

const startedEntriesByYear = {}; // Entries that started
const finishersByYear = {};
const successRateByYear = {};

racedata.forEach(entry => {
    const year = entry['YEAR'];
    if (entry['Total (hrs)'] !== "DNS") { // Count as started if not marked as DNS
        startedEntriesByYear[year] = (startedEntriesByYear[year] || 0) + 1;
        if (!isNaN(entry['Total (hrs)'])) { // Check if 'Total (hrs)' is a number, indicating a finish
            finishersByYear[year] = (finishersByYear[year] || 0) + 1;
        }
    }
});

Object.keys(startedEntriesByYear).forEach(year => {
    const totalStarted = startedEntriesByYear[year];
    const totalFinishers = finishersByYear[year] || 0; // Ensure there's a fallback value
    successRateByYear[year] = totalStarted > 0 ? (totalFinishers / totalStarted * 100).toFixed(1) : '0.00'; // Calculate success rate
});

const years = Object.keys(successRateByYear).sort(); // Sort years to ensure chronological order
const successRates = years.map(year => successRateByYear[year]); // Map to success rates

document.addEventListener('DOMContentLoaded', () => {
    const successRateCtx = document.getElementById('successRateByYearChart').getContext('2d');
    const successRateChart = new Chart(successRateCtx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Success Rate (%)',
                data: successRates,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Success Rate (%)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                title: {
                    display: true,
                    text: 'Overall Success Rate by Year'
                }
            }
        }
    });
});



