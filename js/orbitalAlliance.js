const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const socket = io();

const devicePixelRatio = window.devicePixelRatio || 2;

canvas.width = innerWidth * devicePixelRatio;
canvas.height = innerHeight * devicePixelRatio;

const scoreEl = document.querySelector('#scoreEl');
const highScore = document.querySelector('#highScore');
const startGame = document.querySelector('#startGame');
const startGameOverlay = document.querySelector('#startGameOverlay');
const endScore = document.querySelector('#endScore');
let highScoreValue = localStorage.getItem('coreDefender_highScore') || 0;
highScore.innerHTML = highScoreValue;


const x = canvas.width / 2;
const y = canvas.height / 2;

const frontEndPlayers = {};
const frontEndProjectiles = {};

socket.on('connect', () => {
    socket.emit('initCanvas', {width: canvas.width, height: canvas.height});
})

socket.on('updateProjectiles', (backEndProjectiles) => {
    for (const id in backEndProjectiles) {
        const backEndProjectile = backEndProjectiles[id];

        if (!frontEndProjectiles[id]) {
            frontEndProjectiles[id] = new Projectile({
                x: backEndProjectile.x,
                y: backEndProjectile.y,
                radius: 5,
                color: frontEndPlayers[backEndProjectile.playerId]?.color,
                velocity: backEndProjectile.velocity,
            });
        }else {
            frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x;
            frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y;
        }
    }
    for (const frontEndProjectileId in frontEndProjectiles) {
        if (!backEndProjectiles[frontEndProjectileId]) {
            delete frontEndProjectiles[frontEndProjectileId];
        }
    }
});

socket.on('updatePlayers', (backEndPlayers) => {
    for (const id in backEndPlayers) {
        const backEndPlayer = backEndPlayers[id];

        if (!frontEndPlayers[id]) {
            frontEndPlayers[id] = new Player({
                x: backEndPlayer.x,
                y: backEndPlayer.y,
                radius: 10,
                color: backEndPlayer.color
            });
        } else {
            if (id === socket.id) {
                //if player exist
                frontEndPlayers[id].x = backEndPlayer.x;
                frontEndPlayers[id].y = backEndPlayer.y;

                const lastBackEndInputIndex = playerInputs.findIndex((input) => {
                    return backEndPlayer.sequenceNumber === input.sequenceNumber;
                });

                if (lastBackEndInputIndex > -1) playerInputs.splice(0, lastBackEndInputIndex + 1);

                playerInputs.forEach(input => {
                    frontEndPlayers[id].x += input.dx;
                    frontEndPlayers[id].y += input.dy;
                });
            } else {
                frontEndPlayers[id].x = backEndPlayer.x;
                frontEndPlayers[id].y = backEndPlayer.y;

                gsap.to(frontEndPlayers[id], {
                    x: backEndPlayer.x,
                    y: backEndPlayer.y,
                    duration: 0.015,
                    ease: 'linear'
                });
            }
        }
    }
    for (const id in frontEndPlayers) {
        if (!backEndPlayers[id]) {
            delete frontEndPlayers[id];
        }
    }
});

let animationId;

function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const id in frontEndPlayers) {
        const frontEndPlayer = frontEndPlayers[id];
        frontEndPlayer.draw();
    }

    for (const id in frontEndProjectiles) {
        const frontEndProjectile = frontEndProjectiles[id];
        frontEndProjectile.draw();
    }

    // for (let i = frontEndProjectiles.length - 1; i >= 0; i--) {
    //     const frontEndProjectile = frontEndProjectiles[i];
    //     frontEndProjectile.update();
    // }
}

window.addEventListener('click', (e) => {
    const playerPosition = {
        x: frontEndPlayers[socket.id].x,
        y: frontEndPlayers[socket.id].y,
    };
    const angle = Math.atan2((e.clientY * window.devicePixelRatio) - playerPosition.y,
        (e.clientX * window.devicePixelRatio) - playerPosition.x);

    // const velocity = {
    //     x: Math.cos(angle) * 5,
    //     y: Math.sin(angle) * 5,
    // };

    socket.emit('shoot', {
        x: playerPosition.x,
        y: playerPosition.y,
        angle
    });

    // frontEndProjectiles.push(new Projectile({
    //     x: playerPosition.x,
    //     y: playerPosition.y,
    //     radius: 5,
    //     color: 'white',
    //     velocity
    // }));
    console.log(frontEndProjectiles);
});

animate();

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

const SPEED = 10;
const playerInputs = [];
let sequenceNumber = 0;

setInterval(() => {
    if (keys.moveUp.pressed) {
        sequenceNumber++;
        playerInputs.push({sequenceNumber, dx: 0, dy: -SPEED});
        frontEndPlayers[socket.id].y -= SPEED;
        socket.emit('keydown', {keycode: 'KeyW', sequenceNumber});
    }
    if (keys.moveLeft.pressed) {
        sequenceNumber++;
        playerInputs.push({sequenceNumber, dx: -SPEED, dy: 0});
        frontEndPlayers[socket.id].x -= SPEED;
        socket.emit('keydown', {keycode: 'KeyA', sequenceNumber});
    }
    if (keys.moveDown.pressed) {
        sequenceNumber++;
        playerInputs.push({sequenceNumber, dx: 0, dy: SPEED});
        frontEndPlayers[socket.id].y += SPEED;
        socket.emit('keydown', {keycode: 'KeyS', sequenceNumber});
    }
    if (keys.moveRight.pressed) {
        sequenceNumber++;
        playerInputs.push({sequenceNumber, dx: SPEED, dy: 0});
        frontEndPlayers[socket.id].x += SPEED;
        socket.emit('keydown', {keycode: 'KeyD', sequenceNumber});
    }
}, 15);

window.addEventListener('keydown', (e) => {
    if (!frontEndPlayers[socket.id]) return;
    switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
            keys.moveUp.pressed = true;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            keys.moveLeft.pressed = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            keys.moveDown.pressed = true;
            break;
        case 'KeyD':
        case 'ArrowRight':
            keys.moveRight.pressed = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    if (!frontEndPlayers[socket.id]) return;
    switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
            keys.moveUp.pressed = false;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            keys.moveLeft.pressed = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            keys.moveDown.pressed = false;
            break;
        case 'KeyD':
        case 'ArrowRight':
            keys.moveRight.pressed = false;
            break;
    }
});