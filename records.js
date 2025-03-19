// ✅ Function to format time into Days, Hours, and Minutes
function formatTimeDHM(hours) {
  const days = Math.floor(hours / 24);
  const remainderHours = Math.floor(hours % 24);
  const minutes = Math.floor((hours % 1) * 60);
  return `${days}d ${remainderHours}h ${minutes}m`;
}

// ✅ Overall record times for each checkpoint (manually set)
const overallRecordTimes = {
cp1: 4.13, // hours
cp2: 7.42,
cp3: 6.47,
cp4: 3.93
};

// ✅ Manually set overall records (not affected by exclusions)
const topRecords = {
overall: { year: 2010, captain: "Bumpy" },
cp1: { year: 2020, captain: "Bumpy" },
cp2: { year: 2020, captain: "Chaos" },
cp3: { year: 2008, captain: "Lumpy" },
cp4: { year: 2025, captain: "Gamera" }
};

// ✅ Distances between checkpoints in nautical miles
const distances = {
startToCp1: 53,
cp1ToCp2: 91,
cp2ToCp3: 59,
cp3ToFinish: 30
};

// ✅ Adjusting checkpoints to match `racedata.js` structure
const checkpoints = {
cp1: 'cp1',
cp2: 'cp2',
cp3: 'cp3',
cp4: 'finish' // Use 'finish' for CP4's time
};

// ✅ Function to calculate class records, including "Given Name/s"
function calculateClassRecords() {
const classRecords = {};
const overallClassRecords = {}; // Stores the fastest total time for each class

for (let i = 1; i <= 5; i++) {
  classRecords[`Class ${i}`] = {
    cp1: { time: Infinity, year: '', crew: '', names: '', boat: '' },
    cp2: { time: Infinity, year: '', crew: '', names: '', boat: '' },
    cp3: { time: Infinity, year: '', crew: '', names: '', boat: '' },
    cp4: { time: Infinity, year: '', crew: '', names: '', boat: '' }
  };
  overallClassRecords[`Class ${i}`] = { time: Infinity, year: '', crew: '', names: '', boat: '' };
}

racedata.forEach(entry => {
  const classNumber = `Class ${entry['C#'].replace('C', '')}`;

  // ✅ Exclude specific bad data points
  const entryKey = `${entry.YEAR}, ${entry["Captain wt name"]}`;
  if (excludedEntries.includes(entryKey)) return;

  if (classRecords[classNumber]) {
    // ✅ Find the fastest class checkpoint records
    Object.entries(checkpoints).forEach(([cp, racedataCp]) => {
      const time = parseFloat(entry[racedataCp]);

      if (time && time >= overallRecordTimes[cp] && time < classRecords[classNumber][cp].time) {
        classRecords[classNumber][cp] = {
          time: time,
          year: entry.YEAR,
          crew: entry["Captain wt name"] + (entry["Crew wt name"] ? ', ' + entry["Crew wt name"] : ''),
          names: entry["Given Name/s"] ? entry["Given Name/s"] : "N/A",
          boat: entry.BOAT
        };
      }
    });

    // ✅ Find the overall fastest total time per class
    const totalTime = parseFloat(entry["Total (hrs)"]);
    if (totalTime && totalTime < overallClassRecords[classNumber].time) {
      overallClassRecords[classNumber] = {
        time: totalTime,
        year: entry.YEAR,
        crew: entry["Captain wt name"] + (entry["Crew wt name"] ? ', ' + entry["Crew wt name"] : ''),
        names: entry["Given Name/s"] ? entry["Given Name/s"] : "N/A",
        boat: entry.BOAT
      };
    }
  }
});

return { classRecords, overallClassRecords };
}

// ✅ Finds overall records using manually set values
function findRecordEntryByTopRecords(recordInfo) {
return racedata.find(entry =>
  entry.YEAR.toString() === recordInfo.year.toString() &&
  entry["Captain wt name"].toLowerCase().trim().includes(recordInfo.captain.toLowerCase().trim())
);
}

// ✅ Displays the records table
function displayRecords() {
const { classRecords, overallClassRecords } = calculateClassRecords();
const recordsContainer = document.getElementById('recordsContainer');
recordsContainer.innerHTML = '';

const table = document.createElement('table');
table.classList.add('search-results-table');

// ✅ Overall Records Section (not filtered)
const overallTitleRow = table.insertRow();
overallTitleRow.classList.add('titleRow');
overallTitleRow.innerHTML = `<th colspan='9'>Overall Records</th>`;

const labelsRow = table.insertRow();
labelsRow.innerHTML = `<th>CP</th><th>Year</th><th>Tribe Names</th><th>Names</th><th>Boat</th><th>Record (hrs)</th><th>(D:H:M)</th><th>Avg. kts</th><th>Avg. mph</th>`;

Object.entries(topRecords).forEach(([key, recordInfo]) => {
  const recordEntry = findRecordEntryByTopRecords(recordInfo);
  if (recordEntry) {
    let time = parseFloat(recordEntry[key === 'overall' ? "Total (hrs)" : checkpoints[key]]);
    const row = table.insertRow();
    row.innerHTML = `<td>${key.toUpperCase()}</td><td>${recordEntry.YEAR}</td><td>${recordEntry["Captain wt name"]}</td><td>${recordEntry["Given Name/s"]}</td><td>${recordEntry.BOAT}</td><td>${time.toFixed(2)}</td><td>${formatTimeDHM(time)}</td><td>N/A</td><td>N/A</td>`;
  }
});

// ✅ Class Records (filtered with exclusions)
Object.keys(classRecords).forEach(className => {
  const classRow = table.insertRow();
  classRow.classList.add('titleRow');
  classRow.innerHTML = `<th colspan='9'>${className} Records</th>`;

  const headerRow = table.insertRow();
  headerRow.innerHTML = `<td><strong>CP</strong></td><td><strong>Year</strong></td><td><strong>Crew</strong></td><td><strong>Real Names</strong></td><td><strong>Boat</strong></td><td><strong>Record (hrs)</strong></td><td><strong>(D:H:M)</strong></td><td><strong>Avg. kts</strong></td><td><strong>Avg. mph</strong></td>`;

  // ✅ Insert the fastest total time per class
  const overallRecord = overallClassRecords[className];
  const overallRow = table.insertRow();
  overallRow.innerHTML = `<td>Overall</td><td>${overallRecord.year || "N/A"}</td><td>${overallRecord.crew || "N/A"}</td><td>${overallRecord.names || "N/A"}</td><td>${overallRecord.boat || "N/A"}</td><td>${overallRecord.time !== Infinity ? overallRecord.time.toFixed(2) : "N/A"}</td><td>${overallRecord.time !== Infinity ? formatTimeDHM(overallRecord.time) : "N/A"}</td><td>N/A</td><td>N/A</td>`;

  // ✅ Insert individual checkpoint records for the class
  Object.entries(classRecords[className]).forEach(([cp, record]) => {
    const row = table.insertRow();
    row.innerHTML = `<td>${cp.toUpperCase()}</td><td>${record.year || "N/A"}</td><td>${record.crew || "N/A"}</td><td>${record.names || "N/A"}</td><td>${record.boat || "N/A"}</td><td>${record.time !== Infinity ? record.time.toFixed(2) : "N/A"}</td><td>${record.time !== Infinity ? formatTimeDHM(record.time) : "N/A"}</td><td>N/A</td><td>N/A</td>`;
  });

  table.insertRow().insertCell().outerHTML = "<td colspan='9' style='height:10px;'></td>";
});

recordsContainer.appendChild(table);
}

// ✅ Ensure function loads before page content
document.addEventListener('DOMContentLoaded', displayRecords);
