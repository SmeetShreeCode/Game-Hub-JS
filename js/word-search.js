// Word Search Game - Level by Level System
class WordSearchGame {
    constructor() {
        this.currentLevel = 1;
        this.selectedLevel = 1;
        this.completedLevels = new Set();
        this.score = 0;
        this.paused = false;
        this.timer = 0;
        this.timerInterval = null;

        // Current game state
        this.words = [];
        this.grid = [];
        this.gridSize = 15;
        this.foundWords = new Set();
        this.selectedCells = [];
        this.wordPositions = {}; // Store word positions for validation

        // DOM elements
        this.levelSelectScreen = document.getElementById('levelSelectScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.levelGrid = document.getElementById('levelGrid');
        this.wordGrid = document.getElementById('wordGrid');
        this.wordList = document.getElementById('wordList');

        // Load completed levels from localStorage
        this.loadProgress();

        // Initialize
        this.setupUI();
        this.createLevelSelect();
    }

    loadProgress() {
        const saved = localStorage.getItem('wordsearch_completed');
        if (saved) {
            this.completedLevels = new Set(JSON.parse(saved));
        }

        const savedScore = localStorage.getItem('wordsearch_score');
        if (savedScore) {
            this.score = parseInt(savedScore) || 0;
        }
    }

    saveProgress() {
        localStorage.setItem('wordsearch_completed', JSON.stringify([...this.completedLevels]));
        localStorage.setItem('wordsearch_score', this.score.toString());
    }

    createLevelSelect() {
        this.levelGrid.innerHTML = '';

        wordSearchLevels.forEach((level, index) => {
            const levelNum = index + 1;
            const isLocked = levelNum > 1 && !this.completedLevels.has(levelNum - 1);
            const isCompleted = this.completedLevels.has(levelNum);

            const card = document.createElement('div');
            card.className = `level-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`;

            if (!isLocked) {
                card.addEventListener('click', () => this.startLevel(levelNum));
            }

            card.innerHTML = `
                <div class="level-number">${levelNum}</div>
                ${level.category ? `<div class="level-preview">${level.category}</div>` : ''}
            `;

            this.levelGrid.appendChild(card);
        });
    }

    startLevel(levelNum) {
        if (levelNum < 1 || levelNum > wordSearchLevels.length) return;

        this.selectedLevel = levelNum;
        this.currentLevel = levelNum;
        const level = wordSearchLevels[levelNum - 1];

        if (!level || !level.words || level.words.length === 0) return;

        // Reset game state
        this.words = level.words.map(w => w.toUpperCase());
        this.foundWords.clear();
        this.selectedCells = [];
        this.wordPositions = {};
        this.paused = false;
        this.timer = 0;
        this.selectionDirection = null; // Track selection direction

        // Use grid size from level, or calculate based on words
        if (level.gridSize) {
            this.gridSize = level.gridSize;
        } else {
            const maxWordLength = Math.max(...this.words.map(w => w.length));
            this.gridSize = Math.max(15, maxWordLength + 5);
        }

        // Show game screen
        this.levelSelectScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');

        // Generate grid
        this.generateGrid();

        // Update UI
        this.updateDisplay();
        this.renderWordList();
        this.renderGrid();
        this.startTimer();
    }

    generateGrid() {
        // Initialize empty grid
        this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(''));

        // Place words in grid
        const directions = [
            { dx: 1, dy: 0 },   // Horizontal
            { dx: 0, dy: 1 },   // Vertical
            { dx: 1, dy: 1 },   // Diagonal down-right
            { dx: 1, dy: -1 },  // Diagonal up-right
            { dx: -1, dy: 0 },  // Horizontal reverse
            { dx: 0, dy: -1 },  // Vertical reverse
            { dx: -1, dy: -1 }, // Diagonal up-left
            { dx: -1, dy: 1 }   // Diagonal down-left
        ];

        const shuffledWords = [...this.words].sort(() => Math.random() - 0.5);

        for (const word of shuffledWords) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 100) {
                const direction = directions[Math.floor(Math.random() * directions.length)];
                const startX = Math.floor(Math.random() * this.gridSize);
                const startY = Math.floor(Math.random() * this.gridSize);

                if (this.canPlaceWord(word, startX, startY, direction)) {
                    this.placeWord(word, startX, startY, direction);
                    placed = true;
                }
                attempts++;
            }
        }

        // Fill remaining cells with random letters
        this.fillRandomLetters();
    }

    canPlaceWord(word, x, y, direction) {
        for (let i = 0; i < word.length; i++) {
            const newX = x + i * direction.dx;
            const newY = y + i * direction.dy;

            if (newX < 0 || newX >= this.gridSize || newY < 0 || newY >= this.gridSize) {
                return false;
            }

            if (this.grid[newY][newX] !== '' && this.grid[newY][newX] !== word[i]) {
                return false;
            }
        }
        return true;
    }

    placeWord(word, x, y, direction) {
        const positions = [];
        for (let i = 0; i < word.length; i++) {
            const newX = x + i * direction.dx;
            const newY = y + i * direction.dy;
            this.grid[newY][newX] = word[i];
            positions.push({ x: newX, y: newY });
        }
        this.wordPositions[word] = positions;
    }

    fillRandomLetters() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x] === '') {
                    this.grid[y][x] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
    }

    renderGrid() {
        this.wordGrid.innerHTML = '';
        this.wordGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.textContent = this.grid[y][x];
                cell.dataset.x = x;
                cell.dataset.y = y;

                // Check if this cell is part of a found word
                let isFound = false;
                for (const word of this.foundWords) {
                    if (this.wordPositions[word]) {
                        const pos = this.wordPositions[word].find(p => p.x === x && p.y === y);
                        if (pos) {
                            isFound = true;
                            cell.classList.add('found');
                            break;
                        }
                    }
                }

                if (!isFound) {
                    cell.addEventListener('mousedown', (e) => this.handleCellStart(e, x, y));
                    cell.addEventListener('mouseenter', (e) => this.handleCellEnter(e, x, y));
                    cell.addEventListener('mouseup', () => this.handleCellEnd());
                    cell.addEventListener('touchstart', (e) => this.handleCellStart(e, x, y));
                    cell.addEventListener('touchmove', (e) => this.handleCellMove(e));
                    cell.addEventListener('touchend', () => this.handleCellEnd());
                }

                this.wordGrid.appendChild(cell);
            }
        }
    }

    handleCellStart(e, x, y) {
        e.preventDefault();
        if (this.paused) return;
        this.selectedCells = [{ x, y }];
        this.selectionDirection = null;
        this.updateSelection();
    }

    handleCellEnter(e, x, y) {
        if (this.paused || this.selectedCells.length === 0) return;
        if (e.buttons === 1) { // Mouse button is pressed
            this.addCellToSelection(x, y);
        }
    }

    handleCellMove(e) {
        if (this.paused || this.selectedCells.length === 0) return;
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.classList.contains('grid-cell')) {
            const x = parseInt(element.dataset.x);
            const y = parseInt(element.dataset.y);
            this.addCellToSelection(x, y);
        }
    }

    addCellToSelection(x, y) {
        const lastCell = this.selectedCells[this.selectedCells.length - 1];
        
        // Don't add if it's the same cell
        if (lastCell.x === x && lastCell.y === y) return;
        
        // Don't add if already selected
        if (this.selectedCells.some(c => c.x === x && c.y === y)) return;

        const dx = x - lastCell.x;
        const dy = y - lastCell.y;

        // Must be adjacent (one step away)
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return;
        if (Math.abs(dx) === 0 && Math.abs(dy) === 0) return;

        // Calculate direction
        let direction = null;
        if (dx === 0 && dy !== 0) {
            direction = 'vertical';
        } else if (dx !== 0 && dy === 0) {
            direction = 'horizontal';
        } else if (Math.abs(dx) === Math.abs(dy) && Math.abs(dx) > 0) {
            direction = 'diagonal';
        } else {
            // Not a straight line (e.g., L-shape)
            return;
        }

        // If we have a direction set, check if new cell follows it
        if (this.selectionDirection) {
            if (this.selectionDirection !== direction) {
                // Different direction - don't allow
                return;
            }
            
            // Same direction - check if it continues the line
            if (this.selectedCells.length > 1) {
                const prevCell = this.selectedCells[this.selectedCells.length - 2];
                const prevDx = lastCell.x - prevCell.x;
                const prevDy = lastCell.y - prevCell.y;
                
                // Must continue in same direction
                if (prevDx !== 0 && dx !== 0 && Math.sign(prevDx) !== Math.sign(dx)) return;
                if (prevDy !== 0 && dy !== 0 && Math.sign(prevDy) !== Math.sign(dy)) return;
            }
            
            this.selectedCells.push({ x, y });
        } else {
            // First direction - set it
            this.selectionDirection = direction;
            this.selectedCells.push({ x, y });
        }

        this.updateSelection();
    }

    handleCellEnd() {
        if (this.selectedCells.length > 0) {
            this.checkSelection();
            this.selectedCells = [];
            this.selectionDirection = null;
            this.updateSelection();
        }
    }

    updateSelection() {
        const cells = this.wordGrid.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.classList.remove('selected', 'hint');
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            const isSelected = this.selectedCells.some(c => c.x === x && c.y === y);
            if (isSelected) {
                cell.classList.add('selected');
            }
        });
    }

    checkSelection() {
        if (this.selectedCells.length < 3) return;

        // Get selected letters
        const selectedWord = this.selectedCells
            .map(cell => this.grid[cell.y][cell.x])
            .join('');

        // Check forward and reverse
        const reversedWord = selectedWord.split('').reverse().join('');

        // Check if it matches any word
        for (const word of this.words) {
            if (!this.foundWords.has(word)) {
                if (selectedWord === word || reversedWord === word) {
                    // Verify the positions match
                    if (this.verifyWordPositions(word, this.selectedCells)) {
                        this.foundWords.add(word);
                        this.updateScore(100);
                        this.renderWordList();
                        this.renderGrid();
                        this.updateDisplay();
                        this.checkWin();
                        return;
                    }
                }
            }
        }
    }

    verifyWordPositions(word, selectedCells) {
        const positions = this.wordPositions[word];
        if (!positions || positions.length !== selectedCells.length) return false;

        // Check if selected cells match word positions
        const selectedSet = new Set(selectedCells.map(c => `${c.x},${c.y}`));
        const wordSet = new Set(positions.map(p => `${p.x},${p.y}`));

        if (selectedSet.size !== wordSet.size) return false;

        for (const pos of selectedSet) {
            if (!wordSet.has(pos)) return false;
        }

        return true;
    }

    renderWordList() {
        this.wordList.innerHTML = '';
        this.words.forEach(word => {
            const wordItem = document.createElement('div');
            wordItem.className = `word-item ${this.foundWords.has(word) ? 'found' : ''}`;
            wordItem.textContent = word;
            this.wordList.appendChild(wordItem);
        });
    }

    checkWin() {
        if (this.foundWords.size === this.words.length) {
            this.completedLevels.add(this.currentLevel);
            this.saveProgress();
            this.stopTimer();

            const winOverlay = document.getElementById('winOverlay');
            const winMessage = document.getElementById('winMessage');
            const timeBonus = Math.max(0, 1000 - this.timer);
            winMessage.textContent = `All words found! Time: ${this.formatTime(this.timer)}`;
            winOverlay.classList.remove('hidden');
        }
    }

    giveHint() {
        if (this.paused) return;

        // Find first unfound word
        const unfoundWord = this.words.find(w => !this.foundWords.has(w));
        if (!unfoundWord) {
            alert('All words found!');
            return;
        }

        const positions = this.wordPositions[unfoundWord];
        if (positions && positions.length > 0) {
            // Highlight first letter
            const firstPos = positions[0];
            const cells = this.wordGrid.querySelectorAll('.grid-cell');
            cells.forEach(cell => {
                cell.classList.remove('hint');
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                if (x === firstPos.x && y === firstPos.y) {
                    cell.classList.add('hint');
                    setTimeout(() => cell.classList.remove('hint'), 2000);
                }
            });
        }
    }

    startTimer() {
        this.timer = 0;
        this.timerInterval = setInterval(() => {
            if (!this.paused) {
                this.timer++;
                this.updateDisplay();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    updateScore(points) {
        this.score += points;
    }

    updateDisplay() {
        document.getElementById('currentLevel').textContent = this.currentLevel;
        document.getElementById('foundCount').textContent = `${this.foundWords.size} / ${this.words.length}`;
        document.getElementById('timer').textContent = this.formatTime(this.timer);
    }

    nextLevel() {
        const winOverlay = document.getElementById('winOverlay');
        winOverlay.classList.add('hidden');

        if (this.currentLevel < wordSearchLevels.length) {
            this.startLevel(this.currentLevel + 1);
        } else {
            alert('Congratulations! You completed all levels!');
            this.showLevelSelect();
        }
    }

    replayLevel() {
        document.getElementById('winOverlay').classList.add('hidden');
        this.startLevel(this.currentLevel);
    }

    showLevelSelect() {
        document.getElementById('winOverlay').classList.add('hidden');
        document.getElementById('pauseOverlay').classList.add('hidden');

        this.gameScreen.classList.add('hidden');
        this.levelSelectScreen.classList.remove('hidden');
        this.paused = false;
        this.stopTimer();
        this.createLevelSelect();
    }

    togglePause() {
        if (this.levelSelectScreen.classList.contains('hidden')) {
            this.paused = !this.paused;
            const pauseOverlay = document.getElementById('pauseOverlay');
            if (this.paused) {
                pauseOverlay.classList.remove('hidden');
            } else {
                pauseOverlay.classList.add('hidden');
            }
        }
    }

    setupUI() {
        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            if (!this.gameScreen.classList.contains('hidden')) {
                this.showLevelSelect();
            }
        });

        // Pause button
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });

        // Hint button
        document.getElementById('hintBtn').addEventListener('click', () => {
            this.giveHint();
        });

        // Overlay buttons
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.nextLevel();
        });

        document.getElementById('replayBtn').addEventListener('click', () => {
            this.replayLevel();
        });

        document.getElementById('levelSelectBtn2').addEventListener('click', () => {
            this.showLevelSelect();
        });

        document.getElementById('levelSelectBtn4').addEventListener('click', () => {
            this.showLevelSelect();
        });

        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.togglePause();
        });

        // Prevent text selection during drag
        document.addEventListener('selectstart', (e) => {
            if (e.target.classList.contains('grid-cell')) {
                e.preventDefault();
            }
        });
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new WordSearchGame();
});

