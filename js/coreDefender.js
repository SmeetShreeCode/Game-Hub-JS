const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector('#scoreEl');
const highScoreEl = document.querySelector('#highScore');
const startGameBtn = document.querySelector('#startGame');
const startGameOverlay = document.querySelector('#startGameOverlay');
const endScoreEl = document.querySelector('#endScore');

let highScoreValue = localStorage.getItem('coreDefender_highScore') || 0;
highScoreEl.textContent = highScoreValue;

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.draw();
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.draw();
    }
}

const friction = 0.99;

class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
        this.draw();
    }
}

class PowerUp {
    constructor(x, y, type, color) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.type = type;
        this.color = color;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Game variables
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
let player = new Player(centerX, centerY, 15, 'white');

let projectiles = [];
let enemies = [];
let particles = [];
let powerUps = [];

let animationId;
let enemySpawnInterval;

let score = 0;
let lives = 3;
const maxLives = 5;
const healthBarWidth = 150;

let isPaused = false;
let gameMode = 'normal'; // 'normal' or 'hard'
let difficulty = 1;

let shootDelay = 300; // ms between shots
let lastShotTime = 0;

// Initialization/reset
function init() {
    player = new Player(centerX, centerY, 15, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    powerUps = [];
    score = 0;
    lives = 3;
    difficulty = gameMode === 'hard' ? 1.5 : 1;
    scoreEl.textContent = score;
    highScoreEl.textContent = highScoreValue;
}

// Spawn enemies with scaling difficulty
function spawnEnemies() {
    if (enemySpawnInterval) clearInterval(enemySpawnInterval);
    enemySpawnInterval = setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;
        let x, y;

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(centerY - y, centerX - x);
        const velocity = {
            x: Math.cos(angle) * difficulty,
            y: Math.sin(angle) * difficulty,
        };

        enemies.push(new Enemy(x, y, radius, color, velocity));
        difficulty += 0.01; // Increase difficulty gradually
    }, gameMode === 'hard' ? 1000 : 1500);
}

// Spawn power-ups every 15 seconds
setInterval(() => {
    const type = Math.random() < 0.5 ? 'health' : 'fireRate';
    const color = type === 'health' ? 'lime' : 'gold';
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    powerUps.push(new PowerUp(x, y, type, color));
}, 15000);

// Draw health bar
function drawHealthBar() {
    ctx.fillStyle = 'red';
    ctx.fillRect(20, 60, healthBarWidth, 15);
    ctx.fillStyle = 'green';
    ctx.fillRect(20, 60, (lives / maxLives) * healthBarWidth, 15);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 60, healthBarWidth, 15);
}

// Check and handle power-up collection
function checkPowerUps() {
    powerUps.forEach((p, index) => {
        const dist = Math.hypot(player.x - p.x, player.y - p.y);
        if (dist - p.radius - player.radius < 1) {
            if (p.type === 'health' && lives < maxLives) {
                lives++;
            } else if (p.type === 'fireRate') {
                shootDelay = 100;
                setTimeout(() => (shootDelay = 300), 5000);
            }
            powerUps.splice(index, 1);
        } else {
            p.draw();
        }
    });
}

// Game over logic
function gameOver() {
    cancelAnimationFrame(animationId);
    clearInterval(enemySpawnInterval);
    startGameOverlay.style.display = 'flex';
    endScoreEl.textContent = score;

    if (score > highScoreValue) {
        highScoreValue = score;
        localStorage.setItem('coreDefender_highScore', highScoreValue);
        highScoreEl.textContent = highScoreValue;
    }
}

// Animate loop
function animate() {
    if (isPaused) return;

    animationId = requestAnimationFrame(animate);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.draw();
    drawHealthBar();
    checkPowerUps();

    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();

        // Remove projectile if off-screen
        if (
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            projectiles.splice(index, 1);
        }
    });

    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        // Check collision with player
        const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (distToPlayer - enemy.radius - player.radius < 1) {
            gameOver();
            return;
        }

        // Check collision with projectiles
        projectiles.forEach((projectile, projectileIndex) => {
            const distToProjectile = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if (distToProjectile - enemy.radius - projectile.radius < 1) {
                // Create particles on enemy hit
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(
                        projectile.x,
                        projectile.y,
                        Math.random() * 2,
                        enemy.color,
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 4),
                            y: (Math.random() - 0.5) * (Math.random() * 4)
                        }
                    ));
                }

                if (enemy.radius - 10 > 5) {
                    score += 50;
                    scoreEl.textContent = score;
                    gsap.to(enemy, { radius: enemy.radius - 10 });
                    projectiles.splice(projectileIndex, 1);
                } else {
                    score += 100;
                    scoreEl.textContent = score;
                    enemies.splice(enemyIndex, 1);
                    projectiles.splice(projectileIndex, 1);
                }
            }
        });
    });
}

// Shoot projectile on click, respecting shootDelay
window.addEventListener('click', e => {
    const now = Date.now();
    if (now - lastShotTime < shootDelay) return; // throttle shooting

    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
    };

    projectiles.push(new Projectile(centerX, centerY, 5, 'white', velocity));
    lastShotTime = now;
});

// Pause/resume game on Escape key
window.addEventListener('keydown', e => {
    if (e.key === 'Escape') togglePause();
});

function togglePause() {
    if (!animationId) return;
    isPaused = !isPaused;
    if (isPaused) {
        cancelAnimationFrame(animationId);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '48px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    } else {
        animate();
    }
}

// Main menu with game mode selection
function showMainMenu() {
    startGameOverlay.style.display = 'flex';
    startGameOverlay.innerHTML = `
      <div class="bg-white rounded-lg p-6 text-center">
        <h1 class="text-3xl font-bold mb-2">Core Defender</h1>
        <p class="text-gray-500 mb-4">Select Mode</p>
        <button class="bg-blue-500 text-white w-full py-2 mb-2 rounded-lg" id="normalMode">Normal</button>
        <button class="bg-red-500 text-white w-full py-2 mb-2 rounded-lg" id="hardMode">Hard</button>
      </div>`;

    document.getElementById('normalMode').addEventListener('click', () => {
        gameMode = 'normal';
        difficulty = 1;
        startGameOverlay.style.display = 'none';
        startNewGame();
    });

    document.getElementById('hardMode').addEventListener('click', () => {
        gameMode = 'hard';
        difficulty = 1.5;
        startGameOverlay.style.display = 'none';
        startNewGame();
    });
}

// Start a new game
function startNewGame() {
    init();
    spawnEnemies();
    animate();
}

// Start button event for backward compatibility
if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
        startGameOverlay.style.display = 'none';
        startNewGame();
    });
}

// Show the main menu on page load
showMainMenu();
