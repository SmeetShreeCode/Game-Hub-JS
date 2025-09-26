const DEFAULT_LIVES = 5;
const MAX_LIVES = 5;
const DEFAULT_TIME = 60;
const DEFAULT_HINTS = 3;
const HINT_PENALTY = 5;
const WRONG_PENALTY = 5;
const CORRECT_SCORE = 10;
const COMBO_BONUS = 5;
const COMBO_THRESHOLD = 4;
const MAX_SPARKLE_DURATION = 800;
const EXPLOSION_PARTICLES_SIZE = 60;
const EXPLOSION_PARTICLES_RADIUS = 55;
const LEVEL_COUNT = 10;
const BANNER_IMAGE = "images/Photo-hunt/Chapter-banners/banner.jpg";
const MAX_COMBO = 10;
const DIFF_RADIUS = 15;

let state = {
    currentLevel: 0,
    selectedLevel: 0,
    selectedChapter: null,
    selectedMode: null,
    activeLevels: [],
    levelStartScore: 0,
    score: 0,
    timeLeft: DEFAULT_TIME,
    lives: DEFAULT_LIVES,
    hintsLeft: DEFAULT_HINTS,
    comboStreak: 0,
    found: [],
    hintFound: [],
    gameOver: false,
    musicOn: JSON.parse(localStorage.getItem("musicOn")) ?? true,
    ambientMode: JSON.parse(localStorage.getItem("ambientMode")) || false,
    unlockedChapter: parseInt(localStorage.getItem("unlockedChapter")) || 1,
    unlockedLevels: JSON.parse(localStorage.getItem("unlockedLevels")) || 5,
    highScore: parseInt(localStorage.getItem("highScore")) || 0,
    timerInterval: null
};
let debugMode = false;

const els = {
    correctSound: document.getElementById("correctSound"),
    wrongSound: document.getElementById("wrongSound"),
    bonusSound: document.getElementById("bonusSound"),
    score: document.getElementById("score"),
    timer: document.getElementById("timer"),
    lives: document.getElementById("lives"),
    highScore: document.getElementById("highScore"),
    message: document.getElementById("message"),
    foundCounter: document.getElementById("foundCounter"),
    progressBar: document.getElementById("progressBar"),
    leftImg: document.getElementById("leftImage"),
    rightImg: document.getElementById("rightImage"),
    leftCanvas: document.getElementById("leftCanvas"),
    rightCanvas: document.getElementById("rightCanvas"),
    startScreen: document.getElementById("startScreen"),
    chapterSelectScreen: document.getElementById("chapterSelectScreen"),
    levelSelectScreen: document.getElementById("levelSelectScreen"),
    endScreen: document.getElementById("endScreen"),
    endTitle: document.getElementById("endTitle"),
    finalScore: document.getElementById("finalScore"),
    reset: document.getElementById("reset"),
    hintButton: document.getElementById("hintButton"),
    addHintButton: document.getElementById("addHintButton"),
    musicToggle: document.getElementById("musicToggleBtn"),
    themeToggle: document.getElementById("themeToggleBtn"),
    ambientModeToggle: document.getElementById("ambientModeToggle"),
    chapterButtons: document.getElementById("chapterButtons"),
    modeButtons: document.getElementById("modeButtons"),
    levelButtons: document.getElementById("levelButtons"),
    adModal: document.getElementById("adModal"),
    closeAdBtn: document.getElementById("closeAdBtn")
};

const leftCtx = els.leftCanvas.getContext("2d");
const rightCtx = els.rightCanvas.getContext("2d");

const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const getLevel = () => state.activeLevels[state.currentLevel] || null;
const diffs = () => getLevel()?.differences || [];

function updateLives() {
    const heart = "❤️", lost = "🤍";
    const liveCount = Math.min(state.lives, MAX_LIVES);
    els.lives.innerHTML = heart.repeat(liveCount) + lost.repeat(MAX_LIVES - liveCount);
}

function updateScore() {
    els.score.textContent = `Score: ${state.score}`;
    if (state.score > state.highScore) {
        state.highScore = state.score;
        save("highScore", state.highScore);
    }
    els.highScore.textContent = `High Score: ${state.highScore}`;
}

function updateHints() {
    if (els.hintButton) {
        els.hintButton.textContent = `Hint: ${state.hintsLeft}`;
        els.hintButton.disabled = (state.hintsLeft === 0 || state.gameOver);
    }
    if (els.addHintButton) {
        els.addHintButton.style.display =
            (state.hintsLeft === 0 && !state.gameOver) ? "inline-block" : "none";
    }
}

function updateFound() {
    els.foundCounter.textContent = `Found: ${state.found.length} / ${diffs().length}`;
}

function updateProgress() {
    if (!state.activeLevels.length || state.activeLevels.length === 0) return;
    let percent = (state.currentLevel / state.activeLevels.length) * 100;
    percent = Math.max(5, Math.min(percent, 100));
    els.progressBar.style.width = `${percent}%`;
}

function updateMusic() {
    if (els.musicToggle) els.musicToggle.textContent = state.musicOn ? "🔊 Sound On" : "🔇 Sound Off";
    [els.correctSound, els.wrongSound, els.bonusSound].forEach(audio => {
        if (audio) audio.muted = !state.musicOn;
    });
}

function updateUI() {
    updateLives();
    updateScore();
    updateHints();
    updateFound();
    updateProgress();
    updateMusic();
}

function startTimer() {
    clearInterval(state.timerInterval);
    if (state.ambientMode) {
        els.timer.textContent = "Ambient Mode 🎧";
        return;
    }

    state.timeLeft = DEFAULT_TIME;
    els.timer.textContent = `Time: ${state.timeLeft}s`;
    state.timerInterval = setInterval(() => {
        state.timeLeft--;
        if (state.timeLeft <= 0) {
            clearInterval(state.timerInterval);
            endGame(false, "⏰ Time's up! Try again.");
        } else {
            els.timer.textContent = `Time: ${state.timeLeft}s`;
        }
    }, 1000);
}

function loadLevel(index) {
    const level = state.activeLevels[index];
    if (!level) return endGame(true);

    preloadImages(level, (left, right) => {
        els.leftImg.src = left.src;
        els.rightImg.src = right.src;

        state.found = [];
        state.hintFound = [];
        state.lives = DEFAULT_LIVES;
        state.hintsLeft = DEFAULT_HINTS;
        state.comboStreak = 0;
        state.levelStartScore = state.score;
        state.gameOver = false;
        els.message.textContent = "";

        updateUI();
        resizeCanvases();
        startTimer();
    });
}

function endGame(win, msg = "") {
    state.gameOver = true;
    clearInterval(state.timerInterval);
    els.message.textContent = msg;
    els.endScreen.style.display = "flex";
    els.endTitle.textContent = win ? "🎉 You Win!" : "💀 Game Over!";
    els.finalScore.textContent = `Your final score: ${state.score}`;
    if (win && state.currentLevel >= state.activeLevels.length - 1 && state.selectedChapter?.chapter === state.unlockedChapter) {
        state.unlockedChapter++;
        save("unlockedChapter", state.unlockedChapter);
    }
}

function playSound(audio) {
    if (state.musicOn && audio) {
        try {
            audio.currentTime = 0;
            audio.play();
        } catch (err) {
        }
    }
}

function preloadImages(level, callback) {
    const imgL = new Image();
    const imgR = new Image();
    let loaded = 0;

    function onLoad() {
        loaded++;
        if (loaded === 2) callback(imgL, imgR);
    }

    imgL.onload = onLoad;
    imgR.onload = onLoad;
    imgL.src = level.images.left;
    imgR.src = level.images.right;
}

function showChapterSelectScreen() {
    if (!els.chapterButtons || !els.modeButtons) return;

    els.chapterButtons.innerHTML = "";
    els.modeButtons.innerHTML = "";

    // Create chapter banner slider
    PhotoHuntLevels.forEach((chapter) => {
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";

        const img = document.createElement("img");
        img.src = chapter.banner ?? BANNER_IMAGE;
        img.className = "chapter-banner";

        const btn = document.createElement("button");
        btn.textContent = `Chapter ${chapter.chapter}`;
        btn.className = "chapter-btn";
        btn.disabled = chapter.chapter > state.unlockedChapter;
        btn.addEventListener("click", () => {
            state.selectedChapter = chapter;
            highlightSelection(els.chapterButtons, container);
        });

        container.appendChild(img);
        container.appendChild(btn);
        els.chapterButtons.appendChild(container);
    });

    // Create mode selection slider
    ["easy", "medium", "hard"].forEach(mode => {
        const btn = document.createElement("button");
        btn.className = "chapter-btn";
        btn.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
        btn.addEventListener("click", () => {
            state.selectedMode = mode;
            highlightSelection(els.modeButtons, btn);
        });
        els.modeButtons.appendChild(btn);
    });

    if (els.startScreen) els.startScreen.style.display = "none";
    if (els.chapterSelectScreen) els.chapterSelectScreen.style.display = "flex";
}

function highlightSelection(containerEl, btn) {
    Array.from(containerEl.children).forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
}

const Chapters = {};

PhotoHuntLevels.forEach(chapter => {
    Chapters[`chapter${chapter.chapter}`] = {
        easy: chapter.easy || [],
        medium: chapter.medium || [],
        hard: chapter.hard || []
    };
});

function pickLevels(levels, count = LEVEL_COUNT) {
    const arr = [...levels];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, count);
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

function redrawOverlays() {
    leftCtx.clearRect(0, 0, els.leftCanvas.width, els.leftCanvas.height);
    if (els.leftImg.complete) leftCtx.drawImage(els.leftImg, 0, 0, els.leftCanvas.width, els.leftCanvas.height);
    rightCtx.clearRect(0, 0, els.rightCanvas.width, els.rightCanvas.height);
    if (els.rightImg.complete) rightCtx.drawImage(els.rightImg, 0, 0, els.rightCanvas.width, els.rightCanvas.height);

    diffs().forEach((diff, i) => {
        if (state.found.includes(i)) {
            const color = state.hintFound.includes(i) ? "green" : "lime";
            drawShape(leftCtx, diff.x, diff.y, color, diff.radius || 15, diff.shape, diff.width, diff.height);
            drawShape(rightCtx, diff.x, diff.y, color, diff.radius || 15, diff.shape, diff.width, diff.height);
        }
    });
}

function resizeCanvases() {
    const lImg = els.leftImg, rImg = els.rightImg;
    els.leftCanvas.width = lImg.naturalWidth || lImg.width || els.leftCanvas.clientWidth;
    els.leftCanvas.height = lImg.naturalHeight || lImg.height || els.leftCanvas.clientHeight;
    els.rightCanvas.width = rImg.naturalWidth || rImg.width || els.rightCanvas.clientWidth;
    els.rightCanvas.height = rImg.naturalHeight || rImg.height || els.rightCanvas.clientHeight;

    els.leftCanvas.style.width = `${lImg.offsetWidth}px`;
    els.leftCanvas.style.height = `${lImg.offsetHeight}px`;
    els.rightCanvas.style.width = `${rImg.offsetWidth}px`;
    els.rightCanvas.style.height = `${rImg.offsetHeight}px`;

    if (lImg.complete) leftCtx.drawImage(lImg, 0, 0, els.leftCanvas.width, els.leftCanvas.height);
    if (rImg.complete) rightCtx.drawImage(rImg, 0, 0, els.rightCanvas.width, els.rightCanvas.height);
}

function getScaledCoords(e, canvas, image) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const scaleX = (image.naturalWidth || image.width) / rect.width;
    const scaleY = (image.naturalHeight || image.height) / rect.height;
    return {
        scaledX: x * scaleX,
        scaledY: y * scaleY,
        clientX,
        clientY
    };
}

window.debugMode = false;

document.addEventListener("keydown", (e) => {
    if (e.key === "D" || e.key === "d") {
        debugMode = !debugMode;
        alert("Debug Mode: " + (debugMode ? "ON" : "OFF"));
    }
});

function handleCanvasClick(e, side) {
    if (state.gameOver) return;

    const canvas = side === "left" ? els.leftCanvas : els.rightCanvas;
    const ctx = side === "left" ? leftCtx : rightCtx;
    const image = side === "left" ? els.leftImg : els.rightImg;
    const {scaledX, scaledY, clientX, clientY} = getScaledCoords(e, canvas, image);
    const level = getLevel();
    if (!level || !level.differences) return;

    if (debugMode) {
        console.log(`Scaled coords X: ${scaledX}, Y: ${scaledY}`);
    }

    let hit = false;
    diffs().forEach((diff, idx) => {
        if (hit) return;
        if (state.found.includes(idx)) return;

        const dist = Math.hypot(scaledX - diff.x, scaledY - diff.y);
        if (dist <= diff.radius) {
            hit = true;
            state.found.push(idx);
            drawShape(leftCtx, diff.x, diff.y, "lime", diff.radius || 15, diff.shape || "circle", diff.width, diff.height);
            drawShape(rightCtx, diff.x, diff.y, "lime", diff.radius || 15, diff.shape || "circle", diff.width, diff.height);

            playSound(els.correctSound);
            state.comboStreak++;
            const comboBonus = (state.comboStreak >= COMBO_THRESHOLD) ? COMBO_BONUS : 0;
            state.score += CORRECT_SCORE + comboBonus;
            els.message.textContent = comboBonus > 0 ? `🔥 Combo X${state.comboStreak}! +${comboBonus}` : "";
            updateUI();
            showSparkle(clientX, clientY, "limegreen");
            showFirework(clientX, clientY);

            if (state.found.length === diffs().length) {
                clearInterval(state.timerInterval);
                els.message.textContent = "🎉 Level Complete!";
                // endGame(true, "🎉 Level Complete!");
                state.currentLevel++;
                if (state.currentLevel < state.activeLevels.length) {
                    setTimeout(() => loadLevel(state.currentLevel), 1000);
                } else {
                    endGame(true);
                }
            }
        }
    });

    if (!hit) {
        drawShape(ctx, scaledX, scaledY, "red", 20);
        state.score = Math.max(0, state.score - WRONG_PENALTY);
        state.lives--;
        state.comboStreak = 0;
        updateUI();
        showSparkle(clientX, clientY, "red");
        playSound(els.wrongSound);

        if (state.lives <= 0) {
            clearInterval(state.timerInterval);
            els.message.textContent = "💀 Game Over!";
            endGame(false);
        } else {
            setTimeout(() => {
                redrawOverlays();
            }, 700);
        }
    }
}

els.leftCanvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    handleCanvasClick(e, "left");
});
els.rightCanvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    handleCanvasClick(e, "right");
});

function showHint() {
    if (state.gameOver || state.hintsLeft <= 0) return;
    playSound(els.bonusSound);

    const remaining = diffs().map((d, i) => ({diff: d, index: i}))
        .filter(o => !state.found.includes(o.index));
    if (remaining.length === 0) return;

    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    state.found.push(pick.index);
    state.hintFound.push(pick.index);
    const {x, y, radius = 15, shape = "circle", width, height} = pick.diff;

    drawShape(leftCtx, x, y, "green", radius || 15, shape || "circle", width, height);
    drawShape(rightCtx, x, y, "green", radius || 15, shape || "circle", width, height);

    const rect = els.rightCanvas.getBoundingClientRect();
    const screenX = rect.left + x;
    const screenY = rect.top + y;
    showSparkle(screenX, screenY, "green");
    showFirework(screenX, screenY, "#48ff00");

    state.hintsLeft--;
    state.score = Math.max(0, state.score - HINT_PENALTY);
    updateUI();

    if (state.found.length === diffs().length) {
        state.gameOver = true;
        clearInterval(state.timerInterval);
        els.message.textContent = "🎉 Level Complete!";
        state.currentLevel++;
        if (state.currentLevel < state.activeLevels.length) {
            setTimeout(() => loadLevel(state.currentLevel), 1000);
        } else {
            endGame(true);
        }
    }
}

function addHint() {
    if (state.gameOver || state.hintsLeft !== 0) return;
    showAdModal();
}

function showAdModal() {
    if (!els.adModal || !els.closeAdBtn) return;
    els.adModal.style.display = "flex";
    els.closeAdBtn.disabled = true;
    els.closeAdBtn.textContent = "Please wait...";
    setTimeout(() => {
        els.closeAdBtn.disabled = false;
        els.closeAdBtn.textContent = "🎁Close Ad";
    }, 5000);
}

if (els.closeAdBtn) {
    els.closeAdBtn.addEventListener("click", () => {
        els.adModal.style.display = "none";
        state.hintsLeft++;
        updateUI();
        els.message.textContent = "✅ Hint added after watching ad!";
    });
}

function updateLeaderboard(score) {
    let name = prompt("Enter your initials (3 chars):", "ABC") || "AAA";
    name = name.toUpperCase().slice(0, 3);
    leaderboard.push({name, score});
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5); // keep top 5
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function restartGame() {
    Object.assign(state, {
        currentLevel: 0,
        selectedLevel: 0,
        score: 0,
        lives: DEFAULT_LIVES,
        hintsLeft: DEFAULT_HINTS,
        comboStreak: 0,
        gameOver: false
    });
    clearInterval(state.timerInterval);
    updateUI();
    if (els.progressBar) els.progressBar.style.width = "0%";
    if (els.endScreen) els.endScreen.style.display = "none";
    if (els.message) els.message.textContent = "";
    if (els.startScreen) els.startScreen.style.display = "flex";
    showLevelSelectScreen();
}

document.getElementById("restartLevelBtn")?.addEventListener("click", () => {
    if (state.gameOver) return;
    // if (confirm("Are you sure you want to restart this level? Your progress on this level will be lost.")) {
    //     restartCurrentLevel();
    // }
    restartCurrentLevel();
});

function restartCurrentLevel() {
    if (state.gameOver) return;

    state.score = state.levelStartScore;
    state.lives = DEFAULT_LIVES;
    state.hintsLeft = DEFAULT_HINTS;
    state.comboStreak = 0;
    state.gameOver = false;
    updateUI();
    loadLevel(state.currentLevel);
    els.message.textContent = "🔄 Level restarted.";
}

function showFirework(x, y, color = 'gold') {
    const burst = document.createElement('div');
    burst.className = 'sparkle-burst';
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;

    const particles = EXPLOSION_PARTICLES_SIZE;
    for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        particle.className = 'sparkle-particle';
        particle.style.backgroundColor = color;
        particle.style.opacity = `${0.7 + Math.random() * 0.3}`;

        const angle = (Math.PI * 2 * i) / particles;
        const distance = EXPLOSION_PARTICLES_RADIUS + Math.random() * 30; // Pixel radius

        // Calculate x/y offsets for explosion direction
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        particle.style.setProperty('--x', `${offsetX}px`);
        particle.style.setProperty('--y', `${offsetY}px`);

        burst.appendChild(particle);
    }

    document.body.appendChild(burst);

    // Clean up after animation
    setTimeout(() => {
        burst.remove();
    }, MAX_SPARKLE_DURATION);
}

function showSparkle(x, y, color = 'yellow') {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.left = `${x - 10}px`;
    sparkle.style.top = `${y - 10}px`;
    sparkle.style.backgroundColor = color;
    sparkle.style.opacity = "0.9";
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), MAX_SPARKLE_DURATION);
}

function goToLevelSelect() {
    if (!state.selectedChapter || !state.selectedMode) {
        alert("Please select both a chapter and a difficulty mode.");
        return;
    }
    const levels = state.selectedChapter[state.selectedMode];
    if (!Array.isArray(levels) || levels.length === 0) {
        alert(`No levels found for mode "${state.selectedMode}" in Chapter ${state.selectedChapter.chapter}`);
        return;
    }
    state.activeLevels = pickLevels(levels, LEVEL_COUNT);
    state.currentLevel = 0;

    if (els.chapterSelectScreen) els.chapterSelectScreen.style.display = "none";
    if (els.levelSelectScreen) els.levelSelectScreen.style.display = "flex";

    if (els.levelButtons) {
        els.levelButtons.innerHTML = "";
        state.activeLevels.forEach((_, idx) => {
            const btn = document.createElement("button");
            btn.textContent = `Level ${idx + 1}`;
            btn.className = "level-btn";
            btn.addEventListener("click", () => {
                state.selectedLevel = idx;
                highlightSelection(els.levelButtons, btn);
            });
            els.levelButtons.appendChild(btn);
        });
        const firstBtn = els.levelButtons.querySelector("button");
        if (firstBtn) firstBtn.classList.add("selected");
    }
}

function showLevelSelectScreen() {
    const container = els.levelButtons;
    if (!container) return;
    container.innerHTML = "";
    state.activeLevels.forEach((_, idx) => {
        const btn = document.createElement("button");
        btn.textContent = `Level ${idx + 1}`;
        btn.className = "level-btn";
        btn.onclick = () => {
            state.selectedLevel = idx;
            highlightSelectedLevel(idx);
        };
        container.appendChild(btn);
    });
    highlightSelectedLevel(state.selectedLevel);
    if (els.startScreen) els.startScreen.style.display = "none";
    if (els.levelSelectScreen) els.levelSelectScreen.style.display = "flex";
}

function highlightSelectedLevel(index) {
    const buttons = document.querySelectorAll("#levelButtons button");
    buttons.forEach((btn, i) => {
        btn.style.backgroundColor = i === index ? "#5aafff" : "";
    });
}

function startGame() {
    if (!state.activeLevels || state.activeLevels.length === 0) {
        alert("No levels available in the selected chapter/mode.");
        return;
    }
    state.currentLevel = state.selectedLevel || 0;
    if (els.startScreen) els.startScreen.style.display = "none";
    if (els.levelSelectScreen) els.levelSelectScreen.style.display = "none";
    loadLevel(state.currentLevel);
}

window.addEventListener("DOMContentLoaded", () => {
    showChapterSelectScreen();

    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.classList.add(`${savedTheme}-theme`);
    if (els.themeToggle) {
        els.themeToggle.addEventListener("click", () => {
            const cur = localStorage.getItem("theme") || "light";
            const nxt = (cur === "light") ? "dark" : "light";
            document.body.classList.remove("light-theme", "dark-theme");
            document.body.classList.add(`${nxt}-theme`);
            if (els.themeToggle) els.themeToggle.textContent = nxt === "dark" ? "🌙Dark Theme" : "🌞Light Theme";
            localStorage.setItem("theme", nxt);
        });
    }

    if (els.ambientModeToggle) {
        els.ambientModeToggle.checked = state.ambientMode;

        els.ambientModeToggle.addEventListener("change", () => {
            state.ambientMode = els.ambientModeToggle.checked;
            localStorage.setItem("ambientMode", JSON.stringify(state.ambientMode));

            if (!state.gameOver) {
                startTimer();
            }
        });
    }

    if (els.musicToggle) {
        els.musicToggle.addEventListener("click", () => {
            state.musicOn = !state.musicOn;
            save("musicOn", state.musicOn);
            updateMusic();
        });
    }

    if (els.reset) {
        els.reset.addEventListener("click", () => {
            restartGame();
        });
    }

    if (els.addHintButton) {
        els.addHintButton.addEventListener("click", () => {
            showAdModal();
        });
    }

    updateUI();
});
