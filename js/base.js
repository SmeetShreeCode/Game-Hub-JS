let currentLevel = 0,
    found = [],
    score = 0,
    timeLeft = 60,
    lives = 15,
    hintsLeft = 15,
    comboStreak = 0,
    selectedLevel = 0,
    gameOver = false;

let timerInterval;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let musicOn = JSON.parse(localStorage.getItem("musicOn")) ?? true;
let ambientMode = JSON.parse(localStorage.getItem("ambientMode")) || false;
let currentSetIndex = 0;
let currentSetLevels = []; // Random 5 from current set
let currentLevelInSet = 0;

// You must define or import your levelSets and easyLevels somewhere in your code!
// Example:
// const levelSets = easyLevels; // if all levels in one set

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
const hintBtn = document.getElementById("hintButton");
const endScreen = document.getElementById("endScreen");
const endTitle = document.getElementById("endTitle");
const finalScore = document.getElementById("finalScore");
const progressBar = document.getElementById("progressBar");

// HELPERS

function getCurrentLevelObj() {
    return currentSetLevels[currentLevelInSet];
}

function updateLivesDisplay() {
    const heart = '❤️';
    const lost = '🤍';
    livesDisplay.innerHTML = `${heart.repeat(lives)}${lost.repeat(15 - lives)}`;
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateFoundCounter() {
    const levelObj = getCurrentLevelObj();
    if (!levelObj) return;
    const total = levelObj.differences.length;
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

function updateHintDisplay() {
    hintBtn.textContent = `Hint: ${hintsLeft}`;
    hintBtn.disabled = hintsLeft === 0 || gameOver;
}

function startTimer() {
    clearInterval(timerInterval);

    if (ambientMode) {
        timerDisplay.textContent = "Ambient Mode 🎧";
        return;
    }

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

function drawCircle(x, y, color = "red", radius = 20) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function redrawFound() {
    if (!currentSetLevels.length) return;
    const imageOffset = leftImage.width + 20;
    const levelObj = getCurrentLevelObj();
    found.forEach((index) => {
        const diff = levelObj.differences[index];
        drawCircle(diff.x + imageOffset, diff.y, "red", diff.radius);
        drawCircle(diff.x, diff.y, "red", diff.radius);
    });
}

function loadLevel() {
    clearInterval(timerInterval);

    found = [];
    lives = 15;
    hintsLeft = 15;
    comboStreak = 0;
    gameOver = false;

    updateLivesDisplay();
    updateScoreDisplay();
    updateHintDisplay();
    updateFoundCounter();
    updateHighScore();
    updateProgressBar();
    message.textContent = "";

    const levelObj = getCurrentLevelObj();
    if (!levelObj) {
        console.error("No level found to load.");
        return;
    }

    // Set images
    leftImage.src = levelObj.images.left;
    rightImage.src = levelObj.images.right;

    let loaded = 0;
    [leftImage, rightImage].forEach(img => {
        img.onload = () => {
            loaded++;
            if (loaded === 2) {
                canvas.width = leftImage.width + rightImage.width + 40;
                canvas.height = leftImage.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                redrawFound();
                startTimer();
                enableClicks();
            }
        }
    });
}

function restartLevel() {
    message.textContent = "";
    comboStreak = 0;
    hintsLeft = 15;
    updateHintDisplay();
    score = Math.max(0, score - 10);
    loadLevel();
    enableClicks();
}

function handleClick(e) {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const imageOffset = leftImage.width + 20;

    // Ignore clicks outside right image (only right image is clickable)
    if (clickX <= imageOffset) return;

    const adjustedX = clickX - imageOffset;
    const levelObj = getCurrentLevelObj();

    if (!levelObj) return;

    let hit = false;

    for (let index = 0; index < levelObj.differences.length; index++) {
        if (found.includes(index)) continue;

        const diff = levelObj.differences[index];
        const dx = diff.x - adjustedX;
        const dy = diff.y - clickY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < diff.radius) {
            hit = true;
            found.push(index);

            drawCircle(diff.x, diff.y, "red", diff.radius);
            drawCircle(diff.x + imageOffset, diff.y, "red", diff.radius);

            if (musicOn) correctSound.play();

            comboStreak++;
            const comboBonus = comboStreak >= 4 ? 5 : 0;
            score += 10 + comboBonus;

            message.textContent = comboBonus > 0 ? `🔥 Combo X${comboStreak}! +${comboBonus}` : "";

            updateScoreDisplay();
            updateHighScore();
            updateFoundCounter();
            showSparkle(e.clientX, e.clientY, 'limegreen');

            break; // Stop checking after first hit
        }
    }

    if (!hit) {
        drawCircle(clickX, clickY, "blue");
        score = Math.max(0, score - 5);
        lives--;
        comboStreak = 0;
        updateLivesDisplay();
        updateScoreDisplay();
        showSparkle(e.clientX, e.clientY, 'red');

        if (musicOn) wrongSound.play();

        if (lives <= 0) {
            clearInterval(timerInterval);
            message.textContent = "💀 Game Over!";
            showEndScreen(false);
            disableClicks();
            return;
        }
    }

    checkLevelComplete();
}

function showHint() {
    if (gameOver || hintsLeft <= 0) return;

    const levelObj = getCurrentLevelObj();
    if (!levelObj) return;

    const remaining = levelObj.differences
        .map((d, i) => ({ diff: d, index: i }))
        .filter(d => !found.includes(d.index));

    if (remaining.length > 0) {
        const random = remaining[Math.floor(Math.random() * remaining.length)];
        found.push(random.index);
        updateFoundCounter();

        const offset = leftImage.width + 20;
        drawCircle(random.diff.x + offset, random.diff.y, "green", random.diff.radius);
        drawCircle(random.diff.x, random.diff.y, "green", random.diff.radius);

        hintsLeft--;
        updateHintDisplay();

        score = Math.max(0, score - 5); // Optional penalty
        updateScoreDisplay();

        checkLevelComplete();
    }
}

function showEndScreen(isWin) {
    disableClicks();
    endScreen.style.display = "flex";
    endTitle.textContent = isWin ? "🎉 You Win!" : "💀 Game Over!";
    finalScore.textContent = `Your final score: ${score}`;
}

function hideEndScreen() {
    endScreen.style.display = "none";
}

function restartGame() {
    score = 0;
    lives = 15;
    hintsLeft = 15;
    comboStreak = 0;
    currentSetIndex = Math.floor(selectedLevel / 10) || 0;
    currentLevelInSet = 0;

    // If selectedLevel is a direct level index, choose the correct set accordingly:
    if (levelSets && levelSets.length) {
        currentSetIndex = Math.min(Math.floor(selectedLevel / 5), levelSets.length - 1);
        currentSetLevels = getRandomLevelsFromSet(levelSets[currentSetIndex]);
    } else {
        currentSetLevels = getRandomLevelsFromSet(easyLevels);
    }

    updateLivesDisplay();
    updateHintDisplay();
    hideEndScreen();
    loadLevel();
    enableClicks();
}

function updateProgressBar() {
    if (!levelSets || !levelSets.length) return;

    const totalSets = levelSets.length;
    const totalLevels = totalSets * 5; // 5 levels per set
    const currentLevelNumber = currentSetIndex * 5 + currentLevelInSet + 1; // +1 so it doesn't show 0%

    const percent = Math.min((currentLevelNumber / totalLevels) * 100, 100);
    progressBar.style.width = `${percent}%`;
}

// SOUND TOGGLE

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

// THEME TOGGLE

function updateThemeUI(theme) {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${theme}-theme`);
    themeToggleBtn.textContent = theme === "dark" ? "🌙 Dark Theme" : "🌞 Light Theme";
    localStorage.setItem("theme", theme);
}

// LEVEL SELECTION UI

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

// RANDOM LEVEL PICKING

function getRandomLevelsFromSet(set, count = 5) {
    if (!set || !set.length) return [];
    const shuffled = [...set].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// CHECK LEVEL COMPLETION

function checkLevelComplete() {
    if (gameOver) return;

    const levelObj = getCurrentLevelObj();
    if (!levelObj) return;

    if (found.length === levelObj.differences.length) {
        clearInterval(timerInterval);
        message.textContent = "🎉 Level Complete!";
        gameOver = true;
        disableClicks();

        setTimeout(() => {
            currentLevelInSet++;
            if (currentLevelInSet < currentSetLevels.length) {
                loadLevel();
            } else {
                // move to next set
                currentSetIndex++;
                if (levelSets && currentSetIndex < levelSets.length) {
                    currentSetLevels = getRandomLevelsFromSet(levelSets[currentSetIndex]);
                    currentLevelInSet = 0;
                    loadLevel();
                } else {
                    showEndScreen(true);
                }
            }
        }, 2000);
    }
}

// SPARKLE EFFECT

function showSparkle(x, y, color = 'yellow') {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.left = `${x - 10}px`;
    sparkle.style.top = `${y - 10}px`;
    sparkle.style.backgroundColor = color;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 600);
}

// EVENT LISTENERS

document.getElementById("game").addEventListener("click", handleClick);

document.getElementById("game").addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    handleClick({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => { } });
    e.preventDefault();
}, { passive: false });

document.getElementById("reset").addEventListener("click", restartGame);

hintBtn.addEventListener("click", showHint);

musicToggleBtn.addEventListener("click", toggleMusic);

ambientToggle.addEventListener("change", () => {
    ambientMode = ambientToggle.checked;
    localStorage.setItem("ambientMode", ambientMode);
    if (ambientMode) {
        clearInterval(timerInterval);
        timerDisplay.textContent = "Ambient Mode 🎧";
    } else {
        startTimer();
    }
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
