const colors = ["#00aaff", "#ff7675", "#f6e58d", "#6ab04c", "#6d55b1", "#00ffc1", "#918b62"];

let history = [];
let redoHistory = []
let currentLevel = 0;

document.addEventListener("DOMContentLoaded", () => {
    const bottles = document.querySelectorAll(".board");
    const message = document.getElementById("message");
    const movesDisplay = document.getElementById("moves");
    const restartBtn = document.getElementById("restart");
    const undoBtn = document.getElementById("undo");
    const redoBtn = document.getElementById("redo");
    const hintBtn = document.getElementById("hint");
    const nextBtn = document.getElementById("next");

    const pourSound = document.getElementById("pour-sound");
    const winSound = document.getElementById("win-sound");

    const maxLayers = 5;
    let moves = 0;
    let selected = null;
    let bottleData = [];

    // ===== INIT GAME =====
    function initGame() {
        message.textContent = "";
        moves = 0;
        history = [];
        selected = null;
        movesDisplay.textContent = moves;
        bottles.forEach(b => b.style.pointerEvents = "auto");

        // random level generation
        const colorCount = 6 + (currentLevel % 2); // harder each level
        bottleData = generateRandomLevel(colorCount, maxLayers);
        renderBottles();
    }

    // ===== EVENT LISTENERS =====
    restartBtn.addEventListener("click", initGame);
    undoBtn.addEventListener("click", undoMove);
    redoBtn.addEventListener("click", redoMove);
    hintBtn.addEventListener("click", showHint);
    nextBtn.addEventListener("click", () => {
        currentLevel++;
        initGame();
    });

    bottles.forEach((bottle, i) => {
        bottle.addEventListener("click", () => handleBottleClick(i));
    });

    // ===== FUNCTIONS =====
    function renderBottles() {
        bottles.forEach((bottle, index) => {
            bottle.innerHTML = "";
            bottle.classList.remove("selected", "hint");

            const layers = bottleData[index] || [];
            const layerHeight = 100 / maxLayers;

            layers.forEach((color, i) => {
                const div = document.createElement("div");
                div.classList.add("layer");
                div.style.height = `${layerHeight}%`;
                div.style.bottom = `${i * layerHeight}%`;
                div.style.backgroundColor = color;
                bottle.appendChild(div);
            });
        });
    }

    function generateRandomLevel(colorCount, layersPerBottle) {
        const usedColors = colors.slice(0, colorCount);
        const allLayers = [];

        usedColors.forEach(c => {
            for (let i = 0; i < layersPerBottle; i++) allLayers.push(c);
        });

        // Shuffle
        for (let i = allLayers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allLayers[i], allLayers[j]] = [allLayers[j], allLayers[i]];
        }

        const bottleCount = colorCount + 2;
        const level = Array.from({ length: bottleCount }, () => []);

        let idx = 0;
        allLayers.forEach(layer => {
            while (level[idx].length >= layersPerBottle) idx = (idx + 1) % colorCount;
            level[idx].push(layer);
            idx = (idx + 1) % colorCount;
        });

        return level;
    }

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
        if (!source.length || target.length === maxLayers) return;

        const color = source[source.length - 1];
        const targetTop = target[target.length - 1];
        if (target.length && targetTop !== color) return;

        let pourCount = 1;
        for (let i = source.length - 2; i >= 0; i--) {
            if (source[i] === color) pourCount++;
            else break;
        }

        const available = maxLayers - target.length;
        const actualPour = Math.min(pourCount, available);

        // Save history for undo
        redoHistory = [];
        history.push(JSON.parse(JSON.stringify(bottleData)));

        for (let i = 0; i < actualPour; i++) target.push(source.pop());
        safePlay(pourSound);

        moves++;
        movesDisplay.textContent = moves;
        renderBottles();
        checkWin();
    }

    function undoMove() {
        if (history.length === 0) return;

        redoHistory.push(JSON.parse(JSON.stringify(bottleData))); // Save for redo
        bottleData = history.pop();
        moves = Math.max(0, moves - 1);
        movesDisplay.textContent = moves;
        renderBottles();
    }

    function redoMove() {
        if (redoHistory.length === 0) return;

        history.push(JSON.parse(JSON.stringify(bottleData))); // Save for undo
        bottleData = redoHistory.pop();
        moves++;
        movesDisplay.textContent = moves;
        renderBottles();
    }


    function showHint() {
        bottles.forEach(b => b.classList.remove("hint"));
        message.textContent = "";

        let bestMove = null;
        let bestScore = -1;

        for (let from = 0; from < bottleData.length; from++) {
            const source = bottleData[from];
            if (!source.length) continue;

            const pourColor = source[source.length - 1];
            let pourCount = 1;

            // Count how many same colors are stacked on top
            for (let i = source.length - 2; i >= 0; i--) {
                if (source[i] === pourColor) pourCount++;
                else break;
            }

            for (let to = 0; to < bottleData.length; to++) {
                if (from === to) continue;

                const target = bottleData[to];
                if (target.length === maxLayers) continue;

                const targetTop = target[target.length - 1];

                // Can only pour into same color or empty
                if (target.length === 0 || targetTop === pourColor) {
                    const space = maxLayers - target.length;
                    const actualPour = Math.min(pourCount, space);

                    // Score system: more poured = better
                    let score = actualPour;

                    // Avoid pointless move: pouring into empty from a bottle that's all same color
                    const allSame = source.every(c => c === pourColor);
                    if (target.length === 0 && allSame && source.length === actualPour) {
                        continue; // Skip useless move
                    }

                    // Boost score if we can complete a bottle
                    if (target.length + actualPour === maxLayers) score += 0.5;

                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { from, to };
                    }
                }
            }
        }

        if (bestMove) {
            bottles[bestMove.from].classList.add("hint");
            bottles[bestMove.to].classList.add("hint");
        } else {
            message.textContent = "❌ No useful moves found!";
        }
    }

    function checkWin() {
        const won = bottleData.every(
            b => b.length === 0 || (b.length === maxLayers && b.every(c => c === b[0]))
        );
        if (won) {
            message.textContent = `🎉 You solved it in ${moves} moves!`;
            safePlay(winSound);
            bottles.forEach(b => (b.style.pointerEvents = "none"));
        }
    }

    function safePlay(sound) {
        try {
            sound.currentTime = 0;
            sound.play().catch(() => {});
        } catch {}
    }

    initGame();
});
