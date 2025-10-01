let SELECTED_THEME = "diamonds-card";
let IMAGE_PATH = `images/Memory-card/${SELECTED_THEME}/`;
let CARD_BACK_IMAGE = "back.jpg";
let IMAGE_EXTENSION = ".jpg";
let DEFAULT_BACK_IMAGE = "images/Memory-card/diamonds-card/back.jpg";

let errors = 0;
let cardList = [];
let difficulty = "easy";
let timerInterval;
let seconds = 0;
let score = 0;
let preventClick = false;

let cardSet;
const board = [];
let rows = 4;
let columns = 4;
let matches = 0;
let gameOver = false;

let card1Selected = null;
let card2Selected = null;

window.onload = function () {
    document.getElementById("gameStartOverlay").style.display = "flex";
};

function shuffleCards() {
    cardSet = cardList.concat(cardList);
    for (let i = 0; i < cardSet.length; i++) {
        let j = Math.floor(Math.random() * cardSet.length);
        [cardSet[i], cardSet[j]] = [cardSet[j], cardSet[i]];
    }
}

function setDifficulty(level) {
    difficulty = level;
    let cardBoard = document.getElementById("board");

    switch (level) {
        case 'easy':
            cardList = Array.from({ length: 10 }, (_, i) => i + 1);
            rows = 4;
            columns = 5;
            cardBoard.style.maxWidth = "565px";
            break;
        case 'medium':
            cardList = Array.from({ length: 12 }, (_, i) => i + 1);
            rows = 4;
            columns = 6;
            cardBoard.style.maxWidth = "676px";
            break;
        case 'hard':
            cardList = Array.from({ length: 14 }, (_, i) => i + 1);
            rows = 4;
            columns = 7;
            cardBoard.style.maxWidth = "777px";
            break;
    }
}

function startGame() {
    const themeSelect = document.getElementById("themeSelect");
    SELECTED_THEME = themeSelect.value;
    IMAGE_PATH = `images/Memory-card/${SELECTED_THEME}/`;

    const modeSelect = document.getElementById("mode");
    setDifficulty(modeSelect.value || "easy");

    document.getElementById("gameStartOverlay").style.display = "none";
    document.getElementById("board").innerHTML = "";
    board.length = 0;
    matches = 0;

    shuffleCards();

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let cardImg = cardSet.pop();
            row.push(cardImg);

            const card = document.createElement("div");
            card.classList.add("card");
            card.id = `${r}-${c}`;

            const cardInner = document.createElement("div");
            cardInner.classList.add("card-inner");

            const cardFrontDiv = document.createElement("div");
            cardFrontDiv.classList.add("card-front");
            const cardFrontImg = document.createElement("img");
            cardFrontImg.src = `${IMAGE_PATH}${CARD_BACK_IMAGE}`;
            cardFrontImg.onerror = () => cardFrontImg.src = DEFAULT_BACK_IMAGE;
            cardFrontDiv.appendChild(cardFrontImg);

            const cardBackDiv = document.createElement("div");
            cardBackDiv.classList.add("card-back");
            const cardBackImg = document.createElement("img");
            cardBackImg.src = `${IMAGE_PATH}${cardImg}${IMAGE_EXTENSION}`;
            cardBackDiv.appendChild(cardBackImg);

            cardInner.appendChild(cardFrontDiv);
            cardInner.appendChild(cardBackDiv);

            card.appendChild(cardInner);
            card.addEventListener("click", selectCard);

            document.getElementById("board").appendChild(card);
        }
        board.push(row);
    }

    // Show all cards for 5 seconds
    const allCards = document.querySelectorAll(".card");
    allCards.forEach(card => card.classList.add("flipped"));

    setTimeout(hideCards, 5000);
    setTimeout(startTimer, 5000);
}

function hideCards() {
    document.querySelectorAll(".card").forEach(card => {
        card.classList.remove("flipped");
    });
}

function selectCard() {
    if (preventClick || this.classList.contains("flipped")) return;

    const [r, c] = this.id.split("-").map(Number);
    this.classList.add("flipped");

    if (!card1Selected) {
        card1Selected = this;
    } else if (!card2Selected && this !== card1Selected) {
        card2Selected = this;
        preventClick = true;

        setTimeout(() => checkMatch(card1Selected, card2Selected), 800);
    }
}

function checkMatch(card1, card2) {
    const getCardImage = (cardElement) => {
        if (!cardElement || !cardElement.id) return null;
        const [r, c] = cardElement.id.split("-").map(Number);
        return board?.[r]?.[c];
    };

    if (!card1 || !card2) {
        console.warn("One or both cards are missing.");
        preventClick = false;
        return;
    }

    const card1Image = getCardImage(card1);
    const card2Image = getCardImage(card2);

    console.log("Card 1:", card1.id, "Image:", card1Image);
    console.log("Card 2:", card2.id, "Image:", card2Image);

    if (card1Image === card2Image) {
        score += 10;
        matches++;
        card1.removeEventListener("click", selectCard);
        card2.removeEventListener("click", selectCard);

        if (matches === cardList.length) {
            setTimeout(endGame, 800);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
        }, 400);
        errors++;
    }

    document.getElementById("score").textContent = score;
    document.getElementById("errors").textContent = errors;

    card1Selected = null;
    card2Selected = null;
    preventClick = false;
}


function endGame() {
    gameOver = true;
    clearInterval(timerInterval);

    document.getElementById("finalScore").textContent = score;
    document.getElementById("finalTime").textContent = seconds;
    document.getElementById("finalErrors").textContent = errors;

    document.getElementById("gameOverOverlay").style.display = "flex";
}

function restartGame() {
    // Reset all game state
    errors = 0;
    matches = 0;
    gameOver = false;
    score = 0;
    seconds = 0;

    clearInterval(timerInterval);

    card1Selected = null;
    card2Selected = null;
    cardSet = [];
    board.length = 0;

    document.getElementById('timer').textContent = 0;
    document.getElementById('score').textContent = 0;
    document.getElementById('errors').textContent = 0;
    document.getElementById("board").innerHTML = "";
    document.getElementById("gameOverOverlay").style.display = "none";
    document.getElementById("gameStartOverlay").style.display = "none";

    startGame();
}

function startTimer() {
    seconds = 0;
    document.getElementById('timer').textContent = seconds;
    timerInterval = setInterval(() => {
        seconds++;
        document.getElementById('timer').textContent = seconds;
    }, 1000);
}





//=========---------------------==============
//
// let cardContainer = document.createElement("div");
// cardContainer.classList.add("card-container");
//
// let cardInner = document.createElement("div");
// cardInner.classList.add("card-inner");
//
// let front = document.createElement("img");
// front.classList.add("card-face", "front");
// front.src = IMAGE_PATH + cardImg + IMAGE_EXTENSION;
//
// let back = document.createElement("img");
// back.classList.add("card-face", "back");
// back.src = IMAGE_PATH + CARD_BACK_IMAGE;
//
// cardInner.appendChild(front);
// cardInner.appendChild(back);
// cardContainer.appendChild(cardInner);
// cardContainer.id = r.toString() + "-" + c.toString();
// cardContainer.addEventListener("click", selectCard);
//
// document.getElementById("board").appendChild(cardContainer);
//
//
// function hideCards() {
//     const cards = document.querySelectorAll('.card-container');
//     cards.forEach(card => {
//         card.classList.remove('flip');
//     });
// }
//
//
// setTimeout(() => {
//     document.querySelectorAll('.card-container').forEach(card => {
//         card.classList.add('flip');
//     });
// }, 100);
//
//
// function selectCard() {
//     if (preventClick || this.classList.contains("flip")) return;
//
//     const [r, c] = this.id.split("-").map(Number);
//     this.classList.add("flip");
//
//     if (!card1Selected) {
//         card1Selected = this;
//     } else if (!card2Selected && this !== card1Selected) {
//         card2Selected = this;
//         preventClick = true;
//         setTimeout(update, 600);
//     }
// }
//
//
// function update() {
//     const card1ID = card1Selected.id.split("-").map(Number);
//     const card2ID = card2Selected.id.split("-").map(Number);
//
//     const [r1, c1] = card1ID;
//     const [r2, c2] = card2ID;
//
//     const match = board[r1][c1] === board[r2][c2];
//
//     if (match) {
//         score += 10;
//         matches++;
//         if (matches === cardList.length) {
//             gameOver = true;
//             clearInterval(timerInterval);
//             document.getElementById("finalScore").textContent = score;
//             document.getElementById("finalTime").textContent = seconds;
//             document.getElementById("finalErrors").textContent = errors;
//             document.getElementById("gameOverOverlay").style.display = "flex";
//         }
//     } else {
//         errors++;
//         setTimeout(() => {
//             card1Selected.classList.remove("flip");
//             card2Selected.classList.remove("flip");
//         }, 600);
//     }
//
//     document.getElementById('score').textContent = score;
//     document.getElementById("errors").textContent = errors;
//     card1Selected = null;
//     card2Selected = null;
//     preventClick = false;
// }
