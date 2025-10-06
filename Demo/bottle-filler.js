document.addEventListener("DOMContentLoaded", () => {
    const bottles = document.querySelectorAll(".board");
    const message = document.getElementById("message");
    const movesDisplay = document.getElementById("moves");
    const restartBtn = document.getElementById("restart");

    // Sound effects
    const pourSound = document.getElementById("pour-sound");
    const winSound = document.getElementById("win-sound");

    const colors = ["#00aaff", "#ff7675", "#f6e58d", "#6ab04c"]; // blue, red, yellow, green
    const maxLayers = 4;
    let moves = 0;
    let selected = null;
    let bottleData = [];

    function initGame() {
        message.textContent = "";
        moves = 0;
        movesDisplay.textContent = moves;
        selected = null;
        bottles.forEach(b => (b.style.pointerEvents = "auto"));

        // Create all layers for random shuffle
        const allLayers = [];
        colors.forEach(color => {
            for (let i = 0; i < maxLayers; i++) {
                allLayers.push(color);
            }
        });

        shuffleArray(allLayers);

        // Distribute layers to bottles (leave last 2 empty)
        bottleData = [[], [], [], []];
        let index = 0;
        for (let i = 0; i < bottleData.length - 2; i++) {
            for (let j = 0; j < maxLayers; j++) {
                bottleData[i].push(allLayers[index++]);
            }
        }

        renderBottles();
    }

    // Fisher–Yates shuffle
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    restartBtn.addEventListener("click", initGame);

    function renderBottles() {
        bottles.forEach((bottle, index) => {
            bottle.innerHTML = "";
            const layers = bottleData[index];
            const layerHeight = 100 / maxLayers;
            layers.forEach((color, i) => {
                const div = document.createElement("div");
                div.classList.add("layer");
                div.style.height = `${layerHeight}%`;
                div.style.bottom = `${i * layerHeight}%`;
                div.style.backgroundColor = color;
                bottle.appendChild(div);
            });
            bottle.classList.remove("selected");
        });
    }

    bottles.forEach((bottle, i) => {
        bottle.addEventListener("click", () => handleBottleClick(i));
    });

    function handleBottleClick(i) {
        if (selected === null) {
            if (bottleData[i].length === 0) return;
            selected = i;
            bottles[i].classList.add("selected");
        } else if (selected === i) {
            bottles[i].classList.remove("selected");
            selected = null;
        } else {
            pour(selected, i);
            bottles[selected].classList.remove("selected");
            selected = null;
        }
    }

    function pour(from, to) {
        const source = bottleData[from];
        const target = bottleData[to];

        if (source.length === 0) return;
        if (target.length === maxLayers) return;

        const pourColor = source[source.length - 1];
        let pourCount = 1;

        // Count top layers of same color
        for (let i = source.length - 2; i >= 0; i--) {
            if (source[i] === pourColor) pourCount++;
            else break;
        }

        const targetTop = target[target.length - 1];
        if (target.length !== 0 && targetTop !== pourColor) return;

        const availableSpace = maxLayers - target.length;
        const actualPour = Math.min(pourCount, availableSpace);

        // Move layers
        for (let i = 0; i < actualPour; i++) {
            target.push(source.pop());
        }

        // Play pour sound
        pourSound.currentTime = 0;
        pourSound.play();

        moves++;
        movesDisplay.textContent = moves;
        renderBottles();
        checkWin();
    }

    function checkWin() {
        const isWin = bottleData.every(
            b => b.length === 0 || (b.length === maxLayers && b.every(c => c === b[0]))
        );
        if (isWin) {
            message.textContent = `🎉 You solved it in ${moves} moves!`;
            winSound.currentTime = 0;
            winSound.play();
            bottles.forEach(b => (b.style.pointerEvents = "none"));
        }
    }

    initGame();
});
