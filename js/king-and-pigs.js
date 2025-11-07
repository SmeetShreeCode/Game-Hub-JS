const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

let parsedCollisions;
let collisionBlocks;
let parsedPlatformCollisions;
let platformCollisions;
let background;
let doors;
let gameState = 'playing'; // 'paused', 'gameOver', 'menu', 'setting'

const player = new Player({
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
        },
        attackRight: {
            imageSrc: './images/king-and-pigs/img/king/attackRight.png',
            frameRate: 3,
            frameBuffer: 4,
            loop: true,
        },
        attackLeft: {
            imageSrc: './images/king-and-pigs/img/king/attackLeft.png',
            frameRate: 3,
            frameBuffer: 4,
            loop: true,
        },
        enterDoor: {
            imageSrc: './images/king-and-pigs/img/king/enterDoor.png',
            frameRate: 8,
            frameBuffer: 4,
            loop: false,
            onComplete: () => {
                console.log("done");
                gsap.to(overlay, {
                    opacity: 1,
                    onComplete: () => {
                        level++;
                        if (level === 12) level = 1;
                        levels[level].init();
                        player.switchSprite('idleRight');
                        player.preventInput = false;
                        gsap.to(overlay, {
                            opacity: 0,
                        });
                    },
                });
            },
        },
    },
});

const enemies = new Enemy({
    imageSrc: './images/king-and-pigs/Sprites/03-Pig/idleLeft.png',
    frameRate: 11,
    isPatrol: true,
    animations: {
        idleRight: {
            imageSrc: './images/king-and-pigs/Sprites/03-Pig/idleRight.png',
            frameRate: 11,
            frameBuffer: 2,
            loop: true,
        },
        idleLeft: {
            imageSrc: './images/king-and-pigs/Sprites/03-Pig/idleLeft.png',
            frameRate: 11,
            frameBuffer: 2,
            loop: true,
        },
        runRight: {
            imageSrc: './images/king-and-pigs/Sprites/03-Pig/runRight.png',
            frameRate: 6,
            frameBuffer: 4,
            loop: true,
        },
        runLeft: {
            imageSrc: './images/king-and-pigs/Sprites/03-Pig/runLeft.png',
            frameRate: 6,
            frameBuffer: 4,
            loop: true,
        },
        attackLeft: {
            imageSrc: './images/king-and-pigs/Sprites/03-Pig/attackLeft.png',
            frameRate: 3,
            frameBuffer: 4,
            loop: true,
        },
        attackRight: {
            imageSrc: './images/king-and-pigs/Sprites/03-Pig/attackRight.png',
            frameRate: 3,
            frameBuffer: 4,
            loop: true,
        },
        hitRight: {
            imageSrc: './images/king-and-pigs/Sprites/03-Pig/hitRight.png',
            frameRate: 2,
            frameBuffer: 4,
            loop: false,
        },
        hitLeft: {
            imageSrc: './images/king-and-pigs/Sprites/03-Pig/hitLeft.png',
            frameRate: 2,
            frameBuffer: 4,
            loop: false,
        },
        deadRight: {
            imageSrc: './images/king-and-pigs/Sprites/03-Pig/deadRight.png',
            frameRate: 4,
            frameBuffer: 4,
            loop: true,
        },
        deadLeft: {
            imageSrc: './images/king-and-pigs/Sprites/03-Pig/deadLeft.png',
            frameRate: 4,
            frameBuffer: 4,
            loop: true,
        },
    },
});

console.log(player);
console.log(enemies);
const keys = {
    jump: {
        pressed: false,
    },
    moveRight: {
        pressed: false,
    },
    moveLeft: {
        pressed: false,
    },
    moveDown: {
        pressed: false,
    },
    attack: {
        pressed: false,
    },
    enterDoor: {
        pressed: false,
    },
};

const overlay = {
    opacity: 0,
};

function checkPlayerEnemyCollision() {
    const p = player.hitbox;
    const e = enemies.hitbox;

    if (p.position.x < e.position.x + e.width && p.position.x + p.width > e.position.x &&
        p.position.y < e.position.y + e.height && p.position.y + p.height > e.position.y) {

        if (keys.attack.pressed) {
            enemies.switchSprite('dead');
            enemies.velocity.x = 0;
        } else {
            console.log('Player takes damage!');
        }
    }
}

function animate() {
    window.requestAnimationFrame(animate);
    if (gameState !== 'playing') return;

    background.draw();
    collisionBlocks.forEach(collisionBlock => {
        collisionBlock.draw();
    });
    platformCollisions.forEach(platformCollision => {
        platformCollision.draw();
    });
    doors.forEach(door => {
        door.draw();
    });

    player.handleInput(keys);
    player.draw();
    player.update();
    enemies.draw()
    enemies.update()

    ctx.save();
    ctx.globalAlpha = overlay.opacity;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    checkPlayerEnemyCollision();
}

levels[level].init();
animate();

function checkPlayerAndDoor() {
    for (let i = 0; i < doors.length; i++) {
        const door = doors[i];
        if (player.hitbox.position.x < door.position.x + door.width &&
            player.hitbox.position.x + player.hitbox.width > door.position.x &&
            player.hitbox.position.y < door.position.y + door.height &&
            player.hitbox.position.y + player.hitbox.height > door.position.y) {
            player.velocity.x = 0;
            player.velocity.y = 0;
            player.position.x = door.position.x - door.width / 2;
            player.preventInput = true;
            player.switchSprite('enterDoor');
            door.play();
            return;
        }
    }

    console.log(collisionBlocks)
    console.log(platformCollisions)
}

window.addEventListener('keydown', (e) => {
    if (player.preventInput) return;
    switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
            if (player.velocity.y === 0) player.velocity.y = -18;
            break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
            keys.moveLeft.pressed = true;
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            keys.moveRight.pressed = true;
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            console.log("down.pressed");
            keys.moveDown.pressed = true;
            break;
        case 'x':
        case 'X':
            checkPlayerAndDoor();
            keys.enterDoor.pressed = true;
            break;
        case ' ':
            keys.attack.pressed = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'a':
        case 'A':
        case 'ArrowLeft':
            keys.moveLeft.pressed = false;
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            keys.moveRight.pressed = false;
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            console.log("down.moved");
            keys.moveDown.pressed = false;
            break;
        case 'x':
        case 'X':
            keys.enterDoor.pressed = false;
            break;
        case ' ':
            keys.attack.pressed = false;
            break;
    }
});

if (!/Mobi|Android/i.test(navigator.userAgent)) {
    document.getElementById('mobile-controls').style.display = 'none';
}

// Handle mobile touch controls
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const jumpBtn = document.getElementById('jump-btn');
const attackBtn = document.getElementById('attack-btn');
const x = document.getElementById('jump-btn');

// RIGHT
leftBtn.addEventListener('touchstart', () => keys.moveLeft.pressed = true);
leftBtn.addEventListener('touchend', () => keys.moveLeft.pressed = false);

// LEFT
rightBtn.addEventListener('touchstart', () => keys.moveRight.pressed = true);
rightBtn.addEventListener('touchend', () => keys.moveRight.pressed = false);

// JUMP
jumpBtn.addEventListener('touchstart', () => {
    if (player.velocity.y === 0) player.velocity.y = -18
});
x.addEventListener('touchstart', () => checkPlayerAndDoor());

// ATTACK
attackBtn.addEventListener('touchstart', () => keys.attack.pressed = true);
attackBtn.addEventListener('touchend', () => keys.attack.pressed = false);
