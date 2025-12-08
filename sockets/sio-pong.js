module.exports = function (pong) {

    const rooms = {};
    let randomQueue = null;

    // Socket.IO connection
    pong.on('connection', (socket) => {
        console.log('a user connected to the Pong');

        socket.on('createGame', () => {
            const roomId = makeId(6);

            rooms[roomId] = {
                p1: socket.id,
                p2: null,
            };
            socket.join(roomId);
            socket.emit('newGame', {roomId});
        });

        socket.on("joinGame", ({roomId}) => {
            console.log("Attempting to join room:", roomId);
            const room = rooms[roomId];
            if (!room) {
                socket.emit("joinGameError", {message: "Room not found. Please check the room code."});
                return;
            }

            if (room.p2) {
                socket.emit("joinGameError", {message: "Room is full. This room already has 2 players."});
                return;
            }

            room.p2 = socket.id;
            socket.join(roomId);

            // Emit to both players with their player info
            const socket1 = pong.sockets.get(room.p1);
            const socket2 = pong.sockets.get(room.p2);

            if (socket1) socket1.emit("playersConnected", {roomId, isPlayer1: true});
            if (socket2) socket2.emit("playersConnected", {roomId, isPlayer1: false});
        });

        socket.on("playerJoined", ({isPlayer1}) => {
            isOnline = true;
            playerRole = isPlayer1 ? "host" : "guest";

            document.getElementById("onlineFriendOptionScreen").classList.add("hidden");
            setTimeout(() => {
                game.startOnlineGame(); // NEW METHOD
            }, 300);
        });


        socket.on("joinRoom", ({roomId}) => {
            if (!rooms[roomId]) {
                rooms[roomId] = {
                    players: [],
                    ball: {x: 400, y: 200, dx: 4, dy: 4, radius: 10},
                    paddles: {p1: 200, p2: 200},
                    score: {p1: 0, p2: 0},
                    interval: null
                };
            }

            if (rooms[roomId].players.length < 2) {
                rooms[roomId].players.push(socket.id);
                socket.join(roomId);

                const isPlayer1 = rooms[roomId].players[0] === socket.id;

                io.to(roomId).emit("playerJoined", {isPlayer1});

                if (rooms[roomId].players.length === 2) {
                    startGame(roomId);
                }
            }
        });


        socket.on("joinRandom", () => {
            if (!randomQueue) {
                randomQueue = socket.id;
                socket.emit("waitingForRandom");
            } else {
                const player1 = randomQueue;
                const player2 = socket.id;
                randomQueue = null;

                const roomId = makeId(6);
                rooms[roomId] = {p1: player1, p2: player2};

                const socket1 = pong.sockets.get(player1);
                const socket2 = pong.sockets.get(player2);

                if (socket1) socket1.join(roomId);
                if (socket2) socket2.join(roomId);

                // Emit to both players with their player info
                if (socket1) socket1.emit("playersConnected", {roomId, isPlayer1: true});
                if (socket2) socket2.emit("playersConnected", {roomId, isPlayer1: false});
            }
        });

        socket.on("makeMove", ({roomId, col}) => {
            if (roomId && rooms[roomId]) {
                socket.to(roomId).emit("opponentMove", {col});
            }
        });

        socket.on("movePaddle", ({roomId, y}) => {
            const room = rooms[roomId];
            if (!room) return;

            const playerIndex = room.players.indexOf(socket.id);

            if (playerIndex === 0) room.paddles.p1 = y;
            if (playerIndex === 1) room.paddles.p2 = y;
        });

        socket.on('disconnect', (reason) => {
            console.log('user disconnected to the pong');
            console.log(reason);

            if (randomQueue === socket.id) {
                randomQueue = null;
            }

            // Inform opponent if in room
            for (const id in rooms) {
                const r = rooms[id];
                if (r.p1 === socket.id || r.p2 === socket.id) {
                    pong.to(id).emit("opponentLeft");
                    delete rooms[id];
                }
            }
        });
    });

    function makeId(length) {
        let result = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

};
