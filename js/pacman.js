let board;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount * tileSize;
const boardHeight = rowCount * tileSize;
let context;

let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;
let pacmanUpImage;
let pacmanDownImage;
let pacmanLeftImage;
let pacmanRightImage;
let wallImage;
let pacmanIcon = new Image();
pacmanIcon.src = "./images/PacMan/pacmanRight.png";
const hudHeight = 32;
let levelStarting = true;
let readyTimeout = null;
let teleportCooldown = 0;

//X = wall, O = skip, P = pac man, ' ' = food
//Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap1 = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "O  X X       X X  O",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "O  X X       X X  O",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX"
];

const tileMap2 = [
    "XXXXXXXXXXXXXXXXXXX",
    "X   X         X   X",
    "X X X XXXXXXX X X X",
    "X X             X X",
    "X X XXX XXX XXX X X",
    "X                 X",
    "XXX XXX  X  XXX XXX",
    "O                 O",
    "XXX X XXrXX XX X XXX",
    "O   b    P    o   O",
    "XXX X XXXXXXX X XXX",
    "O   X    p    X   O",
    "XXX X XXXXXXX X XXX",
    "X                 X",
    "X X XXX XXX XXX X X",
    "X X             X X",
    "X X XXXXX XXXXX X X",
    "X   X   X X   X   X",
    "X XXX XXX XXX XXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX",
];

const tileMap3 = [
    "XXXXXXXXXXXXXXXXXXX",
    "X                 X",
    "X XX XXXXXXXXX XX X",
    "X                 X",
    "X XXXXX  X  XXXXX X",
    "X                 X",
    "XXXXXXX XXX XXXXXXX",
    "O                 O",
    "XXXX X XXrXX X XXXX",
    "O   b    P    o   O",
    "XXXX X XXXXX X XXXX",
    "O   X    p    X   O",
    "XXXX X XXXXX X XXXX",
    "X                 X",
    "X XXXXX  X  XXXXX X",
    "X                 X",
    "X XX XXXXXXXXX XX X",
    "X                 X",
    "X XXXXX XXX XXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX",
];

const tileMap4 = [
    "XXXXXXXXXXXXXXXXXXX",
    "X   X     X     X X",
    "X X X XXX X XXX X X",
    "X X             X X",
    "X X XXX XXX XXX X X",
    "X   X       X   X X",
    "XXX XXXXX XXXXX XXX",
    "O                 O",
    "XXX X XXrXX XX X XXX",
    "O   b    P    o   O",
    "XXX X XXXXXXX X XXX",
    "O   X    p    X   O",
    "XXX X XXXXXXX X XXX",
    "X   X       X   X X",
    "X X XXX XXX XXX X X",
    "X X             X X",
    "X X X XXX XXX X X X",
    "X   X   X X   X   X",
    "X XXXXX X X XXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX"
];

const maps = [tileMap1, tileMap2, tileMap3, tileMap4];
let currentLevel = 0;
const walls = new Set();
const foods = new Set();
const ghosts = new Set();
const tunnels = [];
let pacman;

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
    document.addEventListener("keyup", movePacman)
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

    pacmanUpImage = new Image();
    pacmanUpImage.src = "./images/PacMan/pacmanUp.png";
    pacmanDownImage = new Image();
    pacmanDownImage.src = "./images/PacMan/pacmanDown.png";
    pacmanLeftImage = new Image();
    pacmanLeftImage.src = "./images/PacMan/pacmanLeft.png";
    pacmanRightImage = new Image();
    pacmanRightImage.src = "./images/PacMan/pacmanRight.png";
}

function loadMap() {
    walls.clear();
    foods.clear();
    ghosts.clear();
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
                ghosts.add(ghost);
            } else if (tileMapChar === 'o') {
                const ghost = new Block(orangeGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            } else if (tileMapChar === 'p') {
                const ghost = new Block(pinkGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            } else if (tileMapChar === 'r') {
                const ghost = new Block(redGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            } else if (tileMapChar === 'P') {
                pacman = new Block(pacmanRightImage, x, y, tileSize, tileSize);
            } else if (tileMapChar === ' ') {
                const food = new Block(null, x + 14, y + 14, 4, 4);
                foods.add(food);
            } else if (tileMapChar === 'O') {
                const tunnel = new Block(null, x, y, tileSize, tileSize);
                tunnels.push(tunnel);
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

    context.fillStyle = "white";
    for (let food of foods.values()) {
        context.fillRect(food.x, food.y, food.width, food.height);
    }
    for (let wall of walls.values()) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }
    // (optional) draw tunnels visually — uncomment if you want a visible tunnel area
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

    for (let ghost of ghosts.values()) {
        if (collision(ghost, pacman)) {
            lives -= 1;
            if (lives === 0) {
                gameOver = true;
                return;
            }
            resetPosition();
            return;
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

        for (let tunnel of tunnels.values()) {
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
                pacman.velocityX = 0;
                pacman.velocityY = 0;
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
    if (foodEaten) {
        foods.delete(foodEaten);
    }

    if (foods.size === 0) {
        currentLevel++;
        if (currentLevel >= maps.length) {
            gameOver = true;
            context.fillStyle = "yellow";
            context.font = "20px sans-serif";
            context.fillText("🎉 You Win! Final Score: " + score, tileSize * 3, boardHeight / 2);
            return;
        }
        loadMap();
        resetPosition();
    }
}

function movePacman(e) {
    if (gameOver) {
        currentLevel = 0;
        loadMap();
        resetPosition();
        lives = 3;
        score = 0;
        gameOver = false;
        update();
        return;
    }
    if (e.code === "ArrowUp" || e.code === "KeyW") {
        pacman.updateDirection('U');
    } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        pacman.updateDirection('D');
    } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        pacman.updateDirection('L');
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        pacman.updateDirection('R');
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

class Block {
    constructor(image, x, y, width, height) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.startX = x;
        this.startY = y;

        this.direction = 'R';
        this.velocityX = 0;
        this.velocityY = 0;
    }

    updateDirection(direction) {
        const prevDirection = this.direction;
        this.direction = direction;
        this.updateVelocity();
        this.x += this.velocityX;
        this.y += this.velocityY;

        for (let wall of walls.values()) {
            if (collision(this, wall)) {
                this.x -= this.velocityX;
                this.y -= this.velocityY;
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