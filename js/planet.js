// ================================
// DESTROY PLANET GAME (PHASER 3)
// ================================

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 800,
    backgroundColor: "#333333",
    physics: {
        default: "arcade",
        arcade: {debug: false}
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
    this.centerX = 512;
    this.centerY = 400;
    this.ORBIT_RADIUS = 320;

    // ====================
    // PLANET (PHYSICS – WORLD SPACE)
    // ====================
    this.planet = this.physics.add.image(this.centerX, this.centerY, "planet");
    this.planet.setImmovable(true);
    this.planet.body.setCircle(this.planet.width / 2);
    this.planet.surfaceHealth = 100;
    this.planet.maxHealth = 100;
    this.planet.coreExposed = false;
// ====================
// PLANET VISUAL (SEPARATE FROM PHYSICS)
// ====================
//     this.planetVisual = this.add.image(this.centerX, this.centerY, "planet");
//     this.planetVisual.setDepth(1);

    // ====================
    // CRATER CONTAINER (VISUAL ONLY) - POSITIONED AT PLANET CENTER
    // ====================
    this.craterLayer = this.add.container(this.centerX, this.centerY);
    this.craterLayer.setDepth(2);

    // ====================
    // CORE (PHYSICS – HIDDEN)
    // ====================
    this.core = this.physics.add.image(this.centerX, this.centerY, "core");
    this.core.setScale(0.25);
    this.core.setVisible(false);
    this.core.setImmovable(true);
    this.core.body.setCircle(this.core.width / 2);
    this.core.health = 60;

    // ====================
    // GROUPS
    // ====================
    this.missiles = this.physics.add.group();
    this.ships = [];

    spawnShips.call(this);

    // ====================
    // UI TEXT
    // ====================
    this.healthText = this.add.text(20, 20, 'Planet Health: 100%', {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#00000088',
        padding: { x: 10, y: 5 }
    });

    this.warningText = this.add.text(this.centerX, 50, '⚠️ CORE EXPOSED! ⚠️', {
        fontSize: '28px',
        color: '#ff4444',
        fontStyle: 'bold',
        backgroundColor: '#00000088',
        padding: { x: 10, y: 5 }
    });
    this.warningText.setOrigin(0.5);
    this.warningText.setVisible(false);

    this.instructionText = this.add.text(this.centerX, 750, 'Click on spaceships to fire missiles!', {
        fontSize: '20px',
        color: '#aaaaaa',
        backgroundColor: '#00000088',
        padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5);

    // ====================
    // CLICK HANDLER
    // ====================
    this.input.on("pointerdown", (pointer) => {
        if (this.gameOver) {
            restartGame.call(this);
            return;
        }
        fireNearestShip.call(this, pointer);
    });

    // ====================
    // COLLISIONS
    // ====================
    this.physics.add.overlap(
        this.missiles,
        this.planet,
        hitPlanet,
        null,
        this
    );

    this.physics.add.overlap(
        this.missiles,
        this.core,
        hitCore,
        () => this.planet.coreExposed,
        this
    );

    this.gameOver = false;
}

function update() {
    if (this.gameOver) return;

    // Rotate planet visually
    this.planet.rotation += 0.002;
    this.craterLayer.rotation = this.planet.rotation;
    // this.planetVisual.rotation += 0.002;
    // this.craterLayer.rotation = this.planetVisual.rotation;

    // Orbit ships (left to right)
    this.ships.forEach(ship => {
        ship.orbitAngle -= 0.004;
        ship.x = this.centerX + Math.cos(ship.orbitAngle) * this.ORBIT_RADIUS;
        ship.y = this.centerY + Math.sin(ship.orbitAngle) * this.ORBIT_RADIUS;

        ship.rotation =
            Phaser.Math.Angle.Between(
                ship.x,
                ship.y,
                this.centerX,
                this.centerY
            ) + Math.PI / 2;

        // Update cooldown
        if (ship.cooldown > 0) {
            ship.cooldown--;
            ship.setTint(0x666666);
        } else {
            ship.clearTint();
        }
    });

    // Update health text
    this.healthText.setText(`Planet Health: ${Math.max(0, Math.round(this.planet.surfaceHealth))}%`);

    // Show warning if core exposed
    this.warningText.setVisible(this.planet.coreExposed && !this.gameOver);

    // Pulse warning text
    if (this.planet.coreExposed && !this.gameOver) {
        this.warningText.setAlpha(0.5 + Math.sin(Date.now() * 0.01) * 0.5);
    }
}

// ====================
// SPAWN SHIPS
// ====================
function spawnShips() {
    const TOTAL = 3;

    for (let i = 0; i < TOTAL; i++) {
        let ship = this.physics.add.image(0, 0, "ship");
        ship.setScale(0.6);
        ship.orbitAngle = (Math.PI * 2 / TOTAL) * i;
        ship.setImmovable(true);
        ship.cooldown = 0;
        this.ships.push(ship);
    }
}

// ====================
// FIRE NEAREST SHIP
// ====================
function fireNearestShip(pointer) {
    let nearest = null;
    let minDist = Infinity;

    this.ships.forEach(ship => {
        const dist = Phaser.Math.Distance.Between(
            pointer.x,
            pointer.y,
            ship.x,
            ship.y
        );
        if (dist < minDist && dist < 60 && ship.cooldown === 0) {
            minDist = dist;
            nearest = ship;
        }
    });

    if (nearest) {
        fireShip.call(this, nearest);
    }
}

// ====================
// FIRE SHIP
// ====================
function fireShip(ship) {
    if (ship.cooldown > 0 || this.gameOver) return;

    let missile = this.missiles.create(ship.x, ship.y, "missile");
    missile.setScale(0.4);

    let angle = Phaser.Math.Angle.Between(
        ship.x,
        ship.y,
        this.centerX,
        this.centerY
    );

    missile.setVelocity(
        Math.cos(angle) * 450,
        Math.sin(angle) * 450
    );

    // Set cooldown (60 frames = 1 second at 60fps)
    ship.cooldown = 60;
}

// ====================
// HIT PLANET
// ====================
function hitPlanet(missile, planet) {
    planet.destroy();

    // World position for explosion
    const worldX = planet.x;
    const worldY = planet.y;

    // Calculate local position relative to planet center
    const localX = worldX - missile.x;
    const localY = worldY - missile.y;
    console.log({
        missileWorld: { x: missile.x, y: missile.y },
        planetCenter: { x: planet.x, y: planet.y },
        localHit: {
            x: missile.x - planet.x,
            y: missile.y - planet.y
        },
        angleDeg: Phaser.Math.RadToDeg(
            Phaser.Math.Angle.Between(
                planet.x,
                planet.y,
                missile.x,
                missile.y
            )
        )
    });

    // Rotate the local coordinates by the inverse of planet rotation
    // This makes the crater stick to the planet surface as it rotates
    const angle = -missile.rotation;
    const rotatedX = localX * Math.cos(angle) - localY * Math.sin(angle);
    const rotatedY = localX * Math.sin(angle) + localY * Math.cos(angle);

    createExplosion.call(this, worldX, worldY);
    createCrater.call(this, rotatedX, rotatedY);

    if (!planet.coreExposed) {
        planet.surfaceHealth -= 10;
        if (planet.surfaceHealth <= 50) {
            planet.coreExposed = true;
            this.core.setVisible(true);

            // Make planet semi-transparent to show core
            planet.setAlpha(0.7);
        }
    }
}


function applyPlanetDamage(scene, amount) {
    if (scene.planet.coreExposed) return;

    scene.planet.surfaceHealth -= amount;
    scene.planet.surfaceHealth = Math.max(0, scene.planet.surfaceHealth);

    // Visual feedback
    scene.tweens.add({
        targets: scene.planetVisual,
        alpha: 0.6,
        duration: 80,
        yoyo: true
    });

    // Core exposed at 50%
    if (scene.planet.surfaceHealth <= 50) {
        scene.planet.coreExposed = true;
        scene.core.setVisible(true);
        scene.planetVisual.setAlpha(0.7);
    }
}

// ====================
// HIT CORE
// ====================
function hitCore(missile, core) {
    missile.destroy();
    createExplosion.call(this, missile.x, missile.y);

    core.health -= 20;

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

// ====================
// CREATE CRATER
// ====================
function createCrater(localX, localY) {
    let crater = this.add.image(localX, localY, "hole");
    crater.setOrigin(0.5);
    crater.setScale(0.5);
    crater.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
    crater.setAlpha(0.85);
console.log(crater);
    this.craterLayer.add(crater);
}

// ====================
// EXPLOSION
// ====================
function createExplosion(x, y) {
    let exp = this.add.image(x, y, "explosion");
    exp.setScale(0.6);
console.log("explosion", x, y)
    this.tweens.add({
        targets: exp,
        scale: 1.3,
        alpha: 0,
        duration: 300,
        onComplete: () => exp.destroy()
    });
}

// ====================
// LEVEL COMPLETE
// ====================
function levelComplete() {
    this.gameOver = true;

    // Create multiple explosions across the planet
    for (let i = 0; i < 15; i++) {
        this.time.delayedCall(i * 100, () => {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 150;
            const x = this.centerX + Math.cos(angle) * distance;
            const y = this.centerY + Math.sin(angle) * distance;
            createExplosion.call(this, x, y);
        });
    }

    // Hide planet and core after explosions
    this.time.delayedCall(1500, () => {
        this.planet.setVisible(false);
        this.core.setVisible(false);
        this.craterLayer.setVisible(false);
    });

    // Show game over screen
    this.time.delayedCall(2000, () => {
        // Semi-transparent background
        const gameOverBg = this.add.rectangle(
            this.centerX,
            this.centerY,
            1024,
            800,
            0x000000,
            0.8
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
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    });

    this.physics.pause();
}

// ====================
// RESTART GAME
// ====================
function restartGame() {
    this.scene.restart();
}