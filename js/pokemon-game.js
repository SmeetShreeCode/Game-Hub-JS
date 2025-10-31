const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const image = new Image();
image.src = './images/pokemon-game/img/Pellet Town.png';

const player = new Image();
player.src = './images/pokemon-game/img/playerDown.png';

const background = new Sprite({
    position: {x: -736, y: -600},
    image: image,
});

const keys = {
    moveUp: {
        pressed: false,
    },
    moveDown: {
        pressed: false,
    },
    moveLeft: {
        pressed: false,
    },
    moveRight: {
        pressed: false,
    },
};

function animate() {
    window.requestAnimationFrame(animate);
    background.draw();
    ctx.drawImage(player,
        0,
        0,
        player.width / 4,
        player.height,
        canvas.width / 2 - (player.width / 4) / 2,
        canvas.height / 2 - player.height / 2,
        player.width / 4,
        player.height
    );

    if (keys.moveUp.pressed) background.position.y += 3;
    else if (keys.moveDown.pressed) background.position.y -= 3;
    else if (keys.moveRight.pressed) background.position.x -= 3;
    else if (keys.moveLeft.pressed) background.position.x += 3;

}

animate();

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            keys.moveUp.pressed = true;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            keys.moveDown.pressed = true;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            keys.moveLeft.pressed = true;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            keys.moveRight.pressed = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            keys.moveUp.pressed = false;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            keys.moveDown.pressed = false;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            keys.moveLeft.pressed = false;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            keys.moveRight.pressed = false;
            break;
    }
});
