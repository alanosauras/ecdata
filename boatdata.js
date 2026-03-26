document.addEventListener('DOMContentLoaded', function () {

    // -------------------------------------------------------
    // SECTION 1: Average finish time table
    // -------------------------------------------------------

    function dhm(totalHours) {
        const h = Number(totalHours);
        const d = Math.floor(h / 24);
        const rem = h % 24;
        const m = Math.floor((rem - Math.floor(rem)) * 60);
        return d + 'd ' + Math.floor(rem) + 'h ' + m + 'm';
    }

    // Build boat finish time data — store class and group per individual finish
    const boatTimeData = {};
    racedata.forEach(e => {
        const boat = (e.BOAT || '').trim();
        if (!boat || boat === '?') return;
        const t = e['Total (hrs)'];
        if (!t || isNaN(t) || Number(t) <= 0) return;
        if (!boatTimeData[boat]) boatTimeData[boat] = { finishes: [] };
        boatTimeData[boat].finishes.push({
            time: Number(t),
            cls: e['C#'],
            group: e['Group']
        });
    });

    function buildAvgResults(classFilter, groupFilter) {
        return Object.entries(boatTimeData)
            .map(([boat, d]) => {
                // Filter individual finishes by class and group
                const filtered = d.finishes.filter(f => {
                    const matchClass = classFilter === 'ALL' || f.cls === classFilter;
                    const matchGroup = groupFilter === 'ALL' || f.group === groupFilter;
                    return matchClass && matchGroup;
                });
                if (filtered.length < 5) return null;

                const times = filtered.map(f => f.time);
                const n = times.length;
                const avg = times.reduce((a, b) => a + b, 0) / n;
                const variance = times.reduce((s, t) => s + Math.pow(t - avg, 2), 0) / n;
                const stddev = Math.sqrt(variance);
                const best = Math.min(...times);
                const worst = Math.max(...times);

                // Show all classes this boat appears in for these filtered finishes
                const classes = [...new Set(filtered.map(f => f.cls))].sort().join('/');

                return { boat, cls: classes, finishes: n, avg, stddev, best, worst };
            })
            .filter(Boolean);
    }

    function getSorted(results, method) {
        const copy = [...results];
        switch (method) {
            case 'avgFastest':     return copy.sort((a, b) => a.avg - b.avg);
            case 'avgSlowest':     return copy.sort((a, b) => b.avg - a.avg);
            case 'mostFinishes':   return copy.sort((a, b) => b.finishes - a.finishes);
            case 'mostConsistent': return copy.sort((a, b) => a.stddev - b.stddev);
            default: return copy;
        }
    }

    function renderAvgTable() {
        const PREVIEW = 5;
        const method = document.getElementById('avgSortFilter').value;
        const classFilter = document.getElementById('avgClassFilter').value;
        const groupFilter = document.getElementById('avgGroupFilter').value;

        const container = document.getElementById('avgFinishTable');
        container.innerHTML = '';

        const results = buildAvgResults(classFilter, groupFilter);
        const sorted = getSorted(results, method);

        if (sorted.length === 0) {
            container.innerHTML = '<p>No boats with 5+ finishes match the current filters.</p>';
            return;
        }

        const table = document.createElement('table');
        table.classList.add('search-results-table');

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['#', 'Boat', 'Class', 'Finishes', 'Avg Finish Time', 'Std Dev', 'Best Finish', 'Worst Finish'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        sorted.forEach((r, idx) => {
            const row = document.createElement('tr');
            if (idx >= PREVIEW) row.style.display = 'none';
            [
                idx + 1,
                r.boat,
                r.cls,
                r.finishes,
                dhm(r.avg),
                r.stddev.toFixed(1) + 'h',
                dhm(r.best),
                dhm(r.worst)
            ].forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        container.appendChild(table);

        if (sorted.length > PREVIEW) {
            const btn = document.createElement('button');
            btn.className = 'show-more-btn';
            btn.textContent = 'Show more (' + (sorted.length - PREVIEW) + ' more)';
            let expanded = false;
            btn.addEventListener('click', () => {
                expanded = !expanded;
                [...tbody.querySelectorAll('tr')].forEach((row, idx) => {
                    if (idx >= PREVIEW) row.style.display = expanded ? '' : 'none';
                });
                btn.textContent = expanded
                    ? 'Show less'
                    : 'Show more (' + (sorted.length - PREVIEW) + ' more)';
            });
            container.appendChild(btn);
        }
    }

    renderAvgTable();
    document.getElementById('avgSortFilter').addEventListener('change', renderAvgTable);
    document.getElementById('avgClassFilter').addEventListener('change', renderAvgTable);
    document.getElementById('avgGroupFilter').addEventListener('change', renderAvgTable);

    // -------------------------------------------------------
    // SECTION 2: All boats by finish count (existing logic)
    // -------------------------------------------------------
    updateTable();
    document.getElementById('classFilter').addEventListener('change', updateTable);
    document.getElementById('sortFilter').addEventListener('change', updateTable);
});

let boatFinishes = {};
let boatStarts = {};
let uniqueFinishCrewCombinations = {};

function updateTable() {
    const selectedClass = document.getElementById('classFilter').value;
    const sortMethod = document.getElementById('sortFilter').value;
    const boatOccurrences = {};

    boatFinishes = {};
    boatStarts = {};
    uniqueFinishCrewCombinations = {};

    let totalAttempts = 0;
    let identifiedAttempts = 0;

    racedata.forEach(entry => {
        if (selectedClass === 'ALL' || entry['C#'] === `C${selectedClass}`) {
            const boat = entry['BOAT'];
            totalAttempts += 1;

            if (boat !== '?') {
                identifiedAttempts += 1;

                if (entry['Total (hrs)'] !== 'DNS') {
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
    document.getElementById('dataNote').textContent =
        `This data includes ${identifiedPercentage}% of all the entries (the ones for which I was able to identify the boat used).`;

    let sortedBoats = Object.keys(boatOccurrences);

    if (sortMethod === 'mostFinishes') {
        sortedBoats.sort((a, b) => (boatFinishes[b] || 0) - (boatFinishes[a] || 0));
    } else if (sortMethod === 'mostUniqueCrews') {
        sortedBoats.sort((a, b) => {
            const ua = uniqueFinishCrewCombinations[a] ? uniqueFinishCrewCombinations[a].size : 0;
            const ub = uniqueFinishCrewCombinations[b] ? uniqueFinishCrewCombinations[b].size : 0;
            return ub - ua;
        });
    }

    document.querySelector('#boatDataTable tbody').innerHTML = '';
    populateTable(sortedBoats, boatOccurrences);
}

function populateTable(sortedBoats, boatOccurrences) {
    const tbody = document.querySelector('#boatDataTable tbody');

    sortedBoats.forEach((boat, index) => {
        const finishes = boatFinishes[boat] || 0;
        const starts = boatStarts[boat] || 1;
        const uniqueCrews = uniqueFinishCrewCombinations[boat] ? uniqueFinishCrewCombinations[boat].size : 0;
        const successRate = parseFloat((finishes / starts * 100).toFixed(1));
        const percentUnique = finishes > 0 ? parseFloat((uniqueCrews / finishes * 100).toFixed(1)) : 0;

        const row = tbody.insertRow();
        row.insertCell().textContent = index + 1;
        row.insertCell().textContent = getBoatClass(boat);
        row.insertCell().textContent = boat;
        row.insertCell().textContent = starts;
        row.insertCell().textContent = finishes;
        row.insertCell().textContent = uniqueCrews;
        row.insertCell().textContent = `${percentUnique}%`;
        row.insertCell().textContent = `${successRate}%`;
    });
}

function getBoatClass(boatName) {
    const entry = racedata.find(data => data['BOAT'] === boatName);
    return entry ? (entry['C#'] || 'Unknown') : 'Unknown';
}
