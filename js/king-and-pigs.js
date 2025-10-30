const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 64 * 16;
canvas.height = 64 * 9;

class CollisionBlock {
    constructor({position}) {
        this.position = position;
        this.width = 64;
        this.height = 64;
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
    }
}

class Player extends Sprite {
    constructor({collisionBlocks = [], imageSrc, frameRate, animations}) {
        super({imageSrc, frameRate, animations});
        this.position = {x: 200, y: 200};
        this.velocity = {x: 0, y: 0};
        this.sides = {
            bottom: this.position.y + this.height,
        }
        this.gravity = 1;
        this.collisionBlocks = collisionBlocks;
    }

    update() {
        // ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        this.position.x += this.velocity.x;
        this.updateHitbox();
        this.checkForHorizontalCollisions();
        this.applyGravity();
        this.updateHitbox();
        // ctx.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height);
        this.checkForVerticalCollisions();
    }

    switchSprite(name) {
        if (this.image === this.animations[name].image) return;
        this.currentFrame = 0;
        this.image = this.animations[name].image;
        this.frameRate = this.animations[name].frameRate;
        this.frameBuffer = this.animations[name].frameBuffer;
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
    }
}

Array.prototype.parse2D = function () {
    const rows = [];
    for (let i = 0; i < this.length; i += 16) {
        rows.push(this.slice(i, i + 16));
    }
    return rows;
}

Array.prototype.createObjectFrom2D = function () {
    const objects = [];
    this.forEach((row, y) => {
        row.forEach((symbol, x) => {
            if (symbol === 292) {
                objects.push(new CollisionBlock({
                    position: {x: x * 64, y: y * 64},
                }));
            }
        });
    });
    return objects;
}

const parsedCollisions = collisionsLevel1.parse2D();
const collisionBlocks = parsedCollisions.createObjectFrom2D();

const backgroundLevel1 = new Sprite({
    position: {x: 0, y: 0},
    imageSrc: './images/king-and-pigs/img/backgroundLevel1.png',
});

const player = new Player({
    collisionBlocks,
    imageSrc: './images/king-and-pigs/img/king/idle.png',
    frameRate: 11,
    animations: {
        idleRight: {
            imageSrc: './images/king-and-pigs/img/king/idle.png',
            frameRate: 11,
            frameBuffer: 2,
            loop: true,
        },
        idleLeft: {
            imageSrc: './images/king-and-pigs/img/king/idleLeft.png',
            frameRate: 11,
            frameBuffer: 2,
            loop: true,
        },
        runRight: {
            imageSrc: './images/king-and-pigs/img/king/runRight.png',
            frameRate: 8,
            frameBuffer: 4,
            loop: true,
        },
        runLeft: {
            imageSrc: './images/king-and-pigs/img/king/runLeft.png',
            frameRate: 8,
            frameBuffer: 4,
            loop: true,
        }
    },
});

const doors = [
    new Sprite({
        position: {x: 767, y: 278},
        imageSrc: './images/king-and-pigs/img/doorOpen.png',
        frameRate: 5,
        frameBuffer: 5,
        loop: false,
        autoplay: false,
    })
];

const keys = {
    jump: {
        pressed: false,
    },
    moveRight: {
        pressed: false,
    },
    moveLeft: {
        pressed: false,
    }
}

function animate() {
    window.requestAnimationFrame(animate);

    backgroundLevel1.draw();
    collisionBlocks.forEach(collisionBlock => {
        collisionBlock.draw();
    });
    doors.forEach(door => {
        door.draw();
    });
    player.velocity.x = 0;
    if (keys.moveLeft.pressed) {
        player.switchSprite('runRight')
        player.velocity.x = 5;
        player.lastDirection = 'right';
    } else if (keys.moveRight.pressed) {
        player.switchSprite('runLeft')
        player.velocity.x = -5;
        player.lastDirection = 'left';
    } else {
        if (player.lastDirection === 'left')
            player.switchSprite('idleLeft');
        else
            player.switchSprite('idleRight');
    }
    player.draw();
    player.update();

}

animate();

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':

            for (let i = 0; i < doors.length; i++) {
                const door = doors[i];
                if (player.hitbox.position.x + player.hitbox.width <= door.position.x + door.width &&
                    player.hitbox.position.x >= door.position.x &&
                    player.hitbox.position.y + player.hitbox.height >= door.position.y &&
                    player.hitbox.position.y <= door.position.y + door.height) {
                    return;
                }
            }
            if (player.velocity.y === 0) player.velocity.y = -20;
            break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
            keys.moveRight.pressed = true;
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            keys.moveLeft.pressed = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'a':
        case 'A':
        case 'ArrowLeft':
            keys.moveRight.pressed = false;
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            keys.moveLeft.pressed = false;
            break;
    }
});
