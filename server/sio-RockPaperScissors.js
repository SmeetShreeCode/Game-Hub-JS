//ROCK PAPER SCISSORS
const rooms = {};

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('a user connected to the RockPaperScissors');

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

    socket.on("joinGame", ({roomId}) => {
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

        socket.to(data.roomId).emit("p1Choice", {choice: data.choice});

        if (room.p2Choice) declareWinner(data.roomId);
    });

    socket.on("p2Choice", (data) => {
        const room = rooms[data.roomId];
        room.p2Choice = data.choice;

        socket.to(data.roomId).emit("p2Choice", {choice: data.choice});

        if (room.p1Choice) declareWinner(data.roomId);
    });


    socket.on('disconnect', (reason) => {
        console.log('user disconnected');
    });
});

// ROCK PAPER SCISSORS
function makeid(length) {
    let result = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function declareWinner(roomId) {
    const {p1Choice, p2Choice} = rooms[roomId];
    let winner = "d";

    if (p1Choice !== p2Choice) {
        if (p1Choice === "rock" && p2Choice === "scissors") winner = "p1";
        else if (p1Choice === "paper" && p2Choice === "rock") winner = "p1";
        else if (p1Choice === "scissors" && p2Choice === "paper") winner = "p1";
        else winner = "p2";
    }
    io.sockets.to(roomId).emit("result", {winner});
    rooms[roomId].p1Choice = null;
    rooms[roomId].p2Choice = null;
}
