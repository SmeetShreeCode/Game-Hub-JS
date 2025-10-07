const BASE_COLORS = [
    "#00aaff", "#ff7675", "#f6e58d", "#6ab04c",
    "#6d55b1", "#00ffc1", "#918b62", "#ff9ff3",
    "#e17055", "#fdcb6e", "#1abc9c", "#d980fa",
    "#ff3600", "#714b00", "#00705c", "#9623c1",
    "#ff00dd", "#14ff01", "#5000a1", "#0063ff",
    "#9f2d6e", "#fdf03a", "#d87200", "#009f70",
];
const BASE_COLOR_COUNT = 2;
const BASE_BOTTLE_SPARE = 1;
const LEVELS_PER_DIFFICULTY_INCREASE = 10;
const MAX_LAYERS = 4;

let history = [];
let redoHistory = [];
let currentLevel = 0;
let isPouring = false;
let bottles = [];
let bottleData = [];
let selected = null;
let moves = 0;

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("bottle-container");
    const message = document.getElementById("message");
    const movesDisplay = document.getElementById("moves");
    const restartBtn = document.getElementById("restart");
    const undoBtn = document.getElementById("undo");
    const redoBtn = document.getElementById("redo");
    const hintBtn = document.getElementById("hint");
    const nextBtn = document.getElementById("next");

    const pourSound = document.getElementById("pour-sound");
    const winSound = document.getElementById("win-sound");

    restartBtn.addEventListener("click", initGame);
    undoBtn.addEventListener("click", undoMove);
    redoBtn.addEventListener("click", redoMove);
    hintBtn.addEventListener("click", showHint);
    nextBtn.addEventListener("click", () => {
        currentLevel++;
        initGame();
    });

    const nextFromWinBtn = document.getElementById("next-from-win");
    nextFromWinBtn.addEventListener("click", () => {
        currentLevel++;
        document.getElementById("win-screen").classList.add("hidden");
        initGame();
    });

    function getColorCount() {
        return BASE_COLOR_COUNT + Math.floor(currentLevel / LEVELS_PER_DIFFICULTY_INCREASE);
    }

    function getBottleCount(colorCount) {
        return colorCount + BASE_BOTTLE_SPARE;
    }

    function initGame() {
        message.textContent = "";
        moves = 0;
        selected = null;
        history = [];
        redoHistory = [];
        movesDisplay.textContent = moves;

        const colorCount = getColorCount();
        const bottleCount = getBottleCount(colorCount);

        container.innerHTML = "";
        bottles = [];
        for (let i = 0; i < bottleCount; i++) {
            const bottle = document.createElement("div");
            bottle.classList.add("board");
            container.appendChild(bottle);
            bottles.push(bottle);
        }

        bottles.forEach((b, i) => {
            b.classList.remove("selected", "hint");
            b.style.pointerEvents = "auto";
            b.addEventListener("click", () => handleBottleClick(i));
        });

        bottleData = generateRandomLevel(colorCount, MAX_LAYERS);
        renderBottles();
    }

    function generateRandomLevel(colorCount, layersPerBottle) {
        const usedColors = BASE_COLORS.slice(0, colorCount);
        const allLayers = [];

        usedColors.forEach(color => {
            for (let i = 0; i < layersPerBottle; i++) {
                allLayers.push(color);
            }
        });

        // Shuffle the layers
        for (let i = allLayers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allLayers[i], allLayers[j]] = [allLayers[j], allLayers[i]];
        }

        let bottleCount = getBottleCount(colorCount);
        let level = fillBottles(allLayers, bottleCount, layersPerBottle);

        // If there isn't at least one bottle with enough free space, add one more empty bottle
        if (!hasValidSpareBottle(level, layersPerBottle)) {
            bottleCount += 1;
            level = fillBottles(allLayers, bottleCount, layersPerBottle);
        }

        return level;
    }

    function fillBottles(layers, bottleCount, maxPerBottle) {
        const level = Array.from({length: bottleCount}, () => []);
        let idx = 0;

        for (const layer of layers) {
            while (level[idx].length >= maxPerBottle) {
                idx = (idx + 1) % bottleCount;
            }
            level[idx].push(layer);
            idx = (idx + 1) % bottleCount;
        }

        return level;
    }

    function hasValidSpareBottle(level, maxPerBottle) {
        // Return true if at least one bottle has enough free space (e.g. 2 or more)
        return level.some(bottle => bottle.length <= maxPerBottle - 2);
    }

    function renderBottles() {
        bottles.forEach((bottleEl, idx) => {
            bottleEl.innerHTML = "";
            bottleEl.classList.remove("selected", "hint");
            const layers = bottleData[idx] || [];
            const layerHeight = 100 / MAX_LAYERS;

            layers.forEach((color, li) => {
                const div = document.createElement("div");
                div.className = "layer";
                div.style.height = `${layerHeight}%`;
                div.style.bottom = `${li * layerHeight}%`;
                div.style.backgroundColor = color;
                bottleEl.appendChild(div);
            });
        });
    }

    function handleBottleClick(i) {
        if (isPouring) return;
        const bottle = bottleData[i];
        if (selected === null) {
            if (bottle.length === 0) return;
            selected = i;
            bottles[i].classList.add("selected");
        } else {
            if (selected === i) {
                bottles[i].classList.remove("selected");
                selected = null;
            } else {
                bottles[selected].classList.remove("selected");
                pour(selected, i);
                selected = null;
            }
        }
    }

    function pour(fromIdx, toIdx) {
        const source = bottleData[fromIdx];
        const target = bottleData[toIdx];

        if (isPouring || source.length === 0 || target.length >= MAX_LAYERS) return;

        const topColor = source[source.length - 1];
        if (target.length > 0 && target[target.length - 1] !== topColor) return;

        let sameCount = 1;
        for (let i = source.length - 2; i >= 0; i--) {
            if (source[i] === topColor) sameCount++;
            else break;
        }

        const space = MAX_LAYERS - target.length;
        const amount = Math.min(sameCount, space);
        if (amount === 0) return;

        history.push(deepClone(bottleData));
        redoHistory = [];

        isPouring = true;
        animateBottlePour(bottles[fromIdx], bottles[toIdx], topColor, amount, () => {
            for (let k = 0; k < amount; k++) {
                target.push(source.pop());
            }
            moves++;
            movesDisplay.textContent = moves;
            renderBottles();
            checkWin();
            isPouring = false;
        });
    }

    function animateBottlePour(fromEl, toEl, color, amount, onComplete) {
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        const dx = toRect.left - fromRect.left;
        const dy = toRect.top - fromRect.top;

        const clone = fromEl.cloneNode(true);
        clone.style.position = "fixed";
        clone.style.left = `${fromRect.left}px`;
        clone.style.top = `${fromRect.top}px`;
        clone.style.width = `${fromRect.width}px`;
        clone.style.height = `${fromRect.height}px`;
        clone.style.zIndex = 9999;
        clone.style.transformOrigin = dx > 0 ? "top left" : "top right";
        clone.classList.add("clone-anim");
        document.body.appendChild(clone);

        requestAnimationFrame(() => {
            clone.style.transition = "transform 0.4s ease, left 0.4s ease, top 0.4s ease";
            clone.style.left = `${fromRect.left + dx / 2}px`;
            clone.style.top = `${fromRect.top + dy / 2 - 60}px`;
            clone.style.transform = `rotate(${dx > 0 ? 25 : -25}deg)`;
        });

        const stream = document.createElement("div");
        stream.classList.add("pour-stream");
        stream.style.setProperty("--stream-length", `${Math.abs(dy) + 40}px`);
        stream.style.left = `${fromRect.left + fromRect.width / 2}px`;
        stream.style.top = `${fromRect.top + 40}px`;
        document.body.appendChild(stream);

        const toLayers = toEl.querySelectorAll(".layer");
        const newLayer = document.createElement("div");
        newLayer.className = "layer";
        newLayer.style.backgroundColor = color;
        newLayer.style.height = "0px";
        newLayer.style.bottom = `${toLayers.length * (100 / MAX_LAYERS)}%`;
        toEl.appendChild(newLayer);

        setTimeout(() => {
            newLayer.style.transition = `height 700ms ease`;
            newLayer.style.height = `${100 / MAX_LAYERS}%`;
        }, 100);

        if (pourSound) {
            pourSound.volume = 0.5;
            pourSound.currentTime = 0;
            pourSound.play().catch(() => {
            });
        }

        setTimeout(() => {
            clone.remove();
            stream.remove();
            onComplete && onComplete();
        }, 1100);
    }

    function undoMove() {
        if (history.length === 0 || isPouring) return;
        redoHistory.push(deepClone(bottleData));
        bottleData = history.pop();
        moves = Math.max(0, moves - 1);
        movesDisplay.textContent = moves;
        renderBottles();
    }

    function redoMove() {
        if (redoHistory.length === 0 || isPouring) return;
        history.push(deepClone(bottleData));
        bottleData = redoHistory.pop();
        moves++;
        movesDisplay.textContent = moves;
        renderBottles();
    }

    function showHint() {
        bottles.forEach(b => b.classList.remove("hint"));
        message.textContent = "";

        let best = null;
        let bestScore = -Infinity;

        for (let f = 0; f < bottleData.length; f++) {
            const src = bottleData[f];
            if (src.length === 0) continue;
            const c = src[src.length - 1];
            let sameCount = 1;
            for (let i = src.length - 2; i >= 0; i--) {
                if (src[i] === c) sameCount++;
                else break;
            }

            for (let t = 0; t < bottleData.length; t++) {
                if (t === f) continue;
                const tgt = bottleData[t];
                if (tgt.length >= MAX_LAYERS) continue;
                const top = tgt[tgt.length - 1];
                if (tgt.length === 0 || top === c) {
                    const space = MAX_LAYERS - tgt.length;
                    const possible = Math.min(sameCount, space);
                    let score = possible;
                    if (tgt.length + possible === MAX_LAYERS) score += 1;
                    if (score > bestScore) {
                        bestScore = score;
                        best = {from: f, to: t};
                    }
                }
            }
        }

        if (best) {
            bottles[best.from].classList.add("hint");
            bottles[best.to].classList.add("hint");
        } else {
            message.textContent = "❌ No useful moves!";
        }
    }

    function generateSolvableLevel(colorCount, layersPerBottle, baseSpare = 1) {
        const maxTries = 20;
        for (let attempt = 0; attempt < maxTries; attempt++) {
            const spare = baseSpare + attempt;
            const totalBottles = colorCount + spare;

            const level = generateRandomLevel(colorCount, layersPerBottle, totalBottles);
            if (isSolvable(level, layersPerBottle)) {
                return level;
            }
        }

        console.warn("Could not generate a solvable level within limit. Falling back.");
        return generateRandomLevel(colorCount, layersPerBottle, colorCount + baseSpare + 1);
    }

    function isSolvable(initialState, maxLayers = 4, maxDepth = 2000) {
        const serialize = state => JSON.stringify(state.map(b => b.join(",")));

        const isSolved = state => {
            return state.every(bottle =>
                bottle.length === 0 ||
                (bottle.length === maxLayers && bottle.every(c => c === bottle[0]))
            );
        };

        const canPour = (from, to) => {
            if (from.length === 0 || to.length >= maxLayers) return false;
            const color = from[from.length - 1];
            if (to.length > 0 && to[to.length - 1] !== color) return false;
            let count = 1;
            for (let i = from.length - 2; i >= 0; i--) {
                if (from[i] === color) count++;
                else break;
            }
            const space = maxLayers - to.length;
            return count > 0 && space > 0;
        };

        const pour = (state, fromIdx, toIdx) => {
            const newState = state.map(b => [...b]);
            const from = newState[fromIdx];
            const to = newState[toIdx];
            const color = from[from.length - 1];

            let count = 1;
            for (let i = from.length - 2; i >= 0; i--) {
                if (from[i] === color) count++;
                else break;
            }

            const space = maxLayers - to.length;
            const moveAmount = Math.min(count, space);

            for (let i = 0; i < moveAmount; i++) {
                to.push(from.pop());
            }

            return newState;
        };

        const seen = new Set();
        const queue = [initialState.map(b => [...b])];
        seen.add(serialize(initialState));

        let steps = 0;

        while (queue.length > 0 && steps < maxDepth) {
            const current = queue.shift();
            if (isSolved(current)) return true;

            for (let i = 0; i < current.length; i++) {
                for (let j = 0; j < current.length; j++) {
                    if (i !== j && canPour(current[i], current[j])) {
                        const next = pour(current, i, j);
                        const key = serialize(next);
                        if (!seen.has(key)) {
                            seen.add(key);
                            queue.push(next);
                        }
                    }
                }
            }

            steps++;
        }

        return false; // No solution found within depth
    }

    function isSolvableOptimized(initialState, maxLayers = 4, maxDepth = 3000) {
        const serialize = (state) =>
            state.map(b => b.join(",")).join("|");

        const isSolved = (state) =>
            state.every(b => b.length === 0 || (b.length === maxLayers && b.every(c => c === b[0])));

        const canPour = (from, to) => {
            if (from.length === 0 || to.length >= maxLayers) return false;
            const color = from[from.length - 1];
            if (to.length > 0 && to[to.length - 1] !== color) return false;

            let same = 1;
            for (let i = from.length - 2; i >= 0; i--) {
                if (from[i] === color) same++;
                else break;
            }

            return (maxLayers - to.length) >= 1 && same >= 1;
        };

        const pour = (state, fromIdx, toIdx) => {
            const newState = state.map(b => [...b]);
            const from = newState[fromIdx];
            const to = newState[toIdx];
            const color = from[from.length - 1];

            let count = 1;
            for (let i = from.length - 2; i >= 0; i--) {
                if (from[i] === color) count++;
                else break;
            }

            const space = maxLayers - to.length;
            const amount = Math.min(space, count);

            for (let i = 0; i < amount; i++) {
                to.push(from.pop());
            }

            return newState;
        };

        const visited = new Set();
        const queue = [{state: initialState.map(b => [...b]), depth: 0}];
        visited.add(serialize(initialState));

        while (queue.length > 0) {
            const {state, depth} = queue.shift();
            if (depth > maxDepth) continue;

            if (isSolved(state)) return true;

            for (let i = 0; i < state.length; i++) {
                for (let j = 0; j < state.length; j++) {
                    if (i === j) continue;
                    if (canPour(state[i], state[j])) {
                        const next = pour(state, i, j);
                        const key = serialize(next);
                        if (!visited.has(key)) {
                            visited.add(key);
                            queue.push({state: next, depth: depth + 1});
                        }
                    }
                }
            }
        }

        return false; // Unsolved within depth
    }

    // let level;
    // do {
    //     level = generateRandomLevel(colorCount, maxLayers);
    // } while (!isSolvableOptimized(level));


    function checkWin() {
        const won = bottleData.every(
            b => b.length === 0 || (b.length === MAX_LAYERS && b.every(c => c === b[0]))
        );
        if (won) {
            if (winSound) {
                winSound.volume = 0.5;
                winSound.currentTime = 0;
                winSound.play().catch(() => {
                });
            }
            bottles.forEach(b => (b.style.pointerEvents = "none"));
            message.textContent = "🎉 You completed the level!";
            document.getElementById("win-screen").classList.remove("hidden");
        }
    }

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    initGame();
});
