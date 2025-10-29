let level= 1;
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
                    character,
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

        this.character = character;
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
        if (this.colorEffect) {
            ctx.save();
            ctx.globalCompositeOperation = "overlay";
            ctx.fillStyle = this.colorEffect;
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
            ctx.restore();
        }
        // Flying Bat moves in sine pattern
        if (this.flying) {
            this.position.y += Math.sin(Date.now() / 200 + this.position.x / 50) * 0.8;
        }

// Ogre stomp impact
        if (this.heavy && this.velocity.y > 5 && this.onGround) {
            screenShake(500, 8);
            spawnParticles(this.position.x + this.width / 2, this.position.y + this.height, 30, "brown");
        }

        if (this.heavy && this.isAttacking && Math.random() < 0.1) {
            screenShake(400, 6);
            spawnParticles(this.position.x, this.position.y + this.height, 20, "orange");
        }

        this.draw();
    }
}

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
            size: 2 + Math.random() * 2,
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
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

function createEnemyByType(type, level, x, y) {
    let enemyData = {
        imageSrc: "",
        animations: {},
        scale: 0.5,
        health: 5,
        speed: 1,
        damage: 1,
        detection: 120,
    };

    if (type === "Goblin") {
        enemyData.imageSrc = "./images/vertical-platform/Goblin/Idle.png";
        enemyData.animations = {
            Idle: { imageSrc: "./images/vertical-platform/Goblin/Idle.png", frameRate: 8, frameBuffer: 4 },
            Walk: { imageSrc: "./images/vertical-platform/Goblin/Run.png", frameRate: 8, frameBuffer: 4 },
            WalkLeft: { imageSrc: "./images/vertical-platform/Goblin/RunLeft.png", frameRate: 8, frameBuffer: 4 },
            Attack: { imageSrc: "./images/vertical-platform/Goblin/Attack.png", frameRate: 6, frameBuffer: 4 },
            AttackLeft: { imageSrc: "./images/vertical-platform/Goblin/AttackLeft.png", frameRate: 6, frameBuffer: 4 },
            Death: { imageSrc: "./images/vertical-platform/Goblin/Death.png", frameRate: 6, frameBuffer: 5 },
        };
        enemyData.scale = 0.45;
        enemyData.health = 5 + level;
        enemyData.speed = 1.5 + level * 0.05;
        enemyData.damage = 1 + Math.floor(level / 3);
    }

    if (type === "Bat") {
        enemyData.imageSrc = "./images/vertical-platform/Bat/Idle.png";
        enemyData.animations = {
            Idle: { imageSrc: "./images/vertical-platform/Bat/Idle.png", frameRate: 6, frameBuffer: 5 },
            Fly: { imageSrc: "./images/vertical-platform/Bat/Fly.png", frameRate: 6, frameBuffer: 4 },
            FlyLeft: { imageSrc: "./images/vertical-platform/Bat/FlyLeft.png", frameRate: 6, frameBuffer: 4 },
            Death: { imageSrc: "./images/vertical-platform/Bat/Death.png", frameRate: 6, frameBuffer: 5 },
        };
        enemyData.scale = 0.6;
        enemyData.health = 8 + level;
        enemyData.speed = 2.0 + level * 0.05;
        enemyData.damage = 2 + Math.floor(level / 4);
        enemyData.detection = 180;
    }

    if (type === "Ogre") {
        enemyData.imageSrc = "./images/vertical-platform/Ogre/Idle.png";
        enemyData.animations = {
            Idle: { imageSrc: "./images/vertical-platform/Ogre/Idle.png", frameRate: 6, frameBuffer: 5 },
            Walk: { imageSrc: "./images/vertical-platform/Ogre/Walk.png", frameRate: 6, frameBuffer: 4 },
            WalkLeft: { imageSrc: "./images/vertical-platform/Ogre/WalkLeft.png", frameRate: 6, frameBuffer: 4 },
            Attack: { imageSrc: "./images/vertical-platform/Ogre/Attack.png", frameRate: 6, frameBuffer: 3 },
            AttackLeft: { imageSrc: "./images/vertical-platform/Ogre/AttackLeft.png", frameRate: 6, frameBuffer: 3 },
            Death: { imageSrc: "./images/vertical-platform/Ogre/Death.png", frameRate: 6, frameBuffer: 5 },
        };
        enemyData.scale = 1.0;
        enemyData.health = 30 + level * 3;
        enemyData.speed = 1.2 + level * 0.03;
        enemyData.damage = 5 + Math.floor(level / 2);
        enemyData.detection = 200;
    }

    const enemy = new Enemy({
        position: { x, y },
        imageSrc: enemyData.imageSrc,
        frameRate: 8,
        scale: enemyData.scale,
        collisionBlocks,
        platformCollisionBlocks,
        animations: enemyData.animations,
    });

    enemy.maxHealth = enemyData.health;
    enemy.health = enemyData.health;
    enemy.chaseSpeed = enemyData.speed;
    enemy.attackDamage = enemyData.damage;
    enemy.detectionRange = enemyData.detection;
    enemy.type = type;

    return enemy;
}

function spawnEnemiesForLevel(level) {
    enemyCollisionBlock = [];

    const monsterLevel = level % 10 === 0;
    const enemyCount = monsterLevel ? 1 : Math.min(3 + level, 10);
    enemiesRemaining = enemyCount;

    let typePool = [];
    if (level <= 5) typePool = ["Goblin"];
    else if (level < 10) typePool = ["Goblin", "Bat"];
    else if (monsterLevel) typePool = ["Ogre"];
    else typePool = ["Goblin", "Bat"];

    for (let i = 0; i < enemyCount; i++) {
        const type = monsterLevel ? "Ogre" : typePool[Math.floor(Math.random() * typePool.length)];
        const x = 100 + i * 80;
        const y = 100;
        const enemy = createEnemyByType(type, level, x, y);
        enemyCollisionBlock.push(enemy);
    }

    if (monsterLevel) {
        // Monster spawn effects
        screenShake(1000, 10);
        showLevelText(`⚔️ LEVEL ${level} — OGRE BOSS ⚔️`);
        // new Audio('./sounds/monster_roar.mp3').play();
    } else {
        showLevelText(level);
    }
}

const ENEMY_TYPES = [
    {
        name: "Goblin",
        folder: "./images/enemies/Goblin",
        scale: 0.5,
        baseHealth: 3,
        baseDamage: 1,
        speed: 1.2,
        colorEffect: "rgba(0,255,0,0.3)",
    },
    {
        name: "Bat",
        folder: "./images/enemies/Bat",
        scale: 0.4,
        baseHealth: 2,
        baseDamage: 1,
        speed: 1.6,
        colorEffect: "rgba(150,0,255,0.3)",
        flying: true,
    },
    {
        name: "Ogre",
        folder: "./images/enemies/Ogre",
        scale: 0.9,
        baseHealth: 10,
        baseDamage: 3,
        speed: 0.8,
        colorEffect: "rgba(255,0,0,0.3)",
        heavy: true,
    },
];

const enemyType = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
const isMonster = level % 10 === 0 && i === 0;

const spriteFolder = enemyType.folder;
const scale = enemyType.scale;

// const enemy = new Enemy({
//     position: { x: 100 * 80, y: 100 },
//     imageSrc: `${spriteFolder}/Idle.png`,
//     frameRate: 8,
//     scale,
//     collisionBlocks,
//     platformCollisionBlocks,
//     animations: {
//         Idle: { imageSrc: `${spriteFolder}/Idle.png`, frameRate: 8, frameBuffer: 4 },
//         Walk: { imageSrc: `${spriteFolder}/Walk.png`, frameRate: 8, frameBuffer: 4 },
//         WalkLeft: { imageSrc: `${spriteFolder}/WalkLeft.png`, frameRate: 8, frameBuffer: 4 },
//         Attack: { imageSrc: `${spriteFolder}/Attack.png`, frameRate: 6, frameBuffer: 4 },
//         AttackLeft: { imageSrc: `${spriteFolder}/AttackLeft.png`, frameRate: 6, frameBuffer: 4 },
//         Death: { imageSrc: `${spriteFolder}/Death.png`, frameRate: 6, frameBuffer: 4 },
//     },
// });
// enemy.maxHealth = enemyType.baseHealth + level * 0.5;
// enemy.health = enemy.maxHealth;
// enemy.attackDamage = enemyType.baseDamage + level * 0.3;
// enemy.chaseSpeed = enemyType.speed + level * 0.02;
// enemy.detectionRange = 100 + level * 2;
// enemy.colorEffect = enemyType.colorEffect;
// enemy.enemyType = enemyType.name;
// enemy.isMonster = isMonster;
// enemy.flying = enemyType.flying;
// enemy.heavy = enemyType.heavy;
// enemyCollisionBlock.push(enemy);
// if (isMonster) {
//     enemy.scale *= 1.3;
//     enemy.maxHealth *= 3;
//     enemy.attackDamage *= 2;
//     screenShake(1000, 12);
//     spawnParticles(enemy.position.x, enemy.position.y, 50, "red");
// }
