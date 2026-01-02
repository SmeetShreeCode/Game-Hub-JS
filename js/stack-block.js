// ==============================
// STACK THE BLOCKS - PHASER 3
// FULLY WORKING
// ==============================

let currentBlock;
let stack = [];
let blockSpeed = 200;
let direction = 1;
let score = 0;
let gameOver = false;

const GAME_WIDTH = 480;
const GAME_HEIGHT = 640;
const BLOCK_HEIGHT = 40;

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#111",
    scene: { preload, create, update }
};

new Phaser.Game(config);

// ==============================
// PRELOAD
// ==============================
function preload() {}

// ==============================
// CREATE
// ==============================
function create() {
    this.cameras.main.setBackgroundColor("#1a1a1a");

    // Base block
    const base = this.add.rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT - BLOCK_HEIGHT / 2,
        260,
        BLOCK_HEIGHT,
        0x00ffcc
    );
    stack.push(base);

    // First moving block
    spawnBlock.call(this);

    // UI
    this.scoreText = this.add.text(20, 20, "Score: 0", {
        fontSize: "22px",
        fill: "#ffffff"
    });

    // Input
    this.input.on("pointerdown", () => {
        if (gameOver) {
            this.scene.restart();
            resetGame();
        } else {
            dropBlock.call(this);
        }
    });
}

// ==============================
// UPDATE
// ==============================
function update(time, delta) {
    if (!currentBlock || gameOver) return;

    currentBlock.x += direction * blockSpeed * (delta / 1000);

    if (currentBlock.x > GAME_WIDTH - currentBlock.width / 2) {
        direction = -1;
    }
    if (currentBlock.x < currentBlock.width / 2) {
        direction = 1;
    }
}

// ==============================
// GAME LOGIC
// ==============================
function spawnBlock() {
    const lastBlock = stack[stack.length - 1];

    currentBlock = this.add.rectangle(
        0,
        lastBlock.y - BLOCK_HEIGHT,
        lastBlock.width,
        BLOCK_HEIGHT,
        Phaser.Display.Color.RandomRGB().color
    );

    currentBlock.x = direction === 1 ? 0 : GAME_WIDTH;
}

function dropBlock() {
    const lastBlock = stack[stack.length - 1];

    const overlap =
        Math.min(
            currentBlock.x + currentBlock.width / 2,
            lastBlock.x + lastBlock.width / 2
        ) -
        Math.max(
            currentBlock.x - currentBlock.width / 2,
            lastBlock.x - lastBlock.width / 2
        );

    if (overlap <= 0) {
        endGame.call(this);
        return;
    }

    // Trim block
    const newWidth = overlap;
    const newX =
        currentBlock.x > lastBlock.x
            ? currentBlock.x - (currentBlock.width - newWidth) / 2
            : currentBlock.x + (currentBlock.width - newWidth) / 2;

    currentBlock.width = newWidth;
    currentBlock.x = newX;

    stack.push(currentBlock);

    score++;
    this.scoreText.setText("Score: " + score);

    // Increase difficulty
    blockSpeed += 10;

    // Camera move up
    this.cameras.main.scrollY -= BLOCK_HEIGHT;

    spawnBlock.call(this);
}

// ==============================
// GAME OVER
// ==============================
function endGame() {
    gameOver = true;

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, "GAME OVER", {
        fontSize: "40px",
        fill: "#ff4444"
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, "Tap to Restart", {
        fontSize: "18px",
        fill: "#ffffff"
    }).setOrigin(0.5);
}

// ==============================
// RESET
// ==============================
function resetGame() {
    stack = [];
    blockSpeed = 200;
    direction = 1;
    score = 0;
    gameOver = false;
}
