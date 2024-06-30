let canvas; //References the <canvas> element in the HTML
let ctx; //The 2D drawing context for the canvas, used for rendering
let horizSquares = 200; // Increased resolution
let vertSquares = 200; // Increased resolution
let speed = 100;
let startTime = Date.now() / 1000;
let elapsedTime = 0;
let ampl1Slider;
let wavelen1Slider;
let shift1Slider;
let ampl2Slider;
let wavelen2Slider;
let shift2Slider;
let amplMatch;
let lenMatch;
let shiftMatch;
let timerDisplay;
let startTimerButton;
let stopTimerButton;
let resetTimerButton;
let timerInterval;
let timerElapsed = 0;
let xCoordinateInput;
let yCoordinateInput;
let startWavesButton;
let stopWavesButton;
let resetWavesButton;
let animationFrameId;

function distance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
}

function Sound() {
    this.x;
    this.y;
    this.ampl;
    this.freq;
    this._wavelen;
    this.getWavelen = () => this._wavelen;
    this.setWavelen = (value) => {
        this._wavelen = value;
        this.freq = speed / this._wavelen;
    }
    this.shift;
    this.pressure = (pos) => {
        let dist = distance(this, pos);
        return this.ampl * Math.sin(this.shift + 2 * Math.PI * (dist / this.getWavelen() - elapsedTime * this.freq));
    }
}

let source1;
let source2;

function setupTopSliders() {
    let ampl1Change = () => {
        source1.ampl = Number.parseFloat(ampl1Slider.value);
        if (amplMatch.checked) {
            source2.ampl = source1.ampl;
            ampl2Slider.value = source1.ampl;
        }
    }
    ampl1Change();
    ampl1Slider.addEventListener("input", ampl1Change);

    let wavelen1Change = () => {
        source1.setWavelen(Number.parseFloat(wavelen1Slider.value));
        if (lenMatch.checked) {
            source2.setWavelen(source1.getWavelen());
            wavelen2Slider.value = source1.getWavelen();
        }
    }
    wavelen1Change();
    wavelen1Slider.addEventListener("change", wavelen1Change);

    let shift1Change = () => {
        source1.shift = Number.parseFloat(shift1Slider.value);
        if (shiftMatch.checked) {
            source2.shift = source1.shift;
            shift2Slider.value = source1.shift;
        }
    }
    shift1Change();
    shift1Slider.addEventListener("input", shift1Change);
}

function setupBottomSliders() {
    let ampl2Change = () => {
        source2.ampl = Number.parseFloat(ampl2Slider.value);
        if (amplMatch.checked) {
            source1.ampl = source2.ampl;
            ampl1Slider.value = source2.ampl;
        }
    }
    ampl2Change();
    ampl2Slider.addEventListener("input", ampl2Change);

    let wavelen2Change = () => {
        source2.setWavelen(Number.parseFloat(wavelen2Slider.value));
        if (lenMatch.checked) {
            source1.setWavelen(source2.getWavelen());
            wavelen1Slider.value = source2.getWavelen();
        }
    }
    wavelen2Change();
    wavelen2Slider.addEventListener("change", wavelen2Change);

    let shift2Change = () => {
        source2.shift = Number.parseFloat(shift2Slider.value);
        if (shiftMatch.checked) {
            source1.shift = source2.shift;
            shift1Slider.value = source2.shift;
        }
    }
    shift2Change();
    shift2Slider.addEventListener("input", shift2Change);
}

function setupSettingsSliders() {
    let distSlider = document.getElementById("distance");
    let distChange = () => {
        let v = Number.parseFloat(distSlider.value);
        source1.y = (1 - v) / 2 * canvas.height;
        source2.y = canvas.height - (1 - v) / 2 * canvas.height;
    }
    distChange();
    distSlider.addEventListener("input", distChange);

    let speedSlider = document.getElementById("speed");
    let speedChange = () => {
        speed = Number.parseFloat(speedSlider.value);
        source1.freq = speed / source1.getWavelen();
        source2.freq = speed / source2.getWavelen();
    }
    speedChange();
    speedSlider.addEventListener("change", speedChange);
}

function setupSliders() {
    setupSettingsSliders();
    setupBottomSliders();
    setupTopSliders();
}

function setupCheckBoxes() {
    let amplLockChange = () => {
        if (amplMatch.checked) {
            source2.ampl = source1.ampl;
            ampl2Slider.value = ampl1Slider.value;
        }
    }
    amplLockChange();
    amplMatch.addEventListener("click", amplLockChange);

    let lenLockChange = () => {
        if (lenMatch.checked) {
            source2.setWavelen(source1.getWavelen());
            wavelen2Slider.value = wavelen1Slider.value;
        }
    }
    lenLockChange();
    lenMatch.addEventListener("click", lenLockChange);

    let shiftLockChange = () => {
        if (shiftMatch.checked) {
            source2.shift = source1.shift;
            shift2Slider.value = shift1Slider.value;
        }
    }
    shiftLockChange();
    shiftMatch.addEventListener("click", shiftLockChange);
}

function setupTimer() {
    timerDisplay = document.getElementById("timerDisplay");
    startTimerButton = document.getElementById("startTimerButton");
    stopTimerButton = document.getElementById("stopTimerButton");
    resetTimerButton = document.getElementById("resetTimerButton");
    startTimerButton.addEventListener("click", startTimer);
    stopTimerButton.addEventListener("click", stopTimer);
    resetTimerButton.addEventListener("click", resetTimer);
}

function setupWaveButtons() {
    startWavesButton = document.getElementById("startWavesButton");
    stopWavesButton = document.getElementById("stopWavesButton");
    resetWavesButton = document.getElementById("resetWavesButton");
    startWavesButton.addEventListener("click", startWaves);
    stopWavesButton.addEventListener("click", stopWaves);
    resetWavesButton.addEventListener("click", resetWaves);
}

function startWaves() {
    startTime = Date.now() / 1000 - elapsedTime; // Adjust startTime to account for elapsed time
    if (!animationFrameId) {
        requestAnimationFrame(update);
    }
}

function stopWaves() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        elapsedTime = Date.now() / 1000 - startTime; // Calculate elapsed time
    }
}

function resetWaves() {
    stopWaves();
    elapsedTime = 0; // Reset elapsed time
    startTime = Date.now() / 1000;
    draw();
}

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            timerElapsed++;
            timerDisplay.textContent = formatTime(timerElapsed);
        }, 1000);
    }
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerElapsed = 0;
    timerDisplay.textContent = formatTime(timerElapsed);
}

function formatTime(seconds) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}

function updateSquareCounts(horizCount) {
    horizSquares = horizCount;
    vertSquares = horizCount * canvas.height / canvas.width;
}

document.addEventListener("DOMContentLoaded", function() {
    canvas = document.getElementById("ctx");
    ctx = canvas.getContext("2d");
    if (window.innerWidth <= 767) {
        canvas.width = window.innerWidth * 2;
    } else {
        canvas.width = window.innerWidth * 0.75;
    }
    canvas.height = window.innerHeight;
    vertSquares = horizSquares * canvas.height / canvas.width;
    source1 = new Sound();
    source1.x = canvas.width * 1 / 8; // Moved to the far left
    source2 = new Sound();
    source2.x = canvas.width * 1 / 8; // Moved to the far left
    ampl1Slider = document.getElementById("ampl1");
    wavelen1Slider = document.getElementById("wavelen1");
    shift1Slider = document.getElementById("shift1");
    ampl2Slider = document.getElementById("ampl2");
    wavelen2Slider = document.getElementById("wavelen2");
    shift2Slider = document.getElementById("shift2");
    amplMatch = document.getElementById("match_ampl");
    lenMatch = document.getElementById("match_len");
    shiftMatch = document.getElementById("match_shift");
    
    // Initialize coordinate input boxes
    xCoordinateInput = document.getElementById("x-coordinate");
    yCoordinateInput = document.getElementById("y-coordinate");

    setupSliders();
    setupCheckBoxes();
    setupTimer();
    setupWaveButtons();

    // Add click event listener to display coordinates
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        displayCoordinates(x, y);
    });

    draw(); // Initial draw to show the wave sources and grid
});

function gradient(p) {
    let c = 255 * (p + (source1.ampl + source2.ampl) / 2) / (source1.ampl + source2.ampl);
    c = Math.round(c);
    c = Math.min(255, c);
    c = Math.max(0, c);
    return `rgb(${c}, ${c}, ${c})`;
}

function draw() {
    let cellWidth = canvas.width / horizSquares;
    let cellHeight = canvas.height / vertSquares;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing
    ctx.imageSmoothingEnabled = true; // Enable image smoothing
    for (let i = 0; i < horizSquares; i++) {
        for (let j = 0; j < vertSquares; j++) {
            let x = i / horizSquares * canvas.width;
            let y = j / vertSquares * canvas.height;
            let pos = {
                x: x + canvas.width / (2 * horizSquares),
                y: y + canvas.height / (2 * vertSquares)
            };
            let p = source1.pressure(pos);
            p += source2.pressure(pos);
            ctx.fillStyle = gradient(p);
            ctx.fillRect(Math.floor(x), Math.floor(y), cellWidth, cellHeight);
        }
    }
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(source1.x, source1.y, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(source2.x, source2.y, 10, 0, 2 * Math.PI);
    ctx.fill();
}

function displayCoordinates(x, y) {
    draw(); // Redraw the canvas to clear previous coordinate texts
    ctx.fillStyle = "red";
    ctx.font = "16px Arial";
    const cmX = (x / canvas.width) * 100;
    const cmY = (y / canvas.height) * 100;
    ctx.fillText(`(${cmX.toFixed(1)} cm, ${cmY.toFixed(1)} cm)`, x + 5, y - 5);

    // Update the input boxes
    xCoordinateInput.value = cmX.toFixed(1);
    yCoordinateInput.value = cmY.toFixed(1);
}

function update() {
    elapsedTime = Date.now() / 1000 - startTime;
    draw();
    animationFrameId = requestAnimationFrame(update);
}
