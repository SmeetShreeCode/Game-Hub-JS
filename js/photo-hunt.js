let currentLevel = 0, levelStartScore = 0, found = [], hintFound = [], score = 0, timeLeft = 60,
    lives = 20, hintsLeft = 3, comboStreak = 0, selectedLevel = 0, gameOver = false;
let timerInterval;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let musicOn = JSON.parse(localStorage.getItem("musicOn")) ?? true;
let ambientMode = JSON.parse(localStorage.getItem("ambientMode")) || false;
let selectedChapter = null;
let selectedMode = null;

const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const bonusSound = document.getElementById("bonusSound");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const message = document.getElementById("message");
const livesDisplay = document.getElementById("lives");
const musicToggleBtn = document.getElementById("musicToggleBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");

const leftImage = document.getElementById("leftImage");
const leftCanvas = document.getElementById("leftCanvas");
const leftCtx = leftCanvas.getContext("2d");

const rightImage = document.getElementById("rightImage");
const rightCanvas = document.getElementById("rightCanvas");
const rightCtx = rightCanvas.getContext("2d");

console.log(PhotoHuntLevels);
function updateLivesDisplay() {
    const heart = '❤️';
    const lost = '🤍';
    const total = 20;
    livesDisplay.innerHTML = `${heart.repeat(Math.max(0, Math.min(lives, total)))}${lost.repeat(Math.max(0, total - Math.max(0, Math.min(lives, total))))}`;
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateFoundCounter() {
    const total = (activeLevels && activeLevels[currentLevel] && activeLevels[currentLevel].differences) ? activeLevels[currentLevel].differences.length : 0;
    const foundCount = found.length;
    const el = document.getElementById("foundCounter");
    if (el) el.textContent = `Found: ${foundCount} / ${total}`;
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }
    const el = document.getElementById("highScore");
    if (el) el.textContent = `High Score: ${highScore}`;
}

function updateHintDisplay() {
    const hintBtn = document.getElementById("hintButton");
    const addHintBtn = document.getElementById("addHintButton");
    if (hintBtn) {
        hintBtn.textContent = `Hint: ${hintsLeft}`;
        hintBtn.disabled = hintsLeft === 0 || gameOver;
    }
    if (addHintBtn) addHintBtn.style.display = hintsLeft === 0 && !gameOver ? "inline-block" : "none";
}

function updateMusicState() {
    if (musicToggleBtn) musicToggleBtn.textContent = musicOn ? "🔊 Music On" : "🔇 Music Off";
    [correctSound, wrongSound, bonusSound].forEach(audio => {
        if (audio) audio.muted = !musicOn;
    });
}

function updateThemeUI(theme) {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${theme}-theme`);
    if (themeToggleBtn) themeToggleBtn.textContent = theme === "dark" ? "🌙Dark Theme" : "🌞Light Theme";
    localStorage.setItem("theme", theme);
}

const Chapters = {};
const unlockedChapter = parseInt(localStorage.getItem("unlockedChapter")) || 1;

PhotoHuntLevels.forEach((chapter, index) => {
    const btn = document.createElement("button");
    btn.textContent = `Chapter ${chapter.chapter}`;
    if (index + 1 > unlockedChapter) {
        btn.disabled = true;
        btn.title = "Complete previous chapters to unlock";
    }
    btn.addEventListener("click", () => {
        selectedChapter = chapter;
        highlightSelection(chapterButtons, btn);
    });
    chapterButtons.appendChild(btn);
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
let currentChapter = "chapter1";
let activeLevels = getLevels(currentChapter, 10);

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
            setTimeout(() => restartLevel(), 1500);
        }
    }, 1000);
}

function disableClicks() {
    gameOver = true;
}

function enableClicks() {
    gameOver = false;
}

function drawShape(ctx, x, y, color = "red", radius = 20, shape = "circle", width = null, height = null) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    if (shape === "square" || shape === "rect") {
        const w = width ?? (radius * 2);
        const h = height ?? (radius * 2);
        ctx.strokeRect(Math.round(x - w / 2), Math.round(y - h / 2), Math.round(w), Math.round(h));
    } else {
        ctx.beginPath();
        ctx.arc(Math.round(x), Math.round(y), radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
    ctx.restore();
}

function redrawCanvasesOverlay() {
    leftCtx.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
    if (leftImage.naturalWidth && leftImage.complete) {
        leftCtx.drawImage(leftImage, 0, 0, leftCanvas.width, leftCanvas.height);
    }
    rightCtx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
    if (rightImage.naturalWidth && rightImage.complete) {
        rightCtx.drawImage(rightImage, 0, 0, rightCanvas.width, rightCanvas.height);
    }

    const differences = activeLevels[currentLevel] && activeLevels[currentLevel].differences ? activeLevels[currentLevel].differences : [];
    found.forEach((index) => {
        const diff = differences[index];
        if (!diff) return;
        const color = hintFound.includes(index) ? "green" : "lime";
        drawShape(leftCtx, diff.x, diff.y, color, diff.radius || 15, diff.shape || "circle", diff.width, diff.height);
        drawShape(rightCtx, diff.x, diff.y, color, diff.radius || 15, diff.shape || "circle", diff.width, diff.height);
    });
}

function loadLevel(levelIndex) {
    const level = activeLevels[levelIndex];
    if (!level) {
        showEndScreen(true);
        return;
    }
    preloadImages(level, (preloadedLeft, preloadedRight) => {
        leftImage.src = preloadedLeft.src;
        rightImage.src = preloadedRight.src;
        updateProgressBar();
        clearInterval(timerInterval);
        found = [];
        hintFound = [];
        lives = 20;
        hintsLeft = 3;
        levelStartScore = score;
        message.textContent = "";
        enableClicks();
        updateUI();
        let loaded = 0;
        function checkBothLoaded() {
            loaded++;
            if (loaded < 2) return;
            requestAnimationFrame(() => {
                resizeCanvases();
                redrawCanvasesOverlay();
                startTimer();
            });
        }
        leftImage.onload = checkBothLoaded;
        rightImage.onload = checkBothLoaded;

        if (leftImage.complete) checkBothLoaded();
        if (rightImage.complete) checkBothLoaded();
    });
}

function resizeCanvases() {
    leftCanvas.width = leftImage.naturalWidth || leftImage.width || leftCanvas.clientWidth;
    leftCanvas.height = leftImage.naturalHeight || leftImage.height || leftCanvas.clientHeight;
    rightCanvas.width = rightImage.naturalWidth || rightImage.width || rightCanvas.clientWidth;
    rightCanvas.height = rightImage.naturalHeight || rightImage.height || rightCanvas.clientHeight;

    leftCanvas.style.width = leftImage.offsetWidth + "px";
    leftCanvas.style.height = leftImage.offsetHeight + "px";
    rightCanvas.style.width = rightImage.offsetWidth + "px";
    rightCanvas.style.height = rightImage.offsetHeight + "px";

    if (leftImage.naturalWidth) leftCtx.drawImage(leftImage, 0, 0, leftCanvas.width, leftCanvas.height);
    if (rightImage.naturalWidth) rightCtx.drawImage(rightImage, 0, 0, rightCanvas.width, rightCanvas.height);
}

function restartLevel() {
    message.textContent = "";
    comboStreak = 0;
    hintsLeft = 3;
    updateHintDisplay();
    score = Math.max(0, score - 10);
    loadLevel(currentLevel);
}

function getScaledCoordsFromEvent(e, canvas, image) {
    const rect = canvas.getBoundingClientRect();
    const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const scaleX = (image.naturalWidth || image.width) / rect.width;
    const scaleY = (image.naturalHeight || image.height) / rect.height;
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;
    return { scaledX, scaledY, clientX, clientY };
}
window.debugMode = false;

document.addEventListener("keydown", (e) => {
    if (e.key === "D" || e.key === "d") {
        debugMode = !debugMode;
        alert("Debug Mode: " + (debugMode ? "ON" : "OFF"));
    }
});
function handleCanvasClick(e, side) {
    if (gameOver) return;
    const canvas = side === "left" ? leftCanvas : rightCanvas;
    const ctx = side === "left" ? leftCtx : rightCtx;
    const image = side === "left" ? leftImage : rightImage;

    const { scaledX, scaledY, clientX, clientY } = getScaledCoordsFromEvent(e, canvas, image);
    if (debugMode) {
        console.log("Scaled coords:", scaledX, scaledY);
    }
    let hit = false;
    const differences = activeLevels[currentLevel].differences || [];
    for (let i = 0; i < differences.length; i++) {
        const diff = differences[i];
        if (found.includes(i)) continue;

        const dx = diff.x;
        const dy = diff.y;
        const radius = diff.radius || 15;
        const dist = Math.hypot(scaledX - dx, scaledY - dy);
        if (dist <= radius) {
            hit = true;
            found.push(i);
            drawShape(leftCtx, dx, dy, "lime", radius, diff.shape || "circle", diff.width, diff.height);
            drawShape(rightCtx, dx, dy, "lime", radius, diff.shape || "circle", diff.width, diff.height);

            if (musicOn && correctSound) {
                try { correctSound.currentTime = 0; correctSound.play(); } catch (err) {}
            }

            comboStreak++;
            const comboBonus = comboStreak >= 4 ? 5 : 0;
            score += 10 + comboBonus;
            message.textContent = comboBonus > 0 ? `🔥 Combo X${comboStreak}! +${comboBonus}` : "";
            updateFoundCounter();
            updateScoreDisplay();
            updateHighScore();
            showSparkle(clientX, clientY, 'limegreen');

            if (found.length === differences.length) {
                clearInterval(timerInterval);
                message.textContent = "🎉 Level Complete!";
                disableClicks();
                setTimeout(() => {
                    if (++currentLevel < activeLevels.length) loadLevel(currentLevel);
                    else showEndScreen(true);
                }, 1000);
            }
            break;
        }
    }

    if (!hit) {
        drawShape(ctx, scaledX, scaledY, "red", 20, "circle");
        score = Math.max(0, score - 5);
        lives--;
        comboStreak = 0;
        updateLivesDisplay();
        updateScoreDisplay();
        showSparkle(clientX, clientY, 'red');

        if (musicOn && wrongSound) {
            try { wrongSound.currentTime = 0; wrongSound.play(); } catch (err) {}
        }

        setTimeout(() => {
            redrawCanvasesOverlay();
        }, 700);

        if (lives <= 0) {
            clearInterval(timerInterval);
            message.textContent = "💀 Game Over!";
            showEndScreen(false);
            disableClicks();
        }
    }
}

leftCanvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    handleCanvasClick(e, "left");
});
rightCanvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    handleCanvasClick(e, "right");
});

function showHint() {
    if (gameOver || hintsLeft <= 0) return;
    if (musicOn && bonusSound) {
        try { bonusSound.currentTime = 0; bonusSound.play(); } catch (err) {}
    }
    const diffs = activeLevels[currentLevel].differences || [];
    const remaining = diffs.map((d, i) => ({ diff: d, index: i })).filter(d => !found.includes(d.index));
    if (remaining.length === 0) return;

    const random = remaining[Math.floor(Math.random() * remaining.length)];
    found.push(random.index);
    hintFound.push(random.index);
    drawShape(leftCtx, random.diff.x, random.diff.y, "green", random.diff.radius || 15, random.diff.shape || "circle", random.diff.width, random.diff.height);
    drawShape(rightCtx, random.diff.x, random.diff.y, "green", random.diff.radius || 15, random.diff.shape || "circle", random.diff.width, random.diff.height);

    hintsLeft--;
    score = Math.max(0, score - 5);
    updateUI();

    if (found.length === diffs.length) {
        clearInterval(timerInterval);
        message.textContent = "🎉 Level Complete!";
        disableClicks();
        setTimeout(() => {
            if (++currentLevel < activeLevels.length) loadLevel(currentLevel); else showEndScreen(true);
        }, 1000);
    }
}

function addHint() {
    if (gameOver || hintsLeft !== 0) return;
    showAdModal();
}

function showAdModal() {
    const modal = document.getElementById("adModal");
    const closeBtn = document.getElementById("closeAdBtn");
    if (!modal || !closeBtn) return;
    modal.style.display = "flex";
    closeBtn.disabled = true;
    closeBtn.textContent = "Please wait...";
    setTimeout(() => {
        closeBtn.disabled = false;
        closeBtn.textContent = "🎁Close Ad";
    }, 5000);
}
document.getElementById("closeAdBtn")?.addEventListener("click", () => {
    const modal = document.getElementById("adModal");
    if (!modal) return;
    modal.style.display = "none";
    hintsLeft++;
    updateUI();
    message.textContent = "✅ Hint added after watching ad!";
});

function showEndScreen(isWin) {
    disableClicks();
    const endScreen = document.getElementById("endScreen");
    if (!endScreen) return;
    endScreen.style.display = "flex";
    document.getElementById("endTitle").textContent = isWin ? "🎉 You Win!" : "💀 Game Over!";
    document.getElementById("finalScore").textContent = `Your final score: ${score}`;
    const currentChapterNum = selectedChapter.chapter;
    if (isWin && currentLevel >= activeLevels.length - 1 && currentChapterNum >= unlockedChapter) {
        localStorage.setItem("unlockedChapter", currentChapterNum + 1);
    }
}
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

function updateLeaderboard(score) {
    const name = prompt("Enter your initials (3 chars):", "ABC").toUpperCase().slice(0, 3);
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5); // keep top 5
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function preloadImages(level, callback) {
    const left = new Image();
    const right = new Image();
    let loaded = 0;

    function checkLoaded() {
        if (++loaded === 2) callback(left, right);
    }

    left.onload = checkLoaded;
    right.onload = checkLoaded;
    left.src = level.images.left;
    right.src = level.images.right;
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

    updateUI();
    const pb = document.getElementById("progressBar");
    if (pb) pb.style.width = "0%";
    const end = document.getElementById("endScreen");
    if (end) end.style.display = "none";
    message.textContent = "";
    showLevelSelectScreen();
}

document.getElementById("restartLevelBtn")?.addEventListener("click", () => {
    if (gameOver) return;
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
    updateUI();
    loadLevel(currentLevel);
    message.textContent = "";
    enableClicks();
}

function showSparkle(x, y, color = 'yellow') {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.position = "absolute";
    sparkle.style.left = `${x - 10}px`;
    sparkle.style.top = `${y - 10}px`;
    sparkle.style.width = "20px";
    sparkle.style.height = "20px";
    sparkle.style.borderRadius = "50%";
    sparkle.style.backgroundColor = color;
    sparkle.style.opacity = "0.9";
    sparkle.style.zIndex = 9999;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 600);
}

function updateProgressBar() {
    const percent = (currentLevel / (activeLevels.length || 1)) * 100 || 5;
    const bar = document.getElementById("progressBar");
    if (bar) bar.style.width = `${percent}%`;
}

function toggleMusic() {
    musicOn = !musicOn;
    localStorage.setItem("musicOn", JSON.stringify(musicOn));
    updateMusicState();
}

musicToggleBtn?.addEventListener("click", toggleMusic);
themeToggleBtn?.addEventListener("click", () => {
    const current = localStorage.getItem("theme") || "light";
    updateThemeUI(current === "light" ? "dark" : "light");
});

function showChapterSelectScreen() {
    const chapterButtons = document.getElementById("chapterButtons");
    const modeButtons = document.getElementById("modeButtons");

    chapterButtons.innerHTML = "";
    modeButtons.innerHTML = "";

    PhotoHuntLevels.forEach((chapter, index) => {
        const btn = document.createElement("button");
        btn.textContent = `Chapter ${chapter.chapter}`;
        btn.addEventListener("click", () => {
            selectedChapter = chapter;
            highlightSelection(chapterButtons, btn);
        });
        chapterButtons.appendChild(btn);
    });

    ["easy", "medium", "hard"].forEach(mode => {
        const btn = document.createElement("button");
        btn.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
        btn.addEventListener("click", () => {
            selectedMode = mode;
            highlightSelection(modeButtons, btn);
        });
        modeButtons.appendChild(btn);
    });

    document.getElementById("chapterSelectScreen").style.display = "block";
}

function highlightSelection(container, selectedBtn) {
    Array.from(container.children).forEach(btn => btn.classList.remove("selected"));
    selectedBtn.classList.add("selected");
}

function goToLevelSelect() {
    if (!selectedChapter || !selectedMode) {
        alert("Please select both a chapter and a difficulty mode.");
        return;
    }

    const levels = selectedChapter[selectedMode];
    if (!levels || levels.length === 0) {
        alert(`No levels found for ${selectedMode} mode in Chapter ${selectedChapter.chapter}`);
        return;
    }

    activeLevels = pickLevels(levels, 10);
    currentLevel = 0;

    document.getElementById("chapterSelectScreen").style.display = "none";
    loadLevel(currentLevel);
}

function showLevelSelectScreen() {
    const container = document.getElementById("levelButtons");
    if (!container) return;
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
    document.getElementById("startScreen") && (document.getElementById("startScreen").style.display = "none");
    document.getElementById("levelSelectScreen") && (document.getElementById("levelSelectScreen").style.display = "flex");
}

function highlightSelectedLevel(index) {
    const buttons = document.querySelectorAll("#levelButtons button");
    buttons.forEach((btn, i) => {
        btn.style.backgroundColor = i === index ? "#5aafff" : "";
    });
}

function startGame() {
    if (!activeLevels || activeLevels.length === 0) {
        alert("No levels available in the selected chapter.");
        return;
    }
    currentLevel = selectedLevel || 0;
    document.getElementById("startScreen") && (document.getElementById("startScreen").style.display = "none");
    document.getElementById("levelSelectScreen") && (document.getElementById("levelSelectScreen").style.display = "none");
    loadLevel(currentLevel);
}

document.getElementById("reset").addEventListener("click", restartGame);

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

function updateUI() {
    updateLivesDisplay();
    updateScoreDisplay();
    updateFoundCounter();
    updateHighScore();
    updateHintDisplay();
    updateMusicState();
}

window.addEventListener("DOMContentLoaded", () => {
    showChapterSelectScreen();
    const ambientToggle = document.getElementById("ambientModeToggle");
    if (ambientToggle) {

        ambientToggle.checked = ambientMode;
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
    }
    const savedTheme = localStorage.getItem("theme") || "light";
    updateThemeUI(savedTheme);
    document.getElementById("highScore") && (document.getElementById("highScore").textContent = `High Score: ${highScore}`);
    document.getElementById("musicToggleBtn")?.addEventListener("click", toggleMusic);
    updateHighScore();
    updateMusicState();
    updateLivesDisplay();
    updateScoreDisplay();
    updateHintDisplay();
});



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
