// ==============================
// STACK THE BLOCKS - FINAL FIX
// ==============================

let currentBlock;
let stack = [];
let blockSpeed = 220;
let direction = 1;
let score = 0;
let gameOver = false;

const GAME_WIDTH = 480;
const GAME_HEIGHT = 640;
const BLOCK_HEIGHT = 40;
const BASE_Y = GAME_HEIGHT - BLOCK_HEIGHT / 2;
const MAX_VISIBLE_BLOCKS = 6;

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#111",
    scene: { create, update }
};

new Phaser.Game(config);

// CREATE
// ==============================
function create() {
    stack = [];
    score = 0;
    blockSpeed = 220;
    direction = 1;
    gameOver = false;

    // Base block
    const base = this.add.rectangle(
        GAME_WIDTH / 2,
        BASE_Y,
        260,
        BLOCK_HEIGHT,
        0x00ffcc
    );
    stack.push(base);

    // Score UI
    this.scoreText = this.add.text(20, 20, "Score: 0", {
        fontSize: "22px",
        fill: "#ffffff"
    });

    spawnBlock.call(this);

    this.input.on("pointerdown", () => {
        if (gameOver) {
            this.scene.restart();
        } else {
            dropBlock.call(this);
        }
    });
}

// UPDATE
// ==============================
function update(time, delta) {
    if (!currentBlock || gameOver) return;

    currentBlock.x += direction * blockSpeed * (delta / 1000);

    if (currentBlock.x >= GAME_WIDTH - currentBlock.width / 2) {
        direction = -1;
    } else if (currentBlock.x <= currentBlock.width / 2) {
        direction = 1;
    }
}

// LOGIC
// ==============================
function spawnBlock() {
    const lastBlock = stack[stack.length - 1];

    currentBlock = this.add.rectangle(
        direction === 1 ? 0 : GAME_WIDTH,
        lastBlock.y - BLOCK_HEIGHT,
        lastBlock.width,
        BLOCK_HEIGHT,
        Phaser.Display.Color.RandomRGB().color
    );
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

    // Trim
    const newWidth = overlap;
    const offset = (currentBlock.width - newWidth) / 2;
    currentBlock.width = newWidth;
    currentBlock.x += currentBlock.x > lastBlock.x ? -offset : offset;

    stack.push(currentBlock);

    // 🔥 KEEP ONLY LAST N BLOCKS VISIBLE
    if (stack.length > MAX_VISIBLE_BLOCKS) {
        const removed = stack.shift();
        removed.destroy();

        // Move remaining blocks down
        stack.forEach(block => {
            block.y += BLOCK_HEIGHT;
        });
    }

    score++;
    this.scoreText.setText("Score: " + score);

    blockSpeed += 8;

    spawnBlock.call(this);
}

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
