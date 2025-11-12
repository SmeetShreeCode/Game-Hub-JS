const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

// Game state
let gameStarted = false;
let selectedLevel = 1;
let screwRotations = [0, 0, 0, 0, 0, 0];
let rotationHistory = [];
let currentShapeStates = {}; // runtime map of shapeId -> released boolean

const board = {
    head: [0, 0],
    tail: [0, 0],
};

console.log(canvas);

// ===== Mobile Controls =====
const rotateLeftBtn = document.getElementById('rotateLeftBtn');
const rotateRightBtn = document.getElementById('rotateRightBtn');
const undoBtn = document.getElementById('undoBtn');
const menuBtn = document.getElementById('menuBtn');

// Mobile control event handlers with touch support
function setupMobileControls() {
    // Rotate Left Button
    if (rotateLeftBtn) {
        rotateLeftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            rotateLeftBtn.classList.add('active');
            rotateAllScrewsLeft();
        });
        rotateLeftBtn.addEventListener('touchend', () => {
            rotateLeftBtn.classList.remove('active');
        });
        rotateLeftBtn.addEventListener('mousedown', () => {
            rotateLeftBtn.classList.add('active');
            rotateAllScrewsLeft();
        });
        rotateLeftBtn.addEventListener('mouseup', () => {
            rotateLeftBtn.classList.remove('active');
        });
    }

    // Rotate Right Button
    if (rotateRightBtn) {
        rotateRightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            rotateRightBtn.classList.add('active');
            rotateAllScrewsRight();
        });
        rotateRightBtn.addEventListener('touchend', () => {
            rotateRightBtn.classList.remove('active');
        });
        rotateRightBtn.addEventListener('mousedown', () => {
            rotateRightBtn.classList.add('active');
            rotateAllScrewsRight();
        });
        rotateRightBtn.addEventListener('mouseup', () => {
            rotateRightBtn.classList.remove('active');
        });
    }

    // Undo Button
    if (undoBtn) {
        undoBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            undoBtn.classList.add('active');
            undoLastMove();
        });
        undoBtn.addEventListener('touchend', () => {
            undoBtn.classList.remove('active');
        });
        undoBtn.addEventListener('mousedown', () => {
            undoBtn.classList.add('active');
            undoLastMove();
        });
        undoBtn.addEventListener('mouseup', () => {
            undoBtn.classList.remove('active');
        });
    }

    // Menu Button
    if (menuBtn) {
        menuBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            menuBtn.classList.add('active');
            goBackToLevelSelection();
        });
        menuBtn.addEventListener('touchend', () => {
            menuBtn.classList.remove('active');
        });
        menuBtn.addEventListener('mousedown', () => {
            menuBtn.classList.add('active');
            goBackToLevelSelection();
        });
        menuBtn.addEventListener('mouseup', () => {
            menuBtn.classList.remove('active');
        });
    }
}

// ===== Screw interactions (per-screw) =====
function setupScrewInteractions() {
    const screws = document.querySelectorAll('.screw');
    screws.forEach((screw) => {
        const idx = parseInt(screw.dataset.index, 10);
        if (Number.isNaN(idx)) return;

        // Long-press detection for counter-rotate vs tap rotate
        let pressTimer = null;
        let longPress = false;
        const longPressThreshold = 550; // ms

        function startPress(e) {
            e.preventDefault();
            longPress = false;
            pressTimer = setTimeout(() => {
                longPress = true;
            }, longPressThreshold);
        }

        function endPress(e) {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
            if (longPress) {
                // rotate counter-clockwise on long-press
                rotateSingleScrew(idx, -90);
            } else {
                // short tap: rotate clockwise
                rotateSingleScrew(idx, 90);
            }
        }

        // Mouse events
        screw.addEventListener('mousedown', startPress);
        screw.addEventListener('mouseup', endPress);
        screw.addEventListener('mouseleave', () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });

        // Touch events
        screw.addEventListener('touchstart', startPress, { passive: false });
        screw.addEventListener('touchend', endPress);

        // Right-click (desktop) rotate counter-clockwise
        screw.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            rotateSingleScrew(idx, -90);
        });
    });
}

function rotateSingleScrew(index, deltaDegrees) {
    // Save state for undo
    rotationHistory.push([...screwRotations]);
    screwRotations[index] += deltaDegrees;
    // Normalize to integer
    screwRotations[index] = Math.round(screwRotations[index]);
    updateScrewDisplay();
    updateShapesDisplay();
    checkWinCondition();
}

function updateShapesDisplay() {
    const level = levels[selectedLevel];
    const shapesContainer = document.getElementById('shapesContainer');
    const screwsContainer = document.getElementById('screwsContainer');
    if (!level || !Array.isArray(level.shapes) || !shapesContainer || !screwsContainer) return;

    // For each shape ensure an overlay exists positioned over its screws
    level.shapes.forEach((shape) => {
        let overlay = document.getElementById(`shape-overlay-${shape.id}`);
        // Compute bounding box of the screws for this shape
        const screwRects = shape.screws.map(si => {
            const el = document.querySelector(`.screw[data-index='${si}']`);
            return el ? el.getBoundingClientRect() : null;
        }).filter(Boolean);

        if (screwRects.length === 0) return;

        const containerRect = screwsContainer.getBoundingClientRect();
        const left = Math.min(...screwRects.map(r => r.left)) - containerRect.left - 8; // padding
        const top = Math.min(...screwRects.map(r => r.top)) - containerRect.top - 8;
        const right = Math.max(...screwRects.map(r => r.right)) - containerRect.left + 8;
        const bottom = Math.max(...screwRects.map(r => r.bottom)) - containerRect.top + 8;
        const width = Math.max(36, right - left);
        const height = Math.max(28, bottom - top);

        if (!overlay) {
            // Create an inline SVG overlay so we can style it with .shape-svg CSS
            const SVG_NS = 'http://www.w3.org/2000/svg';
            overlay = document.createElementNS(SVG_NS, 'svg');
            overlay.setAttribute('xmlns', SVG_NS);
            overlay.setAttribute('id', `shape-overlay-${shape.id}`);
            overlay.classList.add('shape-svg');

            // Rectangle background
            const rect = document.createElementNS(SVG_NS, 'rect');
            rect.setAttribute('class', 'shape-rect');
            rect.setAttribute('x', '0');
            rect.setAttribute('y', '0');
            rect.setAttribute('rx', '8');
            rect.setAttribute('ry', '8');
            overlay.appendChild(rect);

            // Label text
            const text = document.createElementNS(SVG_NS, 'text');
            text.setAttribute('class', 'shape-text');
            text.setAttribute('x', '50%');
            text.setAttribute('y', '50%');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = shape.name;
            overlay.appendChild(text);

            shapesContainer.appendChild(overlay);
        }

        // Position and size the SVG overlay. We set both CSS and SVG attributes so
        // CSS positioning and internal scaling via viewBox work correctly.
        overlay.style.position = 'absolute';
        overlay.style.left = `${left}px`;
        overlay.style.top = `${top}px`;
        overlay.style.width = `${width}px`;
        overlay.style.height = `${height}px`;
        overlay.setAttribute('width', `${width}`);
        overlay.setAttribute('height', `${height}`);
        overlay.setAttribute('viewBox', `0 0 ${width} ${height}`);

        const isReleased = shape.screws.every(si => ((screwRotations[si] % 360 + 360) % 360) === ((shape.requiredAngle % 360 + 360) % 360));
        currentShapeStates[shape.id] = isReleased;
        if (isReleased) {
            overlay.classList.add('released');
            // remove overlay after animation to keep DOM clean
            setTimeout(() => {
                const el = document.getElementById(`shape-overlay-${shape.id}`);
                if (el && el.parentNode) el.parentNode.removeChild(el);
            }, 500);
        } else {
            overlay.classList.remove('released');
            // Ensure label text is up-to-date (in case name changed)
            const textEl = overlay.querySelector('.shape-text');
            if (textEl) textEl.textContent = shape.name;
        }
    });
}

// ===== Game Functions =====
function rotateAllScrewsLeft() {
    console.log('Rotate all screws left');
    // Save current state to history
    rotationHistory.push([...screwRotations]);
    // Rotate each screw left (counter-clockwise = -90 degrees)
    for (let i = 0; i < screwRotations.length; i++) {
        screwRotations[i] -= 90;
    }
    updateScrewDisplay();
    checkWinCondition();
}

function rotateAllScrewsRight() {
    console.log('Rotate all screws right');
    // Save current state to history
    rotationHistory.push([...screwRotations]);
    // Rotate each screw right (clockwise = +90 degrees)
    for (let i = 0; i < screwRotations.length; i++) {
        screwRotations[i] += 90;
    }
    updateScrewDisplay();
    checkWinCondition();
}

function undoLastMove() {
    if (rotationHistory.length > 0) {
        screwRotations = rotationHistory.pop();
        updateScrewDisplay();
        console.log('Undo performed');
    }
}


function updateScrewDisplay() {
    const screwElements = document.querySelectorAll('.screw');
    screwElements.forEach((screw, index) => {
        screw.style.transform = `rotate(${screwRotations[index]}deg)`;
    });
    // Also refresh shapes display if level active
    updateShapesDisplay();
}
function checkWinCondition() {
    const level = levels[selectedLevel];
    if (level && Array.isArray(level.shapes) && level.shapes.length > 0) {
        // Level completion when all shapes are released
        const allReleased = level.shapes.every(s => !!currentShapeStates[s.id]);
        if (allReleased) {
            console.log('All shapes released - level complete');
            levelComplete();
        }
        return;
    }

    // Fallback: All screws aligned to 0 degrees (or multiple of 360)
    let allAligned = screwRotations.every(rotation => ((rotation % 360 + 360) % 360) === 0);
    if (allAligned && screwRotations.some(r => r !== 0)) {
        console.log('Level completed!');
        levelComplete();
    }
}

function levelComplete() {
    alert(`Level ${selectedLevel} Completed! 🎉`);
    markLevelCompleted(selectedLevel);
    goBackToLevelSelection();
}

function goBackToLevelSelection() {
    gameStarted = false;
    selectedLevel = 1;
    screwRotations = [0, 0, 0, 0, 0, 0];
    rotationHistory = [];
    updateScrewDisplay();
    document.getElementById('levelSelectionScreen').style.display = 'flex';
}

function startGame(levelNum) {
    gameStarted = true;
    selectedLevel = levelNum;
    screwRotations = [0, 0, 0, 0, 0, 0];
    rotationHistory = [];
    // Reset shape runtime states and visuals
    currentShapeStates = {};
    const shapesContainer = document.getElementById('shapesContainer');
    if (shapesContainer) shapesContainer.innerHTML = '';
    updateScrewDisplay();
    console.log(`Starting Level ${levelNum}`);
}

function markLevelCompleted(levelNum) {
    let completedLevels = JSON.parse(localStorage.getItem('completedScrewGameLevels')) || [];
    if (!completedLevels.includes(levelNum)) {
        completedLevels.push(levelNum);
        localStorage.setItem('completedScrewGameLevels', JSON.stringify(completedLevels));
    }
    updateLevelDisplay();
}

function updateLevelDisplay() {
    const completedLevels = JSON.parse(localStorage.getItem('completedScrewGameLevels')) || [];
    const levelBtns = document.querySelectorAll('.level-btn');
    levelBtns.forEach(btn => {
        const levelNum = parseInt(btn.dataset.level);
        if (completedLevels.includes(levelNum)) {
            btn.classList.add('completed');
        } else {
            btn.classList.remove('completed');
        }
    });
}

// ===== Keyboard Controls =====
document.addEventListener('keydown', (e) => {
    if (!gameStarted) return;
    
    if (e.key === 'ArrowLeft') {
        rotateAllScrewsLeft();
    } else if (e.key === 'ArrowRight') {
        rotateAllScrewsRight();
    } else if (e.key === 'u' || e.key === 'U') {
        undoLastMove();
    } else if (e.key === 'Escape') {
        goBackToLevelSelection();
    }
});

// ===== Prevent Pinch Zoom =====
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

// ===== Initialize =====
window.addEventListener('load', () => {
    setupMobileControls();
    setupScrewInteractions();
    // Prepare shapes UI for the default/selected level
    updateShapesDisplay();
});

