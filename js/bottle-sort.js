const BASE_COLORS = [
    "#00aaff", "#ff7675", "#f6e58d", "#6ab04c",
    "#6d55b1", "#00ffc1", "#918b62", "#ff9ff3",
    "#88321c", "#d5b06f", "#1abc9c", "#85056d",
    "#ff3600", "#714b00", "#00705c", "#9623c1",
    "#ff00dd", "#14ff01", "#5000a1", "#0063ff",
    "#9f2d6e", "#fdf03a", "#d87200", "#009f70",
];
const introLevels = [
    [ //level 1
        ["#ff7675", "#ff7675"],
        ["#ff7675", "#ff7675"], []
    ],
    [ //level 2
        ["#00aaff", "#00aaff", "#00aaff"],
        ["#00aaff"], []
    ],
    [ //level 3
        ["#00aaff", "#00aaff", "#00aaff", "#ff7675"],
        ["#00aaff", "#ff7675", "#ff7675", "#ff7675"],
        []
    ],
    [ //level 4
        ["#00aaff", "#00aaff", "#ff7675"],
        ["#ff7675", "#00aaff", "#00aaff"],
        ["#ff7675", "#ff7675"],
    ]
];

const BASE_COLOR_COUNT = 2;
const BASE_BOTTLE_SPARE = 1;
const LEVELS_PER_DIFFICULTY_INCREASE = 10;
const MAX_LAYERS = 4;
const ADD_BOTTLE_LIMIT = 10;

let history = [];
let redoHistory = [];
let currentLevel = 1;
let isPouring = false;
let bottles = [];
let bottleData = [];
let selected = null;
let moves = 0;
let addedBottleCount = 0;

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("bottle-container");
    const message = document.getElementById("message");
    const movesDisplay = document.getElementById("moves");
    const levelDisplay = document.getElementById("level");
    const restartBtn = document.getElementById("restart");
    const undoBtn = document.getElementById("undo");
    const redoBtn = document.getElementById("redo");
    const hintBtn = document.getElementById("hint");
    const nextBtn = document.getElementById("next");
    const nextFromWinBtn = document.getElementById("next-from-win");
    const addBottleBtn = document.getElementById("add-bottle");

    const pourSound = document.getElementById("pour-sound");
    const winSound = document.getElementById("win-sound");
    const savedLevel = parseInt(localStorage.getItem("bottle_sort_lastLevel"), 10);
    if (!isNaN(savedLevel) && savedLevel > 0) {
        currentLevel = savedLevel;
    }

    // Button bindings
    addBottleBtn.addEventListener("click", addEmptyBottle);
    restartBtn.addEventListener("click", () => {
        document.getElementById("restart-confirm-screen").classList.remove("hidden");
    });
    undoBtn.addEventListener("click", undoMove);
    redoBtn.addEventListener("click", redoMove);
    hintBtn.addEventListener("click", showHint);
    nextBtn.addEventListener("click", () => {
        currentLevel++;
        levelDisplay.textContent = currentLevel;
        initGame();
    });
    nextFromWinBtn.addEventListener("click", () => {
        currentLevel++;
        levelDisplay.textContent = currentLevel;
        document.getElementById("win-screen").classList.add("hidden");
        initGame();
    });

    document.getElementById("confirm-restart").addEventListener("click", () => {
        document.getElementById("restart-confirm-screen").classList.add("hidden");
        initGame();
    });

    document.getElementById("cancel-restart").addEventListener("click", () => {
        document.getElementById("restart-confirm-screen").classList.add("hidden");
    });

    document.getElementById("restart-stuck").addEventListener("click", () => {
        document.getElementById("stuck-screen").classList.add("hidden");
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
        addedBottleCount = 0;
        selected = null;
        history = [];
        redoHistory = [];
        movesDisplay.textContent = moves;
        levelDisplay.textContent = currentLevel;
        localStorage.setItem("bottle_sort_lastLevel", currentLevel);

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
        if (currentLevel > 4) {
            hintBtn.classList.remove("hidden");
            addBottleBtn.classList.remove("hidden");
        } else {
            hintBtn.classList.add("hidden");
            addBottleBtn.classList.add("hidden");
        }

        if (currentLevel <= introLevels.length) {
            // Load predefined intro level
            bottleData = deepClone(introLevels[currentLevel - 1]);
        } else {
            // Generate random solvable level
            do {
                bottleData = generateSolvableLevel(colorCount, MAX_LAYERS);
            } while (
                isSolved(bottleData) || !isSolvableOptimized(bottleData, MAX_LAYERS, 3000)
                );
        }

        renderBottles();
    }

    function isSolved(state) {
        return state.every(b =>
            b.length === 0 || (b.length === MAX_LAYERS && b.every(c => c === b[0]))
        );
    }

    // 🧩 Fast guaranteed solvable level generator
    function generateSolvableLevel(colorCount, layersPerBottle) {
        const usedColors = BASE_COLORS.slice(0, colorCount);
        const bottleCount = getBottleCount(colorCount);

        // Step 1: Create perfect groups (solved state)
        let level = usedColors.map(color => Array(layersPerBottle).fill(color));

        // Step 2: Add extra empty bottles
        while (level.length < bottleCount) {
            level.push([]);
        }

        // Step 3: Apply controlled random swaps to make it interesting
        const shuffleIntensity = 3 + Math.floor(currentLevel / 10);
        for (let k = 0; k < colorCount * layersPerBottle * shuffleIntensity; k++) {
            const i = Math.floor(Math.random() * colorCount);
            const j = Math.floor(Math.random() * colorCount);
            if (i === j || level[i].length === 0) continue;
            const color = level[i].pop();
            const randBottle = Math.random() < 0.7 ? j : Math.floor(Math.random() * level.length);
            if (level[randBottle].length < layersPerBottle) {
                level[randBottle].push(color);
            } else {
                level[i].push(color); // undo if full
            }
        }

        // Step 4: Shuffle bottles to add variation
        for (let i = level.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [level[i], level[j]] = [level[j], level[i]];
        }

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
        const queue = [{state: initialState.map(b => [...b]), depth: 0}];
        visited.add(serialize(initialState));

        while (queue.length > 0) {
            const {state, depth} = queue.shift();
            if (depth > maxDepth) return false;
            if (isSolved(state)) return true;

            for (let i = 0; i < state.length; i++) {
                for (let j = 0; j < state.length; j++) {
                    if (i !== j && canPour(state[i], state[j])) {
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
            if (target.length === MAX_LAYERS && target.every(c => c === target[0])) {
                const bottleElement = bottles[toIdx];
                bottleElement.classList.add("bounce");

                const rect = bottleElement.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;

                triggerFireworks(35, x, y);

                setTimeout(() => {
                    bottleElement.classList.remove("bounce");
                }, 800);
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
            pourSound.play().catch(() => {
            });
        }

        // Tilt source bottle
        fromEl.style.transition = `transform 0.4s ease`;
        fromEl.style.transformOrigin = bendDir > 0 ? "top left" : "top right";
        fromEl.style.zIndex = "10";
        fromEl.style.transform = `translate(${dx}px, ${dy - 80}px) rotate(${bendDir * 70}deg)`;

        setTimeout(() => {
            const offsetX = Math.min(35, window.innerWidth * 0.08); // max 30px or 8% of screen
            const offsetY = Math.min(35, window.innerHeight * 0.04); // for startY
            const pourHeight = Math.min(150, window.innerHeight * 0.12); // pour distance

            const startX = bendDir > 0
                ? toRect.left + toRect.width / 2 - offsetX
                : toRect.left + toRect.width / 2 + offsetX;

            const startY = toRect.top - offsetY;
            const endX = toRect.left + toRect.width / 2;
            const endY = toRect.top + pourHeight;
            // const startX = bendDir > 0 ? toRect.left + toRect.width / 2 - 35 : toRect.left + toRect.width / 2 + 35;
            // const startY = toRect.top - 30;
            // const endX = toRect.left + toRect.width / 2;
            // const endY = toRect.top + 120;
            const gravity = Math.min(180, Math.max(10, 10 + dy / 2));

            let droplets = [];

            const oneLayerHeight = 100 / MAX_LAYERS;

            // Create one new target layer that grows with the full amount poured
            const targetLayer = document.createElement("div");
            targetLayer.className = "layer";
            targetLayer.style.backgroundColor = color;
            targetLayer.style.height = "0%";
            targetLayer.style.bottom = `${toEl.querySelectorAll(".layer").length * oneLayerHeight}%`;
            toEl.appendChild(targetLayer);

            const sourceLayers = fromEl.querySelectorAll(".layer");

            // Animate source layers one by one decreasing height
            function animateSourceLayer(index, callback) {
                if (index >= amount) {
                    callback();
                    return;
                }
                const sourceTop = sourceLayers[sourceLayers.length - 1 - index];
                const duration = 450;
                const start = performance.now();

                function step(time) {
                    const elapsed = time - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3);

                    if (sourceTop) {
                        sourceTop.style.height = `${Math.max(oneLayerHeight - (ease * oneLayerHeight), 0)}%`;
                    }

                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        if (sourceTop && parseFloat(sourceTop.style.height) <= 5) {
                            sourceTop.remove();
                        }
                        animateSourceLayer(index + 1, callback);
                    }
                }

                requestAnimationFrame(step);
            }

            // Animate target layer growing smoothly for the entire amount
            const pourDuration = amount * 500; // total duration proportional to amount
            const start = performance.now();

            function animateTargetLayer(timestamp) {
                const elapsed = timestamp - start;
                const progress = Math.min(elapsed / pourDuration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);

                targetLayer.style.height = `${ease * amount * oneLayerHeight}%`;

                const cpX = bendDir > 0
                    ? (startX + endX) / 2 + bendDir * 100 - 80
                    : (startX + endX) / 2 + bendDir * 100 + 80;
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

                if (progress < 1) {
                    requestAnimationFrame(animateTargetLayer);
                }
            }

            // Start source animation, then cleanup
            animateSourceLayer(0, () => {
                // After source layers have animated out, start cleanup & reset bottle position
                fromEl.style.transition = `transform 0.4s ease`;
                fromEl.style.transform = `translate(0, 0) rotate(0deg)`;

                setTimeout(() => {
                    canvas.remove();
                    fromEl.style.zIndex = "";
                    onComplete && onComplete();
                }, 80);
            });

            // Start target animation simultaneously
            requestAnimationFrame(animateTargetLayer);

        }, 200);
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
                        best = {from: f, to: t};
                    }
                }
            }
        }

        if (best) {
            bottles[best.from].classList.add("hint");
            bottles[best.to].classList.add("hint");
        } else {
            if (isSolved(bottleData)) {
                checkWin(); // In case it's actually solved
            } else if (isStuck()) {
                document.getElementById("stuck-screen").classList.remove("hidden");
                bottles.forEach(b => (b.style.pointerEvents = "none"));
            } else {
                message.textContent = "❌ No useful moves!";
            }
        }
    }

    // ➕Add Empty Bottle If Player Want
    function addEmptyBottle() {
        if (isPouring || addedBottleCount >= ADD_BOTTLE_LIMIT) return;

        bottleData.push([]);
        const bottleIndex = bottles.length;
        const bottle = document.createElement("div");
        bottle.classList.add("board");
        bottle.addEventListener("click", () => handleBottleClick(bottleIndex));
        document.getElementById("bottle-container").appendChild(bottle);
        bottles.push(bottle);
        renderBottles();

        addedBottleCount++;
    }

    function isStuck() {
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
                    if (possible > 0) return false; // At least one move exists
                }
            }
        }

        return true; // No moves found = stuck
    }

    // 🏁 Win check
    function checkWin() {
        const won = bottleData.every(
            b => b.length === 0 || (b.length === MAX_LAYERS && b.every(c => c === b[0]))
        );
        if (won) {
            triggerFireworks();
            bottles.forEach(b => {
                b.style.pointerEvents = "none";
                b.classList.add("bounce");
            });

            // Remove bounce class after animation to allow re-trigger
            setTimeout(() => {
                bottles.forEach(b => b.classList.remove("bounce"));
            }, 1000);

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

    function triggerFireworks(particle = 250, x, y) {
        const canvas = document.createElement("canvas");
        canvas.id = "fireworks-canvas";
        canvas.style.position = "fixed";
        canvas.style.left = 0;
        canvas.style.top = 0;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.zIndex = 9999;
        canvas.style.pointerEvents = "none";
        document.body.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        const centerX = x || canvas.width / 2;
        const centerY = y || canvas.height / 2;
        const particles = [];

        for (let i = 0; i < particle; i++) {
            particles.push({
                x: centerX,
                y: centerY,
                angle: Math.random() * 2 * Math.PI,
                speed: Math.random() * 5 + 5,
                radius: Math.random() * 3 + 5,
                life: 1,
                color: BASE_COLORS[Math.floor(Math.random() * BASE_COLORS.length)]
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                const dx = Math.cos(p.angle) * p.speed;
                const dy = Math.sin(p.angle) * p.speed;
                p.x += dx;
                p.y += dy;
                p.life -= 0.02;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.fill();
            });

            ctx.globalAlpha = 1;

            if (particles.some(p => p.life > 0)) {
                requestAnimationFrame(animate);
            } else {
                canvas.remove();
            }
        }

        animate();
    }

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Start first level
    initGame();
});
