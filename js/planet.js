// DESTROY PLANET GAME (PHASER 3)
// ================================

// GAME CONSTANTS
// ====================
const GAME_CONFIG = {
    WIDTH: 1024,
    HEIGHT: 800,
    BG_COLOR: "#1a1a2e",

    get CENTER_X() {
        return this.WIDTH / 2;
    },
    get CENTER_Y() {
        return this.HEIGHT / 2;
    }
};

const PLANET_CONFIG = {
    INITIAL_HEALTH: 100,
    CORE_EXPOSE_THRESHOLD: 50,
    ROTATION_SPEED: 0.002,
    DAMAGE_PER_HIT: 5
};

const SHIP_CONFIG = {
    COUNT: 3,
    ORBIT_RADIUS: 320,
    ORBIT_SPEED: 0.004,
    SCALE: 0.6,
    COOLDOWN_FRAMES: 40,
    CLICK_RADIUS: 60,
    TINT_COOLING: 0x666666
};

const MISSILE_CONFIG = {
    SCALE: 0.4,
    SPEED: 450
};

const CORE_CONFIG = {
    INITIAL_HEALTH: 80,
    SCALE: 0.25,
    DAMAGE_PER_HIT: 15
};

const CRATER_CONFIG = {
    RADIUS: 25  // Pixel erase radius
};

const EXPLOSION_CONFIG = {
    INITIAL_SCALE: 0.6,
    FINAL_SCALE: 1.3,
    DURATION: 300,
    FINAL_EXPLOSION_COUNT: 20,
    FINAL_EXPLOSION_DELAY: 80,
    FINAL_EXPLOSION_RADIUS: 180
};

const UI_CONFIG = {
    TEXT_STYLE: {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#00000088',
        padding: {x: 10, y: 5}
    },
    WARNING_PULSE_SPEED: 0.01,
    WARNING_PULSE_MIN: 0.5
};

const GAME_OVER_CONFIG = {
    HIDE_DELAY: 1500,
    SHOW_TEXT_DELAY: 2000,
    OVERLAY_ALPHA: 0.8,
    PULSE_DURATION: 800,
    PULSE_MIN_ALPHA: 0.3
};

// PHASER CONFIG
// ====================
const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    backgroundColor: GAME_CONFIG.BG_COLOR,
    physics: {
        default: "arcade",
        arcade: {debug: true}
    },
    scene: {
        preload,
        create,
        update
    }
};

new Phaser.Game(config);

function preload() {
    this.load.image("planet", "images/planet/planet.png");
    this.load.image("ship", "images/planet/ship.png");
    this.load.image("missile", "images/planet/missile.png");
    this.load.image("core", "images/planet/core.png");
    this.load.image("explosion", "images/planet/explosion.png");
    this.load.image("hole", "images/planet/hole2.png");
}

function create() {
    this.centerX = GAME_CONFIG.CENTER_X;
    this.centerY = GAME_CONFIG.CENTER_Y;
    this.ORBIT_RADIUS = SHIP_CONFIG.ORBIT_RADIUS;

    // GET PLANET IMAGE DIMENSIONS
    // ====================
    const planetImg = this.textures.get("planet").getSourceImage();

    // CREATE RENDER TEXTURE FROM PLANET IMAGE (PIXEL DESTRUCTION)
    // ====================
    this.planetRT = this.add.renderTexture(
        this.centerX,
        this.centerY,
        planetImg.width,
        planetImg.height
    );

    // Draw the planet image onto the render texture
    this.planetRT.draw("planet");
    this.planetRT.setOrigin(0.5);

    // INVISIBLE PHYSICS BODY FOR COLLISION
    // ====================
// INVISIBLE PHYSICS HITBOX (PERFECTLY CENTERED)
    this.planetHitbox = this.add.circle(
        this.centerX,
        this.centerY,
        planetImg.width / 2
    );

// Enable physics on the circle
    this.physics.add.existing(this.planetHitbox, true);
    this.planetHitbox.body.setCircle(planetImg.width / 2);
// Optional: make invisible
    this.planetHitbox.setVisible(false);
    this.planetHitbox.visible = false;

    // PLANET DATA
    // ====================
    this.planet = {
        x: this.centerX,
        y: this.centerY,
        radius: planetImg.width / 2,
        surfaceHealth: PLANET_CONFIG.INITIAL_HEALTH,
        maxHealth: PLANET_CONFIG.INITIAL_HEALTH,
        coreExposed: false
    };

    // CORE (PHYSICS – HIDDEN)
    // ====================
    this.core = this.physics.add.image(this.centerX, this.centerY, "core");
    this.core.setScale(CORE_CONFIG.SCALE);
    this.core.setVisible(false);
    this.core.setImmovable(true);
    this.core.body.setCircle(this.core.width / 2);
    this.core.health = CORE_CONFIG.INITIAL_HEALTH;

    // GROUPS
    // ====================
    this.missiles = this.physics.add.group();
    this.ships = [];
    this.gameOver = false;

    spawnShips.call(this);

    // UI TEXT
    // ====================
    this.healthText = this.add.text(20, 20, `Planet Health: ${PLANET_CONFIG.INITIAL_HEALTH}%`, UI_CONFIG.TEXT_STYLE);

    this.warningText = this.add.text(this.centerX, 50, '⚠️ CORE EXPOSED! ⚠️', {
        ...UI_CONFIG.TEXT_STYLE,
        fontSize: '28px',
        color: '#ff4444'
    });
    this.warningText.setOrigin(0.5);
    this.warningText.setVisible(false);

    this.instructionText = this.add.text(this.centerX, 750, 'Click on spaceships to fire missiles!', {
        ...UI_CONFIG.TEXT_STYLE,
        fontSize: '20px',
        color: '#aaaaaa'
    });
    this.instructionText.setOrigin(0.5);

    // CLICK HANDLER
    // ====================
    this.input.on("pointerdown", (pointer) => {
        if (this.gameOver) {
            restartGame.call(this);
            return;
        }
        fireNearestShip.call(this, pointer);
    });

    // COLLISIONS
    // ====================
    this.physics.add.overlap(this.missiles, this.planetHitbox, hitPlanet, null, this);
    this.physics.add.overlap(this.missiles, this.core, hitCore, () => this.planet.coreExposed, this);
}

function update() {
    if (this.gameOver) return;

    // Rotate planet and craters together
    this.planetRT.rotation += PLANET_CONFIG.ROTATION_SPEED;
    this.planetHitbox.x = this.centerX;
    this.planetHitbox.y = this.centerY;

    // Orbit ships (left to right)
    this.ships.forEach(ship => {
        ship.orbitAngle -= SHIP_CONFIG.ORBIT_SPEED;
        ship.x = this.centerX + Math.cos(ship.orbitAngle) * SHIP_CONFIG.ORBIT_RADIUS;
        ship.y = this.centerY + Math.sin(ship.orbitAngle) * SHIP_CONFIG.ORBIT_RADIUS;

        ship.rotation = Phaser.Math.Angle.Between(
            ship.x,
            ship.y,
            this.centerX,
            this.centerY
        ) + Math.PI / 2;

        // Update cooldown
        if (ship.cooldown > 0) {
            ship.cooldown--;
            ship.setTint(SHIP_CONFIG.TINT_COOLING);
        } else {
            ship.clearTint();
        }
    });
    this.missiles.children.each(m => {
        if (m.y < -50 || m.y > GAME_CONFIG.HEIGHT + 50) {
            m.destroy();
        }
    });

    // Update health text
    this.healthText.setText(`Planet Health: ${Math.max(0, Math.round(this.planet.surfaceHealth))}%`);

    // Pulse warning text if core exposed
    if (this.planet.coreExposed) {
        this.warningText.setVisible(true);
        this.warningText.setAlpha(
            UI_CONFIG.WARNING_PULSE_MIN +
            Math.sin(Date.now() * UI_CONFIG.WARNING_PULSE_SPEED) * UI_CONFIG.WARNING_PULSE_MIN
        );
    }
}

// SPAWN SHIPS
// ====================
function spawnShips() {
    for (let i = 0; i < SHIP_CONFIG.COUNT; i++) {
        let ship = this.physics.add.image(0, 0, "ship");
        ship.setScale(SHIP_CONFIG.SCALE);
        ship.orbitAngle = (Math.PI * 2 / SHIP_CONFIG.COUNT) * i;
        ship.setImmovable(true);
        ship.cooldown = 0;
        this.ships.push(ship);
    }
}

// FIRE NEAREST SHIP
// ====================
function fireNearestShip(pointer) {
    let nearest = null;
    let minDist = Infinity;

    this.ships.forEach(ship => {
        const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, ship.x, ship.y);
        if (dist < minDist && dist < SHIP_CONFIG.CLICK_RADIUS && ship.cooldown === 0) {
            minDist = dist;
                nearest = ship;
        }
    });

    if (nearest) {
        fireShip.call(this, nearest);
    }
}

// FIRE SHIP
// ====================
function fireShip(ship) {
    if (ship.cooldown > 0 || this.gameOver) return;

    let missile = this.missiles.create(ship.x, ship.y, "missile");
    missile.setScale(MISSILE_CONFIG.SCALE);

    let angle = Phaser.Math.Angle.Between(ship.x, ship.y, this.centerX, this.centerY);

    // Rotate missile to face the direction it's traveling
    missile.setRotation(angle);

    missile.setVelocity(
        Math.cos(angle) * MISSILE_CONFIG.SPEED,
        Math.sin(angle) * MISSILE_CONFIG.SPEED
    );

    ship.cooldown = SHIP_CONFIG.COOLDOWN_FRAMES;
}

// HIT PLANET - PIXEL DESTRUCTION
// ====================
function hitPlanet(missile, planetHitbox) {

    // Save hit position BEFORE destroying missile
    const hitX = planetHitbox.x;
    const hitY = planetHitbox.y;
console.log("Missile", missile)
    planetHitbox.destroy();
console.log("PlanetHitBox", planetHitbox)
console.log("PlanetHitBox  X", planetHitbox.x)

    // Explosion at exact hit point
    createExplosion.call(this, hitX, hitY);

    // ---------------------------------------------------
    // STEP 1: world → planet-centered coordinates
    // ---------------------------------------------------
    const dx = hitX - missile.x;
    const dy = hitY - missile.y;

    // ---------------------------------------------------
    // STEP 2: undo planet rotation
    // ---------------------------------------------------
    const angle = -missile.rotation;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    // ---------------------------------------------------
    // STEP 3: convert to renderTexture space
    // ---------------------------------------------------
    const textureX = localX + this.planetRT.width / 2;
    const textureY = localY + this.planetRT.height / 2;
console.log("Planet hole", textureX, textureY);
    // ---------------------------------------------------
    // STEP 4: erase pixels EXACTLY where missile hit
    // ---------------------------------------------------
    this.planetRT.erase("hole", textureX, textureY);
    console.log(this.planetRT.erase("hole", textureX, textureY))

    // ---------------------------------------------------
    // STEP 5: damage logic
    // ---------------------------------------------------
    if (!this.planet.coreExposed) {
        this.planet.surfaceHealth -= PLANET_CONFIG.DAMAGE_PER_HIT;

        if (this.planet.surfaceHealth <= PLANET_CONFIG.CORE_EXPOSE_THRESHOLD) {
            this.planet.coreExposed = true;
            this.core.setVisible(true);
            this.planetRT.setAlpha(0.7);
        }
    }
}

// HIT CORE
// ====================
function hitCore(missile, core) {
    missile.destroy();
    createExplosion.call(this, missile.x, missile.y);

    core.health -= CORE_CONFIG.DAMAGE_PER_HIT;

    // Flash effect on core hit
    this.tweens.add({
        targets: core,
        alpha: 0.3,
        duration: 100,
        yoyo: true
    });

    if (core.health <= 0) {
        levelComplete.call(this);
    }
}

// EXPLOSION
// ====================
function createExplosion(x, y) {
    let exp = this.add.image(x, y, "explosion");
    exp.setScale(EXPLOSION_CONFIG.INITIAL_SCALE);
    console.log("explosion", x, y)

    this.tweens.add({
        targets: exp,
        scale: EXPLOSION_CONFIG.FINAL_SCALE,
        alpha: 0,
        duration: EXPLOSION_CONFIG.DURATION,
        onComplete: () => exp.destroy()
    });
}

// LEVEL COMPLETE
// ====================
function levelComplete() {
    this.gameOver = true;

    // Create multiple explosions across the planet
    for (let i = 0; i < EXPLOSION_CONFIG.FINAL_EXPLOSION_COUNT; i++) {
        this.time.delayedCall(i * EXPLOSION_CONFIG.FINAL_EXPLOSION_DELAY, () => {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * EXPLOSION_CONFIG.FINAL_EXPLOSION_RADIUS;
            const x = this.centerX + Math.cos(angle) * distance;
            const y = this.centerY + Math.sin(angle) * distance;
            createExplosion.call(this, x, y);
        });
    }

    // Hide planet and core after explosions
    this.time.delayedCall(GAME_OVER_CONFIG.HIDE_DELAY, () => {
        this.planetRT.setVisible(false);
        this.core.setVisible(false);
    });

    // Show game over screen
    this.time.delayedCall(GAME_OVER_CONFIG.SHOW_TEXT_DELAY, () => {
        // Semi-transparent background
        this.add.rectangle(
            this.centerX,
            this.centerY,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            0x000000,
            GAME_OVER_CONFIG.OVERLAY_ALPHA
        );

        // Main text
        const gameOverText = this.add.text(this.centerX, this.centerY - 50, "PLANET DESTROYED!", {
            fontSize: "60px",
            color: "#ff4444",
            fontStyle: "bold"
        });
        gameOverText.setOrigin(0.5);

        // Restart instruction
        const restartText = this.add.text(this.centerX, this.centerY + 50, "Click anywhere to restart", {
            fontSize: "28px",
            color: "#ffffff"
        });
        restartText.setOrigin(0.5);

        // Pulse effect on restart text
        this.tweens.add({
            targets: restartText,
            alpha: GAME_OVER_CONFIG.PULSE_MIN_ALPHA,
            duration: GAME_OVER_CONFIG.PULSE_DURATION,
            yoyo: true,
            repeat: -1
        });
    });

    this.physics.pause();
}

// RESTART GAME
// ====================
function restartGame() {
    this.scene.restart();
}