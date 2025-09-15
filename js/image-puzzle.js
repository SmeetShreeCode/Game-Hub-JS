const container = document.getElementById("puzzle-container");
const shuffleBtn = document.getElementById("shuffle");
const gridSizeSelect = document.getElementById("grid-size");
const imageUpload = document.getElementById("image-upload");

let size = parseInt(gridSizeSelect.value);
let tiles = [];
let imageURL = "images/puzzle.png"; // default image
let moveCount = 0;
let seconds = 0;
let timerInterval;

// Create tiles
function createTiles() {
    tiles = [];
    container.innerHTML = "";
    container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const tile = document.createElement("div");
            const containerSize = container.clientWidth;

            tile.classList.add("tile");
            tile.style.backgroundImage = `url(${imageURL})`;
            tile.style.backgroundPosition =
                `-${(containerSize / size) * col}px -${(containerSize / size) * row}px`;
            tile.style.backgroundSize = `${containerSize}px ${containerSize}px`;
            tile.dataset.order = row * size + col;
            tile.setAttribute("draggable", "true");
            container.appendChild(tile);
            tiles.push(tile);
        }
    }
}

// Shuffle tiles
function shuffleTiles() {
    let shuffled = [...tiles].sort(() => Math.random() - 0.5);
    container.innerHTML = "";
    shuffled.forEach(tile => container.appendChild(tile));
}

function isSolved() {
    const current = [...container.children];
    return current.every((tile, index) => tile.dataset.order == index);
}

function updateMoveCount() {
    moveCount++;
    document.getElementById("moveCount").textContent = moveCount;
}

function startTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        let mins = String(Math.floor(seconds / 60)).padStart(2, "0");
        let secs = String(seconds % 60).padStart(2, "0");
        document.getElementById("timer").textContent = `${mins}:${secs}`;
    }, 1000);
}

// Drag & Drop logic
let draggedTile = null;

container.addEventListener("dragstart", e => {
    if (!e.target.classList.contains("tile")) return;
    draggedTile = e.target;
    draggedTile.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
});

container.addEventListener("dragover", e => {
    e.preventDefault();
    if (!e.target.classList.contains("tile") || e.target === draggedTile) return;
    e.target.classList.add("drag-over");
});

container.addEventListener("dragend", e => {
    if (draggedTile) draggedTile.classList.remove("dragging");
    draggedTile = null;
});

container.addEventListener("dragleave", e => {
    if (e.target.classList.contains("tile")) {
        e.target.classList.remove("drag-over");
    }
});

container.addEventListener("drop", e => {
    e.preventDefault();
    if (!e.target.classList.contains("tile") || e.target === draggedTile) return;

    e.target.classList.remove("drag-over");

    // Swap tiles
    const draggedNext = draggedTile.nextSibling;
    const targetNext = e.target.nextSibling;

    container.insertBefore(draggedTile, targetNext);
    container.insertBefore(e.target, draggedNext);

    updateMoveCount();

    if (isSolved()) {
        checkAndSaveBestScore();
        loadBestScore();
        setTimeout(() => alert("🎉 Puzzle Solved!"), 200);
    }
});

// Handle grid size change
gridSizeSelect.addEventListener("change", () => {
    size = parseInt(gridSizeSelect.value);
    createTiles();
});

// Handle image upload
imageUpload.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            imageURL = evt.target.result;
            createTiles();
        };
        reader.readAsDataURL(file);
    }
});

createTiles();
loadBestScore();

shuffleBtn.addEventListener("click", () => {
    moveCount = 0;
    seconds = 0;
    document.getElementById("moveCount").textContent = "0";
    shuffleTiles();
    startTimer();
});

function restartGame() {
    if (!confirm("Are you sure you want to restart the puzzle?")) return;
    moveCount = 0;
    seconds = 0;
    clearInterval(timerInterval);
    document.getElementById("moveCount").textContent = "0";
    document.getElementById("timer").textContent = "00:00";
    createTiles();
    shuffleTiles();
    startTimer();
}

function checkAndSaveBestScore() {
    const bestMoves = parseInt(localStorage.getItem('bestMoves'));
    const bestTime = parseInt(localStorage.getItem('bestTime'));

    if (!bestMoves || moveCount < bestMoves) {
        localStorage.setItem('bestMoves', moveCount);
    }
    if (!bestTime || seconds < bestTime) {
        localStorage.setItem('bestTime', seconds);
    }
}

function loadBestScore() {
    const bestMoves = localStorage.getItem('bestMoves') || '—';
    const bestTimeRaw = localStorage.getItem('bestTime');
    const bestTime = bestTimeRaw ? `${String(Math.floor(parseInt(bestTimeRaw) / 60)).padStart(2, '0')}:${String(parseInt(bestTimeRaw) % 60).padStart(2, '0')}` : '—';

    document.getElementById('best-score').textContent = `${bestMoves} moves, ${bestTime}`;
}

const darkToggle = document.getElementById("toggle-dark");

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

const themeSelect = document.getElementById('theme-select');

const savedTheme = localStorage.getItem('theme') || 'default';
if(savedTheme !== 'default') {
    document.body.classList.add(savedTheme);
    themeSelect.value = savedTheme;
}

themeSelect.addEventListener('change', () => {
    document.body.classList.remove('dark', 'ocean', 'sunset');
    if (themeSelect.value !== 'default') {
        document.body.classList.add(themeSelect.value);
    }
    localStorage.setItem('theme', themeSelect.value);
});

const imagePreview = document.getElementById('image-preview');

imageUpload.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            imageURL = evt.target.result;
            createTiles();
            imagePreview.src = imageURL;
        };
        reader.readAsDataURL(file);
    }
});
imagePreview.src = imageURL;

// if ('serviceWorker' in navigator && location.protocol !== 'file:') {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('./service-worker.js').then(reg => {
//                 console.log('ServiceWorker registered with scope:', reg.scope);
//             }).catch(err => {
//                 console.error('ServiceWorker registration failed:', err);
//             });
//     });
// } else {
//     console.warn('ServiceWorker not supported on file:// protocol. Use a local server.');
// }