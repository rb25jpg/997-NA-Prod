document.addEventListener('DOMContentLoaded', function() {
    fetch('997three.csv')
        .then(response => response.text())
        .then(preprocessData)
        .then(() => {
            updateSelectOptions('initial');
            document.getElementById("generation").addEventListener("change", () => updateSelectOptions('generation'));
            document.getElementById("trim-level").addEventListener("change", () => updateSelectOptions('trim'));
            document.getElementById("color").addEventListener("change", () => filterProduction());
        })
        .catch(error => console.error('Error loading CSV data:', error));
});

let availabilityMap = {};

// Color Display Box on website
document.getElementById('color').addEventListener('change', function() {
    var hexCode = this.options[this.selectedIndex].dataset.hex;
    document.getElementById('color-display').style.backgroundColor = hexCode;
});
document.getElementById('generation').addEventListener('change', function() {
    document.getElementById('color-display').style.backgroundColor = null; // Or any default color
});

document.getElementById('trim-level').addEventListener('change', function() {
    document.getElementById('color-display').style.backgroundColor = null; // Or any default color
});

document.getElementById('color').addEventListener('change', function() {
    var hexCode = this.options[this.selectedIndex].dataset.hex;
    document.getElementById('color-display').style.backgroundColor = hexCode;
});


function preprocessData(data) {
    var rows = data.split('\n');
    rows.forEach(row => {
        var [generation, trim, color] = row.split(',').slice(0, 3); // Adjust based on your CSV structure
        if (!availabilityMap[generation]) availabilityMap[generation] = {};
        if (!availabilityMap[generation][trim]) availabilityMap[generation][trim] = {};
        availabilityMap[generation][trim][color] = true;
    });
}

function updateSelectOptions(triggeredBy) {
    const generationSelect = document.getElementById("generation");
    const trimSelect = document.getElementById("trim-level");
    const colorSelect = document.getElementById("color");

    const generation = generationSelect.value;
    const trim = trimSelect.value;

    if (triggeredBy === 'generation') {
        resetSelect(trimSelect);
        updateOptions(trimSelect, Object.keys(availabilityMap[generation] || {}));
        resetSelect(colorSelect);
    } else if (triggeredBy === 'trim') {
        resetSelect(colorSelect);
    }

    if (triggeredBy !== 'color') {
        const trimColors = availabilityMap[generation] && availabilityMap[generation][trim] ? Object.keys(availabilityMap[generation][trim]) : [];
        updateOptions(colorSelect, trimColors);
    }

    if (triggeredBy !== 'initial') {
        filterProduction();
    }
}

function resetSelect(selectElement) {
    selectElement.selectedIndex = 0;
    Array.from(selectElement.options).forEach(option => {
        option.disabled = false;
        option.style.color = null; // Reset color to default
    });
}

function updateOptions(selectElement, validOptions) {
    Array.from(selectElement.options).forEach(option => {
        if (option.value === "") {
            option.disabled = false; // Ensure the placeholder option is always enabled
        } else {
            const isValid = validOptions.includes(option.value);
            option.disabled = !isValid;
            option.style.color = isValid ? null : 'gray'; // Gray out invalid options
        }
    });
}

function filterProduction() {
    var trimLevel = document.getElementById("trim-level").value;
    var color = document.getElementById("color").value;
    var generation = document.getElementById("generation").value;

    // Fetch production numbers from CSV file
    fetch('997three.csv')
    .then(response => response.text())
    .then(data => {
        // Parse CSV data
        var rows = data.split('\n');
        var productionNumbers = [];

        // Filter production numbers based on trim level, color, and generation
        rows.forEach(row => {
            var columns = row.split(',');
            if (columns[1] === trimLevel && columns[2] === color && columns[0] === generation) {
                productionNumbers.push(columns[3]);
            }
        });

        // Display filtered production numbers
        displayProductionNumbers(productionNumbers);
    })
    .catch(error => {
        console.error('Error fetching production numbers:', error);
    });
}

function displayProductionNumbers(numbers) {
        var resultsDiv = document.getElementById("production-results");
        resultsDiv.innerHTML = "";  // Clear existing content
    
        if (numbers.length > 0) {
            numbers.forEach(number => {
                resultsDiv.innerHTML += "<p>" + number + " produced";
            });
        } else {
            resultsDiv.innerHTML += "<p>No production numbers found.</p>";
        }
}

// Change backround image based on trim
const backgroundImages = {
    "997.1 GT3": "url('EXP 997/997.1-gt3.jpg')",
    "997.1 GT3RS": "url('997.1-gt3rs.webp')",
    "997.2 GT3": "url('997.2-gt3.jpg')",
    "997.2 GT3RS": "url('997.2-gt3rs.jpg')",
    "997.2 GT3RS4.0": "url('997.2-gt3rs4.0.jpg')",
    "997.2 Speedster": "url('997.2-speedster.jpg')",
};

function updateBackgroundImage() {
    const generation = document.getElementById('generation').value;
    const trim = document.getElementById('trim-level').value;
    const key = `${generation} ${trim}`;
    const imageUrl = backgroundImages[key];
    console.log({ generation, trim, key, imageUrl }); // Debug output

    if (imageUrl) {
        document.body.style.backgroundImage = imageUrl;
    } else {
        console.log('No matching image found for this selection');
    }
}

document.getElementById('generation').addEventListener('change', updateBackgroundImage);
document.getElementById('trim-level').addEventListener('change', updateBackgroundImage);

