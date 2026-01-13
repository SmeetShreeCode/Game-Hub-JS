/* ===============================
   GAME CONSTANTS
================================ */

const GAME = {
    WIDTH: 420,
    HEIGHT: 720,

    BLOCK: {
        WIDTH: 160,
        HEIGHT: 22,
        SPEED: 2.2,
        COLOR: 0x4f8cff
    },

    GRAVITY: 1.2,
    STACK_START_Y: 520,
    MOVE_Y: 120
};

/* ===============================
   PHASER CONFIG
================================ */

const config = {
    type: Phaser.AUTO,
    width: GAME.WIDTH,
    height: GAME.HEIGHT,
    parent: 'game-container',
    backgroundColor: '#0b1220',
    physics: {
        default: 'matter',
        matter: {
            gravity: {y: GAME.GRAVITY},
            debug: false
        }
    },
    scene: [BootScene, GameScene, GameOverScene]
};

new Phaser.Game(config);

/* ===============================
   BOOT SCENE
================================ */

function BootScene() {
    Phaser.Scene.call(this, {key: 'BootScene'});
}

BootScene.prototype = Object.create(Phaser.Scene.prototype);

BootScene.prototype.create = function () {
    this.scene.start('GameScene');
};

/* ===============================
   GAME SCENE
================================ */

function GameScene() {
    Phaser.Scene.call(this, {key: 'GameScene'});
}

GameScene.prototype = Object.create(Phaser.Scene.prototype);

GameScene.prototype.create = function () {
    this.score = 0;
    this.stackY = GAME.STACK_START_Y;
    this.currentBlock = null;
    this.isDropping = false;

    /* World bounds */
    this.matter.world.setBounds(0, 0, GAME.WIDTH, GAME.HEIGHT);

    /* Score UI */
    this.scoreText = this.add.text(
        GAME.WIDTH / 2,
        40,
        '0',
        {font: '28px Arial', fill: '#ffffff'}
    ).setOrigin(0.5);

    /* First base block */
    this.createStaticBlock(GAME.WIDTH / 2, this.stackY);

    this.stackY -= GAME.MOVE_Y;

    /* Spawn moving block */
    this.spawnMovingBlock();

    /* Input */
    this.input.on('pointerdown', () => {
        if (!this.isDropping) this.dropBlock();
    });
};

GameScene.prototype.update = function () {
    if (!this.currentBlock || this.isDropping) return;

    this.currentBlock.x += GAME.BLOCK.SPEED;
    if (this.currentBlock.x > GAME.WIDTH - 40 || this.currentBlock.x < 40) {
        GAME.BLOCK.SPEED *= -1;
    }
};

/* ---------- BLOCK FUNCTIONS ---------- */

GameScene.prototype.spawnMovingBlock = function () {
    const rect = this.add.rectangle(
        60,
        this.stackY,
        GAME.BLOCK.WIDTH,
        GAME.BLOCK.HEIGHT,
        GAME.BLOCK.COLOR,
        1
    ).setOrigin(0.5);

    this.matter.add.gameObject(rect, {
        isStatic: true
    });

    this.currentBlock = rect;
};

GameScene.prototype.dropBlock = function () {
    this.isDropping = true;

    this.matter.body.setStatic(this.currentBlock.body, false);

    this.time.delayedCall(500, () => {
        if (this.currentBlock.y > GAME.HEIGHT) {
            this.scene.start('GameOverScene', {score: this.score});
            return;
        }

        this.score++;
        this.scoreText.setText(this.score);

        this.stackY -= GAME.MOVE_Y;
        this.currentBlock = null;
        this.isDropping = false;

        this.spawnMovingBlock();
    });
};

GameScene.prototype.createStaticBlock = function (x, y) {
    const block = this.add.rectangle(
        x,
        y,
        GAME.BLOCK.WIDTH,
        GAME.BLOCK.HEIGHT,
        GAME.BLOCK.COLOR,
        1
    ).setOrigin(0.5);

    this.matter.add.gameObject(block, {
        isStatic: true
    });
};

/* ===============================
   GAME OVER SCENE
================================ */

function GameOverScene() {
    Phaser.Scene.call(this, {key: 'GameOverScene'});
}

GameOverScene.prototype = Object.create(Phaser.Scene.prototype);

GameOverScene.prototype.init = function (data) {
    this.finalScore = data.score || 0;
};

GameOverScene.prototype.create = function () {
    this.add.text(
        GAME.WIDTH / 2,
        260,
        'Game Over',
        {font: '32px Arial', fill: '#ffffff'}
    ).setOrigin(0.5);

    this.add.text(
        GAME.WIDTH / 2,
        310,
        `Score: ${this.finalScore}`,
        {font: '22px Arial', fill: '#c7d2fe'}
    ).setOrigin(0.5);

    const btn = this.add.text(
        GAME.WIDTH / 2,
        380,
        'Restart',
        {
            font: '20px Arial',
            fill: '#ffffff',
            backgroundColor: '#4f8cff',
            padding: {x: 20, y: 10}
        }
    ).setOrigin(0.5).setInteractive();

    btn.on('pointerdown', () => {
        this.scene.start('GameScene');
    });
};
