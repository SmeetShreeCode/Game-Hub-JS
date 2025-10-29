/* -------------------- Config & Globals -------------------- */
let level = 1;
let gameOver = false;
let animationId = null;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

const scaledCanvas = {
    width: canvas.width / 4,
    height: canvas.height / 4,
};

const gravity = 0.2;

/* -------------------- Placeholder Tilemaps (safe defaults) -------------------- */
/* Replace these arrays with your real level arrays (1D arrays of numbers) */
const rowWidth = 36;
const rows = 27; // arbitrary so map isn't empty
const floorCollisions = new Array(rowWidth * rows).fill(0);
const platformCollisions = new Array(rowWidth * rows).fill(0);
const enemyTilemap = new Array(rowWidth * rows).fill(0);

// Put some ground at bottom row (symbol 202 denotes solid block)
for (let x = 0; x < rowWidth; x++) {
    floorCollisions[(rows - 2) * rowWidth + x] = 202;
}
// small platforms
platformCollisions[(rows - 6) * rowWidth + 5] = 202;
platformCollisions[(rows - 8) * rowWidth + 14] = 202;
platformCollisions[(rows - 10) * rowWidth + 22] = 202;

// put a couple of enemies in enemy tilemap (222)
enemyTilemap[(rows - 7) * rowWidth + 7] = 222;
enemyTilemap[(rows - 9) * rowWidth + 23] = 222;

/* -------------------- Utility classes -------------------- */
class CollisionBlock {
    constructor({ position, height = 16 }) {
        this.position = position;
        this.width = 16;
        this.height = height;
    }

    draw() {
        // debug draw -- comment out if you don't want visible blocks
        ctx.fillStyle = "rgba(255, 0, 0, 0.25)";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

/* -------------------- Sprite base -------------------- */
class Sprite {
    constructor({ position = { x: 0, y: 0 }, imageSrc = null, frameRate = 1, frameBuffer = 3, scale = 1 }) {
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
                this.width = (this.image.width / this.frameRate) * this.scale;
                this.height = this.image.height * this.scale;
                this.loaded = true;
            };
            // In case src invalid, we still want the game to continue; onerror we keep loaded=false
            this.image.onerror = () => {
                this.image = null;
                this.loaded = false;
            };
            this.image.src = imageSrc;
        }
    }

    draw() {
        if (!this.image || !this.loaded) {
            // fallback rectangle so game remains runnable without assets
            ctx.fillStyle = "gray";
            ctx.fillRect(this.position.x, this.position.y, 16 * this.scale, 16 * this.scale);
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
                    character = "player",
                    animations = {}
                }) {
        super({ position, imageSrc, frameRate, scale });
        this.velocity = { x: 0, y: 0 };
        this.collisionBlocks = collisionBlocks;
        this.platformCollisionBlocks = platformCollisionBlocks;

        this.position = position;
        // set sensible default width/height for fallback rects
        this.width = 16 * scale;
        this.height = 32 * scale;

        // hitbox relative to sprite position
        this.hitbox = {
            position: { x: this.position.x + 6, y: this.position.y + 8 },
            width: 12,
            height: 20,
        };

        this.character = character;
        this.animations = animations;
        this.lastDirection = "right";

        // preload animation images
        for (let key in this.animations) {
            const img = new Image();
            img.src = this.animations[key].imageSrc;
            this.animations[key].image = img;
            this.animations[key].image.onerror = () => {
                // ignore load error — fallback will draw rects
            };
        }

        this.camerabox = {
            position: { x: this.position.x - 50, y: this.position.y },
            width: 200,
            height: 80,
        };

        this.jumpsRemaining = 2;

        this.attackBox = {
            position: { x: this.position.x, y: this.position.y },
            width: 26,
            height: 18,
            offset: { right: 20, left: -20, y: 6 },
            active: false
        };

        this.attackCooldown = false;
        this.maxHealth = 5;
        this.health = this.maxHealth;
        this.isInvincible = false;
    }

    updateHitbox() {
        this.hitbox.position.x = this.position.x + 6;
        this.hitbox.position.y = this.position.y + 8;
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
        setTimeout(() => (this.attackBox.active = false), 140);
        setTimeout(() => (this.attackCooldown = false), 420);
    }

    switchSprite(key) {
        if (!this.animations[key]) return;
        const anim = this.animations[key];
        if (this.image === anim.image && this.loaded) return;
        this.currentFrame = 0;
        this.image = anim.image || this.image;
        this.frameBuffer = anim.frameBuffer ?? this.frameBuffer;
        this.frameRate = anim.frameRate ?? this.frameRate;
        this.loaded = this.image ? this.image.complete : false;
        if (this.image && !this.image.complete) {
            this.image.onload = () => (this.loaded = true);
        }
    }

    checkForHorizontalCanvasCollision() {
        const hb = this.hitbox;
        if (hb.position.x + hb.width + this.velocity.x >= 576 || hb.position.x + this.velocity.x <= 0) {
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

    applyGravity() {
        this.velocity.y += gravity;
        this.position.y += this.velocity.y;
    }

    checkForHorizontalCollisions() {
        for (let block of this.collisionBlocks) {
            if (collision({ obj1: this.hitbox, obj2: block })) {
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
        // solid blocks
        for (let block of this.collisionBlocks) {
            if (collision({ obj1: this.hitbox, obj2: block })) {
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
        // platforms (one-way)
        for (let platform of this.platformCollisionBlocks) {
            if (platformCollision({ obj1: this.hitbox, obj2: platform })) {
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
        setTimeout(() => (this.isInvincible = false), 600);
        if (this.health <= 0) this.die();
    }

    die() {
        console.log("GAME OVER");
        gameOver = true;
        if (animationId) cancelAnimationFrame(animationId);
    }

    updateCamerabox() {
        this.camerabox.position.x = this.position.x - 50;
        this.camerabox.position.y = this.position.y;
    }

    update() {
        this.updateFrames();
        this.updateHitbox();
        this.updateAttackBox();
        this.updateCamerabox();

        // debug draw attack box
        if (this.attackBox.active) {
            ctx.fillStyle = "rgba(255,255,0,0.4)";
            ctx.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }

        // draw player (sprite or fallback)
        this.draw();

        // movement: we already apply velocity externally (in loop) but keep collisions local
        this.position.x += this.velocity.x;
        this.updateHitbox();
        this.checkForHorizontalCollisions();

        this.applyGravity();
        this.updateHitbox();
        this.checkForVerticalCollisions();
    }
}

/* -------------------- Enemy -------------------- */
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
        super({ position, imageSrc, frameRate, scale });
        this.velocity = { x: 0.8, y: 0 };
        this.collisionBlocks = collisionBlocks;
        this.platformCollisionBlocks = platformCollisionBlocks;

        this.position = position;
        this.width = 16 * scale;
        this.height = 28 * scale;

        this.hitbox = {
            position: { x: this.position.x + 6, y: this.position.y + 8 },
            width: 12,
            height: 20
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
            position: { x: this.position.x, y: this.position.y },
            width: 18,
            height: 18,
            active: false
        };

        this.attackCooldown = 2000;
        this.lastAttack = 0;
        this.attackDamage = 1;
        this.telegraphing = false;
        this.isAttacking = false;
        this.detectionRange = 100;
        this.chaseSpeed = 1.2;

        // behavior flags
        this.flying = false;
        this.heavy = false;
        this.colorEffect = null;
    }

    updateHitbox() {
        this.hitbox.position.x = this.position.x + 6;
        this.hitbox.position.y = this.position.y + 8;
    }

    applyGravity() {
        this.velocity.y += gravity;
        this.position.y += this.velocity.y;
    }

    checkForHorizontalCollisions() {
        for (let block of this.collisionBlocks) {
            if (collision({ obj1: this.hitbox, obj2: block })) {
                this.velocity.x *= -1;
                this.movingRight = this.velocity.x > 0;
                this.lastDirection = this.movingRight ? "right" : "left";
                return;
            }
        }
    }

    checkForVerticalCollisions() {
        for (let block of this.collisionBlocks) {
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
    }

    telegraphAttack() {
        if (this.telegraphing || this.isAttacking) return;
        this.telegraphing = true;
        setTimeout(() => {
            this.telegraphing = false;
            this.attack();
        }, 350);
    }

    attack() {
        const now = Date.now();
        if (now - this.lastAttack < this.attackCooldown || this.dead) return;
        this.lastAttack = now;
        this.isAttacking = true;
        this.attackBox.active = true;
        this.attackBox.position.x = this.position.x + (this.movingRight ? this.hitbox.width : -this.attackBox.width);
        this.attackBox.position.y = this.position.y;
        setTimeout(() => {
            this.attackBox.active = false;
            this.isAttacking = false;
        }, 420);
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
    }

    chasePlayer(player) {
        const distanceX = player.position.x - this.position.x;
        const absDistance = Math.abs(distanceX);

        if (absDistance < this.detectionRange && !this.isAttacking && !this.telegraphing) {
            this.velocity.x = distanceX > 0 ? this.chaseSpeed : -this.chaseSpeed;
            this.movingRight = distanceX > 0;
            this.lastDirection = this.movingRight ? "right" : "left";
            // if very close, telegraph
            if (absDistance < 26 && Date.now() - this.lastAttack > this.attackCooldown) {
                this.telegraphAttack();
            }
        } else if (!this.isAttacking && !this.telegraphing) {
            this.patrol();
        }
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

        // simple color overlay effect for special enemies
        if (this.colorEffect) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = this.colorEffect;
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
            ctx.restore();
        }

        // slight flying bob
        if (this.flying) {
            this.position.y += Math.sin(Date.now() / 200 + this.position.x / 60) * 0.6;
        }

        this.draw();
    }
}

/* -------------------- Collision helpers -------------------- */
function collision({ obj1, obj2 }) {
    return (
        obj1.position.y + obj1.height >= obj2.position.y &&
        obj1.position.y <= obj2.position.y + obj2.height &&
        obj1.position.x <= obj2.position.x + obj2.width &&
        obj1.position.x + obj1.width >= obj2.position.x
    );
}

function platformCollision({ obj1, obj2 }) {
    // one-way platform collision (only when falling onto platform)
    return (
        obj1.position.y + obj1.height >= obj2.position.y &&
        obj1.position.y + obj1.height <= obj2.position.y + obj2.height &&
        obj1.position.x <= obj2.position.x + obj2.width &&
        obj1.position.x + obj1.width >= obj2.position.x
    );
}

/* -------------------- Build collision blocks from tile maps -------------------- */
const floorCollisions2D = [];
for (let i = 0; i < floorCollisions.length; i += rowWidth) {
    floorCollisions2D.push(floorCollisions.slice(i, i + rowWidth));
}
const collisionBlocks = [];
floorCollisions2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 202) {
            collisionBlocks.push(new CollisionBlock({
                position: { x: x * 16, y: y * 16 }
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
                position: { x: x * 16, y: y * 16 },
                height: 4
            }));
        }
    });
});

/* -------------------- Particles -------------------- */
const particles = [];
function spawnParticles(x, y, count = 10, color = "white") {
    for (let i = 0; i < count; i++) {
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * -3,
            alpha: 1,
            color,
            size: 1 + Math.random() * 3
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // small gravity for particles
        p.alpha -= 0.02;
        if (p.alpha <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

/* -------------------- Create enemies from tilemap -------------------- */
const enemyCollision2D = [];
for (let i = 0; i < enemyTilemap.length; i += rowWidth) {
    enemyCollision2D.push(enemyTilemap.slice(i, i + rowWidth));
}

let enemyCollisionBlock = [];
enemyCollision2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 222) {
            enemyCollisionBlock.push(new Enemy({
                position: { x: x * 16, y: y * 16 },
                imageSrc: null, // fill with asset path if available
                frameRate: 6,
                scale: 0.6,
                collisionBlocks,
                platformCollisionBlocks,
                animations: {
                    Idle: { imageSrc: "", frameRate: 6, frameBuffer: 4 },
                    Walk: { imageSrc: "", frameRate: 6, frameBuffer: 4 },
                    WalkLeft: { imageSrc: "", frameRate: 6, frameBuffer: 4 },
                    Attack: { imageSrc: "", frameRate: 6, frameBuffer: 4 },
                    AttackLeft: { imageSrc: "", frameRate: 6, frameBuffer: 4 },
                    Death: { imageSrc: "", frameRate: 6, frameBuffer: 5 }
                }
            }));
        }
    });
});

/* -------------------- Enemy factory (type-based) -------------------- */
function createEnemyByType(type, level, x, y) {
    const base = {
        imageSrc: null,
        animations: {},
        scale: 0.5,
        health: 5,
        speed: 1,
        damage: 1,
        detection: 120,
        flying: false,
        heavy: false,
        colorEffect: null
    };

    if (type === "Goblin") {
        base.scale = 0.45;
        base.animations = {
            Idle: { imageSrc: "", frameRate: 8, frameBuffer: 4 },
            Walk: { imageSrc: "", frameRate: 8, frameBuffer: 4 },
            WalkLeft: { imageSrc: "", frameRate: 8, frameBuffer: 4 },
            Attack: { imageSrc: "", frameRate: 6, frameBuffer: 4 },
            Death: { imageSrc: "", frameRate: 6, frameBuffer: 5 }
        };
        base.health = 5 + level;
        base.speed = 1.5 + level * 0.05;
        base.damage = 1 + Math.floor(level / 3);
        base.colorEffect = "rgba(0,255,0,0.25)";
    } else if (type === "Bat") {
        base.scale = 0.6;
        base.animations = {
            Idle: { imageSrc: "", frameRate: 6, frameBuffer: 4 },
            Fly: { imageSrc: "", frameRate: 6, frameBuffer: 4 },
            FlyLeft: { imageSrc: "", frameRate: 6, frameBuffer: 4 },
            Death: { imageSrc: "", frameRate: 6, frameBuffer: 5 }
        };
        base.health = 8 + level;
        base.speed = 2.0 + level * 0.05;
        base.damage = 2 + Math.floor(level / 4);
        base.detection = 180;
        base.flying = true;
        base.colorEffect = "rgba(120,50,255,0.18)";
    } else if (type === "Ogre") {
        base.scale = 1.0;
        base.animations = {
            Idle: { imageSrc: "", frameRate: 6, frameBuffer: 4 },
            Walk: { imageSrc: "", frameRate: 6, frameBuffer: 4 },
            WalkLeft: { imageSrc: "", frameRate: 6, frameBuffer: 4 },
            Attack: { imageSrc: "", frameRate: 6, frameBuffer: 3 },
            Death: { imageSrc: "", frameRate: 6, frameBuffer: 5 }
        };
        base.health = 30 + level * 3;
        base.speed = 1.2 + level * 0.03;
        base.damage = 5 + Math.floor(level / 2);
        base.detection = 200;
        base.heavy = true;
        base.colorEffect = "rgba(255,0,0,0.2)";
    }

    const enemy = new Enemy({
        position: { x, y },
        imageSrc: base.imageSrc,
        frameRate: base.animations?.Idle?.frameRate || 8,
        scale: base.scale,
        collisionBlocks,
        platformCollisionBlocks,
        animations: base.animations
    });

    enemy.maxHealth = base.health;
    enemy.health = base.health;
    enemy.chaseSpeed = base.speed;
    enemy.attackDamage = base.damage;
    enemy.detectionRange = base.detection;
    enemy.type = type;
    enemy.colorEffect = base.colorEffect;
    enemy.flying = base.flying;
    enemy.heavy = base.heavy;

    return enemy;
}

function spawnEnemiesForLevel(levelNum) {
    enemyCollisionBlock = []; // reset
    const monsterLevel = levelNum % 10 === 0;
    const enemyCount = monsterLevel ? 1 : Math.min(3 + levelNum, 8);

    let typePool;
    if (levelNum <= 5) typePool = ["Goblin"];
    else if (levelNum < 10) typePool = ["Goblin", "Bat"];
    else if (monsterLevel) typePool = ["Ogre"];
    else typePool = ["Goblin", "Bat"];

    for (let i = 0; i < enemyCount; i++) {
        const type = monsterLevel ? "Ogre" : typePool[Math.floor(Math.random() * typePool.length)];
        const x = 80 + i * 96;
        const y = 100;
        const e = createEnemyByType(type, levelNum, x, y);
        enemyCollisionBlock.push(e);
    }

    if (monsterLevel) {
        screenShake(900, 8);
        showLevelText(`⚔️ LEVEL ${levelNum} — OGRE BOSS ⚔️`);
        spawnParticles(200, 120, 40, "red");
    } else {
        showLevelText(`Level ${levelNum}`);
    }
}

/* -------------------- UI Helpers -------------------- */
function drawHealthBar(ctxRef, x, y, width, height, currentHealth, maxHealth, color = "green") {
    ctxRef.fillStyle = "red";
    ctxRef.fillRect(x, y - 6, width, height);
    const healthWidth = Math.max(0, (currentHealth / maxHealth) * width);
    ctxRef.fillStyle = color;
    ctxRef.fillRect(x, y - 6, healthWidth, height);
    ctxRef.strokeStyle = "black";
    ctxRef.strokeRect(x, y - 6, width, height);
}

let levelTextTimeout = null;
function showLevelText(text) {
    const x = canvas.width / 2;
    const y = 60;
    // draw overlay briefly by setting state and letting animate render it
    levelOverlay.text = text;
    if (levelTextTimeout) clearTimeout(levelTextTimeout);
    levelTextTimeout = setTimeout(() => (levelOverlay.text = ""), 2000);
}

const levelOverlay = { text: "" };

/* -------------------- Screen shake (basic) -------------------- */
let screenShakeOffset = { x: 0, y: 0 };
function screenShake(duration = 400, magnitude = 6) {
    const start = Date.now();
    function tick() {
        const elapsed = Date.now() - start;
        if (elapsed < duration) {
            const progress = elapsed / duration;
            const damper = 1 - progress;
            screenShakeOffset.x = (Math.random() * 2 - 1) * magnitude * damper;
            screenShakeOffset.y = (Math.random() * 2 - 1) * magnitude * damper;
            requestAnimationFrame(tick);
        } else {
            screenShakeOffset.x = 0;
            screenShakeOffset.y = 0;
        }
    }
    tick();
}

/* -------------------- Background & Camera -------------------- */
const background = new Sprite({
    position: { x: 0, y: 0 },
    imageSrc: null, // set path if you have a background image
    frameRate: 1,
    frameBuffer: 1,
    scale: 1
});
const backgroundImageHeight = 432;
const camera = {
    position: { x: 0, y: -backgroundImageHeight + scaledCanvas.height }
};

/* -------------------- Player instance -------------------- */
const player = new Player({
    position: { x: 10, y: 300 },
    collisionBlocks,
    platformCollisionBlocks,
    imageSrc: null, // set to "./images/vertical-platform/warrior/Idle.png" if you have it
    frameRate: 8,
    scale: 0.6,
    character: "warrior",
    animations: {
        Idle: { imageSrc: "", frameRate: 8, frameBuffer: 3 },
        IdleLeft: { imageSrc: "", frameRate: 8, frameBuffer: 3 },
        Run: { imageSrc: "", frameRate: 8, frameBuffer: 5 },
        RunLeft: { imageSrc: "", frameRate: 8, frameBuffer: 5 },
        Jump: { imageSrc: "", frameRate: 2, frameBuffer: 3 },
        JumpLeft: { imageSrc: "", frameRate: 2, frameBuffer: 3 },
        Fall: { imageSrc: "", frameRate: 2, frameBuffer: 3 },
        FallLeft: { imageSrc: "", frameRate: 2, frameBuffer: 3 },
        Attack1: { imageSrc: "", frameRate: 4, frameBuffer: 3 },
        Attack1_Left: { imageSrc: "", frameRate: 4, frameBuffer: 3 },
        Attack2: { imageSrc: "", frameRate: 4, frameBuffer: 3 },
        Attack2_Left: { imageSrc: "", frameRate: 4, frameBuffer: 3 },
        Attack3: { imageSrc: "", frameRate: 4, frameBuffer: 3 },
        Attack3_Left: { imageSrc: "", frameRate: 4, frameBuffer: 3 },
        Death: { imageSrc: "", frameRate: 6, frameBuffer: 8 }
    }
});

/* -------------------- Input handling -------------------- */
const keys = {
    moveRight: { pressed: false },
    moveLeft: { pressed: false },
    attack1: { pressed: false },
    attack2: { pressed: false },
    attack3: { pressed: false }
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
                player.velocity.y = -5.5;
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

/* -------------------- Reset game -------------------- */
function resetGame() {
    player.health = player.maxHealth;
    player.position.x = 10;
    player.position.y = 300;
    player.velocity.x = 0;
    player.velocity.y = 0;
    player.switchSprite("Idle");
    gameOver = false;
    spawnEnemiesForLevel(level);
    animate();
}

/* -------------------- Draw helpers -------------------- */
function drawEnemyAura(enemy) {
    let color = "rgba(0,0,0,0)";
    if (enemy.type === "Goblin") color = "rgba(0,255,0,0.22)";
    if (enemy.type === "Bat") color = "rgba(120,0,255,0.18)";
    if (enemy.type === "Ogre") color = "rgba(255,0,0,0.28)";

    const cx = enemy.position.x + (enemy.width || 16) / 2;
    const cy = enemy.position.y + (enemy.height || 16) / 2;
    const gradient = ctx.createRadialGradient(cx, cy, 8, cx, cy, 40);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = gradient;
    ctx.fillRect(enemy.position.x - 30, enemy.position.y - 30, (enemy.width || 16) + 60, (enemy.height || 16) + 60);
    ctx.restore();
}

/* -------------------- Main animate loop -------------------- */
function animate() {
    animationId = window.requestAnimationFrame(animate);

    // clear
    ctx.fillStyle = "#e8f5ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // camera transform and screen shake
    ctx.save();
    ctx.translate(screenShakeOffset.x, screenShakeOffset.y);
    ctx.scale(4, 4);
    ctx.translate(camera.position.x, camera.position.y);

    // background (simple fill or image if provided)
    if (background && background.loaded) background.update();
    else {
        ctx.fillStyle = "#b3e5fc";
        ctx.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
    }

    // draw collision blocks (debug)
    collisionBlocks.forEach((b) => b.draw());
    platformCollisionBlocks.forEach((b) => b.draw());

    // draw player health bar
    drawHealthBar(ctx, player.position.x, player.position.y - 4, 36, 4, player.health, player.maxHealth);

    // player checks & update
    player.checkForHorizontalCanvasCollision();
    player.update();

    // reset horizontal velocity then movement input
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

    // update & draw enemies
    enemyCollisionBlock.forEach((enemy) => {
        drawHealthBar(ctx, enemy.position.x, enemy.position.y - 6, 36, 4, enemy.health, enemy.maxHealth, "yellow");
        if (enemy.colorEffect) drawEnemyAura(enemy);
        enemy.update(player);

        // small bob for flying bats handled in update()

        // enemy auto-attack (attempts)
        enemy.attack();

        // enemy attack hits player
        if (enemy.attackBox.active && collision({ obj1: enemy.attackBox, obj2: player.hitbox })) {
            const direction = enemy.position.x < player.position.x ? "right" : "left";
            player.takeDamage(direction, enemy.attackDamage || 3);
        }

        // player attack hits enemy
        if (player.attackBox.active && collision({ obj1: player.attackBox, obj2: enemy.hitbox })) {
            const direction = player.position.x < enemy.position.x ? "right" : "left";
            enemy.takeDamage(direction, 3);
            spawnParticles(enemy.position.x + enemy.width / 2, enemy.position.y + enemy.height / 2, 6, "orange");
        }

        // contact damage
        if (collision({ obj1: player.hitbox, obj2: enemy.hitbox })) {
            player.takeDamage(enemy.position.x < player.position.x ? "left" : "right", 3);
        }
    });

    // remove dead enemies
    enemyCollisionBlock = enemyCollisionBlock.filter((e) => !e.markedForDeletion);

    // particles
    updateParticles();
    drawParticles();

    // camera restore
    ctx.restore();

    // overlay: level text
    if (levelOverlay.text) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.font = "22px Arial";
        ctx.textAlign = "center";
        ctx.fillText(levelOverlay.text, canvas.width / 2, 60);
    }

    // draw game over
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
spawnEnemiesForLevel(level);
animate();

/* -------------------- Expose some functions to console for debug -------------------- */
window.spawnParticles = spawnParticles;
window.spawnEnemiesForLevel = spawnEnemiesForLevel;
window.resetGame = resetGame;
window.setLevel = (n) => {
    level = n;
    spawnEnemiesForLevel(level);
};
