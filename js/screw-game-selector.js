// Screw Game Level Selection System with Auto-Detection

function initializeLevelGrid() {
    const levelGrid = document.getElementById('levelGrid');
    const levelSelectionScreen = document.getElementById('levelSelectionScreen');
    
    if (!levelGrid) return;
    
    // Clear existing buttons
    levelGrid.innerHTML = '';
    
    // Get total number of levels from levels object
    const totalLevels = Object.keys(levels).length;
    
    // Load completed levels from localStorage
    const completedLevels = JSON.parse(localStorage.getItem('completedScrewGameLevels')) || [];
    
    // Create level buttons dynamically
    for (let i = 1; i <= totalLevels; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.dataset.level = i;
        btn.textContent = i;
        
        // Add completed class if level is completed
        if (completedLevels.includes(i)) {
            btn.classList.add('completed');
        }
        
        // Add click event to start level
        btn.addEventListener('click', () => {
            selectLevel(i);
        });
        
        // Add touch event support
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btn.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.style.transform = 'scale(1)';
            selectLevel(i);
        });
        
        levelGrid.appendChild(btn);
    }
}

function selectLevel(levelNum) {
    // Validate level exists
    if (!levels[levelNum]) {
        console.error(`Level ${levelNum} does not exist`);
        return;
    }
    
    // Hide level selection screen
    const levelSelectionScreen = document.getElementById('levelSelectionScreen');
    if (levelSelectionScreen) {
        levelSelectionScreen.style.display = 'none';
    }
    
    // Initialize and start the level
    if (levels[levelNum].init) {
        levels[levelNum].init();
    }
    
    startGame(levelNum);
    console.log(`Level ${levelNum} selected`);
}

function markLevelCompleted(levelNum) {
    // Get existing completed levels from localStorage
    let completedLevels = JSON.parse(localStorage.getItem('completedScrewGameLevels')) || [];
    
    // Add this level if not already completed
    if (!completedLevels.includes(levelNum)) {
        completedLevels.push(levelNum);
        localStorage.setItem('completedScrewGameLevels', JSON.stringify(completedLevels));
    }
    
    // Update level display to show completion
    updateLevelDisplay();
}

function goBackToLevelSelection() {
    // Show level selection screen
    const levelSelectionScreen = document.getElementById('levelSelectionScreen');
    if (levelSelectionScreen) {
        levelSelectionScreen.style.display = 'flex';
    }
    
    // Reset game state
    gameStarted = false;
}

function updateLevelDisplay() {
    // Update completed level badges
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

// ===== Event Listeners =====

// Menu button - return to level selection

// Initialize on window load
window.addEventListener('load', () => {
    initializeLevelGrid();
});
