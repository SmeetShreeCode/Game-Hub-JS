

let currentLevel = 0, found = [], score = 0, timeLeft = 60, lives = 15, gameOver = false;
let timerInterval;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const message = document.getElementById("message");
const leftImage = document.getElementById("leftImage");
const rightImage = document.getElementById("rightImage");
const livesDisplay = document.getElementById("lives");
const bgMusic = document.getElementById("bgMusic");
const musicToggleBtn = document.getElementById("musicToggleBtn");
const volumeSlider = document.getElementById("volumeSlider");
const trackSelector = document.getElementById("trackSelector");
const ambientToggle = document.getElementById("ambientModeToggle");
const soundSettingsPanel = document.getElementById("soundSettings");
const themeToggleBtn = document.getElementById("themeToggleBtn");

const savedTrack = localStorage.getItem("musicTrack") || "music.mp3";
const savedVolume = parseFloat(localStorage.getItem("volume")) || 1;

let musicOn = JSON.parse(localStorage.getItem("musicOn")) ?? true;
let ambientMode = JSON.parse(localStorage.getItem("ambientMode")) || false;

function updateLivesDisplay() {
    livesDisplay.textContent = `Lives: ${lives}`;
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateFoundCounter() {
    const total = levels[currentLevel].differences.length;
    const foundCount = found.length;
    document.getElementById("foundCounter").textContent = `Found: ${foundCount} / ${total}`;
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }
    document.getElementById("highScore").textContent = `High Score: ${highScore}`;
}

function startTimer() {
    clearInterval(timerInterval);
    if (ambientMode) return (timerDisplay.textContent = "Ambient Mode 🎧");
    timeLeft = 60;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Time: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            message.textContent = "⏰ Time's up! Try again.";
            disableClicks();
            setTimeout(() => restartLevel(), 2000);
        }
    }, 1000);
}

function disableClicks() {
    gameOver = true;
}

function enableClicks() {
    gameOver = false;
}

function drawCircle(x, y, color = "red") {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, 2 * Math.PI);
    ctx.stroke();
}

function redrawFound() {
    const imageOffset = leftImage.width + 20;
    found.forEach((index) => {
        const diff = levels[currentLevel].differences[index];
        drawCircle(diff.x + imageOffset, diff.y);
        drawCircle(diff.x, diff.y);
    });
}

function loadLevel(levelIndex) {
    updateProgressBar();
    clearInterval(timerInterval);
    const level = levels[levelIndex];
    found = [];
    lives = 15;
    updateFoundCounter();
    updateLivesDisplay();
    updateScoreDisplay();
    message.textContent = "";
    enableClicks();
    leftImage.src = level.images.left;
    rightImage.src = level.images.right;

    let loaded = 0;
    [leftImage, rightImage].forEach(img => img.onload = () => {
        if (++loaded === 2) {
            canvas.width = leftImage.width + rightImage.width + 40;
            canvas.height = leftImage.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            redrawFound();
            startTimer();
        }
    });
}

function restartLevel() {
    score = Math.max(0, score - 10); // Small penalty
    loadLevel(currentLevel);
}

function handleClick(e) {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const imageOffset = leftImage.width + 20;

    const isRightImage = clickX > imageOffset;
    if (!isRightImage) return;

    const adjustedX = clickX - imageOffset;
    console.log(`Clicked at (x: ${adjustedX}, y: ${clickY})`);

    let hit = false;
    levels[currentLevel].differences.forEach((diff, index) => {
        if (found.includes(index)) return;

        const dx = diff.x - adjustedX;
        const dy = diff.y - clickY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < diff.radius) {
            hit = true;
            found.push(index);
            drawCircle(diff.x, diff.y);
            drawCircle(diff.x + imageOffset, diff.y);
            correctSound.play();
            score += 10;
            updateFoundCounter();
            updateScoreDisplay();
            updateHighScore();

            if (found.length === levels[currentLevel].differences.length) {
                clearInterval(timerInterval);
                message.textContent = "🎉 Level Complete!";
                disableClicks();
                setTimeout(() => {
                    if (++currentLevel < levels.length) loadLevel(currentLevel); else showEndScreen(true);
                }, 2000);
            }
        }
    });

    if (!hit) {
        wrongSound.play();
        drawCircle(clickX, clickY, "blue");
        score = Math.max(0, score - 5);
        lives--;
        updateLivesDisplay();
        updateScoreDisplay();

        if (lives === 0) {
            clearInterval(timerInterval);
            message.textContent = "💀 Game Over!";
            showEndScreen(false); // Show lose screen
        }
    }
}

function showHint() {
    if (gameOver) return;

    const remaining = levels[currentLevel].differences
        .map((d, i) => ({diff: d, index: i}))
        .filter((d) => !found.includes(d.index));

    if (remaining.length > 0) {
        const random = remaining[Math.floor(Math.random() * remaining.length)];
        found.push(random.index);
        updateFoundCounter();
        const offset = leftImage.width + 20;
        drawCircle(random.diff.x + offset, random.diff.y, "green");
        drawCircle(random.diff.x, random.diff.y, "green");

        if (found.length === levels[currentLevel].differences.length) {
            clearInterval(timerInterval);
            message.textContent = "🎉 Level Complete!";
            disableClicks();
            setTimeout(() => {
                if (++currentLevel < levels.length) loadLevel(currentLevel); else showEndScreen(true);
            }, 2000);
        }
    }
}

// Show end screen
function showEndScreen(isWin) {
    disableClicks();
    document.getElementById("endScreen").style.display = "flex";
    document.getElementById("endTitle").textContent = isWin ? "🎉 You Win!" : "💀 Game Over!";
    document.getElementById("finalScore").textContent = `Your final score: ${score}`;
}

// Restart entire game from end screen
function restartGame() {
    document.getElementById("progressBar").style.width = "0%";
    document.getElementById("endScreen").style.display = "none";
    score = 0;
    currentLevel = 0;
    lives = 15;
    updateLivesDisplay();
    loadLevel(currentLevel);
}

function updateProgressBar() {
    const percent = ((currentLevel + 1) / levels.length) * 100;
    document.getElementById("progressBar").style.width = `${percent}%`;
}

function toggleSettings() {
    soundSettingsPanel.style.display = soundSettingsPanel.style.display === "none" ? "block" : "none";
}

function toggleMusic() {
    musicOn = !musicOn;
    localStorage.setItem("musicOn", musicOn);
    updateMusicState();
}

function updateMusicState() {
    musicToggleBtn.textContent = musicOn ? "🔊 Music On" : "🔇 Music Off";
    musicOn ? bgMusic.play() : bgMusic.pause();
}

function updateThemeUI(theme) {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${theme}-theme`);
    themeToggleBtn.textContent = theme === "dark" ? "🌙 Dark Theme" : "🌞 Light Theme";
    localStorage.setItem("theme", theme);
}

// === Event Listeners ===
document.getElementById("game").addEventListener("click", handleClick);
document.getElementById("reset").addEventListener("click", restartGame);

// Load saved preferences
bgMusic.volume = savedVolume;
volumeSlider.value = savedVolume;
bgMusic.src = savedTrack;
trackSelector.value = savedTrack;
ambientToggle.checked = ambientMode;

// Handle changes
volumeSlider.addEventListener("input", () => {
    bgMusic.volume = volumeSlider.value;
    localStorage.setItem("volume", volumeSlider.value);
});

trackSelector.addEventListener("change", () => {
    bgMusic.pause();
    bgMusic.src = trackSelector.value;
    bgMusic.play();
    localStorage.setItem("musicTrack", trackSelector.value);
});

ambientToggle.addEventListener("change", () => {
    ambientMode = ambientToggle.checked;
    localStorage.setItem("ambientMode", ambientMode);
    ambientMode ? (clearInterval(timerInterval), timerDisplay.textContent = "Ambient Mode 🎧") : startTimer();
});

themeToggleBtn.addEventListener("click", () => {
    const current = localStorage.getItem("theme") || "light";
    updateThemeUI(current === "light" ? "dark" : "light");
});

// On load, apply saved theme
window.addEventListener("DOMContentLoaded", () => {
    // Show start screen
    document.getElementById("startScreen").style.display = "flex";

    // Apply saved theme
    const savedTheme = localStorage.getItem("theme") || "light";
    updateThemeUI(savedTheme);

    // Update high score display
    document.getElementById("highScore").textContent = `High Score: ${highScore}`;
    updateHighScore();

    // Load music settings
    bgMusic.volume = savedVolume;
    volumeSlider.value = savedVolume;
    bgMusic.src = savedTrack;
    trackSelector.value = savedTrack;
    if (musicOn) bgMusic.play();
    updateMusicState();
});


// Start game from start screen
function startGame() {
    document.getElementById("startScreen").style.display = "none";
    loadLevel(currentLevel);
}
