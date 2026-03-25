document.addEventListener('DOMContentLoaded', function () {

    // -------------------------------------------------------
    // SECTION 1: Most Finishes (All-Time) — EC + UFC S1
    // -------------------------------------------------------
    const triberStats = {};

    // Count EC finishes
    racedata.forEach(entry => {
        const finished =
            entry['Total (hrs)'] !== '' &&
            entry['Total (hrs)'] !== null &&
            entry['Total (hrs)'] !== undefined &&
            !isNaN(entry['Total (hrs)']) &&
            entry['Total (hrs)'] > 0;

        ['Captain wt name', 'Crew wt name', '3rd wt name'].forEach(field => {
            const name = (entry[field] || '').trim();
            if (!name) return;
            if (!triberStats[name]) triberStats[name] = { ecFinishes: 0, entries: 0, ufcS1: 0 };
            triberStats[name].entries++;
            if (finished) triberStats[name].ecFinishes++;
        });
    });

    // Count UFC S1 finishes (valid S1 time = EC-equivalent finish)
    ufcracedata.forEach(entry => {
        const s1Finished =
            entry['S1'] !== null &&
            entry['S1'] !== undefined &&
            entry['S1'] !== '' &&
            entry['S1'] !== 'DNF' &&
            !isNaN(entry['S1']) &&
            entry['S1'] > 0;

        ['Captain wt name', 'Crew wt name', '3rd wt name'].forEach(field => {
            const name = (entry[field] || '').trim();
            if (!name) return;
            if (!triberStats[name]) triberStats[name] = { ecFinishes: 0, entries: 0, ufcS1: 0 };
            if (s1Finished) triberStats[name].ufcS1++;
        });
    });

    const finishResults = Object.entries(triberStats)
        .map(([name, s]) => ({
            name,
            ecFinishes: s.ecFinishes,
            ufcS1: s.ufcS1,
            totalFinishes: s.ecFinishes + s.ufcS1,
            entries: s.entries,
            dnfs: s.entries - s.ecFinishes
        }))
        .sort((a, b) => b.totalFinishes - a.totalFinishes || a.dnfs - b.dnfs);

    renderTable(
        document.getElementById('mostFinishes'),
        finishResults.slice(0, 20),
        ['#', 'Triber', 'Total Finishes', 'EC Finishes', 'UFC S1', 'EC Entries', 'EC DNF'],
        r => [
            r.name,
            r.totalFinishes + ' finish' + (r.totalFinishes !== 1 ? 'es' : ''),
            r.ecFinishes + ' EC',
            r.ufcS1 > 0 ? r.ufcS1 + ' UFC' : '—',
            r.entries + ' total entr' + (r.entries !== 1 ? 'ies' : 'y'),
            r.dnfs + ' DNF'
        ]
    );

    // -------------------------------------------------------
    // SECTION 2: Top 20 longest consecutive entry streaks
    // -------------------------------------------------------
    const allRaceYears = [...new Set(racedata.map(e => e.YEAR))].sort((a, b) => a - b);

    const triberYears = {};
    racedata.forEach(entry => {
        const year = entry.YEAR;
        const finished =
            entry['Total (hrs)'] !== '' &&
            entry['Total (hrs)'] !== null &&
            entry['Total (hrs)'] !== undefined &&
            !isNaN(entry['Total (hrs)']);

        ['Captain wt name', 'Crew wt name', '3rd wt name'].forEach(field => {
            const name = (entry[field] || '').trim();
            if (!name) return;
            if (!triberYears[name]) triberYears[name] = {};
            if (!triberYears[name][year]) triberYears[name][year] = { entered: 0, finished: 0 };
            triberYears[name][year].entered++;
            if (finished) triberYears[name][year].finished++;
        });
    });

    function longestConsecutiveStreak(yearMap) {
        const enteredYearSet = new Set(Object.keys(yearMap).map(Number));
        let best = { start: 0, end: 0, length: 0 };
        let i = 0;
        while (i < allRaceYears.length) {
            if (!enteredYearSet.has(allRaceYears[i])) { i++; continue; }
            let j = i;
            while (j < allRaceYears.length && enteredYearSet.has(allRaceYears[j])) j++;
            const streakLen = j - i;
            if (streakLen > best.length) {
                best = { start: allRaceYears[i], end: allRaceYears[j - 1], length: streakLen };
            }
            i = j;
        }
        return best;
    }

    const streakResults = [];
    Object.entries(triberYears).forEach(([name, yearMap]) => {
        const streak = longestConsecutiveStreak(yearMap);
        if (streak.length < 2) return;
        let finishes = 0, dnfs = 0;
        for (let y = streak.start; y <= streak.end; y++) {
            const yd = yearMap[y];
            if (yd) { finishes += yd.finished; dnfs += (yd.entered - yd.finished); }
        }
        streakResults.push({ name, streak: streak.length, start: streak.start, end: streak.end, finishes, dnfs });
    });
    streakResults.sort((a, b) => b.streak - a.streak || b.finishes - a.finishes);

    renderTable(
        document.getElementById('consecutiveStreaks'),
        streakResults.slice(0, 20),
        ['#', 'Triber', 'Consecutive Entries', 'Successful', 'DNF', 'Years'],
        r => [r.name, r.streak + ' consecutive attempt' + (r.streak !== 1 ? 's' : ''), r.finishes + ' successful', r.dnfs + ' DNF', r.start + ' to ' + r.end]
    );

    // -------------------------------------------------------
    // SECTION 3: Most different boats finished in (top 20)
    // -------------------------------------------------------
    const triberBoats = {};
    racedata.forEach(entry => {
        const finished =
            entry['Total (hrs)'] !== '' &&
            entry['Total (hrs)'] !== null &&
            entry['Total (hrs)'] !== undefined &&
            !isNaN(entry['Total (hrs)']) &&
            entry['Total (hrs)'] > 0;
        if (!finished) return;
        const boat = (entry.BOAT || '').trim();
        if (!boat || boat === '?') return;
        ['Captain wt name', 'Crew wt name', '3rd wt name'].forEach(field => {
            const name = (entry[field] || '').trim();
            if (!name) return;
            if (!triberBoats[name]) triberBoats[name] = new Set();
            triberBoats[name].add(boat);
        });
    });

    const boatResults = Object.entries(triberBoats)
        .map(([name, s]) => ({ name, count: s.size, boats: [...s].sort().join(', ') }))
        .sort((a, b) => b.count - a.count);

    renderTable(
        document.getElementById('mostBoats'),
        boatResults.slice(0, 20),
        ['#', 'Triber', 'Different Boats', 'Boat Models'],
        r => [r.name, r.count + ' boat' + (r.count !== 1 ? 's' : ''), r.boats]
    );

    // -------------------------------------------------------
    // SECTION 4: Most different classes finished in (top 20)
    // -------------------------------------------------------
    const triberClasses = {};
    racedata.forEach(entry => {
        const finished =
            entry['Total (hrs)'] !== '' &&
            entry['Total (hrs)'] !== null &&
            entry['Total (hrs)'] !== undefined &&
            !isNaN(entry['Total (hrs)']) &&
            entry['Total (hrs)'] > 0;
        if (!finished) return;
        const cls = (entry['C#'] || '').trim();
        if (!cls) return;
        ['Captain wt name', 'Crew wt name', '3rd wt name'].forEach(field => {
            const name = (entry[field] || '').trim();
            if (!name) return;
            if (!triberClasses[name]) triberClasses[name] = new Set();
            triberClasses[name].add(cls);
        });
    });

    const classResults = Object.entries(triberClasses)
        .map(([name, s]) => ({ name, count: s.size, classes: [...s].sort().join(', ') }))
        .sort((a, b) => b.count - a.count);

    renderTable(
        document.getElementById('mostClasses'),
        classResults.slice(0, 20),
        ['#', 'Triber', 'Different Classes', 'Classes'],
        r => [r.name, r.count + ' class' + (r.count !== 1 ? 'es' : ''), r.classes]
    );

});

// -------------------------------------------------------
// Shared table renderer with show more / show less
// -------------------------------------------------------
function renderTable(container, rows, headers, rowFn) {
    const PREVIEW = 5;

    if (!rows.length) {
        container.innerHTML = '<p>No data found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('search-results-table');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.forEach((r, idx) => {
        const row = document.createElement('tr');
        if (idx >= PREVIEW) row.classList.add('extra-row');
        [idx + 1, ...rowFn(r)].forEach(val => {
            const td = document.createElement('td');
            td.textContent = val;
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);

    // Only add button if there's more to show
    if (rows.length > PREVIEW) {
        // Hide extra rows initially
        tbody.querySelectorAll('tr.extra-row').forEach(r => r.style.display = 'none');

        const btn = document.createElement('button');
        btn.className = 'show-more-btn';
        btn.textContent = 'Show more (' + (rows.length - PREVIEW) + ' more)';
        let expanded = false;

        btn.addEventListener('click', () => {
            expanded = !expanded;
            tbody.querySelectorAll('tr.extra-row').forEach(r => {
                r.style.display = expanded ? '' : 'none';
            });
            btn.textContent = expanded
                ? 'Show less'
                : 'Show more (' + (rows.length - PREVIEW) + ' more)';
        });

        container.appendChild(btn);
    }
}
