const socket = io("http://192.168.29.24:3000/connectFour");

// Connect Four Game - Complete Implementation
class ConnectFourGame {
    constructor() {
        // Game state
        this.rows = 6;
        this.cols = 7;
        this.board = [];
        this.currentPlayer = 1; // 1 or 2
        this.gameMode = 'twoPlayer'; // 'ai' or 'twoPlayer'
        this.gameActive = false;
        this.moveHistory = [];
        this.moveCount = 0;
        this.aiDifficulty = 'medium';
        this.lastDroppedPiece = null; // Track last dropped piece for animation
        this.winningPlayer = null; // Track which player won (for online games)
        this.winCount = 4; // Default to 4 for Connect Four

        // Settings
        this.settings = {
            sound: true,
            music: true,
            vibration: true
        };

        // DOM elements
        this.screens = {
            splash: document.getElementById('splashScreen'),
            mainMenu: document.getElementById('mainMenu'),
            friendOption: document.getElementById('friendOptionScreen'),
            friendSettings: document.getElementById('friendSettingsScreen'),
            randomSettings: document.getElementById('randomSettingsScreen'),
            aiDifficulty: document.getElementById('aiDifficultyScreen'),
            settings: document.getElementById('settingsScreen'),
            game: document.getElementById('gameScreen'),
            result: document.getElementById('resultScreen')
        };

        // Initialize
        this.loadSettings();
        // Delay event listener setup to ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
            });
        } else {
            this.setupEventListeners();
        }
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
            this.settings = {...this.settings, ...JSON.parse(saved)};
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
    }


    startTwoPlayer() {
        this.gameMode = 'twoPlayer';
        this.rows = 6;
        this.cols = 7;
        this.winCount = 4;
        document.getElementById('aiDifficultyDisplay').style.display = 'none';

        this.initGame();
        this.showScreen('game');
    }

    startOnline(isFriend = true) {
        if (isFriend) {

            this.showScreen('friendSettings');
        } else {
            this.showScreen('randomSettings');
            // Show searching status
            const randomStatus = document.getElementById('randomStatus');
            if (randomStatus) {
                randomStatus.textContent = "Searching for opponent...";
            }
            socket.emit("joinRandom");
        }
    }

    gameWithFriend(isCreate = true) {
        if (isCreate) {
            isPlayer1 = true;
            roomId = null; // Will be set when newGame event is received
            socket.emit("createGame");
        } else {
            const id = document.getElementById('joinTheRoom').value.trim();
            if (!id) {
                alert("Please enter a room code");
                return;
            }

            roomId = id;
            isPlayer1 = false; // Joining player is player 2
            socket.emit("joinGame", {roomId});
        }
    }

    gameWithRandom() {
        // This is called when random match is found
        // Already handled by socket events
    }

    startAI(difficulty) {
        this.gameMode = 'ai';
        this.aiDifficulty = difficulty;
        this.rows = 6;
        this.cols = 7;
        this.winCount = 4;

        // Show AI difficulty in game
        document.getElementById('aiDifficultyDisplay').style.display = 'flex';
        document.getElementById('aiDifficultyText').textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

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
        this.winningPlayer = null; // Reset winning player
        
        // Ensure winCount is set (default to 4 for Connect Four)
        if (!this.winCount) {
            this.winCount = 4;
        }

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
    makeMove(col, isAIMove = false, isOpponentMove = false) {
        if (!this.gameActive) return;
        // Prevent AI from making moves through UI, but allow programmatic AI moves
        if (this.gameMode === 'ai' && this.currentPlayer === 2 && !isAIMove) return;
// FIX: Correct player turn in online opponent move
        if (this.gameMode === "online" && isOpponentMove) {
            this.currentPlayer = isPlayer1 ? 2 : 1;  // opponent
        }


        // Online mode validation
        if (this.gameMode === "online" && !isOpponentMove) {
            // Only allow moves if it's the player's turn
            if (isPlayer1 && this.currentPlayer !== 1) {
                return; // Not player 1's turn
            }
            if (!isPlayer1 && this.currentPlayer !== 2) {
                return; // Not player 2's turn
            }
            // Validate roomId exists
            if (!roomId) {
                return;
            }
            // Send move to server
            socket.emit("makeMove", {roomId, col});
        }

        const row = this.getAvailableRow(col);
        if (row === -1) return;

        this.board[row][col] = this.currentPlayer;
        this.moveHistory.push({row, col, player: this.currentPlayer});
        this.moveCount++;
        this.lastDroppedPiece = {row, col};

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
            // Store which player won (currentPlayer at the time of win)
            this.winningPlayer = this.currentPlayer;
            this.handleWin();
            return;
        }

        if (this.checkDraw()) {
            this.handleDraw();
            return;
        }

        this.switchPlayer();
        this.updateDisplay();

        // AI move in AI mode
        if (this.gameMode === 'ai' && this.currentPlayer === 2 && this.gameActive) {
            setTimeout(() => {
                if (this.gameActive && this.currentPlayer === 2) {
                    this.makeAIMove();
                }
            }, 800);
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
            const winningCells = [{row, col}];

            for (const [dx, dy] of direction) {
                let r = row + dx;
                let c = col + dy;
                let tempCount = 0;

                while (
                    r >= 0 && r < this.rows &&
                    c >= 0 && c < this.cols &&
                    this.board[r][c] === this.currentPlayer
                    ) {
                    winningCells.push({row: r, col: c});
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
        cells.forEach(({row, col}) => {
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
        if (this.currentPlayer !== 2) return;

        let col = -1;

        try {
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
                case 'impossible':
                    col = this.getImpossibleAIMove();
                    break;
                default:
                    col = this.getMediumAIMove();
            }
        } catch (error) {
            col = this.getEasyAIMove(); // Fallback to easy
        }

        // Ensure we have a valid column
        if (col === -1 || col < 0 || col >= this.cols) {
            // Fallback: find any valid column
            for (let c = 0; c < this.cols; c++) {
                if (this.getAvailableRow(c) !== -1) {
                    col = c;
                    break;
                }
            }
        }

        if (col !== -1 && col >= 0 && col < this.cols && this.getAvailableRow(col) !== -1) {
            this.makeMove(col, true); // Pass true to indicate this is an AI move
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

        // Check if you need to block player
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
        // Minimax algorithm for hard AI (depth 5)
        try {
            const bestMove = this.minimax(this.board, 5, true, -Infinity, Infinity);
            if (bestMove && bestMove.column !== undefined && bestMove.column !== -1) {
                return bestMove.column;
            }
        } catch (error) {
            console.error('Error in hard AI:', error);
        }
        // Fallback to medium if minimax fails
        return this.getMediumAIMove();
    }

    getImpossibleAIMove() {
        // Minimax algorithm for impossible AI (depth 7 - very strong)
        try {
            const bestMove = this.minimax(this.board, 7, true, -Infinity, Infinity);
            if (bestMove && bestMove.column !== undefined && bestMove.column !== -1) {
                return bestMove.column;
            }
        } catch (error) {
            console.error('Error in impossible AI:', error);
        }
        // Fallback to medium if minimax fails
        return this.getMediumAIMove();
    }

    minimax(board, depth, maximizingPlayer, alpha, beta) {
        // Check for terminal states
        const winner = this.evaluateBoard(board);
        if (winner === 2) return {score: 1000, column: -1};
        if (winner === 1) return {score: -1000, column: -1};
        if (this.isBoardFull(board)) {
            return {score: 0, column: -1};
        }

        if (depth === 0) {
            return {score: this.evaluatePosition(board), column: -1};
        }

        if (maximizingPlayer) {
            let maxScore = -Infinity;
            let bestCol = -1;
            let hasValidMove = false;

            for (let col = 0; col < this.cols; col++) {
                const row = this.getAvailableRowForBoard(board, col);
                if (row === -1) continue;

                hasValidMove = true;
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

            // If no valid move found, return first available column
            if (!hasValidMove || bestCol === -1) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.getAvailableRowForBoard(board, col) !== -1) {
                        bestCol = col;
                        break;
                    }
                }
            }

            return {score: maxScore, column: bestCol};
        } else {
            let minScore = Infinity;
            let bestCol = -1;
            let hasValidMove = false;

            for (let col = 0; col < this.cols; col++) {
                const row = this.getAvailableRowForBoard(board, col);
                if (row === -1) continue;

                hasValidMove = true;
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

            // If no valid move found, return first available column
            if (!hasValidMove || bestCol === -1) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.getAvailableRowForBoard(board, col) !== -1) {
                        bestCol = col;
                        break;
                    }
                }
            }

            return {score: minScore, column: bestCol};
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

        // Evaluate based on potential connections and threats
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (board[row][col] === 2) {
                    score += 10;
                    // Bonus for center columns
                    if (col === Math.floor(this.cols / 2)) score += 5;
                }
                if (board[row][col] === 1) {
                    score -= 10;
                    // Penalty for center columns
                    if (col === Math.floor(this.cols / 2)) score -= 5;
                }
            }
        }

        // Check for potential wins/threats
        score += this.evaluateThreats(board, 2) * 50;
        score -= this.evaluateThreats(board, 1) * 50;

        return score;
    }

    evaluateThreats(board, player) {
        let threats = 0;
        const directions = [
            [[0, 1], [0, -1]],   // Horizontal
            [[1, 0], [-1, 0]],   // Vertical
            [[1, 1], [-1, -1]],  // Diagonal \
            [[1, -1], [-1, 1]]   // Diagonal /
        ];

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (board[row][col] === player) {
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
                        if (count >= this.winCount - 1) {
                            threats++;
                        }
                    }
                }
            }
        }
        return threats;
    }

    isBoardFull(board) {
        return board[0].every(cell => cell !== 0);
    }

    // Game End Handlers
    handleWin() {
        this.gameActive = false;
        this.playSound('win');
        this.vibrate([100, 50, 100]);

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
        const moves = document.getElementById('resultMoves');

        if (won) {
            icon.textContent = '🎉';
            if (this.gameMode === 'online') {
                // Use winningPlayer if available, otherwise fall back to currentPlayer
                const winner = this.winningPlayer !== null ? this.winningPlayer : this.currentPlayer;
                // Check if we (the local player) won
                const playerWon = (isPlayer1 && winner === 1) || (!isPlayer1 && winner === 2);
                if (playerWon) {
                    title.textContent = 'You Win!';
                    message.textContent = 'Congratulations!';
                } else {
                    icon.textContent = '😢';
                    title.textContent = 'You Lost!';
                    message.textContent = 'Better luck next time!';
                }
            } else if (this.gameMode === 'ai' && this.winningPlayer === 2) {
                title.textContent = 'AI Wins!';
                message.textContent = 'Better luck next time!';
            } else {
                const winner = this.winningPlayer !== null ? this.winningPlayer : this.currentPlayer;
                title.textContent = this.gameMode === 'ai' ? 'You Win!' : 'Player ' + winner + ' Wins!';
                message.textContent = 'Congratulations!';
            }
        } else {
            icon.textContent = '😐';
            title.textContent = 'Draw!';
            message.textContent = 'No winner this time.';
        }

        moves.textContent = this.moveCount;
        this.showScreen('result');
    }

    // Utility Functions
    undoMove() {
        if (this.moveHistory.length === 0 || !this.gameActive) return;

        // Disable undo in online mode
        if (this.gameMode === 'online') {
            alert('Undo is not available in online games.');
            return;
        }

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
            if (this.gameMode === 'online') {
                // For online games, restart means going back to menu
                // or we could emit a restart event to server
                alert('Cannot restart online game. Please leave and start a new game.');
                return;
            }
            if (this.gameMode === 'ai') {
                this.startAI(this.aiDifficulty);
            } else {
                this.startTwoPlayer();
            }
        }
    }

    replayLevel() {
        // Reset online state if in online mode
        if (this.gameMode === 'online') {
            isOnline = false;
            roomId = null;
            isPlayer1 = false;
            this.gameMode = 'twoPlayer';
            this.showScreen('mainMenu');
            return;
        }

        if (this.gameMode === 'ai') {
            this.startAI(this.aiDifficulty);
        } else {
            this.startTwoPlayer();
        }
    }

    showCode(code) {

    }

    updateDisplay() {
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
        // Store reference to this for event listeners
        const self = this;

        // Main menu buttons
        const playWithFriendBtn = document.getElementById('playWithFriendBtn');
        if (playWithFriendBtn) {
            playWithFriendBtn.addEventListener('click', () => {
                self.showScreen('friendOption');
                // self.startTwoPlayer();
            });
        }

        const playWithAIBtn = document.getElementById('playWithAIBtn');
        if (playWithAIBtn) {
            playWithAIBtn.addEventListener('click', () => {
                self.showScreen('aiDifficulty');
            });
        }

        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                self.showScreen('settings');
            });
        }

        // Friend Option buttons
        const offlineBtn = document.getElementById('offlineBtn');
        if (offlineBtn) {
            offlineBtn.addEventListener('click', () => {
                self.startTwoPlayer();
            });
        }

        const onlineFriendBtn = document.getElementById('onlineFriendBtn');
        if (onlineFriendBtn) {
            onlineFriendBtn.addEventListener('click', () => {
                self.startOnline(true);
            });
        }

        const onlineRandomBtn = document.getElementById('onlineRandomBtn');
        if (onlineRandomBtn) {
            onlineRandomBtn.addEventListener('click', () => {
                self.startOnline(false);
            });
        }

        // AI Difficulty buttons
        const easyBtn = document.getElementById('easyBtn');
        if (easyBtn) {
            easyBtn.addEventListener('click', () => {
                self.startAI('easy');
            });
        }

        const mediumBtn = document.getElementById('mediumBtn');
        if (mediumBtn) {
            mediumBtn.addEventListener('click', () => {
                self.startAI('medium');
            });
        }

        const hardBtn = document.getElementById('hardBtn');
        if (hardBtn) {
            hardBtn.addEventListener('click', () => {
                self.startAI('hard');
            });
        }

        const impossibleBtn = document.getElementById('impossibleBtn');
        if (impossibleBtn) {
            impossibleBtn.addEventListener('click', () => {
                self.startAI('impossible');
            });
        }

        // Room Setting buttons
        const createRoomBtn = document.getElementById('createRoomBtn');
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => {
                self.gameWithFriend();
            });
        }

        const joinRoomBtn = document.getElementById('joinRoomBtn');
        if (joinRoomBtn) {
            joinRoomBtn.addEventListener('click', () => {
                self.gameWithFriend(false);
            });
        }

        // Back buttons
        const backFromAIBtn = document.getElementById('backFromAIBtn');
        const backFromFriendBtn = document.getElementById('backFromFriendBtn');
        if (backFromAIBtn || backFromFriendBtn) {
            backFromAIBtn.addEventListener('click', () => {
                self.showScreen('mainMenu');
            });
            backFromFriendBtn.addEventListener('click', () => {
                self.showScreen('mainMenu');
            });
        }

        const backFromSettingsBtn = document.getElementById('backFromSettingsBtn');
        const backFromFriendSettingsBtn = document.getElementById('backFromFriendSettingsBtn');
        const backFromRandomSettingsBtn = document.getElementById('backFromRandomSettingsBtn');
        if (backFromSettingsBtn || backFromFriendSettingsBtn || backFromRandomSettingsBtn) {
            if (backFromSettingsBtn) {
                backFromSettingsBtn.addEventListener('click', () => {
                    self.showScreen('mainMenu');
                });
            }
            if (backFromFriendSettingsBtn) {
                backFromFriendSettingsBtn.addEventListener('click', () => {
                    self.showScreen('friendOption');
                });
            }
            if (backFromRandomSettingsBtn) {
                backFromRandomSettingsBtn.addEventListener('click', () => {
                    // Cancel random matching if in progress
                    if (isOnline && !roomId) {
                        // We're still searching, can cancel
                        const randomStatus = document.getElementById('randomStatus');
                        if (randomStatus) {
                            randomStatus.textContent = "Searching for opponent...";
                        }
                    }
                    self.showScreen('friendOption');
                });
            }
        }

        const backFromGameBtn = document.getElementById('backFromGameBtn');
        if (backFromGameBtn) {
            backFromGameBtn.addEventListener('click', () => {
                if (confirm('Leave current game?')) {
                    // Reset online state if leaving online game
                    if (self.gameMode === 'online') {
                        isOnline = false;
                        roomId = null;
                        isPlayer1 = false;
                        self.gameMode = 'twoPlayer';
                    }
                    self.showScreen('mainMenu');
                }
            });
        }

        // Settings
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                self.settings.sound = e.target.checked;
                self.saveSettings();
            });
        }

        const musicToggle = document.getElementById('musicToggle');
        if (musicToggle) {
            musicToggle.addEventListener('change', (e) => {
                self.settings.music = e.target.checked;
                self.saveSettings();
            });
        }

        const vibrationToggle = document.getElementById('vibrationToggle');
        if (vibrationToggle) {
            vibrationToggle.addEventListener('change', (e) => {
                self.settings.vibration = e.target.checked;
                self.saveSettings();
            });
        }

        // Game controls
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                self.undoMove();
            });
        }

        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                self.restartGame();
            });
        }

        // Result screen buttons
        const replayBtn = document.getElementById('replayBtn');
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                self.replayLevel();
            });
        }

        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                self.showScreen('mainMenu');
            });
        }
    }
}

let ConnectFour;

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    ConnectFour = new ConnectFourGame();
});

let roomId = null;
let isPlayer1 = false;
let isOnline = false;

socket.on("newGame", ({roomId: id}) => {
    roomId = id;
    isPlayer1 = true; // Creator is always player 1

    const createCodeDiv = document.getElementById("createCode");
    const codeCreatedDiv = document.getElementById("codeCreated");
    const joinRoomDiv = document.getElementById("joinRoomDiv");

    if (createCodeDiv) createCodeDiv.style.display = 'none';
    if (codeCreatedDiv) codeCreatedDiv.style.display = 'block';

    const codeElement = document.getElementById('code');
    if (codeElement) codeElement.innerHTML = roomId;

    if (joinRoomDiv) joinRoomDiv.innerHTML = 'Waiting For Opponent To Join The Room...!';

    // Setup copy button
    const copyButton = document.getElementById("copyCode");
    if (copyButton) {
        // Remove existing listeners and add new one
        const newCopyButton = copyButton.cloneNode(true);
        copyButton.parentNode.replaceChild(newCopyButton, copyButton);
        newCopyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(roomId).then(() => {
                alert('Room code copied to clipboard!');
                console.log('Copied to clipboard successfully!');
            }, (e) => {
                console.error('Could not copy to clipboard!', e);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = roomId;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                document.body.removeChild(textArea);
            });
        });
    }

    if (ConnectFour) ConnectFour.showCode(roomId);
});

socket.on("playersConnected", ({roomId: serverRoomId, isPlayer1: serverIsPlayer1} = {}) => {
    ConnectFour.gameMode = "online";
    isOnline = true;

    // Set roomId if provided (for random matches)
    if (serverRoomId) {
        roomId = serverRoomId;
    }

    // Determine player number based on who created/joined
    // For friend games: creator is player1, joiner is player2
    // For random games: first in queue is player1, second is player2
    // If server doesn't send this info, use existing isPlayer1 variable
    if (serverIsPlayer1 !== undefined) {
        isPlayer1 = serverIsPlayer1;
    }
    // If we don't have roomId yet but we're in friend mode, we're player1 (creator)
    if (!roomId && ConnectFour.screens.friendSettings && !ConnectFour.screens.friendSettings.classList.contains('hidden')) {
        // We're still in friend settings, so we must be the creator
        isPlayer1 = true;
    }

    // Player1 always starts
    ConnectFour.currentPlayer = 1;
    if (!isPlayer1) {
        // If we're player 2, wait for opponent's move
        ConnectFour.currentPlayer = 2;
    }

    ConnectFour.initGame();
    ConnectFour.showScreen("game");

    // Update player indicators for online mode
    const player1Indicator = document.getElementById('player1Indicator');
    const player2Indicator = document.getElementById('player2Indicator');
    if (player1Indicator && player2Indicator) {
        player1Indicator.textContent = isPlayer1 ? "You (P1)" : "Opponent (P1)";
        player2Indicator.textContent = isPlayer1 ? "Opponent (P2)" : "You (P2)";
    }

    // Update random status if we were in random matching
    const randomStatus = document.getElementById('randomStatus');
    if (randomStatus) {
        randomStatus.textContent = "Match found! Starting game...";
    }
});

socket.on("opponentMove", ({col}) => {
    console.log("Opponent made move:", col);
    // Make the move as opponent (player 2 if we're player 1, player 1 if we're player 2)
    ConnectFour.makeMove(col, false, true);
});


socket.on("waitingForRandom", () => {
    const randomStatus = document.getElementById("randomStatus");
    if (randomStatus) {
        randomStatus.textContent = "Searching for opponent...";
    }
});

socket.on("opponentLeft", () => {
    alert("Opponent left the match.");
    // Reset online state
    isOnline = false;
    roomId = null;
    isPlayer1 = false;
    if (ConnectFour) {
        ConnectFour.gameActive = false;
        ConnectFour.gameMode = 'twoPlayer';
        ConnectFour.showScreen("mainMenu");
    }
});

socket.on("joinGameError", ({message}) => {
    // Stay on friend settings screen
    if (ConnectFour) {
        ConnectFour.showScreen("friendSettings");
    }
});

// Handle socket connection errors
socket.on("connect_error", (error) => {
    document.getElementById('onlineFriendBtn').style.display = "none";
    document.getElementById('onlineRandomBtn').style.display = "none";
});

socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
    if (isOnline && ConnectFour) {
        alert("Connection lost. Returning to main menu.");
        isOnline = false;
        roomId = null;
        isPlayer1 = false;
        ConnectFour.gameActive = false;
        ConnectFour.gameMode = 'twoPlayer';
        ConnectFour.showScreen("mainMenu");
    }
});
