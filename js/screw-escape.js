const {Engine, Render, Runner, Bodies, Composite, Constraint, Mouse, MouseConstraint, Events, Body} = Matter;

const engine = Engine.create();
const world = engine.world;
world.gravity.y = 1;

const canvas = document.getElementById("world");
const gameContainer = canvas.parentElement;

// Base dimensions for physics world
const BASE_WIDTH = 800;
const BASE_HEIGHT = 600;

// Set initial canvas size
function resizeCanvas() {
    const containerWidth = gameContainer.clientWidth;
    const maxWidth = Math.min(containerWidth - 32, BASE_WIDTH); // Account for padding
    const scale = Math.min(maxWidth / BASE_WIDTH, window.innerHeight * 0.6 / BASE_HEIGHT);
    
    const displayWidth = Math.floor(BASE_WIDTH * scale);
    const displayHeight = Math.floor(BASE_HEIGHT * scale);
    
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    canvas.width = BASE_WIDTH;
    canvas.height = BASE_HEIGHT;
    
    render.options.width = BASE_WIDTH;
    render.options.height = BASE_HEIGHT;
    render.canvas.width = BASE_WIDTH;
    render.canvas.height = BASE_HEIGHT;
}

const render = Render.create({
    canvas,
    engine,
    options: {
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        wireframes: false,
        background:
            "radial-gradient(1200px 400px at 10% 0%, rgba(255,255,255,0.02), transparent), linear-gradient(180deg, #0f1416, #06263e)"
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Initial resize
resizeCanvas();

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 100);
});

let boards = [];
let screws = [];
let currentLevel = 0;
let currentOrderIndex = 0;
let isUnscrewing = false;
let isTransitioning = false;

const levelText = document.getElementById("levelText");
const restartBtn = document.getElementById("restartBtn");
const progressBar = document.getElementById("progressBar");
const screwToolbox = document.getElementById("screwToolbox");

const ground = Bodies.rectangle(BASE_WIDTH / 2, BASE_HEIGHT - 20, BASE_WIDTH + 10, 40, {isStatic: true});
Composite.add(world, ground);

const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {stiffness: 0.2, render: {visible: false}}
});
Composite.add(world, mouseConstraint);

function isScrewValid(screw, boardDef) {
    const sx = screw.x;
    const sy = screw.y;

    if (boardDef.shape === "rect" || boardDef.shape === "roundRect") {
        const dx = Math.abs(sx - boardDef.x);
        const dy = Math.abs(sy - boardDef.y);
        return dx < boardDef.w / 2 - 5 && dy < boardDef.h / 2 - 5;
    }

    if (boardDef.shape === "circle") {
        const dist = Math.hypot(sx - boardDef.x, sy - boardDef.y);
        return dist < boardDef.radius - 5;
    }

    return true;
}

function validateLevelSolvability(level) {
    const screwCount = level.screws.length;

    if (level.order.length !== screwCount)
        return {valid: false, error: "Order length mismatch"};

    const set = new Set(level.order);
    if (set.size !== screwCount)
        return {valid: false, error: "Duplicate indexes in order"};

    return {valid: true};
}

function loadLevel(levelIndex) {
    const level = levels[levelIndex];

    // Validate level before loading
    const check = validateLevelSolvability(level);
    if (!check.valid) {
        console.error(`Level ${levelIndex} invalid: ${check.error}`);
        return;
    }

    // Remove old
    boards.forEach(b => Composite.remove(world, b));
    screws.forEach(s => Composite.remove(world, s.constraint));
    boards = [];
    screws = [];

    currentOrderIndex = 0;
    levelText.textContent = `Level ${levelIndex + 1}`;

    // Create boards
    level.boards.forEach((b, i) => {
        let board;

        switch (b.shape) {
            case "roundRect":
                board = Bodies.rectangle(b.x, b.y, b.w, b.h, {
                    chamfer: {radius: b.radius || 12},
                    render: {fillStyle: b.color}
                });
                break;
            case "circle":
                board = Bodies.circle(b.x, b.y, b.radius, {
                    render: {fillStyle: b.color}
                });
                break;
            case "polygon":
                board = Bodies.polygon(b.x, b.y, b.sides, b.radius, {
                    render: {fillStyle: b.color}
                });
                break;
            default:
                board = Bodies.rectangle(b.x, b.y, b.w, b.h, {
                    render: {fillStyle: b.color}
                });
        }

        board.boardDef = b;
        Composite.add(world, board);
        boards.push(board);
    });

    // Create screws
    level.screws.forEach((s, i) => {
        const board = boards[s.boardIndex];
        const bdef = level.boards[s.boardIndex];

        if (!isScrewValid(s, bdef)) {
            console.warn("INVALID SCREW:", s);
            return;
        }

        const constraint = Constraint.create({
            pointA: {x: s.x, y: s.y},
            bodyB: board,
            pointB: {
                x: s.x - board.position.x,
                y: s.y - board.position.y
            },
            stiffness: 1,
            length: 0,
            render: {visible: false}
        });

        Composite.add(world, constraint);

        screws.push({
            constraint,
            x: s.x,
            y: s.y,
            index: i,
            rotation: 0,
            opacity: 1,
            scale: 1
        });
    });
    updateProgress();
}

function updateProgress() {
    const level = levels[currentLevel];
    const totalScrews = level.screws.length;
    if (totalScrews === 0) {
        progressBar.style.width = `0%`;
        return;
    }
    const removedCount = totalScrews - screws.length;
    const p = removedCount / totalScrews;
    progressBar.style.width = `${p * 100}%`;
}

function updateScrewToolBox() {
    const level = levels[currentLevel];
    const totalScrews = level.screws.length;
    if (totalScrews === 0) {
        screwToolbox.style.width = `0`;
        return;
    }
    const removedCount = totalScrews - screws.length;
    const p = removedCount / totalScrews;
    screwToolbox.style.width = `0`;
}

function unscrewScrew(screwObj, index) {
    if (isUnscrewing || isTransitioning) return;
    isUnscrewing = true;

    const duration = 600;
    const start = performance.now();

    function anim(t) {
        const p = Math.min((t - start) / duration, 1);

        screwObj.rotation = p * Math.PI * 6;
        screwObj.scale = 1 + Math.sin(p * Math.PI) * 0.3;
        screwObj.wobble = Math.sin(p * 12) * 2;
        screwObj.popY = -20 * Math.sin(p * Math.PI);
        screwObj.opacity = 1 - p;

        if (p < 1) {
            requestAnimationFrame(anim);
        } else {
            Composite.remove(world, screwObj.constraint);
            screws.splice(index, 1);

            // ADD SCREW TO TOOLBOX
            addScrewToToolbox(screwObj);
            updateProgress();

            isUnscrewing = false;

            // Check if all screws are removed
            if (screws.length === 0) {
                setTimeout(() => {
                    const nextLevel = currentLevel + 1;
                    if (nextLevel >= levels.length) {
                        currentLevel = 0; // Restart from first level
                    } else {
                        currentLevel = nextLevel;
                    }
                    transitionToNextLevel(currentLevel);
                }, 300);
            }
        }
    }

    requestAnimationFrame(anim);
}

function addScrewToToolbox(screwObj) {
    const screwEl = document.createElement("div");
    screwEl.classList.add("toolbox-screw");

    // Optional: animate into toolbox
    screwEl.style.opacity = "0";
    screwEl.style.transform = "scale(0.5)";

    screwToolbox.appendChild(screwEl);

    // Small delay for animation
    requestAnimationFrame(() => {
        screwEl.style.opacity = "1";
        screwEl.style.transform = "scale(1)";
    });

}

function transitionToNextLevel(nextLevelIndex) {
    if (isTransitioning) return;
    isTransitioning = true;

    const fadeDuration = 800;
    const start = performance.now();

    function fade(t) {
        const p = Math.min((t - start) / fadeDuration, 1);

        // Fade boards + push downward slightly
        boards.forEach(board => {
            board.render.opacity = 1 - p;
            Body.translate(board, {x: 0, y: p * 2});
        });

        // Fade screws visually (these are canvas drawn)
        screws.forEach(s => {
            s.opacity = 1 - p;
        });

        if (p < 1) {
            requestAnimationFrame(fade);
        } else {
            // Remove all old items
            boards.forEach(b => Composite.remove(world, b));
            screws.forEach(s => Composite.remove(world, s.constraint));

            boards = [];
            screws = [];

            // Load next level
            loadLevel(nextLevelIndex);

            isTransitioning = false;
        }
    }

    requestAnimationFrame(fade);
}

function getCanvasCoordinates(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = BASE_WIDTH / rect.width;
    const scaleY = BASE_HEIGHT / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function handleInteraction(x, y) {
    if (isUnscrewing || isTransitioning) return;

    const level = levels[currentLevel];
    const targetIndex = level.order[currentOrderIndex];

    screws.forEach((s, i) => {
        if (Math.hypot(s.x - x, s.y - y) < 18) {
            unscrewScrew(s, i);
        }
    });
}

canvas.addEventListener("click", e => {
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    handleInteraction(coords.x, coords.y);
});

canvas.addEventListener("touchstart", e => {
    e.preventDefault();
    const t = e.touches[0];
    const coords = getCanvasCoordinates(t.clientX, t.clientY);
    handleInteraction(coords.x, coords.y);
}, { passive: false });

restartBtn.addEventListener("click", () => {
    if (!isTransitioning) loadLevel(currentLevel);
});

Events.on(render, "afterRender", () => {
    const ctx = render.context;

    // Screws
    screws.forEach(s => {
        ctx.save();
        ctx.translate(s.x + (s.wobble || 0), s.y + (s.popY || 0));
        ctx.rotate(s.rotation || 0);
        ctx.scale(s.scale || 1, s.scale || 1);
        ctx.globalAlpha = s.opacity || 1;

        // screw body
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fillStyle ="#57ff00";
            // levels[currentLevel].order[currentOrderIndex] === s.index
            //     ? "#ffcc00"
            //     : "#57ff00";
        ctx.fill();

        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();

        // screw cross
        ctx.beginPath();
        ctx.moveTo(-4, -4);
        ctx.lineTo(4, 4);
        ctx.moveTo(4, -4);
        ctx.lineTo(-4, 4);
        ctx.strokeStyle = "#222";
        ctx.stroke();

        ctx.restore();
    });

    // Fade falling boards
    boards.forEach(b => {
        if (b.isFalling) {
            b.render.opacity = b.fade;
            b.fade -= 0.02;
            if (b.fade < 0) b.fade = 0;
        }
    });
});

loadLevel(currentLevel);

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("canvas") });
//
// renderer.setSize(window.innerWidth, window.innerHeight);
//
// // Light
// const light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
// scene.add(light);
//
// // Load 3D model
// // const loader = new THREE.GLTFLoader();
// // loader.load('models/myModel.glb', function(gltf) {
// //     scene.add(gltf.scene);
// // const loader = new THREE.OBJLoader();
// // loader.load('models/myModel.obj', function(object) {
// //     scene.add(object);
// const loader = new THREE.FBXLoader();
// loader.load('./2D/screw-3D-model.fbx', function(object) {
//     scene.add(object);
// }, undefined, function(error) {
//     console.error(error);
// });
//
// camera.position.z = 5;
//
// // Render loop
// function animate() {
//     requestAnimationFrame(animate);
//     renderer.render(scene, camera);
// }
// animate();
