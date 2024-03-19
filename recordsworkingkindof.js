// Overall record times for each checkpoint (the fastest time of any class)
const overallRecordTimes = {
    cp1: 4.13, // hours
    cp2: 7.42,
    cp3: 6.47,
    cp4: 3.98
  };
  
  // Distances between checkpoints in nautical miles (nm)
  const distances = {
    startToCp1: 52.83,
    cp1ToCp2: 91.06,
    cp2ToCp3: 58.74,
    cp3ToFinish: 27.3
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
            const distanceKey = cp === 'cp4' ? 'cp3ToFinish' : `${cp}To${parseInt(cp.replace('cp', '')) + 1}`;
            const speedKts = distances[distanceKey] / time;
            classRecords[classNumber][cp] = {
              time: time,
              speed: speedKts.toFixed(2),
              speedMph: knotsToMph(speedKts),
              year: entry.Year,
              crew: entry["Captain wt name"] + (entry["Crew wt name"] ? ', ' + entry["Crew wt name"] : ''),
              boat: entry.Boat
            };
          }
        });
      }
    });
  
    return classRecords;
  }
  
    
  
  function displayRecords() {
    const classRecords = calculateClassRecords();
    const recordsContainer = document.getElementById('recordsContainer');
    recordsContainer.innerHTML = '';
  
    // Displaying overall records and calculating average speed in mph
    const overallTitle = document.createElement('h2');
    overallTitle.textContent = 'Overall Records';
    recordsContainer.appendChild(overallTitle);
  
    const overallTable = document.createElement('table');
    overallTable.classList.add('search-results-table');
    overallTable.innerHTML = `
    <thead>
    <tr>
        <th>CP</th>
        <th>YEAR</th>
        <th>Crew</th>
        <th>Boat</th>
        <th>Record (hrs)</th>
        <th>(D:H:M)</th>
        <th>Avg. kts</th>
        <th>Avg. mph</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
    `;
  
    Object.keys(overallRecordTimes).forEach(checkpoint => {
      const row = overallTable.insertRow(-1);
      const timeInHours = overallRecordTimes[checkpoint];
      const speedKts = calculateSpeedForCheckpoint(checkpoint, timeInHours);
      row.innerHTML = `
          <td>${checkpoint.toUpperCase()}</td>
          <td>${timeInHours}</td>
          <td>${formatTimeDHM(timeInHours)}</td>
          <td>${speedKts}</td>
          <td>${knotsToMph(parseFloat(speedKts))}</td> <!-- Convert knots to mph -->
      `;
    });
    recordsContainer.appendChild(overallTable);
    recordsContainer.appendChild(document.createElement('hr'));
  
    Object.keys(classRecords).forEach(className => {
      const classTitle = document.createElement('h3');
      classTitle.textContent = `${className} Records`;
      recordsContainer.appendChild(classTitle);
  
      const table = document.createElement('table');
      table.classList.add('search-results-table');
      table.innerHTML = `
      <thead>
      <tr>
          <th>CP</th>
          <th>YEAR</th>
          <th>Crew</th>
          <th>Boat</th>
          <th>Record (hrs)</th>
          <th>(D:H:M)</th>
          <th>Avg. kts</th>
          <th>Avg. mph</th>
      </tr>
  </thead>
  <tbody>
  </tbody>
      `;
  
      Object.keys(classRecords[className]).forEach(checkpoint => {
        const record = classRecords[className][checkpoint];
        const row = table.insertRow(-1);
        row.innerHTML = `
        <td>${checkpoint.toUpperCase()}</td>
        <td>${record.year}</td>
        <td>${record.crew}</td>
        <td>${record.boat}</td>
        <td>${record.time}</td>
        <td>${formatTimeDHM(record.time)}</td>
        <td>${record.speed}</td>
        <td>${record.speedMph.toFixed(2)}</td> <!-- Ensure knotsToMph returns a number for .toFixed to work -->
        `;
      });
      recordsContainer.appendChild(table);
    });
  }
  
  
  function calculateSpeedForCheckpoint(checkpoint, time) {
    // Checkpoint names need to correspond with keys in the distances object
    const distanceMappings = {
      cp1: 'startToCp1',
      cp2: 'cp1ToCp2',
      cp3: 'cp2ToCp3',
      cp4: 'cp3ToFinish'
    };
  
    const distance = distances[distanceMappings[checkpoint]]; // Get the distance for the checkpoint
    if (!distance || !time || time <= 0) {
      return 0; // Prevent division by zero or return 0 if no data
    }
  
    const speed = distance / time; // Calculate speed in knots
    return speed.toFixed(2); // Return speed rounded to 2 decimal places
  }
  
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
  