let board;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount * tileSize;
const boardHeight = rowCount * tileSize;
let context;
let highScore = parseInt(localStorage.getItem("pacmanHighScore")) || 0;

let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;
let frightenedGhostImage;
let pacmanUpImage;
let pacmanDownImage;
let pacmanLeftImage;
let pacmanRightImage;
let wallImage;
let cherryImage;
let smallCherryImage;
let pacmanIcon = new Image();
pacmanIcon.src = "./images/PacMan/pacmanRight.png";
const hudHeight = 32;
let levelStarting = true;
let readyTimeout = null;
let teleportCooldown = 0;

const maps = [tileMap1, tileMap2, tileMap3, tileMap4, tileMap5, tileMap6, tileMap7];
let currentLevel = 0;
const walls = new Set();
const foods = new Set();
const ghosts = new Set();
const cherrys = new Set();
const smallCherrys = new Set();
const tunnels = [];
let pacman;
let ghostMoveCounter = 0;

const directions = ['U', 'D', 'L', 'R'];
let score = 0;
let lives = 3;
let gameOver = false;

window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight + hudHeight;
    context = board.getContext("2d");

    loadImages();
    loadMap();
    for (let ghost of ghosts.values()) {
        const newDirection = directions[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
    }
    update();
    document.addEventListener("keydown", movePacman)
}

function loadImages() {
    wallImage = new Image();
    wallImage.src = "./images/PacMan/wall.png";

    blueGhostImage = new Image();
    blueGhostImage.src = "./images/PacMan/blueGhost.png";
    orangeGhostImage = new Image();
    orangeGhostImage.src = "./images/PacMan/orangeGhost.png";
    pinkGhostImage = new Image();
    pinkGhostImage.src = "./images/PacMan/pinkGhost.png";
    redGhostImage = new Image();
    redGhostImage.src = "./images/PacMan/redGhost.png";
    frightenedGhostImage = new Image();
    frightenedGhostImage.src = "./images/PacMan/scaredGhost.png";

    pacmanUpImage = new Image();
    pacmanUpImage.src = "./images/PacMan/pacmanUp.png";
    pacmanDownImage = new Image();
    pacmanDownImage.src = "./images/PacMan/pacmanDown.png";
    pacmanLeftImage = new Image();
    pacmanLeftImage.src = "./images/PacMan/pacmanLeft.png";
    pacmanRightImage = new Image();
    pacmanRightImage.src = "./images/PacMan/pacmanRight.png";

    cherryImage = new Image();
    cherryImage.src = "./images/PacMan/cherry.png";
    smallCherryImage = new Image();
    smallCherryImage.src = "./images/PacMan/cherry2.png";
}

function loadMap() {
    walls.clear();
    foods.clear();
    ghosts.clear();
    cherrys.clear();
    smallCherrys.clear();
    tunnels.length = 0;
    const tileMap = maps[currentLevel];

    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
            const row = tileMap[r];
            const tileMapChar = row[c];

            const x = c * tileSize;
            const y = r * tileSize;

            if (tileMapChar === 'X') {
                const wall = new Block(wallImage, x, y, tileSize, tileSize);
                walls.add(wall);
            } else if (tileMapChar === 'b') {
                const ghost = new Block(blueGhostImage, x, y, tileSize, tileSize);
                ghost.originalImage = blueGhostImage;
                ghosts.add(ghost);
            } else if (tileMapChar === 'o') {
                const ghost = new Block(orangeGhostImage, x, y, tileSize, tileSize);
                ghost.originalImage = orangeGhostImage;
                ghosts.add(ghost);
            } else if (tileMapChar === 'p') {
                const ghost = new Block(pinkGhostImage, x, y, tileSize, tileSize);
                ghost.originalImage = pinkGhostImage;
                ghosts.add(ghost);
            } else if (tileMapChar === 'r') {
                const ghost = new Block(redGhostImage, x, y, tileSize, tileSize);
                ghost.originalImage = redGhostImage;
                ghosts.add(ghost);
            } else if (tileMapChar === 'P') {
                pacman = new Block(pacmanRightImage, x, y, tileSize, tileSize);
            } else if (tileMapChar === ' ') {
                const food = new Block(null, x + 14, y + 14, 4, 4);
                foods.add(food);
            } else if (tileMapChar === 'O') {
                const tunnel = new Block(null, x, y, tileSize, tileSize);
                tunnels.push(tunnel);
            } else if (tileMapChar === 'C') {
                const cherry = new Block(cherryImage, x, y, tileSize, tileSize);
                cherrys.add(cherry);
            } else if (tileMapChar === 'c') {
                const smallCherry = new Block(null, x + 10, y + 10, 10, 10);
                smallCherrys.add(smallCherry);
            }
        }
    }
    levelStarting = true;
    pacman.velocityX = 0;
    pacman.velocityY = 0;
    for (let ghost of ghosts.values()) {
        ghost.velocityX = 0;
        ghost.velocityY = 0;
    }

    if (readyTimeout) clearTimeout(readyTimeout);
    readyTimeout = setTimeout(() => {
        levelStarting = false;
        for (let ghost of ghosts.values()) {
            const newDirection = directions[Math.floor(Math.random() * 4)];
            ghost.updateDirection(newDirection);
        }
    }, 2000);
}

function update() {
    if (gameOver) {
        context.fillStyle = "yellow";
        context.font = "20px sans-serif";
        let text = (currentLevel >= maps.length) ? "🎉 You Win!" : "Game Over";
        let textWidth = context.measureText(text).width;
        context.fillText(text, (boardWidth - textWidth) / 2, boardHeight / 2);
        context.fillText("Final Score: " + score, boardWidth / 2 - 60, boardHeight / 2 + 30);
        context.fillText("Restart With Press Any Key", boardWidth / 2 - 90, boardHeight / 2 + 60);
        return;
    }
    if (levelStarting) {
        context.fillStyle = "yellow";
        context.font = "20px sans-serif";
        context.fillText("READY!", boardWidth / 2 - 30, boardHeight / 2);
        setTimeout(update, 50);
        return;
    }
    move();
    draw();
    context.fillStyle = "yellow";
    context.font = "16px sans-serif";
    context.fillStyle = "black";
    context.fillRect(0, 0, boardWidth, hudHeight);
    context.fillStyle = "yellow";
    context.font = "16px sans-serif";
    context.fillText("Score: " + score, 10, 20);
    context.fillText("High Score: " + highScore, 100, 20);
    context.fillText("Level: " + (currentLevel + 1), boardWidth / 2 - 30, 20);

    for (let i = 0; i < lives; i++) {
        context.drawImage(pacmanIcon, boardWidth - (i + 1) * (tileSize + 4), 6, tileSize - 6, tileSize - 6);
    }
    setTimeout(update, 50);
}

function draw() {
    context.clearRect(0, 0, boardWidth, boardHeight + hudHeight);
    context.save();
    context.translate(0, hudHeight);

    context.fillStyle = "yellow";
    for (let food of foods.values()) {
        context.fillRect(food.x, food.y, food.width, food.height);
    }
    for (let cheery of cherrys.values()) {
        context.drawImage(cheery.image, cheery.x, cheery.y, cheery.width, cheery.height);
    }
    for (let smallCherry of smallCherrys.values()) {
        context.fillRect(smallCherry.x, smallCherry.y, smallCherry.width, smallCherry.height);
    }
    for (let wall of walls.values()) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }
    context.fillStyle = "gray";
    for (let t of tunnels) {
        context.fillRect(t.x, t.y, t.width, t.height);
    }
    for (let ghost of ghosts.values()) {
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
    }
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);
    context.restore();
}

function move() {
    if (pacman.nextDirection) {
        let tempPacman = new Block(null, pacman.x, pacman.y, pacman.width, pacman.height);
        tempPacman.direction = pacman.nextDirection;
        tempPacman.updateVelocity();

        tempPacman.x += tempPacman.velocityX;
        tempPacman.y += tempPacman.velocityY;

        let blocked = false;
        for (let wall of walls.values()) {
            if (collision(tempPacman, wall)) {
                blocked = true;
                break;
            }
        }

        if (!blocked && Math.abs(pacman.x % tileSize) < 4 && Math.abs(pacman.y % tileSize) < 4) {
            pacman.x = Math.round(pacman.x / tileSize) * tileSize;
            pacman.y = Math.round(pacman.y / tileSize) * tileSize;
            pacman.updateDirection(pacman.nextDirection);
            pacman.image = getPacmanImage(pacman.direction);
            pacman.nextDirection = null;
        }
    }
    if (teleportCooldown > 0) teleportCooldown--;
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    for (let wall of walls.values()) {
        if (collision(pacman, wall)) {
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
    }

    ghostMoveCounter++;
    if (ghostMoveCounter % 10 === 0) { // every 10 frames
        for (let ghost of ghosts.values()) {
            if (!ghost.frightened) {
                chasePacman(ghost);
            }
        }
    }

    for (let ghost of ghosts.values()) {
        if (collision(ghost, pacman)) {
            if (ghost.frightened) {
                ghost.reset();
                ghost.frightened = false;
                ghost.image = ghost.originalImage;
                const newDirection = directions[Math.floor(Math.random() * 4)];
                ghost.updateDirection(newDirection);
                score += 200;
            } else {
                lives -= 1;
                if (lives === 0) {
                    gameOver = true;
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem("pacmanHighScore", highScore);
                    }
                    return;
                }
                resetPosition();
                return;
            }
        }

        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;

        if (ghost.y === tileSize * 9 && ghost.direction !== 'U' && ghost.direction !== 'D') {
            ghost.updateDirection('U');
        }

        for (let wall of walls.values()) {
            if (collision(ghost, wall) || ghost.x <= 0 || ghost.x + ghost.width >= boardWidth) {
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                const newDirection = directions[Math.floor(Math.random() * 4)];
                ghost.updateDirection(newDirection);
                break;
            }
        }

        for (let tunnel of tunnels) {
            if (collision(ghost, tunnel)) {
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                const newDirection = directions[Math.floor(Math.random() * 4)];
                ghost.updateDirection(newDirection);
                break;
            }
        }
    }

    if (teleportCooldown === 0 && tunnels.length > 0) {
        for (let i = 0; i < tunnels.length; i++) {
            let tunnel = tunnels[i];
            if (collision(pacman, tunnel)) {
                let other = tunnels[(i + 1) % tunnels.length];
                pacman.x = other.x + (other.width - pacman.width) / 2;
                pacman.y = other.y + (other.height - pacman.height) / 2;
                // pacman.velocityX = 0;
                // pacman.velocityY = 0;
                teleportCooldown = 15;

                break;
            }
        }
    }

    let foodEaten = null;
    for (let food of foods.values()) {
        if (collision(pacman, food)) {
            foodEaten = food;
            score += 10;
            break;
        }
    }
    if (foodEaten) foods.delete(foodEaten);

    let cherryEaten = null;
    for (let cherry of cherrys.values()) {
        if (collision(pacman, cherry)) {
            cherryEaten = cherry;
            score += 20;
            break;
        }
    }
    if (cherryEaten) {
        cherrys.delete(cherryEaten);
        activateFrightenedMode();
    }


    let smallCherryEaten = null;
    for (let smallCherry of smallCherrys.values()) {
        if (collision(pacman, smallCherry)) {
            smallCherryEaten = smallCherry;
            score += 15;
            break;
        }
    }
    if (smallCherryEaten) smallCherrys.delete(smallCherryEaten);

    if (foods.size === 0 && cherrys.size === 0 && smallCherrys.size === 0) {
        currentLevel++;
        if (currentLevel >= maps.length) {
            gameOver = true;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("pacmanHighScore", highScore);
            }
            context.fillStyle = "yellow";
            context.font = "20px sans-serif";
            context.fillText("🎉 You Win! Final Score: " + score, tileSize * 3, boardHeight / 2);
            return;
        }
        loadMap();
        resetPosition();
    }
}

function activateFrightenedMode() {
    for (let ghost of ghosts.values()) {
        ghost.frightened = true;
        ghost.image = frightenedGhostImage;
    }

    setTimeout(() => {
        for (let ghost of ghosts.values()) {
            ghost.frightened = false;
            ghost.image = ghost.originalImage;
        }
    }, 5000); // 5 seconds
}

function movePacman(e) {
    if (gameOver) {
        currentLevel = 0;
        loadMap();
        resetPosition();
        lives = 3;
        score = 0;
        gameOver = false;
        highScore = parseInt(localStorage.getItem("pacmanHighScore")) || 0;
        update();
        return;
    }
    if (e.code === "ArrowUp" || e.code === "KeyW") {
        pacman.nextDirection = 'U';
    } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        pacman.nextDirection = 'D';
    } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        pacman.nextDirection = 'L';
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        pacman.nextDirection = 'R';
    }

    if (pacman.direction === 'U') {
        pacman.image = pacmanUpImage;
    } else if (pacman.direction === 'D') {
        pacman.image = pacmanDownImage;
    } else if (pacman.direction === 'L') {
        pacman.image = pacmanLeftImage;
    } else if (pacman.direction === 'R') {
        pacman.image = pacmanRightImage;
    }
}

function getPacmanImage(direction) {
    switch (direction) {
        case 'U': return pacmanUpImage;
        case 'D': return pacmanDownImage;
        case 'L': return pacmanLeftImage;
        case 'R': return pacmanRightImage;
    }
}

function collision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function resetPosition() {
    pacman.reset();
    pacman.velocityX = 0;
    pacman.velocityY = 0;
    teleportCooldown = 0;
    for (let ghost of ghosts.values()) {
        ghost.reset();
        const newDirection = directions[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
    }
}

function chasePacman(ghost) {
    const path = getPath(
        { x: Math.floor(ghost.x / tileSize) * tileSize, y: Math.floor(ghost.y / tileSize) * tileSize },
        { x: Math.floor(pacman.x / tileSize) * tileSize, y: Math.floor(pacman.y / tileSize) * tileSize }
    );

    if (path.length > 1) {
        const nextStep = path[1];
        const dx = nextStep.x - ghost.x;
        const dy = nextStep.y - ghost.y;

        if (dx > 0) ghost.updateDirection('R');
        else if (dx < 0) ghost.updateDirection('L');
        else if (dy > 0) ghost.updateDirection('D');
        else if (dy < 0) ghost.updateDirection('U');
    }
}

function getPath(start, end) {
    const openSet = [];
    const closedSet = new Set();
    const cameFrom = new Map();

    function hash(x, y) {
        return `${x},${y}`;
    }

    function heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    openSet.push({
        x: start.x,
        y: start.y,
        g: 0,
        h: heuristic(start.x, start.y, end.x, end.y),
    });

    while (openSet.length > 0) {
        openSet.sort((a, b) => (a.g + a.h) - (b.g + b.h));
        const current = openSet.shift();
        const key = hash(current.x, current.y);
        if (closedSet.has(key)) continue;
        closedSet.add(key);

        if (Math.abs(current.x - end.x) < tileSize && Math.abs(current.y - end.y) < tileSize) {
            let path = [];
            let node = current;
            while (node.parent) {
                path.unshift(node);
                node = node.parent;
            }
            return path;
        }

        const neighbors = [
            { x: current.x + tileSize, y: current.y },
            { x: current.x - tileSize, y: current.y },
            { x: current.x, y: current.y + tileSize },
            { x: current.x, y: current.y - tileSize }
        ];

        for (let neighbor of neighbors) {
            const wallCollision = [...walls].some(w => collision({
                x: neighbor.x,
                y: neighbor.y,
                width: tileSize,
                height: tileSize
            }, w));

            if (wallCollision) continue;

            openSet.push({
                x: neighbor.x,
                y: neighbor.y,
                g: current.g + 1,
                h: heuristic(neighbor.x, neighbor.y, end.x, end.y),
                parent: current
            });
        }
    }

    return [];
}

class Block {
    constructor(image, x, y, width, height) {
        this.image = image;
        this.originalImage = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.startX = x;
        this.startY = y;
        this.direction = 'R';
        this.velocityX = 0;
        this.velocityY = 0;
        this.frightened = false;
    }

    updateDirection(direction) {
        const prevDirection = this.direction;
        this.direction = direction;
        this.updateVelocity();

        // Test new position
        const testX = this.x + this.velocityX;
        const testY = this.y + this.velocityY;

        for (let wall of walls.values()) {
            if (collision({ ...this, x: testX, y: testY }, wall)) {
                this.direction = prevDirection;
                this.updateVelocity();
                return;
            }
        }
    }

    updateVelocity() {
        // const speed = tileSize / (4 - Math.min(currentLevel, 3)); /* Increase Speed each level up*/
        if (this.direction === 'U') {
            this.velocityX = 0;
            this.velocityY = -tileSize / 4; //use -speed;
        } else if (this.direction === 'D') {
            this.velocityX = 0;
            this.velocityY = tileSize / 4; //use speed
        } else if (this.direction === 'L') {
            this.velocityX = -tileSize / 4;
            this.velocityY = 0;
        } else if (this.direction === 'R') {
            this.velocityX = tileSize / 4;
            this.velocityY = 0;
        }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
    }
}

// function setDirection(dir) {
//     if (pacman) {
//         pacman.nextDirection = dir;
//     }
// }
