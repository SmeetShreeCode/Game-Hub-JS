let container, shuffleBtn, chapterSelect, levelSelect, themeSelect;
let size, tiles = [], imageURL, moveCount = 0, seconds = 0, timerInterval;
let currentChapter = 1;
let currentLevelIndex = 0;
let paused = false;

function initGame() {
    const chapter = chapters[currentChapter];
    if (!chapter || !chapter.selectedLevels || chapter.selectedLevels.length === 0) {
        populateLevels(currentChapter);
    }
    const level = chapters[currentChapter].selectedLevels[currentLevelIndex];
    size = level.size;
    imageURL = level.image;
    moveCount = 0;
    seconds = 0;
    clearInterval(timerInterval);
    updateMoveDisplay();
    updateTimerDisplay();
    hideWinOverlay();
    createTiles();
    shuffleTiles();
    if (!paused) startTimer();
    loadBestScore();
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function createTiles() {
    tiles = [];
    container.innerHTML = "";
    container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    const containerSize = Math.floor(container.getBoundingClientRect().width - 8);
    const tilePx = Math.floor(containerSize / size);

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.setAttribute("draggable", "true");
            tile.dataset.order = row * size + col;
            tile.style.width = "100%";
            tile.style.height = "100%";
            tile.style.backgroundImage = `url(${imageURL})`;
            tile.style.backgroundPosition = `${-col * tilePx - 4}px ${-row * tilePx - 4}px`;
            tile.style.backgroundSize = `${containerSize}px ${containerSize}px`;
            attachTileEvents(tile);
            container.appendChild(tile);
            tiles.push(tile);
        }
    }
}

function attachTileEvents(tile) {
    tile.addEventListener("dragstart", handleDragStart);
    tile.addEventListener("dragover", handleDragOver);
    tile.addEventListener("dragleave", handleDragLeave);
    tile.addEventListener("drop", handleDrop);
    tile.addEventListener("dragend", handleDragEnd);
}

let draggedTile = null;

function handleDragStart(e) {
    draggedTile = e.currentTarget;
    draggedTile.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    // hide default drag image
    const img = new Image();
    img.src = "";
    e.dataTransfer.setDragImage(img, 0, 0);
}

function handleDragOver(e) {
    e.preventDefault();
    const target = e.currentTarget;
    if (!target.classList.contains("tile") || target === draggedTile) return;
    target.classList.add("drag-over");
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove("drag-over");
}

function handleDrop(e) {
    e.preventDefault();
    const targetTile = e.currentTarget;
    if (targetTile === draggedTile) return;

    swapTiles(draggedTile, targetTile);
    moveCount++;
    updateMoveDisplay();

    if (isSolved()) {
        clearInterval(timerInterval);
        checkAndSaveBestScore();
        loadBestScore();
        showWinOverlay();
    }
}

function swapTiles(tile1, tile2) {
    const parent = tile1.parentNode;
    const placeholder = document.createElement("div");
    parent.replaceChild(placeholder, tile1);
    parent.replaceChild(tile1, tile2);
    parent.replaceChild(tile2, placeholder);
}

function handleDragEnd(e) {
    if (draggedTile) {
        draggedTile.classList.remove("dragging");
        container.querySelectorAll(".drag-over").forEach(t => t.classList.remove("drag-over"));
    }
    draggedTile = null;
}

function isSolved() {
    const current = Array.from(container.children);
    return current.every((tile, index) => parseInt(tile.dataset.order, 10) === index);
}

function updateMoveDisplay() {
    document.getElementById("moveCount").textContent = moveCount;
}

function updateTimerDisplay() {
    let mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    let secs = String(seconds % 60).padStart(2, "0");
    document.getElementById("timer").textContent = `${mins}:${secs}`;
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!paused) {
            seconds++;
            updateTimerDisplay();
        }
    }, 1000);
}

function shuffleTiles() {
    if (tiles.length <= 1) return;
    let shuffled;
    do {
        shuffled = [...tiles].sort(() => Math.random() - 0.5);
    } while (shuffled.every((tile, index) => parseInt(tile.dataset.order, 10) === index));

    container.innerHTML = "";
    shuffled.forEach(tile => container.appendChild(tile));
}

function populateLevels(chapterNum) {
    const chapter = chapters[chapterNum];
    const availableLevels = [...chapter.levels];
    const selectedLevels = shuffleArray(availableLevels).slice(0, chapter.levelsCount);
    chapters[chapterNum].selectedLevels = selectedLevels;
    currentLevelIndex = 0;

    const levelListContainer = document.getElementById("level-preview-list");
    levelListContainer.innerHTML = "";

    selectedLevels.forEach((level, index) => {
        const div = document.createElement("div");
        div.classList.add("level-item");
        if (index === 0) div.classList.add("selected");

        const img = document.createElement("img");
        img.src = level.image;
        img.alt = `Level ${index + 1}`;

        div.appendChild(img);
        div.addEventListener("click", () => {
            currentLevelIndex = index;
            document.querySelectorAll(".level-item").forEach(item => item.classList.remove("selected"));
            div.classList.add("selected");
            initGame();
        });

        levelListContainer.appendChild(div);
    });
}

function showWinOverlay() {
    document.getElementById("win-overlay").hidden = false;
}

function hideWinOverlay() {
    document.getElementById("win-overlay").hidden = true;
}

function checkAndSaveBestScore() {
    const keyMoves = `bestMoves_${currentChapter}_${currentLevelIndex}`;
    const keyTime = `bestTime_${currentChapter}_${currentLevelIndex}`;

    const bestMoves = parseInt(localStorage.getItem(keyMoves));
    const bestTime = parseInt(localStorage.getItem(keyTime));

    if (!bestMoves || moveCount < bestMoves) {
        localStorage.setItem(keyMoves, moveCount);
    }
    if (!bestTime || seconds < bestTime) {
        localStorage.setItem(keyTime, seconds);
    }
}

function loadBestScore() {
    const keyMoves = `bestMoves_${currentChapter}_${currentLevelIndex}`;
    const keyTime = `bestTime_${currentChapter}_${currentLevelIndex}`;

    const bestMoves = localStorage.getItem(keyMoves) || '—';
    const bestTimeRaw = localStorage.getItem(keyTime);
    const bestTime = bestTimeRaw
        ? `${String(Math.floor(parseInt(bestTimeRaw) / 60)).padStart(2, '0')}:${String(parseInt(bestTimeRaw) % 60).padStart(2, '0')}`
        : '—';

    document.getElementById('best-score').textContent = `${bestMoves} moves, ${bestTime}`;
}

function restartGame() {
    hideWinOverlay();
    initGame();
}

function applyTheme(theme) {
    const validThemes = ["default", "dark", "ocean", "sunset"];
    const applied = validThemes.includes(theme) ? theme : "default";
    document.body.className = applied;
    localStorage.setItem("puzzleTheme", applied);
}

// Load saved theme on page load
function loadSavedTheme() {
    const savedTheme = localStorage.getItem("puzzleTheme") || "default";
    applyTheme(savedTheme);
    if (themeSelect) themeSelect.value = savedTheme;
}

window.addEventListener("DOMContentLoaded", () => {
    container = document.getElementById("puzzle-container");
    shuffleBtn = document.getElementById("shuffle");
    chapterSelect = document.getElementById("chapter-select");
    levelSelect = document.getElementById("level-select");
    themeSelect = document.getElementById("theme-select");

    if (chapterSelect) {
        chapterSelect.addEventListener("change", () => {
            currentChapter = parseInt(chapterSelect.value, 10);
            populateLevels(currentChapter);
            initGame();
        });
    }

    if (levelSelect) {
        levelSelect.addEventListener("change", () => {
            currentLevelIndex = parseInt(levelSelect.value, 10);
            initGame();
        });
    }

    if (shuffleBtn) {
        shuffleBtn.addEventListener("click", () => {
            moveCount = 0;
            updateMoveDisplay();
            hideWinOverlay();
            shuffleTiles();
            startTimer();
        });
    }

    if (themeSelect) {
        themeSelect.addEventListener("change", () => {
            applyTheme(themeSelect.value);
        });
    }

    populateLevels(currentChapter);
    loadSavedTheme();
    initGame();
});



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
