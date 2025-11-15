// Pong Game with AI and Two-Player Modes
class PongGame {
    constructor() {
        this.board = document.getElementById("board");
        this.context = this.board.getContext("2d");
        
        // Responsive canvas sizing
        this.baseWidth = 800;
        this.baseHeight = 500;
        this.setCanvasSize();
        
        // Game state
        this.gameMode = null; // 'friend' or 'ai'
        this.gameRunning = false;
        this.gamePaused = false;
        this.winningScore = 5;
        
        // Paddle properties
        this.paddleWidth = 12;
        this.paddleHeight = 80;
        this.paddleSpeed = 5;
        this.aiSpeed = 4;
        this.aiDifficulty = 'medium'; // 'easy', 'medium', 'hard', 'impossible'
        this.aiSettings = {
            easy: { speed: 2.5, accuracy: 0.6, reactionDelay: 0.3, errorRange: 80 },
            medium: { speed: 4, accuracy: 0.75, reactionDelay: 0.15, errorRange: 50 },
            hard: { speed: 5.5, accuracy: 0.9, reactionDelay: 0.05, errorRange: 25 },
            impossible: { speed: 7, accuracy: 1.0, reactionDelay: 0, errorRange: 5 }
        };
        
        // Ball properties
        this.ballSize = 12;
        this.ballSpeed = 4;
        this.maxBallSpeed = 8;
        
        // Game objects
        this.player1 = {
            x: 20,
            y: this.baseHeight / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            velocityY: 0,
            score: 0
        };
        
        this.player2 = {
            x: this.baseWidth - this.paddleWidth - 20,
            y: this.baseHeight / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            velocityY: 0,
            score: 0
        };
        
        this.ball = {
            x: this.baseWidth / 2,
            y: this.baseHeight / 2,
            width: this.ballSize,
            height: this.ballSize,
            velocityX: 0,
            velocityY: 0
        };
        
        // Input handling
        this.keys = {};
        this.touchControls = {
            p1Up: false,
            p1Down: false,
            p2Up: false,
            p2Down: false
        };
        
        this.setupEventListeners();
        this.setupUI();
        this.draw();
    }
    
    setCanvasSize() {
        // Calculate available space more accurately
        const isMobile = window.innerWidth <= 768;
        const isLandscape = window.innerWidth > window.innerHeight && window.innerWidth <= 900;
        
        let maxWidth, maxHeight;
        
        if (isMobile) {
            // Mobile: account for header, score, controls, and padding
            const headerHeight = 80;
            const scoreHeight = 100;
            const controlsHeight = isLandscape ? 0 : 120; // Hide controls in landscape
            const padding = 40;
            
            maxWidth = window.innerWidth - 20;
            maxHeight = window.innerHeight - headerHeight - scoreHeight - controlsHeight - padding;
        } else {
            // Desktop/Tablet
            maxWidth = Math.min(window.innerWidth - 40, this.baseWidth);
            maxHeight = Math.min(window.innerHeight - 200, this.baseHeight);
        }
        
        // Calculate scale maintaining aspect ratio
        const scaleX = maxWidth / this.baseWidth;
        const scaleY = maxHeight / this.baseHeight;
        const scale = Math.min(scaleX, scaleY, 1);
        
        // Set canvas size
        this.board.width = this.baseWidth;
        this.board.height = this.baseHeight;
        this.board.style.width = (this.baseWidth * scale) + 'px';
        this.board.style.height = (this.baseHeight * scale) + 'px';
        
        // Update positions for new size (only if players are initialized)
        if (this.player1 && this.player2) {
            this.player1.x = 20;
            this.player2.x = this.baseWidth - this.paddleWidth - 20;
            if (this.ball) {
                this.resetBall();
            }
        }
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
            if (e.code === "KeyP" && this.gameRunning) {
                this.togglePause();
            }
        });
        
        document.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        });
        
        // Window resize
        window.addEventListener("resize", () => {
            this.setCanvasSize();
            this.draw();
        });
        
        // Touch events for mobile controls
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        const mobileBtns = {
            'mobileP1Up': 'p1Up',
            'mobileP1Down': 'p1Down',
            'mobileP2Up': 'p2Up',
            'mobileP2Down': 'p2Down'
        };
        
        Object.entries(mobileBtns).forEach(([id, key]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.touchControls[key] = true;
                });
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.touchControls[key] = false;
                });
                btn.addEventListener('mousedown', () => {
                    this.touchControls[key] = true;
                });
                btn.addEventListener('mouseup', () => {
                    this.touchControls[key] = false;
                });
                btn.addEventListener('mouseleave', () => {
                    this.touchControls[key] = false;
                });
            }
        });
    }
    
    setupUI() {
        // Mode selection
        document.getElementById('vsFriendBtn').addEventListener('click', () => {
            this.startGame('friend');
        });
        
        document.getElementById('vsAiBtn').addEventListener('click', () => {
            this.showDifficultySelection();
        });
        
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.getAttribute('data-difficulty');
                this.startGame('ai', difficulty);
            });
        });
        
        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            this.hideDifficultySelection();
        });
        
        // Game controls
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('menuBtn').addEventListener('click', () => {
            this.quitToMenu();
        });
        
        document.getElementById('menuBtn2').addEventListener('click', () => {
            this.quitToMenu();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('quitBtn').addEventListener('click', () => {
            this.quitToMenu();
        });
    }
    
    showDifficultySelection() {
        document.getElementById('menuScreen').classList.add('hidden');
        document.getElementById('difficultyScreen').classList.remove('hidden');
    }
    
    hideDifficultySelection() {
        document.getElementById('difficultyScreen').classList.add('hidden');
        document.getElementById('menuScreen').classList.remove('hidden');
    }
    
    startGame(mode, difficulty = 'medium') {
        this.gameMode = mode;
        if (mode === 'ai') {
            this.aiDifficulty = difficulty;
        }
        this.gameRunning = true;
        this.gamePaused = false;
        
        // Update UI
        document.getElementById('menuScreen').classList.add('hidden');
        document.getElementById('difficultyScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        
        // Show/hide mobile controls
        const mobileControls = document.querySelector('.mobile-controls');
        if (window.innerWidth <= 768) {
            mobileControls.classList.remove('hidden');
            // Hide player 2 controls in AI mode
            if (mode === 'ai') {
                document.querySelector('.right-paddle').style.display = 'none';
            } else {
                document.querySelector('.right-paddle').style.display = 'flex';
            }
        } else {
            mobileControls.classList.add('hidden');
        }
        
        // Resize canvas for current screen
        this.setCanvasSize();
        
        // Update labels
        if (mode === 'ai') {
            const difficultyNames = {
                easy: 'Easy AI',
                medium: 'Medium AI',
                hard: 'Hard AI',
                impossible: 'Impossible AI'
            };
            document.getElementById('player1Label').textContent = 'Player';
            document.getElementById('player2Label').textContent = difficultyNames[difficulty] || 'AI';
            document.getElementById('player2ControlsLabel').textContent = difficultyNames[difficulty] || 'AI';
            document.getElementById('player2Controls').innerHTML = '<span style="color: var(--text-secondary);">AI Controlled</span>';
        } else {
            document.getElementById('player1Label').textContent = 'Player 1';
            document.getElementById('player2Label').textContent = 'Player 2';
            document.getElementById('player2ControlsLabel').textContent = 'Player 2';
            document.getElementById('player2Controls').innerHTML = '<kbd>↑</kbd> / <kbd>↓</kbd> Move';
        }
        
        this.resetGame();
        this.gameLoop();
    }
    
    resetGame() {
        // Reset scores
        this.player1.score = 0;
        this.player2.score = 0;
        this.updateScores();
        
        // Reset positions
        this.player1.y = this.baseHeight / 2 - this.paddleHeight / 2;
        this.player2.y = this.baseHeight / 2 - this.paddleHeight / 2;
        this.player1.velocityY = 0;
        this.player2.velocityY = 0;
        
        // Reset ball
        this.resetBall();
        
        // Hide overlays
        document.getElementById('gameOverOverlay').classList.add('hidden');
        document.getElementById('pausedOverlay').classList.add('hidden');
        
        this.draw();
    }
    
    resetBall() {
        this.ball.x = this.baseWidth / 2;
        this.ball.y = this.baseHeight / 2;
        
        // Random direction
        const angle = (Math.random() * Math.PI / 3) - Math.PI / 6; // -30 to 30 degrees
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        this.ball.velocityX = direction * this.ballSpeed * Math.cos(angle);
        this.ball.velocityY = this.ballSpeed * Math.sin(angle);
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        // Handle player 1 input
        if (this.keys['KeyW'] || this.touchControls.p1Up) {
            this.player1.velocityY = -this.paddleSpeed;
        } else if (this.keys['KeyS'] || this.touchControls.p1Down) {
            this.player1.velocityY = this.paddleSpeed;
        } else {
            this.player1.velocityY = 0;
        }
        
        // Handle player 2 input (only in friend mode)
        if (this.gameMode === 'friend') {
            if (this.keys['ArrowUp'] || this.touchControls.p2Up) {
                this.player2.velocityY = -this.paddleSpeed;
            } else if (this.keys['ArrowDown'] || this.touchControls.p2Down) {
                this.player2.velocityY = this.paddleSpeed;
            } else {
                this.player2.velocityY = 0;
            }
        } else {
            // AI control
            this.updateAI();
        }
        
        // Update paddle positions
        this.player1.y += this.player1.velocityY;
        this.player2.y += this.player2.velocityY;
        
        // Keep paddles in bounds
        this.player1.y = Math.max(0, Math.min(this.baseHeight - this.paddleHeight, this.player1.y));
        this.player2.y = Math.max(0, Math.min(this.baseHeight - this.paddleHeight, this.player2.y));
        
        // Update ball
        this.ball.x += this.ball.velocityX;
        this.ball.y += this.ball.velocityY;
        
        // Ball collision with top/bottom walls
        if (this.ball.y <= 0 || this.ball.y + this.ball.height >= this.baseHeight) {
            this.ball.velocityY *= -1;
            this.ball.y = Math.max(0, Math.min(this.baseHeight - this.ball.height, this.ball.y));
        }
        
        // Ball collision with paddles
        if (this.checkCollision(this.ball, this.player1)) {
            if (this.ball.velocityX < 0) {
                this.ball.x = this.player1.x + this.player1.width;
                this.ball.velocityX *= -1;
                this.addSpin(this.player1);
            }
        }
        
        if (this.checkCollision(this.ball, this.player2)) {
            if (this.ball.velocityX > 0) {
                this.ball.x = this.player2.x - this.ball.width;
                this.ball.velocityX *= -1;
                this.addSpin(this.player2);
            }
        }
        
        // Ball out of bounds - scoring
        if (this.ball.x < 0) {
            this.player2.score++;
            this.updateScores();
            this.checkGameOver();
            this.resetBall();
        } else if (this.ball.x + this.ball.width > this.baseWidth) {
            this.player1.score++;
            this.updateScores();
            this.checkGameOver();
            this.resetBall();
        }
    }
    
    updateAI() {
        const settings = this.aiSettings[this.aiDifficulty];
        const paddleCenter = this.player2.y + this.paddleHeight / 2;
        const ballCenter = this.ball.y + this.ball.height / 2;
        
        // Predict ball position (simple prediction)
        let predictedY = ballCenter;
        if (this.ball.velocityX > 0) {
            // Ball moving towards AI, predict where it will be
            const timeToReach = (this.player2.x - this.ball.x) / this.ball.velocityX;
            predictedY = ballCenter + (this.ball.velocityY * timeToReach);
            
            // Clamp prediction to board bounds
            predictedY = Math.max(this.ball.height / 2, Math.min(this.baseHeight - this.ball.height / 2, predictedY));
        }
        
        const targetY = predictedY - this.paddleHeight / 2;
        
        // Add error based on difficulty
        const error = settings.errorRange * (1 - settings.accuracy);
        const adjustedTarget = targetY + (Math.random() * error - error / 2);
        
        // Reaction delay (for easier difficulties)
        if (settings.reactionDelay > 0 && Math.random() < settings.reactionDelay) {
            this.player2.velocityY = 0;
            return;
        }
        
        // Move towards target
        const distance = adjustedTarget - (this.player2.y);
        const threshold = 3;
        
        if (Math.abs(distance) > threshold) {
            if (distance > 0) {
                this.player2.velocityY = settings.speed;
            } else {
                this.player2.velocityY = -settings.speed;
            }
        } else {
            this.player2.velocityY = 0;
        }
    }
    
    addSpin(paddle) {
        // Add spin based on paddle movement
        const spin = paddle.velocityY * 0.1;
        this.ball.velocityY += spin;
        
        // Increase speed slightly
        const speed = Math.sqrt(this.ball.velocityX ** 2 + this.ball.velocityY ** 2);
        if (speed < this.maxBallSpeed) {
            this.ball.velocityX *= 1.05;
            this.ball.velocityY *= 1.05;
        }
    }
    
    checkCollision(ball, paddle) {
        return ball.x < paddle.x + paddle.width &&
               ball.x + ball.width > paddle.x &&
               ball.y < paddle.y + paddle.height &&
               ball.y + ball.height > paddle.y;
    }
    
    checkGameOver() {
        if (this.player1.score >= this.winningScore) {
            this.endGame('Player 1 Wins!', this.player1.score, this.player2.score);
        } else if (this.player2.score >= this.winningScore) {
            const winner = this.gameMode === 'ai' ? 'AI Wins!' : 'Player 2 Wins!';
            this.endGame(winner, this.player1.score, this.player2.score);
        }
    }
    
    endGame(winner, score1, score2) {
        this.gameRunning = false;
        document.getElementById('winnerText').textContent = winner;
        document.getElementById('finalScore1').textContent = score1;
        document.getElementById('finalScore2').textContent = score2;
        document.getElementById('gameOverOverlay').classList.remove('hidden');
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        document.getElementById('pausedOverlay').classList.toggle('hidden', !this.gamePaused);
    }
    
    quitToMenu() {
        this.gameRunning = false;
        this.gamePaused = false;
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('difficultyScreen').classList.add('hidden');
        document.getElementById('menuScreen').classList.remove('hidden');
        document.querySelector('.mobile-controls').classList.add('hidden');
    }
    
    updateScores() {
        document.getElementById('player1Score').textContent = this.player1.score;
        document.getElementById('player2Score').textContent = this.player2.score;
    }
    
    draw() {
        // Clear canvas
        this.context.fillStyle = '#000000';
        this.context.fillRect(0, 0, this.baseWidth, this.baseHeight);
        
        // Draw center line
        this.context.strokeStyle = '#333333';
        this.context.lineWidth = 2;
        this.context.setLineDash([10, 10]);
        this.context.beginPath();
        this.context.moveTo(this.baseWidth / 2, 0);
        this.context.lineTo(this.baseWidth / 2, this.baseHeight);
        this.context.stroke();
        this.context.setLineDash([]);
        
        // Draw paddles (only if initialized)
        if (this.player1 && this.player2) {
            this.context.fillStyle = '#00d4ff';
            this.context.fillRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);
            
            this.context.fillStyle = this.gameMode === 'ai' ? '#ff006e' : '#00d4ff';
            this.context.fillRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);
            
            // Add paddle highlights
            this.context.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.context.fillRect(this.player1.x, this.player1.y, this.player1.width, 5);
            this.context.fillRect(this.player2.x, this.player2.y, this.player2.width, 5);
        }
        
        // Draw ball (only if initialized)
        if (this.ball) {
            this.context.fillStyle = '#ffffff';
            this.context.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);
            
            // Add ball glow
            this.context.shadowColor = '#ffffff';
            this.context.shadowBlur = 10;
            this.context.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);
            this.context.shadowBlur = 0;
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        
        if (this.gameRunning) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new PongGame();
});
