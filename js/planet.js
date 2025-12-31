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
    this.load.image("hole", "images/planet/hole.png");
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
    this.planet.surfaceHealth = 300;
    this.planet.coreExposed = false;

    // ====================
    // CRATER CONTAINER (VISUAL ONLY)
    // ====================
    this.craterLayer = this.add.container(this.centerX, this.centerY);

    // ====================
    // CORE (PHYSICS – HIDDEN)
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

    spawnShips.call(this);

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
    // Rotate planet visually
    this.planet.rotation += 0.002;
    this.craterLayer.rotation += 0.002;

    // Keep crater layer centered
    this.craterLayer.setPosition(this.planet.x, this.planet.y);

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
    const TOTAL = 1;

    for (let i = 0; i < TOTAL; i++) {
        let ship = this.physics.add.image(0, 0, "ship");
        ship.setScale(0.6);
        ship.orbitAngle = (Math.PI * 2 / TOTAL) * i;
        ship.setImmovable(true);
        this.ships.push(ship);
    }
}

// ====================
// FIRE MISSILES
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
    console.log(missile);
    console.log(planet);
    // missile.destroy();
    createExplosion.call(this, missile.x, missile.y);
    createCrater.call(this, missile.x, missile.y);

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
// CREATE CRATER
// ====================
function createCrater(worldX, worldY) {
    let localX = worldX - this.planet.x;
    let localY = worldY - this.planet.y;

    let crater = this.add.image(localX, localY, "hole");
    crater.setScale(0.25);
    crater.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
    crater.setAlpha(0.9);

    this.craterLayer.add(crater);
}

// ====================
// EXPLOSION
// ====================
function createExplosion(x, y) {
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
    this.add.text(350, 380, "PLANET DESTROYED", {
        fontSize: "36px",
        color: "#00ff00",
        fontStyle: "bold"
    });

    this.physics.pause();
}



// function create() {
//     this.centerX = 512;
//     this.centerY = 400;
//     this.ORBIT_RADIUS = 320;
//
//     // ====================
//     // PLANET RENDER TEXTURE (REAL DESTRUCTION)
//     // ====================
//     const img = this.textures.get("planet").getSourceImage();
//
//     this.planetRT = this.add.renderTexture(
//         this.centerX,
//         this.centerY,
//         img.width,
//         img.height
//     );
//
//     this.planetRT.draw("planet", img.width / 2, img.height / 2);
//     this.planetRT.setOrigin(0.5);
//
//     // ====================
//     // INVISIBLE PHYSICS BODY
//     // ====================
//     this.planetHit = this.physics.add.staticImage(
//         this.centerX,
//         this.centerY,
//         null
//     );
//     this.planetHit.body.setCircle(img.width / 2);
//
//     // ====================
//     // SHIP
//     // ====================
//     this.ship = this.physics.add.image(0, 0, "ship");
//     this.ship.setScale(0.6);
//     this.ship.orbitAngle = 0;
//     this.ship.body.moves = false;
//
//     // ====================
//     // MISSILES
//     // ====================
//     this.missiles = this.physics.add.group();
//
//     this.input.on("pointerdown", () => fireMissile.call(this));
//
//     // ====================
//     // COLLISION
//     // ====================
//     this.physics.add.overlap(
//         this.missiles,
//         this.planetHit,
//         hitPlanet,
//         null,
//         this
//     );
// }
//
// function update() {
//     // Rotate planet
//     this.planetRT.rotation += 0.002;
//
//     // Orbit ship
//     this.ship.orbitAngle += 0.004;
//     this.ship.x = this.centerX + Math.cos(this.ship.orbitAngle) * this.ORBIT_RADIUS;
//     this.ship.y = this.centerY + Math.sin(this.ship.orbitAngle) * this.ORBIT_RADIUS;
//
//     this.ship.rotation =
//         Phaser.Math.Angle.Between(
//             this.ship.x,
//             this.ship.y,
//             this.centerX,
//             this.centerY
//         ) + Math.PI / 2;
// }
//
// // ====================
// // FIRE MISSILE
// // ====================
// function fireMissile() {
//     let missile = this.missiles.create(this.ship.x, this.ship.y, "missile");
//     missile.setScale(0.4);
//     missile.body.setAllowGravity(false);
//
//     let angle = Phaser.Math.Angle.Between(
//         this.ship.x,
//         this.ship.y,
//         this.centerX,
//         this.centerY
//     );
//
//     missile.setVelocity(
//         Math.cos(angle) * 450,
//         Math.sin(angle) * 450
//     );
// }
//
// // ====================
// // HIT PLANET → ERASE PIXELS
// // ====================
// function hitPlanet(missile) {
//     missile.destroy();
//     createExplosion.call(this, missile.x, missile.y);
//
//     // Convert world → texture space
//     const tx = missile.x - (this.centerX - this.planetRT.width / 2);
//     const ty = missile.y - (this.centerY - this.planetRT.height / 2);
//
//     // REAL CUT-OUT HOLE
//     this.planetRT.erase("hole", tx, ty);
// }
