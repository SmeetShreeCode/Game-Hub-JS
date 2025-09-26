let candies = ["Blue", "Orange", "Green", "Yellow", "Red", "Purple"];
let board = [];
let rows = 9;
let columns = 9;
let score = 0;

let currTile;
let otherTile;

window.onload = function () {
    startGame();

    window.setInterval(function () {
        crushCandy();
        slideCandy();
        updateTilePositions();
        generateCandy();
    }, 100);
}

function randomCandy() {
    return candies[Math.floor(Math.random() * candies.length)];
}

function startGame() {
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.id = r.toString() + "-" + c.toString();
            tile.src = "./images/Candy-crush/" + randomCandy() + ".png";
            tile.style.top = (r * 60) + "px";
            tile.style.left = (c * 60) + "px";

            tile.addEventListener("dragstart", dragStart);
            tile.addEventListener("dragover", dragOver);
            tile.addEventListener("dragenter", dragEnter);
            tile.addEventListener("dragleave", dragLeave);
            tile.addEventListener("drop", dragDrop);
            tile.addEventListener("dragend", dragEnd);

            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }
}

function dragStart() {
    currTile = this;
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() {

}

function dragDrop() {
    otherTile = this;
}

function dragEnd() {

    if (currTile.src.includes("blank") || otherTile.src.includes("blank")) {
        return;
    }

    let currCoords = currTile.id.split("-");
    let r = parseInt(currCoords[0]);
    let c = parseInt(currCoords[1]);

    let otherCoords = otherTile.id.split("-");
    let r2 = parseInt(otherCoords[0]);
    let c2 = parseInt(otherCoords[1]);

    let moveLeft = c2 === c - 1 && r === r2;
    let moveRight = c2 === c + 1 && r === r2;

    let moveUp = r2 === r - 1 && c === c2;
    let moveDown = r2 === r + 1 && c === c2;

    let isAdjacent = moveLeft || moveRight || moveUp || moveDown;

    if (isAdjacent) {
        let currImg = currTile.src;
        let otherImg = otherTile.src;
        currTile.src = otherImg;
        otherTile.src = currImg;

        let validMove = checkValid();
        if (!validMove) {
            let currImg = currTile.src;
            let otherImg = otherTile.src;
            currTile.src = otherImg;
            otherTile.src = currImg;
        }
    }
    updateTilePositions();
}

function crushCandy() {
    //crushFive();
    crushN(5);
    crushFour();
    crushThree();
    document.getElementById("score").innerText = score;
}

function crushThree() {

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c + 1];
            let candy3 = board[r][c + 2];
            if (candy1.src === candy2.src && candy2.src === candy3.src && !candy1.src.includes("blank")) {
                candy1.src = "./images/Candy-crush/blank.png";
                candy2.src = "./images/Candy-crush/blank.png";
                candy3.src = "./images/Candy-crush/blank.png";
                score += 30;
            }
        }
    }

    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r + 1][c];
            let candy3 = board[r + 2][c];
            if (candy1.src === candy2.src && candy2.src === candy3.src && !candy1.src.includes("blank")) {
                candy1.src = "./images/Candy-crush/blank.png";
                candy2.src = "./images/Candy-crush/blank.png";
                candy3.src = "./images/Candy-crush/blank.png";
                score += 30;
            }
        }
    }
}

function crushFour() {

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 3; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c + 1];
            let candy3 = board[r][c + 2];
            let candy4 = board[r][c + 3];
            if (candy1.src === candy2.src && candy2.src === candy3.src && candy3.src === candy4.src && !candy1.src.includes("blank")) {
                candy1.src = "./images/Candy-crush/blank.png";
                candy2.src = "./images/Candy-crush/blank.png";
                candy3.src = "./images/Candy-crush/blank.png";
                // candy4.src = "./images/Candy-crush/blank.png";
                let src = candy4.src;
                let colorMatch = src.match(/\/([^\/]+)\.png$/);
                if (colorMatch) {
                    let color = colorMatch[1];
                    candy4.src = "./images/Candy-crush/" + color + "-Striped-Horizontal.png";
                }
                score += 40;
            }
        }
    }

    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 3; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r + 1][c];
            let candy3 = board[r + 2][c];
            let candy4 = board[r + 3][c];
            if (candy1.src === candy2.src && candy2.src === candy3.src && candy3.src === candy4.src && !candy1.src.includes("blank")) {
                candy1.src = "./images/Candy-crush/blank.png";
                candy2.src = "./images/Candy-crush/blank.png";
                candy3.src = "./images/Candy-crush/blank.png";
                // candy4.src = "./images/Candy-crush/blank.png";
                let src = candy4.src;
                let colorMatch = src.match(/\/([^\/]+)\.png$/);
                if (colorMatch) {
                    let color = colorMatch[1];
                    candy4.src = "./images/Candy-crush/" + color + "-Striped-Vertical.png";
                }
                score += 40;
            }
        }
    }
}

function checkValid() {

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c + 1];
            let candy3 = board[r][c + 2];
            if (candy1.src === candy2.src && candy2.src === candy3.src && !candy1.src.includes("blank")) {
                return true;
            }
        }
    }


    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r + 1][c];
            let candy3 = board[r + 2][c];
            if (candy1.src === candy2.src && candy2.src === candy3.src && !candy1.src.includes("blank")) {
                return true;
            }
        }
    }
    return false;
}

function slideCandy() {
    for (let c = 0; c < columns; c++) {
        let ind = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            if (!board[r][c].src.includes("blank")) {
                board[ind][c].src = board[r][c].src;
                ind -= 1;
            }
        }

        for (let r = ind; r >= 0; r--) {
            board[r][c].src = "./images/Candy-crush/blank.png";
        }
    }
}

function generateCandy() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c].src.includes("blank")) {
                board[r][c].src = "./images/Candy-crush/" + randomCandy() + ".png";
            }
        }
    }
}

function crushN(n) {
    let matched = false;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c <= columns - n; c++) {
            let candiesMatch = true;
            for (let offset = 1; offset < n; offset++) {
                if (board[r][c].src !== board[r][c + offset].src || board[r][c].src.includes("blank")) {
                    candiesMatch = false;
                    break;
                }
            }
            if (candiesMatch) {
                for (let offset = 0; offset < n; offset++) {
                    board[r][c + offset].src = "./images/Candy-crush/blank.png";
                }
                score += n * 10;
                matched = true;
            }
        }
    }

    for (let c = 0; c < columns; c++) {
        for (let r = 0; r <= rows - n; r++) {
            let candiesMatch = true;
            for (let offset = 1; offset < n; offset++) {
                if (board[r][c].src !== board[r + offset][c].src || board[r][c].src.includes("blank")) {
                    candiesMatch = false;
                    break;
                }
            }
            if (candiesMatch) {
                for (let offset = 0; offset < n; offset++) {
                    board[r + offset][c].src = "./images/Candy-crush/blank.png";
                }
                score += n * 10;
                matched = true;
            }
        }
    }
    return matched;
}

function updateTilePositions() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = board[r][c];
            tile.style.top = (r * 60) + "px";
            tile.style.left = (c * 60) + "px";
        }
    }
}
