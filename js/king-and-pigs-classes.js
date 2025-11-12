class CollisionBlock {
    constructor({position, width = 64, height = 64}) {
        this.position = position;
        this.width = width;
        this.height = height;
    }

    draw() {
        ctx.fillStyle = 'rgba(255,0,0,0.5)';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

class Sprite {
    constructor({position, imageSrc, frameRate = 1, animations, frameBuffer = 2, loop = true, autoplay = true}) {
        this.position = position;
        this.image = new Image();
        this.image.onload = () => {
            this.loaded = true;
            this.width = this.image.width / this.frameRate;
            this.height = this.image.height;
        }
        this.image.src = imageSrc;
        this.loaded = false;
        this.frameRate = frameRate;
        this.currentFrame = 0;
        this.elapsedFrames = 0;
        this.frameBuffer = frameBuffer;
        this.animations = animations;
        this.loop = loop;
        this.autoplay = autoplay;
        this.currentAnimation;

        if (this.animations) {
            for (let key in this.animations) {
                const image = new Image();
                image.src = this.animations[key].imageSrc;
                this.animations[key].image = image;
            }
        }
    }

    draw() {
        if (!this.loaded) return;
        const cropbox = {
            position: {
                x: this.width * this.currentFrame,
                y: 0,
            },
            width: this.width,
            height: this.height,
        }
        ctx.drawImage(
            this.image,
            cropbox.position.x,
            cropbox.position.y,
            cropbox.width,
            cropbox.height,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
        this.updateFrames();
    }

    play() {
        this.autoplay = true;
    }

    updateFrames() {
        if (!this.autoplay) return;
        this.elapsedFrames++;
        if (this.elapsedFrames % this.frameBuffer === 0) {
            if (this.currentFrame < this.frameRate - 1) this.currentFrame++;
            else if (this.loop) this.currentFrame = 0;
        }

        if (this.currentAnimation?.onComplete) {
            if (this.currentFrame === this.frameRate - 1 && !this.currentAnimation.isActive) {
                this.currentAnimation.onComplete();
                this.currentAnimation.isActive = true;
            }
        }
    }
}

class Player extends Sprite {
    constructor({collisionBlocks = [], platformCollisionBlocks = [], imageSrc, frameRate, animations, loop}) {
        super({imageSrc, frameRate, animations, loop});
        this.position = {x: 200, y: 200};
        this.velocity = {x: 0, y: 0};
        this.sides = {
            bottom: this.position.y + this.height,
        }
        this.gravity = 1;
        this.collisionBlocks = collisionBlocks;
        this.platformCollisionBlocks = platformCollisionBlocks;
    }

    update() {
        // ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        this.position.x += this.velocity.x;
        this.updateHitbox();
        this.updateAttackbox();
        this.checkForHorizontalCollisions();
        this.applyGravity();
        this.updateHitbox();
        this.updateAttackbox();
        // ctx.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height);
        // ctx.fillRect(this.attackbox.position.x, this.attackbox.position.y, this.attackbox.width, this.attackbox.height);
        this.checkForVerticalCollisions();
    }

    handleInput(keys) {
        if (this.preventInput) return;
        this.velocity.x = 0;
        if (keys.moveLeft.pressed) {
            this.switchSprite('runLeft')
            this.velocity.x = -5;
            this.lastDirection = 'left';
        } else if (keys.moveRight.pressed) {
            this.switchSprite('runRight')
            this.velocity.x = 5;
            this.lastDirection = 'right';
        } else if (keys.attack.pressed) {
            this.switchSprite(this.lastDirection === 'left' ? 'attackLeft' : 'attackRight');
        } else {
            this.switchSprite(this.lastDirection === 'left' ? 'idleLeft' : 'idleRight');
        }
    }

    switchSprite(name) {
        if (this.image === this.animations[name].image) return;
        this.currentFrame = 0;
        this.image = this.animations[name].image;
        this.frameRate = this.animations[name].frameRate;
        this.frameBuffer = this.animations[name].frameBuffer;
        this.loop = this.animations[name].loop;
        this.currentAnimation = this.animations[name];
    }

    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x + 58,
                y: this.position.y + 34,
            },
            width: 50,
            height: 53,
        }
    }

    updateAttackbox() {
        this.attackbox = {
            position: {
                x: this.lastDirection === 'right' ? this.position.x + 50 : this.position.x + 8,
                y: this.position.y + 34,
            },
            width: 100,
            height: 53,
        }
    }

    checkForHorizontalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];

            if (this.hitbox.position.x <= collisionBlock.position.x + collisionBlock.width &&
                this.hitbox.position.x + this.hitbox.width >= collisionBlock.position.x &&
                this.hitbox.position.y + this.hitbox.height >= collisionBlock.position.y &&
                this.hitbox.position.y <= collisionBlock.position.y + collisionBlock.height) {
                if (this.velocity.x < 0) {
                    const offset = this.hitbox.position.x - this.position.x;
                    this.position.x = collisionBlock.position.x + collisionBlock.width - offset + 0.01;
                    break;
                }
                if (this.velocity.x > 0) {
                    const offset = this.hitbox.position.x - this.position.x + this.hitbox.width;
                    this.position.x = collisionBlock.position.x - offset - 0.01;
                    break;
                }
            }
        }
    }

    applyGravity() {
        this.velocity.y += this.gravity;
        this.position.y += this.velocity.y;
    }

    checkForVerticalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];

            if (this.hitbox.position.x <= collisionBlock.position.x + collisionBlock.width &&
                this.hitbox.position.x + this.hitbox.width >= collisionBlock.position.x &&
                this.hitbox.position.y + this.hitbox.height >= collisionBlock.position.y &&
                this.hitbox.position.y <= collisionBlock.position.y + collisionBlock.height) {
                if (this.velocity.y < 0) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y;
                    this.position.y = collisionBlock.position.y + collisionBlock.height - offset + 0.01;
                    break;
                }
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;
                    this.position.y = collisionBlock.position.y - offset - 0.01;
                    break;
                }
            }
        }

        for (let i = 0; i < this.platformCollisionBlocks.length; i++) {
            const platformCollisionBlock = this.platformCollisionBlocks[i];

            if (this.hitbox.position.y + this.hitbox.height >= platformCollisionBlock.position.y &&
                this.hitbox.position.y + this.hitbox.height <= platformCollisionBlock.position.y + platformCollisionBlock.height &&
                this.hitbox.position.x <= platformCollisionBlock.position.x + platformCollisionBlock.width &&
                this.hitbox.position.x + this.hitbox.width >= platformCollisionBlock.position.x) {
                if (this.velocity.y > 0) {
                    const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;
                    this.position.y = platformCollisionBlock.position.y - offset - 0.01;
                    break;
                }
            }
        }
    }
}

class Enemy extends Sprite {
    constructor({collisionBlocks = [], imageSrc, frameRate, animations = null, isPatrol = false, patrolDistance = 100, isKing = false, type = 'Pig'}) {
        // build default animations only if none are passed
        if (!animations) {
            const characterFolder =
                type === 'Pig' ? (isKing ? 'King Pig' : 'Pig') : type;

            animations = {
                idleRight: {
                    imageSrc: `./images/king-and-pigs/Sprites/${characterFolder}/idleRight.png`,
                    frameRate: 11,
                    frameBuffer: 2,
                    loop: true,
                },
                idleLeft: {
                    imageSrc: `./images/king-and-pigs/Sprites/${characterFolder}/idleLeft.png`,
                    frameRate: 11,
                    frameBuffer: 2,
                    loop: true,
                },
                runRight: {
                    imageSrc: `./images/king-and-pigs/Sprites/${characterFolder}/runRight.png`,
                    frameRate: 6,
                    frameBuffer: 4,
                    loop: true,
                },
                runLeft: {
                    imageSrc: `./images/king-and-pigs/Sprites/${characterFolder}/runLeft.png`,
                    frameRate: 6,
                    frameBuffer: 4,
                    loop: true,
                },
                attackLeft: {
                    imageSrc: `./images/king-and-pigs/Sprites/${characterFolder}/attackLeft.png`,
                    frameRate: 3,
                    frameBuffer: 4,
                    loop: true,
                },
                attackRight: {
                    imageSrc: `./images/king-and-pigs/Sprites/${characterFolder}/attackRight.png`,
                    frameRate: 3,
                    frameBuffer: 4,
                    loop: true,
                },
                hitRight: {
                    imageSrc: `./images/king-and-pigs/Sprites/${characterFolder}/hitRight.png`,
                    frameRate: 2,
                    frameBuffer: 4,
                    loop: false,
                },
                hitLeft: {
                    imageSrc: `./images/king-and-pigs/Sprites/${characterFolder}/hitLeft.png`,
                    frameRate: 2,
                    frameBuffer: 4,
                    loop: false,
                },
                deadRight: {
                    imageSrc: `./images/king-and-pigs/Sprites/${characterFolder}/deadRight.png`,
                    frameRate: 4,
                    frameBuffer: 4,
                    loop: true,
                },
                deadLeft: {
                    imageSrc: `./images/king-and-pigs/Sprites/${characterFolder}/deadLeft.png`,
                    frameRate: 4,
                    frameBuffer: 4,
                    loop: true,
                },
            };
        }

        super({imageSrc, frameRate, animations});
        this.position = { x: 600, y: 355 };
        this.velocity = { x: 0, y: 0 };
        this.sides = { bottom: this.position.y + this.height, };
        this.gravity = 1;
        this.collisionBlocks = collisionBlocks;
        this.direction = 'left';
        this.patrolDistance = patrolDistance;
        this.startX = this.position.x;
        this.speed = 2;
        this.isPatrol = isPatrol;
        this.isKing = isKing;
        this.type = type;
    }

    patrol() {
        if (!this.isPatrol) return;
        if (this.direction === 'left') {
            this.velocity.x = -this.speed;
            this.switchSprite('runLeft');
            if (this.position.x < this.startX - this.patrolDistance)
                this.direction = 'right';
        } else {
            this.velocity.x = this.speed;
            this.switchSprite('runRight');
            if (this.position.x > this.startX + this.patrolDistance)
                this.direction = 'left';
        }
    }

    update() {
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        this.position.x += this.velocity.x;
        this.updateHitbox();
        this.checkForHorizontalCollisions();
        this.applyGravity();
        this.updateHitbox();
        this.patrol();
        // ctx.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height);
        this.checkForVerticalCollisions();
    }

    switchSprite(name) {
        if (this.image === this.animations[name].image) return;
        this.currentFrame = 0;
        this.image = this.animations[name].image;
        this.frameRate = this.animations[name].frameRate;
        this.frameBuffer = this.animations[name].frameBuffer;
        this.loop = this.animations[name].loop;
        this.currentAnimation = this.animations[name];
    }

    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x + 20,
                y: this.position.y + 18,
            },
            width: 38,
            height: 38,
        }
    }

    checkForHorizontalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];

            if (this.hitbox.position.x <= collisionBlock.position.x + collisionBlock.width &&
                this.hitbox.position.x + this.hitbox.width >= collisionBlock.position.x &&
                this.hitbox.position.y + this.hitbox.height >= collisionBlock.position.y &&
                this.hitbox.position.y <= collisionBlock.position.y + collisionBlock.height) {
                if (this.velocity.x < 0) {
                    const offset = this.hitbox.position.x - this.position.x;
                    this.position.x = collisionBlock.position.x + collisionBlock.width - offset + 0.01;
                    // reverse direction when hitting wall
                    this.direction = 'right';
                    this.switchSprite('runRight');
                    break;
                }
                if (this.velocity.x > 0) {
                    const offset = this.hitbox.position.x - this.position.x + this.hitbox.width;
                    this.position.x = collisionBlock.position.x - offset - 0.01;
                    // reverse direction when hitting wall
                    this.direction = 'left';
                    this.switchSprite('runLeft');
                    break;
                }
                this.velocity.x = 0;
            }
        }
    }

    applyGravity() {
        this.velocity.y += this.gravity;
        this.position.y += this.velocity.y;
    }

    checkForVerticalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];

            if (this.hitbox.position.x <= collisionBlock.position.x + collisionBlock.width &&
                this.hitbox.position.x + this.hitbox.width >= collisionBlock.position.x &&
                this.hitbox.position.y + this.hitbox.height >= collisionBlock.position.y &&
                this.hitbox.position.y <= collisionBlock.position.y + collisionBlock.height) {
                if (this.velocity.y < 0) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y;
                    this.position.y = collisionBlock.position.y + collisionBlock.height - offset + 0.01;
                    break;
                }
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                    const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;
                    this.position.y = collisionBlock.position.y - offset - 0.01;
                    break;
                }
            }
        }
    }
}

class Box extends Sprite {
    constructor({imageSrc, frameRate, animations, loop}) {
        super({imageSrc, frameRate, animations, loop});
        this.position = {x: 200, y: 200};
        this.sides = {
            bottom: this.position.y + this.height,
        }
    }

    update() {
        // ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        this.updateHitbox();
        // ctx.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height);
    }

    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: 50,
            height: 53,
        }
    }
}

class Bomb extends Sprite {
    constructor({imageSrc, frameRate, animations, loop}) {
        super({imageSrc, frameRate, animations, loop});
        this.position = {x: 200, y: 200};
    }

    update() {
        // ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        this.updateHitbox();
        // ctx.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height);
    }

    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: 20,
            height: 25,
        }
    }
}

class Cannon extends Sprite {
    constructor({imageSrc, frameRate, animations, loop}) {
        super({imageSrc, frameRate, animations, loop});
        this.position = {x: 200, y: 200};
    }

    update() {
        // ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        this.updateHitbox();
        // ctx.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height);
    }

    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: 40,
            height: 45,
        }
    }
}

class LivesAndCoins extends Sprite {
    constructor({imageSrc, frameRate, animations, loop, type = 'coin'}) {
        super({imageSrc, frameRate, animations, loop});
        this.position = {x: 200, y: 200};
        this.type = type;
    }

    update() {
        // ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        this.updateHitbox();
        // ctx.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height);
    }

    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: 10,
            height: 15,
        }
    }
}

Array.prototype.parse2D = function () {
    const rows = [];
    for (let i = 0; i < this.length; i += 16) {
        rows.push(this.slice(i, i + 16));
    }
    return rows;
};

Array.prototype.createObjectFrom2D = function (type) {
    const objects = [];
    this.forEach((row, y) => {
        row.forEach((symbol, x) => {
            let condition = type === 'collision' ? symbol === 292 || symbol === 250
                : type === 'floor' ? symbol === 293 || symbol === 294 || symbol === 251 || symbol === 252 : false; //check type is collision or floor or other
            if (condition) {
                objects.push(new CollisionBlock({
                    position: {x: x * 64, y: y * 64},
                    height: symbol === 294 || symbol === 252 ? 12 : symbol === 293 || symbol === 251 ? 24 : symbol === 292 || symbol === 250 ? 64 : 0,
                }));
            }
        });
    });
    return objects;
};
