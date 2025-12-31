export default class Preload extends Phaser.Scene {
    constructor() {
        super("Preload");
    }

    preload() {
        this.load.image("planet", "images/planet/planet.png");
        this.load.image("ship", "images/planet/ship.png");
        this.load.image("missile", "images/planet/missile.png");
        this.load.image("core", "images/planet/core.png");
        this.load.spritesheet("explosion", "images/planet/explosion.png", {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create() {
        this.scene.start("GameScene");
    }
}
