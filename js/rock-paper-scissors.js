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
        img.style.cursor = "pointer";
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
    }else {
        if (you === "rock") {
            if (opponent === "scissors") {
                youScore += 1;
            }else if (opponent === "paper") {
                opponentScore += 1;
            }
        }else if (you === "scissors") {
            if (opponent === "paper") {
                youScore += 1;
            }else if (opponent === "rock") {
                opponentScore += 1;
            }
        }else if (you === "paper") {
            if (opponent === "rock") {
                youScore += 1;
            }else if (opponent === "scissors") {
                opponentScore += 1;
            }
        }
    }
    document.getElementById("your-score").innerText = youScore;
    document.getElementById("opponent-score").innerText = opponentScore;
}