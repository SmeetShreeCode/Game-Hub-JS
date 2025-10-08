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
    const nextFromWinBtn = document.getElementById("next-from-win");

    const pourSound = document.getElementById("pour-sound");
    const winSound = document.getElementById("win-sound");

    // Button bindings
    restartBtn.addEventListener("click", initGame);
    undoBtn.addEventListener("click", undoMove);
    redoBtn.addEventListener("click", redoMove);
    hintBtn.addEventListener("click", showHint);
    nextBtn.addEventListener("click", () => {
        currentLevel++;
        initGame();
    });
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

    // 🧩 Initialize new level
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
            bottle.addEventListener("click", () => handleBottleClick(i));
            container.appendChild(bottle);
            bottles.push(bottle);
        }

        bottleData = generateSolvableLevel(colorCount, MAX_LAYERS);
        renderBottles();
    }

    // 🎨 Create solvable randomized level
    function generateSolvableLevel(colorCount, layersPerBottle) {
        const usedColors = BASE_COLORS.slice(0, colorCount);
        const allLayers = [];

        usedColors.forEach(color => {
            for (let i = 0; i < layersPerBottle; i++) {
                allLayers.push(color);
            }
        });

        const shuffle = arr => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        };

        let level = [];
        let attempts = 0;
        const maxAttempts = 50;

        do {
            attempts++;
            shuffle(allLayers);

            const bottleCount = colorCount + BASE_BOTTLE_SPARE;
            level = Array.from({ length: bottleCount }, () => []);

            let idx = 0;
            for (const layer of allLayers) {
                while (level[idx].length >= layersPerBottle) {
                    idx = (idx + 1) % bottleCount;
                }
                level[idx].push(layer);
                idx = (idx + 1) % bottleCount;
            }

            // Add at least one empty bottle
            if (!level.some(b => b.length === 0)) {
                level.push([]);
            }

            // Stop if solvable
            if (isSolvableOptimized(level)) break;

        } while (attempts < maxAttempts);

        return level;
    }

    // 🧠 Solvable level detection (optimized BFS)
    function isSolvableOptimized(initialState, maxLayers = 4, maxDepth = 2500) {
        const serialize = state => state.map(b => b.join(",")).join("|");

        const isSolved = state =>
            state.every(b => b.length === 0 || (b.length === maxLayers && b.every(c => c === b[0])));

        const canPour = (from, to) => {
            if (from.length === 0 || to.length >= maxLayers) return false;
            const color = from[from.length - 1];
            if (to.length > 0 && to[to.length - 1] !== color) return false;
            const same = from.filter(c => c === color).length;
            return (maxLayers - to.length) > 0 && same > 0;
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
        const queue = [{ state: initialState.map(b => [...b]), depth: 0 }];
        visited.add(serialize(initialState));

        while (queue.length > 0) {
            const { state, depth } = queue.shift();
            if (depth > maxDepth) return false;
            if (isSolved(state)) return true;

            for (let i = 0; i < state.length; i++) {
                for (let j = 0; j < state.length; j++) {
                    if (i !== j && canPour(state[i], state[j])) {
                        const next = pour(state, i, j);
                        const key = serialize(next);
                        if (!visited.has(key)) {
                            visited.add(key);
                            queue.push({ state: next, depth: depth + 1 });
                        }
                    }
                }
            }
        }
        return false;
    }

    // 💧 Render bottles
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

    // 🫗 Handle bottle click
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

    // 💦 Pour logic with animation
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

    // 🎬 Pour animation
    function animateBottlePour(fromEl, toEl, color, amount, onComplete) {
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        const dx = toRect.left - fromRect.left;
        const dy = toRect.top - fromRect.top;
        const bendDir = dx > 0 ? 1 : -1;

        const sourceLayers = fromEl.querySelectorAll(".layer");
        const sourceTop = sourceLayers[sourceLayers.length - 1];

        const newLayer = document.createElement("div");
        newLayer.className = "layer";
        newLayer.style.backgroundColor = color;
        newLayer.style.height = "0%";
        newLayer.style.bottom = `${toEl.querySelectorAll(".layer").length * (100 / MAX_LAYERS)}%`;
        toEl.appendChild(newLayer);

        const canvas = document.createElement("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = "fixed";
        canvas.style.left = "0";
        canvas.style.top = "0";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = 9999;
        document.body.appendChild(canvas);
        const ctx = canvas.getContext("2d");

        // Play sound
        if (pourSound) {
            pourSound.volume = 0.6;
            pourSound.currentTime = 0;
            pourSound.play().catch(() => {});
        }

        // ✨ Move and rotate source bottle toward target
        fromEl.style.transition = `transform 0.4s ease`;
        fromEl.style.transformOrigin = bendDir > 0 ? "top left" : "top right";
        fromEl.style.zIndex = "10";
        fromEl.style.transform = `translate(${dx}px, ${dy-80}px) rotate(${bendDir * 70}deg)`;

        const pourDuration = 1200;
        const start = performance.now();

        const startX = fromRect.left + (bendDir > 0 ? fromRect.width * 0.2 : fromRect.width * 0.9);
        const startY = fromRect.top + fromRect.height * 0.25;
        const endX = toRect.left + toRect.width / 2;
        const endY = toRect.top + 20;

        const gravity = Math.min(180, Math.max(60, 120 + dy / 2));
        let droplets = [];

        function animate(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / pourDuration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);

            const delta = ease * amount * (100 / MAX_LAYERS);
            if (sourceTop) {
                const remaining = 100 / MAX_LAYERS - delta;
                sourceTop.style.height = `${Math.max(remaining, 0)}%`;
            }
            newLayer.style.height = `${delta}%`;

            const cpX = (startX + endX) / 2 + bendDir * 50;
            const cpY = Math.min(startY, endY) - gravity;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw water stream
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(cpX, cpY, endX, endY);
            const width = 12 + Math.sin(progress * Math.PI) * 10;
            ctx.lineWidth = width;
            const grad = ctx.createLinearGradient(startX, startY, endX, endY);
            grad.addColorStop(0, color + "cc");
            grad.addColorStop(0.8, color + "88");
            grad.addColorStop(1, color + "00");
            ctx.strokeStyle = grad;
            ctx.lineCap = "round";
            ctx.stroke();

            ctx.lineWidth = 2;
            ctx.setLineDash([12, 20]);
            ctx.lineDashOffset = -elapsed / 12;
            ctx.stroke();

            if (Math.random() < 0.3) {
                droplets.push({
                    x: startX + bendDir * (10 + Math.random() * 10),
                    y: startY + Math.random() * 5,
                    vx: bendDir * (1 + Math.random()),
                    vy: Math.random() * -2,
                    life: 1
                });
            }
            droplets.forEach(d => {
                d.x += d.vx;
                d.vy += 0.25;
                d.y += d.vy;
                d.life -= 0.025;
                ctx.beginPath();
                ctx.arc(d.x, d.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = color + Math.floor(d.life * 255).toString(16).padStart(2, "0");
                ctx.fill();
            });
            droplets = droplets.filter(d => d.life > 0);

            if (progress < 1) requestAnimationFrame(animate);
            else cleanup();
        }

        function cleanup() {
            // Return bottle back to original position
            fromEl.style.transition = `transform 0.4s ease`;
            fromEl.style.transform = `translate(0, 0) rotate(0deg)`;

            setTimeout(() => {
                canvas.remove();
                fromEl.style.zIndex = "";
                if (sourceTop && parseFloat(sourceTop.style.height) <= 5) sourceTop.remove();
                onComplete && onComplete();
            }, 400); // wait for return animation to finish
        }

        requestAnimationFrame(animate);
    }

    // 🕹 Undo / Redo
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

    // 💡 Hint
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
                        best = { from: f, to: t };
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

    // 🏁 Win check
    function checkWin() {
        const won = bottleData.every(
            b => b.length === 0 || (b.length === MAX_LAYERS && b.every(c => c === b[0]))
        );
        if (won) {
            if (winSound) {
                winSound.volume = 0.5;
                winSound.currentTime = 0;
                winSound.play().catch(() => {});
            }
            bottles.forEach(b => (b.style.pointerEvents = "none"));
            message.textContent = "🎉 You completed the level!";
            document.getElementById("win-screen").classList.remove("hidden");
        }
    }

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Start first level
    initGame();
});
