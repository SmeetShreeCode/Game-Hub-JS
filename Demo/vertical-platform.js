const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let animationId = null;
let gameOver = false;
let levelCompleted = false;

canvas.width = innerWidth;
canvas.height = innerHeight;

const scaledCanvas = {
    width: canvas.width / 4,
    height: canvas.height / 4,
};

const gravity = 0.2;

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
    character: "warrior",
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
    drawHealthBar(ctx, player.position.x, player.position.y, 40, 4, player.health, player.maxHealth);

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
        drawHealthBar(ctx, enemy.position.x, enemy.position.y, 40, 4, enemy.health, enemy.maxHealth, "yellow");
        drawEnemyAura(enemy);
        enemy.update(player);
        if (enemy.type === "Bat") {
            // Make bat hover up and down slightly
            enemy.position.y += Math.sin(Date.now() / 300 + enemy.position.x) * 0.5;

            // Slightly chase player in Y direction
            if (Math.abs(player.position.x - enemy.position.x) < enemy.detectionRange) {
                enemy.position.y += (player.position.y - enemy.position.y) * 0.01;
            }
        }

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
console.log(player);
console.log(enemyCollisionBlock);

function drawEnemyAura(enemy) {
    let color = "rgba(0,0,0,0)";
    if (enemy.type === "Goblin") color = "rgba(0,255,0,0.3)";
    if (enemy.type === "Bat") color = "rgba(0,0,255,0.3)";
    if (enemy.type === "Ogre") color = "rgba(255,0,0,0.5)";

    const gradient = ctx.createRadialGradient(
        enemy.position.x + enemy.width / 2,
        enemy.position.y + enemy.height / 2,
        10,
        enemy.position.x + enemy.width / 2,
        enemy.position.y + enemy.height / 2,
        40
    );

    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = gradient;
    ctx.fillRect(enemy.position.x - 30, enemy.position.y - 30, enemy.width + 60, enemy.height + 60);
    ctx.restore();
}

/* -------------------- Start game -------------------- */
animate();
