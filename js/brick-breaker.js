// Brick Breaker Game with Level System
class BrickBreaker {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Responsive canvas sizing
        this.baseWidth = 800;
        this.baseHeight = 600;
        this.setCanvasSize();

        // Game state
        this.gameRunning = false;
        this.gamePaused = false;
        this.currentLevel = 1;
        this.selectedLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.ballLaunched = false;
        this.completedLevels = new Set();

        // Paddle
        this.paddle = {
            x: this.baseWidth / 2 - 75,
            y: this.baseHeight - 30,
            width: 150,
            height: 15,
            speed: 8
        };

        // Ball
        this.ball = {
            x: this.baseWidth / 2,
            y: this.baseHeight - 50,
            radius: 10,
            dx: 0,
            dy: 0,
            speed: 5
        };

        // Bricks
        this.bricks = [];
        this.brickRows = 8;
        this.brickCols = 10;
        this.brickWidth = 70;
        this.brickHeight = 25;
        this.brickPadding = 5;
        this.brickOffsetTop = 60;
        this.brickOffsetLeft = 35;

        // Level definitions
        this.levelDefinitions = this.createLevelDefinitions();

        // Input
        this.keys = {};
        this.touchControls = {
            left: false,
            right: false
        };

        this.setupEventListeners();
        this.setupUI();
        this.setCanvasSize();
        this.createLevelSelect();
        this.draw();
    }

    createLevelDefinitions() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
        
        return [
            // Level 1: Easy - Full grid
            {
                rows: 4,
                cols: 8,
                pattern: 'full',
                speed: 4,
                description: 'Easy Start'
            },
            // Level 2: Easy - Pyramid
            {
                rows: 5,
                cols: 9,
                pattern: 'pyramid',
                speed: 4.5,
                description: 'Pyramid'
            },
            // Level 3: Medium - Checkerboard
            {
                rows: 5,
                cols: 10,
                pattern: 'checkerboard',
                speed: 5,
                description: 'Checkerboard'
            },
            // Level 4: Medium - Hollow
            {
                rows: 6,
                cols: 10,
                pattern: 'hollow',
                speed: 5.5,
                description: 'Hollow Center'
            },
            // Level 5: Medium - Lines
            {
                rows: 6,
                cols: 10,
                pattern: 'lines',
                speed: 6,
                description: 'Horizontal Lines'
            },
            // Level 6: Hard - Zigzag
            {
                rows: 7,
                cols: 10,
                pattern: 'zigzag',
                speed: 6.5,
                description: 'Zigzag'
            },
            // Level 7: Hard - Spiral
            {
                rows: 7,
                cols: 10,
                pattern: 'spiral',
                speed: 7,
                description: 'Spiral'
            },
            // Level 8: Hard - Corners
            {
                rows: 8,
                cols: 10,
                pattern: 'corners',
                speed: 7.5,
                description: 'Four Corners'
            },
            // Level 9: Very Hard - Cross
            {
                rows: 8,
                cols: 10,
                pattern: 'cross',
                speed: 8,
                description: 'Cross Pattern'
            },
            // Level 10: Very Hard - Full
            {
                rows: 8,
                cols: 10,
                pattern: 'full',
                speed: 8.5,
                description: 'Full Grid'
            },
            // Level 11: Expert - Double Pyramid
            {
                rows: 8,
                cols: 10,
                pattern: 'doublePyramid',
                speed: 9,
                description: 'Double Pyramid'
            },
            // Level 12: Expert - Diamond
            {
                rows: 8,
                cols: 10,
                pattern: 'diamond',
                speed: 9.5,
                description: 'Diamond'
            },
            // Level 13: Master - Complex
            {
                rows: 8,
                cols: 10,
                pattern: 'complex',
                speed: 10,
                description: 'Complex Pattern'
            },
            // Level 14: Master - Full Hard
            {
                rows: 8,
                cols: 10,
                pattern: 'full',
                speed: 10.5,
                description: 'Master Challenge'
            },
            // Level 15: Legendary
            {
                rows: 8,
                cols: 10,
                pattern: 'full',
                speed: 11,
                description: 'Legendary'
            }
        ];
    }

    setCanvasSize() {
        const isMobile = window.innerWidth <= 768;
        const isLandscape = window.innerWidth > window.innerHeight && window.innerWidth <= 900;

        let maxWidth, maxHeight;

        if (isMobile) {
            // Mobile: account for header, info bar, controls, and padding
            const headerHeight = isLandscape ? 50 : 70;
            const infoBarHeight = 60;
            const mobileControlsHeight = isLandscape ? 0 : 70;
            const padding = 20;

            maxWidth = window.innerWidth - 10;
            maxHeight = window.innerHeight - headerHeight - infoBarHeight - mobileControlsHeight - padding;
        } else {
            // Desktop/Tablet
            const headerHeight = 70;
            const infoBarHeight = 70;
            const padding = 30;
            maxWidth = Math.min(window.innerWidth - 40, this.baseWidth);
            maxHeight = window.innerHeight - headerHeight - infoBarHeight - padding;
        }

        // Calculate scale maintaining aspect ratio
        const scaleX = maxWidth / this.baseWidth;
        const scaleY = maxHeight / this.baseHeight;
        const scale = Math.min(scaleX, scaleY, 1);

        // Set canvas size
        this.canvas.width = this.baseWidth;
        this.canvas.height = this.baseHeight;
        this.canvas.style.width = (this.baseWidth * scale) + 'px';
        this.canvas.style.height = (this.baseHeight * scale) + 'px';

        // Adjust brick layout for smaller screens
        if (isMobile) {
            this.brickCols = Math.max(6, Math.floor(10 * scale));
            this.brickRows = Math.max(5, Math.floor(8 * scale));
            this.brickWidth = Math.floor(70 * scale);
            this.brickHeight = Math.floor(25 * scale);
            this.brickPadding = Math.floor(5 * scale);
        } else {
            this.brickCols = 10;
            this.brickRows = 8;
            this.brickWidth = 70;
            this.brickHeight = 25;
            this.brickPadding = 5;
        }

        // Reinitialize level if game is running
        if (this.gameRunning) {
            this.initLevel(this.selectedLevel);
        }
    }

    setupEventListeners() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (e.code === 'Space' && this.gameRunning && !this.gamePaused) {
                e.preventDefault();
                this.launchBall();
            }

            if (e.code === 'KeyP' && this.gameRunning) {
                this.togglePause();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Window resize with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.setCanvasSize();
                if (this.gameRunning) {
                    this.draw();
                }
            }, 150);
        });

        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.setCanvasSize();
                if (this.gameRunning) {
                    this.draw();
                }
            }, 200);
        });

        // Mouse move (desktop) – move paddle with cursor
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.baseWidth / rect.width;

            const mouseX = (e.clientX - rect.left) * scaleX;
            this.paddle.x = mouseX - this.paddle.width / 2;

            // Clamp inside game boundaries
            this.paddle.x = Math.max(0, Math.min(this.baseWidth - this.paddle.width, this.paddle.x));
        });

        // Touch move (mobile) – drag finger to move paddle
        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.baseWidth / rect.width;

            const touchX = (e.touches[0].clientX - rect.left) * scaleX;
            this.paddle.x = touchX - this.paddle.width / 2;

            // clamp
            this.paddle.x = Math.max(0, Math.min(this.baseWidth - this.paddle.width, this.paddle.x));
        }, {passive: false});

        this.canvas.addEventListener('click', () => {
            if (this.gameRunning && !this.gamePaused) {
                this.launchBall();
            }
        });

        // Touch controls
        this.setupTouchControls();
    }

    setupTouchControls() {
        const btnLeft = document.getElementById('btnLeft');
        const btnRight = document.getElementById('btnRight');
        const btnLaunch = document.getElementById('btnLaunch');

        [btnLeft, btnRight, btnLaunch].forEach(btn => {
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    if (btn === btnLeft) this.touchControls.left = true;
                    if (btn === btnRight) this.touchControls.right = true;
                    if (btn === btnLaunch && this.gameRunning && !this.gamePaused) {
                        this.launchBall();
                    }
                });

                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    if (btn === btnLeft) this.touchControls.left = false;
                    if (btn === btnRight) this.touchControls.right = false;
                });

                btn.addEventListener('mousedown', () => {
                    if (btn === btnLeft) this.touchControls.left = true;
                    if (btn === btnRight) this.touchControls.right = true;
                    if (btn === btnLaunch && this.gameRunning && !this.gamePaused) {
                        this.launchBall();
                    }
                });

                btn.addEventListener('mouseup', () => {
                    if (btn === btnLeft) this.touchControls.left = false;
                    if (btn === btnRight) this.touchControls.right = false;
                });

                btn.addEventListener('mouseleave', () => {
                    if (btn === btnLeft) this.touchControls.left = false;
                    if (btn === btnRight) this.touchControls.right = false;
                });
            }
        });
    }

    setupUI() {
        document.getElementById('backBtn').addEventListener('click', () => {
            if (this.gameRunning) {
                this.gameRunning = false;
                this.gamePaused = false;
            }
            this.showLevelSelect();
        });
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.reset());
        document.getElementById('levelSelectBtn').addEventListener('click', () => this.showLevelSelect());
        document.getElementById('levelSelectBtn2').addEventListener('click', () => this.showLevelSelect());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
    }

    createLevelSelect() {
        const levelGrid = document.getElementById('levelGrid');
        levelGrid.innerHTML = '';

        this.levelDefinitions.forEach((level, index) => {
            const levelNum = index + 1;
            const isLocked = levelNum > 1 && !this.completedLevels.has(levelNum - 1);
            const isCompleted = this.completedLevels.has(levelNum);

            const btn = document.createElement('button');
            btn.className = `level-btn ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`;
            btn.textContent = levelNum;
            btn.setAttribute('data-level', levelNum);

            if (!isLocked) {
                btn.addEventListener('click', () => this.startLevel(levelNum));
            }

            levelGrid.appendChild(btn);
        });
    }

    showLevelSelect() {
        this.gameRunning = false;
        this.gamePaused = false;
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('levelSelectScreen').classList.remove('hidden');
        this.createLevelSelect();
    }

    startLevel(levelNum) {
        this.selectedLevel = levelNum;
        this.currentLevel = levelNum;
        this.score = 0;
        this.lives = 3;
        this.ballLaunched = false;

        const levelDef = this.levelDefinitions[levelNum - 1];
        this.ball.speed = levelDef.speed;

        document.getElementById('levelSelectScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');

        // Show/hide mobile controls
        const mobileControls = document.querySelector('.mobile-controls');
        if (window.innerWidth <= 768) {
            mobileControls.classList.remove('hidden');
        } else {
            mobileControls.classList.add('hidden');
        }

        this.setCanvasSize();
        this.initLevel(levelNum);
        this.updateScore();
        this.start();
    }

    initLevel(levelNum) {
        this.bricks = [];
        const levelDef = this.levelDefinitions[levelNum - 1];
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];

        this.brickRows = levelDef.rows;
        this.brickCols = levelDef.cols;

        // Calculate total brick area width and center bricks
        const totalBrickWidth = this.brickCols * this.brickWidth + (this.brickCols - 1) * this.brickPadding;
        const actualOffsetLeft = Math.max(10, (this.baseWidth - totalBrickWidth) / 2);

        for (let r = 0; r < this.brickRows; r++) {
            for (let c = 0; c < this.brickCols; c++) {
                let visible = true;

                // Apply pattern
                switch (levelDef.pattern) {
                    case 'full':
                        visible = true;
                        break;
                    case 'pyramid':
                        const center = Math.floor(this.brickCols / 2);
                        visible = Math.abs(c - center) <= r;
                        break;
                    case 'checkerboard':
                        visible = (r + c) % 2 === 0;
                        break;
                    case 'hollow':
                        visible = r === 0 || r === this.brickRows - 1 || c === 0 || c === this.brickCols - 1;
                        break;
                    case 'lines':
                        visible = r % 2 === 0;
                        break;
                    case 'zigzag':
                        visible = (r + c) % 3 !== 0;
                        break;
                    case 'spiral':
                        const minDist = Math.min(r, this.brickRows - 1 - r, c, this.brickCols - 1 - c);
                        visible = minDist % 2 === 0;
                        break;
                    case 'corners':
                        const cornerSize = 3;
                        visible = (r < cornerSize && c < cornerSize) ||
                                 (r < cornerSize && c >= this.brickCols - cornerSize) ||
                                 (r >= this.brickRows - cornerSize && c < cornerSize) ||
                                 (r >= this.brickRows - cornerSize && c >= this.brickCols - cornerSize);
                        break;
                    case 'cross':
                        const centerRow = Math.floor(this.brickRows / 2);
                        const centerCol = Math.floor(this.brickCols / 2);
                        visible = r === centerRow || c === centerCol;
                        break;
                    case 'doublePyramid':
                        const center2 = Math.floor(this.brickCols / 2);
                        const distFromCenter = Math.abs(c - center2);
                        visible = distFromCenter <= Math.min(r, this.brickRows - 1 - r);
                        break;
                    case 'diamond':
                        const centerRow2 = Math.floor(this.brickRows / 2);
                        const centerCol2 = Math.floor(this.brickCols / 2);
                        visible = Math.abs(r - centerRow2) + Math.abs(c - centerCol2) <= Math.min(this.brickRows, this.brickCols) / 2;
                        break;
                    case 'complex':
                        visible = (r * this.brickCols + c) % 3 !== 0 && !(r === Math.floor(this.brickRows / 2) && c === Math.floor(this.brickCols / 2));
                        break;
                }

                if (visible) {
                    this.bricks.push({
                        x: c * (this.brickWidth + this.brickPadding) + actualOffsetLeft,
                        y: r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop,
                        width: this.brickWidth,
                        height: this.brickHeight,
                        color: colors[r % colors.length],
                        visible: true
                    });
                }
            }
        }

        this.resetBall();
    }

    resetBall() {
        this.ball.x = this.paddle.x + this.paddle.width / 2;
        this.ball.y = this.paddle.y - this.ball.radius - 5;
        this.ball.dx = 0;
        this.ball.dy = 0;
        this.ballLaunched = false;
    }

    launchBall() {
        if (this.ballLaunched) return;

        this.ballLaunched = true;
        const angle = (Math.random() * Math.PI / 3) - Math.PI / 6 + Math.PI / 2; // -30 to 30 degrees from vertical
        this.ball.dx = Math.sin(angle) * this.ball.speed;
        this.ball.dy = -Math.cos(angle) * this.ball.speed;
    }

    update() {
        if (!this.gameRunning || this.gamePaused) return;

        // Move paddle
        if ((this.keys['ArrowLeft'] || this.touchControls.left) && this.paddle.x > 0) {
            this.paddle.x -= this.paddle.speed;
        }
        if ((this.keys['ArrowRight'] || this.touchControls.right) &&
            this.paddle.x < this.baseWidth - this.paddle.width) {
            this.paddle.x += this.paddle.speed;
        }

        // Update ball position if launched
        if (this.ballLaunched) {
            this.ball.x += this.ball.dx;
            this.ball.y += this.ball.dy;
        } else {
            // Ball follows paddle
            this.ball.x = this.paddle.x + this.paddle.width / 2;
        }

        // Ball collision with walls
        if (this.ball.x - this.ball.radius <= 0 || this.ball.x + this.ball.radius >= this.baseWidth) {
            this.ball.dx *= -1;
            this.ball.x = Math.max(this.ball.radius, Math.min(this.baseWidth - this.ball.radius, this.ball.x));
        }

        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.dy *= -1;
            this.ball.y = this.ball.radius;
        }

        // Ball collision with paddle
        if (this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.y - this.ball.radius <= this.paddle.y + this.paddle.height &&
            this.ball.x + this.ball.radius >= this.paddle.x &&
            this.ball.x - this.ball.radius <= this.paddle.x + this.paddle.width) {

            // Calculate hit position on paddle (-1 to 1)
            const hitPos = (this.ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
            const angle = hitPos * Math.PI / 3; // Max 60 degrees

            const speed = Math.sqrt(this.ball.dx ** 2 + this.ball.dy ** 2);
            this.ball.dx = Math.sin(angle) * speed;
            this.ball.dy = -Math.abs(Math.cos(angle) * speed);

            this.ball.y = this.paddle.y - this.ball.radius;
        }

        // Ball collision with bricks
        for (let brick of this.bricks) {
            if (!brick.visible) continue;

            if (this.ball.x + this.ball.radius >= brick.x &&
                this.ball.x - this.ball.radius <= brick.x + brick.width &&
                this.ball.y + this.ball.radius >= brick.y &&
                this.ball.y - this.ball.radius <= brick.y + brick.height) {

                brick.visible = false;
                this.score += 10 * this.currentLevel;
                this.updateScore();

                // Determine which side was hit
                const ballCenterX = this.ball.x;
                const ballCenterY = this.ball.y;
                const brickCenterX = brick.x + brick.width / 2;
                const brickCenterY = brick.y + brick.height / 2;

                const dx = ballCenterX - brickCenterX;
                const dy = ballCenterY - brickCenterY;

                if (Math.abs(dx) > Math.abs(dy)) {
                    this.ball.dx *= -1;
                } else {
                    this.ball.dy *= -1;
                }

                break;
            }
        }

        // Check if all bricks are destroyed
        if (this.bricks.every(brick => !brick.visible)) {
            this.completeLevel();
        }

        // Ball fell off-screen
        if (this.ball.y > this.baseHeight) {
            this.loseLife();
        }
    }

    loseLife() {
        this.lives--;
        this.updateScore();

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetBall();
        }
    }

    completeLevel() {
        this.gameRunning = false;
        this.completedLevels.add(this.currentLevel);
        document.getElementById('levelScore').textContent = this.score;
        document.getElementById('levelCompleteOverlay').classList.remove('hidden');
    }

    nextLevel() {
        const nextLevelNum = this.currentLevel + 1;
        if (nextLevelNum <= this.levelDefinitions.length) {
            this.startLevel(nextLevelNum);
        } else {
            // All levels completed
            document.getElementById('levelCompleteOverlay').classList.add('hidden');
            document.getElementById('gameOverTitle').textContent = 'All Levels Complete!';
            this.gameOver();
        }
    }

    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.currentLevel;
        document.getElementById('gameOverOverlay').classList.remove('hidden');
    }

    togglePause() {
        if (!this.gameRunning) return;
        this.gamePaused = !this.gamePaused;
        document.getElementById('pausedOverlay').classList.toggle('hidden', !this.gamePaused);
    }

    start() {
        this.gameRunning = true;
        this.gamePaused = false;
        document.getElementById('pausedOverlay').classList.add('hidden');
        document.getElementById('gameOverOverlay').classList.add('hidden');
        document.getElementById('levelCompleteOverlay').classList.add('hidden');

        this.gameLoop();
    }

    reset() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.lives = 3;
        this.ballLaunched = false;

        const levelDef = this.levelDefinitions[this.selectedLevel - 1];
        this.ball.speed = levelDef.speed;

        this.paddle.x = this.baseWidth / 2 - 75;
        this.initLevel(this.selectedLevel);
        this.updateScore();

        document.getElementById('pausedOverlay').classList.add('hidden');
        document.getElementById('gameOverOverlay').classList.add('hidden');
        document.getElementById('levelCompleteOverlay').classList.add('hidden');

        this.draw();
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.currentLevel;
        document.getElementById('lives').textContent = this.lives;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.baseWidth, this.baseHeight);

        // Draw bricks
        this.bricks.forEach(brick => {
            if (brick.visible) {
                this.ctx.fillStyle = brick.color;
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

                // Add highlight
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.fillRect(brick.x, brick.y, brick.width, 3);
            }
        });

        // Draw paddle
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

        // Add paddle highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, 3);

        // Draw ball
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Add ball glow
        this.ctx.shadowColor = '#ffffff';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
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
    new BrickBreaker();
});
