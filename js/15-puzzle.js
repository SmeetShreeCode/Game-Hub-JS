const CUBE = 4;
const NUMBER = 15;

let tileSize = 100;
let tileArray = Array.from({length: NUMBER}, (_, i) => i + 1).concat();
let emptyIndex = 15;
let moveCount = 0;
const moveDisplay = document.getElementById('move-count');

let bestMoveDisplay = document.getElementById('best-move');
let bestTimeDisplay = document.getElementById('best-time');

let timer = null;
let timeElapsed = 0;
const timerDisplay = document.getElementById('timer');

function handleTileClick(index) {
    if (isAdjacent(index, emptyIndex)) {
        tileArray[emptyIndex] = tileArray[index];
        tileArray[index] = 0;
        emptyIndex = index;
        moveCount++;
        moveDisplay.textContent = moveCount;
        renderTiles();

        if (isSolved()) {
            stopTimer(false);
            checkAndSetBestScores();
            triggerFireworks();
            document.getElementById('messageOverlay').style.display = 'flex';
        }
    }
}

function isAdjacent(a, b) {
    let rowA = Math.floor(a / CUBE);
    let colA = a % CUBE;
    let rowB = Math.floor(b / CUBE);
    let colB = b % CUBE;

    return (Math.abs(rowA - rowB) === 1 && colA === colB) || (Math.abs(colA - colB) === 1 && rowA === rowB);
}

function renderTiles() {
    let container = document.getElementById("puzzle-container");
    let containerSize = container.offsetWidth;
    tileSize = containerSize / CUBE;
    container.innerHTML = '';
    tileArray.forEach((value, index) => {
        let tile = document.createElement("div");
        tile.className = value === 0 ? 'tile empty' : 'tile';
        tile.textContent = value || '';
        tile.addEventListener('click', () => handleTileClick(index));

        let row = Math.floor(index / CUBE);
        let col = index % CUBE;
        tile.style.top = `${row * tileSize}px`;
        tile.style.left = `${col * tileSize}px`;
        for (let j = 0; j < tileSize; j++) {
            if (value === j + 1 && index === j) {
                tile.classList.add('correct');
            }
        }
        container.appendChild(tile);
    })
}

function isSolved() {
    for (let i = 0; i < 15; i++) {
        if (tileArray[i] !== i + 1) {
            return false;
        }
    }
    return true;
}

function shuffleTiles() {
    let currentEmpty = emptyIndex;
    for (let i = 0; i < 1000; i++) {
        let possibleMoves = [];
        let row = Math.floor(currentEmpty / CUBE);
        let col = currentEmpty % CUBE;

        if (row > 0) possibleMoves.push(currentEmpty - CUBE);
        if (row < 3) possibleMoves.push(currentEmpty + CUBE);
        if (col > 0) possibleMoves.push(currentEmpty - 1);
        if (col < 3) possibleMoves.push(currentEmpty + 1);

        let move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        tileArray[currentEmpty] = tileArray[move];
        tileArray[move] = 0;
        currentEmpty = move;
    }
    emptyIndex = currentEmpty;
    moveCount = 0;
    moveDisplay.textContent = moveCount;
    timeElapsed = 0;
    timerDisplay.textContent = formatTime(0);
    startTimer(true);
    renderTiles();
    document.getElementById('messageOverlay').style.display = 'none';
    document.getElementById('pauseOverlay').style.display = 'none';
}

document.addEventListener('keydown', (e) => {
    let moveIndex = null;
    let row = Math.floor(emptyIndex / CUBE);
    let col = emptyIndex % CUBE;

    switch (e.key) {
        case 'ArrowUp':
            if (row < CUBE - 1) moveIndex = emptyIndex + CUBE;
            break;
        case 'ArrowDown':
            if (row > 0) moveIndex = emptyIndex - CUBE;
            break;
        case 'ArrowLeft':
            if (col < CUBE - 1) moveIndex = emptyIndex + 1;
            break;
        case 'ArrowRight':
            if (col > 0) moveIndex = emptyIndex - 1;
            break;
    }

    if (moveIndex !== null) {
        handleTileClick(moveIndex);
    }
});

function startTimer(reset = true) {
    stopTimer(false);
    if (reset) {
        timeElapsed = 0;
        timerDisplay.textContent = formatTime(0);
    }
    timer = setInterval(() => {
        timeElapsed++;
        timerDisplay.textContent = formatTime(timeElapsed);
    }, 1000);
}


function stopTimer(showOverlay = true) {
    clearInterval(timer);
    if (showOverlay) {
        document.getElementById('pauseOverlay').style.display = 'flex';
    } else {
        document.getElementById('pauseOverlay').style.display = 'none';
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateBestScores() {
    const bestMoves = localStorage.getItem('15-puzzle_bestMoves');
    const bestTime = localStorage.getItem('15-puzzle_bestTime');

    if (bestMoves !== null) bestMoveDisplay.textContent = bestMoves;
    if (bestTime !== null) bestTimeDisplay.textContent = formatTime(Number(bestTime));
}

function checkAndSetBestScores() {
    const bestMoves = Number(localStorage.getItem('15-puzzle_bestMoves') || Infinity);
    const bestTime = Number(localStorage.getItem('15-puzzle_bestTime') || Infinity);

    let newBest = false;

    if (moveCount < bestMoves) {
        localStorage.setItem('15-puzzle_bestMoves', moveCount);
        newBest = true;
    }

    if (timeElapsed < bestTime) {
        localStorage.setItem('15-puzzle_bestTime', timeElapsed);
        newBest = true;
    }

    if (newBest) updateBestScores();
}

function triggerFireworks(particle = 300) {
    const canvas = document.createElement("canvas");
    canvas.id = "fireworks-canvas";
    canvas.style.position = "fixed";
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.zIndex = 9999;
    canvas.style.pointerEvents = "none";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const particles = [];

    for (let i = 0; i < particle; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            angle: Math.random() * 2 * Math.PI,
            speed: Math.random() * 5 + 5,
            radius: Math.random() * 3 + 5,
            life: 1,
            color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            const dx = Math.cos(p.angle) * p.speed;
            const dy = Math.sin(p.angle) * p.speed;
            p.x += dx;
            p.y += dy;
            p.life -= 0.02;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fill();
        });

        ctx.globalAlpha = 1;

        if (particles.some(p => p.life > 0)) {
            requestAnimationFrame(animate);
        } else {
            canvas.remove();
        }
    }

    animate();
}

document.getElementById('restart-btn').addEventListener('click', shuffleTiles);

updateBestScores();
shuffleTiles();