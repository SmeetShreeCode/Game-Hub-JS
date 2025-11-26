// Connect Four Game - Complete Implementation
class ConnectFourGame {
    constructor() {
        // Game state
        this.rows = 6;
        this.cols = 7;
        this.board = [];
        this.currentPlayer = 1; // 1 or 2
        this.gameMode = 'single'; // 'single' or 'twoPlayer'
        this.gameActive = false;
        this.currentLevel = 1;
        this.completedLevels = new Set();
        this.moveHistory = [];
        this.moveCount = 0;
        this.aiDifficulty = 'medium';
        this.lastDroppedPiece = null; // Track last dropped piece for animation
        
        // Settings
        this.settings = {
            sound: true,
            music: true,
            vibration: true,
            difficulty: 'medium'
        };

        // DOM elements
        this.screens = {
            splash: document.getElementById('splashScreen'),
            mainMenu: document.getElementById('mainMenu'),
            levelSelect: document.getElementById('levelSelectScreen'),
            settings: document.getElementById('settingsScreen'),
            game: document.getElementById('gameScreen'),
            result: document.getElementById('resultScreen')
        };

        // Initialize
        this.loadSettings();
        this.loadProgress();
        this.setupEventListeners();
        this.showSplash();
    }

    // Screen Management
    showSplash() {
        this.showScreen('splash');
        setTimeout(() => {
            this.showScreen('mainMenu');
        }, 2000);
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.add('hidden');
        });
        if (this.screens[screenName]) {
            this.screens[screenName].classList.remove('hidden');
        }
    }

    // Settings Management
    loadSettings() {
        const saved = localStorage.getItem('connect4_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('connect4_settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        document.getElementById('soundToggle').checked = this.settings.sound;
        document.getElementById('musicToggle').checked = this.settings.music;
        document.getElementById('vibrationToggle').checked = this.settings.vibration;
        document.getElementById('difficultySelect').value = this.settings.difficulty;
        this.aiDifficulty = this.settings.difficulty;
    }

    // Progress Management
    loadProgress() {
        const saved = localStorage.getItem('connect4_progress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.completedLevels = new Set(progress.completedLevels || []);
        }
    }

    saveProgress() {
        localStorage.setItem('connect4_progress', JSON.stringify({
            completedLevels: [...this.completedLevels]
        }));
    }

    resetProgress() {
        if (confirm('Are you sure you want to reset all progress?')) {
            this.completedLevels.clear();
            this.saveProgress();
            this.createLevelSelect();
            alert('Progress reset!');
        }
    }

    // Level System
    getLevelConfig(level) {
        const baseConfig = {
            rows: 6,
            cols: 7,
            winCount: 4,
            timeLimit: null
        };

        // Increase difficulty with level
        if (level <= 5) {
            return { ...baseConfig, difficulty: 'easy' };
        } else if (level <= 10) {
            return { ...baseConfig, difficulty: 'medium' };
        } else if (level <= 15) {
            return { ...baseConfig, rows: 7, cols: 8, difficulty: 'hard' };
        } else {
            return { ...baseConfig, rows: 8, cols: 9, winCount: 5, difficulty: 'hard' };
        }
    }

    createLevelSelect() {
        const grid = document.getElementById('levelGrid');
        grid.innerHTML = '';

        for (let i = 1; i <= 20; i++) {
            const card = document.createElement('div');
            const isLocked = i > 1 && !this.completedLevels.has(i - 1);
            const isCompleted = this.completedLevels.has(i);
            const config = this.getLevelConfig(i);

            card.className = `level-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`;
            
            if (!isLocked) {
                card.addEventListener('click', () => this.startLevel(i));
            }

            card.innerHTML = `
                <div class="level-number">${i}</div>
                <div class="level-difficulty">${config.difficulty}</div>
            `;

            grid.appendChild(card);
        }
    }

    startLevel(level) {
        this.currentLevel = level;
        this.gameMode = 'single';
        const config = this.getLevelConfig(level);
        
        // Apply level configuration
        this.rows = config.rows || 6;
        this.cols = config.cols || 7;
        this.winCount = config.winCount || 4;
        this.aiDifficulty = config.difficulty || 'medium';
        
        console.log(`Starting Level ${level}: ${this.rows}x${this.cols}, Difficulty: ${this.aiDifficulty}, Win Count: ${this.winCount}`);
        
        this.initGame();
        this.showScreen('game');
    }

    startTwoPlayer() {
        this.gameMode = 'twoPlayer';
        this.rows = 6;
        this.cols = 7;
        this.winCount = 4;
        this.currentLevel = 0;
        
        this.initGame();
        this.showScreen('game');
    }

    // Game Initialization
    initGame() {
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
        this.currentPlayer = 1;
        this.gameActive = true;
        this.moveHistory = [];
        this.moveCount = 0;
        this.lastDroppedPiece = null;
        
        this.renderBoard();
        this.updateDisplay();
        this.updatePlayerIndicator();
    }

    // Board Rendering
    renderBoard(animatePiece = null) {
        const board = document.getElementById('gameBoard');
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        board.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.board[row][col] === 1) {
                    cell.classList.add('player1');
                    // Only animate if this is the newly dropped piece
                    if (animatePiece && animatePiece.row === row && animatePiece.col === col) {
                        cell.classList.add('drop-animate');
                    }
                } else if (this.board[row][col] === 2) {
                    cell.classList.add('player2');
                    // Only animate if this is the newly dropped piece
                    if (animatePiece && animatePiece.row === row && animatePiece.col === col) {
                        cell.classList.add('drop-animate');
                    }
                } else {
                    cell.addEventListener('click', () => this.makeMove(col));
                }

                board.appendChild(cell);
            }
        }
    }

    // Game Logic
    makeMove(col) {
        if (!this.gameActive) return;
        if (this.gameMode === 'single' && this.currentPlayer === 2) return;

        const row = this.getAvailableRow(col);
        if (row === -1) return;

        this.board[row][col] = this.currentPlayer;
        this.moveHistory.push({ row, col, player: this.currentPlayer });
        this.moveCount++;
        this.lastDroppedPiece = { row, col };
        
        this.playSound('drop');
        this.vibrate(50);
        this.renderBoard(this.lastDroppedPiece);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.remove('drop-animate');
            }
        }, 500);
        
        if (this.checkWin(row, col)) {
            this.handleWin();
            return;
        }

        if (this.checkDraw()) {
            this.handleDraw();
            return;
        }

        this.switchPlayer();
        this.updateDisplay();

        // AI move in single player mode
        if (this.gameMode === 'single' && this.currentPlayer === 2 && this.gameActive) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    getAvailableRow(col) {
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                return row;
            }
        }
        return -1;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updatePlayerIndicator();
    }

    updatePlayerIndicator() {
        document.getElementById('player1Indicator').classList.toggle('active', this.currentPlayer === 1);
        document.getElementById('player2Indicator').classList.toggle('active', this.currentPlayer === 2);
    }

    // Win Detection
    checkWin(row, col) {
        const directions = [
            [[0, 1], [0, -1]],   // Horizontal
            [[1, 0], [-1, 0]],   // Vertical
            [[1, 1], [-1, -1]],  // Diagonal \
            [[1, -1], [-1, 1]]   // Diagonal /
        ];

        for (const direction of directions) {
            let count = 1;
            const winningCells = [{ row, col }];

            for (const [dx, dy] of direction) {
                let r = row + dx;
                let c = col + dy;
                let tempCount = 0;

                while (
                    r >= 0 && r < this.rows &&
                    c >= 0 && c < this.cols &&
                    this.board[r][c] === this.currentPlayer
                ) {
                    winningCells.push({ row: r, col: c });
                    tempCount++;
                    r += dx;
                    c += dy;
                }

                count += tempCount;
            }

            if (count >= this.winCount) {
                this.highlightWinningCells(winningCells);
                return true;
            }
        }

        return false;
    }

    highlightWinningCells(cells) {
        cells.forEach(({ row, col }) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('winning');
            }
        });
    }

    checkDraw() {
        return this.board[0].every(cell => cell !== 0);
    }

    // AI Logic
    makeAIMove() {
        if (!this.gameActive) return;

        let col;
        
        switch (this.aiDifficulty) {
            case 'easy':
                col = this.getEasyAIMove();
                break;
            case 'medium':
                col = this.getMediumAIMove();
                break;
            case 'hard':
                col = this.getHardAIMove();
                break;
            default:
                col = this.getMediumAIMove();
        }

        if (col !== -1) {
            this.makeMove(col);
        }
    }

    getEasyAIMove() {
        // Random valid move
        const validCols = [];
        for (let col = 0; col < this.cols; col++) {
            if (this.getAvailableRow(col) !== -1) {
                validCols.push(col);
            }
        }
        return validCols.length > 0 ? validCols[Math.floor(Math.random() * validCols.length)] : -1;
    }

    getMediumAIMove() {
        // Try to win, block player, or make random move
        // Check if AI can win
        for (let col = 0; col < this.cols; col++) {
            const row = this.getAvailableRow(col);
            if (row !== -1) {
                this.board[row][col] = 2;
                if (this.checkWin(row, col)) {
                    this.board[row][col] = 0;
                    return col;
                }
                this.board[row][col] = 0;
            }
        }

        // Check if need to block player
        for (let col = 0; col < this.cols; col++) {
            const row = this.getAvailableRow(col);
            if (row !== -1) {
                this.board[row][col] = 1;
                if (this.checkWin(row, col)) {
                    this.board[row][col] = 0;
                    return col;
                }
                this.board[row][col] = 0;
            }
        }

        // Random move
        return this.getEasyAIMove();
    }

    getHardAIMove() {
        // Minimax algorithm for hard AI
        const bestMove = this.minimax(this.board, 4, true, -Infinity, Infinity);
        return bestMove.column;
    }

    minimax(board, depth, maximizingPlayer, alpha, beta) {
        // Check for terminal states
        const winner = this.evaluateBoard(board);
        if (winner === 2) return { score: 1000, column: -1 };
        if (winner === 1) return { score: -1000, column: -1 };
        if (this.isBoardFull(board) || depth === 0) {
            return { score: this.evaluatePosition(board), column: -1 };
        }

        if (maximizingPlayer) {
            let maxScore = -Infinity;
            let bestCol = -1;

            for (let col = 0; col < this.cols; col++) {
                const row = this.getAvailableRowForBoard(board, col);
                if (row === -1) continue;

                board[row][col] = 2;
                const result = this.minimax(board, depth - 1, false, alpha, beta);
                board[row][col] = 0;

                if (result.score > maxScore) {
                    maxScore = result.score;
                    bestCol = col;
                }

                alpha = Math.max(alpha, result.score);
                if (beta <= alpha) break;
            }

            return { score: maxScore, column: bestCol };
        } else {
            let minScore = Infinity;
            let bestCol = -1;

            for (let col = 0; col < this.cols; col++) {
                const row = this.getAvailableRowForBoard(board, col);
                if (row === -1) continue;

                board[row][col] = 1;
                const result = this.minimax(board, depth - 1, true, alpha, beta);
                board[row][col] = 0;

                if (result.score < minScore) {
                    minScore = result.score;
                    bestCol = col;
                }

                beta = Math.min(beta, result.score);
                if (beta <= alpha) break;
            }

            return { score: minScore, column: bestCol };
        }
    }

    getAvailableRowForBoard(board, col) {
        for (let row = this.rows - 1; row >= 0; row--) {
            if (board[row][col] === 0) {
                return row;
            }
        }
        return -1;
    }

    evaluateBoard(board) {
        // Check for wins
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (board[row][col] !== 0) {
                    if (this.checkWinForBoard(board, row, col)) {
                        return board[row][col];
                    }
                }
            }
        }
        return 0;
    }

    checkWinForBoard(board, row, col) {
        const player = board[row][col];
        const directions = [
            [[0, 1], [0, -1]],
            [[1, 0], [-1, 0]],
            [[1, 1], [-1, -1]],
            [[1, -1], [-1, 1]]
        ];

        for (const direction of directions) {
            let count = 1;
            for (const [dx, dy] of direction) {
                let r = row + dx;
                let c = col + dy;
                while (
                    r >= 0 && r < this.rows &&
                    c >= 0 && c < this.cols &&
                    board[r][c] === player
                ) {
                    count++;
                    r += dx;
                    c += dy;
                }
            }
            if (count >= this.winCount) return true;
        }
        return false;
    }

    evaluatePosition(board) {
        let score = 0;
        // Evaluate based on potential connections
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (board[row][col] === 2) score += 10;
                if (board[row][col] === 1) score -= 10;
            }
        }
        return score;
    }

    isBoardFull(board) {
        return board[0].every(cell => cell !== 0);
    }

    // Game End Handlers
    handleWin() {
        this.gameActive = false;
        this.playSound('win');
        this.vibrate([100, 50, 100]);

        if (this.gameMode === 'single' && this.currentPlayer === 1) {
            this.completedLevels.add(this.currentLevel);
            this.saveProgress();
        }

        setTimeout(() => {
            this.showResultScreen(true);
        }, 1000);
    }

    handleDraw() {
        this.gameActive = false;
        this.playSound('draw');
        setTimeout(() => {
            this.showResultScreen(false);
        }, 500);
    }

    showResultScreen(won) {
        const icon = document.getElementById('resultIcon');
        const title = document.getElementById('resultTitle');
        const message = document.getElementById('resultMessage');
        const level = document.getElementById('resultLevel');
        const moves = document.getElementById('resultMoves');
        const nextBtn = document.getElementById('nextLevelBtn');

        if (won) {
            icon.textContent = '🎉';
            title.textContent = this.gameMode === 'single' ? 'Level Complete!' : 'Player ' + this.currentPlayer + ' Wins!';
            message.textContent = 'Congratulations!';
        } else {
            icon.textContent = '😐';
            title.textContent = 'Draw!';
            message.textContent = 'No winner this time.';
        }

        level.textContent = this.currentLevel || 'N/A';
        moves.textContent = this.moveCount;
        nextBtn.style.display = (won && this.gameMode === 'single' && this.currentLevel < 20) ? 'block' : 'none';

        this.showScreen('result');
    }

    // Utility Functions
    undoMove() {
        if (this.moveHistory.length === 0 || !this.gameActive) return;
        
        const lastMove = this.moveHistory.pop();
        this.board[lastMove.row][lastMove.col] = 0;
        this.moveCount--;
        this.lastDroppedPiece = null;
        this.switchPlayer();
        this.renderBoard();
        this.updateDisplay();
    }

    restartGame() {
        if (confirm('Restart this game?')) {
            if (this.gameMode === 'single') {
                this.startLevel(this.currentLevel);
            } else {
                this.startTwoPlayer();
            }
        }
    }

    nextLevel() {
        if (this.currentLevel < 20) {
            this.startLevel(this.currentLevel + 1);
        } else {
            alert('Congratulations! You completed all levels!');
            this.showScreen('mainMenu');
        }
    }

    replayLevel() {
        if (this.gameMode === 'single') {
            this.startLevel(this.currentLevel);
        } else {
            this.startTwoPlayer();
        }
    }

    updateDisplay() {
        document.getElementById('currentLevelDisplay').textContent = this.currentLevel || 'N/A';
        document.getElementById('moveCount').textContent = this.moveCount;
    }

    // Audio and Haptic Feedback
    playSound(type) {
        if (!this.settings.sound) return;
        // In a real implementation, you would play actual sound files
        // For now, we'll use Web Audio API for simple beeps
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            if (type === 'drop') {
                oscillator.frequency.value = 200;
                gainNode.gain.value = 0.1;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
            } else if (type === 'win') {
                oscillator.frequency.value = 400;
                gainNode.gain.value = 0.2;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
            }
        } catch (e) {
            // Fallback if Web Audio API is not available
        }
    }

    vibrate(pattern) {
        if (!this.settings.vibration) return;
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Main menu buttons
        document.getElementById('playBtn').addEventListener('click', () => {
            this.createLevelSelect();
            this.showScreen('levelSelect');
        });

        document.getElementById('twoPlayerBtn').addEventListener('click', () => {
            this.startTwoPlayer();
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showScreen('settings');
        });

        // Back buttons
        document.getElementById('backFromLevelsBtn').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });

        document.getElementById('backFromSettingsBtn').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });

        document.getElementById('backFromGameBtn').addEventListener('click', () => {
            if (confirm('Leave current game?')) {
                this.showScreen('mainMenu');
            }
        });

        // Settings
        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.settings.sound = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('musicToggle').addEventListener('change', (e) => {
            this.settings.music = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('vibrationToggle').addEventListener('change', (e) => {
            this.settings.vibration = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.settings.difficulty = e.target.value;
            this.saveSettings();
        });

        document.getElementById('resetProgressBtn').addEventListener('click', () => {
            this.resetProgress();
        });

        // Game controls
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undoMove();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });

        // Result screen buttons
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.nextLevel();
        });

        document.getElementById('replayBtn').addEventListener('click', () => {
            this.replayLevel();
        });

        document.getElementById('menuBtn').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new ConnectFourGame();
});

