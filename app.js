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


// NAMESPACES
const orbital = io.of("/orbital");
const rps = io.of("/rps");
const connectFour = io.of("/connectFour");

// IMPORT SOCKET FILES
require('./sockets/sio-orbitAlliance')(orbital);
require('./sockets/sio-rockPaperScissors')(rps);
require('./sockets/sio-connectFour')(connectFour);

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', (reason) => {
        console.log('user disconnected');
        console.log(reason);
    });
});

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
