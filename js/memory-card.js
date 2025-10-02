const MATCH_CARD_POINT = 10;
const WRONG_MATCH_PENALTY = 0;
const STRIKE_BONUS_POINT =  10;
const THEMES = [
    "diamonds-card",
    "clubs-card",
    "energy-card",
    "pokemon-card",
];

let SELECTED_THEME = "diamonds-card";
let IMAGE_PATH = `images/Memory-card/${SELECTED_THEME}/`;
let CARD_BACK_IMAGE = "back.jpg";
let IMAGE_EXTENSION = ".jpg";
let DEFAULT_BACK_IMAGE = "images/Memory-card/back.jpg";

let errors = 0;
let cardList = [];
let difficulty = "easy";
let timerInterval;
let seconds = 0;
let isPaused = false;
let score = 0;
let preventClick = false;

let cardSet;
const board = [];
let rows = 4;
let columns = 4;
let matches = 0;
let strike = 0;
let gameOver = false;

let card1Selected = null;
let card2Selected = null;

window.onload = function () {
    populateThemeDropdowns();
    document.getElementById("gameStartOverlay").style.display = "flex";
}

function populateThemeDropdowns() {
    const dropdownIds = ["themeSelect", "liveThemeSelect"];

    dropdownIds.forEach(id => {
        const select = document.getElementById(id);
        select.innerHTML = ""; // Clear old options
        THEMES.forEach(theme => {
            const option = document.createElement("option");
            option.value = theme;
            option.textContent = formatThemeName(theme);
            select.appendChild(option);
        });
    });
}

function formatThemeName(theme) {
    return theme.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function shuffleCards() {
    cardSet = cardList.concat(cardList)
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
            cardList.length = 0;
            cardList.push(...Array.from({ length: 10 }, (_, i) => i + 1)); // 10 cards
            rows = 4;
            columns = 5;

            break;
        case 'medium':
            cardList.length = 0;
            cardList.push(...Array.from({ length: 12 }, (_, i) => i + 1)); // 12 cards
            rows = 4;
            columns = 6;

            break;
        case 'hard':
            cardList.length = 0;
            cardList.push(...Array.from({ length: 14 }, (_, i) => i + 1)); // 14 cards
            rows = 4;
            columns = 7;

            break;
    }
    cardBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
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

    updateBestScoreDisplay();
    shuffleCards();
    if (cardSet.length !== rows * columns) {
        alert("Card set not initialized correctly!");
        return;
    }

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
    const allCards = document.querySelectorAll(".card");
    allCards.forEach(card => card.classList.add("flipped"));

    let countdown = 5;
    const countDownElement = document.getElementById("countDown");
    const timerOverlay = document.getElementById("timerOverlay");
    timerOverlay.style.display = "flex";
    countDownElement.textContent = countdown;

    let countdownInterval = setInterval(() => {
        countdown--;
        countDownElement.textContent = countdown;

        if (countdown < 0) {
            clearInterval(countdownInterval);
            timerOverlay.style.display = "none";
            hideCards();
            startTimer();
        }
    }, 1000);
}

function hideCards() {
    document.querySelectorAll(".card").forEach(card => {
        card.classList.remove("flipped");
    });
}

function selectCard() {
    if (preventClick || this.classList.contains("flipped")) return;

    this.classList.add("flipped");

    if (!card1Selected) {
        card1Selected = this;
    } else if (!card2Selected && this !== card1Selected) {
        card2Selected = this;
        preventClick = true;

        setTimeout(() => checkMatch(card1Selected, card2Selected), 600);
    }
}

function checkMatch(card1, card2) {
    const getCardImage = (cardElement) => {
        if (!cardElement || !cardElement.id) return null;
        const [r, c] = cardElement.id.split("-").map(Number);
        return board?.[r]?.[c];
    };

    const card1Image = getCardImage(card1);
    const card2Image = getCardImage(card2);

    if (card1Image === card2Image) {
        strike++;

        if (strike >= 3) score += MATCH_CARD_POINT + STRIKE_BONUS_POINT;
        else score += MATCH_CARD_POINT;
        matches++;
        card1.removeEventListener("click", selectCard);
        card2.removeEventListener("click", selectCard);

        if (matches === cardList.length) {
            endGame();
        }
    } else {
        setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
        }, 400);
        strike = 0;
        errors++;
        if (score !== 0) score -= WRONG_MATCH_PENALTY;
    }
    document.getElementById('score').textContent = score;
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
    saveBestStats();
}

function restartGame() {
    score = 0;
    errors = 0;
    matches = 0;
    seconds = 0;
    gameOver = false;
    card1Selected = null;
    card2Selected = null;
    board.length = 0;
    cardSet = [];
    isPaused = false;
    preventClick = false;

    clearInterval(timerInterval);

    document.getElementById('timer').textContent = '0';
    document.getElementById('score').textContent = '0';
    document.getElementById('errors').textContent = '0';
    document.getElementById("board").innerHTML = "";
    document.getElementById("gameOverOverlay").style.display = "none";
    document.getElementById("gameStartOverlay").style.display = "none";
    document.getElementById("pauseOverlay").style.display = "none";
    document.getElementById("pauseBtn").innerHTML = "⏸";

    updateBestScoreDisplay();
    startGame();
}

function startTimer() {
    if (!gameOver) {
        seconds = 0;
        document.getElementById('timer').textContent = seconds;
        timerInterval = setInterval(() => {
            seconds++;
            document.getElementById('timer').textContent = seconds;
        }, 1000);
    }
}

function pauseGame() {
    if (gameOver || isPaused) return;

    isPaused = true;
    clearInterval(timerInterval);
    preventClick = true;
    document.getElementById("pauseOverlay").style.display = "flex";
    document.getElementById("pauseBtn").innerHTML = "▶";
}

function resumeGame() {
    if (!isPaused) return;

    isPaused = false;
    preventClick = false;
    document.getElementById("pauseOverlay").style.display = "none";
    timerInterval = setInterval(() => {
        seconds++;
        document.getElementById('timer').textContent = seconds;
    }, 1000);

    document.getElementById("pauseBtn").innerHTML = "⏸";
}

function saveBestStats() {
    const theme = SELECTED_THEME;
    const mode = difficulty;

    const scoreKey = `memory-best-score-${theme}-${mode}`;
    const timeKey = `memory-best-time-${theme}-${mode}`;
    const errorKey = `memory-least-errors-${theme}-${mode}`;

    // Best Score
    const bestScore = parseInt(localStorage.getItem(scoreKey) || 0);
    if (score > bestScore) {
        localStorage.setItem(scoreKey, score);
    }

    // Best Time (lower is better)
    const bestTime = parseInt(localStorage.getItem(timeKey)) || Infinity;
    if (seconds < bestTime) {
        localStorage.setItem(timeKey, seconds);
    }

    // Least Errors (lower is better)
    const leastErrors = parseInt(localStorage.getItem(errorKey)) || Infinity;
    if (errors < leastErrors) {
        localStorage.setItem(errorKey, errors);
    }
}

function updateBestScoreDisplay() {
    const theme = SELECTED_THEME;
    const mode = difficulty;

    const scoreKey = `memory-best-score-${theme}-${mode}`;
    const timeKey = `memory-best-time-${theme}-${mode}`;
    const errorKey = `memory-least-errors-${theme}-${mode}`;

    const bestTime = localStorage.getItem(timeKey) || 0;
    const leastErrors = localStorage.getItem(errorKey) || 0;

    document.getElementById("bestScore").textContent = localStorage.getItem(scoreKey) || 0;
    document.getElementById("bestTime").textContent = bestTime === "Infinity" ? "-" : bestTime;
    document.getElementById("leastErrors").textContent = leastErrors === "Infinity" ? "-" : leastErrors;
}

function changeTheme(newTheme) {
    if (confirm("Changing the theme will restart the game. Continue?")) {
        SELECTED_THEME = newTheme;
        IMAGE_PATH = `images/Memory-card/${newTheme}/`;
        document.getElementById("themeSelect").value = newTheme;
        document.getElementById("liveThemeSelect").value = newTheme;
        restartGame();
    } else {
        document.getElementById("liveThemeSelect").value = SELECTED_THEME;
    }
}

function changeMode(newMode) {
    difficulty = newMode;

    // Sync both mode dropdowns
    document.getElementById("mode").value = newMode;
    document.getElementById("liveModeSelect").value = newMode;

    // Restart the game with new difficulty
    restartGame();
}
