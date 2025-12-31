// ================================
// DESTROY PLANET GAME (PHASER 3)
// ================================

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 800,
    backgroundColor: "#000000",
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

    // this.load.spritesheet("explosion", "images/planet/explosion.png", {
    //     frameWidth: 64,
    //     frameHeight: 64
    // });
}

function create() {
    this.centerX = 550;
    this.centerY = 400;
    this.ORBIT_RADIUS = 320;

    // ====================
    // PLANET (FIXED CENTER)
    // ====================
    this.planet = this.physics.add.image(this.centerX, this.centerY, "planet");
    // this.planet.setScale(0.25);
    this.planet.setImmovable(true);
    this.planet.body.setCircle(this.planet.width / 2);
    this.planet.surfaceHealth = 300;
    this.planet.coreExposed = false;

    // ====================
    // CORE (HIDDEN FIRST)
    // ====================
    this.core = this.physics.add.image(this.centerX, this.centerY, "core");
    this.core.setScale(0.25);
    this.core.setVisible(false);
    this.core.setImmovable(true);
    this.core.health = 120;

    // ====================
    // GROUPS
    // ====================
    this.missiles = this.physics.add.group();
    this.ships = [];

    // ====================
    // EXPLOSION ANIMATION
    // ====================
    // this.anims.create({
    //     key: "explode",
    //     frames: this.anims.generateFrameNumbers("explosion"),
    //     frameRate: 20,
    //     hideOnComplete: true
    // });

    // ====================
    // SPAWN SHIPS
    // ====================
    spawnShips.call(this);

    // ====================
    // INPUT (CLICK TO SHOOT)
    // ====================
    this.input.on("pointerdown", () => fireAllShips.call(this));

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
}

function update() {
    // Planet rotation
    this.planet.rotation += 0.002;

    // Keep core centered
    this.core.setPosition(this.centerX, this.centerY);

    // Orbit ships
    this.ships.forEach(ship => {
        ship.orbitAngle += 0.004;

        ship.x = this.centerX + Math.cos(ship.orbitAngle) * this.ORBIT_RADIUS;
        ship.y = this.centerY + Math.sin(ship.orbitAngle) * this.ORBIT_RADIUS;

        ship.rotation =
            Phaser.Math.Angle.Between(
                ship.x,
                ship.y,
                this.centerX,
                this.centerY
            ) + Math.PI / 2;
    });
}

// ====================
// SPAWN SHIPS
// ====================
function spawnShips() {
    const TOTAL = 2;

    for (let i = 0; i < TOTAL; i++) {
        let angle = (Math.PI * 2 / TOTAL) * i;

        let ship = this.physics.add.image(0, 0, "ship");
        ship.setScale(0.6);
        ship.orbitAngle = angle;
        ship.setImmovable(true);

        this.ships.push(ship);
    }
}

// ====================
// FIRE MISSILES (CLICK)
// ====================
function fireAllShips() {
    this.ships.forEach(ship => {
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
    });
}

// ====================
// HIT PLANET
// ====================
function hitPlanet(missile, planet) {
    missile.destroy();
    createExplosion.call(this, missile.x, missile.y);

    if (!planet.coreExposed) {
        planet.surfaceHealth -= 10;

        if (planet.surfaceHealth <= 0) {
            planet.coreExposed = true;
            this.core.setVisible(true);
        }
    }
}

// ====================
// HIT CORE
// ====================
function hitCore(missile, core) {
    missile.destroy();
    createExplosion.call(this, missile.x, missile.y);

    core.health -= 20;

    if (core.health <= 0) {
        levelComplete.call(this);
    }
}

// ====================
// EXPLOSION
// ====================
function createExplosion(x, y) {
    // let explosion = this.add.sprite(x, y, "explosion");
    // explosion.play("explode");

    let exp = this.add.image(x, y, "explosion");
    exp.setScale(0.6);

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
    this.add.text(360, 380, "PLANET DESTROYED", {
        fontSize: "36px",
        color: "#00ff00",
        fontStyle: "bold"
    });

    this.physics.pause();
}