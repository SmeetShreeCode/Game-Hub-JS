const express = require('express');
const app = express();

// socket.io setup
const http = require('http');
const server = http.createServer(app); // <-- create HTTP server
const {Server} = require('socket.io');
const io = new Server(server, {
    pingInterval: 2000,
    pingTimeout: 5000,
    cors: {
        origin: "http://192.168.29.24:4200",
        methods: ["GET", "POST"]
    }
});

const port = 3000;

// app.use(express.static(__dirname)); // serves everything in root
// app.use('/css', express.static(__dirname + '/css'));
// app.use('/js', express.static(__dirname + '/js'));
// app.use('/images', express.static(__dirname + '/images'));
// app.use('/music', express.static(__dirname + '/music'));

// app.get('/orbitalAlliance.html', (req, res) => {
//     res.sendFile(__dirname + '/orbitalAlliance.html')
// });

const backEndPlayers = {};
const backEndProjectiles = {};

//ROCK PAPER SCISSORS
const rooms = {};

const SPEED = 5;
const RADIUS = 10;
const PROJECTILE_RADIUS = 5;
let projectileId = 0;

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('a user connected');

    io.emit('updatePlayers', backEndPlayers);

    socket.on('shoot', ({x, y, angle}) => {
        projectileId++;
        const velocity = {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5,
        };
        backEndProjectiles[projectileId] = {
            x,
            y,
            velocity,
            playerId: socket.id,
        };
    });

    socket.on('initGame', ({username, width, height}) => {
        backEndPlayers[socket.id] = {
            x: 1024 * Math.random(),
            y: 576 * Math.random(),
            color: `hsl(${360 * Math.random()}, 100%, 50%)`,
            sequenceNumber: 0,
            score: 0,
            username
        };

        // where canvas init
        backEndPlayers[socket.id].canvas = {
            width,
            height
        };
        backEndPlayers[socket.id].radius = RADIUS;
        // if (devicePixelRatio > 1) {
        //     backEndPlayers[socket.id].radius = 2 * RADIUS;
        // }
    });

    socket.on('disconnect', (reason) => {
        console.log('user disconnected');
        console.log(reason);
        delete backEndPlayers[socket.id];
        io.emit('updatePlayers', backEndPlayers);
    });

    socket.on('keydown', ({keycode, sequenceNumber}) => {
        const backEndPlayer = backEndPlayers[socket.id];
        if (!backEndPlayer) return;

        backEndPlayers[socket.id].sequenceNumber = sequenceNumber;
        switch (keycode) {
            case 'KeyW':
                backEndPlayers[socket.id].y -= SPEED;
                break;
            case 'KeyA':
                backEndPlayers[socket.id].x -= SPEED;
                break;
            case 'KeyS':
                backEndPlayers[socket.id].y += SPEED;
                break;
            case 'KeyD':
                backEndPlayers[socket.id].x += SPEED;
                break;
        }
        const playerSides = {
            left: backEndPlayer.x - backEndPlayer.radius,
            right: backEndPlayer.x + backEndPlayer.radius,
            top: backEndPlayer.y - backEndPlayer.radius,
            bottom: backEndPlayer.y + backEndPlayer.radius
        };

        if (playerSides.left < 0) backEndPlayers[socket.id].x = backEndPlayer.radius;
        if (playerSides.right > 1024) backEndPlayers[socket.id].x = 1024 - backEndPlayer.radius;
        if (playerSides.top < 0) backEndPlayers[socket.id].y = backEndPlayer.radius;
        if (playerSides.bottom > 576) backEndPlayers[socket.id].y = 576 - backEndPlayer.radius;
    });


    // ------ROCK PAPER SCISSORS------
    socket.on('createGame', () => {
        const roomId = makeid(6);

        rooms[roomId] = {
            p1: socket.id,
            p2: null,
            p1Choice: null,
            p2Choice: null
        };
        socket.join(roomId);
        socket.emit('newGame', {roomId});
    });

    socket.on("joinGame", ({ roomId }) => {
        const room = rooms[roomId];
        if (!room) return;

        if (!room.p2) {
            room.p2 = socket.id;
            socket.join(roomId);

            io.to(roomId).emit("playersConnected", {});
        }
    });

    socket.on("p1Choice", (data) => {
        const room = rooms[data.roomId];
        room.p1Choice = data.choice;

        socket.to(data.roomId).emit("p1Choice", { choice: data.choice });

        if (room.p2Choice) declareWinner(data.roomId);
    });

    socket.on("p2Choice", (data) => {
        const room = rooms[data.roomId];
        room.p2Choice = data.choice;

        socket.to(data.roomId).emit("p2Choice", { choice: data.choice });

        if (room.p1Choice) declareWinner(data.roomId);
    });


    socket.on('disconnect', (reason) => {
        console.log('user disconnected');
    });
});

//backend ticker
setInterval(() => {
    for (const id in backEndProjectiles) {
        backEndProjectiles[id].x += backEndProjectiles[id].velocity.x;
        backEndProjectiles[id].y += backEndProjectiles[id].velocity.y;

        const PROJECTILE_RADIUS = 5;
        if (backEndProjectiles[id].x - PROJECTILE_RADIUS >= backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.width ||
            backEndProjectiles[id].x + PROJECTILE_RADIUS <= 0 ||
            backEndProjectiles[id].y - PROJECTILE_RADIUS >= backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.height ||
            backEndProjectiles[id].y + PROJECTILE_RADIUS <= 0) {
            delete backEndProjectiles[id];
            continue;
        }

        for (const playerId in backEndPlayers) {
            const backEndPlayer = backEndPlayers[playerId];
            const DISTANCE = Math.hypot(backEndProjectiles[id].x - backEndPlayer.x, backEndProjectiles[id].y - backEndPlayer.y);

            // collision detections between player and projectiles
            if (DISTANCE < PROJECTILE_RADIUS + backEndPlayer.radius && backEndProjectiles[id].playerId !== playerId) {
                if (backEndPlayers[backEndProjectiles[id].playerId]) backEndPlayers[backEndProjectiles[id].playerId].score++;

                delete backEndProjectiles[id];
                delete backEndPlayers[playerId];
                break;
            }
        }
    }

    io.emit('updateProjectiles', backEndProjectiles);
    io.emit('updatePlayers', backEndPlayers);
}, 15);


// ROCK PAPER SCISSORS
function makeid(length) {
    let result = '';
    const chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += chars .charAt(Math.floor(Math.random() * chars .length));
    }
    return result;
}

function declareWinner(roomId) {
    const { p1Choice, p2Choice } = rooms[roomId];
    let winner = "d";

    if (p1Choice !== p2Choice) {
        if (p1Choice === "rock"     && p2Choice === "scissors") winner = "p1";
        else if (p1Choice === "paper"    && p2Choice === "rock") winner = "p1";
        else if (p1Choice === "scissors" && p2Choice === "paper") winner = "p1";
        else winner = "p2";
    }
    io.sockets.to(roomId).emit("result", {winner});
    rooms[roomId].p1Choice = null;
    rooms[roomId].p2Choice = null;
}

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
