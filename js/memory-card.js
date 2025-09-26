let SELECTED_THEME = "diamonds-card";
let IMAGE_PATH = `images/Memory-card/${SELECTED_THEME}/`;
let CARD_BACK_IMAGE = "back.jpg";
let IMAGE_EXTENSION = ".jpg";

let errors = 0;
let cardList = [];
let difficulty = "easy";

let cardSet;
const board = [];
let rows = 4;
let columns = 4;
let matches = 0;
let gameOver = false;

let card1Selected;
let card2Selected;

window.onload = function () {
    document.body.style.backgroundImage = `url("../images/Memory-card/${SELECTED_THEME}/backgroundImg.jpg")`;
    document.getElementById("gameStartOverlay").style.display = "flex";
}

function shuffleCards() {
    cardSet = cardList.concat(cardList)
    for (let i = 0; i < cardSet.length; i++) {
        let j = Math.floor(Math.random() * cardSet.length);
        let temp = cardSet[i];
        cardSet[i] = cardSet[j];
        cardSet[j] = temp;
    }
}

function setDifficulty(level) {
    difficulty = level;
    let cardBoard = document.getElementById("board");

    switch (level) {
        case 'easy':
            cardList.length = 0;
            cardList.push(...Array.from({ length: 10 }, (_, i) => i + 1)); // 12 cards
            rows = 4;
            columns = 5;
            break;
        case 'medium':
            cardList.length = 0;
            cardList.push(...Array.from({ length: 12 }, (_, i) => i + 1)); // 12 cards
            rows = 4;
            columns = 6;
            cardBoard.style.height = "800px";
            cardBoard.style.width = "480px";
            break;
        case 'hard':
            cardList.length = 0;
            cardList.push(...Array.from({ length: 14 }, (_, i) => i + 1)); // 14 cards
            rows = 4;
            columns = 7;
            cardBoard.style.height = "800px";
            cardBoard.style.width = "480px";
            break;
    }
}

function startGame() {
    const select = document.getElementById("themeSelect");
    SELECTED_THEME = select.value;
    IMAGE_PATH = `images/Memory-card/${SELECTED_THEME}/`;
    const mode = document.getElementById("mode");
    setDifficulty(mode.value || "easy");

    document.body.style.backgroundImage = `url("../images/Memory-card/${SELECTED_THEME}/backgroundImg.jpg")`;
    document.getElementById("gameStartOverlay").style.display = "none";
    board.length = 0;
    document.getElementById("board").innerHTML = "";

    shuffleCards();
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let cardImg = cardSet.pop();
            row.push(cardImg);

            let card = document.createElement("img");
            card.id = r.toString() + "-" + c.toString();
            card.src = IMAGE_PATH + cardImg + IMAGE_EXTENSION;
            card.classList.add("card");
            card.addEventListener("click", selectCard)
            document.getElementById("board").append(card);
        }
        board.push(row);
    }
    setTimeout(hideCards, 5000);
}

function hideCards() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let card = document.getElementById(r.toString() + "-" + c.toString());
            card.src = IMAGE_PATH + CARD_BACK_IMAGE;
        }
    }
}

function selectCard() {
    if (this.src.includes("back")) {
        if (!card1Selected) {
            card1Selected = this;
            let coords = card1Selected.id.split("-");
            let r = parseInt(coords[0]);
            let c = parseInt(coords[1]);

            card1Selected.src = IMAGE_PATH + board[r][c] + IMAGE_EXTENSION;
        } else if (!card2Selected && this !== card1Selected) {
            card2Selected = this;
            let coords = card2Selected.id.split("-");
            let r = parseInt(coords[0]);
            let c = parseInt(coords[1]);

            card2Selected.src = IMAGE_PATH + board[r][c] + IMAGE_EXTENSION;
            setTimeout(update, 1000)
        }
    }
}

function update() {
    if (card1Selected.src === card2Selected.src) {
        matches += 1;
        if (matches === cardList.length) {
            gameOver = true;
            document.getElementById("gameOverOverlay").style.display = "flex";
        }
    } else {
        card1Selected.src = IMAGE_PATH + CARD_BACK_IMAGE;
        card2Selected.src = IMAGE_PATH + CARD_BACK_IMAGE;
        errors += 1;
        document.getElementById("errors").innerText = errors;
    }

    card1Selected = null;
    card2Selected = null;
}

function restartGame() {
    errors = 0;
    matches = 0;
    gameOver = false;
    board.length = 0;
    card1Selected = null;
    card2Selected = null;
    cardSet = [];

    document.getElementById("errors").innerText = errors;
    document.getElementById("board").innerHTML = "";
    document.getElementById("gameOverOverlay").style.display = "none";
    document.getElementById("gameStartOverlay").style.display = "none";

    shuffleCards();
    startGame();
}
