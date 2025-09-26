let board;
let score = 0;
const rows = 4;
const columns = 4;
let highScore = parseInt(localStorage.getItem("2048-highScore")) || 0;
let gameOver = false;

window.onload = function () {
    setGame();
}

function setGame() {
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ]
    // board = [
    //     [2, 2, 2, 2],
    //     [2, 2, 2, 2],
    //     [4, 4, 8, 8],
    //     [4, 4, 8, 8],
    // ]
    document.getElementById("highScore").innerText = highScore;

    for (let r = 0; r < rows ; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            let num = board[r][c];
            updateTile(tile, num);
            document.getElementById("board").append(tile);

        }
    }
    setTwo();
    setTwo();
}

function hasEmptyTile() {
    for (let r = 0; r < rows; r++) {
        if (!board[r]) continue;
        for (let c = 0; c < columns; c++) {
            if (board[r][c] === 0) {
                return true;
            }
        }
    }
    return false;
}

function setTwo() {
    if (!hasEmptyTile()) {
        return;
    }

    let found = false;
    while (!found) {
        let r = Math.floor((Math.random() * rows));
        let c = Math.floor((Math.random() * columns));

        if (board[r][c] === 0) {
            board[r][c] = 2;
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            tile.innerText = "2";
            tile.classList.add("x2");
            found = true;
        }
    }
}

function updateTile(tile, num) {
    tile.innerText = "";
    tile.classList.value = "";
    tile.classList.add("tile");
    if (num > 0) {
        tile.innerText = num;
        if (num <= 4096) {
            tile.classList.add("x"+num.toString());
        }else {
            tile.classList.add("x8192");
        }
    }
}

document.addEventListener("keyup", (e) => {
    if (gameOver) return;

    let moved = false;
    if (e.code === "ArrowLeft") {
        slideLeft();
        moved = true;
    }else if (e.code === "ArrowRight") {
        slideRight();
        moved = true;
    }else if (e.code === "ArrowUp") {
        slideUp();
        moved = true;
    }else if (e.code === "ArrowDown") {
        slideDown();
        moved = true;
    }
    if (moved) {
        setTwo();
        document.getElementById("score").innerHTML = score;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("2048-highScore", highScore); // ✅ correct
            document.getElementById("highScore").innerText = highScore;
        }
        checkWin();
    }
    if (isGameOver()) {
        gameOver = true;
        document.getElementById("gameOverOverlay").style.display = "flex";
    }
});

function filterZero(row) {
    return row.filter(num => num !== 0);
}

function slide(row) {
    row = filterZero(row);

    for (let i = 0; i < row.length; i++) {
        if (row[i] === row[i+1]) {
            row[i] *= 2;
            row[i+1] = 0;
            score += row[i];
        }
    }
    row = filterZero(row);

    while (row.length < columns) {
        row.push(0);
    }
    return row;
}

function slideLeft() {
    for (let r = 0; r < rows; r++) {
        let row = board[r];
        row = slide(row);
        board[r] = row;

        for (let c = 0; c < columns; c++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideRight() {
    for (let r = 0; r < rows; r++) {
        let row = board[r];
        row.reverse();
        row = slide(row);
        row.reverse();
        board[r] = row;

        for (let c = 0; c < columns; c++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideUp() {
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row = slide(row);
        // board[0][c] = row[0];
        // board[1][c] = row[1];
        // board[2][c] = row[2];
        // board[3][c] = row[3];
        for (let r = 0; r < rows; r++) {
            board[r][c] = row[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideDown() {
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row.reverse();
        row = slide(row);
        row.reverse();
        // board[0][c] = row[0];
        // board[1][c] = row[1];
        // board[2][c] = row[2];
        // board[3][c] = row[3];
        for (let r = 0; r < rows; r++) {
            board[r][c] = row[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function isGameOver() {
    if (!board || board.length !== rows) return false;
    if (hasEmptyTile()) return false;

    // Check for possible moves
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let current = board[r][c];

            // Check right
            if (c < columns - 1 && board[r][c + 1] === current) return false;
            // Check down
            if (r < rows - 1 && board[r + 1][c] === current) return false;
        }
    }

    return true; // No moves left
}

function restartGame() {
    score = 0;
    gameOver = false;
    document.getElementById("score").innerHTML = score;
    document.getElementById("gameOverOverlay").style.display = "none";

    // Clear board UI
    document.getElementById("board").innerHTML = "";

    setGame();
}

function checkWin() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] === 2048) {
                alert("🎉 You reached 2048! Keep going?");
                return;
            }
        }
    }
}
