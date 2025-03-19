// Overall record times for each checkpoint (the fastest time of any class)
const overallRecordTimes = {
  cp1: 4.13, // hours
  cp2: 7.42,
  cp3: 6.47,
  cp4: 3.93
};

// New structure for overall (top) records
const topRecords = {
  overall: { year: 2010, captain: "Bumpy" },
  cp1: { year: 2020, captain: "Bumpy" },
  cp2: { year: 2020, captain: "Chaos" },
  cp3: { year: 2008, captain: "Lumpy" },
  cp4: { year: 2025, captain: "Gamera" }
};

// Distances between checkpoints in nautical miles (nm)
const distances = {
  startToCp1: 53,
  cp1ToCp2: 91,
  cp2ToCp3: 59,
  cp3ToFinish: 30
};

// Adjusting checkpoints to match racedata.js structure
const checkpoints = {
  cp1: 'cp1',
  cp2: 'cp2',
  cp3: 'cp3',
  cp4: 'finish' // Use 'finish' for CP4's time
};

function calculateClassRecords() {
  const classRecords = {};
  for (let i = 1; i <= 5; i++) {
    classRecords[`Class ${i}`] = {
      cp1: { time: Infinity, speed: 0, speedMph: 0, year: '', crew: '', boat: '' },
      cp2: { time: Infinity, speed: 0, speedMph: 0, year: '', crew: '', boat: '' },
      cp3: { time: Infinity, speed: 0, speedMph: 0, year: '', crew: '', boat: '' },
      cp4: { time: Infinity, speed: 0, speedMph: 0, year: '', crew: '', boat: '' }
    };
  }

  racedata.forEach(entry => {
    const classNumber = `Class ${entry['C#'].replace('C', '')}`;
    if (classRecords[classNumber]) {
      Object.entries(checkpoints).forEach(([cp, racedataCp]) => {
        const time = parseFloat(entry[racedataCp]);
        if (time && time >= overallRecordTimes[cp] && time < classRecords[classNumber][cp].time) {
          // Correctly construct the distance key based on the checkpoint
          let distanceKey = '';
          switch (cp) {
            case 'cp1':
              distanceKey = 'startToCp1';
              break;
            case 'cp2':
              distanceKey = 'cp1ToCp2';
              break;
            case 'cp3':
              distanceKey = 'cp2ToCp3';
              break;
            case 'cp4':
              distanceKey = 'cp3ToFinish';
              break;
          }
          const speedKts = distances[distanceKey] / time;
          classRecords[classNumber][cp] = {
            time: time,
            speed: speedKts.toFixed(2),
            speedMph: knotsToMph(speedKts),
            year: entry.YEAR,
            crew: entry["Captain wt name"] + (entry["Crew wt name"] ? ', ' + entry["Crew wt name"] : ''),
            boat: entry.BOAT
          };
        }
      });
    }
  });

  return classRecords;
}

function findRecordEntryByTopRecords(recordInfo) {
  // Make sure to compare both values as strings and trim spaces for a safer match.
  // Also, allow for partial matches in captain's name to account for any discrepancies.
  return racedata.find(entry => 
    entry.YEAR.toString() === recordInfo.year.toString() && 
    entry["Captain wt name"].toLowerCase().trim().includes(recordInfo.captain.toLowerCase().trim())
  );
}


function displayRecords() {
  const classRecords = calculateClassRecords();
  const totalDistance = distances.startToCp1 + distances.cp1ToCp2 + distances.cp2ToCp3 + distances.cp3ToFinish;
  const recordsContainer = document.getElementById('recordsContainer');
  recordsContainer.innerHTML = '';

  const table = document.createElement('table');
  table.classList.add('search-results-table');

  // Overall Records Section
  const overallTitleRow = table.insertRow();
  overallTitleRow.classList.add('titleRow');
  overallTitleRow.innerHTML = `<th colspan='9'>Overall Records</th>`;

  // Insert labels for overall records including real names
  const labelsRow = table.insertRow();
  labelsRow.innerHTML = `<th>CP</th><th>Year</th><th>Tribe Names</th><th>Names</th><th>Boat</th><th>Record (hrs)</th><th>(D:H:M)</th><th>Avg. kts</th><th>Avg. mph</th>`;

  // Process and display each top record
  Object.entries(topRecords).forEach(([key, recordInfo]) => {
    const recordEntry = findRecordEntryByTopRecords(recordInfo);
    if (recordEntry) {
      let time;
      let distanceUsedForSpeed;
      let speedKts;
      let speedMph;
  
      if (key === 'overall') {
        time = parseFloat(recordEntry["Total (hrs)"]);
        distanceUsedForSpeed = totalDistance;
      } else {
        time = parseFloat(recordEntry[checkpoints[key]]);
        // Correctly map the key to the distances for CP1 to CP4
        switch(key) {
          case 'cp1':
            distanceUsedForSpeed = distances.startToCp1;
            break;
          case 'cp2':
            distanceUsedForSpeed = distances.cp1ToCp2;
            break;
          case 'cp3':
            distanceUsedForSpeed = distances.cp2ToCp3;
            break;
          case 'cp4':
            distanceUsedForSpeed = distances.cp3ToFinish;
            break;
          default:
            distanceUsedForSpeed = 0; // Default case to prevent undefined behavior
        }
      }
  
      if (distanceUsedForSpeed > 0 && time > 0) {
        speedKts = (distanceUsedForSpeed / time).toFixed(2);
        speedMph = knotsToMph(parseFloat(speedKts)).toFixed(2);
      } else {
        speedKts = "N/A";
        speedMph = "N/A";
      }
  
      const crew = recordEntry["Crew wt name"] ? `${recordEntry["Captain wt name"]}, ${recordEntry["Crew wt name"]}` : recordEntry["Captain wt name"];
      const realNames = recordEntry["Given Name/s"];
  
      const row = table.insertRow();
      row.innerHTML = `<td>${key.toUpperCase()}</td><td>${recordEntry.YEAR}</td><td>${crew}</td><td>${realNames}</td><td>${recordEntry.BOAT}</td><td>${time.toFixed(2)}</td><td>${formatTimeDHM(time)}</td><td>${speedKts}</td><td>${speedMph}</td>`;
    }
  });
  


// ENTRIES FOR CLASS
Object.keys(classRecords).forEach(className => {
  const classRow = table.insertRow();
  classRow.classList.add('titleRow');
  classRow.innerHTML = `<th colspan='9'>${className} Records</th>`;

  // Updated header row to include "Real Names"
  const headerRow = table.insertRow();
  headerRow.innerHTML = `<td><strong>CP</strong></td><td><strong>Year</strong></td><td><strong>Crew</strong></td><td><strong>Real Names</strong></td><td><strong>Boat</strong></td><td><strong>Record (hrs)</strong></td><td><strong>(D:H:M)</strong></td><td><strong>Avg. kts</strong></td><td><strong>Avg. mph</strong></td>`;

  // Overall record for each class
  const overallClassRecord = racedata.filter(entry => entry["C#"] === className.replace("Class ", "C") && !isNaN(parseFloat(entry["Total (hrs)"]))).sort((a, b) => parseFloat(a["Total (hrs)"]) - parseFloat(b["Total (hrs)"]))[0];
  if (overallClassRecord) {
    const overallTime = parseFloat(overallClassRecord["Total (hrs)"]);
    const speedKts = (totalDistance / overallTime).toFixed(2);
    const speedMph = knotsToMph(speedKts);
    const crew = `${overallClassRecord["Captain wt name"]}${overallClassRecord["Crew wt name"] ? ', ' + overallClassRecord["Crew wt name"] : ''}`;
    const realNames = overallClassRecord["Given Name/s"] || "";

    const overallRow = table.insertRow();
    overallRow.innerHTML = `<td>Overall</td><td>${overallClassRecord.YEAR}</td><td>${crew}</td><td>${realNames}</td><td>${overallClassRecord.BOAT}</td><td>${overallTime}</td><td>${formatTimeDHM(overallTime)}</td><td>${speedKts}</td><td>${speedMph}</td>`;
  }

  // Individual checkpoint records for each class
  Object.entries(classRecords[className]).forEach(([cp, record]) => {
    const recordEntry = racedata.find(entry => entry.YEAR === record.year && (entry["Captain wt name"] === record.crew.split(',')[0].trim() || entry["Crew wt name"] === record.crew.split(',')[1]?.trim()));
    const realNames = recordEntry ? recordEntry["Given Name/s"] || "" : "";
    const row = table.insertRow();
    row.innerHTML = `<td>${cp.toUpperCase()}</td><td>${record.year || "N/A"}</td><td>${record.crew || "N/A"}</td><td>${realNames}</td><td>${record.boat || "N/A"}</td><td>${record.time !== Infinity ? record.time.toFixed(2) : "N/A"}</td><td>${record.time !== Infinity ? formatTimeDHM(record.time) : "N/A"}</td><td>${record.speed || "N/A"}</td><td>${record.speedMph || "N/A"}</td>`;
  });

  // Separator between classes
  const emptyRow = table.insertRow();
  emptyRow.insertCell().outerHTML = "<td colspan='9' style='height:10px;'></td>";
});


  recordsContainer.appendChild(table);
}

document.addEventListener('DOMContentLoaded', displayRecords);


function formatTimeDHM(hours) {
  const days = Math.floor(hours / 24);
  const remainderHours = hours % 24;
  const minutes = Math.floor((remainderHours - Math.floor(remainderHours)) * 60);
  return `${days}d ${Math.floor(remainderHours)}h ${minutes}m`;
}

// Function to calculate average speed in knots and convert it to MPH
function knotsToMph(knots) {
  return parseFloat((knots * 1.15078).toFixed(2)); // Convert to float for further manipulation
}


// Ensure the function displayRecords is called when the document content is fully loaded
document.addEventListener('DOMContentLoaded', displayRecords);
