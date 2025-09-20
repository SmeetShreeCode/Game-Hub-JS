let currentLevel = 0, levelStartScore = 0, found = [], hintFound = [], score = 0, timeLeft = 60, lives = 15, hintsLeft = 3, comboStreak = 0, selectedLevel = 0, gameOver = false;
let timerInterval;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let musicOn = JSON.parse(localStorage.getItem("musicOn")) ?? true;
let ambientMode = JSON.parse(localStorage.getItem("ambientMode")) || false;

const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const message = document.getElementById("message");
const livesDisplay = document.getElementById("lives");
const musicToggleBtn = document.getElementById("musicToggleBtn");
const ambientToggle = document.getElementById("ambientModeToggle");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const leftImage = document.getElementById("leftImage");
const leftCanvas = document.getElementById("leftCanvas");
const leftCtx = leftCanvas.getContext("2d");

const rightImage = document.getElementById("rightImage");
const rightCanvas = document.getElementById("rightCanvas");
const rightCtx = rightCanvas.getContext("2d");

leftCanvas.addEventListener("click", (e) => {
    const rect = leftCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log("left: " + x, y);
    handleClick(x, y, "left");
});

rightCanvas.addEventListener("click", (e) => {
    const rect = rightCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log("right: " + x, y);
    handleClick(x, y, "right");
});

console.log(PhotoHuntLevels);
function updateLivesDisplay() {
    const heart = '❤️';
    const lost = '🤍';
    livesDisplay.innerHTML = `${heart.repeat(lives)}${lost.repeat(20 - lives)}`;
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateFoundCounter() {
    const total = activeLevels[currentLevel].differences.length;
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

const Chapters = {};
PhotoHuntLevels.forEach((chapter, index) => {
    const key = `chapter${index + 1}`;
    Chapters[key] = [
        ...(chapter.easy || []),
        ...(chapter.medium || []),
        ...(chapter.hard || [])
    ];
});
function getLevels(chapterName, count = 10) {
    const levels = Chapters[chapterName];
    if (!levels || levels.length === 0) return [];
    return pickLevels(levels, count);
}

function pickLevels(levels, count = 10) {
    return shuffleArray(levels).slice(0, count);
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

let currentChapter = "chapter1"; // safe even if not defined
let activeLevels = getLevels(currentChapter, 10);

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

function drawShape(ctx, x, y, color = "red", radius = 20, shape = "circle", temporary = false, width = null, height = null) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    if (shape === "square" || shape === "rect") {
        const w = width ?? radius * 2;
        const h = height ?? radius * 2;
        ctx.strokeRect(x - w / 2, y - h / 2, w, h);
    } else {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }

    if (temporary) {
        const clearW = (width ?? radius * 2) + 6;
        const clearH = (height ?? radius * 2) + 6;
        const image = ctx === leftCtx ? leftImage : rightImage;

        setTimeout(() => {
            // Clear shape area
            ctx.clearRect(x - clearW / 2, y - clearH / 2, clearW, clearH);

            // Redraw only the relevant part of the image
            ctx.drawImage(
                image,
                x - clearW / 2, y - clearH / 2, clearW, clearH, // source from image
                x - clearW / 2, y - clearH / 2, clearW, clearH  // draw to canvas
            );
        }, Math.random() * 2000 + 2000); // 2 to 4 seconds
    }
}

function redrawFound() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const imageOffset = leftImage.width + 20;
    found.forEach((index) => {
        const diff = activeLevels[currentLevel].differences[index];
        const color = hintFound.includes(index) ? "green" : "red";
        drawShape(diff.x + imageOffset, diff.y, color, diff.radius, diff.shape || "circle", false, diff.width, diff.height);
        drawShape(diff.x, diff.y, color, diff.radius, diff.shape || "circle", false, diff.width, diff.height);
    });
}

function loadLevel(levelIndex) {
    const level = activeLevels[levelIndex];
    if (!level) {
        showEndScreen(true); // or false if you want to treat it as fail
        return;
    }
    updateProgressBar();
    clearInterval(timerInterval);
    found = [];
    hintFound = [];
    lives = 20;
    hintsLeft = 3;
    levelStartScore = score;
    message.textContent = "";
    leftImage.src = level.images.left;
    rightImage.src = level.images.right;
    leftCtx.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
    rightCtx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
    updateFoundCounter();
    updateLivesDisplay();
    updateScoreDisplay();
    updateHintDisplay();
    enableClicks();

    let loaded = 0;
    function checkBothLoaded() {
        if (++loaded === 2) {
            requestAnimationFrame(resizeCanvases);
        }
    }
    leftImage.onload = checkBothLoaded;
    rightImage.onload = checkBothLoaded;
}

function resizeCanvases() {
    leftCanvas.width = leftImage.naturalWidth;
    leftCanvas.height = leftImage.naturalHeight;
    rightCanvas.width = rightImage.naturalWidth;
    rightCanvas.height = rightImage.naturalHeight;

    leftCanvas.style.width = leftImage.offsetWidth + "px";
    leftCanvas.style.height = leftImage.offsetHeight + "px";
    rightCanvas.style.width = rightImage.offsetWidth + "px";
    rightCanvas.style.height = rightImage.offsetHeight + "px";

    leftCtx.drawImage(leftImage, 0, 0, leftCanvas.width, leftCanvas.height);
    rightCtx.drawImage(rightImage, 0, 0, rightCanvas.width, rightCanvas.height);
}

function restartLevel() {
    message.textContent = "";
    comboStreak = 0;
    hintsLeft = 3;
    updateHintDisplay();
    score = Math.max(0, score - 10);
    loadLevel(currentLevel);
}

function handleClick(x, y, side) {
    if (gameOver) return;

    const canvas = side === "left" ? leftCanvas : rightCanvas;
    const ctx = side === "left" ? leftCtx : rightCtx;
    const image = side === "left" ? leftImage : rightImage;

    // Step 1: Scale the click to the image's natural/original resolution
    const scaleX = image.naturalWidth / canvas.clientWidth;
    const scaleY = image.naturalHeight / canvas.clientHeight;

    const scaledX = x * scaleX;
    const scaledY = y * scaleY;
    console.log(scaledX, scaledY);

    let hit = false;
    const differences = activeLevels[currentLevel].differences;
    for (let i = 0; i < differences.length; i++) {
        const diff = differences[i];
        if (found.includes(i)) continue;

        const dx = diff.x;
        const dy = diff.y;
        const radius = diff.radius || 15;
        const dist = Math.sqrt((scaledX - dx) ** 2 + (scaledY - dy) ** 2);
        if (dist <= radius) {
            hit = true;
            found.push(i);

            drawShape(leftCtx, dx, dy, "lime", radius, diff.shape || "circle", false, diff.width, diff.height);
            drawShape(rightCtx, dx, dy, "lime", radius, diff.shape || "circle", false, diff.width, diff.height);

            if (musicOn) correctSound.play();

            comboStreak++;
            const comboBonus = comboStreak >= 4 ? 5 : 0;
            score += 10 + comboBonus;
            message.textContent = comboBonus > 0 ? `🔥 Combo X${comboStreak}! +${comboBonus}` : "";
            updateFoundCounter();
            updateScoreDisplay();
            updateHighScore();
            showSparkle(e.clientX, e.clientY, 'limegreen');

            if (found.length === differences.length) {
                clearInterval(timerInterval);
                message.textContent = "🎉 Level Complete!";
                disableClicks();
                setTimeout(() => {
                    if (++currentLevel < activeLevels.length) loadLevel(currentLevel);
                    else showEndScreen(true);
                }, 2000);
            }
        }
    }

    if (!hit) {
        drawShape(ctx, x, y, "red", 20, "circle", true);
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

    const remaining = activeLevels[currentLevel].differences
        .map((d, i) => ({diff: d, index: i}))
        .filter((d) => !found.includes(d.index));

    if (remaining.length > 0) {
        const random = remaining[Math.floor(Math.random() * remaining.length)];
        found.push(random.index);
        hintFound.push(random.index);
        updateFoundCounter();
        const offset = leftImage.width + 20;
        drawShape(random.diff.x + offset, random.diff.y, "green", random.diff.radius, random.diff.shape || "circle", false, random.diff.width, random.diff.height);
        drawShape(random.diff.x, random.diff.y, "green", random.diff.radius, random.diff.shape || "circle", false, random.diff.width, random.diff.height);
        hintsLeft--;
        updateHintDisplay();
        score = Math.max(0, score - 5); // Optional penalty
        updateScoreDisplay();
        if (found.length === activeLevels[currentLevel].differences.length) {
            clearInterval(timerInterval);
            message.textContent = "🎉 Level Complete!";
            disableClicks();
            setTimeout(() => {
                if (++currentLevel < activeLevels.length) loadLevel(currentLevel); else showEndScreen(true);
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
    lives = 20;
    hintsLeft = 3;
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
    const percent = (currentLevel / activeLevels.length) * 100 || 5;
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
    handleClick({
        clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {
        }
    });
    e.preventDefault();
}, {passive: false});
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
    showChapterSelectScreen();

    const savedTheme = localStorage.getItem("theme") || "light";
    updateThemeUI(savedTheme);

    document.getElementById("highScore").textContent = `High Score: ${highScore}`;
    updateHighScore();
    updateMusicState();
});

function startGame() {
    if (!activeLevels || activeLevels.length === 0) {
        alert("No levels available in the selected chapter.");
        return;
    }
    currentLevel = selectedLevel || 0;
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
    const addHintBtn = document.getElementById("addHintButton");
    hintBtn.textContent = `Hint: ${hintsLeft}`;
    hintBtn.disabled = hintsLeft === 0;
    addHintBtn.disabled = (hintsLeft !== 0);
}

function showChapterSelectScreen() {
    const container = document.getElementById("chapterButtons");
    container.innerHTML = "";

    Object.entries(Chapters).forEach(([chapterKey, levels], i) => {
        if (!levels || levels.length === 0) return; // Skip empty chapters
        const btn = document.createElement("button");
        btn.textContent = `Chapter ${i + 1}`;
        btn.className = "level-btn";
        btn.onclick = () => {
            currentChapter = chapterKey;
            activeLevels = pickLevels(Chapters[currentChapter], 10);
            selectedLevel = 0;
            highlightSelectedChapter(chapterKey);
        };
        container.appendChild(btn);
    });

    document.getElementById("startScreen").style.display = "none";
    document.getElementById("chapterSelectScreen").style.display = "flex";
}

function highlightSelectedChapter(chapterKey) {
    const buttons = document.querySelectorAll("#chapterButtons button");
    buttons.forEach(btn => {
        btn.style.backgroundColor = btn.textContent.includes(chapterKey.replace("chapter", "Chapter ")) ? "#5aafff" : "";
    });
}

function goToLevelSelect() {
    if (!currentChapter) {
        alert("Please select a chapter first!");
        return;
    }
    document.getElementById("chapterSelectScreen").style.display = "none";
    showLevelSelectScreen(); // your existing level selection
}

function showLevelSelectScreen() {
    const container = document.getElementById("levelButtons");
    container.innerHTML = "";
    activeLevels.forEach((_, index) => {
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
    const earnedThisLevel = score - levelStartScore;
    if (earnedThisLevel > 0) {
        score = Math.max(0, score - earnedThisLevel);
    }
    lives = 20;
    hintsLeft = 3;
    comboStreak = 0;
    updateLivesDisplay();
    updateHintDisplay();
    updateScoreDisplay();
    loadLevel(currentLevel);
    message.textContent = "";
    enableClicks();
}

function addHint() {
    if (gameOver || hintsLeft !== 0) return;
    showAdModal();
}

function showAdModal() {
    const modal = document.getElementById("adModal");
    const closeBtn = document.getElementById("closeAdBtn");

    modal.style.display = "flex";
    closeBtn.disabled = true;
    closeBtn.textContent = "Please wait...";
    setTimeout(() => {
        closeBtn.disabled = false;
        closeBtn.textContent = "🎁Close Ad";
    }, 5000);
}

document.getElementById("closeAdBtn").addEventListener("click", () => {
    const modal = document.getElementById("adModal");
    modal.style.display = "none";
    hintsLeft++;
    updateHintDisplay();
    message.textContent = "✅ Hint added after watching ad!";
});

function updateScore(isCorrect) {
    if (isCorrect) {
        comboStreak++;
        let bonus = comboStreak >= 3 ? 5 : 0;
        score += 10 + bonus;
    } else {
        comboStreak = 0;
        score = Math.max(0, score - 5);
    }
}



// leftImg.addEventListener('touchstart', function (e) {
//     const rect = leftImg.getBoundingClientRect();
//     const touch = e.touches[0];
//     const x = touch.clientX - rect.left;
//     const y = touch.clientY - rect.top;
//     handleClick(x, y);
// });
//
// rightImg.addEventListener('touchstart', function (e) {
//     const rect = rightImg.getBoundingClientRect();
//     const touch = e.touches[0];
//     const x = touch.clientX - rect.left;
//     const y = touch.clientY - rect.top;
//     handleClick(x, y);
// });
//leftImage.addEventListener("touchstart", handleTouch);
// rightImage.addEventListener("touchstart", handleTouch);
//
// function handleTouch(e) {
//     const rect = e.target.getBoundingClientRect();
//     const touch = e.touches[0];
//     const x = touch.clientX - rect.left;
//     const y = touch.clientY - rect.top;
//     const side = e.target.id === "leftImage" ? "left" : "right";
//     handleClick(x, y, side);
// }
//
