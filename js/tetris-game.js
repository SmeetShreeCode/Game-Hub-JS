// Tetris Game Implementation
class Tetris {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');

        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.CELL_SIZE = 30;

        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;

        this.colors = [
            null,
            '#00f0f0', // I - Cyan
            '#f0f000', // O - Yellow
            '#a000f0', // T - Purple
            '#00f000', // S - Green
            '#f00000', // Z - Red
            '#0000f0', // J - Blue
            '#f0a000',  // L - Orange
            '#237c6e',  // U - Orange
            '#a1af1c',  // Plus - Orange
            '#36538c',  // Big L - Orange
            '#ec00fd',  // W - Orange
            '#a1af1c',  // P - Orange
        ];

        this.pieces = [
            null,
            // I piece
            [
                [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
                [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
                [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
                [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]
            ],
            // O piece
            [
                [[0, 2, 2, 0], [0, 2, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
                [[0, 2, 2, 0], [0, 2, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
                [[0, 2, 2, 0], [0, 2, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
                [[0, 2, 2, 0], [0, 2, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
            ],
            // T piece
            [
                [[0, 3, 0, 0], [3, 3, 3, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
                [[0, 3, 0, 0], [0, 3, 3, 0], [0, 3, 0, 0], [0, 0, 0, 0]],
                [[0, 0, 0, 0], [3, 3, 3, 0], [0, 3, 0, 0], [0, 0, 0, 0]],
                [[0, 3, 0, 0], [3, 3, 0, 0], [0, 3, 0, 0], [0, 0, 0, 0]]
            ],
            // S piece
            [
                [[0, 4, 4, 0], [4, 4, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
                [[0, 4, 0, 0], [0, 4, 4, 0], [0, 0, 4, 0], [0, 0, 0, 0]],
                [[0, 0, 0, 0], [0, 4, 4, 0], [4, 4, 0, 0], [0, 0, 0, 0]],
                [[4, 0, 0, 0], [4, 4, 0, 0], [0, 4, 0, 0], [0, 0, 0, 0]]
            ],
            // Z piece
            [
                [[5, 5, 0, 0], [0, 5, 5, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
                [[0, 0, 5, 0], [0, 5, 5, 0], [0, 5, 0, 0], [0, 0, 0, 0]],
                [[0, 0, 0, 0], [5, 5, 0, 0], [0, 5, 5, 0], [0, 0, 0, 0]],
                [[0, 5, 0, 0], [5, 5, 0, 0], [5, 0, 0, 0], [0, 0, 0, 0]]
            ],
            // J piece
            [
                [[6, 0, 0, 0], [6, 6, 6, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
                [[0, 6, 6, 0], [0, 6, 0, 0], [0, 6, 0, 0], [0, 0, 0, 0]],
                [[0, 0, 0, 0], [6, 6, 6, 0], [0, 0, 6, 0], [0, 0, 0, 0]],
                [[0, 6, 0, 0], [0, 6, 0, 0], [6, 6, 0, 0], [0, 0, 0, 0]]
            ],
            // L piece
            [
                [[0, 0, 7, 0], [7, 7, 7, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
                [[0, 7, 0, 0], [0, 7, 0, 0], [0, 7, 7, 0], [0, 0, 0, 0]],
                [[0, 0, 0, 0], [7, 7, 7, 0], [7, 0, 0, 0], [0, 0, 0, 0]],
                [[7, 7, 0, 0], [0, 7, 0, 0], [0, 7, 0, 0], [0, 0, 0, 0]]
            ],
            // U piece
            [
                [[0, 0, 0, 0], [8, 0, 8, 0], [8, 8, 8, 0], [0, 0, 0, 0]],
                [[8, 8, 0, 0], [8, 0, 0, 0], [8, 8, 0, 0], [0, 0, 0, 0]],
                [[8, 8, 8, 0], [8, 0, 8, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
                [[0, 8, 8, 0], [0, 0, 8, 0], [0, 8, 8, 0], [0, 0, 0, 0]]
            ],
            // Plus piece
            [
                [[0, 9, 0, 0], [9, 9, 9, 0], [0, 9, 0, 0], [0, 0, 0, 0]],
                [[0, 9, 0, 0], [9, 9, 9, 0], [0, 9, 0, 0], [0, 0, 0, 0]],
                [[0, 9, 0, 0], [9, 9, 9, 0], [0, 9, 0, 0], [0, 0, 0, 0]],
                [[0, 9, 0, 0], [9, 9, 9, 0], [0, 9, 0, 0], [0, 0, 0, 0]]
            ],
            // Big L piece
            [
                [[10, 0, 0, 0], [10, 0, 0, 0], [10, 0, 0, 0], [10, 10, 10, 0]],
                [[10, 10, 10, 10], [10, 0, 0, 0], [10, 0, 0, 0], [0, 0, 0, 0]],
                [[10, 10, 10, 0], [0, 0, 10, 0], [0, 0, 10, 0], [0, 0, 10, 0]],
                [[0, 0, 0, 10], [0, 0, 0, 10], [10, 10, 10, 10], [0, 0, 0, 0]]
            ],
            // W piece
            [
                [[11, 0, 0, 0], [11, 11, 0, 0], [0, 11, 11, 0], [0, 0, 0, 0]],
                [[0, 11, 11, 0], [11, 11, 0, 0], [11, 0, 0, 0], [0, 0, 0, 0]],
                [[11, 11, 0, 0], [0, 11, 11, 0], [0, 0, 11, 0], [0, 0, 0, 0]],
                [[0, 0, 11, 0], [0, 11, 11, 0], [11, 11, 0, 0], [0, 0, 0, 0]]
            ],
            // P piece
            [
                [[12, 12, 0, 0], [12, 12, 0, 0], [12, 0, 0, 0], [0, 0, 0, 0]],
                [[12, 12, 12, 0], [0, 12, 12, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
                [[0, 0, 12, 0], [0, 12, 12, 0], [0, 12, 12, 0], [0, 0, 0, 0]],
                [[12, 0, 0, 0], [12, 12, 0, 0], [12, 12, 0, 0], [0, 0, 0, 0]]
            ],
        ];

        this.init();
    }

    init() {
        // Initialize board
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            this.board[y] = [];
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                this.board[y][x] = 0;
            }
        }

        this.setupEventListeners();
        this.draw();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) {
                if (e.key === 'p' || e.key === 'P') {
                    this.togglePause();
                }
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    break;
                case ' ':
                    e.preventDefault();
                    this.hardDrop();
                    break;
                case 'p':
                case 'P':
                    this.togglePause();
                    break;
            }
        });

        // Button controls
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('restartBtn').addEventListener('click', () => this.reset());

        // Mobile controls
        document.getElementById('btnLeft').addEventListener('click', () => this.movePiece(-1, 0));
        document.getElementById('btnRight').addEventListener('click', () => this.movePiece(1, 0));
        document.getElementById('btnRotate').addEventListener('click', () => this.rotatePiece());
        document.getElementById('btnSoftDrop').addEventListener('click', () => this.movePiece(0, 1));
        document.getElementById('btnHardDrop').addEventListener('click', () => this.hardDrop());

        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.gameRunning || this.gamePaused) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30) this.movePiece(1, 0);
                else if (deltaX < -30) this.movePiece(-1, 0);
            } else {
                if (deltaY > 30) this.movePiece(0, 1);
                else if (deltaY < -30) this.rotatePiece();
            }
        });
    }

    createPiece(type) {
        return {
            type: type,
            x: Math.floor(this.BOARD_WIDTH / 2) - 2,
            y: 0,
            rotation: 0,
            shape: this.pieces[type]
        };
    }

    spawnPiece() {
        const type = this.nextPiece ? this.nextPiece.type : Math.floor(Math.random() * 7) + 1;
        this.currentPiece = this.createPiece(type);
        this.nextPiece = this.createPiece(Math.floor(Math.random() * 7) + 1);
        this.drawNext();

        // Check game over
        if (this.isCollision(this.currentPiece, 0, 0)) {
            this.gameOver();
        }
    }

    movePiece(dx, dy) {
        if (!this.currentPiece) return;

        if (!this.isCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            this.draw();
            return true;
        }
        return false;
    }

    rotatePiece() {
        if (!this.currentPiece) return;

        const originalRotation = this.currentPiece.rotation;
        this.currentPiece.rotation = (this.currentPiece.rotation + 1) % 4;

        // Try wall kicks
        const offsets = [
            [0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1]
        ];

        for (let [dx, dy] of offsets) {
            if (!this.isCollision(this.currentPiece, dx, dy)) {
                this.currentPiece.x += dx;
                this.currentPiece.y += dy;
                this.draw();
                return;
            }
        }

        // Revert if rotation fails
        this.currentPiece.rotation = originalRotation;
    }

    hardDrop() {
        if (!this.currentPiece) return;

        while (this.movePiece(0, 1)) {
            this.score += 2;
        }
        this.placePiece();
    }

    isCollision(piece, dx, dy) {
        const shape = piece.shape[piece.rotation];

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (shape[y][x]) {
                    const newX = piece.x + x + dx;
                    const newY = piece.y + y + dy;

                    if (newX < 0 || newX >= this.BOARD_WIDTH ||
                        newY >= this.BOARD_HEIGHT ||
                        (newY >= 0 && this.board[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    placePiece() {
        if (!this.currentPiece) return;

        const shape = this.currentPiece.shape[this.currentPiece.rotation];

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;

                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.type;
                    }
                }
            }
        }

        this.clearLines();
        this.spawnPiece();
        this.updateScore();
    }

    clearLines() {
        let linesCleared = 0;

        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(new Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // Check same line again
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            const points = [0, 40, 100, 300, 1200];
            this.score += points[linesCleared] * this.level;
            this.updateLevel();
            this.updateScore();
        }
    }

    updateLevel() {
        this.level = Math.floor(this.lines / 10) + 1;
        this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 50);
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('level').textContent = this.level;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0f0f1e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw board
        this.drawBoard();

        // Draw current piece
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece, this.ctx);
        }

        // Draw ghost piece
        if (this.currentPiece) {
            this.drawGhostPiece();
        }
    }

    drawBoard() {
        // Draw grid
        this.ctx.strokeStyle = '#1a1a2e';
        this.ctx.lineWidth = 1;

        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                this.ctx.strokeRect(x * this.CELL_SIZE, y * this.CELL_SIZE,
                    this.CELL_SIZE, this.CELL_SIZE);

                if (this.board[y][x]) {
                    this.ctx.fillStyle = this.colors[this.board[y][x]];
                    this.ctx.fillRect(x * this.CELL_SIZE + 1, y * this.CELL_SIZE + 1,
                        this.CELL_SIZE - 2, this.CELL_SIZE - 2);

                    // Add highlight
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.fillRect(x * this.CELL_SIZE + 1, y * this.CELL_SIZE + 1,
                        this.CELL_SIZE - 2, 5);
                }
            }
        }
    }

    drawPiece(piece, ctx) {
        const shape = piece.shape[piece.rotation];

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (shape[y][x]) {
                    const drawX = (piece.x + x) * this.CELL_SIZE;
                    const drawY = (piece.y + y) * this.CELL_SIZE;

                    ctx.fillStyle = this.colors[piece.type];
                    ctx.fillRect(drawX + 1, drawY + 1,
                        this.CELL_SIZE - 2, this.CELL_SIZE - 2);

                    // Add highlight
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(drawX + 1, drawY + 1, this.CELL_SIZE - 2, 5);
                }
            }
        }
    }

    drawGhostPiece() {
        if (!this.currentPiece) return;

        const ghostPiece = {
            ...this.currentPiece,
            y: this.currentPiece.y
        };

        // Find the lowest position
        while (!this.isCollision(ghostPiece, 0, 1)) {
            ghostPiece.y++;
        }

        if (ghostPiece.y === this.currentPiece.y) return;

        const shape = ghostPiece.shape[ghostPiece.rotation];
        this.ctx.globalAlpha = 0.3;

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (shape[y][x]) {
                    const drawX = (ghostPiece.x + x) * this.CELL_SIZE;
                    const drawY = (ghostPiece.y + y) * this.CELL_SIZE;

                    this.ctx.strokeStyle = this.colors[ghostPiece.type];
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(drawX + 2, drawY + 2,
                        this.CELL_SIZE - 4, this.CELL_SIZE - 4);
                }
            }
        }

        this.ctx.globalAlpha = 1.0;
    }

    drawNext() {
        if (!this.nextPiece) return;

        this.nextCtx.fillStyle = '#0f0f1e';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

        const shape = this.nextPiece.shape[0];
        const cellSize = 25;
        const offsetX = (this.nextCanvas.width - 4 * cellSize) / 2;
        const offsetY = (this.nextCanvas.height - 4 * cellSize) / 2;

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (shape[y][x]) {
                    const drawX = offsetX + x * cellSize;
                    const drawY = offsetY + y * cellSize;

                    this.nextCtx.fillStyle = this.colors[this.nextPiece.type];
                    this.nextCtx.fillRect(drawX + 1, drawY + 1,
                        cellSize - 2, cellSize - 2);
                }
            }
        }
    }

    drop() {
        if (!this.movePiece(0, 1)) {
            this.placePiece();
        }
    }

    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
    }

    togglePause() {
        if (!this.gameRunning) return;

        this.gamePaused = !this.gamePaused;
        document.getElementById('paused').classList.toggle('hidden', !this.gamePaused);
    }

    reset() {
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.gameRunning = false;
        this.gamePaused = false;
        this.currentPiece = null;
        this.nextPiece = null;

        // Clear board
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                this.board[y][x] = 0;
            }
        }

        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('paused').classList.add('hidden');
        this.updateScore();
        this.draw();
        this.nextCtx.fillStyle = '#0f0f1e';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    }

    start() {
        if (this.gameRunning) return;

        this.reset();
        this.gameRunning = true;
        this.spawnPiece();
        this.gameLoop(0);
    }

    gameLoop(time) {
        if (!this.gameRunning) return;

        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        if (!this.gamePaused) {
            this.dropCounter += deltaTime;

            if (this.dropCounter > this.dropInterval) {
                this.drop();
                this.dropCounter = 0;
            }
        }

        this.draw();
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Tetris();
});

