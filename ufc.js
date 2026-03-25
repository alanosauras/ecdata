document.addEventListener('DOMContentLoaded', function () {

    // Populate year filter
    const years = [...new Set(ufcracedata.map(e => e.YEAR))].sort((a, b) => b - a);
    const yearFilter = document.getElementById('ufcYearFilter');
    years.forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        yearFilter.appendChild(opt);
    });

    yearFilter.addEventListener('change', renderTable);
    renderTable();

    function renderTable() {
        const selectedYear = yearFilter.value;
        let data = selectedYear === 'ALL'
            ? [...ufcracedata]
            : ufcracedata.filter(e => e.YEAR.toString() === selectedYear);

        // Sort: finishers by total time first, DNFs at bottom
        data.sort((a, b) => {
            const aFinished = isValidTime(a['Total (hrs)']);
            const bFinished = isValidTime(b['Total (hrs)']);
            if (aFinished && bFinished) return a['Total (hrs)'] - b['Total (hrs)'];
            if (aFinished) return -1;
            if (bFinished) return 1;
            return 0;
        });

        const container = document.getElementById('ufcresults');
        container.innerHTML = '';

        if (!data.length) {
            container.innerHTML = '<p>No results found.</p>';
            return;
        }

        const finishers = data.filter(e => isValidTime(e['Total (hrs)']));
        const dnfs = data.filter(e => !isValidTime(e['Total (hrs)']));
        const s1Finishes = data.filter(e => isValidTime(e['S1'])).length;

        const summary = document.createElement('p');
        summary.innerHTML = `${data.length} UFC entries. ${finishers.length} full finishers. ${s1Finishes} completed Stage 1 (EC equivalent).`;
        container.appendChild(summary);

        const table = document.createElement('table');
        table.classList.add('search-results-table');

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['#', 'Year', 'Triber/s', 'Class', 'Group', 'Boat', 'S1', 'S2', 'S3', 'S4', 'Total (hrs)', 'D:H:M'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        data.forEach((entry, idx) => {
            const row = document.createElement('tr');
            const tribers = [entry['Captain wt name'], entry['Crew wt name'], entry['3rd wt name']]
                .filter(n => n && n.trim())
                .join(' and ');

            const values = [
                idx + 1,
                entry['YEAR'],
                tribers,
                entry['C#'],
                entry['Group/Gender'],
                entry['BOAT'],
                formatTime(entry['S1']),
                formatTime(entry['S2']),
                formatTime(entry['S3']),
                formatTime(entry['S4']),
                formatTime(entry['Total (hrs)']),
                isValidTime(entry['Total (hrs)']) ? convertHoursToDHM(entry['Total (hrs)']) : 'DNF',
            ];

            values.forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;
                row.appendChild(td);
            });

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        container.appendChild(table);
    }

    function isValidTime(val) {
        return val !== null && val !== undefined && val !== '' && val !== 'DNF' && !isNaN(val) && val > 0;
    }

    function formatTime(val) {
        return isValidTime(val) ? val : 'DNF';
    }

    function convertHoursToDHM(totalHours) {
        const hours = Number(totalHours);
        const days = Math.floor(hours / 24);
        const remainderHours = hours % 24;
        const minutes = Math.floor((remainderHours - Math.floor(remainderHours)) * 60);
        return `${days}d ${Math.floor(remainderHours)}h ${minutes}m`;
    }
});
