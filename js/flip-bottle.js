// Bottle Flip Game - Level by Level System with Realistic Physics
class BottleFlipGame {
    constructor() {
        this.currentLevel = 1;
        this.selectedLevel = 1;
        this.completedLevels = new Set();
        this.bestScore = 0;
        this.attempts = 0;
        this.isFlipping = false;
        this.animationId = null;

        // Physics properties
        this.bottleY = 0;
        this.bottleX = 0;
        this.velocityY = 0;
        this.velocityX = 0;
        this.rotation = 0;
        this.angularVelocity = 0;
        this.gravity = 0.5;
        this.power = 50;
        this.angle = 0;
        this.startX = 0;
        this.startY = 0;
        this.platforms = [];

        // DOM elements
        this.levelSelectScreen = document.getElementById('levelSelectScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.completeScreen = document.getElementById('completeScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.levelGrid = document.getElementById('levelGrid');
        this.bottle = document.getElementById('bottle');
        this.platformsContainer = document.getElementById('platformsContainer');
        this.trajectory = document.getElementById('trajectory');
        this.aimIndicator = document.getElementById('aimIndicator');
        this.flipBtn = document.getElementById('flipBtn');
        this.powerSlider = document.getElementById('powerSlider');
        this.angleSlider = document.getElementById('angleSlider');
        this.powerValue = document.getElementById('powerValue');
        this.angleValue = document.getElementById('angleValue');
        this.currentLevelNum = document.getElementById('currentLevelNum');
        this.attemptCount = document.getElementById('attemptCount');
        this.levelProgress = document.getElementById('levelProgress');
        this.completedCount = document.getElementById('completedCount');
        this.bestScoreEl = document.getElementById('bestScore');
        this.finalAttempts = document.getElementById('finalAttempts');
        this.finalScore = document.getElementById('finalScore');
        this.completeMessage = document.getElementById('completeMessage');

        // Game container
        this.gameContainer = document.getElementById('gameContainer');
        this.containerWidth = 0;
        this.containerHeight = 0;

        // Load progress
        this.loadProgress();

        // Initialize
        this.setupEventListeners();
        this.createLevelSelect();
        this.updateStats();
    }

    loadProgress() {
        const saved = localStorage.getItem('bottleflip_completed');
        if (saved) {
            this.completedLevels = new Set(JSON.parse(saved));
        }

        const savedScore = localStorage.getItem('bottleflip_bestscore');
        if (savedScore) {
            this.bestScore = parseInt(savedScore) || 0;
        }
    }

    saveProgress() {
        localStorage.setItem('bottleflip_completed', JSON.stringify([...this.completedLevels]));
        localStorage.setItem('bottleflip_bestscore', this.bestScore.toString());
    }

    setupEventListeners() {
        this.flipBtn.addEventListener('click', () => this.flipBottle());
        document.getElementById('backBtn').addEventListener('click', () => this.showLevelSelect());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        document.getElementById('levelSelectBtn').addEventListener('click', () => this.showLevelSelect());
        document.getElementById('retryBtn').addEventListener('click', () => this.retryLevel());
        document.getElementById('backToSelectBtn').addEventListener('click', () => this.showLevelSelect());

        // Power and angle controls
        if (this.powerSlider && this.powerValue) {
            this.powerSlider.addEventListener('input', (e) => {
                this.power = parseInt(e.target.value);
                this.powerValue.textContent = `${this.power}%`;
                this.updateTrajectory();
            });
        }

        if (this.angleSlider && this.angleValue) {
            this.angleSlider.addEventListener('input', (e) => {
                this.angle = parseInt(e.target.value);
                this.angleValue.textContent = `${this.angle}°`;
                this.updateTrajectory();
            });
        }

        // Close overlay when clicking outside
        this.completeScreen.addEventListener('click', (e) => {
            if (e.target === this.completeScreen) {
                this.showLevelSelect();
            }
        });

        this.gameOverScreen.addEventListener('click', (e) => {
            if (e.target === this.gameOverScreen) {
                this.showLevelSelect();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.gameScreen.classList.contains('active')) {
                this.setupLevel();
            }
        });
    }

    createLevelSelect() {
        this.levelGrid.innerHTML = '';
        const totalLevels = bottleFlipLevels.length;

        for (let i = 1; i <= totalLevels; i++) {
            const levelBtn = document.createElement('div');
            levelBtn.className = 'level-btn';
            levelBtn.textContent = i;

            if (this.completedLevels.has(i)) {
                levelBtn.classList.add('completed');
            } else if (i > 1 && !this.completedLevels.has(i - 1)) {
                levelBtn.classList.add('locked');
            } else {
                levelBtn.addEventListener('click', () => this.startLevel(i));
            }

            this.levelGrid.appendChild(levelBtn);
        }
    }

    startLevel(levelNum) {
        this.selectedLevel = levelNum;
        this.currentLevel = levelNum;
        this.attempts = 0;
        this.isFlipping = false;

        const level = bottleFlipLevels[levelNum - 1];
        if (!level) return;

        this.showScreen('gameScreen');
        
        // Wait for screen to be visible before setting up
        setTimeout(() => {
            this.setupLevel();
            this.updateStats();
            
            // Show trajectory and aim indicator
            if (this.trajectory) {
                this.trajectory.style.display = 'block';
            }
            if (this.aimIndicator) {
                this.aimIndicator.style.display = 'block';
            }
        }, 50);
    }

    setupLevel() {
        const level = bottleFlipLevels[this.currentLevel - 1];
        if (!level) return;

        // Get container dimensions
        const rect = this.gameContainer.getBoundingClientRect();
        this.containerWidth = rect.width;
        this.containerHeight = rect.height;

        // Set level properties
        this.gravity = level.gravity || 0.5;
        
        // Calculate starting position (bottom left) - y is from bottom
        this.startX = 50;
        this.startY = 100; // Distance from bottom
        this.bottleX = this.startX;
        this.bottleY = this.startY;
        this.rotation = 0;
        this.angularVelocity = 0;

        // Clear previous platforms
        this.platformsContainer.innerHTML = '';
        this.platforms = [];

        // Create platforms from level data
        if (level.platforms && level.platforms.length > 0) {
            level.platforms.forEach((platform, index) => {
                const platformEl = document.createElement('div');
                platformEl.className = 'platform';
                platformEl.dataset.index = index;
                
                const width = platform.width * (this.containerWidth / 500);
                const height = platform.height || 100;
                const x = platform.x * (this.containerWidth / 500);
                // y from level data is distance from bottom, convert to top position
                const yFromBottom = platform.y || 0;
                const topPosition = this.containerHeight - yFromBottom - height;

                platformEl.style.width = `${width}px`;
                platformEl.style.height = `${height}px`;
                platformEl.style.left = `${x}px`;
                platformEl.style.top = `${topPosition}px`;

                // Add platform type styling
                if (platform.type === 'table') {
                    platformEl.classList.add('platform-table');
                } else if (platform.type === 'chair') {
                    platformEl.classList.add('platform-chair');
                } else if (platform.type === 'box') {
                    platformEl.classList.add('platform-box');
                }

                this.platformsContainer.appendChild(platformEl);

                // Store platform data - y is top position, x is left position
                this.platforms.push({
                    element: platformEl,
                    x: x,
                    y: topPosition, // Top position in pixels
                    width: width,
                    height: height,
                    target: platform.target || false
                });
            });
        }

        // Reset controls
        this.power = 50;
        this.angle = 0;
        this.powerSlider.value = 50;
        this.angleSlider.value = 0;
        this.powerValue.textContent = '50%';
        this.angleValue.textContent = '0°';

        // Reset bottle visual position
        this.updateBottlePosition();
        this.updateTrajectory();
        this.flipBtn.disabled = false;
    }

    updateTrajectory() {
        if (this.isFlipping) return;
        if (!this.containerWidth || !this.containerHeight) return;

        // Calculate trajectory
        const angleRad = (this.angle * Math.PI) / 180;
        const powerMultiplier = this.power / 50;
        const initialVelocity = -12 * powerMultiplier;
        
        const velocityX = Math.sin(angleRad) * Math.abs(initialVelocity) * 0.8;
        const velocityY = initialVelocity * Math.cos(angleRad);

        // Simulate trajectory - y is distance from bottom
        let x = this.startX;
        let y = this.startY; // Distance from bottom
        let vx = velocityX;
        let vy = velocityY;
        // Convert to screen coordinates (top-based)
        const points = [[x, this.containerHeight - y]];

        for (let i = 0; i < 200; i++) {
            vy += this.gravity;
            x += vx;
            y += vy; // y increases as bottle goes down
            vx *= 0.99; // Air resistance

            // Check bounds - y is distance from bottom, so y > containerHeight means below container
            if (y < 0 || x < 0 || x > this.containerWidth || y > this.containerHeight + 50) break;
            
            // Convert to screen coordinates for display
            points.push([x, this.containerHeight - y]);
        }

        // Draw trajectory using SVG
        if (!this.trajectory.querySelector('svg')) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('stroke', 'rgba(102, 126, 234, 0.6)');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-dasharray', '5, 5');
            path.setAttribute('fill', 'none');
            svg.appendChild(path);
            this.trajectory.appendChild(svg);
        }

        const path = this.trajectory.querySelector('path');
        if (points.length > 1) {
            const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
            path.setAttribute('d', pathData);
            this.trajectory.style.display = 'block';
        } else {
            this.trajectory.style.display = 'none';
        }

        // Update aim indicator
        if (points.length > 1) {
            const endX = points[points.length - 1]?.[0] || this.startX;
            const endY = points[points.length - 1]?.[1] || (this.containerHeight - this.startY);
            this.aimIndicator.style.left = `${endX - 5}px`;
            this.aimIndicator.style.top = `${endY - 5}px`;
            this.aimIndicator.style.display = 'block';
        } else {
            this.aimIndicator.style.display = 'none';
        }
    }

    flipBottle() {
        if (this.isFlipping) return;

        this.isFlipping = true;
        this.attempts++;
        this.attemptCount.textContent = this.attempts;
        this.flipBtn.disabled = true;
        this.trajectory.style.display = 'none';
        this.aimIndicator.style.display = 'none';

        // Calculate initial velocities based on power and angle
        const angleRad = (this.angle * Math.PI) / 180;
        const powerMultiplier = this.power / 50;
        const initialVelocity = -12 * powerMultiplier;
        
        this.velocityX = Math.sin(angleRad) * Math.abs(initialVelocity) * 0.8;
        this.velocityY = initialVelocity * Math.cos(angleRad);
        this.angularVelocity = 12 + Math.random() * 8; // Random rotation speed
        this.rotation = 0;

        // Reset position
        this.bottleX = this.startX;
        this.bottleY = this.startY;

        // Start animation loop
        this.animate();
    }

    animate() {
        // Update physics
        this.velocityY += this.gravity;
        this.bottleY += this.velocityY; // bottleY is distance from bottom, increases as it falls
        this.bottleX += this.velocityX;
        this.rotation += this.angularVelocity;

        // Apply air resistance
        this.angularVelocity *= 0.998;
        this.velocityX *= 0.99;

        // Check collision with platforms
        // bottleY is distance from bottom, so bottle top is at containerHeight - bottleY - 100
        // bottle bottom is at containerHeight - bottleY
        const bottleBottomY = this.containerHeight - this.bottleY; // Screen Y coordinate of bottle bottom
        const bottleCenterX = this.bottleX;

        let hasCollided = false;
        for (const platform of this.platforms) {
            const platformTop = platform.y; // Top Y coordinate
            const platformBottom = platform.y + platform.height; // Bottom Y coordinate
            const platformLeft = platform.x;
            const platformRight = platform.x + platform.width;

            // Check if bottle bottom is touching platform top
            // Bottle is landing if its bottom is at or just past the platform top
            if (!hasCollided &&
                bottleBottomY >= platformTop && 
                bottleBottomY <= platformBottom &&
                bottleCenterX >= platformLeft && 
                bottleCenterX <= platformRight &&
                this.velocityY > 0) { // Only check when falling down
                
                hasCollided = true;
                
                // Landed on platform - set bottle bottom to platform top
                this.bottleY = this.containerHeight - platformTop;
                this.velocityY = 0;
                this.velocityX = 0;
                
                // Check if upright (within 25 degrees of 0 or 360)
                const normalizedAngle = ((this.rotation % 360) + 360) % 360;
                const isUpright = normalizedAngle < 25 || normalizedAngle > 335;

                if (isUpright && platform.target) {
                    // Success! Only if landed on target platform
                    this.handleSuccess(platform);
                    return;
                } else if (isUpright && !platform.target) {
                    // Landed upright but not on target - bounce off
                    this.velocityY = -3;
                    this.velocityX = (Math.random() - 0.5) * 3;
                } else {
                    // Landed but not upright - bounce or fall
                    this.velocityY = -2;
                    this.velocityX = (Math.random() - 0.5) * 2;
                }
                break; // Only process first collision
            }
        }

        // Check if bottle went out of bounds
        // bottleY > containerHeight means below container, bottleY < 0 means above container
        if (this.bottleY > this.containerHeight + 50 || 
            this.bottleX < -100 || 
            this.bottleX > this.containerWidth + 100 ||
            this.bottleY < -100) {
            this.handleFailure('The bottle went out of bounds!');
            return;
        }

        // Update visual position
        this.updateBottlePosition();

        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updateBottlePosition() {
        const normalizedAngle = ((this.rotation % 360) + 360) % 360;
        this.bottle.style.left = `${this.bottleX}px`;
        // bottleY is distance from bottom, so bottom position is bottleY
        this.bottle.style.bottom = `${this.bottleY}px`;
        this.bottle.style.transform = `translateX(-50%) rotate(${normalizedAngle}deg)`;
    }

    handleSuccess(platform) {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        this.isFlipping = false;
        this.completedLevels.add(this.currentLevel);
        
        // Calculate score
        const score = Math.max(0, 1000 - (this.attempts * 50));
        this.bestScore = Math.max(this.bestScore, score);
        
        this.saveProgress();
        this.updateStats();

        // Show success message
        this.finalAttempts.textContent = this.attempts;
        this.finalScore.textContent = score;
        this.completeMessage.textContent = this.attempts === 1 
            ? 'Perfect! First try!' 
            : `Great job! You landed it in ${this.attempts} attempts!`;

        // Highlight successful platform
        if (platform && platform.element) {
            platform.element.classList.add('success');
        }

        setTimeout(() => {
            this.showScreen('completeScreen');
        }, 1000);
    }

    handleFailure(message) {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        this.isFlipping = false;
        
        // Show game over if too many attempts
        const level = bottleFlipLevels[this.currentLevel - 1];
        const maxAttempts = level.maxAttempts || 10;
        
        if (this.attempts >= maxAttempts) {
            setTimeout(() => {
                this.showScreen('gameOverScreen');
            }, 1500);
        } else {
            // Reset bottle position after a delay
            setTimeout(() => {
                this.setupLevel();
                if (this.trajectory) {
                    this.trajectory.style.display = 'block';
                }
                if (this.aimIndicator) {
                    this.aimIndicator.style.display = 'block';
                }
            }, 1500);
        }
    }

    retryLevel() {
        this.startLevel(this.currentLevel);
    }

    nextLevel() {
        this.showScreen('gameScreen');
        
        if (this.currentLevel < bottleFlipLevels.length) {
            setTimeout(() => {
                this.startLevel(this.currentLevel + 1);
            }, 100);
        } else {
            alert('Congratulations! You completed all levels!');
            this.showLevelSelect();
        }
    }

    showLevelSelect() {
        this.showScreen('levelSelectScreen');
        this.createLevelSelect();
        this.updateStats();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    updateStats() {
        this.completedCount.textContent = this.completedLevels.size;
        this.bestScoreEl.textContent = this.bestScore;
        this.currentLevelNum.textContent = this.currentLevel;
        
        // Calculate level progress
        const level = bottleFlipLevels[this.currentLevel - 1];
        if (level && level.maxAttempts) {
            const progress = Math.max(0, 100 - ((this.attempts / level.maxAttempts) * 100));
            this.levelProgress.textContent = Math.round(progress);
        }
    }
}

// Initialize game when page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new BottleFlipGame();
});
