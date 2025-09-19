let currentLevel = 0, levelStartScore = 0, found = [], hintFound = [], score = 0, timeLeft = 60, lives = 20,
    hintsLeft = 3, comboStreak = 0, selectedLevel = 0, gameOver = false;
let timerInterval;
let completedLevels = JSON.parse(localStorage.getItem("completedLevels")) || {
    chapter1: [],
    chapter2: [],
};

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

function toRelative(x, y, radius, imgW = 480, imgH = 300) {
    return {
        x: x / imgW,
        y: y / imgH,
        radius: radius / Math.min(imgW, imgH)
    };
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

// Example usage:
let currentChapter = "chapter7"; // safe even if not defined
let activeLevels = getLevels(currentChapter, 10);

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
        }, Math.random() * 2500);
    }
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
    leftCtx.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
    rightCtx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
    enableClicks();
    leftImage.src = level.images.left;
    rightImage.src = level.images.right;

    let loaded = 0;

    function checkBothLoaded() {
        if (++loaded === 2) {
            // Wait for DOM to reflow so image size is correct
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

    const differences = activeLevels[currentLevel].differences;
    for (let i = 0; i < differences.length; i++) {
        const diff = differences[i];
        if (found.includes(i)) continue;

        const dx = diff.x;
        const dy = diff.y;
        const radius = diff.radius || 15;

        // Check if the scaled click is within the difference radius
        const dist = Math.sqrt((scaledX - dx) ** 2 + (scaledY - dy) ** 2);
        if (dist <= radius) {
            found.push(i);

            drawShape(leftCtx, dx, dy, "lime", radius, diff.shape || "circle");
            drawShape(rightCtx, dx, dy, "lime", radius, diff.shape || "circle");

            updateScore(true);

            if (found.length === differences.length) {
                const chapterKey = currentChapter;
                const levelIndexInChapter = Chapters[chapterKey].indexOf(activeLevels[currentLevel]);

                if (!completedLevels[chapterKey].includes(levelIndexInChapter)) {
                    completedLevels[chapterKey].push(levelIndexInChapter);
                    localStorage.setItem("completedLevels", JSON.stringify(completedLevels));
                }
                setTimeout(() => {
                    currentLevel++;
                    if (currentLevel >= activeLevels.length) {
                        showEndScreen(true);
                    } else {
                        loadLevel(currentLevel);
                    }
                }, 1500);
            }
            return;
        }
    }

    // If not correct
    updateScore(false);
    lives--;

    // Draw red circle where the user clicked
    drawShape(ctx, x, y, "red", 20, "circle", true);

    if (lives <= 0) {
        showEndScreen(false);
        disableClicks();
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
    document.getElementById("progressBar").style.width = "0%";
    document.getElementById("endScreen").style.display = "none";
    showLevelSelectScreen();
}

function updateProgressBar() {
    const percent = (currentLevel / activeLevels.length) * 100;
    document.getElementById("progressBar").style.width = `${percent}%`;
}

function updateThemeUI(theme) {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem("theme", theme);
}

window.addEventListener("DOMContentLoaded", () => {
    showChapterSelectScreen();

    const savedTheme = localStorage.getItem("theme") || "light";
    updateThemeUI(savedTheme);

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
            activeLevels = pickLevels(levels, 10);
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
    showLevelSelectScreen();
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
