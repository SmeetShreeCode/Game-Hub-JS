const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scaledCanvas = {
    width: canvas.width / 4,
    height: canvas.height / 4,
};

const gravity = 0.2;

class CollisionBlock {
    constructor({position, height = 16}) {
        this.position = position;
        this.width = 16;
        this.height = height;
    }

    draw() {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
    }
}

class Sprite {
    constructor({position, imageSrc, frameRate = 1, frameBuffer = 3, scale = 1}) {
        this.position = position;
        this.scale = scale;
        this.loaded = false;
        this.image = new Image();
        this.image.onload = () => {
            this.width = (this.image.width / this.frameRate) * this.scale;
            this.height = this.image.height * this.scale;
            this.loaded = true;
        };
        this.image.src = imageSrc;
        this.frameRate = frameRate;
        this.currentFrame = 0;
        this.frameBuffer = frameBuffer;
        this.elapsedFrame = 0;
    }

    draw() {
        if (!this.image) return;

        const cropbox = {
            position: {
                x: this.currentFrame * (this.image.width / this.frameRate),
                y: 0,
            },
            width: this.image.width / this.frameRate,
            height: this.image.height,
        };

        ctx.drawImage(this.image, cropbox.position.x, cropbox.position.y, cropbox.width, cropbox.height, this.position.x, this.position.y, this.width, this.height);
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

class Player extends Sprite {
    constructor({position, collisionBlocks, platformCollisionBlocks, imageSrc, frameRate, scale = 0.5, animations}) {
        super({imageSrc, frameRate, scale});
        this.position = position;
        this.velocity = {
            x: 0,
            y: 1
        }
        this.collisionBlocks = collisionBlocks;
        this.platformCollisionBlocks = platformCollisionBlocks;
        this.hitbox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: 10,
            height: 10,
        };
        this.animations = animations;
        this.lastDirection = 'right';

        for (let key in this.animations) {
            const image = new Image();
            image.src = this.animations[key].imageSrc;
            this.animations[key].image = image;
        }
        this.camerabox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: 200,
            height: 75,
        };
        this.jumpsRemaining = 2;
    }

    switchSprite(key) {
        if (this.image === this.animations[key].image || !this.loaded) return;
        this.currentFrame = 0;
        this.image = this.animations[key].image;
        this.frameBuffer = this.animations[key].frameBuffer;
        this.frameRate = this.animations[key].frameRate;
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

    update() {
        this.updateFrames();
        this.updateHitbox();

        this.updateCamerabox();
        // ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
        // ctx.fillRect(this.camerabox.position.x, this.camerabox.position.y, this.camerabox.width, this.camerabox.height);

        // ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        //
        // ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        // ctx.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height);
        this.draw();
        this.position.x += this.velocity.x;
        this.updateHitbox();
        this.checkForHorizontalCollisions();
        this.applyGravity();
        this.updateHitbox();
        this.checkForVerticalCollisions();
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

    checkForHorizontalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];
            if (collision({
                obj1: this.hitbox,
                obj2: collisionBlock,
            })) {
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

    applyGravity() {
        this.velocity.y += gravity;
        this.position.y += this.velocity.y;
    }

    checkForVerticalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];
            if (collision({
                obj1: this.hitbox,
                obj2: collisionBlock,
            })) {
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

        //platform collision blocks
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
}

class Enemy extends Sprite{
    constructor({position, collisionBlocks, platformCollisionBlocks, imageSrc, frameRate, scale = 0.5, animations}) {
        super({imageSrc, frameRate, scale});
        this.position = position;
        this.velocity = {
            x: 0,
            y: 1
        }
        this.collisionBlocks = collisionBlocks;
        this.platformCollisionBlocks = platformCollisionBlocks;
        this.hitbox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: 10,
            height: 10,
        };
        this.animations = animations;
        this.lastDirection = 'right';

        for (let key in this.animations) {
            const image = new Image();
            image.src = this.animations[key].imageSrc;
            this.animations[key].image = image;
        }
    }

    update() {
        this.draw();
        this.updateFrames();
    }
}

function collision({obj1, obj2}) {
    return (obj1.position.y + obj1.height >= obj2.position.y && obj1.position.y <= obj2.position.y + obj2.height &&
        obj1.position.x <= obj2.position.x + obj2.width && obj1.position.x + obj1.width >= obj2.position.x);
}

function platformCollision({obj1, obj2}) {
    return (obj1.position.y + obj1.height >= obj2.position.y && obj1.position.y + obj1.height <= obj2.position.y + obj2.height &&
        obj1.position.x <= obj2.position.x + obj2.width && obj1.position.x + obj1.width >= obj2.position.x);
}

const floorCollisions2D = [];
for (let i = 0; i < floorCollisions.length; i += 36) {
    floorCollisions2D.push(floorCollisions.slice(i, i + 36));
}

const collisionBlocks = [];
floorCollisions2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 202) {
            collisionBlocks.push(new CollisionBlock({
                position: {
                    x: x * 16,
                    y: y * 16,
                },
            }));
        }
    });
});

const platformCollisions2D = [];
for (let i = 0; i < platformCollisions.length; i += 36) {
    platformCollisions2D.push(platformCollisions.slice(i, i + 36));
}

const platformCollisionBlocks = [];
platformCollisions2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 202) {
            platformCollisionBlocks.push(new CollisionBlock({
                position: {
                    x: x * 16,
                    y: y * 16,
                },
                height: 4,
            }));
        }
    });
});

const enemyCollision2D = [];
for (let i = 0; i < platformCollisions.length; i += 36) {
    enemyCollision2D.push(platformCollisions.slice(i, i + 36));
}

const enemyCollisionBlock = [];
enemyCollision2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 222) {
            enemyCollisionBlock.push(new Enemy({
                position: {
                    x: x * 16,
                    y: y * 16,
                },
                imageSrc: './images/vertical-platform/Kunoichi/Idle.png',
                frameRate: 9,
                scale: 0.5,
                collisionBlocks,
                platformCollisionBlocks,
            }));

        }
    });
});

const player = new Player({
    position: {x: 100, y: 300},
    collisionBlocks,
    platformCollisionBlocks,
    imageSrc: './images/vertical-platform/warrior/Idle.png',
    frameRate: 8,
    animations: {
        Idle: {
            imageSrc: './images/vertical-platform/warrior/Idle.png',
            frameRate: 8,
            frameBuffer: 3,
        },
        IdleLeft: {
            imageSrc: './images/vertical-platform/warrior/IdleLeft.png',
            frameRate: 8,
            frameBuffer: 3,
        },
        Run: {
            imageSrc: './images/vertical-platform/warrior/Run.png',
            frameRate: 8,
            frameBuffer: 5,
        },
        RunLeft: {
            imageSrc: './images/vertical-platform/warrior/RunLeft.png',
            frameRate: 8,
            frameBuffer: 5,
        },
        Jump: {
            imageSrc: './images/vertical-platform/warrior/Jump.png',
            frameRate: 2,
            frameBuffer: 3,
        },
        JumpLeft: {
            imageSrc: './images/vertical-platform/warrior/JumpLeft.png',
            frameRate: 2,
            frameBuffer: 3,
        },
        Fall: {
            imageSrc: './images/vertical-platform/warrior/Fall.png',
            frameRate: 2,
            frameBuffer: 3,
        },
        FallLeft: {
            imageSrc: './images/vertical-platform/warrior/FallLeft.png',
            frameRate: 2,
            frameBuffer: 3,
        },
        Attack1: {
            imageSrc: './images/vertical-platform/warrior/Attack1.png',
            frameRate: 4,
            frameBuffer: 3,
        },
        Attack2: {
            imageSrc: './images/vertical-platform/warrior/Attack2.png',
            frameRate: 4,
            frameBuffer: 3,
        },
        Attack3: {
            imageSrc: './images/vertical-platform/warrior/Attack3.png',
            frameRate: 4,
            frameBuffer: 3,
        },
        Death: {
            imageSrc: './images/vertical-platform/warrior/Death.png',
            frameRate: 6,
            frameBuffer: 8,
        }
    },
});

const keys = {
    moveRight: {
        pressed: false,
    },
    moveLeft: {
        pressed: false,
    },
    attack1: {
        pressed: false,
    },
    attack2: {
        pressed: false,
    },
    attack3: {
        pressed: false,
    },
};

const background = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    imageSrc: './images/vertical-platform/background.png',
});

const backgroundImageHeight = 432;
const camera = {
    // position: {x: 0, y: -background.image.height + scaledCanvas.height},
    position: {x: 0, y: -backgroundImageHeight + scaledCanvas.height},
}

function animate() {
    window.requestAnimationFrame(animate);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(4, 4);
    ctx.translate(camera.position.x, camera.position.y);
    background.update();
    // collisionBlocks.forEach(collisionBlock => {
    //     collisionBlock.update();
    // });
    // platformCollisionBlocks.forEach(block => {
    //     block.update();
    // });
    enemyCollisionBlock.forEach(block => {
        block.update();
    });
    player.checkForHorizontalCanvasCollision();
    player.update();

    player.velocity.x = 0;
    if (keys.moveRight.pressed) {
        player.switchSprite('Run');
        player.velocity.x = 2;
        player.lastDirection = 'right';
        player.shouldPanCameraToTheLeft({canvas, camera});
    } else if (keys.moveLeft.pressed) {
        player.switchSprite('RunLeft');
        player.velocity.x = -2;
        player.lastDirection = 'left';
        player.shouldPanCameraToTheRight({canvas, camera});
    } else if (keys.attack1.pressed) {
        player.switchSprite('Attack1');
    } else if (keys.attack2.pressed) {
        player.switchSprite('Attack2');
    } else if (keys.attack3.pressed) {
        player.switchSprite('Attack3');
    } else if (player.velocity.y === 0) {
        player.switchSprite(player.lastDirection === 'right' ? 'Idle' : 'IdleLeft');
    }

    if (player.velocity.y < 0) {
        player.shouldPanCameraDown({canvas, camera});
        player.switchSprite(player.lastDirection === 'right' ? 'Jump' : 'JumpLeft');
    } else if (player.velocity.y > 0) {
        player.shouldPanCameraUp({canvas, camera});
        player.switchSprite(player.lastDirection === 'right' ? 'Fall' : 'FallLeft');
    }

    ctx.restore();
}

animate();

window.addEventListener('keydown', (e) => {
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
            break;
        case "q":
        case "Q":
            keys.attack2.pressed = true;
            break;
        case " ":
            keys.attack3.pressed = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {
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
