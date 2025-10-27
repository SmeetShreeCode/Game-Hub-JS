const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;
const GRID_SIZE = 50; // Larger grid for real feel
let players = {};
let grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)); // 0: neutral, player IDs for owned

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Assign player
    players[socket.id] = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        health: 100,
        gold: 0,
        speed: 1,
        attack: 10,
        tilesOwned: 1,
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    grid[players[socket.id].y][players[socket.id].x] = socket.id;

    // Send initial state
    socket.emit('init', { grid, players, id: socket.id });

    // Handle movement
    socket.on('move', (data) => {
        const player = players[socket.id];
        const { dx, dy } = data;
        const newX = player.x + dx;
        const newY = player.y + dy;
        if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
            const target = grid[newY][newX];
            if (target === 0) {
                grid[newY][newX] = socket.id;
                player.tilesOwned++;
                player.gold += 10;
            } else if (target !== socket.id) {
                // Attack
                const targetPlayer = players[target];
                if (targetPlayer) {
                    targetPlayer.health -= player.attack;
                    player.health -= targetPlayer.attack;
                    if (targetPlayer.health <= 0) {
                        grid[newY][newX] = socket.id;
                        player.tilesOwned++;
                        player.gold += targetPlayer.gold;
                        delete players[target];
                        io.emit('playerDied', target);
                    }
                }
            }
            player.x = newX;
            player.y = newY;
            io.emit('update', { grid, players });
        }
    });

    // Handle upgrades
    socket.on('upgrade', (type) => {
        const player = players[socket.id];
        if (player.gold >= 50) {
            player.gold -= 50;
            if (type === 'speed') player.speed++;
            else if (type === 'attack') player.attack += 5;
            else if (type === 'health') player.health = Math.min(100, player.health + 20);
            io.emit('update', { grid, players });
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('update', { grid, players });
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));