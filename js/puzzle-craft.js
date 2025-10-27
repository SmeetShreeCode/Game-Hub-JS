// Puzzle Craft Game JavaScript
// Enhanced with animations, sounds, hints, and achievements.

let container, shuffleBtn, chapterSelect, themeSelect;
let size, tiles = [], imageURL, moveCount = 0, seconds = 0, timerInterval;
let currentChapter = 1;
let currentLevelIndex = 0;
let paused = false;
let hintsUsed = 0;
let badges = JSON.parse(localStorage.getItem("badges") || "[]");

// Initialize the game for the current chapter and level
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
    hintsUsed = 0;
    clearInterval(timerInterval);
    updateMoveDisplay();
    updateTimerDisplay();
    updateHintsDisplay();
    hideWinOverlay();
    createTiles();
    shuffleTiles();
    if (!paused) startTimer();
    loadBestScore();
    updateBadges();
}

// Utility to shuffle an array
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Create the puzzle tiles based on the level's size and image
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

// Attach drag event listeners to a tile
function attachTileEvents(tile) {
    tile.addEventListener("dragstart", handleDragStart);
    tile.addEventListener("dragover", handleDragOver);
    tile.addEventListener("dragleave", handleDragLeave);
    tile.addEventListener("drop", handleDrop);
    tile.addEventListener("dragend", handleDragEnd);
}

let draggedTile = null;

// Handle drag start
function handleDragStart(e) {
    draggedTile = e.currentTarget;
    draggedTile.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    // Hide default drag image
    const img = new Image();
    img.src = "";
    e.dataTransfer.setDragImage(img, 0, 0);
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    const target = e.currentTarget;
    if (!target.classList.contains("tile") || target === draggedTile) return;
    target.classList.add("drag-over");
}

// Handle drag leave
function handleDragLeave(e) {
    e.currentTarget.classList.remove("drag-over");
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    const targetTile = e.currentTarget;
    if (targetTile === draggedTile) return;

    swapTiles(draggedTile, targetTile);
    moveCount++;
    updateMoveDisplay();
    document.getElementById("swap-sound").play(); // Play swap sound

    if (isSolved()) {
        clearInterval(timerInterval);
        checkAndSaveBestScore();
        loadBestScore();
        showWinOverlay();
        checkAchievements();
    }
}

// Swap two tiles with animation
function swapTiles(tile1, tile2) {
    tile1.classList.add("swapping");
    tile2.classList.add("swapping");
    setTimeout(() => {
        const parent = tile1.parentNode;
        const placeholder = document.createElement("div");
        parent.replaceChild(placeholder, tile1);
        parent.replaceChild(tile1, tile2);
        parent.replaceChild(tile2, placeholder);
        tile1.classList.remove("swapping");
        tile2.classList.remove("swapping");
    }, 150);
}

// Handle drag end
function handleDragEnd(e) {
    if (draggedTile) {
        draggedTile.classList.remove("dragging");
        container.querySelectorAll(".drag-over").forEach(t => t.classList.remove("drag-over"));
    }
    draggedTile = null;
}

// Check if the puzzle is solved
function isSolved() {
    const current = Array.from(container.children);
    return current.every((tile, index) => parseInt(tile.dataset.order, 10) === index);
}

// Update the move counter display
function updateMoveDisplay() {
    document.getElementById("moveCount").textContent = moveCount;
}

// Update the timer display
function updateTimerDisplay() {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    document.getElementById("timer").textContent = `${mins}:${secs}`;
}

// Update hints left display
function updateHintsDisplay() {
    document.getElementById("hints-left").textContent = 3 - hintsUsed;
}

// Start the timer
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!paused) {
            seconds++;
            updateTimerDisplay();
        }
    }, 1000);
}

// Shuffle the tiles randomly, ensuring it's not already solved
function shuffleTiles() {
    if (tiles.length <= 1) return;
    let shuffled;
    do {
        shuffled = [...tiles].sort(() => Math.random() - 0.5);
    } while (shuffled.every((tile, index) => parseInt(tile.dataset.order, 10) === index));

    container.innerHTML = "";
    shuffled.forEach(tile => container.appendChild(tile));
}

// Populate the level list for a chapter
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

// Show the win overlay
function showWinOverlay() {
    document.getElementById("win-sound").play(); // Play win sound
    document.getElementById("win-overlay").hidden = false;
}

// Hide the win overlay
function hideWinOverlay() {
    document.getElementById("win-overlay").hidden = true;
}

// Check and save the best score for moves and time
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

// Load and display the best score
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

// Restart the game
function restartGame() {
    hideWinOverlay();
    initGame();
}

// Apply a theme to the page
function applyTheme(theme) {
    const validThemes = ["default", "dark", "ocean", "sunset"];
    const applied = validThemes.includes(theme) ? theme : "default";
    document.body.className = applied;
    localStorage.setItem("puzzleTheme", applied);
}

// Load the saved theme
function loadSavedTheme() {
    const savedTheme = localStorage.getItem("puzzleTheme") || "default";
    applyTheme(savedTheme);
    if (themeSelect) themeSelect.value = savedTheme;
}

// Toggle pause state
function togglePause() {
    paused = !paused;
    document.getElementById("pause-btn").textContent = paused ? "▶️ Resume" : "⏸️ Pause";
    document.getElementById("pause-overlay").classList.toggle("show", paused);
}

// Give a hint by highlighting a wrong tile
function giveHint() {
    if (hintsUsed >= 3) return;
    const current = Array.from(container.children);
    const wrongTile = current.find((tile, index) => parseInt(tile.dataset.order) !== index);
    if (wrongTile) {
        wrongTile.style.boxShadow = "0 0 100px yellow";
        setTimeout(() => wrongTile.style.boxShadow = "", 2000);
        hintsUsed++;
        updateHintsDisplay();
    }
}

// Check for achievements after solving
function checkAchievements() {
    if (moveCount <= 10 && !badges.includes("Speed Demon")) {
        badges.push("Speed Demon");
    }
    if (seconds <= 60 && !badges.includes("Time Master")) {
        badges.push("Time Master");
    }
    localStorage.setItem("badges", JSON.stringify(badges));
    updateBadges();
}

// Update badges display
function updateBadges() {
    document.getElementById("badge-list").textContent = badges.length ? badges.join(", ") : "None";
}

// Event listeners setup on DOM load
window.addEventListener("DOMContentLoaded", () => {
    container = document.getElementById("puzzle-container");
    shuffleBtn = document.getElementById("shuffle");
    chapterSelect = document.getElementById("chapter-select");
    themeSelect = document.getElementById("theme-select");

    // Chapter select event
    if (chapterSelect) {
        chapterSelect.addEventListener("change", () => {
            currentChapter = parseInt(chapterSelect.value, 10);
            populateLevels(currentChapter);
            initGame();
        });
    }

    // Shuffle button event
    if (shuffleBtn) {
        shuffleBtn.addEventListener("click", () => {
            moveCount = 0;
            updateMoveDisplay();
            hideWinOverlay();
            shuffleTiles();
            startTimer();
        });
    }

    // Theme select event
    if (themeSelect) {
        themeSelect.addEventListener("change", () => {
            applyTheme(themeSelect.value);
        });
    }

    // Pause and resume buttons
    document.getElementById("pause-btn").addEventListener("click", togglePause);
    document.getElementById("resume-btn").addEventListener("click", togglePause);

    // Preview button
    document.getElementById("preview-btn").addEventListener("click", () => {
        container.classList.add("preview");
        setTimeout(() => container.classList.remove("preview"), 2000);
    });

    // Hint button
    document.getElementById("hint-btn").addEventListener("click", giveHint);

    // Initialize levels, theme, and game
    populateLevels(currentChapter);
    loadSavedTheme();
    initGame();
});
