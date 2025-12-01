let you;
let youScore = 0;
let opponent;
let opponentScore = 0;

const choices = ["rock", "paper", "scissors"];

window.onload = () => {
    const choiceContainer = document.getElementById("choices"); // ✅ match ID

    choices.forEach(choice => {
        const img = document.createElement("img");
        img.id = choice;
        img.src = `./images/RockPaperScissors/${choice}.png`;
        img.alt = choice;
        img.addEventListener("click", selectChoice);
        choiceContainer.appendChild(img);
    });
};

function selectChoice() {
    you = this.id;
    document.getElementById("your-choice").src = `./images/RockPaperScissors/${you}.png`;

    opponent = choices[Math.floor(Math.random() * 3)];
    document.getElementById("opponent-choice").src = `./images/RockPaperScissors/${opponent}.png`;

    if (you === opponent) {
        youScore += 1;
        opponentScore += 1;
    } else {
        if (you === "rock") {
            if (opponent === "scissors") {
                youScore += 1;
            } else if (opponent === "paper") {
                opponentScore += 1;
            }
        } else if (you === "scissors") {
            if (opponent === "paper") {
                youScore += 1;
            } else if (opponent === "rock") {
                opponentScore += 1;
            }
        } else if (you === "paper") {
            if (opponent === "rock") {
                youScore += 1;
            } else if (opponent === "scissors") {
                opponentScore += 1;
            }
        }
    }
    document.getElementById("your-score").innerText = youScore;
    document.getElementById("opponent-score").innerText = opponentScore;
}


// const socket = io("http://192.168.29.24:3000");
const socket = io("http://192.168.29.24:3000/rps");
let roomId = null;
let isPlayer1 = false;

function createGame() {
    isPlayer1 = true;
    socket.emit("createGame");
}

function joinGame() {
    const id = document.getElementById('roomUniqueId').value.trim();
    if (!id) return;

    roomId = id;
    socket.emit("joinGame", {roomId});
}

socket.on("newGame", ({roomId: id}) => {
    roomId = id;
    document.querySelector('#initial').style.display = 'none';
    document.querySelector('#gameArea').style.display = 'block';
    let copyButton = document.createElement("button");
    copyButton.style.display = 'block';
    copyButton.innerText = 'Copied!';
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(roomId).then(() => {
            console.log('Copied to clipboard successfully!');
        }, (e) => {
            console.error('Could not copy to clipboard!', e);
        });
    });

    document.querySelector('#waitingArea').innerHTML = `Waiting... For Opponent, Please Share Code ${roomId} to join`;
    document.querySelector('#waitingArea').appendChild(copyButton);
});

socket.on("playersConnected", () => {
    document.querySelector('#initial').style.display = 'none';
    document.querySelector('#waitingArea').style.display = 'none';
    document.querySelector('#gameArea').style.display = 'block';
});

socket.on('p1Choice', (data) => {
    if (!isPlayer1) createOpponentChoiceButton(data);
});

socket.on('p2Choice', (data) => {
    if (isPlayer1) createOpponentChoiceButton(data);
});

socket.on('result', (data) => {
    let winnerText = '';
    if (data.winner !== 'd') {
        if (data.winner === 'p1' && isPlayer1) {
            winnerText = 'You WIN!';
        } else if (data.winner === 'p1') {
            winnerText = 'You LOSE!';
        } else if (data.winner === 'p2' && !isPlayer1) {
            winnerText = 'You WIN!';
        } else if (data.winner === 'p2') {
            winnerText = 'You LOSE!';
        }
    } else winnerText = `It's a DRAW....!!!`;

    document.querySelector('#opponentState').style.display = 'none';
    document.querySelector('#opponentButton').style.display = 'block';
    document.querySelector('#winnerArea').innerHTML = winnerText;

});

function sendChoice(choice) {
    const choiceEvent = isPlayer1 ? "p1Choice" : "p2Choice";
    socket.emit(choiceEvent, {
        roomId,
        choice
    });
    let playerChoiceButton = document.createElement("button");
    playerChoiceButton.style.display = 'block';
    playerChoiceButton.innerText = choice;
    document.querySelector('#player1Choice').innerHTML = "";
    document.querySelector('#player1Choice').appendChild(playerChoiceButton);
}

function createOpponentChoiceButton(data) {
    document.querySelector('#opponentState').innerHTML = "Opponent made a Choice...";
    let opponentButton = document.createElement("button");
    opponentButton.id = "opponentButton";
    opponentButton.style.display = 'none';
    opponentButton.innerText = data.choice;
    document.querySelector('#player2Choice').appendChild(opponentButton);
}
