// clean vertical-platform game script (single-file)
// Assumes presence of: <canvas> element, arrays floorCollisions and platformCollisions (1D arrays), and image assets paths used below.

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let gameOver = false;
let animationId = null;

canvas.width = innerWidth;
canvas.height = innerHeight;

const scaledCanvas = {
    width: canvas.width / 4,
    height: canvas.height / 4,
};

const gravity = 0.2;

// ---------------------- Collision block ----------------------
class CollisionBlock {
    constructor({ position, height = 16, width = 16 }) {
        this.position = position;
        this.width = width;
        this.height = height;
    }

    draw() {
        // debug draw; comment out if you don't want visible blocks
        ctx.fillStyle = "rgba(255, 0, 0, 0.25)";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
    }
}

// ---------------------- Sprite base ----------------------
class Sprite {
    constructor({ position = { x: 0, y: 0 }, imageSrc = null, frameRate = 1, frameBuffer = 3, scale = 1 }) {
        this.position = position;
        this.scale = scale;
        this.frameRate = frameRate || 1;
        this.frameBuffer = frameBuffer || 3;
        this.currentFrame = 0;
        this.elapsedFrame = 0;
        this.loaded = false;
        this.image = null;
        this.width = 0;
        this.height = 0;

        if (imageSrc) {
            this.image = new Image();
            this.image.onload = () => {
                // account for spritesheet frameRate
                this.width = (this.image.width / this.frameRate) * this.scale;
                this.height = this.image.height * this.scale;
                this.loaded = true;
            };
            this.image.src = imageSrc;
        }
    }

    draw() {
        if (!this.image || !this.loaded) {
            // optionally draw placeholder rectangle
            return;
        }

        const frameWidth = this.image.width / this.frameRate;
        const cropX = this.currentFrame * frameWidth;

        ctx.drawImage(
            this.image,
            cropX,
            0,
            frameWidth,
            this.image.height,
            this.position.x,
            this.position.y,
            frameWidth * this.scale,
            this.image.height * this.scale
        );
    }

    update() {
        this.draw();
        this.updateFrames();
    }

    updateFrames() {
        this.elapsedFrame++;
        if (this.elapsedFrame % this.frameBuffer === 0) {
            if (this.currentFrame < this.frameRate - 1) this.currentFrame++;
            else this.currentFrame = 0;
        }
    }
}

// ---------------------- Player ----------------------
class Player extends Sprite {
    constructor({ position, collisionBlocks = [], platformCollisionBlocks = [], imageSrc, frameRate = 1, scale = 0.5, animations = {} }) {
        super({ position, imageSrc, frameRate, scale });
        this.velocity = { x: 0, y: 1 };
        this.collisionBlocks = collisionBlocks;
        this.platformCollisionBlocks = platformCollisionBlocks;

        this.animations = animations;
        // preload animation images
        for (let key in this.animations) {
            const img = new Image();
            img.src = this.animations[key].imageSrc;
            this.animations[key].image = img;
        }

        this.lastDirection = "right";

        // hitbox relative to position
        this.hitbox = {
            position: { x: this.position.x, y: this.position.y },
            width: 14,
            height: 27,
        };

        // camera box for panning
        this.camerabox = {
            position: { x: this.position.x, y: this.position.y },
            width: 200,
            height: 80,
        };

        // attacking
        this.attackBox = {
            position: { x: this.position.x, y: this.position.y },
            width: 30,
            height: 20,
            offset: {
                right: 25,
                left: -35,
                y: 20,
            },
            active: false,
        };
        this.attackCooldown = false;

        // health
        this.maxHealth = 5;
        this.health = this.maxHealth;
        this.isInvincible = false;

        // jumps
        this.jumpsRemaining = 2;
    }

    performAttack() {
        if (this.attackCooldown) return;
        this.attackBox.active = true;
        this.attackCooldown = true;

        setTimeout(() => {
            this.attackBox.active = false;
        }, 150);

        setTimeout(() => {
            this.attackCooldown = false;
        }, 400);
    }

    switchSprite(key) {
        if (!this.animations[key]) return;
        const anim = this.animations[key];
        // if image already set to that sprite, or images not loaded, skip
        if (this.image === anim.image) return;
        this.image = anim.image;
        this.frameBuffer = anim.frameBuffer;
        this.frameRate = anim.frameRate;
        this.currentFrame = 0;
        this.loaded = !!this.image.complete; // may be true/false
        if (this.image.complete) {
            this.width = (this.image.width / this.frameRate) * this.scale;
            this.height = this.image.height * this.scale;
        } else {
            this.image.onload = () => {
                this.width = (this.image.width / this.frameRate) * this.scale;
                this.height = this.image.height * this.scale;
                this.loaded = true;
            };
        }
    }

    updateCamerabox() {
        this.camerabox = {
            position: {
                x: this.position.x - 50,
                y: this.position.y,
            },
            width: 200,
            height: 80,
        };
    }

    checkForHorizontalCanvasCollision() {
        const leftLimit = 0;
        const rightLimit = 576; // game world width in scaled units originally used
        if (this.hitbox.position.x + this.hitbox.width + this.velocity.x >= rightLimit || this.hitbox.position.x + this.velocity.x <= leftLimit) {
            this.velocity.x = 0;
        }
    }

    shouldPanCameraToTheLeft({ canvas, camera }) {
        const cameraboxRightSide = this.camerabox.position.x + this.camerabox.width;
        const scaledDownCanvasWidth = canvas.width / 4;
        if (cameraboxRightSide >= 576) return;
        if (cameraboxRightSide >= scaledDownCanvasWidth + Math.abs(camera.position.x)) {
            camera.position.x -= this.velocity.x;
        }
    }

    shouldPanCameraToTheRight({ canvas, camera }) {
        if (this.camerabox.position.x <= 0) return;
        if (this.camerabox.position.x <= Math.abs(camera.position.x)) {
            camera.position.x -= this.velocity.x;
        }
    }

    shouldPanCameraDown({ canvas, camera }) {
        if (this.camerabox.position.y + this.velocity.y <= 0) return;
        if (this.camerabox.position.y <= Math.abs(camera.position.y)) {
            camera.position.y -= this.velocity.y;
        }
    }

    shouldPanCameraUp({ canvas, camera }) {
        if (this.camerabox.position.y + this.camerabox.height + this.velocity.y >= 432) return;
        const scaledCanvasHeight = canvas.height / 4;
        if (this.camerabox.position.y + this.camerabox.height >= Math.abs(camera.position.y) + scaledCanvasHeight) {
            camera.position.y -= this.velocity.y;
        }
    }

    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x + 35,
                y: this.position.y + 26,
            },
            width: 14,
            height: 27,
        };
    }

    updateAttackBox() {
        if (this.lastDirection === "right") {
            this.attackBox.position.x = this.hitbox.position.x + this.attackBox.offset.right;
        } else {
            this.attackBox.position.x = this.hitbox.position.x + this.attackBox.offset.left;
        }
        this.attackBox.position.y = this.hitbox.position.y + this.attackBox.offset.y;
    }

    applyGravity() {
        this.velocity.y += gravity;
        this.position.y += this.velocity.y;
    }

    checkForHorizontalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];
            if (collision({ obj1: this.hitbox, obj2: collisionBlock })) {
                if (this.velocity.x > 0) {
                    this.velocity.x = 0;
                    const offset = this.hitbox.position.x - this.position.x + this.hitbox.width;
                    this.position.x = collisionBlock.position.x - offset - 0.01;
                    break;
                }
                if (this.velocity.x < 0) {
                    this.velocity.x = 0;
                    const offset = this.hitbox.position.x - this.position.x;
                    this.position.x = collisionBlock.position.x + collisionBlock.width - offset + 0.01;
                    break;
                }
            }
        }
    }

    checkForVerticalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];
            if (collision({ obj1: this.hitbox, obj2: collisionBlock })) {
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;
                    this.position.y = collisionBlock.position.y - offset - 0.01;
                    this.jumpsRemaining = 2;
                    break;
                }
                if (this.velocity.y < 0) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y;
                    this.position.y = collisionBlock.position.y + collisionBlock.height - offset + 0.01;
                    break;
                }
            }
        }

        // platform collision blocks (one-sided)
        for (let i = 0; i < this.platformCollisionBlocks.length; i++) {
            const platformCollisionBlock = this.platformCollisionBlocks[i];
            if (platformCollision({
                obj1: this.hitbox,
                obj2: platformCollisionBlock,
            })) {
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;
                    this.position.y = platformCollisionBlock.position.y - offset - 0.01;
                    this.jumpsRemaining = 2;
                    break;
                }
            }
        }
    }

    takeDamage(direction = "left", knockback = 5) {
        if (this.isInvincible || gameOver) return;
        this.health--;
        this.isInvincible = true;

        this.velocity.x = direction === "left" ? -knockback : knockback;
        this.velocity.y = -knockback;

        setTimeout(() => {
            this.isInvincible = false;
        }, 500);

        if (this.health <= 0) {
            this.switchSprite("Death");
            this.velocity.x = 0;
            this.velocity.y = 0;
            gameOver = true;
        }
    }

    update() {
        this.updateFrames();
        this.updateHitbox();
        this.updateAttackBox();
        this.updateCamerabox();

        // draw attack box if active (debug)
        if (this.attackBox.active) {
            ctx.fillStyle = "rgba(255,255,0,0.3)";
            ctx.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }

        // draw player sprite
        this.draw();

        // movement and collisions
        this.position.x += this.velocity.x;
        this.updateHitbox();
        this.checkForHorizontalCollisions();

        this.applyGravity();
        this.updateHitbox();
        this.checkForVerticalCollisions();
    }
}

// ---------------------- Enemy ----------------------
class Enemy extends Sprite {
    constructor({ position, collisionBlocks = [], platformCollisionBlocks = [], imageSrc, frameRate = 1, scale = 0.5, animations = {} }) {
        super({ position, imageSrc, frameRate, scale });
        this.position = position;
        this.velocity = { x: 1, y: 1 };
        this.collisionBlocks = collisionBlocks;
        this.platformCollisionBlocks = platformCollisionBlocks;

        this.animations = animations;
        for (let key in this.animations) {
            const img = new Image();
            img.src = this.animations[key].imageSrc;
            this.animations[key].image = img;
        }

        this.hitbox = {
            position: { x: this.position.x, y: this.position.y },
            width: 14,
            height: 27,
        };

        this.movingRight = true;
        this.health = 3;
        this.maxHealth = 3;
        this.dead = false;
        this.markedForDeletion = false;

        this.attackBox = {
            position: { x: this.position.x, y: this.position.y },
            width: 40,
            height: 40,
            active: false,
        };

        this.attackCooldown = 2000;
        this.lastAttack = 0;
        this.attackDamage = 1;
    }

    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x + 35,
                y: this.position.y + 26,
            },
            width: 14,
            height: 27,
        };
    }

    applyGravity() {
        this.velocity.y += gravity;
        this.position.y += this.velocity.y;
    }

    checkForHorizontalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const block = this.collisionBlocks[i];
            if (collision({ obj1: this.hitbox, obj2: block })) {
                if (this.velocity.x > 0) {
                    this.velocity.x = -1;
                    this.movingRight = false;
                    return;
                } else if (this.velocity.x < 0) {
                    this.velocity.x = 1;
                    this.movingRight = true;
                    return;
                }
            }
        }
    }

    checkForVerticalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const block = this.collisionBlocks[i];
            if (collision({ obj1: this.hitbox, obj2: block })) {
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;
                    this.position.y = block.position.y - offset - 0.01;
                    break;
                }
            }
        }
    }

    patrol() {
        // simple patrol: move horizontally and avoid falling by checking platform blocks under front point
        this.position.x += this.velocity.x;

        const frontX = this.movingRight ? this.hitbox.position.x + this.hitbox.width + 1 : this.hitbox.position.x - 1;
        const frontY = this.hitbox.position.y + this.hitbox.height + 1;

        let onGroundAhead = false;
        for (let block of this.platformCollisionBlocks) {
            if (
                frontX >= block.position.x &&
                frontX <= block.position.x + block.width &&
                frontY >= block.position.y &&
                frontY <= block.position.y + block.height
            ) {
                onGroundAhead = true;
                break;
            }
        }

        if (!onGroundAhead) {
            this.velocity.x *= -1;
            this.movingRight = !this.movingRight;
        }

        // switch sprite if animations exist
        if (this.animations) {
            if (this.movingRight && this.animations.Walk) this.switchSprite("Walk");
            else if (!this.movingRight && this.animations.WalkLeft) this.switchSprite("WalkLeft");
        }
    }

    attack() {
        const now = Date.now();
        if (now - this.lastAttack < this.attackCooldown) return;
        this.attackBox.active = true;
        this.lastAttack = now;

        // place attack box roughly in front
        this.attackBox.position.x = this.position.x + (this.movingRight ? this.width || 0 : -this.attackBox.width);
        this.attackBox.position.y = this.position.y;

        setTimeout(() => {
            this.attackBox.active = false;
        }, 300);
    }

    takeDamage(direction = "left", knockback = 3) {
        if (this.dead) return;
        this.health--;
        this.velocity.x = direction === "left" ? -knockback : knockback;
        this.velocity.y = -knockback / 2;

        if (this.health <= 0) this.die();
    }

    die() {
        this.dead = true;
        if (this.animations && this.animations.Death) this.switchSprite("Death");
        setTimeout(() => {
            this.markedForDeletion = true;
        }, 800);
    }

    switchSprite(key) {
        if (!this.animations[key]) return;
        const anim = this.animations[key];
        if (this.image === anim.image) return;
        this.image = anim.image;
        this.frameBuffer = anim.frameBuffer;
        this.frameRate = anim.frameRate;
        this.currentFrame = 0;
        this.loaded = !!this.image.complete;
        if (this.image.complete) {
            this.width = (this.image.width / this.frameRate) * this.scale;
            this.height = this.image.height * this.scale;
        } else {
            this.image.onload = () => {
                this.width = (this.image.width / this.frameRate) * this.scale;
                this.height = this.image.height * this.scale;
                this.loaded = true;
            };
        }
    }

    update() {
        if (this.markedForDeletion) return;
        this.updateFrames();
        this.updateHitbox();
        this.applyGravity();
        this.position.x += this.velocity.x;
        this.updateHitbox();
        this.checkForHorizontalCollisions();
        this.checkForVerticalCollisions();

        this.draw();
        this.patrol();

        // optionally attack randomly or when player in range (left as simple timer)
        if (Date.now() - this.lastAttack > this.attackCooldown + 5000) {
            this.attack();
        }
    }
}

// ---------------------- Collision helpers ----------------------
function collision({ obj1, obj2 }) {
    return (
        obj1.position.y + obj1.height >= obj2.position.y &&
        obj1.position.y <= obj2.position.y + obj2.height &&
        obj1.position.x <= obj2.position.x + obj2.width &&
        obj1.position.x + obj1.width >= obj2.position.x
    );
}

function platformCollision({ obj1, obj2 }) {
    // only collide if obj1's bottom is within platform vertical tolerance -> one-sided platform
    return (
        obj1.position.y + obj1.height >= obj2.position.y &&
        obj1.position.y + obj1.height <= obj2.position.y + obj2.height &&
        obj1.position.x <= obj2.position.x + obj2.width &&
        obj1.position.x + obj1.width >= obj2.position.x
    );
}

// ---------------------- Build collision arrays from tile arrays ----------------------
// NOTE: floorCollisions and platformCollisions must be present as 1D arrays (tile indices).
// Also original script used width = 36 tiles, so we will use 36 here.
const TILE_COLUMNS = 36; // keep consistent with your map layout
const floorCollisions2D = [];
if (typeof floorCollisions !== "undefined" && Array.isArray(floorCollisions)) {
    for (let i = 0; i < floorCollisions.length; i += TILE_COLUMNS) {
        floorCollisions2D.push(floorCollisions.slice(i, i + TILE_COLUMNS));
    }
}
const collisionBlocks = [];
floorCollisions2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 202) {
            collisionBlocks.push(
                new CollisionBlock({
                    position: { x: x * 16, y: y * 16 },
                    width: 16,
                    height: 16,
                })
            );
        }
    });
});

const platformCollisions2D = [];
if (typeof platformCollisions !== "undefined" && Array.isArray(platformCollisions)) {
    for (let i = 0; i < platformCollisions.length; i += TILE_COLUMNS) {
        platformCollisions2D.push(platformCollisions.slice(i, i + TILE_COLUMNS));
    }
}
const platformCollisionBlocks = [];
platformCollisions2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 202) {
            platformCollisionBlocks.push(
                new CollisionBlock({
                    position: { x: x * 16, y: y * 16 },
                    width: 16,
                    height: 4,
                })
            );
        }
    });
});

// create enemies from platform map (tile value 222 = enemy spawn)
const enemyCollision2D = platformCollisions2D.length ? platformCollisions2D : [];
const enemies = [];
enemyCollision2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 222) {
            enemies.push(
                new Enemy({
                    position: { x: x * 16, y: y * 16 },
                    imageSrc: "./images/vertical-platform/Kunoichi/Idle.png",
                    frameRate: 9,
                    scale: 0.5,
                    collisionBlocks,
                    platformCollisionBlocks,
                    animations: {
                        Idle: { imageSrc: "./images/vertical-platform/Kunoichi/Idle.png", frameRate: 9, frameBuffer: 4 },
                        Walk: { imageSrc: "./images/vertical-platform/Kunoichi/Run.png", frameRate: 8, frameBuffer: 5 },
                        WalkLeft: { imageSrc: "./images/vertical-platform/Kunoichi/RunLeft.png", frameRate: 8, frameBuffer: 5 },
                        Death: { imageSrc: "./images/vertical-platform/Kunoichi/Death.png", frameRate: 6, frameBuffer: 6 },
                    },
                })
            );
        }
    });
});

// ---------------------- Player instance ----------------------
const player = new Player({
    position: { x: 100, y: 300 },
    collisionBlocks,
    platformCollisionBlocks,
    imageSrc: "./images/vertical-platform/warrior/Idle.png",
    frameRate: 8,
    scale: 0.5,
    animations: {
        Idle: { imageSrc: "./images/vertical-platform/warrior/Idle.png", frameRate: 8, frameBuffer: 3 },
        IdleLeft: { imageSrc: "./images/vertical-platform/warrior/IdleLeft.png", frameRate: 8, frameBuffer: 3 },
        Run: { imageSrc: "./images/vertical-platform/warrior/Run.png", frameRate: 8, frameBuffer: 5 },
        RunLeft: { imageSrc: "./images/vertical-platform/warrior/RunLeft.png", frameRate: 8, frameBuffer: 5 },
        Jump: { imageSrc: "./images/vertical-platform/warrior/Jump.png", frameRate: 2, frameBuffer: 3 },
        JumpLeft: { imageSrc: "./images/vertical-platform/warrior/JumpLeft.png", frameRate: 2, frameBuffer: 3 },
        Fall: { imageSrc: "./images/vertical-platform/warrior/Fall.png", frameRate: 2, frameBuffer: 3 },
        FallLeft: { imageSrc: "./images/vertical-platform/warrior/FallLeft.png", frameRate: 2, frameBuffer: 3 },
        Attack1: { imageSrc: "./images/vertical-platform/warrior/Attack_1.png", frameRate: 4, frameBuffer: 3 },
        Attack1_Left: { imageSrc: "./images/vertical-platform/warrior/Attack_1_Left.png", frameRate: 4, frameBuffer: 3 },
        Attack2: { imageSrc: "./images/vertical-platform/warrior/Attack_2.png", frameRate: 4, frameBuffer: 3 },
        Attack2_Left: { imageSrc: "./images/vertical-platform/warrior/Attack_2_Left.png", frameRate: 4, frameBuffer: 3 },
        Attack3: { imageSrc: "./images/vertical-platform/warrior/Attack_3.png", frameRate: 4, frameBuffer: 3 },
        Attack3_Left: { imageSrc: "./images/vertical-platform/warrior/Attack_3_Left.png", frameRate: 4, frameBuffer: 3 },
        Death: { imageSrc: "./images/vertical-platform/warrior/Death.png", frameRate: 6, frameBuffer: 8 },
    },
});

// ---------------------- Background sprite ----------------------
const background = new Sprite({
    position: { x: 0, y: 0 },
    imageSrc: "./images/vertical-platform/Background/background.png",
});

// handy constant for background height the original code used
const backgroundImageHeight = 432;

const camera = {
    position: { x: 0, y: -backgroundImageHeight + scaledCanvas.height },
};

// keys
const keys = {
    moveRight: { pressed: false },
    moveLeft: { pressed: false },
    attack1: { pressed: false },
    attack2: { pressed: false },
    attack3: { pressed: false },
};

// ---------------------- Drawing helpers ----------------------
function drawPlayerHealth() {
    // simple squares for now
    for (let i = 0; i < player.health; i++) {
        ctx.fillStyle = "red";
        ctx.fillRect(20 + i * 30, 20, 25, 25);
    }
}

function drawHealthBar(ctxLocal, x, y, width, height, currentHealth, maxHealth, color = "green") {
    ctxLocal.fillStyle = "red";
    ctxLocal.fillRect(x, y, width, height);
    const healthWidth = Math.max(0, (currentHealth / maxHealth) * width);
    ctxLocal.fillStyle = color;
    ctxLocal.fillRect(x, y, healthWidth, height);
    ctxLocal.strokeStyle = "black";
    ctxLocal.strokeRect(x, y, width, height);
}

// ---------------------- Reset game ----------------------
function resetGame() {
    player.health = player.maxHealth;
    player.position.x = 100;
    player.position.y = 300;
    player.velocity.x = 0;
    player.velocity.y = 0;
    player.switchSprite("Idle");
    // reset enemies that are present (placeholder repositioning)
    enemies.forEach((enemy) => {
        enemy.health = enemy.maxHealth;
        enemy.markedForDeletion = false;
        enemy.dead = false;
        // optional reposition: keep original tile-based spawn; for simplicity we do not change position here
        enemy.velocity.x = enemy.movingRight ? 1 : -1;
        enemy.velocity.y = 0;
    });
    gameOver = false;
}

// ---------------------- Input ----------------------
window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "d":
        case "D":
        case "ArrowRight":
            keys.moveRight.pressed = true;
            break;
        case "a":
        case "A":
        case "ArrowLeft":
            keys.moveLeft.pressed = true;
            break;
        case "w":
        case "W":
        case "ArrowUp":
            if (player.jumpsRemaining > 0) {
                player.velocity.y = -5;
                player.jumpsRemaining--;
            }
            break;
        case "f":
        case "F":
            keys.attack1.pressed = true;
            player.performAttack();
            break;
        case "q":
        case "Q":
            keys.attack2.pressed = true;
            player.performAttack();
            break;
        case " ":
            keys.attack3.pressed = true;
            player.performAttack();
            break;
        case "r":
        case "R":
            if (gameOver) resetGame();
            break;
    }
});

window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "d":
        case "D":
        case "ArrowRight":
            keys.moveRight.pressed = false;
            break;
        case "a":
        case "A":
        case "ArrowLeft":
            keys.moveLeft.pressed = false;
            break;
        case "f":
        case "F":
            keys.attack1.pressed = false;
            break;
        case "q":
        case "Q":
            keys.attack2.pressed = false;
            break;
        case " ":
            keys.attack3.pressed = false;
            break;
    }
});

// ---------------------- Main animate loop ----------------------
function animate() {
    animationId = window.requestAnimationFrame(animate);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw HUD healthbars for player and enemies (simple)
    drawPlayerHealth();
    enemies.forEach((en) => {
        // draw enemy health bar near its position (world coordinates transformed by camera)
        const screenX = (en.position.x + camera.position.x) * 4; // because we scale by 4 later
        const screenY = (en.position.y + camera.position.y) * 4;
        // small bar — keep it lightweight
        drawHealthBar(ctx, screenX / 4, screenY / 4 - 10, 40, 4, en.health, en.maxHealth, "yellow");
    });

    ctx.save();
    ctx.scale(4, 4);
    ctx.translate(camera.position.x, camera.position.y);

    // background
    if (background.loaded) background.update();

    // For debugging you can draw collision blocks/platforms
    // collisionBlocks.forEach(cb => cb.update());
    // platformCollisionBlocks.forEach(pb => pb.update());

    // Update enemies
    enemies.forEach((enemy) => enemy.update());

    // player collision and update
    player.checkForHorizontalCanvasCollision();
    player.update();

    // player movement & animation switching
    player.velocity.x = 0;
    if (keys.moveRight.pressed) {
        player.switchSprite("Run");
        player.velocity.x = 2;
        player.lastDirection = "right";
        player.shouldPanCameraToTheLeft({ canvas, camera });
    } else if (keys.moveLeft.pressed) {
        player.switchSprite("RunLeft");
        player.velocity.x = -2;
        player.lastDirection = "left";
        player.shouldPanCameraToTheRight({ canvas, camera });
    } else if (keys.attack1.pressed) {
        player.switchSprite(player.lastDirection === "right" ? "Attack1" : "Attack1_Left");
    } else if (keys.attack2.pressed) {
        player.switchSprite(player.lastDirection === "right" ? "Attack2" : "Attack2_Left");
    } else if (keys.attack3.pressed) {
        player.switchSprite(player.lastDirection === "right" ? "Attack3" : "Attack3_Left");
    } else if (player.velocity.y === 0) {
        player.switchSprite(player.lastDirection === "right" ? "Idle" : "IdleLeft");
    }

    if (player.velocity.y < 0) {
        player.shouldPanCameraDown({ canvas, camera });
        player.switchSprite(player.lastDirection === "right" ? "Jump" : "JumpLeft");
    } else if (player.velocity.y > 0) {
        player.shouldPanCameraUp({ canvas, camera });
        player.switchSprite(player.lastDirection === "right" ? "Fall" : "FallLeft");
    }

    // Interactions (player attacks enemies, enemies attack player)
    enemies.forEach((enemy) => {
        // player attack vs enemy
        if (player.attackBox.active && collision({ obj1: player.attackBox, obj2: enemy.hitbox })) {
            const direction = player.position.x < enemy.position.x ? "right" : "left";
            enemy.takeDamage(direction, 3);
        }

        // enemy attack vs player
        if (enemy.attackBox.active && collision({ obj1: enemy.attackBox, obj2: player.hitbox })) {
            const direction = enemy.position.x < player.position.x ? "right" : "left";
            player.takeDamage(direction, 5);
        }

        // collision touch
        if (collision({ obj1: player.hitbox, obj2: enemy.hitbox })) {
            // give player damage with brief invulnerability handled inside player.takeDamage
            player.takeDamage();
        }
    });

    // remove dead enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].markedForDeletion) enemies.splice(i, 1);
    }

    // draw game over overlay if needed
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.font = "24px Arial";
        ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 50);

        // don't continue normal updates while game over; you can still allow restart key
        ctx.restore();
        return;
    }

    ctx.restore();
}

// start animation
animate();
