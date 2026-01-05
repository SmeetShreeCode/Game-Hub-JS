// // ===================================
// // FALLING OBJECTS CATCH GAME
// // WITH DIFFERENT ITEMS (PHASER 3)
// // ===================================
//
// let player;
// let items;
// let score = 0;
// let lives = 3;
// let scoreText;
// let livesText;
// let gameOver = false;
//
// const ITEM_TYPES = [
//     { key: "apple", score: 10, life: 0 },
//     { key: "star", score: 30, life: 0 },
//     { key: "bomb", score: 0, life: -1 },
//     { key: "heart", score: 0, life: +1 }
// ];
//
// const config = {
//     type: Phaser.AUTO,
//     width: 800,
//     height: 600,
//     backgroundColor: "#1a1a1a",
//     physics: {
//         default: "arcade",
//         arcade: {
//             gravity: { y: 500 },
//             debug: false
//         }
//     },
//     scene: {
//         preload,
//         create,
//         update
//     }
// };
//
// new Phaser.Game(config);
//
// // ================================
// // PRELOAD
// // ================================
// function preload() {
//     this.load.image("player", "https://labs.phaser.io/assets/sprites/platform.png");
//     this.load.image("apple", "https://labs.phaser.io/assets/sprites/apple.png");
//     this.load.image("bomb", "https://labs.phaser.io/assets/sprites/bomb.png");
//     this.load.image("star", "https://labs.phaser.io/assets/demoscene/star.png");
//     this.load.image("heart", "https://labs.phaser.io/assets/sprites/heart.png");
// }
//
// // ================================
// // CREATE
// // ================================
// function create() {
//     // Player
//     player = this.physics.add.image(400, 550, "player");
//     player.setImmovable(true);
//     player.body.allowGravity = false;
//     player.setScale(1.2);
//
//     // Item group
//     items = this.physics.add.group();
//
//     // Spawn items
//     this.time.addEvent({
//         delay: 800,
//         callback: spawnItem,
//         callbackScope: this,
//         loop: true
//     });
//
//     // Catch logic
//     this.physics.add.overlap(player, items, collectItem, null, this);
//
//     // UI
//     scoreText = this.add.text(20, 20, "Score: 0", {
//         fontSize: "20px",
//         fill: "#ffffff"
//     });
//
//     livesText = this.add.text(20, 50, "Lives: 3", {
//         fontSize: "20px",
//         fill: "#ffffff"
//     });
//
//     // Input
//     this.input.on("pointermove", (pointer) => {
//         if (!gameOver) {
//             player.x = Phaser.Math.Clamp(pointer.x, 60, 740);
//         }
//     });
// }
//
// // ================================
// // UPDATE
// // ================================
// function update() {
//     items.children.iterate((item) => {
//         if (item && item.y > 620) {
//             item.destroy();
//             if (item.type.key !== "bomb") {
//                 loseLife();
//             }
//         }
//     });
// }
//
// // ================================
// // GAME LOGIC
// // ================================
// function spawnItem() {
//     if (gameOver) return;
//
//     const data = Phaser.Utils.Array.GetRandom(ITEM_TYPES);
//     const x = Phaser.Math.Between(50, 750);
//
//     const item = items.create(x, 0, data.key);
//     item.setScale(0.5);
//     item.type = data;
// }
//
// function collectItem(player, item) {
//     item.destroy();
//
//     score += item.type.score;
//     lives += item.type.life;
//
//     if (lives < 0) lives = 0;
//
//     scoreText.setText("Score: " + score);
//     livesText.setText("Lives: " + lives);
//
//     if (lives <= 0) {
//         endGame.call(this);
//     }
// }
//
// function loseLife() {
//     lives--;
//     livesText.setText("Lives: " + lives);
//
//     if (lives <= 0) {
//         endGame.call(this);
//     }
// }
//
// function endGame() {
//     gameOver = true;
//     this.physics.pause();
//
//     this.add.text(400, 280, "GAME OVER", {
//         fontSize: "40px",
//         fill: "#ff0000"
//     }).setOrigin(0.5);
//
//     this.add.text(400, 330, "Click to Restart", {
//         fontSize: "20px",
//         fill: "#ffffff"
//     }).setOrigin(0.5);
//
//     this.input.once("pointerdown", () => {
//         score = 0;
//         lives = 3;
//         gameOver = false;
//         this.scene.restart();
//     });
// }

// ===================================
// FALLING OBJECTS CATCH GAME
// LEVELS + BOSS WAVES (PHASER 3)
// ===================================

let player, items, particleEmitter;
let score = 0, lives = 3, combo = 1;
let level = 1;
let nextLevelScore = 300;
let comboTimer = null;

let scoreText, livesText, comboText, levelText;
let gameOver = false;

// Power-ups
let slowMotionActive = false;
let magnetActive = false;

// Boss
let boss = null;
let bossHP = 0;
let bossActive = false;

const BASE_GRAVITY = 500;
const MAX_GRAVITY = 1400;

const ITEM_TYPES = [
    { key: "apple", score: 10 },
    { key: "banana  ", score: 10 },
    { key: "peach", score: 10 },
    { key: "black-berry-dark", score: 10 },
    { key: "black-berry-light", score: 10 },
    { key: "black-cherry", score: 10 },
    { key: "green-grape", score: 10 },
    { key: "green-apple", score: 10 },
    { key: "red-cherry", score: 10 },
    { key: "red-grape", score: 10 },
    { key: "star-fruit", score: 10 },
    { key: "coconut", score: 10 },
    { key: "lemon", score: 10 },
    { key: "lime", score: 10 },
    { key: "orange", score: 10 },
    { key: "pear", score: 10 },
    { key: "plum", score: 10 },
    { key: "raspberry", score: 10 },
    { key: "strawberry", score: 10 },
    { key: "watermelon", score: 10 },
    { key: "star", score: 30, power: "slow" },
    { key: "bomb", score: 0, life: -1 },
    { key: "heart", score: 0, life: +1, power: "magnet" }
];

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#1a1a1a",
    physics: {
        default: "arcade",
        arcade: {debug: false,gravity: { y: BASE_GRAVITY } }
    },
    scene: { preload, create, update }
};

new Phaser.Game(config);

// ================================
// PRELOAD
// ================================
function preload() {
    this.load.image("player", "images/fruit-basket/basket1.png");
    //Fruit
    this.load.image("apple", "images/fruit-basket/apple.png");
    this.load.image("banana", "images/fruit-basket/banana.png");
    this.load.image("peach", "images/fruit-basket/peach.png");
    this.load.image("black-berry-dark", "images/fruit-basket/black-berry-dark.png");
    this.load.image("black-berry-light", "images/fruit-basket/black-berry-light.png");
    this.load.image("black-cherry", "images/fruit-basket/black-cherry.png");
    this.load.image("green-grape", "images/fruit-basket/green-grape.png");
    this.load.image("green-apple", "images/fruit-basket/green-apple.png");
    this.load.image("red-cherry", "images/fruit-basket/red-cherry.png");
    this.load.image("red-grape", "images/fruit-basket/red-grape.png");
    this.load.image("star-fruit", "images/fruit-basket/star-fruit.png");
    this.load.image("coconut", "images/fruit-basket/coconut.png");
    this.load.image("lemon", "images/fruit-basket/lemon.png");
    this.load.image("lime", "images/fruit-basket/lime.png");
    this.load.image("orange", "images/fruit-basket/orange.png");
    this.load.image("pear", "images/fruit-basket/pear.png");
    this.load.image("plum", "images/fruit-basket/plum.png");
    this.load.image("raspberry", "images/fruit-basket/raspberry.png");
    this.load.image("strawberry", "images/fruit-basket/strawberry.png");
    this.load.image("watermelon", "images/fruit-basket/watermelon.png");
    //Power
    this.load.image("bomb", "images/fruit-basket/bomb.png");
    this.load.image("star", "images/fruit-basket/star.png");
    this.load.image("heart", "images/fruit-basket/heart.png");
    this.load.image("boss", "images/fruit-basket/orb-blue.png");
    this.load.image("particle", "images/fruit-basket/yellow.png");
}

// CREATE
// ================================
function create() {
    player = this.physics.add.image(400, 560, "player");
    player.setImmovable(true).setScale(1.2);
    player.body.allowGravity = false;

    items = this.physics.add.group();

    particleEmitter = this.add.particles(0, 0, "particle", {
        speed: { min: -200, max: 200 },
        lifespan: 400,
        scale: { start: 0.5, end: 0 },
        quantity: 10,
        on: false
    });

    this.spawnTimer = this.time.addEvent({
        delay: 800,
        loop: true,
        callback: spawnItem,
        callbackScope: this
    });

    this.physics.add.overlap(player, items, collectItem, null, this);

    // UI
    scoreText = this.add.text(20, 20, "Score: 0", { fill: "#fff" });
    livesText = this.add.text(20, 45, "Lives: 3", { fill: "#fff" });
    comboText = this.add.text(20, 70, "Combo: x1", { fill: "#ff0" });
    levelText = this.add.text(20, 95, "Level: 1", { fill: "#00ffcc" });

    this.input.on("pointermove", p => {
        if (!gameOver) player.x = Phaser.Math.Clamp(p.x, 60, 740);
    });
}

// UPDATE
// ================================
function update() {
    items.children.iterate(item => {
        if (!item) return;

        if (magnetActive) item.x = Phaser.Math.Linear(item.x, player.x, 0.05);

        if (item.y > 620) {
            item.destroy();
            resetCombo();
            loseLife.call(this);
        }
    });

    if (bossActive && boss && boss.y > 650) {
        bossMissed.call(this);
    }
}

// SPAWNING
// ================================
function spawnItem() {
    if (gameOver || bossActive) return;

    this.physics.world.gravity.y = Phaser.Math.Clamp(
        BASE_GRAVITY + level * 120,
        BASE_GRAVITY,
        MAX_GRAVITY
    );

    const data = Phaser.Utils.Array.GetRandom(ITEM_TYPES);
    const x = Phaser.Math.Between(50, 750);

    const item = items.create(x, 0, data.key);
    item.setScale(0.5);
    item.type = data;
}

// ITEM COLLECT
// ================================
function collectItem(player, item) {
    item.destroy();

    combo++;
    comboText.setText("Combo: x" + combo);

    if (comboTimer) comboTimer.remove(false);
    comboTimer = this.time.delayedCall(1500, resetCombo, [], this);

    score += (item.type.score || 0) * Math.min(combo, 5);
    lives += item.type.life || 0;

    scoreText.setText("Score: " + score);
    livesText.setText("Lives: " + lives);

    if (item.type.power === "slow") activateSlowMotion.call(this);
    if (item.type.power === "magnet") activateMagnet.call(this);

    particleEmitter.emitParticleAt(item.x, item.y);

    if (score >= nextLevelScore) levelUp.call(this);
    if (lives <= 0) endGame.call(this);
}

// LEVEL SYSTEM
// ================================
function levelUp() {
    level++;
    nextLevelScore += 300;
    levelText.setText("Level: " + level);

    this.spawnTimer.delay = Math.max(300, 800 - level * 50);

    if (level % 5 === 0) spawnBoss.call(this);
}

// BOSS SYSTEM
// ================================
function spawnBoss() {
    bossActive = true;
    bossHP = 5 + level;

    boss = this.physics.add.image(400, -100, "boss");
    boss.setScale(1.8);
    boss.setVelocityY(120);

    this.physics.add.overlap(player, boss, hitBoss, null, this);

    this.add.text(400, 200, "BOSS WAVE!", {
        fontSize: "32px",
        fill: "#ff4444"
    }).setOrigin(0.5).setDepth(10);
}

function hitBoss(player, bossObj) {
    bossHP--;
    particleEmitter.emitParticleAt(bossObj.x, bossObj.y);

    if (bossHP <= 0) {
        bossDefeated.call(this);
    } else {
        bossObj.y = -100;
    }
}

function bossDefeated() {
    score += 200 * level;
    scoreText.setText("Score: " + score);

    boss.destroy();
    bossActive = false;
}

function bossMissed() {
    boss.destroy();
    bossActive = false;
    lives -= 2;
    livesText.setText("Lives: " + lives);
    if (lives <= 0) endGame.call(this);
}

// POWER-UPS
// ================================
function activateSlowMotion() {
    if (slowMotionActive) return;
    slowMotionActive = true;
    this.physics.world.timeScale = 0.5;

    this.time.delayedCall(3000, () => {
        this.physics.world.timeScale = 1;
        slowMotionActive = false;
    });
}

function activateMagnet() {
    if (magnetActive) return;
    magnetActive = true;

    this.time.delayedCall(4000, () => magnetActive = false);
}

// UTIL
// ================================
function resetCombo() {
    combo = 1;
    comboText.setText("Combo: x1");
}

function loseLife() {
    lives--;
    livesText.setText("Lives: " + lives);
    if (lives <= 0) endGame.call(this);
}

// GAME OVER
// ================================
function endGame() {
    gameOver = true;
    this.physics.pause();

    this.add.text(400, 280, "GAME OVER", {
        fontSize: "40px",
        fill: "#ff4444"
    }).setOrigin(0.5);

    this.add.text(400, 330, "Click to Restart", {
        fill: "#fff"
    }).setOrigin(0.5);

    this.input.once("pointerdown", () => {
        score = 0;
        lives = 3;
        combo = 1;
        level = 1;
        nextLevelScore = 300;
        gameOver = false;
        this.scene.restart();
    });
}
