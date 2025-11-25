// Puzzle Craft Game - Level by Level System
class PuzzleCraft {
    constructor() {
        this.container = document.getElementById('puzzle-container');
        this.size = 3;
        this.tiles = [];
        this.imageURL = '';
        this.moveCount = 0;
        this.seconds = 0;
        this.timerInterval = null;
        this.currentLevel = 1;
        this.selectedLevel = 1;
        this.paused = false;
        this.hintsUsed = 0;
        this.maxHints = 3;
        this.completedLevels = new Set(JSON.parse(localStorage.getItem('completedLevels') || '[]'));
        this.draggedTile = null;

        this.setupEventListeners();
        this.setupUI();
        this.createLevelSelect();
    }

    setupEventListeners() {
        // Drag and drop events
        this.container.addEventListener('dragstart', (e) => this.handleDragStart(e));
        this.container.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.container.addEventListener('drop', (e) => this.handleDrop(e));
        this.container.addEventListener('dragend', (e) => this.handleDragEnd(e));

        // Touch events for mobile
        this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.container.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.container.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.tiles.length > 0) {
                    this.createTiles();
                }
            }, 150);
        });

        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (this.tiles.length > 0) {
                    this.createTiles();
                }
            }, 100);
        });
    }

    setupUI() {
        document.getElementById('backBtn').addEventListener('click', () => {
            if (this.timerInterval) {
                this.paused = true;
                clearInterval(this.timerInterval);
            }
            this.showLevelSelect();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        // document.getElementById('hintBtn').addEventListener('click', () => this.giveHint());
        document.getElementById('previewBtn').addEventListener('click', () => this.showPreview());
        document.getElementById('close-preview').addEventListener('click', () => this.hidePreview());
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        document.getElementById('levelSelectBtn').addEventListener('click', () => this.showLevelSelect());
        document.getElementById('levelSelectBtn2').addEventListener('click', () => this.showLevelSelect());
        document.getElementById('replayBtn').addEventListener('click', () => this.restartLevel());
    }

    createLevelSelect() {
        const levelGrid = document.getElementById('levelGrid');
        levelGrid.innerHTML = '';

        // Get all levels from the levels file
        const allLevels = this.getAllLevels();

        allLevels.forEach((level, index) => {
            const levelNum = index + 1;
            const isLocked = levelNum > 1 && !this.completedLevels.has(levelNum - 1);
            const isCompleted = this.completedLevels.has(levelNum);

            const card = document.createElement('div');
            card.className = `level-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`;

            const img = document.createElement('img');
            img.src = level.image;
            img.alt = `Level ${levelNum}`;
            img.className = 'level-preview';
            img.onerror = () => {
                img.style.display = 'none';
                card.innerHTML = `<div style="padding: 20px; text-align: center;">Level ${levelNum}</div>`;
            };

            const number = document.createElement('div');
            number.className = 'level-number';
            number.textContent = levelNum;

            card.appendChild(img);
            card.appendChild(number);

            if (!isLocked) {
                card.addEventListener('click', () => this.startLevel(levelNum));
            }

            levelGrid.appendChild(card);
        });
    }

    getAllLevels() {
        // Collect all levels from all chapters
        const allLevels = [];
        for (const chapterKey in chapters) {
            const chapter = chapters[chapterKey];
            if (chapter.levels) {
                chapter.levels.forEach(level => {
                    allLevels.push(level);
                });
            }
        }
        return allLevels;
    }

    showLevelSelect() {
        this.paused = false;
        clearInterval(this.timerInterval);
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('levelSelectScreen').classList.remove('hidden');
        this.createLevelSelect();
    }

    startLevel(levelNum) {
        this.selectedLevel = levelNum;
        this.currentLevel = levelNum;
        this.moveCount = 0;
        this.seconds = 0;
        this.hintsUsed = 0;
        this.paused = false;

        const allLevels = this.getAllLevels();
        const level = allLevels[levelNum - 1];

        if (!level) {
            alert('Level not found!');
            return;
        }

        this.size = level.size || 3;
        this.imageURL = level.image;

        // Hide level select and show game screen
        document.getElementById('levelSelectScreen').classList.add('hidden');
        document.getElementById('win-overlay').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');

        // Update display first
        this.updateDisplay();
        // this.updateHintsDisplay();
        this.loadBestScore();

        // Preload image first, then create tiles
        const img = new Image();
        img.onload = () => {
            // Wait a bit for screen to be visible, then create tiles
            setTimeout(() => {
                this.createTiles();
                this.startTimer();
            }, 300);
        };
        img.onerror = () => {
            // Still try to create tiles (might show broken image, but at least tiles will appear)
            setTimeout(() => {
                this.createTiles();
                this.startTimer();
            }, 300);
        };
        img.src = this.imageURL;
    }

    createTiles() {
        if (!this.imageURL) {
            return;
        }

        this.tiles = [];
        this.container.innerHTML = '';
        
        // Function to actually create tiles
        const createTilesNow = () => {
            const gameBoardContainer = document.querySelector('.game-board-container');
            if (!gameBoardContainer) {
                return;
            }

            // Force a layout recalculation
            gameBoardContainer.offsetHeight;
            
            const containerRect = gameBoardContainer.getBoundingClientRect();
            
            // Calculate available space (with fallback)
            let availableWidth = containerRect.width - 20;
            let availableHeight = containerRect.height - 20;
            
            // Fallback if container not visible yet
            if (availableWidth <= 0 || availableHeight <= 0) {
                availableWidth = window.innerWidth - 100;
                availableHeight = window.innerHeight - 250;
            }
            
            const maxSize = Math.min(availableWidth, availableHeight, 600);
            const containerSize = Math.max(200, Math.floor(maxSize)); // Minimum 200px
            const tileSize = Math.floor(containerSize / this.size);

            // Set container dimensions
            this.container.style.width = `${containerSize}px`;
            this.container.style.height = `${containerSize}px`;
            this.container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
            this.container.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
            this.container.style.gap = '2px';
            this.container.style.display = 'grid';

            // Create tiles
            for (let row = 0; row < this.size; row++) {
                for (let col = 0; col < this.size; col++) {
                    const tile = document.createElement('div');
                    tile.className = 'puzzle-tile';
                    tile.setAttribute('draggable', 'true');
                    tile.dataset.order = row * this.size + col;
                    tile.dataset.row = row;
                    tile.dataset.col = col;

                    // Set background image
                    tile.style.backgroundImage = `url(${this.imageURL})`;
                    tile.style.backgroundSize = `${containerSize}px ${containerSize}px`;
                    tile.style.backgroundPosition = `${-col * tileSize}px ${-row * tileSize}px`;
                    tile.style.width = '100%';
                    tile.style.height = '100%';
                    tile.style.minWidth = '0';
                    tile.style.minHeight = '0';
                    tile.style.display = 'block';

                    this.container.appendChild(tile);
                    this.tiles.push(tile);
                }
            }

            // Shuffle after creating tiles
            if (this.tiles.length > 0) {
                setTimeout(() => {
                    this.shuffleTiles();
                }, 100);
            }
        };

        // Wait for container to be visible
        setTimeout(() => {
            createTilesNow();
        }, 150);
    }

    shuffleTiles() {
        if (!this.tiles || this.tiles.length <= 1) {
            return;
        }

        // Get current tiles from DOM (they might have been reordered)
        const currentTiles = Array.from(this.container.children);
        if (currentTiles.length !== this.tiles.length) {
            return;
        }

        let shuffled;
        let attempts = 0;
        do {
            // Create a new array with shuffled order
            shuffled = [...currentTiles].sort(() => Math.random() - 0.5);
            attempts++;
            if (attempts > 100) break; // Prevent infinite loop
        } while (this.isSolved(shuffled));

        // Reorder tiles in DOM
        shuffled.forEach(tile => {
            this.container.appendChild(tile);
        });

    }

    handleDragStart(e) {
        if (this.paused) {
            e.preventDefault();
            return;
        }
        this.draggedTile = e.target;
        if (!this.draggedTile.classList.contains('puzzle-tile')) return;
        this.draggedTile.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        const img = new Image();
        img.src = '';
        e.dataTransfer.setDragImage(img, 0, 0);

        // Play sound
        const swapSound = document.getElementById('drag-sound');
        if (swapSound) swapSound.play().catch(() => {});
    }

    handleDragOver(e) {
        e.preventDefault();
        const target = e.target;
        if (!target.classList.contains('puzzle-tile') || target === this.draggedTile) return;
        target.classList.add('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        const targetTile = e.target;
        if (!targetTile.classList.contains('puzzle-tile') || targetTile === this.draggedTile) return;

        if (this.draggedTile) {
            this.swapTiles(this.draggedTile, targetTile);
            this.moveCount++;
            this.updateDisplay();

            // Play sound
            const swapSound = document.getElementById('swap-sound');
            if (swapSound) swapSound.play().catch(() => {});
        }
    }

    handleDragEnd(e) {
        if (this.draggedTile) {
            this.draggedTile.classList.remove('dragging');
            this.container.querySelectorAll('.drag-over').forEach(t => t.classList.remove('drag-over'));
        }
        this.draggedTile = null;
    }

    // Touch events for mobile
    touchStartPos = null;
    touchStartTile = null;

    handleTouchStart(e) {
        if (this.paused) return;
        const touch = e.touches[0];
        const tile = e.target.closest('.puzzle-tile');
        if (tile) {
            this.touchStartPos = { x: touch.clientX, y: touch.clientY };
            this.touchStartTile = tile;
        }

        // Play sound
        const swapSound = document.getElementById('drag-sound');
        if (swapSound) swapSound.play().catch(() => {});
    }

    handleTouchMove(e) {
        if (!this.touchStartTile) return;
        e.preventDefault();
    }

    handleTouchEnd(e) {
        if (!this.touchStartTile || !this.touchStartPos) return;

        const touch = e.changedTouches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetTile = element?.closest('.puzzle-tile');

        if (targetTile && targetTile !== this.touchStartTile) {
            // Swap the two tiles
            this.swapTiles(this.touchStartTile, targetTile);
            this.moveCount++;
            this.updateDisplay();

            const swapSound = document.getElementById('swap-sound');
            if (swapSound) swapSound.play().catch(() => {});
        }

        this.touchStartPos = null;
        this.touchStartTile = null;
    }

    swapTiles(tile1, tile2) {
        tile1.classList.add('swapping');
        tile2.classList.add('swapping');

        setTimeout(() => {
            const parent = tile1.parentNode;
            const placeholder = document.createElement('div');
            parent.replaceChild(placeholder, tile1);
            parent.replaceChild(tile1, tile2);
            parent.replaceChild(tile2, placeholder);

            tile1.classList.remove('swapping');
            tile2.classList.remove('swapping');
            if (this.isSolved()) {
                this.completeLevel();
            }
        }, 150);
    }

    isSolved(tilesArray = null) {
        const tiles = tilesArray || Array.from(this.container.children);
        return tiles.every((tile, index) => {
            return parseInt(tile.dataset.order, 10) === index;
        });
    }

    completeLevel() {
        this.paused = true;
        clearInterval(this.timerInterval);
        this.completedLevels.add(this.currentLevel);
        localStorage.setItem('completedLevels', JSON.stringify(Array.from(this.completedLevels)));

        this.checkAndSaveBestScore();

        // Play win sound
        const winSound = document.getElementById('win-sound');
        if (winSound) winSound.play().catch(() => {});

        // Update win overlay
        document.getElementById('win-moves').textContent = this.moveCount;
        const mins = String(Math.floor(this.seconds / 60)).padStart(2, '0');
        const secs = String(this.seconds % 60).padStart(2, '0');
        document.getElementById('win-time').textContent = `${mins}:${secs}`;
        document.getElementById('win-best').textContent = this.getBestScoreDisplay();

        // Show next level button only if there's a next level
        const allLevels = this.getAllLevels();
        const nextLevelBtn = document.getElementById('nextLevelBtn');
        if (this.currentLevel < allLevels.length) {
            nextLevelBtn.style.display = 'block';
        } else {
            nextLevelBtn.style.display = 'none';
        }

        document.getElementById('win-overlay').classList.remove('hidden');
    }

    nextLevel() {
        const allLevels = this.getAllLevels();
        if (this.currentLevel < allLevels.length) {
            this.startLevel(this.currentLevel + 1);
        } else {
            // All levels completed
            alert('🎉 Congratulations! You completed all levels!');
            this.showLevelSelect();
        }
    }

    restartLevel() {
        this.startLevel(this.currentLevel);
    }

    togglePause() {
        this.paused = !this.paused;
        const pauseOverlay = document.getElementById('pause-overlay');
        
        if (this.paused) {
            clearInterval(this.timerInterval);
            pauseOverlay.classList.remove('hidden');
        } else {
            this.startTimer();
            pauseOverlay.classList.add('hidden');
        }
    }

    // giveHint() {
    //     if (this.hintsUsed >= this.maxHints || this.paused) return;
    //
    //     const tiles = Array.from(this.container.children);
    //     const wrongTile = tiles.find((tile, index) => {
    //         return parseInt(tile.dataset.order, 10) !== index;
    //     });
    //
    //     if (wrongTile) {
    //         wrongTile.style.boxShadow = '0 0 30px yellow, 0 0 60px yellow';
    //         setTimeout(() => {
    //             wrongTile.style.boxShadow = '';
    //         }, 2000);
    //         this.hintsUsed++;
    //         this.updateHintsDisplay();
    //     }
    // }

    showPreview() {
        const previewPanel = document.getElementById('preview-panel');
        const previewImage = document.getElementById('preview-image');
        previewImage.src = this.imageURL;
        previewPanel.classList.remove('hidden');
    }

    hidePreview() {
        document.getElementById('preview-panel').classList.add('hidden');
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!this.paused) {
                this.seconds++;
                this.updateDisplay();
            }
        }, 1000);
    }

    updateDisplay() {
        document.getElementById('levelDisplay').textContent = this.currentLevel;
        document.getElementById('moveCount').textContent = this.moveCount;
        const mins = String(Math.floor(this.seconds / 60)).padStart(2, '0');
        const secs = String(this.seconds % 60).padStart(2, '0');
        document.getElementById('timer').textContent = `${mins}:${secs}`;
        this.loadBestScore();
    }

    // updateHintsDisplay() {
    //     document.getElementById('hints-left').textContent = this.maxHints - this.hintsUsed;
    // }

    checkAndSaveBestScore() {
        const key = `bestScore_${this.currentLevel}`;
        const bestScore = localStorage.getItem(key);
        const currentScore = this.moveCount * 1000 + this.seconds; // Lower is better

        if (!bestScore || currentScore < parseInt(bestScore)) {
            localStorage.setItem(key, currentScore);
        }
    }

    loadBestScore() {
        const key = `bestScore_${this.currentLevel}`;
        const bestScore = localStorage.getItem(key);

        if (bestScore) {
            const score = parseInt(bestScore);
            const moves = Math.floor(score / 1000);
            const time = score % 1000;
            const mins = String(Math.floor(time / 60)).padStart(2, '0');
            const secs = String(time % 60).padStart(2, '0');
            document.getElementById('bestScore').textContent = `${moves} / ${mins}:${secs}`;
        } else {
            document.getElementById('bestScore').textContent = '—';
        }
    }

    getBestScoreDisplay() {
        const key = `bestScore_${this.currentLevel}`;
        const bestScore = localStorage.getItem(key);

        if (bestScore) {
            const score = parseInt(bestScore);
            const moves = Math.floor(score / 1000);
            const time = score % 1000;
            const mins = String(Math.floor(time / 60)).padStart(2, '0');
            const secs = String(time % 60).padStart(2, '0');
            return `${moves} moves, ${mins}:${secs}`;
        }
        return '—';
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new PuzzleCraft();
});
