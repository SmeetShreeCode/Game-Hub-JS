const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

const scaledCanvas = {
    width: canvas.width / 4,
    height: canvas.height / 4,
};

const gravity = 0.5;

class CollisionBlock {
    constructor({position}) {
        this.position = position;
        this.width = 16;
        this.height = 16;
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
    constructor({position, imageSrc}) {
        this.position = position;
        this.image = new Image();
        this.image.src = imageSrc;
    }

    draw() {
        if (!this.image) return;
        ctx.drawImage(this.image, this.position.x, this.position.y);
    }

    update() {
        this.draw();
    }
}

class Player {
    constructor({position, collisionBlocks}) {
        this.position = position;
        this.velocity = {
            x: 0,
            y: 1
        }
        this.width = 25;
        this.height = 25;
        this.collisionBlocks = collisionBlocks;
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.checkForHorizontalCollisions();
        this.applyGravity();
        this.checkForVerticalCollisions();
    }

    checkForHorizontalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];
            if (collision({
                obj1: this,
                obj2: collisionBlock,
            })) {
                if (this.velocity.x > 0) {
                    this.velocity.x = 0;
                    this.position.x = collisionBlock.position.x - this.width - 0.01;
                    break;
                }
                if (this.velocity.x < 0) {
                    this.velocity.x = 0;
                    this.position.x = collisionBlock.position.x + collisionBlock.width + 0.01;
                    break;
                }
            }
        }
    }

    applyGravity() {
        this.position.y += this.velocity.y;
        this.velocity.y += gravity;
    }

    checkForVerticalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];
            if (collision({
                obj1: this,
                obj2: collisionBlock,
            })) {
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                    this.position.y = collisionBlock.position.y - this.height - 0.01;
                    break;
                }
                if (this.velocity.y < 0) {
                    this.velocity.y = 0;
                    this.position.y = collisionBlock.position.y + collisionBlock.height + 0.01;
                    break;
                }
            }
        }
    }
}

function collision({obj1, obj2}) {
    return (obj1.position.y + obj1.height >= obj2.position.y && obj1.position.y <= obj2.position.y + obj2.height &&
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
            }));
        }
    });
});

const player = new Player({position: {x: 100, y: 0},collisionBlocks: collisionBlocks});

const keys = {
    d: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    ArrowRight: {
        pressed: false,
    },
    ArrowLeft: {
        pressed: false,
    }
};

const background = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    imageSrc: './images/vertical-platform/background.png',
});

function animate() {
    window.requestAnimationFrame(animate);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(4, 4);
    ctx.translate(0, -background.image.height + scaledCanvas.height);
    background.update();
    collisionBlocks.forEach(collisionBlock => {
        collisionBlock.update();
    });
    platformCollisionBlocks.forEach(block => {
        block.update();
    });

    player.update();

    player.velocity.x = 0;
    if (keys.d.pressed) player.velocity.x = 5;
    else if (keys.ArrowRight.pressed) player.velocity.x = 5;
    else if (keys.a.pressed) player.velocity.x = -5;
    else if (keys.ArrowLeft.pressed) player.velocity.x = -5;

    ctx.restore();
}

animate();

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case "d":
        case "ArrowRight":
            keys.d.pressed = true;
            break;
        case "a":
        case "ArrowLeft":
            keys.a.pressed = true;
            break;
        case "w":
        case "ArrowUp":
            player.velocity.y = -8;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case "d":
        case "ArrowRight":
            keys.d.pressed = false;
            break;
        case "a":
        case "ArrowLeft":
            keys.a.pressed = false;
            break;
    }
});
