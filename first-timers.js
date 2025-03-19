console.log("✅ first-timers.js Loaded");

// ✅ First-Timer & Repeat Offender Data
const firstTimerData = {};
const repeatOffenderData = {};
const previousTribes = new Set();

// ✅ Sort `racedata` by year to ensure correct processing order
const sortedRaceData = racedata.sort((a, b) => a["YEAR"] - b["YEAR"]);

// ✅ Iterate over race entries in chronological order
sortedRaceData.forEach(entry => {
    const year = entry["YEAR"];
    if (year === 2015) return; // Skip 2015 since no race was held

    const className = entry["C#"];
    if (!["C1", "C2", "C3", "C4", "C5"].includes(className)) return; // Process only Classes 1-5
    if (entry["Total (hrs)"] === "DNS") return; // Ignore DNS entries

    // ✅ Standardize Name Formatting
    const normalizeName = (name) => name.toLowerCase().trim();
    const captain = normalizeName(entry["Captain wt name"] || "");
    const crew = normalizeName(entry["Crew wt name"] || "");

    // ✅ Determine First-Timers & Repeat Offenders
    if (!previousTribes.has(captain) && !previousTribes.has(crew)) {
        firstTimerData[year] = firstTimerData[year] || { started: 0, finished: 0 };
        firstTimerData[year].started += 1;
        if (!isNaN(entry["Total (hrs)"])) {
            firstTimerData[year].finished += 1;
        }
    } else {
        if (year !== 2001) { // Ensure no repeat offenders in year 1
            repeatOffenderData[year] = repeatOffenderData[year] || { started: 0, finished: 0 };
            repeatOffenderData[year].started += 1;
            if (!isNaN(entry["Total (hrs)"])) {
                repeatOffenderData[year].finished += 1;
            }
        }
    }

    // ✅ Store Names for Future Tracking
    if (captain) previousTribes.add(captain);
    if (crew) previousTribes.add(crew);
});

// ✅ Compute Success Rates
const firstTimerSuccessRate = {};
const repeatOffenderSuccessRate = {};

Object.keys(firstTimerData).forEach(year => {
    const started = firstTimerData[year].started;
    const finished = firstTimerData[year].finished;
    firstTimerSuccessRate[year] = started > 0 ? (finished / started * 100).toFixed(1) : null;
});

Object.keys(repeatOffenderData).forEach(year => {
    const started = repeatOffenderData[year].started;
    const finished = repeatOffenderData[year].finished;
    repeatOffenderSuccessRate[year] = started > 0 ? (finished / started * 100).toFixed(1) : null;
});

// ✅ Compute Averages
let totalFirstTimeEntries = 0, totalFirstTimeFinishers = 0;
let totalRepeatEntries = 0, totalRepeatFinishers = 0;

Object.keys(firstTimerData).forEach(year => {
    totalFirstTimeEntries += firstTimerData[year].started;
    totalFirstTimeFinishers += firstTimerData[year].finished;
});

Object.keys(repeatOffenderData).forEach(year => {
    totalRepeatEntries += repeatOffenderData[year].started;
    totalRepeatFinishers += repeatOffenderData[year].finished;
});

const avgFirstTimerSuccess = totalFirstTimeEntries > 0 ? (totalFirstTimeFinishers / totalFirstTimeEntries * 100).toFixed(1) : null;
const avgRepeatSuccess = totalRepeatEntries > 0 ? (totalRepeatFinishers / totalRepeatEntries * 100).toFixed(1) : null;

// ✅ Update Summary Text
const summaryElement = document.getElementById("summary-text");
if (summaryElement) {
    summaryElement.innerHTML = `
        This page charts the first timer and repeat offender success rates.
        The total number of first-time entries that started is <strong>${totalFirstTimeEntries}</strong> 
        and the total number that finished is <strong>${totalFirstTimeFinishers}</strong>.
        The total number of repeat offenders that started is <strong>${totalRepeatEntries}</strong> 
        and the total number that finished is <strong>${totalRepeatFinishers}</strong>.
        The average first-time success rate is <strong>${avgFirstTimerSuccess}%</strong>, 
        while the average repeat offender success rate is <strong>${avgRepeatSuccess}%</strong>.
    `;
} else {
    console.warn("⚠️ 'summary-text' element not found.");
}

// ✅ Render First-Timer & Repeat Offender Chart
const colors = {
    firstTimer: "rgb(0, 150, 0)", // Green solid
    firstTimerDotted: "rgba(0, 150, 0, 0.5)", // Green dotted
    firstTimerDashed: "rgba(0, 150, 0, 0.8)", // Green dashed
    repeatOffender: "rgb(0, 0, 255)", // Blue solid
    repeatOffenderDotted: "rgba(0, 0, 255, 0.5)", // Blue dotted
    repeatOffenderDashed: "rgba(0, 0, 255, 0.8)", // Blue dashed
};

document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("firstTimersSuccessRateChart");
    if (!canvas) {
        console.error("❌ Missing canvas: firstTimersSuccessRateChart");
        return;
    }

    const years = Object.keys(firstTimerSuccessRate).sort();

    new Chart(canvas.getContext("2d"), {
        type: "line",
        data: {
            labels: years,
            datasets: [
                {
                    label: "First-Timer Success Rate",
                    data: years.map(year => firstTimerSuccessRate[year] || null),
                    borderColor: colors.firstTimer,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: "Repeat Offender Success Rate",
                    data: years.map(year => repeatOffenderSuccessRate[year] || null),
                    borderColor: colors.repeatOffender,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: "Average First-Timer Success Rate",
                    data: years.map(() => avgFirstTimerSuccess),
                    borderColor: colors.firstTimerDashed,
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.1
                },
                {
                    label: "Average Repeat Offender Success Rate",
                    data: years.map(() => avgRepeatSuccess),
                    borderColor: colors.repeatOffenderDashed,
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.1
                },
                {
                    label: "Total First-Timers",
                    data: years.map(year => firstTimerData[year]?.started || 0),
                    borderColor: colors.firstTimerDotted,
                    borderWidth: 1,
                    borderDash: [2, 2],
                    fill: false,
                    tension: 0.1
                },
                {
                    label: "Total Repeat Offenders",
                    data: years.map(year => repeatOffenderData[year]?.started || 0),
                    borderColor: colors.repeatOffenderDotted,
                    borderWidth: 1,
                    borderDash: [2, 2],
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Success Rate (%) & Total Entries"
                    }
                }
            },
            plugins: {
                legend: { display: true },
                title: { display: true, text: "First Timer and Repeat Offender Success Rate" },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label;
                            return label.includes("Total") ? `${label}: ${context.raw}` : `${label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });

    console.log("✅ First-timers chart rendered successfully.");
});
