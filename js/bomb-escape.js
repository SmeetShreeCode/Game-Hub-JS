const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 500,
    backgroundColor: '#ffffff',
    audio: {
        disableWebAudio: false,
    },
    physics: {
        default: 'arcade',
        arcade: { debug: true, gravity: { y: 800 } }
    },
    scene: { preload, create, update }
};

new Phaser.Game(config);

/* ================= GLOBALS ================= */
let player, platform, bombs, cursors;
let moveLeft = false;
let moveRight = false;
let score = 0, scoreText;
let gameOver = false, gameStarted = false;
let menuContainer = null;
let controlMode = 'keyboard';
let sceneRef;
let leftBtn, rightBtn;
let menuIcon;
let startX = 0;
let particles;
let lives = 3;
let livesText;
let highScore = localStorage.getItem('bombEscapeHighScore') || 0;
let shieldActive = false;
let slowTimeActive = false;
let frozen = false;

let wave = 1;
let waveText;
let bombSpawnDelay = 900;
let bombSpeedBase = 250;
let bossWaveActive = false;
let bossBombsToSpawn = 0;
let bossBombsFinished = 0;
let glowRings = [];

/* ================= PRELOAD ================= */
function preload() {
    this.load.spritesheet('player', 'images/bomb-escape/player.png', {
        frameWidth: 74,
        frameHeight: 82
    });

    this.load.image('bomb', 'images/bomb-escape/bomb.png');
    this.load.image('bomb-red', 'images/bomb-escape/bomb-red.png');
    this.load.image('bomb-green', 'images/bomb-escape/bomb-green.png');
    this.load.image('bomb-ice', 'images/bomb-escape/bomb-ice.png');
    this.load.image('bomb-sound', 'images/bomb-escape/bomb-sound.png');
    this.load.image('power-shield', 'images/bomb-escape/power-shield.png');
    this.load.image('power-slow', 'images/bomb-escape/power-slow.png');
    this.load.image('menu', 'images/bomb-escape/menu.png');
    this.load.image('particle', 'images/bomb-escape/particle.png');
    this.load.image('road', 'images/bomb-escape/road.png');
}

/* ================= CREATE ================= */
function create() {
    sceneRef = this;
    this.children.removeAll();
    this.physics.resume();
    this.input.removeAllListeners();

    gameStarted = false;
    gameOver = false;
    controlMode = isMobile() ? 'buttons' : 'keyboard';

    showStartScreen(this);
}

/* ================= UPDATE ================= */
function update() {
    if (!gameStarted || gameOver || frozen) return;

    // KEYBOARD INPUT → sets intent
    if (controlMode === 'keyboard') {
        moveLeft = cursors.left.isDown || cursors.A.isDown;
        moveRight = cursors.right.isDown || cursors.D.isDown;
    }

    // APPLY MOVEMENT
    if (moveLeft) {
        player.setVelocityX(-300);
        player.setFlipX(true);
        player.anims.play('run', true);
    }
    else if (moveRight) {
        player.setVelocityX(300);
        player.setFlipX(false);
        player.anims.play('run', true);
    }
    else {
        player.setVelocityX(0);
        player.anims.play('idle', true);
    }

    // Scroll road when running
    // if (moveLeft || moveRight) {
    //     sceneRef.road.tilePositionX += moveLeft? 4 : -4;
    // }

    // Other updates
    glowRings.forEach((g, i) => {
        if (!g.target.active) {
            g.ring.destroy();
            glowRings.splice(i, 1);
        } else {
            g.ring.update();
        }
    });

    bombs.getChildren().forEach(b => {
        if (b.update) b.update();
    });
}

/* ================= START SCREEN ================= */
function showStartScreen(scene) {
    scene.add.text(400, 150, 'BOMB ESCAPE', {
        fontSize: '48px',
        color: '#ff4444'
    }).setOrigin(0.5);

    scene.add.text(400, 280, 'START', {
        fontSize: '32px',
        backgroundColor: '#333',
        padding: { x: 30, y: 15 }
    })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            // ✅ ENABLE AUDIO SAFELY
            scene.sound.unlock();

            scene.children.removeAll();
            startGame(scene);
        });
}

/* ================= START GAME ================= */
function startGame(scene) {
    gameStarted = true;
    gameOver = false;
    score = 0;
    bossActive = false;
    bossWaveCompleted = false;
    wave = 1;
    bombSpawnDelay = 900;
    bombSpeedBase = 250;

    /* PLATFORM */
    // ===== ROAD VISUAL =====
    scene.road = scene.add.tileSprite(
        400,
        470,
        800,
        60,
        'road'
    ).setDepth(-1);

// ===== PHYSICS PLATFORM (INVISIBLE) =====
    platform = scene.physics.add.staticImage(400, 470)
        .setDisplaySize(800, 60)
        .setVisible(false)
        .refreshBody();


    /* PLAYER */
    player = scene.physics.add.sprite(400, 410, 'player');
    player.setCollideWorldBounds(true);
    scene.physics.add.collider(player, platform);

    /* PLAYER ANIMATIONS */
    if (!scene.anims.exists('idle')) {
        scene.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 1,
            repeat: -1
        });
    }

    if (!scene.anims.exists('run')) {
        scene.anims.create({
            key: 'run',
            frames: scene.anims.generateFrameNumbers('player', { start: 1, end: 4 }),
            frameRate: 10,
            repeat: -1
        });
    }

    player.play('idle');

    /* BOMBS */
    bombs = scene.physics.add.group();
    scene.physics.add.overlap(player, bombs, hitBomb);

    /* PARTICLES (Phaser 3.90 correct way) */
    particles = scene.add.particles(0, 0, 'particle', {
        speed: { min: -300, max: 300 },
        scale: { start: 1, end: 0 },
        lifespan: 600,
        quantity: 25,
        emitting: false
    });

    /* SCORE */
    scoreText = scene.add.text(20, 20, 'Score: 0', {
        fontSize: '20px',
        color: '#fff'
    });

    /* MENU ICON */
    menuIcon = scene.add.image(770, 30, 'menu')
        .setScale(0.6)
        .setInteractive()
        .on('pointerdown', () => showControlMenu(scene));

    /* KEYBOARD */
    cursors = scene.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        D: Phaser.Input.Keyboard.KeyCodes.D
    });

    if (controlMode === 'buttons') createButtons(scene);
    if (controlMode === 'swipe') setupSwipe(scene);
    if (controlMode === 'gyro') setupGyro();

    /* BOMBS */
    scene.bombTimer = scene.time.addEvent({
        delay: bombSpawnDelay,
        loop: true,
        callback: () => spawnBomb(scene)
    });

    /* WAVE */
    const wavePopup = scene.add.text(400, 200, `WAVE ${wave}`, {
        fontSize: '36px',
        color: '#034536'
    }).setOrigin(0.5);

    scene.tweens.add({
        targets: wavePopup,
        alpha: 0,
        y: 150,
        duration: 800,
        onComplete: () => wavePopup.destroy()
    });

    /* SCORE */
    scene.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            if (gameOver) return;

            score++;
            scoreText.setText('Score: ' + score);

            /* ================= WAVE SYSTEM ================= */
            if (score % 15 === 0 && !bossActive) {
                wave++;
                waveText.setText('Wave: ' + wave);

                // Increase difficulty
                bombSpawnDelay = Math.max(400, bombSpawnDelay - 100);
                bombSpeedBase += 30;

                // Restart bomb timer with new delay
                scene.bombTimer.remove();
                scene.bombTimer = scene.time.addEvent({
                    delay: bombSpawnDelay,
                    loop: true,
                    callback: () => spawnBomb(scene)
                });

                // Visual feedback
                scene.cameras.main.flash(250);
                if (navigator.vibrate) navigator.vibrate(120);
            }
            /* =============================================== */
        }
    });

    /* LIVES */
    lives = 3;

    livesText = scene.add.text(20, 50, '❤️❤️❤️', {
        fontSize: '22px'
    });

    scene.add.text(20, 80, 'High: ' + highScore, {
        fontSize: '18px',
        color: '#aaa'
    });

    /* POWERS */
    bossActive = false;

    waveText = scene.add.text(650, 20, 'Wave: 1', {
        fontSize: '20px',
        color: '#3f635d'
    });
}

/* ================= SPAWN BOMB ================= */
function spawnBomb(scene) {
    if (gameOver) return;

    // START boss wave ONLY ONCE
    if (wave % 5 === 0 && !bossWaveActive && bossBombsFinished === 0) {
        startBossWave(scene);
    }

    // During boss wave → no normal bombs
    if (bossWaveActive) return;

    if (Phaser.Math.Between(1, 100) <= 10) {
        spawnPowerUp(scene);
        return;
    }

    if (wave >= 7) spawnRainPattern(scene);
    else if (wave >= 5) spawnZigZag(scene);
    else if (wave >= 3) spawnDouble(scene);
    else spawnSingle(scene);
}

function spawnSingle(scene) {
    createBomb(scene, Phaser.Math.Between(40, 760), 0);
}

function spawnDouble(scene) {
    const x = Phaser.Math.Between(100, 700);
    createBomb(scene, x - 60, 0);
    createBomb(scene, x + 60, 0);
}

function spawnZigZag(scene) {
    const bomb = createBomb(scene, Phaser.Math.Between(100, 700), 0);
    scene.tweens.add({
        targets: bomb,
        x: bomb.x + Phaser.Math.Between(-120, 120),
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
}

function spawnRainPattern(scene) {

    const columns = 6;
    const gap = 800 / columns;

    // 🎯 ONE SAFE LANE
    const safeLane = Phaser.Math.Between(0, columns - 1);

    for (let i = 0; i < columns; i++) {

        if (i === safeLane) continue; // ⛔ leave escape path

        const x = gap * i + gap / 2;

        const bomb = createBomb(scene, x, -Phaser.Math.Between(0, 200));

        // Slight side movement to increase difficulty (but fair)
        scene.tweens.add({
            targets: bomb,
            x: bomb.x + Phaser.Math.Between(-40, 40),
            yoyo: true,
            repeat: -1,
            duration: Phaser.Math.Between(900, 1300),
            ease: 'Sine.easeInOut'
        });
    }
}

function createBomb(scene, x, y) {
    const types = ['bomb', 'bomb-red', 'bomb-ice', 'bomb-sound'];
    const type = Phaser.Utils.Array.GetRandom(types);

    const bomb = scene.physics.add.image(x, y, type);
    bomb.type = type;

    let speed = bombSpeedBase + wave * 40;

    // Slow-time affects bombs ONLY when power is active
    if (slowTimeActive) speed *= 0.6;

    bomb.setVelocityY(speed);

// 👇 KEY FIX
    bomb.body.setGravityY(900 * (slowTimeActive ? 0.4 : 1));


    bombs.add(bomb);
    return bomb;
}

function startBossWave(scene) {
    bossWaveActive = true;
    bossBombsToSpawn = wave;
    bossBombsFinished = 0;

    // ⛔ STOP normal bombs
    scene.bombTimer.paused = true;

    scene.cameras.main.flash(400, 255, 80, 80);
    scene.cameras.main.shake(400, 0.05);

    scene.time.addEvent({
        delay: 700,
        repeat: bossBombsToSpawn - 1,
        callback: () => spawnBossBomb(scene)
    });
}

function spawnBossBomb(scene) {
    const bomb = scene.physics.add.image(
        Phaser.Math.Between(80, 720),
        -100,
        'bomb-red'
    );

    bomb.setScale(1.8);
    bomb.type = 'boss';

    bomb.setVelocityY(bombSpeedBase + wave * 50);
    bomb.body.setGravityY(1000);

    bombs.add(bomb);

    // CLEAN finish when bomb leaves screen
    bomb.setCollideWorldBounds(true);
    bomb.body.onWorldBounds = true;
    bomb.checkWorldBounds = true;

    bomb.setCollideWorldBounds(false);

    bomb.update = () => {
        if (bomb.y > 550) {
            bomb.destroy();
            bossBombFinished();
        }
    };

}

function bossBombFinished() {
    bossBombsFinished++;

    if (bossBombsFinished >= bossBombsToSpawn) {
        endBossWave();
    }
}

function endBossWave() {
    bossWaveActive = false;

    wave++;
    waveText.setText('Wave: ' + wave);

    bombSpawnDelay = Math.max(350, bombSpawnDelay - 80);
    bombSpeedBase += 40;

    // ▶ RESUME normal bombs
    sceneRef.bombTimer.paused = false;

    sceneRef.cameras.main.flash(300, 80, 255, 80);
}

function spawnPowerUp(scene) {
    const types = ['power-shield', 'power-slow'];
    const type = Phaser.Utils.Array.GetRandom(types);

    const power = scene.physics.add.image(
        Phaser.Math.Between(60, 740),
        -40,
        type
    );

    scene.tweens.add({
        targets: power,
        x: power.x + Phaser.Math.Between(-40, 40),
        yoyo: true,
        repeat: -1,
        duration: 1200,
        ease: 'Sine.easeInOut'
    });
    scene.tweens.add({
        targets: power,
        scale: { from: 0.9, to: 1.1 },
        yoyo: true,
        repeat: -1,
        duration: 700
    });


    power.type = type;

    // 🔑 DISABLE GRAVITY FOR POWER-UPS
    power.body.setAllowGravity(false);

    // ✅ MUCH SLOWER THAN BOMBS
    power.setVelocityY(120);
    power.setAngularVelocity(30);

    // Glow color by type
    const glowColor =
        type === 'power-shield' ? 0x00ff66 : 0x00ccff;

    addPowerGlow(scene, power, glowColor);

    scene.physics.add.overlap(player, power, collectPowerUp);
}

function collectPowerUp(player, power) {
    particles.emitParticleAt(power.x, power.y, 20);
    sceneRef.cameras.main.flash(200);
    if (navigator.vibrate) navigator.vibrate(100);

    power.destroy();

    if (power.type === 'power-shield') activateShield();
    if (power.type === 'power-slow') activateSlowTime();
}

function activateShield() {
    if (shieldActive) return;

    shieldActive = true;
    player.setTint(0x00ff00);

    // Optional glow feedback
    const shieldGlow = sceneRef.add.graphics();
    shieldGlow.lineStyle(3, 0x00ff00, 0.8);
    shieldGlow.strokeCircle(0, 0, 45);

    shieldGlow.update = () => {
        if (!player.active) shieldGlow.destroy();
        shieldGlow.x = player.x;
        shieldGlow.y = player.y;
    };

    glowRings.push({ ring: shieldGlow, target: player });

    // ⏱️ 5 seconds duration
    sceneRef.time.delayedCall(5000, () => {
        shieldActive = false;
        player.clearTint();
        shieldGlow.destroy();
    });
}

function activateSlowTime() {
    if (slowTimeActive) return;

    slowTimeActive = true;

    // Visual feedback
    sceneRef.cameras.main.flash(250, 120, 200, 255);
    sceneRef.cameras.main.shake(250, 0.01);

    // 🔥 TRUE slow motion
    bombs.getChildren().forEach(bomb => {
        bomb.body.setGravityY(900 * 0.4);
    });

    const overlay = sceneRef.add.rectangle(
        400, 250, 800, 500, 0x88ccff, 0.15
    ).setDepth(1000);

    sceneRef.time.delayedCall(5000, () => {
        slowTimeActive = false;

        bombs.getChildren().forEach(bomb => {
            bomb.body.setGravityY(900);
        });

        overlay.destroy();
    });
}

/* ================= HIT ================= */
function hitBomb(player, bomb) {

    if (shieldActive) {
        particles.emitParticleAt(bomb.x, bomb.y, 20);
        bomb.destroy();
        return;
    }

    // ================= BOSS =================
    if (bomb.type === 'boss') {
        lives--;

        particles.emitParticleAt(bomb.x, bomb.y, 40);
        sceneRef.cameras.main.shake(300, 0.04);

        bomb.destroy();
        bossBombFinished();

        updateLives();
        if (lives <= 0) endGame();
        return;
    }

    // ================= COMMON FX =================
    particles.emitParticleAt(bomb.x, bomb.y, 30);
    sceneRef.cameras.main.shake(150, 0.02);
    sceneRef.cameras.main.flash(150, 255, 255, 255);
    if (navigator.vibrate) navigator.vibrate(120);

    // ================= BOMB TYPES =================
    switch (bomb.type) {

        /* 🔴 RED BOMB */
        case 'bomb-red':
            lives -= 1;
            score = Math.max(0, score - 5);
            scoreText.setText('Score: ' + score);
            break;

        /* ❄️ ICE BOMB */
        case 'bomb-ice':
            freezePlayer();
            bomb.destroy();
            return; // no life loss

        /* 🟢 GREEN (BONUS) */
        case 'bomb-green':
            score += 10;
            scoreText.setText('Score: ' + score);
            bomb.destroy();
            return;

        /* 🔊 SOUND */
        case 'bomb-sound':
            lives -= 1;
            sceneRef.cameras.main.shake(300, 0.04);
            break;

        /* ⚫ NORMAL */
        default:
            lives -= 1;
    }

    bomb.destroy();
    updateLives();

    if (lives <= 0) endGame();
}

function freezePlayer() {
    if (frozen || gameOver) return;

    frozen = true;
    player.setTint(0x00ffff);
    player.setVelocityX(0);

    // Disable movement
    player.setVelocity(0);
    player.body.moves = false;

    sceneRef.time.delayedCall(3000, () => {
        frozen = false;
        player.clearTint();
        player.body.enable = true;
        player.body.moves = true;
    });
}

function updateLives() {
    livesText.setText('❤️'.repeat(lives));
}

function addPowerGlow(scene, target, color) {
    const glow = scene.add.graphics();

    glow.fillStyle(color, 0.15);
    glow.fillCircle(0, 0, target.displayWidth);

    glow.x = target.x;
    glow.y = target.y;

    scene.tweens.add({
        targets: glow,
        scale: { from: 0.9, to: 1.2 },
        alpha: { from: 0.2, to: 0.6 },
        duration: 800,
        yoyo: true,
        repeat: -1
    });

    glow.update = () => {
        if (!target.active) {
            glow.destroy();
        } else {
            glow.x = target.x;
            glow.y = target.y;
        }
    };

    glowRings.push({ ring: glow, target });
}

/* ================= END GAME ================= */
function endGame() {
    gameOver = true;
    sceneRef.physics.pause();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('bombEscapeHighScore', highScore);
    }

    sceneRef.add.text(400, 220, 'GAME OVER', {
        fontSize: '40px',
        color: '#ff4444'
    }).setOrigin(0.5);

    sceneRef.add.text(400, 270, 'Score: ' + score, {
        fontSize: '24px'
    }).setOrigin(0.5);

    sceneRef.add.text(400, 320, 'RESTART', {
        fontSize: '26px',
        backgroundColor: '#333',
        padding: { x: 20, y: 10 }
    })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => sceneRef.scene.restart());
}

/* ================= CONTROL MENU ================= */
function showControlMenu(scene) {

    if (menuContainer) return; // prevent double-open

    scene.physics.pause();
    frozen = true;

    menuContainer = scene.add.container(0, 0).setDepth(2000);

    const bg = scene.add.rectangle(400, 250, 300, 320, 0x000000, 0.9);
    menuContainer.add(bg);

    const title = scene.add.text(400, 140, 'CONTROLS', {
        fontSize: '26px',
        color: '#ffffff'
    }).setOrigin(0.5);
    menuContainer.add(title);

    const modes = ['Keyboard', 'Buttons', 'Swipe', 'Gyro'];

    modes.forEach((mode, i) => {

        const btn = scene.add.text(400, 190 + i * 45, mode, {
            fontSize: '22px',
            backgroundColor: '#444',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive();

        btn.on('pointerdown', () => {
            applyControlMode(scene, mode.toLowerCase());
            closeControlMenu(scene);
        });

        menuContainer.add(btn);
    });

    // Close button
    const close = scene.add.text(400, 350, 'CLOSE', {
        fontSize: '18px',
        backgroundColor: '#222',
        padding: { x: 16, y: 8 }
    })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => closeControlMenu(scene));

    menuContainer.add(close);
}

function applyControlMode(scene, mode) {

    controlMode = mode;

    // Remove old controls
    scene.input.removeAllListeners();

    if (leftBtn) leftBtn.destroy();
    if (rightBtn) rightBtn.destroy();

    // Recreate controls
    if (controlMode === 'buttons') createButtons(scene);
    if (controlMode === 'swipe') setupSwipe(scene);
    if (controlMode === 'gyro') setupGyro();
}

function closeControlMenu(scene) {

    if (!menuContainer) return;

    menuContainer.destroy();
    menuContainer = null;

    frozen = false;
    scene.physics.resume();
}

/* ================= MOBILE CONTROLS ================= */
function createButtons(scene) {

    leftBtn = scene.add.rectangle(80, 400, 120, 90, 0x3333ff, 0.6)
        .setScrollFactor(0)
        .setInteractive();

    rightBtn = scene.add.rectangle(720, 400, 120, 90, 0x3333ff, 0.6)
        .setScrollFactor(0)
        .setInteractive();

    leftBtn.on('pointerdown', () => moveLeft = true);
    leftBtn.on('pointerup', () => moveLeft = false);
    leftBtn.on('pointerout', () => moveLeft = false);

    rightBtn.on('pointerdown', () => moveRight = true);
    rightBtn.on('pointerup', () => moveRight = false);
    rightBtn.on('pointerout', () => moveRight = false);
}

function setupSwipe(scene) {

    scene.input.on('pointerdown', p => startX = p.x);

    scene.input.on('pointerup', p => {
        const dx = p.x - startX;

        if (dx > 50) {
            moveRight = true;
            scene.time.delayedCall(200, () => moveRight = false);
        }
        else if (dx < -50) {
            moveLeft = true;
            scene.time.delayedCall(200, () => moveLeft = false);
        }
    });
}

function setupGyro() {

    window.addEventListener('deviceorientation', e => {

        if (!player || gameOver || frozen) return;

        if (e.gamma > 5) {
            moveRight = true;
            moveLeft = false;
        }
        else if (e.gamma < -5) {
            moveLeft = true;
            moveRight = false;
        }
        else {
            moveLeft = false;
            moveRight = false;
        }
    });
}

/* ================= UTILS ================= */
function isMobile() {
    return /Android|iPhone|iPad/i.test(navigator.userAgent);
}
