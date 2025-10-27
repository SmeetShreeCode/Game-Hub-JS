const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const miniMap = document.getElementById('mini-map');
const miniCtx = miniMap.getContext('2d');
const gridSize = 30;
const tileSize = canvas.width / gridSize;
const miniTileSize = miniMap.width / gridSize;

let players = [
    { x: 15, y: 15, health: 100, gold: 0, speed: 1, attack: 10, tilesOwned: 1, color: '#4CAF50', id: 1 }
];
let enemies = [];
let grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0)); // 0: neutral, 1: p1, 2: p2, 3+: enemies
let powerUps = []; // {x, y, type: 'gold' or 'health'}
let keys = {};
let lastMoveTime = 0;
let multiplayer = false;

// Initialize game
function initGame() {
    grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    players = [{ x: 15, y: 15, health: 100, gold: 0, speed: 1, attack: 10, tilesOwned: 1, color: '#4CAF50', id: 1 }];
    if (multiplayer) {
        players.push({ x: 14, y: 14, health: 100, gold: 0, speed: 1, attack: 10, tilesOwned: 1, color: '#2196F3', id: 2 });
        grid[players[1].y][players[1].x] = 2;
        document.getElementById('p2-stats').hidden = false;
    } else {
        document.getElementById('p2-stats').hidden = true;
    }
    grid[players[0].y][players[0].x] = 1;
    enemies = [];
    for (let i = 0; i < 10; i++) {
        const x = Math.floor(Math.random() * gridSize);
        const y = Math.floor(Math.random() * gridSize);
        if (grid[y][x] === 0) {
            enemies.push({ x, y, health: 100, gold: 0, speed: 1, attack: 10, id: 3 + i, color: '#f44336' });
            grid[y][x] = 3 + i;
        }
    }
    powerUps = [];
    for (let i = 0; i < 5; i++) {
        powerUps.push({ x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize), type: Math.random() > 0.5 ? 'gold' : 'health' });
    }
    updateUI();
    updateLeaderboard();
}

// Draw main canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw grid
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            let color = '#333'; // Neutral
            if (grid[y][x] === 1) color = players[0].color;
            else if (grid[y][x] === 2 && multiplayer) color = players[1].color;
            else if (grid[y][x] > 2) color = '#f44336';
            ctx.fillStyle = color;
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            ctx.strokeStyle = '#555';
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
    // Draw power-ups
    powerUps.forEach(pu => {
        ctx.fillStyle = pu.type === 'gold' ? '#FFD700' : '#FF5722';
        ctx.fillRect(pu.x * tileSize + 5, pu.y * tileSize + 5, tileSize - 10, tileSize - 10);
    });
    // Draw players and enemies
    [...players, ...enemies].forEach(entity => {
        ctx.fillStyle = entity.color;
        ctx.fillRect(entity.x * tileSize + 2, entity.y * tileSize + 2, tileSize - 4, tileSize - 4);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText(entity.health, entity.x * tileSize + 5, entity.y * tileSize + 15);
    });
}

// Draw mini-map
function drawMiniMap() {
    miniCtx.clearRect(0, 0, miniMap.width, miniMap.height);
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            let color = '#333';
            if (grid[y][x] === 1) color = players[0].color;
            else if (grid[y][x] === 2 && multiplayer) color = players[1].color;
            else if (grid[y][x] > 2) color = '#f44336';
            miniCtx.fillStyle = color;
            miniCtx.fillRect(x * miniTileSize, y * miniTileSize, miniTileSize, miniTileSize);
        }
    }
}

// Move player
function movePlayer(playerIndex, dx, dy) {
    const player = players[playerIndex];
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
        const target = grid[newY][newX];
        let captured = false;
        if (target === 0) {
            grid[newY][newX] = player.id;
            player.tilesOwned++;
            player.gold += 10;
            captured = true;
        } else if (target !== player.id) {
            if (target === 1 || target === 2) {
                // Attack other player
                const otherPlayer = players.find(p => p.id === target);
                if (otherPlayer) {
                    otherPlayer.health -= player.attack;
                    player.health -= otherPlayer.attack;
                    document.getElementById('attack-sound').play();
                }
            } else {
                // Attack enemy
                const enemy = enemies.find(e => e.id === target);
                if (enemy) {
                    enemy.health -= player.attack;
                    player.health -= enemy.attack;
                    if (enemy.health <= 0) {
                        grid[newY][newX] = player.id;
                        player.tilesOwned++;
                        player.gold += enemy.gold;
                        enemies = enemies.filter(e => e !== enemy);
                    }
                    document.getElementById('attack-sound').play();
                }
            }
        }
        // Check power-ups
        const pu = powerUps.find(p => p.x === newX && p.y === newY);
        if (pu) {
            if (pu.type === 'gold') player.gold += 20;
            else player.health = Math.min(100, player.health + 30);
            powerUps = powerUps.filter(p => p !== pu);
        }
        player.x = newX;
        player.y = newY;
        if (captured) document.getElementById('capture-sound').play();
        else document.getElementById('move-sound').play();
        updateUI();
        checkWinLose();
    }
}

// AI for enemies
function moveEnemies() {
    enemies.forEach(enemy => {
        // Simple AI: move towards nearest player or random
        let dx = 0, dy = 0;
        const target = players[Math.floor(Math.random() * players.length)];
        if (target.x > enemy.x) dx = 1;
        else if (target.x < enemy.x) dx = -1;
        if (target.y > enemy.y) dy = 1;
        else if (target.y < enemy.y) dy = -1;
        if (dx === 0 && dy === 0) {
            const dirs = [[0,1],[1,0],[0,-1],[-1,0]];
            [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
        }
        const newX = enemy.x + dx;
        const newY = enemy.y + dy;
        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
            const targetTile = grid[newY][newX];
            if (targetTile === 0) {
                grid[enemy.y][enemy.x] = enemy.id;
                grid[newY][newX] = enemy.id;
                enemy.x = newX;
                enemy.y = newY;
                enemy.gold += 5;
            } else if (targetTile === 1 || targetTile === 2) {
                const player = players.find(p => p.id === targetTile);
                if (player) {
                    player.health -= enemy.attack;
                    enemy.health -= player.attack;
                    if (player.health <= 0) {
                        players = players.filter(p => p !== player);
                    }
                }
            }
        }
    });
}

// Update UI
function updateUI() {
    document.getElementById('p1-health').textContent = players[0].health;
    document.getElementById('p1-gold').textContent = players[0].gold;
    document.getElementById('p1-tiles').textContent = players[0].tilesOwned;
    if (multiplayer && players[1]) {
        document.getElementById('p2-health').textContent = players[1].health;
        document.getElementById('p2-gold').textContent = players[1].gold;
        document.getElementById('p2-tiles').textContent = players[1].tilesOwned;
    }
}

// Update leaderboard
function updateLeaderboard() {
    const list = document.getElementById('leader-list');
    list.innerHTML = '';
    [...players, ...enemies].sort((a, b) => b.tilesOwned - a.tilesOwned).forEach(entity => {
        const li = document.createElement('li');
        li.textContent = `${entity.id > 2 ? 'Enemy' : 'Player ' + entity.id}: ${entity.tilesOwned} tiles`;
        list.appendChild(li);
    });
}

// Check win/lose
function checkWinLose() {
    players.forEach(player => {
        if (player.health <= 0) {
            players = players.filter(p => p !== player);
        }
    });
    if (players.length === 0) {
        document.getElementById('winner').textContent = 'Enemies';
        document.getElementById('win-overlay').hidden = false;
        document.getElementById('win-sound').play();
    } else if (enemies.length === 0 || players.some(p => p.tilesOwned >= gridSize * gridSize * 0.6)) {
        const winner = players.find(p => p.tilesOwned >= gridSize * gridSize * 0.6) || players[0];
        document.getElementById('winner').textContent = `Player ${winner.id}`;
        document.getElementById('win-overlay').hidden = false;
        document.getElementById('win-sound').play();
    }
}

// Game loop
function gameLoop() {
    const now = Date.now();
    if (now - lastMoveTime > 1000 / players[0].speed) {
        // Player 1 (WASD)
        if (keys['w']) movePlayer(0, 0, -1);
        if (keys['s']) movePlayer(0, 0, 1);
        if (keys['a']) movePlayer(0, -1, 0);
        if (keys['d']) movePlayer(0, 1, 0);
        // Player 2 (Arrows)
        if (multiplayer && players[1]) {
            if (keys['ArrowUp']) movePlayer(1, 0, -1);
            if (keys['ArrowDown']) movePlayer(1, 0, 1);
            if (keys['ArrowLeft']) movePlayer(1, -1, 0);
            if (keys['ArrowRight']) movePlayer(1, 1, 0);
        }
        moveEnemies();
        lastMoveTime = now;
    }
    draw();
    drawMiniMap();
    updateLeaderboard();
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

document.getElementById('upgrade-speed').addEventListener('click', () => {
    if (players[0].gold >= 50) {
        players[0].gold -= 50;
        players[0].speed++;
        updateUI();
    }
});

document.getElementById('upgrade-attack').addEventListener('click', () => {
    if (players[0].gold >= 50) {
        players[0].gold -= 50;
        players[0].attack += 5;
        updateUI();
    }
});

document.getElementById('upgrade-health').addEventListener('click', () => {
    if (players[0].gold >= 50) {
        players[0].gold -= 50;
        players[0].health = Math.min(100, players[0].health + 20);
        updateUI();
    }
});

document.getElementById('toggle-multiplayer').addEventListener('click', () => {
    multiplayer = !multiplayer;
    restartGame();
});

document.getElementById('restart').addEventListener('click', restartGame);

function restartGame() {
    document.getElementById('win-overlay').hidden = true;
    initGame();
}

// Start game
initGame();
gameLoop();
