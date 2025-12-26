const GAME_WIDTH = 800;
const GAME_HEIGHT = 800;

const PLAYER_SPEED = 300;
const BULLET_SPEED = 500;
const ENEMY_SPEED = 150;

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {debug: false}
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('player', 'images/shooter/player.png');
    this.load.image('enemy', 'images/shooter/enemy.png');
    this.load.image('bullet', 'images/shooter/bullet.png');
}

function create() {
    this.isGameOver = false;
    this.invincible = false;
    this.isShootingDesktop = false;
    this.lastShot = 0;

    this.isMobile =
        this.sys.game.device.os.android ||
        this.sys.game.device.os.iOS;
    // console.log(this.sys.game.device);


    /* ================= PLAYER ================= */
    this.player = this.physics.add.image(400, GAME_HEIGHT - 50, 'player');
    this.player.setCollideWorldBounds(true);

    // Smaller hitbox (width, height)
    this.player.body.setSize(50, 50);
    // Center the hitbox
    this.player.body.setOffset(
        (this.player.width - 50) / 2,
        (this.player.height - 50) / 2
    );


    // BULLETS
    this.bullets = this.physics.add.group();

    //ENEMIES
    this.enemies = this.physics.add.group();

    /* ================= ENEMY SPAWN ================= */
    this.enemyTimer = this.time.addEvent({
        delay: 1000,
        callback: spawnEnemy,
        callbackScope: this,
        loop: true
    });

    // COLLISION (BULLET vs ENEMY)
    this.physics.add.overlap(this.bullets, this.enemies, destroyEnemy, null, this);

    // COLLISIONS GAME OVER (ENEMY TOUCH PLAYER)
    this.physics.add.overlap(this.player, this.enemies, gameOver, null, this);


    // INPUT
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
        P: Phaser.Input.Keyboard.KeyCodes.P   // pause key
    });

    // this.input.on('pointerdown', (pointer) => {
    //     this.player.setVelocityX(
    //         pointer.x < GAME_WIDTH / 2 ? -PLAYER_SPEED : PLAYER_SPEED
    //     );
    //     shootBullet.call(this);
    //     console.log({
    //         x: pointer.x,
    //         y: pointer.y,
    //         left: pointer.leftButtonDown(),
    //         right: pointer.rightButtonDown()
    //     });
    // });
    // this.input.on('pointerup', () => {
    //     this.player.setVelocityX(0);
    // });
    // this.input.keyboard.on('keydown', (event) => {
    //     console.log('Key pressed:', event.key);
    // });
    // this.input.on('pointerup', (event) => {
    //     console.log('Key pressed:', event.key);
    // });

    this.input.on('pointerdown', (pointer) => {
        if (this.isMobile) return; // desktop only
        this.isShootingDesktop = true;
    });

    this.input.on('pointerup', () => {
        if (this.isMobile) return;
        this.isShootingDesktop = false;
    });
    this.input.keyboard.on('keydown-SPACE', () => {
        this.isShootingDesktop = true;
    });

    this.input.keyboard.on('keyup-SPACE', () => {
        this.isShootingDesktop = false;
    });


    /* ================= JOYSTICK DATA ================= */
    this.joystickBase = null;
    this.joystickThumb = null;
    this.joystickActive = false;
    this.joystickPointer = null;
    this.joystickRadius = 50;
    this.joystickForce = 0;
    this.joystickAngle = 0;
    this.input.addPointer(3);

    /* ================= MOBILE CONTROLS ================= */
    if (this.isMobile) {

        // Dynamic Joystick
        this.input.on('pointerdown', (pointer) => {
            if (!this.isMobile) return;
            if (pointer.x >= GAME_WIDTH / 2 || this.joystickActive) return;

            this.joystickActive = true;
            this.joystickPointer = pointer;

            // CREATE joystick at touch position
            this.joystickBase = this.add.circle(pointer.x, pointer.y, 60, 0x000000, 0.4)
                .setScrollFactor(0);

            this.joystickThumb = this.add.circle(pointer.x, pointer.y, 30, 0xffffff, 0.8)
                .setScrollFactor(0);
        });

        this.input.on('pointermove', (pointer) => {
            if (!this.joystickActive || pointer.id !== this.joystickPointer.id) return;

            const dx = pointer.x - this.joystickBase.x;
            const dy = pointer.y - this.joystickBase.y;

            const distance = Math.min(
                Math.sqrt(dx * dx + dy * dy),
                this.joystickRadius
            );

            this.joystickAngle = Math.atan2(dy, dx);
            this.joystickForce = distance / this.joystickRadius;

            this.joystickThumb.setPosition(
                this.joystickBase.x + Math.cos(this.joystickAngle) * distance,
                this.joystickBase.y + Math.sin(this.joystickAngle) * distance
            );
        });

        this.input.on('pointerup', (pointer) => {
            // JOYSTICK RELEASE
            if (this.joystickPointer && pointer.id === this.joystickPointer.id) {

                this.joystickActive = false;
                this.joystickPointer = null;
                this.joystickForce = 0;

                this.joystickBase?.destroy();
                this.joystickThumb?.destroy();
            }

            // SHOOT RELEASE
            if (this.shootPointer && pointer.id === this.shootPointer.id) {
                this.isShooting = false;
                this.shootPointer = null;
            }
        });

        // ================= SHOOT BUTTON =================
        this.shootButton = this.add.circle(
            GAME_WIDTH - 120,
            GAME_HEIGHT - 120,
            55,
            0xff0000,
            0.6
        ).setScrollFactor(0).setInteractive();

        this.isShooting = false;
        this.shootPointer = null;

        this.shootButton.on('pointerdown', (pointer) => {
            this.isShooting = true;
            this.shootPointer = pointer;
        });

        this.shootButton.on('pointerup', (pointer) => {
            if (pointer.id === this.shootPointer?.id) {
                this.isShooting = false;
                this.shootPointer = null;
            }
        });

        this.shootButton.on('pointerout', () => {
            this.isShooting = false;
            this.shootPointer = null;
        });
    }

    /* ================= UI ================= */
    this.score = 0;
    this.scoreText = this.add.text(10, 10, 'Score: 0', {
        fontSize: '20px',
        fill: '#fff'
    });

    this.playerHealth = 100;
    this.maxHealth = 100;

    // Health bar background
    this.healthBarBg = this.add.rectangle(10, 40, 104, 14, 0x444444).setOrigin(0);

    // Health bar fill
    this.healthBar = this.add.rectangle(12, 42, 100, 10, 0x00ff00).setOrigin(0);
}

function update() {
    if (this.isGameOver) return;

    this.player.setVelocityX(0);

    // Keyboard movement
    if (this.cursors.left.isDown || this.keys.A.isDown) {
        this.player.setVelocityX(-PLAYER_SPEED);
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
        this.player.setVelocityX(PLAYER_SPEED);
    }

    // Pause
    if (Phaser.Input.Keyboard.JustDown(this.keys.P)) {
        togglePause.call(this);
    }

    // Joystick movement
    if (this.isMobile && this.joystickActive) {
        this.player.setVelocityX(
            Math.cos(this.joystickAngle) *
            PLAYER_SPEED *
            this.joystickForce
        );
    }

    // Mobile auto-fire
    // if (this.isMobile && this.isShooting && !this.isGameOver) {
    //     if (!this.lastShot || this.time.now - this.lastShot > 200) {
    //         shootBullet.call(this);
    //         this.lastShot = this.time.now;
    //     }
    // }

    const shouldShoot =
        (this.isMobile && this.isShooting) ||
        (!this.isMobile && this.isShootingDesktop);

    if (shouldShoot && !this.isGameOver) {
        if (!this.lastShot || this.time.now - this.lastShot > 200) {
            shootBullet.call(this);
            this.lastShot = this.time.now;
        }
    }


    // Keyboard shoot
    // if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
    //     shootBullet.call(this);
    // }
    // this.input.on('pointerdown', (pointer) => {
    //     shootBullet.call(this);
    // });
}

/* ---------------- FUNCTIONS ---------------- */
function shootBullet() {
    if (this.isGameOver) return;
    const bullet1 = this.bullets.create(
        this.player.x - 20,
        this.player.y - 20,
        'bullet'
    );
    const bullet2 = this.bullets.create(
        this.player.x + 20,
        this.player.y - 20,
        'bullet'
    );

    bullet1.setVelocityY(-BULLET_SPEED);
    bullet2.setVelocityY(-BULLET_SPEED);
}

function spawnEnemy() {
    if (this.isGameOver) return;
    const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
    const enemy = this.enemies.create(x, 0, 'enemy');
    enemy.setVelocityY(ENEMY_SPEED);

    // HITBOX SIZE (width, height)
    enemy.body.setSize(55, 40);

    // CENTER HITBOX
    enemy.body.setOffset(
        (enemy.width - 55) / 2,
        (enemy.height - 40) / 2
    );
}

function destroyEnemy(bullet, enemy) {
    if (this.isGameOver) return;
    bullet.destroy();
    enemy.destroy();

    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
}

function gameOver(player, enemy) {
    if (this.invincible) return;

    this.invincible = true;

    this.time.delayedCall(500, () => {
        this.invincible = false;
    });

    enemy.destroy();

    this.playerHealth -= 20;

    // Update health bar
    const healthPercent = this.playerHealth / this.maxHealth;
    this.healthBar.width = 100 * healthPercent;

    // Change color based on health
    if (healthPercent < 0.5) this.healthBar.fillColor = 0xffff00;
    if (healthPercent < 0.25) this.healthBar.fillColor = 0xff0000;

    // Final death
    if (this.playerHealth <= 0) {
        this.isGameOver = true;
        this.enemyTimer.remove(false);
        this.physics.pause();
        player.setTint(0xff0000);
        showRestartButton.call(this);
        this.add.text(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            'GAME OVER',
            {fontSize: '32px', fill: '#ff0000'}
        ).setOrigin(0.5);

    }
}

function showRestartButton() {

    const restartText = this.add.text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 + 60,
        'RESTART',
        {
            fontSize: '28px',
            fill: '#ffffff',
            backgroundColor: '#434343',
            padding: {x: 20, y: 10}
        }
    )
        .setOrigin(0.5)
        .setInteractive();

    restartText.on('pointerdown', () => {
        this.scene.restart();
    });
}

function togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
        this.physics.pause();
        this.enemyTimer.paused = true;

        this.pauseText = this.add.text(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2 - 80,
            'PAUSED',
            {fontSize: '32px', fill: '#ffffff'}
        ).setOrigin(0.5);
    } else {
        this.physics.resume();
        this.enemyTimer.paused = false;

        if (this.pauseText) this.pauseText.destroy();
    }
}

