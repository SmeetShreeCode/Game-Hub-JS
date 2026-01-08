const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 500,
    backgroundColor: '#111',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

new Phaser.Game(config);

/* ================= GLOBALS ================= */
let player, platform, bombs;
let cursors;
let score = 0;
let scoreText;
let gameOver = false;
let gameStarted = false;
let bombDelay = 1200;
let controlMode = 'keyboard';
let sceneRef;

let leftBtn, rightBtn;
let startX = 0;

/* ================= PRELOAD ================= */
function preload() {
    // No assets (kept to avoid Phaser error)
}

/* ================= CREATE ================= */
function create() {
    sceneRef = this;
    this.physics.resume();
    this.children.removeAll();
    this.input.removeAllListeners();

    gameStarted = false;
    gameOver = false;

    showMenu(this);
}

/* ================= UPDATE ================= */
function update() {
    if (!gameStarted || gameOver) return;

    if (controlMode === 'keyboard' && cursors) {
        if (cursors.left.isDown) {
            player.body.setVelocityX(-300);
        } else if (cursors.right.isDown) {
            player.body.setVelocityX(300);
        } else {
            player.body.setVelocityX(0);
        }
    }
}

/* ================= MENU ================= */
function showMenu(scene) {
    scene.add.text(400, 80, 'BOMB ESCAPE', {
        fontSize: '42px',
        color: '#ff4444'
    }).setOrigin(0.5);

    const modes = [
        { label: 'Keyboard', mode: 'keyboard' },
        { label: 'Touch Buttons', mode: 'buttons' },
        { label: 'Swipe', mode: 'swipe' },
        { label: 'Gyro (Tilt)', mode: 'gyro' }
    ];

    modes.forEach((m, i) => {
        scene.add.text(400, 180 + i * 60, m.label, {
            fontSize: '26px',
            backgroundColor: '#333',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                controlMode = m.mode;
                scene.children.removeAll();
                startGame(scene);
            });
    });
}

/* ================= START GAME ================= */
function startGame(scene) {
    gameStarted = true;
    gameOver = false;
    score = 0;
    bombDelay = 1200;

    /* PLATFORM */
    platform = scene.add.rectangle(400, 470, 800, 40, 0x555555);
    scene.physics.add.existing(platform, true);

    /* PLAYER */
    player = scene.add.rectangle(400, 410, 40, 60, 0x00ff88);
    scene.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);
    scene.physics.add.collider(player, platform);

    /* BOMBS */
    bombs = scene.physics.add.group();
    scene.physics.add.overlap(player, bombs, hitBomb, null, scene);

    /* SCORE */
    scoreText = scene.add.text(20, 20, 'Score: 0', {
        fontSize: '20px',
        color: '#fff'
    });

    /* CONTROLS */
    cursors = scene.input.keyboard.createCursorKeys();

    if (controlMode === 'buttons') createButtons(scene);
    if (controlMode === 'swipe') setupSwipe(scene);
    if (controlMode === 'gyro') setupGyro();

    /* BOMB SPAWNER */
    scene.time.addEvent({
        delay: bombDelay,
        loop: true,
        callback: () => spawnBomb(scene)
    });

    /* SCORE TIMER */
    scene.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            if (!gameOver) {
                score++;
                scoreText.setText('Score: ' + score);
                if (score % 10 === 0 && bombDelay > 400) {
                    bombDelay -= 100;
                }
            }
        }
    });
}

/* ================= SPAWN BOMB ================= */
function spawnBomb(scene) {
    if (gameOver) return;

    const bomb = scene.add.circle(
        Phaser.Math.Between(20, 780),
        0,
        12,
        0xff3333
    );

    scene.physics.add.existing(bomb);
    bomb.body.setVelocityY(250 + score * 5);
    bomb.body.setCollideWorldBounds(false);

    bombs.add(bomb);

    /* CLEANUP */
    bomb.update = () => {
        if (bomb.y > 520) bomb.destroy();
    };
}

/* ================= HIT ================= */
function hitBomb() {
    gameOver = true;
    sceneRef.physics.pause();

    sceneRef.add.text(400, 250, 'GAME OVER', {
        fontSize: '40px',
        color: '#ff0000'
    }).setOrigin(0.5);

    sceneRef.add.text(400, 310, 'RESTART', {
        fontSize: '26px',
        backgroundColor: '#333',
        padding: { x: 20, y: 10 }
    })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => sceneRef.scene.restart());
}

/* ================= TOUCH BUTTONS ================= */
function createButtons(scene) {
    leftBtn = scene.add.rectangle(80, 400, 100, 80, 0x3333ff).setInteractive();
    rightBtn = scene.add.rectangle(720, 400, 100, 80, 0x3333ff).setInteractive();

    leftBtn.on('pointerdown', () => player.body.setVelocityX(-300));
    leftBtn.on('pointerup', () => player.body.setVelocityX(0));

    rightBtn.on('pointerdown', () => player.body.setVelocityX(300));
    rightBtn.on('pointerup', () => player.body.setVelocityX(0));
}

/* ================= SWIPE ================= */
function setupSwipe(scene) {
    scene.input.on('pointerdown', p => startX = p.x);
    scene.input.on('pointerup', p => {
        const dx = p.x - startX;
        if (dx > 50) player.body.setVelocityX(300);
        else if (dx < -50) player.body.setVelocityX(-300);
        scene.time.delayedCall(200, () => player.body.setVelocityX(0));
    });
}

/* ================= GYRO ================= */
function setupGyro() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission();
    }

    window.addEventListener('deviceorientation', e => {
        if (!player || gameOver) return;
        player.body.setVelocityX(e.gamma * 15);
    });
}
