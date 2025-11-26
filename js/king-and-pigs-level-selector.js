// Level Selection System
let completedLevels = JSON.parse(localStorage.getItem('completedKingPigsLevels')) || [];
let selectedLevel = 1;
let gameStarted = false;

// Initialize level grid
function initializeLevelGrid() {
    const levelGrid = document.getElementById('levelGrid');
    levelGrid.innerHTML = '';
    
    // Calculate total levels from levels object
    const totalLevels = Object.keys(levels).length;
    
    for (let i = 1; i <= totalLevels; i++) {
        const levelBtn = document.createElement('button');
        levelBtn.className = 'level-btn';
        
        if (completedLevels.includes(i)) {
            levelBtn.classList.add('completed');
        }
        
        levelBtn.textContent = i;
        levelBtn.setAttribute('aria-label', `Level ${i}`);
        
        levelBtn.addEventListener('click', () => {
            selectLevel(i);
        });
        
        levelGrid.appendChild(levelBtn);
    }
    
    // Update stats
    const totalLevels2 = Object.keys(levels).length;
    document.getElementById('levelCount').textContent = 
        `Completed: ${completedLevels.length} / ${totalLevels2} Levels`;
}

// Select a level
function selectLevel(levelNum) {
    selectedLevel = levelNum;
    level = levelNum;
    
    // Kill any running GSAP animations on overlay and reset
    if (typeof gsap !== 'undefined' && typeof overlay !== 'undefined') {
        gsap.killTweensOf(overlay);
        overlay.opacity = 0;
    }
    
    // Reset overlay opacity to prevent black screen
    if (typeof overlay !== 'undefined') {
        overlay.opacity = 0;
    }
    
    // Hide level selection screen
    const levelSelectionScreen = document.getElementById('levelSelectionScreen');
    if (levelSelectionScreen) {
        levelSelectionScreen.classList.add('hidden');
    }
    
    // Start the game
    gameStarted = true;
    gameState = 'playing';
    startGame();
}

// Mark level as completed
function markLevelCompleted(levelNum) {
    if (!completedLevels.includes(levelNum)) {
        completedLevels.push(levelNum);
        localStorage.setItem('completedKingPigsLevels', JSON.stringify(completedLevels));
    }
}

// Go back to level selection
function goBackToLevelSelection() {
    gameStarted = false;
    gameState = 'menu';
    
    // Kill any running GSAP animations on overlay
    if (typeof gsap !== 'undefined' && typeof overlay !== 'undefined') {
        gsap.killTweensOf(overlay);
        overlay.opacity = 0;
    }
    
    const levelSelectionScreen = document.getElementById('levelSelectionScreen');
    if (levelSelectionScreen) {
        levelSelectionScreen.classList.remove('hidden');
    }
    
    // Reset overlay opacity to prevent black screen
    if (typeof overlay !== 'undefined') {
        overlay.opacity = 0;
    }
    
    // Reset canvas
    if (canvas) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Check if player completed the level (when entering door)
function checkLevelComplete() {
    if (gameStarted && selectedLevel > 0) {
        markLevelCompleted(selectedLevel);
    }
}

// Add menu button click handler
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            if (gameStarted) {
                goBackToLevelSelection();
                initializeLevelGrid();
            }
        });
    }
});

// Add keyboard shortcut to go back to level selection (ESC key)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gameStarted) {
        goBackToLevelSelection();
        initializeLevelGrid();
    }
});

// Initialize on page load
window.addEventListener('load', () => {
    initializeLevelGrid();
    
    // Check if levels object is loaded
    if (typeof levels !== 'undefined') {
        const totalLevels = Object.keys(levels).length;
        console.log(`Level Selection: ${totalLevels} levels loaded`);
    }
});
