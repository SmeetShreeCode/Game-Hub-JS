const gridSize = 20;
const game = document.getElementById("game");
let cells = [];
let score = 0;

let player = {x: 10, y: 10};
let enemies = [
    {x: 5, y: 5},
    {x: 15, y: 15}
];

let base = new Set();
let trail = new Set();

function createGrid() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = `${x},${y}`;
            game.appendChild(cell);
            cells.push(cell);
        }
    }
    base.add(posKey(player.x, player.y));
}

function posKey(x, y) {
    return `${x},${y}`;
}

function render() {
    cells.forEach(cell => {
        const [x, y] = cell.id.split(',').map(Number);
        const key = posKey(x, y);
        cell.className = "cell"; // reset all

        if (key === posKey(player.x, player.y)) {
            cell.classList.add("player");
        } else if (base.has(key)) {
            cell.classList.add("base");
        } else if (trail.has(key)) {
            cell.classList.add("trail");
        }
    });

    // Draw enemies (add class instead of style for consistency)
    enemies.forEach(enemy => {
        const enemyCell = document.getElementById(posKey(enemy.x, enemy.y));
        if (enemyCell) enemyCell.classList.add("enemy");
    });
}

function move(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX < 0 || newY < 0 || newX >= gridSize || newY >= gridSize) return;

    player.x = newX;
    player.y = newY;

    const key = posKey(player.x, player.y);

    if (!base.has(key)) {
        if (trail.has(key)) {
            alert("💀 You hit your own trail! Game Over.");
            resetGame();
            return;
        }
        trail.add(key);
    } else {
        // ✅ Player returned to base
        // 🎯 Capture trail + enclosed area
        captureEnclosedArea();
        trail.clear();
        updateScore();
    }

    render();
}

function captureEnclosedArea() {
    const visited = new Set();
    const enclosed = new Set();

    // Step 1: Flood fill from all edges
    function floodFill(x, y) {
        const queue = [[x, y]];
        while (queue.length) {
            const [cx, cy] = queue.shift();
            const key = posKey(cx, cy);
            if (visited.has(key)) continue;
            if (base.has(key) || trail.has(key)) continue;

            visited.add(key);

            const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            for (const [dx, dy] of dirs) {
                const nx = cx + dx;
                const ny = cy + dy;
                if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize) {
                    queue.push([nx, ny]);
                }
            }
        }
    }

    // Step 2: Flood fill from all 4 edges to find non-enclosed empty cells
    for (let i = 0; i < gridSize; i++) {
        floodFill(i, 0); // top edge
        floodFill(i, gridSize - 1); // bottom edge
        floodFill(0, i); // left edge
        floodFill(gridSize - 1, i); // right edge
    }

    // Step 3: Convert all non-visited empty spaces to base (they are enclosed)
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const key = posKey(x, y);
            if (!visited.has(key) && !base.has(key)) {
                base.add(key);
                score++;
            }
        }
    }

    // Add trail as base
    for (const t of trail) {
        base.add(t);
        score++;
    }
}


document.addEventListener("keydown", e => {
    switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
            move(0, -1);
            break;
        case "arrowdown":
        case "s":
            move(0, 1);
            break;
        case "arrowleft":
        case "a":
            move(-1, 0);
            break;
        case "arrowright":
        case "d":
            move(1, 0);
            break;
    }
});

function updateScore() {
    document.getElementById("score").textContent = score;
}

function resetGame() {
    player = {x: 10, y: 10};
    base = new Set([posKey(player.x, player.y)]);
    trail = new Set();
    score = 0;

    // Reset enemies to initial positions
    enemies = [
        {x: 5, y: 5},
        {x: 15, y: 15}
    ];

    updateScore();
    render();
}

function moveEnemies() {
    for (let enemy of enemies) {
        const directions = [
            [0, -1], [0, 1], [-1, 0], [1, 0]
        ];
        const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
        const newX = enemy.x + dx;
        const newY = enemy.y + dy;

        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
            enemy.x = newX;
            enemy.y = newY;
        }

        const enemyKey = posKey(enemy.x, enemy.y);
        if (enemyKey === posKey(player.x, player.y) || trail.has(enemyKey)) {
            alert("☠️ You were caught by an enemy!");
            resetGame();
            return;
        }
    }

    render();
}

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener("touchend", (e) => {
    let dx = e.changedTouches[0].clientX - touchStartX;
    let dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) move(1, 0); // swipe right
        else if (dx < -30) move(-1, 0); // swipe left
    } else {
        if (dy > 30) move(0, 1); // swipe down
        else if (dy < -30) move(0, -1); // swipe up
    }
});

// Start game
setInterval(moveEnemies, 1000);
createGrid();
render();
