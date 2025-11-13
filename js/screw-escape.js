const { Engine, Render, Runner, Bodies, Composite, Constraint, Mouse, MouseConstraint, Events, Body } = Matter;

// --- ENGINE & WORLD ---
const engine = Engine.create();
const world = engine.world;
world.gravity.y = 1;

// --- CANVAS ---
const canvas = document.getElementById('world');
canvas.width = 800;
canvas.height = 600;

// --- RENDERER ---
const render = Render.create({
    canvas,
    engine,
    options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: 'radial-gradient(1200px 400px at 10% 0%, rgba(255,255,255,0.02), transparent), linear-gradient(180deg, #0f1416, #06263e)'
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// --- GLOBALS ---
let boards = [];
let screws = [];
let currentLevel = 1;
let currentOrderIndex = 0;
let isUnscrewing = false;
let isTransitioning = false;

// --- UI ELEMENTS ---
const levelText = document.getElementById('levelText');
const restartBtn = document.getElementById('restartBtn');
const editorBtn = document.getElementById('editorBtn');
const exportBtn = document.getElementById('exportBtn');
const progressBar = document.getElementById('progressBar');

// --- GROUND ---
const ground = Bodies.rectangle(400, 580, 810, 40, { isStatic: true });
Composite.add(world, ground);

// --- MOUSE CONTROL ---
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } }
});
Composite.add(world, mouseConstraint);

// --- LEVEL LOADING ---
function loadLevel(levelIndex) {
    const level = levels[levelIndex];
    boards.forEach(b => Composite.remove(world, b));
    screws.forEach(s => Composite.remove(world, s.constraint));
    boards = [];
    screws = [];
    currentOrderIndex = 0;
    updateProgress();
    levelText.textContent = `Level ${levelIndex + 1}`;

    level.boards.forEach((b, i) => {
        const board = Bodies.rectangle(b.x, b.y, b.w, b.h, {
            restitution: 0.4,
            friction: 0.6,
            render: { fillStyle: b.color }
        });
        board.label = `board_${i}`;
        Composite.add(world, board);
        boards.push(board);
    });

    level.screws.forEach((s, i) => {
        const board = boards[s.boardIndex];
        const screwConstraint = Constraint.create({
            pointA: { x: s.x, y: s.y },
            bodyB: board,
            pointB: { x: s.x - board.position.x, y: s.y - board.position.y },
            stiffness: 1,
            length: 0,
            render: { visible: false }
        });
        Composite.add(world, screwConstraint);
        screws.push({ constraint: screwConstraint, x: s.x, y: s.y, index: i, rotation: 0, opacity: 1 });
    });
}

function updateProgress() {
    const level = levels[currentLevel];
    const progress = currentOrderIndex / level.order.length;
    progressBar.style.width = `${progress * 100}%`;
}

// --- UNSCREW ANIMATION ---
function unscrewScrew(screwObj, index) {
    if (isUnscrewing || isTransitioning) return;
    isUnscrewing = true;
    const duration = 500;
    const startTime = performance.now();

    function animate(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        screwObj.rotation = progress * Math.PI * 4;
        if (progress < 1) requestAnimationFrame(animate);
        else {
            Composite.remove(world, screwObj.constraint);
            screws.splice(index, 1);
            currentOrderIndex++;
            updateProgress();
            isUnscrewing = false;

            const levelData = levels[currentLevel];
            if (currentOrderIndex >= levelData.order.length) {
                if (currentLevel + 1 < levels.length) {
                    setTimeout(() => {
                        alert(`🎉 Level ${currentLevel + 1} Complete!`);
                        transitionToNextLevel(currentLevel + 1);
                        currentLevel++;
                    }, 300);
                } else {
                    setTimeout(() => alert("🎉 Congratulations! All levels completed!"), 300);
                }
            }
        }
    }

    requestAnimationFrame(animate);
}

// --- LEVEL TRANSITION ---
function transitionToNextLevel(nextLevelIndex) {
    if (isTransitioning) return;
    isTransitioning = true;
    const fadeDuration = 800;
    const startTime = performance.now();

    function animateFade(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / fadeDuration, 1);

        boards.forEach(board => {
            board.render.opacity = 1 - progress;
            Body.translate(board, { x: 0, y: progress * 2 });
        });
        screws.forEach(s => s.opacity = 1 - progress);

        if (progress < 1) requestAnimationFrame(animateFade);
        else {
            boards.forEach(b => Composite.remove(world, b));
            screws.forEach(s => Composite.remove(world, s.constraint));
            loadLevel(nextLevelIndex);
            isTransitioning = false;
        }
    }

    requestAnimationFrame(animateFade);
}

// --- UNSCREW (Mouse + Touch) ---
function handleInteraction(x, y) {
    if (isUnscrewing || isTransitioning || editorMode) return;
    screws.forEach((s, i) => {
        if (Math.hypot(s.x - x, s.y - y) < 15 && levels[currentLevel].order[currentOrderIndex] === s.index) {
            unscrewScrew(s, i);
        }
    });
}

canvas.addEventListener('click', e => handleInteraction(e.offsetX, e.offsetY));
canvas.addEventListener('touchstart', e => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    handleInteraction(touch.clientX - rect.left, touch.clientY - rect.top);
});

// --- RESTART BUTTON ---
restartBtn.addEventListener('click', () => {
    if (isTransitioning) return;
    loadLevel(currentLevel);
});

// --- RENDER SCREWS ---
Events.on(render, 'afterRender', () => {
    const ctx = render.context;
    screws.forEach(s => {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation || 0);
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, 2 * Math.PI);
        ctx.fillStyle = levels[currentLevel].order[currentOrderIndex] === s.index ? '#ffcc00' : '#777';
        ctx.globalAlpha = s.opacity || 1;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#333';
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-4, -4); ctx.lineTo(4, 4);
        ctx.moveTo(4, -4); ctx.lineTo(-4, 4);
        ctx.strokeStyle = '#222';
        ctx.stroke();
        ctx.restore();
    });
});

// --- INITIAL LOAD ---
loadLevel(currentLevel);

// --- EDITOR MODE ---
let editorMode = false;
let selectedBody = null;
let selectedScrew = null;
let selectedOffset = { x: 0, y: 0 };

editorBtn.addEventListener('click', () => {
    editorMode = !editorMode;
    editorBtn.textContent = editorMode ? "Exit Editor" : "Enter Editor";
});

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
        const touch = e.touches[0];
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    } else {
        return { x: e.offsetX, y: e.offsetY };
    }
}

function handleDown(e) {
    if (!editorMode) return;
    const { x, y } = getPos(e);

    selectedScrew = screws.find(s => Math.hypot(s.x - x, s.y - y) < 15);
    if (selectedScrew) {
        selectedOffset.x = x - selectedScrew.x;
        selectedOffset.y = y - selectedScrew.y;
        return;
    }

    selectedBody = boards.find(b =>
        x > b.bounds.min.x && x < b.bounds.max.x &&
        y > b.bounds.min.y && y < b.bounds.max.y
    );
    if (selectedBody) {
        selectedOffset.x = x - selectedBody.position.x;
        selectedOffset.y = y - selectedBody.position.y;
    }
}

function handleMove(e) {
    if (!editorMode) return;
    const { x, y } = getPos(e);

    if (selectedBody) {
        Body.setPosition(selectedBody, { x: x - selectedOffset.x, y: y - selectedOffset.y });
        screws.forEach(s => {
            if (s.constraint.bodyB === selectedBody) {
                s.x = s.constraint.pointB.x + selectedBody.position.x;
                s.y = s.constraint.pointB.y + selectedBody.position.y;
            }
        });
    } else if (selectedScrew) {
        selectedScrew.x = x - selectedOffset.x;
        selectedScrew.y = y - selectedOffset.y;
    }
}

function handleUp(e) {
    if (!editorMode || !selectedScrew) {
        selectedBody = null;
        selectedScrew = null;
        return;
    }
    let nearestBoard = boards[0];
    let minDist = Infinity;
    boards.forEach(b => {
        const dx = selectedScrew.x - b.position.x;
        const dy = selectedScrew.y - b.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
            minDist = dist;
            nearestBoard = b;
        }
    });
    selectedScrew.constraint.bodyB = nearestBoard;
    selectedScrew.constraint.pointB.x = selectedScrew.x - nearestBoard.position.x;
    selectedScrew.constraint.pointB.y = selectedScrew.y - nearestBoard.position.y;

    selectedBody = null;
    selectedScrew = null;
}

canvas.addEventListener('mousedown', handleDown);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleUp);
canvas.addEventListener('touchstart', handleDown);
canvas.addEventListener('touchmove', handleMove);
canvas.addEventListener('touchend', handleUp);

// --- EXPORT LEVEL DATA ---
exportBtn.addEventListener('click', () => {
    if (!editorMode) return;
    const exportData = {
        boards: boards.map(b => ({
            x: b.position.x,
            y: b.position.y,
            w: b.bounds.max.x - b.bounds.min.x,
            h: b.bounds.max.y - b.bounds.min.y,
            color: b.render.fillStyle
        })),
        screws: screws.map(s => ({
            boardIndex: boards.indexOf(s.constraint.bodyB),
            offsetX: s.constraint.pointB.x,
            offsetY: s.constraint.pointB.y
        })),
        order: screws.map((s, i) => i)
    };
    console.log(JSON.stringify(exportData, null, 2));
    alert("Level JSON copied to console!");
});
