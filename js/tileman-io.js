const gridSize = 30;
const game = document.getElementById("game");
let cells = [];
let score = 0;

let direction = { x: 0, y: 0 };
let isOutsideBase = false;

let player = {
    x: 10,
    y: 10,
};

let enemies = [
    { x: 5, y: 5 }, // chaser
    { x: 25, y: 25 } // random mover
];

let base = new Set();
let trail = new Set();

function posKey(x, y) {
    return `${x},${y}`;
}

function createGrid() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = posKey(x, y);
            game.appendChild(cell);
            cells.push(cell);
        }
    }
    base.add(posKey(player.x, player.y));
}

function render() {
    cells.forEach(cell => {
        const key = cell.id;
        cell.className = "cell";
        if (obstacles.has(key)) {
            cell.classList.add("obstacle");
        } else if (key === posKey(player.x, player.y)) {
            cell.classList.add("player");
        } else if (base.has(key)) {
            cell.classList.add("base");
        } else if (trail.has(key)) {
            cell.classList.add("trail");
        }
    });

    enemies.forEach(enemy => {
        const cell = document.getElementById(posKey(enemy.x, enemy.y));
        if (cell) cell.classList.add("enemy");
    });
}

function movePlayer() {
    const newX = player.x + direction.x;
    const newY = player.y + direction.y;

    if (newX < 0 || newY < 0 || newX >= gridSize || newY >= gridSize) return;

    const fromKey = posKey(player.x, player.y);
    const toKey = posKey(newX, newY);

    if (obstacles.has(toKey)) return;

    const wasOnBase = base.has(fromKey);
    const isOnBase = base.has(toKey);

    player.x = newX;
    player.y = newY;

    if (wasOnBase && !isOnBase) {
        isOutsideBase = true;
        trail.add(fromKey);
    }

    if (!isOnBase) {
        if (trail.has(toKey)) {
            alert("💀 You hit your own trail! Game Over.");
            resetGame();
            return;
        }
        trail.add(toKey);
    } else {
        if (isOutsideBase && trail.size > 0) {
            captureEnclosedArea();
            trail.clear();
            isOutsideBase = false;
            updateScore();
        }
    }

    render();
}

function captureEnclosedArea() {
    const visited = new Set();

    function floodFill(x, y) {
        const queue = [[x, y]];
        while (queue.length) {
            const [cx, cy] = queue.shift();
            const key = posKey(cx, cy);
            if (visited.has(key)) continue;
            if (base.has(key) || trail.has(key)) continue;

            visited.add(key);

            for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                const nx = cx + dx, ny = cy + dy;
                if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize) {
                    queue.push([nx, ny]);
                }
            }
        }
    }

    for (let i = 0; i < gridSize; i++) {
        floodFill(i, 0);
        floodFill(i, gridSize - 1);
        floodFill(0, i);
        floodFill(gridSize - 1, i);
    }

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const key = posKey(x, y);
            if (!visited.has(key) && !base.has(key)) {
                base.add(key);
                score++;
                const cell = document.getElementById(key);
                if (cell) {
                    cell.classList.add("captured");
                    setTimeout(() => cell.classList.remove("captured"), 300);
                }
            }
        }
    }

    for (const t of trail) {
        base.add(t);
        score++;
    }
}

function moveEnemies() {
    enemies.forEach((enemy, i) => {
        let dx = 0, dy = 0;

        if (i === 0) {
            dx = player.x > enemy.x ? 1 : (player.x < enemy.x ? -1 : 0);
            dy = player.y > enemy.y ? 1 : (player.y < enemy.y ? -1 : 0);
        } else {
            const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
            [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
        }

        const newX = enemy.x + dx;
        const newY = enemy.y + dy;
        const key = posKey(newX, newY);

        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize && !base.has(key)) {
            enemy.x = newX;
            enemy.y = newY;
        }

        const enemyKey = posKey(enemy.x, enemy.y);
        if (enemyKey === posKey(player.x, player.y) || trail.has(enemyKey)) {
            alert("☠️ You were caught by an enemy!");
            resetGame();
        }
    });

    render();
}

function updateScore() {
    document.getElementById("score").textContent = `Tiles: ${score}`;
    const percent = ((base.size / (gridSize * gridSize)) * 100).toFixed(1);
    document.getElementById("percent").textContent = `${percent}% Covered`;
}

function resetGame() {
    player = { x: 10, y: 10 };
    base = new Set([posKey(player.x, player.y)]);
    trail = new Set();
    score = 0;
    isOutsideBase = false;
    direction = { x: 0, y: 0 };

    enemies = [
        { x: 5, y: 5 },
        { x: 25, y: 25 }
    ];

    updateScore();
    render();
}

// Handle keyboard direction
document.addEventListener("keydown", e => {
    switch (e.key) {
        case "ArrowUp":
        case "w": direction = { x: 0, y: -1 }; break;
        case "ArrowDown":
        case "s": direction = { x: 0, y: 1 }; break;
        case "ArrowLeft":
        case "a": direction = { x: -1, y: 0 }; break;
        case "ArrowRight":
        case "d": direction = { x: 1, y: 0 }; break;
    }
});

// Optional: add obstacles
let obstacles = new Set();
// Example:
// obstacles.add(posKey(12, 12));

document.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 30 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
        direction = dy > 30 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }
});

// Game Loop
setInterval(() => {
    movePlayer();
}, 150); // Speed

setInterval(moveEnemies, 1200);

// Initialize
createGrid();
render();
updateScore();
