// === Constants ===
const BOARD_WIDTH = 360;
const BOARD_HEIGHT = 640;

const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const BIRD_X = BOARD_WIDTH / 8;
const FLAP_STRENGTH = -6;
const GRAVITY = 0.4;

const PIPE_WIDTH = 64;
const PIPE_HEIGHT = 512;
const PIPE_GAP = 150;
const PIPE_INTERVAL = 1500;
const PIPE_SPEED = -2;

// === Game State ===
let board, context;
let birdImg, topPipeImg, bottomPipeImg;

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

window.addEventListener("DOMContentLoaded", () => {
    board = document.getElementById("board");
    board.width = BOARD_WIDTH;
    board.height = BOARD_HEIGHT;
    context = board.getContext("2d");

    // Load images
    birdImg = new Image();
    birdImg.src = "./images/Flappy-bird/flappybird.png";
    birdImg.onerror = () => console.error("Bird image failed to load");

    topPipeImg = new Image();
    topPipeImg.src = "./images/Flappy-bird/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./images/Flappy-bird/bottompipe.png";

    // Start game
    document.addEventListener("keydown", handleInput);
    document.addEventListener("touchstart", handleInput);
    setInterval(placePipes, PIPE_INTERVAL);
    requestAnimationFrame(update);
});

function update() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    requestAnimationFrame(update);
    context.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // === Update Bird ===
    bird.velocityY += GRAVITY;
    bird.y = Math.max(bird.y + bird.velocityY, 0);

    if (bird.y + bird.height >= BOARD_HEIGHT) {
        gameOver = true;
    }

    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // === Update Pipes ===
    for (let pipe of pipeArray) {
        pipe.x += PIPE_SPEED;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        // Score check
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            score += 0.5; // Add 0.5 per pipe, so a pair = 1
            pipe.passed = true;
        }

        // Collision
        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // Remove off-screen pipes
    pipeArray = pipeArray.filter(pipe => pipe.x + pipe.width > 0);

    // === Draw Score ===
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(Math.floor(score), 10, 50);
}

function placePipes() {
    if (gameOver) return;

    // Random top pipe Y position
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
        y: topY + PIPE_HEIGHT + PIPE_GAP,
        width: PIPE_WIDTH,
        height: PIPE_HEIGHT,
        passed: false
    };

    pipeArray.push(topPipe, bottomPipe);
}

function handleInput(e) {
    const isKey = e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX";
    const isTouch = e.type === "touchstart";

    if (isKey || isTouch) {
        if (gameOver) {
            resetGame();
        } else {
            bird.velocityY = FLAP_STRENGTH;
        }
    }
}

function resetGame() {
    bird.y = BOARD_HEIGHT / 2;
    bird.velocityY = 0;
    pipeArray = [];
    score = 0;
    gameOver = false;
    requestAnimationFrame(update);
}

function drawGameOver() {
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText("GAME OVER", 60, 90);
    context.fillText("Score: " + Math.floor(score), 60, 140);
    context.fillText("Press Space / Tap", 20, 200);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
