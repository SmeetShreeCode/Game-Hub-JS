// cleaned vertical-platform game script (single-file)
// Requires: <canvas> element in DOM, arrays floorCollisions and platformCollisions (1D arrays),
// and the same image asset paths used previously.

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let animationId = null;
let gameOver = false;

canvas.width = innerWidth;
canvas.height = innerHeight;

const scaledCanvas = {
    width: canvas.width / 4,
    height: canvas.height / 4,
};

const gravity = 0.2;

/* -------------------- Utility classes -------------------- */
class CollisionBlock {
    constructor({position, height = 16}) {
        this.position = position;
        this.width = 16;
        this.height = height;
    }

    draw() {
        // debug draw (can be commented out in production)
        ctx.fillStyle = "rgba(255, 0, 0, 0.35)";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
    }
}

class Sprite {
    constructor({position = {x: 0, y: 0}, imageSrc = null, frameRate = 1, frameBuffer = 3, scale = 1}) {
        this.position = position;
        this.scale = scale;
        this.loaded = false;
        this.image = null;
        this.frameRate = frameRate;
        this.currentFrame = 0;
        this.frameBuffer = frameBuffer;
        this.elapsedFrame = 0;
        this.width = 0;
        this.height = 0;

        if (imageSrc) {
            this.image = new Image();
            this.image.onload = () => {
                // assume horizontal sprite sheet with frameRate columns
                this.width = (this.image.width / this.frameRate) * this.scale;
                this.height = this.image.height * this.scale;
                this.loaded = true;
            };
            this.image.src = imageSrc;
        }
    }

    draw() {
        if (!this.image || !this.loaded) return;

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
            (frameWidth) * this.scale,
            this.image.height * this.scale
        );
    }

    updateFrames() {
        this.elapsedFrame++;
        if (this.elapsedFrame % this.frameBuffer === 0) {
            if (this.currentFrame < this.frameRate - 1) this.currentFrame++;
            else this.currentFrame = 0;
        }
    }

    update() {
        this.draw();
        this.updateFrames();
    }
}

/* -------------------- Player -------------------- */
class Player extends Sprite {
    constructor({
                    position,
                    collisionBlocks = [],
                    platformCollisionBlocks = [],
                    imageSrc,
                    frameRate = 1,
                    scale = 0.5,
                    animations = {}
                }) {
        super({position, imageSrc, frameRate, scale});
        this.velocity = {x: 0, y: 1};
        this.collisionBlocks = collisionBlocks;
        this.platformCollisionBlocks = platformCollisionBlocks;

        // hitbox relative to sprite
        this.hitbox = {
            position: {x: position.x + 35, y: position.y + 26},
            width: 14,
            height: 27,
        };

        this.animations = animations;
        this.lastDirection = "right";

        // preload animation images into animation objects
        for (let key in this.animations) {
            const img = new Image();
            img.src = this.animations[key].imageSrc;
            this.animations[key].image = img;
        }

        this.camerabox = {
            position: {x: this.position.x - 50, y: this.position.y},
            width: 200,
            height: 80,
        };

        this.jumpsRemaining = 2;

        this.attackBox = {
            position: {x: this.position.x, y: this.position.y},
            width: 30,
            height: 20,
            offset: {right: 25, left: -35, y: 20},
            active: false,
        };

        this.attackCooldown = false;
        this.maxHealth = 5;
        this.health = this.maxHealth;
        this.isInvincible = false;
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
        this.attackBox.position.x = (this.lastDirection === "right")
            ? this.hitbox.position.x + this.attackBox.offset.right
            : this.hitbox.position.x + this.attackBox.offset.left;
        this.attackBox.position.y = this.hitbox.position.y + this.attackBox.offset.y;
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
        if (this.image === this.animations[key].image && this.loaded) return;
        this.currentFrame = 0;
        this.image = this.animations[key].image;
        this.frameBuffer = this.animations[key].frameBuffer;
        this.frameRate = this.animations[key].frameRate;
        // ensure loaded flag for display
        // If the animation image hasn't loaded yet, set loaded when it does
        if (!this.image.complete) {
            this.image.onload = () => {
                this.loaded = true;
            };
        } else {
            this.loaded = true;
        }
    }

    checkForHorizontalCanvasCollision() {
        if (this.hitbox.position.x + this.hitbox.width + this.velocity.x >= 576 ||
            this.hitbox.position.x + this.velocity.x <= 0) {
            this.velocity.x = 0;
        }
    }

    shouldPanCameraToTheLeft({canvas, camera}) {
        const cameraboxRightSide = this.camerabox.position.x + this.camerabox.width;
        const scaledDownCanvasWidth = canvas.width / 4;

        if (cameraboxRightSide >= 576) return;
        if (cameraboxRightSide >= scaledDownCanvasWidth + Math.abs(camera.position.x)) {
            camera.position.x -= this.velocity.x;
        }
    }

    shouldPanCameraToTheRight({canvas, camera}) {
        if (this.camerabox.position.x <= 0) return;
        if (this.camerabox.position.x <= Math.abs(camera.position.x)) {
            camera.position.x -= this.velocity.x;
        }
    }

    shouldPanCameraDown({canvas, camera}) {
        if (this.camerabox.position.y + this.velocity.y <= 0) return;
        if (this.camerabox.position.y <= Math.abs(camera.position.y)) {
            camera.position.y -= this.velocity.y;
        }
    }

    shouldPanCameraUp({canvas, camera}) {
        if (this.camerabox.position.y + this.camerabox.height + this.velocity.y >= 432) return;
        const scaledCanvasHeight = canvas.height / 4;
        if (this.camerabox.position.y + this.camerabox.height >= Math.abs(camera.position.y) + scaledCanvasHeight) {
            camera.position.y -= this.velocity.y;
        }
    }

    applyGravity() {
        this.velocity.y += gravity;
        this.position.y += this.velocity.y;
    }

    checkForHorizontalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const block = this.collisionBlocks[i];
            if (collision({obj1: this.hitbox, obj2: block})) {
                if (this.velocity.x > 0) {
                    this.velocity.x = 0;
                    const offset = this.hitbox.position.x - this.position.x + this.hitbox.width;
                    this.position.x = block.position.x - offset - 0.01;
                    break;
                }
                if (this.velocity.x < 0) {
                    this.velocity.x = 0;
                    const offset = this.hitbox.position.x - this.position.x;
                    this.position.x = block.position.x + block.width - offset + 0.01;
                    break;
                }
            }
        }
    }

    checkForVerticalCollisions() {
        // solid collision blocks
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const block = this.collisionBlocks[i];
            if (collision({obj1: this.hitbox, obj2: block})) {
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;
                    this.position.y = block.position.y - offset - 0.01;
                    this.jumpsRemaining = 2;
                    break;
                }
                if (this.velocity.y < 0) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y;
                    this.position.y = block.position.y + block.height - offset + 0.01;
                    break;
                }
            }
        }

        // platform (one-way) collisions (only when falling)
        for (let i = 0; i < this.platformCollisionBlocks.length; i++) {
            const platform = this.platformCollisionBlocks[i];
            if (platformCollision({obj1: this.hitbox, obj2: platform})) {
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;
                    this.position.y = platform.position.y - offset - 0.01;
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
            this.die();
        }
    }

    die() {
        console.log("GAME OVER");
        gameOver = true;
        if (animationId) cancelAnimationFrame(animationId);
        // optionally trigger death animation and UI
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

        // draw the sprite
        this.draw();

        // movement & collisions
        this.position.x += this.velocity.x;
        this.updateHitbox();
        this.checkForHorizontalCollisions();

        this.applyGravity();
        this.updateHitbox();
        this.checkForVerticalCollisions();
    }

    updateCamerabox() {
        this.camerabox.position.x = this.position.x - 50;
        this.camerabox.position.y = this.position.y;
    }
}

/* -------------------- Enemy -------------------- */

/* -------------------- Enemy (Improved AI + Telegraph Attack) -------------------- */
class Enemy extends Sprite {
    constructor({
                    position,
                    collisionBlocks = [],
                    platformCollisionBlocks = [],
                    imageSrc,
                    frameRate = 1,
                    scale = 0.5,
                    animations = {}
                }) {
        super({position, imageSrc, frameRate, scale});
        this.velocity = {x: 1, y: 1};
        this.collisionBlocks = collisionBlocks;
        this.platformCollisionBlocks = platformCollisionBlocks;

        this.position = position;
        this.hitbox = {
            position: {x: position.x + 35, y: position.y + 26},
            width: 14,
            height: 27,
        };

        this.animations = animations;
        for (let key in this.animations) {
            const img = new Image();
            img.src = this.animations[key].imageSrc;
            this.animations[key].image = img;
        }

        this.movingRight = true;
        this.lastDirection = "right";

        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.dead = false;
        this.markedForDeletion = false;

        this.attackBox = {
            position: {x: this.position.x, y: this.position.y},
            width: 20,
            height: 20,
            active: false,
        };

        this.attackCooldown = 2500;
        this.lastAttack = 0;
        this.attackDamage = 1;
        this.telegraphing = false;
        this.isAttacking = false;
        this.detectionRange = 100; // how far enemy sees player
        this.chaseSpeed = 1.2;
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
            if (collision({obj1: this.hitbox, obj2: block})) {
                this.velocity.x *= -1;
                this.movingRight = this.velocity.x > 0;
                this.lastDirection = this.movingRight ? "right" : "left";
                return;
            }
        }
    }

    checkForVerticalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const block = this.collisionBlocks[i];
            if (collision({obj1: this.hitbox, obj2: block})) {
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
        this.position.x += this.velocity.x;
        const frontX = this.movingRight
            ? this.hitbox.position.x + this.hitbox.width + 1
            : this.hitbox.position.x - 1;
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
            this.lastDirection = this.movingRight ? "right" : "left";
        }

        if (!this.isAttacking && !this.telegraphing) {
            this.switchSprite(this.movingRight ? "Walk" : "WalkLeft");
        }
    }

    telegraphAttack() {
        this.telegraphing = true;
        this.switchSprite(this.movingRight ? "Telegraph" : "TelegraphLeft");
        setTimeout(() => {
            this.telegraphing = false;
            this.attack();
        }, 400); // telegraph delay (player can dodge)
    }

    attack() {
        const now = Date.now();
        if (now - this.lastAttack < this.attackCooldown || this.dead) return;

        this.lastAttack = now;
        this.isAttacking = true;
        this.switchSprite(this.movingRight ? "Attack" : "AttackLeft");

        this.attackBox.active = true;
        this.attackBox.position.x = this.position.x + (this.movingRight ? this.hitbox.width : -this.attackBox.width);
        this.attackBox.position.y = this.position.y;

        setTimeout(() => {
            this.attackBox.active = false;
            this.isAttacking = false;
        }, 500);
    }

    takeDamage(direction = "right", knockback = 3) {
        if (this.dead) return;
        this.health--;
        this.velocity.x = direction === "left" ? -knockback : knockback;
        this.velocity.y = -knockback / 2;
        if (this.health <= 0) this.die();
    }

    die() {
        this.dead = true;
        this.markedForDeletion = true;
        if (this.animations && this.animations.Death) {
            this.switchSprite("Death");
        }
    }

    chasePlayer(player) {
        const distanceX = player.position.x - this.position.x;
        const absDistance = Math.abs(distanceX);

        if (absDistance < this.detectionRange && !this.isAttacking && !this.telegraphing) {
            // move toward player
            this.velocity.x = distanceX > 0 ? this.chaseSpeed : -this.chaseSpeed;
            this.movingRight = distanceX > 0;
            this.lastDirection = this.movingRight ? "right" : "left";
            this.switchSprite(this.movingRight ? "Walk" : "WalkLeft");

            // if close enough → telegraph attack
            if (absDistance < 25 && Date.now() - this.lastAttack > this.attackCooldown) {
                this.telegraphAttack();
            }
        } else if (!this.isAttacking && !this.telegraphing) {
            this.patrol();
        }
    }

    switchSprite(key) {
        if (!this.animations[key]) return;
        if (this.image === this.animations[key].image && this.loaded) return;
        this.currentFrame = 0;
        this.image = this.animations[key].image;
        this.frameBuffer = this.animations[key].frameBuffer;
        this.frameRate = this.animations[key].frameRate;
        this.loaded = this.image.complete;
    }

    update(player) {
        if (this.markedForDeletion) return;
        this.updateFrames();
        this.updateHitbox();
        this.applyGravity();
        this.position.x += this.velocity.x;
        this.updateHitbox();
        this.checkForHorizontalCollisions();
        this.checkForVerticalCollisions();
        this.chasePlayer(player);

        // debug draw attack box
        if (this.attackBox.active) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.25)";
            ctx.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }

        this.draw();
    }
}

/* -------------------- Collision helpers -------------------- */
function collision({obj1, obj2}) {
    return (
        obj1.position.y + obj1.height >= obj2.position.y &&
        obj1.position.y <= obj2.position.y + obj2.height &&
        obj1.position.x <= obj2.position.x + obj2.width &&
        obj1.position.x + obj1.width >= obj2.position.x
    );
}

function platformCollision({obj1, obj2}) {
    // one-way platform collision: only when object is falling onto the platform
    return (
        obj1.position.y + obj1.height >= obj2.position.y &&
        obj1.position.y + obj1.height <= obj2.position.y + obj2.height &&
        obj1.position.x <= obj2.position.x + obj2.width &&
        obj1.position.x + obj1.width >= obj2.position.x
    );
}

/* -------------------- Build collision blocks from tile maps -------------------- */
// convert 1D arrays into 2D rows of width 36 (like original)
const rowWidth = 36;

const floorCollisions2D = [];
for (let i = 0; i < floorCollisions.length; i += rowWidth) {
    floorCollisions2D.push(floorCollisions.slice(i, i + rowWidth));
}

const collisionBlocks = [];
floorCollisions2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 202) {
            collisionBlocks.push(new CollisionBlock({
                position: {x: x * 16, y: y * 16},
            }));
        }
    });
});

const platformCollisions2D = [];
for (let i = 0; i < platformCollisions.length; i += rowWidth) {
    platformCollisions2D.push(platformCollisions.slice(i, i + rowWidth));
}

const platformCollisionBlocks = [];
platformCollisions2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 202) {
            platformCollisionBlocks.push(new CollisionBlock({
                position: {x: x * 16, y: y * 16},
                height: 4,
            }));
        }
    });
});

/* -------------------- Create enemies from tiles -------------------- */
const enemyCollision2D = [];
for (let i = 0; i < platformCollisions.length; i += rowWidth) {
    enemyCollision2D.push(platformCollisions.slice(i, i + rowWidth));
}

let enemyCollisionBlock = []; // mutable list of enemies
enemyCollision2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 222) {
            enemyCollisionBlock.push(new Enemy({
                position: {x: x * 16, y: y * 16},
                imageSrc: "./images/vertical-platform/Kunoichi/Idle.png",
                frameRate: 9,
                scale: 0.5,
                collisionBlocks,
                platformCollisionBlocks,
                animations: {
                    Idle: {imageSrc: "./images/vertical-platform/Kunoichi/Idle.png", frameRate: 9, frameBuffer: 4},
                    Walk: {imageSrc: "./images/vertical-platform/Kunoichi/Run.png", frameRate: 8, frameBuffer: 5},
                    WalkLeft: {
                        imageSrc: "./images/vertical-platform/Kunoichi/RunLeft.png",
                        frameRate: 8,
                        frameBuffer: 5
                    },
                    Telegraph: {imageSrc: "./images/vertical-platform/Kunoichi/Hurt.png", frameRate: 2, frameBuffer: 4},
                    TelegraphLeft: {
                        imageSrc: "./images/vertical-platform/Kunoichi/Eating.png",
                        frameRate: 9,
                        frameBuffer: 4
                    },
                    Attack: {
                        imageSrc: "./images/vertical-platform/Kunoichi/Attack_1.png",
                        frameRate: 6,
                        frameBuffer: 4
                    },
                    AttackLeft: {
                        imageSrc: "./images/vertical-platform/Kunoichi/AttackLeft_1.png",
                        frameRate: 6,
                        frameBuffer: 4
                    },
                    Death: {imageSrc: "./images/vertical-platform/Kunoichi/Death.png", frameRate: 5, frameBuffer: 6},
                }
            }));
        }
    });
});

/* -------------------- Player instance -------------------- */
const player = new Player({
    position: {x: 10, y: 300},
    collisionBlocks,
    platformCollisionBlocks,
    imageSrc: "./images/vertical-platform/warrior/Idle.png",
    frameRate: 8,
    scale: 0.5,
    animations: {
        Idle: {imageSrc: "./images/vertical-platform/warrior/Idle.png", frameRate: 8, frameBuffer: 3},
        IdleLeft: {imageSrc: "./images/vertical-platform/warrior/IdleLeft.png", frameRate: 8, frameBuffer: 3},
        Run: {imageSrc: "./images/vertical-platform/warrior/Run.png", frameRate: 8, frameBuffer: 5},
        RunLeft: {imageSrc: "./images/vertical-platform/warrior/RunLeft.png", frameRate: 8, frameBuffer: 5},
        Jump: {imageSrc: "./images/vertical-platform/warrior/Jump.png", frameRate: 2, frameBuffer: 3},
        JumpLeft: {imageSrc: "./images/vertical-platform/warrior/JumpLeft.png", frameRate: 2, frameBuffer: 3},
        Fall: {imageSrc: "./images/vertical-platform/warrior/Fall.png", frameRate: 2, frameBuffer: 3},
        FallLeft: {imageSrc: "./images/vertical-platform/warrior/FallLeft.png", frameRate: 2, frameBuffer: 3},
        Attack1: {imageSrc: "./images/vertical-platform/warrior/Attack_1.png", frameRate: 4, frameBuffer: 3},
        Attack1_Left: {imageSrc: "./images/vertical-platform/warrior/Attack_1_Left.png", frameRate: 4, frameBuffer: 3},
        Attack2: {imageSrc: "./images/vertical-platform/warrior/Attack_2.png", frameRate: 4, frameBuffer: 3},
        Attack2_Left: {imageSrc: "./images/vertical-platform/warrior/Attack_2_Left.png", frameRate: 4, frameBuffer: 3},
        Attack3: {imageSrc: "./images/vertical-platform/warrior/Attack_3.png", frameRate: 4, frameBuffer: 3},
        Attack3_Left: {imageSrc: "./images/vertical-platform/warrior/Attack_3_Left.png", frameRate: 4, frameBuffer: 3},
        Death: {imageSrc: "./images/vertical-platform/warrior/Death.png", frameRate: 6, frameBuffer: 8},
    },
});

/* -------------------- Background & Camera -------------------- */
const background = new Sprite({
    position: {x: 0, y: 0},
    imageSrc: "./images/vertical-platform/Background/background.png",
    frameRate: 1,
    frameBuffer: 1,
    scale: 1,
});

// background image height used earlier (kept same)
const backgroundImageHeight = 432;
const camera = {
    position: {x: 0, y: -backgroundImageHeight + scaledCanvas.height},
};

/* -------------------- Helpers: Health & UI -------------------- */
function drawPlayerHealth() {
    // small squares at top-left
    ctx.fillStyle = "red";
    for (let i = 0; i < player.health; i++) {
        ctx.fillRect(20 + i * 30, 20, 25, 25);
    }
}

function drawHealthBar(ctxRef, x, y, width, height, currentHealth, maxHealth, color = "green") {
    ctxRef.fillStyle = "red";
    ctxRef.fillRect(x, y, width, height);
    const healthWidth = Math.max(0, (currentHealth / maxHealth) * width);
    ctxRef.fillStyle = color;
    ctxRef.fillRect(x, y, healthWidth, height);
    ctxRef.strokeStyle = "black";
    ctxRef.strokeRect(x, y, width, height);
}

/* -------------------- Input handling -------------------- */
const keys = {
    moveRight: {pressed: false},
    moveLeft: {pressed: false},
    attack1: {pressed: false},
    attack2: {pressed: false},
    attack3: {pressed: false},
};

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

/* -------------------- Game reset -------------------- */
function resetGame() {
    player.health = player.maxHealth;
    player.position.x = 10;
    player.position.y = 300;
    player.velocity.x = 0;
    player.velocity.y = 0;
    player.switchSprite("Idle");
    gameOver = false;

    // Respawn enemies (simple approach: reset health & position if they were created from tilemap)
    enemyCollisionBlock.forEach((enemy) => {
        enemy.health = enemy.maxHealth;
        enemy.markedForDeletion = false;
        enemy.dead = false;
        // do not randomize positions here — keep initial tile positions, or re-create if you prefer
    });

    // restart loop
    animate();
}

/* -------------------- Main animate loop -------------------- */
function animate() {
    animationId = window.requestAnimationFrame(animate);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);



    // camera transform & scale
    ctx.save();
    ctx.scale(4, 4);
    ctx.translate(camera.position.x, camera.position.y);

    // background
    background.update();
    // draw health bars of player & enemies (example uses object positions)
    drawPlayerHealth();
    enemyCollisionBlock.forEach((enemy, idx) => {
        // draw enemy health bar above enemy
        drawHealthBar(ctx, enemy.position.x, enemy.position.y, 40, 4, enemy.health, enemy.maxHealth, "yellow");
    });
    drawHealthBar(ctx, player.position.x, player.position.y, 40, 4, player.health, player.maxHealth);

    // update collision blocks for debug if needed
    // collisionBlocks.forEach(b => b.update());
    // platformCollisionBlocks.forEach(b => b.update());

    // player utility checks
    player.checkForHorizontalCanvasCollision();
    player.update();

    // reset horizontal velocity then apply movement input
    player.velocity.x = 0;
    if (keys.moveRight.pressed) {
        player.switchSprite("Run");
        player.velocity.x = 2;
        player.lastDirection = "right";
        player.shouldPanCameraToTheLeft({canvas, camera});
    } else if (keys.moveLeft.pressed) {
        player.switchSprite("RunLeft");
        player.velocity.x = -2;
        player.lastDirection = "left";
        player.shouldPanCameraToTheRight({canvas, camera});
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
        player.shouldPanCameraDown({canvas, camera});
        player.switchSprite(player.lastDirection === "right" ? "Jump" : "JumpLeft");
    } else if (player.velocity.y > 0) {
        player.shouldPanCameraUp({canvas, camera});
        player.switchSprite(player.lastDirection === "right" ? "Fall" : "FallLeft");
    }

    // Update enemies & handle interactions
    enemyCollisionBlock.forEach((enemy) => {
        enemy.update(player);


        // enemy tries to attack periodically
        enemy.attack();

        // enemy attack harming player
        if (enemy.attackBox.active && collision({obj1: enemy.attackBox, obj2: player.hitbox})) {
            // decide direction based on relative positions
            const direction = enemy.position.x < player.position.x ? "right" : "left";
            player.takeDamage(direction, 5);
        }

        // player attacking enemy
        if (player.attackBox.active && collision({obj1: player.attackBox, obj2: enemy.hitbox})) {
            const direction = player.position.x < enemy.position.x ? "right" : "left";
            enemy.takeDamage(direction, 3);
        }

        // enemy touching player → damage player
        if (collision({obj1: player.hitbox, obj2: enemy.hitbox})) {
            player.takeDamage(enemy.position.x < player.position.x ? "left" : "right", 3);
        }
    });

    // remove killed enemies
    enemyCollisionBlock = enemyCollisionBlock.filter((enemy) => !enemy.markedForDeletion);

    ctx.restore(); // restore camera transform

    // draw game over overlay
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#fff";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);

        ctx.font = "24px Arial";
        ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 20);

        cancelAnimationFrame(animationId);
    }
}

/* -------------------- Start game -------------------- */
animate();
