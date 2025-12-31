export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {
        this.centerX = 512;
        this.centerY = 300;

        // Planet
        this.planet = this.physics.add.sprite(-200, this.centerY, "planet");
        this.planet.setVelocityX(60);
        this.planet.surfaceHealth = 300;
        this.planet.coreExposed = false;

        // Core
        this.core = this.physics.add.sprite(this.centerX, this.centerY, "core");
        this.core.setVisible(false);
        this.core.health = 100;

        // Groups
        this.ships = [];
        this.missiles = this.physics.add.group();

        // Explosion animation
        this.anims.create({
            key: "explode",
            frames: this.anims.generateFrameNumbers("explosion"),
            frameRate: 20,
            hideOnComplete: true
        });

        // Spawn ships after planet reaches center
        this.time.delayedCall(4000, () => this.spawnShips());

        // Missile collision
        this.physics.add.overlap(this.missiles, this.planet, this.hitPlanet, null, this);
        this.physics.add.overlap(this.missiles, this.core, this.hitCore, null, this);
    }

    update(time) {
        // Stop planet at center
        if (this.planet.x >= this.centerX) {
            this.planet.setVelocityX(0);
            this.planet.x = this.centerX;
        }

        // Orbit ships
        this.ships.forEach(ship => {
            ship.angleOrbit += 0.01;
            ship.x = this.planet.x + Math.cos(ship.angleOrbit) * 220;
            ship.y = this.planet.y + Math.sin(ship.angleOrbit) * 220;

            if (time > ship.nextFire) {
                this.fireMissile(ship);
                ship.nextFire = time + 1500;
            }
        });
    }

    spawnShips() {
        for (let i = 0; i < 10; i++) {
            let angle = (Math.PI * 2 / 10) * i;
            let ship = this.physics.add.sprite(0, 0, "ship");

            ship.angleOrbit = angle;
            ship.nextFire = 0;

            this.ships.push(ship);
        }
    }

    fireMissile(ship) {
        let missile = this.missiles.create(ship.x, ship.y, "missile");

        let dx = this.planet.x - ship.x;
        let dy = this.planet.y - ship.y;
        let angle = Math.atan2(dy, dx);

        missile.setVelocity(
            Math.cos(angle) * 300,
            Math.sin(angle) * 300
        );
    }

    hitPlanet(missile, planet) {
        missile.destroy();
        this.createExplosion(missile.x, missile.y);

        planet.surfaceHealth -= 10;

        if (planet.surfaceHealth <= 0 && !planet.coreExposed) {
            planet.coreExposed = true;
            this.core.setVisible(true);
        }
    }

    hitCore(missile, core) {
        missile.destroy();
        this.createExplosion(missile.x, missile.y);

        core.health -= 20;

        if (core.health <= 0) {
            this.levelComplete();
        }
    }

    createExplosion(x, y) {
        let boom = this.add.sprite(x, y, "explosion");
        boom.play("explode");
    }

    levelComplete() {
        this.add.text(400, 280, "LEVEL COMPLETE", {
            fontSize: "32px",
            color: "#00ff00"
        });
        this.physics.pause();
    }
}
