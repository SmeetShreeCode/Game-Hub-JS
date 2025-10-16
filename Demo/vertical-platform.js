// ==================== CONFIG CONSTANTS =====================
const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;
const SCALE_FACTOR = 4;
const GRAVITY = 0.2;
const PLAYER_SPEED = 2;
const JUMP_FORCE = 5;
const TILE_SIZE = 16;
const CAMERA_LERP = 0.1;
const HITBOX = { x: 35, y: 26, width: 14, height: 27 };

// ==================== SETUP =====================
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let debugEnabled = false;

// ==================== UTILITY FUNCTIONS =====================
function collision({ obj1, obj2 }) {
    return (
        obj1.position.y + obj1.height >= obj2.position.y &&
        obj1.position.y <= obj2.position.y + obj2.height &&
        obj1.position.x <= obj2.position.x + obj2.width &&
        obj1.position.x + obj1.width >= obj2.position.x
    );
}

function lerp(start, end, t) {
    return start + (end - start) * t;
}

// ==================== ASSET MANAGER =====================
class AssetManager {
    constructor() {
        this.assets = new Map();
    }
    load(name, src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                this.assets.set(name, img);
                resolve(img);
            };
        });
    }
    get(name) {
        return this.assets.get(name);
    }
}

const assets = new AssetManager();

// ==================== GAME STATE MACHINE =====================
const GAME_STATE = { MENU: "menu", PLAYING: "playing", PAUSED: "paused" };
let currentState = GAME_STATE.MENU;

// ==================== CLASSES =====================
class CollisionBlock {
    constructor({ position, height = TILE_SIZE }) {
        this.position = position;
        this.width = TILE_SIZE;
        this.height = height;
    }
    draw() {
        if (debugEnabled) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }
}

class Sprite {
    constructor({ position, image, frameRate = 1, frameBuffer = 3, scale = 1 }) {
        this.position = position;
        this.image = image;
        this.scale = scale;
        this.frameRate = frameRate;
        this.frameBuffer = frameBuffer;
        this.currentFrame = 0;
        this.elapsed = 0;
    }
    draw() {
        const frameWidth = this.image.width / this.frameRate;
        ctx.drawImage(
            this.image,
            this.currentFrame * frameWidth,
            0,
            frameWidth,
            this.image.height,
            this.position.x,
            this.position.y,
            frameWidth * this.scale,
            this.image.height * this.scale
        );
    }
    updateFrames() {
        this.elapsed++;
        if (this.elapsed % this.frameBuffer === 0) {
            this.currentFrame = (this.currentFrame + 1) % this.frameRate;
        }
    }
}

class Player extends Sprite {
    constructor(config) {
        super(config);
        this.velocity = { x: 0, y: 1 };
        this.isGrounded = false;
        this.lastDirection = "right";
        this.animations = config.animations;
        this.collisionBlocks = config.collisionBlocks || [];
    }

    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x + HITBOX.x,
                y: this.position.y + HITBOX.y,
            },
            width: HITBOX.width,
            height: HITBOX.height,
        };
    }

    handleHorizontalCollisions() {
        const nearby = this.collisionBlocks.filter(
            (block) =>
                Math.abs(block.position.x - this.position.x) < TILE_SIZE * 4 &&
                Math.abs(block.position.y - this.position.y) < TILE_SIZE * 4
        );
        for (const block of nearby) {
            if (collision({ obj1: this.hitbox, obj2: block })) {
                if (this.velocity.x > 0) {
                    const offset = this.hitbox.position.x - this.position.x + this.hitbox.width;
                    this.position.x = block.position.x - offset - 0.01;
                    this.velocity.x = 0;
                } else if (this.velocity.x < 0) {
                    const offset = this.hitbox.position.x - this.position.x;
                    this.position.x = block.position.x + block.width - offset + 0.01;
                    this.velocity.x = 0;
                }
            }
        }
    }

    handleVerticalCollisions() {
        this.isGrounded = false;
        const nearby = this.collisionBlocks.filter(
            (block) =>
                Math.abs(block.position.x - this.position.x) < TILE_SIZE * 4 &&
                Math.abs(block.position.y - this.position.y) < TILE_SIZE * 4
        );
        for (const block of nearby) {
            if (collision({ obj1: this.hitbox, obj2: block })) {
                // Falling down onto block
                if (this.velocity.y > 0 && this.hitbox.position.y < block.position.y) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;
                    this.position.y = block.position.y - offset - 0.01;
                    this.isGrounded = true;
                }
                // Hitting head on block
                else if (this.velocity.y < 0 && this.hitbox.position.y > block.position.y) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y;
                    this.position.y = block.position.y + block.height - offset + 0.01;
                }
            }
        }
    }

    move(input) {
        if (input.moveLeft) {
            this.velocity.x = -PLAYER_SPEED;
            this.lastDirection = "left";
            this.switchSprite("RunLeft");
        } else if (input.moveRight) {
            this.velocity.x = PLAYER_SPEED;
            this.lastDirection = "right";
            this.switchSprite("Run");
        } else {
            this.velocity.x = 0;
            this.switchSprite(this.lastDirection === "right" ? "Idle" : "IdleLeft");
        }

        if (input.jump && this.isGrounded) {
            this.velocity.y = -JUMP_FORCE;
            this.switchSprite("Jump");
            this.isGrounded = false;
        }
    }

    applyGravity() {
        this.velocity.y += GRAVITY;
        this.position.y += this.velocity.y;
    }

    switchSprite(key) {
        const anim = this.animations[key];
        if (!anim || this.image === anim.image) return;
        this.currentFrame = 0;
        this.image = anim.image;
        this.frameRate = anim.frameRate || 1;
        this.frameBuffer = anim.frameBuffer || 3;
    }

    update() {
        // Horizontal
        this.updateHitbox();
        this.position.x += this.velocity.x;
        this.updateHitbox();
        this.handleHorizontalCollisions();

        // Vertical
        this.applyGravity();
        this.updateHitbox();
        this.handleVerticalCollisions();

        this.draw();
        this.updateFrames();

        if (debugEnabled) {
            ctx.strokeStyle = "lime";
            ctx.strokeRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height);
        }
    }
}

// ==================== INPUT MAPPER =====================
const actions = { moveLeft: false, moveRight: false, jump: false };
const keyMap = {
    a: "moveLeft",
    d: "moveRight",
    w: "jump",
    ArrowLeft: "moveLeft",
    ArrowRight: "moveRight",
    ArrowUp: "jump",
};

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") currentState = currentState === GAME_STATE.PAUSED ? GAME_STATE.PLAYING : GAME_STATE.PAUSED;
    if (e.key === "F3") debugEnabled = !debugEnabled;
    if (keyMap[e.key]) actions[keyMap[e.key]] = true;
});
window.addEventListener("keyup", (e) => {
    if (keyMap[e.key]) actions[keyMap[e.key]] = false;
});

// ==================== CAMERA =====================
const camera = { position: { x: 0, y: 0 } };

function updateCamera(target) {
    const targetX = -(target.position.x - CANVAS_WIDTH / (SCALE_FACTOR * 2)) / SCALE_FACTOR;
    const targetY = -(target.position.y - CANVAS_HEIGHT / (SCALE_FACTOR * 2)) / SCALE_FACTOR;
    camera.position.x = lerp(camera.position.x, targetX, CAMERA_LERP);
    camera.position.y = lerp(camera.position.y, targetY, CAMERA_LERP);
}

// ==================== GAME INITIALIZATION =====================
let background;
let player;
let collisionBlocks = [];

const assetsToLoad = [
    assets.load("background", "./images/vertical-platform/background.png"),
    assets.load("playerIdle", "./images/vertical-platform/warrior/Idle.png"),
    assets.load("playerRun", "./images/vertical-platform/warrior/Run.png"),
    assets.load("playerJump", "./images/vertical-platform/warrior/Jump.png"),
];

Promise.all(assetsToLoad).then(startGame);

function startGame() {
    background = new Sprite({
        position: { x: 0, y: 0 },
        image: assets.get("background"),
        frameRate: 1,
        scale: 1,
    });

    // Example static collision blocks, adjust or replace with your data
    for (let i = 0; i < 20; i++) {
        collisionBlocks.push(new CollisionBlock({ position: { x: i * TILE_SIZE, y: 500 } }));
    }

    player = new Player({
        position: { x: 100, y: 300 },
        collisionBlocks,
        image: assets.get("playerIdle"),
        frameRate: 8,
        animations: {
            Idle: { image: assets.get("playerIdle"), frameRate: 8, frameBuffer: 3 },
            IdleLeft: { image: assets.get("playerIdle"), frameRate: 8, frameBuffer: 3 },
            Run: { image: assets.get("playerRun"), frameRate: 8, frameBuffer: 5 },
            RunLeft: { image: assets.get("playerRun"), frameRate: 8, frameBuffer: 5 },
            Jump: { image: assets.get("playerJump"), frameRate: 2, frameBuffer: 3 },
        },
    });

    currentState = GAME_STATE.PLAYING;
    animate();
}

// ==================== GAME LOOP =====================
function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (currentState !== GAME_STATE.PLAYING) return;

    ctx.save();
    ctx.scale(SCALE_FACTOR, SCALE_FACTOR);
    ctx.translate(camera.position.x, camera.position.y);

    background.draw();

    for (const block of collisionBlocks) block.draw();

    player.move(actions);
    player.update();
    updateCamera(player);

    ctx.restore();
}
