const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

let parsedCollisions;
let collisionBlocks;
let platformCollisions;
let background;
let doors;
gameState = 'playing'; // 'paused', 'gameOver', 'menu', 'setting'

const player = new Player({
    imageSrc: './images/king-and-pigs/img/king/idle.png',
    frameRate: 11,
    animations: {
        idleRight: {
            imageSrc: './images/king-and-pigs/img/king/idle.png',
            frameRate: 11,
            frameBuffer: 2,
            loop: true,
        },
        idleLeft: {
            imageSrc: './images/king-and-pigs/img/king/idleLeft.png',
            frameRate: 11,
            frameBuffer: 2,
            loop: true,
        },
        runRight: {
            imageSrc: './images/king-and-pigs/img/king/runRight.png',
            frameRate: 8,
            frameBuffer: 4,
            loop: true,
        },
        runLeft: {
            imageSrc: './images/king-and-pigs/img/king/runLeft.png',
            frameRate: 8,
            frameBuffer: 4,
            loop: true,
        },
        attackRight: {
            imageSrc: './images/king-and-pigs/img/king/attackRight.png',
            frameRate: 3,
            frameBuffer: 4,
            loop: true,
        },
        attackLeft: {
            imageSrc: './images/king-and-pigs/img/king/attackLeft.png',
            frameRate: 3,
            frameBuffer: 4,
            loop: true,
        },
        enterDoor: {
            imageSrc: './images/king-and-pigs/img/king/enterDoor.png',
            frameRate: 8,
            frameBuffer: 4,
            loop: false,
            onComplete: () => {
                console.log("Level completed!");
                
                // Mark current level as completed
                if (typeof markLevelCompleted === 'function') {
                    markLevelCompleted(selectedLevel);
                }
                
                gsap.to(overlay, {
                    opacity: 1,
                    duration: 0.5,
                    onComplete: () => {
                        // Reset overlay immediately before going back
                        overlay.opacity = 0;
                        // Go back to level selection instead of auto-playing next level
                        if (typeof goBackToLevelSelection === 'function') {
                            goBackToLevelSelection();
                            if (typeof initializeLevelGrid === 'function') {
                                initializeLevelGrid();
                            }
                        }
                    },
                });
            },
        },
    },
});

const enemies = new Enemy({
    imageSrc: './images/king-and-pigs/Sprites/Pig/idleLeft.png',
    frameRate: 11,
    isPatrol: true,
});

const keys = {
    jump: {
        pressed: false,
    },
    moveRight: {
        pressed: false,
    },
    moveLeft: {
        pressed: false,
    },
    moveDown: {
        pressed: false,
    },
    attack: {
        pressed: false,
    },
    enterDoor: {
        pressed: false,
    },
};

const overlay = {
    opacity: 0,
};

function checkPlayerEnemyCollision() {
    const p = player.hitbox;
    const e = enemies.hitbox;

    if (p.position.x < e.position.x + e.width && p.position.x + p.width > e.position.x &&
        p.position.y < e.position.y + e.height && p.position.y + p.height > e.position.y) {

        if (keys.attack.pressed) {
            enemies.switchSprite(enemies.direction === 'left' ? 'deadLeft' : 'deadRight');
            enemies.velocity.x = 0;
        } else {
            console.log('Player takes damage!');
        }
    }
}

function animate() {
    window.requestAnimationFrame(animate);
    if (gameState !== 'playing' || !gameStarted) {
        // Clear canvas when not playing to prevent black screen
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }

    background.draw();
    // collisionBlocks.forEach(collisionBlock => {
    //     collisionBlock.draw();
    // });
    // platformCollisions.forEach(platformCollision => {
    //     platformCollision.draw();
    // });
    doors.forEach(door => {
        door.draw();
    });

    player.handleInput(keys);
    player.draw();
    player.update();
    enemies.draw()
    enemies.update()

    // Only draw overlay if opacity is greater than 0
    if (overlay.opacity > 0) {
        ctx.save();
        ctx.globalAlpha = overlay.opacity;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
    checkPlayerEnemyCollision();
}

// Start game function - called when level is selected
function startGame() {
    // Kill any running GSAP animations on overlay
    if (typeof gsap !== 'undefined') {
        gsap.killTweensOf(overlay);
    }
    
    // Reset overlay opacity to prevent black screen
    overlay.opacity = 0;
    
    // Reset player state
    if (player) {
        player.preventInput = false;
    }
    
    levels[level].init();
    animate();
}

// Don't start automatically - wait for level selection
// startGame() will be called when a level is selected

function checkPlayerAndDoor() {
    for (let i = 0; i < doors.length; i++) {
        const door = doors[i];
        if (player.hitbox.position.x < door.position.x + door.width &&
            player.hitbox.position.x + player.hitbox.width > door.position.x &&
            player.hitbox.position.y < door.position.y + door.height &&
            player.hitbox.position.y + player.hitbox.height > door.position.y) {
            player.velocity.x = 0;
            player.velocity.y = 0;
            player.position.x = door.position.x - door.width / 2;
            player.preventInput = true;
            player.switchSprite('enterDoor');
            door.play();
            return;
        }
    }

    console.log(collisionBlocks)
    console.log(platformCollisions)
}

window.addEventListener('keydown', (e) => {
    if (player.preventInput) return;
    switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
            if (player.velocity.y === 0) player.velocity.y = -18;
            break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
            keys.moveLeft.pressed = true;
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            keys.moveRight.pressed = true;
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            console.log("down.pressed");
            keys.moveDown.pressed = true;
            break;
        case 'x':
        case 'X':
            checkPlayerAndDoor();
            keys.enterDoor.pressed = true;
            break;
        case ' ':
            keys.attack.pressed = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'a':
        case 'A':
        case 'ArrowLeft':
            keys.moveLeft.pressed = false;
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            keys.moveRight.pressed = false;
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            console.log("down.moved");
            keys.moveDown.pressed = false;
            break;
        case 'x':
        case 'X':
            keys.enterDoor.pressed = false;
            break;
        case ' ':
            keys.attack.pressed = false;
            break;
    }
});

// Mobile Detection and Setup
const isMobile = /Mobi|Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
const orientationWarning = document.getElementById('orientationWarning');
const gameContainer = document.querySelector('.game-container');
const mobileControls = document.getElementById('mobile-controls');

// Handle orientation changes
function handleOrientationChange() {
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    
    if (isMobile && isPortrait) {
        if (orientationWarning) orientationWarning.style.display = 'flex';
        if (gameContainer) gameContainer.style.display = 'none';
    } else {
        if (orientationWarning) orientationWarning.style.display = 'none';
        if (gameContainer) gameContainer.style.display = 'flex';
    }
}

// Call on load and on orientation change
handleOrientationChange();
window.addEventListener('orientationchange', handleOrientationChange);
window.addEventListener('resize', handleOrientationChange);

// Hide mobile controls on desktop
if (!isMobile) {
    if (mobileControls) mobileControls.style.display = 'none';
}

// Get mobile control buttons
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const jumpBtn = document.getElementById('jump-btn');
const attackBtn = document.getElementById('attack-btn');

// Prevent default touch behaviors
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// Prevent pinch zoom
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('wheel', (e) => {
    e.preventDefault();
}, { passive: false });

// Helper function to safely set key state
function setKeyState(keyObj, state) {
    if (player && !player.preventInput) {
        keyObj.pressed = state;
    }
}

// Track which buttons are currently pressed
const pressedButtons = new Set();

// LEFT Button
if (leftBtn) {
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        leftBtn.classList.add('active');
        pressedButtons.add('left');
        setKeyState(keys.moveLeft, true);
    });

    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        leftBtn.classList.remove('active');
        pressedButtons.delete('left');
        setKeyState(keys.moveLeft, false);
    });

    leftBtn.addEventListener('touchcancel', (e) => {
        leftBtn.classList.remove('active');
        pressedButtons.delete('left');
        setKeyState(keys.moveLeft, false);
    });

    leftBtn.addEventListener('mousedown', () => {
        leftBtn.classList.add('active');
        pressedButtons.add('left');
        setKeyState(keys.moveLeft, true);
    });

    leftBtn.addEventListener('mouseup', () => {
        leftBtn.classList.remove('active');
        pressedButtons.delete('left');
        setKeyState(keys.moveLeft, false);
    });

    leftBtn.addEventListener('mouseleave', () => {
        leftBtn.classList.remove('active');
        pressedButtons.delete('left');
        setKeyState(keys.moveLeft, false);
    });
}

// RIGHT Button
if (rightBtn) {
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        rightBtn.classList.add('active');
        pressedButtons.add('right');
        setKeyState(keys.moveRight, true);
    });

    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        rightBtn.classList.remove('active');
        pressedButtons.delete('right');
        setKeyState(keys.moveRight, false);
    });

    rightBtn.addEventListener('touchcancel', (e) => {
        rightBtn.classList.remove('active');
        pressedButtons.delete('right');
        setKeyState(keys.moveRight, false);
    });

    rightBtn.addEventListener('mousedown', () => {
        rightBtn.classList.add('active');
        pressedButtons.add('right');
        setKeyState(keys.moveRight, true);
    });

    rightBtn.addEventListener('mouseup', () => {
        rightBtn.classList.remove('active');
        pressedButtons.delete('right');
        setKeyState(keys.moveRight, false);
    });

    rightBtn.addEventListener('mouseleave', () => {
        rightBtn.classList.remove('active');
        pressedButtons.delete('right');
        setKeyState(keys.moveRight, false);
    });
}

// JUMP Button
if (jumpBtn) {
    jumpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        jumpBtn.classList.add('active');
        pressedButtons.add('jump');
        if (player && player.velocity.y === 0 && !player.preventInput) {
            player.velocity.y = -18;
        }
    });

    jumpBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        jumpBtn.classList.remove('active');
        pressedButtons.delete('jump');
    });

    jumpBtn.addEventListener('touchcancel', (e) => {
        jumpBtn.classList.remove('active');
        pressedButtons.delete('jump');
    });

    jumpBtn.addEventListener('mousedown', () => {
        jumpBtn.classList.add('active');
        pressedButtons.add('jump');
        if (player && player.velocity.y === 0 && !player.preventInput) {
            player.velocity.y = -18;
        }
    });

    jumpBtn.addEventListener('mouseup', () => {
        jumpBtn.classList.remove('active');
        pressedButtons.delete('jump');
    });

    jumpBtn.addEventListener('mouseleave', () => {
        jumpBtn.classList.remove('active');
        pressedButtons.delete('jump');
    });
}

// ATTACK Button
if (attackBtn) {
    attackBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        attackBtn.classList.add('active');
        pressedButtons.add('attack');
        setKeyState(keys.attack, true);
    });

    attackBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        attackBtn.classList.remove('active');
        pressedButtons.delete('attack');
        setKeyState(keys.attack, false);
    });

    attackBtn.addEventListener('touchcancel', (e) => {
        attackBtn.classList.remove('active');
        pressedButtons.delete('attack');
        setKeyState(keys.attack, false);
    });

    attackBtn.addEventListener('mousedown', () => {
        attackBtn.classList.add('active');
        pressedButtons.add('attack');
        setKeyState(keys.attack, true);
    });

    attackBtn.addEventListener('mouseup', () => {
        attackBtn.classList.remove('active');
        pressedButtons.delete('attack');
        setKeyState(keys.attack, false);
    });

    attackBtn.addEventListener('mouseleave', () => {
        attackBtn.classList.remove('active');
        pressedButtons.delete('attack');
        setKeyState(keys.attack, false);
    });
}

// MENU Button
const menuBtn = document.getElementById('menu-btn');
if (menuBtn) {
    menuBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        menuBtn.classList.add('active');
        if (gameStarted && typeof goBackToLevelSelection === 'function') {
            goBackToLevelSelection();
            if (typeof initializeLevelGrid === 'function') {
                initializeLevelGrid();
            }
        }
    });

    menuBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        menuBtn.classList.remove('active');
    });

    menuBtn.addEventListener('touchcancel', (e) => {
        menuBtn.classList.remove('active');
    });

    menuBtn.addEventListener('mousedown', () => {
        menuBtn.classList.add('active');
        if (gameStarted && typeof goBackToLevelSelection === 'function') {
            goBackToLevelSelection();
            if (typeof initializeLevelGrid === 'function') {
                initializeLevelGrid();
            }
        }
    });

    menuBtn.addEventListener('mouseup', () => {
        menuBtn.classList.remove('active');
    });

    menuBtn.addEventListener('mouseleave', () => {
        menuBtn.classList.remove('active');
    });
}
