module.exports = function(connectFour) {

    const rooms = {};
    let randomQueue = null;

    // Socket.IO connection
    connectFour.on('connection', (socket) => {
        console.log('a user connected to the Connect Four');

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
            console.log(roomId);
            const room = rooms[roomId];
            if (!room) return;

            if (!room.p2) {
                room.p2 = socket.id;
                socket.join(roomId);

                connectFour.to(roomId).emit("playersConnected", {});
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
                rooms[roomId] = { p1: player1, p2: player2 };

                connectFour.sockets.sockets.get(player1).join(roomId);
                connectFour.sockets.sockets.get(player2).join(roomId);

                connectFour.to(roomId).emit("playersConnected");
            }
        });

        socket.on("makeMove", ({ roomId, col }) => {
            socket.to(roomId).emit("opponentMove", { col });
        });

        socket.on('disconnect', (reason) => {
            console.log('user disconnected to the Connect Four');
            console.log(reason);

            if (randomQueue === socket.id) {
                randomQueue = null;
            }

            // Inform opponent if in room
            for (const id in rooms) {
                const r = rooms[id];
                if (r.p1 === socket.id || r.p2 === socket.id) {
                    connectFour.to(id).emit("opponentLeft");
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
