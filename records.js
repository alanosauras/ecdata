var racedata = [
    // Your data objects
  ];

const recordTimes = {
    cp1: 4.13,
    cp2: 7.42,
    cp3: 6.47,
    cp4: 3.98
};


// Example of a comprehensive script for calculating and storing records for each class

// Placeholder for record data
const recordHolders = {
    "Class 1": { "Overall": {}, "CP1": {}, "CP2": {}, "CP3": {}, "CP4": {} },
    "Class 2": { "Overall": {}, "CP1": {}, "CP2": {}, "CP3": {}, "CP4": {} },
    "Class 3": { "Overall": {}, "CP1": {}, "CP2": {}, "CP3": {}, "CP4": {} },
    "Class 4": { "Overall": {}, "CP1": {}, "CP2": {}, "CP3": {}, "CP4": {} },
    "Class 5": { "Overall": {}, "CP1": {}, "CP2": {}, "CP3": {}, "CP4": {} },
    "Class 1 & 2 Combined": { "Overall": {}, "CP1": {}, "CP2": {}, "CP3": {}, "CP4": {} },
};

document.addEventListener('DOMContentLoaded', calculateRecordHolders);


// Function to iterate over racedata and update record holders
function calculateRecordHolders() {
    racedata.forEach(entry => {
        // Dynamically select the correct class container based on entry data
        const classesToCheck = [entry['Class']];
        if (entry['Class'] === "Class 1" || entry['Class'] === "Class 2") {
            classesToCheck.push("Class 1 & 2 Combined");
        }

        classesToCheck.forEach((className) => {
            ["Overall", "CP1", "CP2", "CP3", "CP4"].forEach((checkpoint) => {
                const time = checkpoint === "Overall" ? parseFloat(entry['Total (hrs)']) : parseFloat(entry[checkpoint.toLowerCase()]);
                if (!isNaN(time) && (!recordHolders[className][checkpoint].time || time < recordHolders[className][checkpoint].time)) {
                    recordHolders[className][checkpoint] = {
                        year: entry['YEAR'],
                        tribeNames: entry['Crew wt name'] ? `${entry['Captain wt name']} and ${entry['Crew wt name']}` : entry['Captain wt name'],
                        boat: entry['BOAT'],
                        time: time
                    };
                }
            });
        });
    });
}

// Initial calculation based on racedata
calculateRecordHolders();

// Manual adjustments can be made here, if necessary

// Export or expose recordHolders data for use in records.html
// This step depends on your project setup, for example:
// window.recordHolders = recordHolders; // For direct use in browser
// module.exports = recordHolders; // If using a module system like CommonJS
