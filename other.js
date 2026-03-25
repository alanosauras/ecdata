document.addEventListener('DOMContentLoaded', function () {

    // --- Build sorted list of all race years present in the data ---
    const allRaceYears = [...new Set(racedata.map(e => e.YEAR))].sort((a, b) => a - b);

    // --- Build per-triber map: name -> { year -> { entered, finished } } ---
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

    // --- Find the longest consecutive streak for a triber ---
    // "Consecutive" means they entered every year the race was held with no gaps.
    function longestConsecutiveStreak(yearMap) {
        const enteredYearSet = new Set(Object.keys(yearMap).map(Number));
        let best = { start: 0, end: 0, length: 0 };
        let i = 0;

        while (i < allRaceYears.length) {
            if (!enteredYearSet.has(allRaceYears[i])) {
                i++;
                continue;
            }
            // Walk forward while consecutive race years are all entered
            let j = i;
            while (j < allRaceYears.length && enteredYearSet.has(allRaceYears[j])) {
                j++;
            }
            const streakLen = j - i;
            if (streakLen > best.length) {
                best = { start: allRaceYears[i], end: allRaceYears[j - 1], length: streakLen };
            }
            i = j;
        }
        return best;
    }

    // --- Compute streaks for all tribers ---
    const results = [];

    Object.entries(triberYears).forEach(([name, yearMap]) => {
        const streak = longestConsecutiveStreak(yearMap);
        if (streak.length < 2) return; // skip tribers with no real streak

        // Count finishes and DNFs within the streak window
        let finishes = 0;
        let dnfs = 0;
        for (let y = streak.start; y <= streak.end; y++) {
            const yd = yearMap[y];
            if (yd) {
                finishes += yd.finished;
                dnfs += (yd.entered - yd.finished);
            }
        }

        results.push({
            name,
            streak: streak.length,
            start: streak.start,
            end: streak.end,
            finishes,
            dnfs
        });
    });

    // Sort by streak length descending, break ties by most finishes
    results.sort((a, b) => b.streak - a.streak || b.finishes - a.finishes);

    // --- Render top 10 ---
    const container = document.getElementById('consecutiveStreaks');
    const top10 = results.slice(0, 10);

    if (top10.length === 0) {
        container.innerHTML = '<p>No data found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('search-results-table');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['#', 'Triber', 'Consecutive Entries', 'Successful', 'DNF', 'Years'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    top10.forEach((r, idx) => {
        const row = document.createElement('tr');

        const rank = document.createElement('td');
        rank.textContent = idx + 1;

        const name = document.createElement('td');
        name.textContent = r.name;

        const streakCell = document.createElement('td');
        streakCell.textContent = r.streak + ' consecutive attempt' + (r.streak !== 1 ? 's' : '');

        const finishCell = document.createElement('td');
        finishCell.textContent = r.finishes + ' successful';

        const dnfCell = document.createElement('td');
        dnfCell.textContent = r.dnfs + ' DNF';

        const yearsCell = document.createElement('td');
        yearsCell.textContent = r.start + ' to ' + r.end;

        [rank, name, streakCell, finishCell, dnfCell, yearsCell].forEach(td => row.appendChild(td));
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);
});
