module.exports = function(connectFour) {

    // Socket.IO connection
    connectFour.on('connection', (socket) => {
        console.log('a user connected to the Connect Four');

        socket.on('disconnect', (reason) => {
            console.log('user disconnected to the Connect Four');
            console.log(reason);
        });
    });
};
