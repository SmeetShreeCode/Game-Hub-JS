let currentLevel = 0, found = [], hintFound = [], score = 0, timeLeft = 60, lives = 15, hintsLeft = 15, comboStreak = 0, selectedLevel = 0, gameOver = false;
let timerInterval;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let musicOn = JSON.parse(localStorage.getItem("musicOn")) ?? true;
let ambientMode = JSON.parse(localStorage.getItem("ambientMode")) || false;

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
const musicToggleBtn = document.getElementById("musicToggleBtn");
const ambientToggle = document.getElementById("ambientModeToggle");
const themeToggleBtn = document.getElementById("themeToggleBtn");

function updateLivesDisplay() {
    const heart = '❤️';
    const lost = '🤍';
    livesDisplay.innerHTML = `${heart.repeat(lives)}${lost.repeat(15 - lives)}`;
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateFoundCounter() {
    const total = easyLevels[currentLevel].differences.length;
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
            showEndScreen(false);
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

function drawShape(x, y, color = "red", radius = 20, shape = "circle", temporary = false) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    if (shape === "square") {
        ctx.strokeRect(x - radius, y - radius, radius * 2, radius * 2);
    } else {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
    if (temporary) {
        setTimeout(() => {
            ctx.clearRect(x - radius - 3, y - radius - 3, radius * 2 + 6, radius * 2 + 6);
            redrawFound();
        }, Math.random() * 2000 + 2000); // 2 to 4 seconds
    }
}

function redrawFound() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const imageOffset = leftImage.width + 20;
    found.forEach((index) => {
        const diff = easyLevels[currentLevel].differences[index];
        const color = hintFound.includes(index) ? "green" : "red";
        drawShape(diff.x + imageOffset, diff.y, color, diff.radius, diff.shape || "circle");
        drawShape(diff.x, diff.y, color, diff.radius, diff.shape || "circle");
    });
}

function loadLevel(levelIndex) {
    updateProgressBar();
    clearInterval(timerInterval);
    const level = easyLevels[levelIndex];
    found = [];
    hintFound = [];
    lives = 15;
    hintsLeft = 15;
    updateFoundCounter();
    updateLivesDisplay();
    updateScoreDisplay();
    updateHintDisplay();

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
    message.textContent = "";
    comboStreak = 0;
    hintsLeft = 15;
    updateHintDisplay();
    score = Math.max(0, score - 10);
    loadLevel(currentLevel);
}

function handleClick(e) {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const imageOffset = leftImage.width + 20;

    let adjustedX, isRightImage;

    if (clickX > imageOffset) {
        isRightImage = true;
        adjustedX = clickX - imageOffset;
    } else {
        isRightImage = false;
        adjustedX = clickX;
    }

    console.log(`Clicked at (x: ${adjustedX}, y: ${clickY}) on ${isRightImage ? 'right' : 'left'} image`);

    //    const rect = canvas.getBoundingClientRect();
    //
    //     // Fix for canvas scaling
    //     const scaleX = canvas.width / rect.width;
    //     const scaleY = canvas.height / rect.height;
    //
    //     const clickX = (e.clientX - rect.left) * scaleX;
    //     const clickY = (e.clientY - rect.top) * scaleY;
    //
    //     const leftWidth = leftImage.width;
    //     const spacing = 20;
    //     const imageOffset = leftWidth + spacing;
    //
    //     let adjustedX, isRightImage;
    //
    //     if (clickX >= 0 && clickX <= leftWidth) {
    //         isRightImage = false;
    //         adjustedX = clickX;
    //     } else if (clickX >= imageOffset && clickX <= imageOffset + rightImage.width) {
    //         isRightImage = true;
    //         adjustedX = clickX - imageOffset;
    //     } else {
    //         console.log("Clicked outside images or in gap");
    //         return;
    //     }
    //
    //     console.log(`Clicked at (x: ${adjustedX.toFixed(2)}, y: ${clickY.toFixed(2)}) on ${isRightImage ? 'right' : 'left'} image`);

    let hit = false;

    easyLevels[currentLevel].differences.forEach((diff, index) => {
        if (found.includes(index)) return;

        const dx = diff.x - adjustedX;
        const dy = diff.y - clickY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < diff.radius) {
            hit = true;
            found.push(index);
            drawShape(diff.x, diff.y, "red", diff.radius, diff.shape || "circle");
            drawShape(diff.x + imageOffset, diff.y, "red", diff.radius, diff.shape || "circle");

            if (musicOn) correctSound.play();

            comboStreak++;
            const comboBonus = comboStreak >= 4 ? 5 : 0;
            score += 10 + comboBonus;
            message.textContent = comboBonus > 0 ? `🔥 Combo X${comboStreak}! +${comboBonus}` : "";
            updateFoundCounter();
            updateScoreDisplay();
            updateHighScore();
            showSparkle(e.clientX, e.clientY, 'limegreen');

            if (found.length === easyLevels[currentLevel].differences.length) {
                clearInterval(timerInterval);
                message.textContent = "🎉 Level Complete!";
                disableClicks();
                setTimeout(() => {
                    if (++currentLevel < easyLevels.length) loadLevel(currentLevel);
                    else showEndScreen(true);
                }, 2000);
            }
        }
    });

    if (!hit) {
        drawShape(clickX, clickY, "blue", 20, "circle", true);
        score = Math.max(0, score - 5);
        lives--;
        comboStreak = 0;
        updateLivesDisplay();
        updateScoreDisplay();
        showSparkle(e.clientX, e.clientY, 'red');

        if (musicOn) wrongSound.play();
        if (lives === 0) {
            clearInterval(timerInterval);
            message.textContent = "💀 Game Over!";
            showEndScreen(false);
        }
    }
}

function showHint() {
    if (gameOver || hintsLeft <= 0) return;

    const remaining = easyLevels[currentLevel].differences
        .map((d, i) => ({diff: d, index: i}))
        .filter((d) => !found.includes(d.index));

    if (remaining.length > 0) {
        const random = remaining[Math.floor(Math.random() * remaining.length)];
        found.push(random.index);
        hintFound.push(random.index);
        updateFoundCounter();
        const offset = leftImage.width + 20;
        drawShape(random.diff.x + offset, random.diff.y, "green", random.diff.radius, random.diff.shape || "circle");
        drawShape(random.diff.x, random.diff.y, "green", random.diff.radius, random.diff.shape || "circle");
        hintsLeft--;
        updateHintDisplay();
        score = Math.max(0, score - 5); // Optional penalty
        updateScoreDisplay();
        if (found.length === easyLevels[currentLevel].differences.length) {
            clearInterval(timerInterval);
            message.textContent = "🎉 Level Complete!";
            disableClicks();
            setTimeout(() => {
                if (++currentLevel < easyLevels.length) loadLevel(currentLevel); else showEndScreen(true);
            }, 2000);
        }
    }
}

function showEndScreen(isWin) {
    disableClicks();
    document.getElementById("endScreen").style.display = "flex";
    document.getElementById("endTitle").textContent = isWin ? "🎉 You Win!" : "💀 Game Over!";
    document.getElementById("finalScore").textContent = `Your final score: ${score}`;
}

function restartGame() {
    score = 0;
    currentLevel = 0;
    selectedLevel = 0;
    lives = 15;
    hintsLeft = 15;
    comboStreak = 0;
    gameOver = false;
    clearInterval(timerInterval);

    updateLivesDisplay();
    updateHintDisplay();
    updateScoreDisplay();
    updateHighScore();
    document.getElementById("progressBar").style.width = "0%";
    document.getElementById("endScreen").style.display = "none";
    message.textContent = "";
    showLevelSelectScreen();
}

function updateProgressBar() {
    const percent = (currentLevel / easyLevels.length) * 100;
    document.getElementById("progressBar").style.width = `${percent}%`;
}

// === SOUND TOGGLE ===
function toggleMusic() {
    musicOn = !musicOn;
    localStorage.setItem("musicOn", musicOn);
    updateMusicState();
}

function updateMusicState() {
    musicToggleBtn.textContent = musicOn ? "🔊 Music On" : "🔇 Music Off";
    [correctSound, wrongSound].forEach(audio => {
        audio.muted = !musicOn;
    });
}

// === THEME TOGGLE ===
function updateThemeUI(theme) {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${theme}-theme`);
    themeToggleBtn.textContent = theme === "dark" ? "🌙Dark Theme" : "🌞Light Theme";
    localStorage.setItem("theme", theme);
}

// === INIT ===
document.getElementById("game").addEventListener("click", handleClick);
document.getElementById("game").addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    handleClick({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
    e.preventDefault();
}, { passive: false });
document.getElementById("reset").addEventListener("click", restartGame);

ambientToggle.addEventListener("change", () => {
    ambientMode = ambientToggle.checked;
    localStorage.setItem("ambientMode", ambientMode);
    ambientMode ? (clearInterval(timerInterval), timerDisplay.textContent = "Ambient Mode 🎧") : startTimer();
});

themeToggleBtn.addEventListener("click", () => {
    const current = localStorage.getItem("theme") || "light";
    updateThemeUI(current === "light" ? "dark" : "light");
});

window.addEventListener("DOMContentLoaded", () => {
    showLevelSelectScreen();

    const savedTheme = localStorage.getItem("theme") || "light";
    updateThemeUI(savedTheme);

    document.getElementById("highScore").textContent = `High Score: ${highScore}`;
    updateHighScore();
    updateMusicState();
});

function startGame() {
    currentLevel = selectedLevel;
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("levelSelectScreen").style.display = "none";
    loadLevel(currentLevel);
}
function showSparkle(x, y, color = 'yellow') {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.left = `${x - 10}px`;
    sparkle.style.top = `${y - 10}px`;
    sparkle.style.backgroundColor = color;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 600);
}

function updateHintDisplay() {
    const hintBtn = document.getElementById("hintButton");
    hintBtn.textContent = `Hint: ${hintsLeft}`;
    hintBtn.disabled = hintsLeft === 0;
}

function showLevelSelectScreen() {
    const container = document.getElementById("levelButtons");
    container.innerHTML = "";
    easyLevels.forEach((_, index) => {
        const btn = document.createElement("button");
        btn.textContent = `Level ${index + 1}`;
        btn.className = "level-btn";
        btn.onclick = () => {
            selectedLevel = index;
            highlightSelectedLevel(index);
        };
        container.appendChild(btn);
    });
    highlightSelectedLevel(selectedLevel);
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("levelSelectScreen").style.display = "flex";
}

function highlightSelectedLevel(index) {
    const buttons = document.querySelectorAll("#levelButtons button");
    buttons.forEach((btn, i) => {
        btn.style.backgroundColor = i === index ? "#5aafff" : "";
    });
}

document.getElementById("restartLevelBtn").addEventListener("click", () => {
    restartCurrentLevel();
});

function restartCurrentLevel() {
    if (gameOver) return;
    lives = 15;
    hintsLeft = 15;
    comboStreak = 0;
    score = Math.max(0, score - 10);
    updateLivesDisplay();
    updateHintDisplay();
    updateScoreDisplay();
    loadLevel(currentLevel);
    message.textContent = "";
    enableClicks();
}
