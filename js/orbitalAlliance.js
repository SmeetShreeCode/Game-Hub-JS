const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// const socket = io();
const socket = io("http://192.168.29.24:3000");

const devicePixelRatio = window.devicePixelRatio || 1;

canvas.width = 1024 * devicePixelRatio;
canvas.height = 576 * devicePixelRatio;

ctx.scale(devicePixelRatio, devicePixelRatio);

const scoreEl = document.querySelector('#scoreEl');
const highScore = document.querySelector('#highScore');
const startGame = document.querySelector('#startGame');
const startGameOverlay = document.querySelector('#startGameOverlay');
const endScore = document.querySelector('#endScore');
let highScoreValue = localStorage.getItem('coreDefender_highScore') || 0;
// highScore.innerHTML = highScoreValue;


const x = canvas.width / 2;
const y = canvas.height / 2;

const frontEndPlayers = {};
const frontEndProjectiles = {};
let gameReady = false;

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
        } else {
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
    gameReady = true;
    for (const id in backEndPlayers) {
        const backEndPlayer = backEndPlayers[id];

        if (!frontEndPlayers[id]) {
            frontEndPlayers[id] = new Player({
                x: backEndPlayer.x,
                y: backEndPlayer.y,
                radius: 10,
                color: backEndPlayer.color,
                username: backEndPlayer.username,
            });

            document.querySelector('#playerLabels').innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score}</div>`;
        } else {
            document.querySelector(`div[data-id="${id}"]`).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score}`;
            document.querySelector(`div[data-id="${id}"]`).setAttribute('data-score', backEndPlayer.score);
            const parentDiv = document.querySelector('#playerLabels');
            const childDivs = Array.from(parentDiv.querySelectorAll('div'));
            childDivs.sort((a, b) => {
                const scoreA = Number(a.getAttribute('data-score'));
                const scoreB = Number(b.getAttribute('data-score'));

                return scoreB - scoreA;
            });
            childDivs.forEach((div) => {
                parentDiv.removeChild(div)
            });
            childDivs.forEach((div) => {
                parentDiv.appendChild(div)
            });

            frontEndPlayers[id].target = {
                x: backEndPlayer.x,
                y: backEndPlayer.y,
            };


            if (id === socket.id) {
                //if player exist
                // frontEndPlayers[id].x = backEndPlayer.x;
                // frontEndPlayers[id].y = backEndPlayer.y;

                const lastBackEndInputIndex = playerInputs.findIndex((input) => {
                    return backEndPlayer.sequenceNumber === input.sequenceNumber;
                });

                if (lastBackEndInputIndex > -1) playerInputs.splice(0, lastBackEndInputIndex + 1);

                playerInputs.forEach(input => {
                    frontEndPlayers[id].target.x += input.dx;
                    frontEndPlayers[id].target.y += input.dy;
                });
            } else {
                frontEndPlayers[id].x = backEndPlayer.x;
                frontEndPlayers[id].y = backEndPlayer.y;

                // gsap.to(frontEndPlayers[id], {
                //     x: backEndPlayer.x,
                //     y: backEndPlayer.y,
                //     duration: 0.015,
                //     ease: 'linear'
                // });
            }
        }
    }

    // here we delete frontend players
    for (const id in frontEndPlayers) {
        if (!backEndPlayers[id]) {
            const divToDelete = document.querySelector(`div[data-id="${id}"]`);
            divToDelete.parentNode.removeChild(divToDelete);

            if (id === socket.id) {
                document.querySelector('#usernameForm').style.display = 'block';
            }
            delete frontEndPlayers[id];
        }
    }
});

let animationId;

function animate() {
    animationId = requestAnimationFrame(animate);
    // ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const id in frontEndPlayers) {
        const frontEndPlayer = frontEndPlayers[id];

        if (frontEndPlayer.target) {
            frontEndPlayers[id].x += (frontEndPlayers[id].target.x - frontEndPlayers[id].x) * 0.5;
            frontEndPlayers[id].y += (frontEndPlayers[id].target.y - frontEndPlayers[id].y) * 0.5;
        }

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
    const canvas = document.querySelector('canvas');
    const {top, left} = canvas.getBoundingClientRect();
    const playerPosition = {
        x: frontEndPlayers[socket.id].x,
        y: frontEndPlayers[socket.id].y,
    };
    // const angle = Math.atan2((e.clientY * window.devicePixelRatio) - playerPosition.y,
    //     (e.clientX * window.devicePixelRatio) - playerPosition.x);
    const angle = Math.atan2(e.clientY - top - playerPosition.y,
        e.clientX - left - playerPosition.x);

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

const SPEED = 5;
const playerInputs = [];
let sequenceNumber = 0;

setInterval(() => {
    if (!gameReady) return; // don't send input yet
    if (keys.moveUp.pressed) {
        sequenceNumber++;
        playerInputs.push({sequenceNumber, dx: 0, dy: -SPEED});
        // frontEndPlayers[socket.id].y -= SPEED;
        socket.emit('keydown', {keycode: 'KeyW', sequenceNumber});
    }
    if (keys.moveLeft.pressed) {
        sequenceNumber++;
        playerInputs.push({sequenceNumber, dx: -SPEED, dy: 0});
        // frontEndPlayers[socket.id].x -= SPEED;
        socket.emit('keydown', {keycode: 'KeyA', sequenceNumber});
    }
    if (keys.moveDown.pressed) {
        sequenceNumber++;
        playerInputs.push({sequenceNumber, dx: 0, dy: SPEED});
        // frontEndPlayers[socket.id].y += SPEED;
        socket.emit('keydown', {keycode: 'KeyS', sequenceNumber});
    }
    if (keys.moveRight.pressed) {
        sequenceNumber++;
        playerInputs.push({sequenceNumber, dx: SPEED, dy: 0});
        // frontEndPlayers[socket.id].x += SPEED;
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

document.querySelector('#usernameForm').addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelector('#usernameForm').style.display = 'none';
    socket.emit('initGame', {
        username: document.querySelector('#usernameInput').value,
        width: canvas.width,
        height: canvas.height,
        devicePixelRatio
    });
    console.log(e)
});


//server {
//     listen 80;
//     server_name <Your_Domain_Name>;
//
//     location / {
//         proxy_pass http://localhost:3000;
//         proxy_http_version 1.1;
//         proxy_set_header Upgrade $http_upgrade;
//         proxy_set_header Connection 'upgrade';
//         proxy_set_header Host $host;
//         proxy_cache_bypass $http_upgrade;
//     }
// }
//
// // Enable the site by creating a symbolic link to it in the sites-enabled directory:
// // sudo ln -s /etc/nginx/sites-available/multiplayer.chriscourses.games /etc/nginx/sites-enabled
//
// // Test your Nginx configurations to ensure there's no syntax error:
// // sudo nginx -t
//
// // If the test is successful, reload Nginx to apply the changes:
// // sudo systemctl reload nginx