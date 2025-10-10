const CUBE = 4;
const NUMBER = 15;

let tileSize = 100;
let tileArray = Array.from({length: NUMBER}, (_, i) => i + 1).concat();
let emptyIndex = 15;

function handleTileClick(index) {
    if (isAdjacent(index, emptyIndex)) {
        tileArray[emptyIndex] = tileArray[index];
        tileArray[index] = 0;
        emptyIndex = index;
        renderTiles();

        if (isSolved()) {
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
    container.innerHTML = '';
    tileArray.forEach((value, index) => {
        let tile = document.createElement("div");
        tile.className = value === 0 ? 'tile empty' : 'tile';
        tile.textContent = value || '';
        tile.addEventListener('click',() => handleTileClick(index));

        let row = Math.floor(index / CUBE);
        let col = index % CUBE;
        tile.style.top = `${row * tileSize}px`;
        tile.style.left = `${col * tileSize}px`;
        for (let j = 0; j < tileSize; j++) {
            if (value === j+1 && index === j) {
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
    renderTiles();
    document.getElementById('messageOverlay').style.display = 'none';
}

document.getElementById('restart-btn').addEventListener('click', shuffleTiles);

shuffleTiles();