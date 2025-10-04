// === Constants ===
const BOARD_WIDTH = 360;
const BOARD_HEIGHT = 640;

const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const BIRD_X = BOARD_WIDTH / 8;
const FLAP_STRENGTH = -7.5;
const GRAVITY = 0.5;

const PIPE_WIDTH = 64;
const PIPE_HEIGHT = 512;
const BASE_PIPE_SPEED = -3;
const BASE_PIPE_GAP = 160;
const BASE_PIPE_INTERVAL = 1600;

const DIFFICULTY_STEP = 25;
const MIN_PIPE_GAP = 100;
const MIN_PIPE_INTERVAL = 900;

let currentPipeSpeed = BASE_PIPE_SPEED;
let currentPipeGap = BASE_PIPE_GAP;
let currentPipeInterval = BASE_PIPE_INTERVAL;
let currentDifficultyLevel = 0;

let flapSound = new Audio("music/flappy-bird/Wing.mp3");
let hitSound = new Audio("music/flappy-bird/Hit.mp3");
let dieSound = new Audio("music/flappy-bird/Die.mp3");

let board, context;
let birdImg, topPipeImg, bottomPipeImg;
let pipeIntervalId = null;
let countdownTimer = null;
let isPaused = false;
let isMuted = false;

let bird = {
    x: BIRD_X,
    y: BOARD_HEIGHT / 2,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT,
    velocityY: 0
};

let pipeArray = [];
let gameOver = false;
let score = 0;
let highScore = Number(localStorage.getItem("flappyBirdHighScore")) || 0;

let scoreElement, highScoreElement;

const themes = {
    default: {
        bird: "./images/Flappy-bird/flappybird.png",
        topPipe: "./images/Flappy-bird/top-pipe.png",
        bottomPipe: "./images/Flappy-bird/bottompipe.png",
        backgroundImage: "./images/Flappy-bird/flappybirdbg.png",
        backgroundColor: "#70c5ce"
    },
    dark: {
        bird: "./images/Flappy-bird/blue-flappyBird.png",
        topPipe: "./images/Flappy-bird/dark-pipe-top.png",
        bottomPipe: "./images/Flappy-bird/dark-pipe-bottom.png",
        backgroundImage: "./images/Flappy-bird/light.png",
        backgroundColor: "#222"
    },
    ice: {
        bird: "./images/Flappy-bird/flappybird1.png",
        topPipe: "./images/Flappy-bird/pipe-top.png",
        bottomPipe: "./images/Flappy-bird/pipe-bottom.png",
        backgroundColor: "#e0f7ff"
    },
    lava: {
        bird: "./images/Flappy-bird/flappybird2.png",
        topPipe: "./images/Flappy-bird/pipe-top.png",
        bottomPipe: "./images/Flappy-bird/pipe-bottom.png",
        backgroundImage: "./images/Flappy-bird/light.png",
        backgroundColor: "#ff5733"
    }
};

window.addEventListener("DOMContentLoaded", () => {
    board = document.getElementById("board");
    board.width = BOARD_WIDTH;
    board.height = BOARD_HEIGHT;
    context = board.getContext("2d");

    scoreElement = document.getElementById("score");
    highScoreElement = document.getElementById("high-score");

    scoreElement.textContent = 0;
    highScoreElement.textContent = Math.floor(highScore);

    // Pause button
    const pauseBtn = document.getElementById("pauseBtn");
    pauseBtn.addEventListener("click", () => {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? "Resume" : "Pause";
    });

    const muteBtn = document.getElementById("muteBtn");
    muteBtn.addEventListener("click", () => {
        isMuted = !isMuted;
        muteBtn.textContent = isMuted ? "🔇 Sound Off" : "🔊 Sound On";
    });

    const themeSelect = document.getElementById("themeSelect");
    themeSelect.addEventListener("change", (e) => {
        const selectedTheme = e.target.value;
        localStorage.setItem("flappyBirdTheme", selectedTheme);
    });

    // Restore saved theme
    const savedTheme = localStorage.getItem("flappyBirdTheme") || "default";
    themeSelect.value = savedTheme;
    const theme = themes[savedTheme] || themes.default;
    // Load images
    birdImg = new Image();
    birdImg.src = theme.bird;
    birdImg.onerror = () => console.error("Bird image failed to load");

    topPipeImg = new Image();
    topPipeImg.src = theme.topPipe;

    bottomPipeImg = new Image();
    bottomPipeImg.src = theme.bottomPipe;
    board.style.backgroundImage = `url("${theme.backgroundImage}")`;
    board.style.backgroundColor = theme.backgroundColor || "#70c5ce";
    startCountdown();
});

function update() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    if (isPaused) {
        requestAnimationFrame(update);
        return;
    }

    requestAnimationFrame(update);
    context.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // === Update Bird ===
    bird.velocityY += GRAVITY;
    bird.y = Math.max(bird.y + bird.velocityY, 0);

    if (bird.y + bird.height >= BOARD_HEIGHT) {
        gameOver = true;
        if (!isMuted) dieSound.play();
    }

    let difficultyLevel = Math.floor(score / DIFFICULTY_STEP);

    if (difficultyLevel > currentDifficultyLevel) {
        currentDifficultyLevel = difficultyLevel;
        currentPipeSpeed = BASE_PIPE_SPEED - (difficultyLevel * 0.25);
        currentPipeGap = Math.max(BASE_PIPE_GAP - (difficultyLevel * 5), MIN_PIPE_GAP);
        let newInterval = Math.max(BASE_PIPE_INTERVAL - (difficultyLevel * 50), MIN_PIPE_INTERVAL);
        if (newInterval !== currentPipeInterval) {
            currentPipeInterval = newInterval;
            if (pipeIntervalId) clearInterval(pipeIntervalId);
            pipeIntervalId = setInterval(placePipes, currentPipeInterval);
        }
    }

    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    for (let pipe of pipeArray) {
        pipe.x += currentPipeSpeed;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            score += 0.5; // Add 0.5 per pipe, so a pair = 1
            scoreElement.textContent = Math.floor(score);
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            if (!isMuted) hitSound.play();
        }
    }

    pipeArray = pipeArray.filter(pipe => pipe.x + pipe.width > 0);
}

function placePipes() {
    if (gameOver || isPaused) return;

    let minY = -PIPE_HEIGHT + 100;
    let maxY = -100;
    let topY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    let topPipe = {
        img: topPipeImg,
        x: BOARD_WIDTH,
        y: topY,
        width: PIPE_WIDTH,
        height: PIPE_HEIGHT,
        passed: false
    };

    let bottomPipe = {
        img: bottomPipeImg,
        x: BOARD_WIDTH,
        y: topY + PIPE_HEIGHT + currentPipeGap,
        width: PIPE_WIDTH,
        height: PIPE_HEIGHT,
        passed: false
    };

    pipeArray.push(topPipe, bottomPipe);
}

function handleInput(e) {
    const isKey = e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX";
    const isTouch = e.type === "touchstart";
    const isClick = e.type === "mousedown" && e.button === 0;

    if (isKey || isTouch || isClick) {
        if (gameOver) {
            resetGame();
        } else {
            bird.velocityY = FLAP_STRENGTH;
            if (!isMuted) flapSound.play();
        }
    }
}

function resetGame() {
    if (pipeIntervalId) clearInterval(pipeIntervalId);
    bird.y = BOARD_HEIGHT / 2;
    bird.velocityY = 0;
    pipeArray = [];
    score = 0;
    gameOver = false;

    currentPipeSpeed = BASE_PIPE_SPEED;
    currentPipeGap = BASE_PIPE_GAP;
    currentPipeInterval = BASE_PIPE_INTERVAL;
    currentDifficultyLevel = 0;

    scoreElement.textContent = "0";

    startCountdown();
}

function drawGameOver() {
    updateHighScore();
    context.fillStyle = "white";
    context.font = "35px sans-serif";
    context.fillText("GAME OVER", 50, 100);
    context.fillText("Score: " + Math.floor(score), 50, 160);
    context.fillText("High Score: " + highScore, 50, 220);
    context.fillText("Press Space/Tap", 25, 280);
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("flappyBirdHighScore", highScore);
    }
    highScoreElement.textContent = Math.floor(highScore);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width - 2 &&
        a.x + a.width - 2 > b.x &&
        a.y < b.y + b.height - 2 &&
        a.y + a.height - 2 > b.y;
}

function startCountdown() {
    let counter = 3;
    const overlay = document.getElementById("timerOverlay");
    const countDown = document.getElementById("countDown");
    overlay.style.display = "flex";
    countDown.textContent = counter;

    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
        counter--;
        if (counter > 0) {
            countDown.textContent = counter;
        } else if (counter === 0) {
            countDown.textContent = "GO!";
        } else {
            clearInterval(countdownTimer);
            overlay.style.display = "none";

            document.addEventListener("keydown", handleInput);
            document.addEventListener("touchstart", handleInput);
            document.addEventListener("mousedown", handleInput);

            pipeIntervalId = setInterval(placePipes, currentPipeInterval);
            requestAnimationFrame(update);
        }
    }, 1000);
}

function resizeCanvas() {
    let scale = Math.min(window.innerWidth / 380, window.innerHeight / 800);
    board.style.transform = `scale(${scale})`;
    board.style.transformOrigin = "top left";
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", resizeCanvas);