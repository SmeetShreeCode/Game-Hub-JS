const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 64 * 16;
canvas.height = 64 * 9;

let parsedCollisions;
let collisionBlocks;
let background;
let doors;

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
        attack: {
            imageSrc: './images/king-and-pigs/img/king/attack.png',
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
    imageSrc: './images/king-and-pigs/Sprites/03-Pig/Idle (34x28).png',
    frameRate: 11,
    animations: {
        idleRight: {
            imageSrc: './images/king-and-pigs/Sprites/03-Pig/Idle (34x28).png',
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
            frameRate: 8,
            frameBuffer: 4,
            loop: true,
        },
        runLeft: {
            imageSrc: './images/king-and-pigs/Sprites/03-Pig/runLeft.png',
            frameRate: 8,
            frameBuffer: 4,
            loop: true,
        },
        attack: {
            imageSrc: './images/king-and-pigs/Sprites/03-Pig/attack.png',
            frameRate: 3,
            frameBuffer: 4,
            loop: true,
        },
        hit: {
            imageSrc: './images/king-and-pigs/Sprites/03-Pig/hit.png',
            frameRate: 3,
            frameBuffer: 4,
            loop: true,
        },
        dead: {
            imageSrc: './images/king-and-pigs/Sprites/03-Pig/dead.png',
            frameRate: 3,
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
    attack: {
        pressed: false,
    },
};

const overlay = {
    opacity: 0,
};

function animate() {
    window.requestAnimationFrame(animate);

    background.draw();
    // collisionBlocks.forEach(collisionBlock => {
    //     collisionBlock.draw();
    // });
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
}

levels[level].init();
animate();

window.addEventListener('keydown', (e) => {
    // console.log(e);
    if (player.preventInput) return;
    switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':

            for (let i = 0; i < doors.length; i++) {
                const door = doors[i];
                if (player.hitbox.position.x + player.hitbox.width <= door.position.x + door.width &&
                    player.hitbox.position.x + player.hitbox.width >= door.position.x &&
                    player.hitbox.position.y + player.hitbox.height >= door.position.y &&
                    player.hitbox.position.y <= door.position.y + door.height) {
                    player.velocity.x = 0;
                    player.velocity.y = 0;
                    player.position.x = door.position.x - door.width / 2;
                    player.position.y = door.position.y - door.width / 2;
                    player.preventInput = true;
                    player.switchSprite('enterDoor');
                    door.play();
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
            keys.moveRight.pressed = false;
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            keys.moveLeft.pressed = false;
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

// RIGHT
leftBtn.addEventListener('touchstart', () => keys.moveRight.pressed = true);
leftBtn.addEventListener('touchend', () => keys.moveRight.pressed = false);

// LEFT
rightBtn.addEventListener('touchstart', () => keys.moveLeft.pressed = true);
rightBtn.addEventListener('touchend', () => keys.moveLeft.pressed = false);

// JUMP
jumpBtn.addEventListener('touchstart', () => {
    if (player.velocity.y === 0) player.velocity.y = -20;
});

// ATTACK
attackBtn.addEventListener('touchstart', () => keys.attack.pressed = true);
attackBtn.addEventListener('touchend', () => keys.attack.pressed = false);
