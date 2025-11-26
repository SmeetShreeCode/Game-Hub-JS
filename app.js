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
let rooms = {};

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
    // socket.on('createGame', () => {
    //     const roomUniqueId = makeid(6);
    //     // rooms[roomUniqueId] = {};
    //     rooms[roomUniqueId] = {
    //         p1Choice: null,
    //         p2Choice: null,
    //         players: [socket.id]
    //     }
    //     socket.join(roomUniqueId);
    //     socket.emit('newGame', {roomUniqueId});
    // });
    //
    // socket.on('joinGame', (data) => {
    //     if (rooms[data.roomUniqueId] !== undefined) {
    //         socket.join(data.roomUniqueId);
    //         socket.to(data.roomUniqueId).emit('playersConnected', {});
    //         socket.emit('playersConnected');
    //     }
    // });
    //
    // socket.on('p1Choice', (data) => {
    //     let rpsValue = data.rpsValue;
    //     rooms[data.roomUniqueId].p1Choice = rpsValue;
    //     socket.to(data.roomUniqueId).emit('p1Choice', {rpsValue});
    //     if (rooms[data.roomUniqueId].p2Choice !== null) {
    //         declareWinner(data.roomUniqueId);
    //     }
    // });
    //
    // socket.on('p2Choice', (data) => {
    //     let rpsValue = data.rpsValue;
    //     rooms[data.roomUniqueId].p2Choice = rpsValue;
    //     socket.to(data.roomUniqueId).emit('p2Choice', {rpsValue});
    //     if (rooms[data.roomUniqueId].p1Choice !== null) {
    //         declareWinner(data.roomUniqueId);
    //     }
    // });
    // CREATE GAME
    socket.on('createGame', () => {
        const roomUniqueId = makeid(6);

        rooms[roomUniqueId] = {
            p1Choice: null,
            p2Choice: null,
            players: [socket.id]
        };

        socket.join(roomUniqueId);
        socket.emit('newGame', { roomUniqueId });
    });

// JOIN GAME
    socket.on('joinGame', (data) => {
        const room = rooms[data.roomUniqueId];

        if (!room) {
            socket.emit("errorMessage", { message: "Room does not exist" });
            return;
        }

        room.players.push(socket.id);
        socket.join(data.roomUniqueId);

        socket.to(data.roomUniqueId).emit('playersConnected');
        socket.emit('playersConnected');
    });

// PLAYER 1 CHOICE
    socket.on('p1Choice', (data) => {
        const room = rooms[data.roomUniqueId];
        if (!room) return;

        room.p1Choice = data.rpsValue;
        socket.to(data.roomUniqueId).emit("p1Choice", { rpsValue: data.rpsValue });

        if (room.p2Choice !== null) declareWinner(data.roomUniqueId);
    });

// PLAYER 2 CHOICE
    socket.on('p2Choice', (data) => {
        const room = rooms[data.roomUniqueId];
        if (!room) return;

        room.p2Choice = data.rpsValue;
        socket.to(data.roomUniqueId).emit("p2Choice", { rpsValue: data.rpsValue });

        if (room.p1Choice !== null) declareWinner(data.roomUniqueId);
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
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function declareWinner(roomUniqueId) {
    let p1Choice = rooms[roomUniqueId].p1Choice;
    let p2Choice = rooms[roomUniqueId].p2Choice;
    let winner = null;

    if (p1Choice === p2Choice) {
        winner = "d";
    } else if (p1Choice === "Paper") {
        if (p2Choice === "Scissor") winner = "p2";
        else winner = "p1";
    } else if (p1Choice === "Rock") {
        if (p2Choice === "Paper") winner = "p2";
        else winner = "p1";
    } else if (p1Choice === "Scissor") {
        if (p2Choice === "Rock") winner = "p2";
        else winner = "p1";
    }
    io.sockets.to(roomUniqueId).emit("result", {winner});
    rooms[roomUniqueId].p1Choice = null;
    rooms[roomUniqueId].p2Choice = null;
}

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
