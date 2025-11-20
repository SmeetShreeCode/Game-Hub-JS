// Hangman Game - Level by Level System
class HangmanGame {
    constructor() {
        this.currentLevel = 1;
        this.selectedLevel = 1;
        this.completedLevels = new Set();
        this.score = 0;
        this.lives = 6;
        this.maxLives = 6;
        this.paused = false;

        // Current game state
        this.currentWord = '';
        this.currentHint = '';
        this.currentCategory = '';
        this.guessedLetters = new Set();
        this.correctGuesses = new Set();
        this.incorrectGuesses = new Set();

        // DOM elements
        this.levelSelectScreen = document.getElementById('levelSelectScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.levelGrid = document.getElementById('levelGrid');
        this.wordDisplay = document.getElementById('wordDisplay');
        this.keyboard = document.getElementById('keyboard');
        this.hangmanSVG = document.getElementById('hangmanSVG');

        // Load completed levels from localStorage
        this.loadProgress();

        // Initialize
        this.setupUI();
        this.createLevelSelect();
        this.createKeyboard();
    }

    loadProgress() {
        const saved = localStorage.getItem('hangman_completed');
        if (saved) {
            this.completedLevels = new Set(JSON.parse(saved));
        }

        const savedScore = localStorage.getItem('hangman_score');
        if (savedScore) {
            this.score = parseInt(savedScore) || 0;
        }
    }

    saveProgress() {
        localStorage.setItem('hangman_completed', JSON.stringify([...this.completedLevels]));
        localStorage.setItem('hangman_score', this.score.toString());
    }

    createLevelSelect() {
        this.levelGrid.innerHTML = '';

        hangmanLevels.forEach((level, index) => {
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
        if (levelNum < 1 || levelNum > hangmanLevels.length) return;

        this.selectedLevel = levelNum;
        this.currentLevel = levelNum;
        const level = hangmanLevels[levelNum - 1];

        if (!level) return;

        // Reset game state
        this.currentWord = level.word.toUpperCase();
        this.currentHint = level.hint;
        this.currentCategory = level.category || '';
        this.guessedLetters.clear();
        this.correctGuesses.clear();
        this.incorrectGuesses.clear();
        this.lives = this.maxLives;
        this.paused = false;

        // Show game screen
        this.levelSelectScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');

        // Reset hangman drawing
        this.resetHangman();

        // Update UI
        this.updateDisplay();
        this.renderWord();
        this.updateKeyboard();

        // Update hint
        document.getElementById('hintText').textContent = this.currentHint;
    }

    resetHangman() {
        //const parts = ['base', 'post', 'beam', 'rope', 'head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
        const parts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
        parts.forEach(part => {
            const element = document.getElementById(part);
            if (element) {
                element.style.opacity = '0';
            }
        });
    }

    updateHangman() {
        const wrongCount = this.incorrectGuesses.size;
        const parts = [
            // { id: 'base', index: 0 },
            // { id: 'post', index: 1 },
            // { id: 'beam', index: 2 },
            // { id: 'rope', index: 3 },
            // { id: 'head', index: 4 },
            // { id: 'body', index: 5 },
            // { id: 'leftArm', index: 6 },
            // { id: 'rightArm', index: 7 },
            // { id: 'leftLeg', index: 8 },
            // { id: 'rightLeg', index: 9 },
            {id: 'head', index: 0},
            {id: 'body', index: 1},
            {id: 'leftArm', index: 2},
            {id: 'rightArm', index: 3},
            {id: 'leftLeg', index: 4},
            {id: 'rightLeg', index: 5}
        ];

        // Show parts based on wrong guesses
        for (let i = 0; i < Math.min(wrongCount, parts.length); i++) {
            const element = document.getElementById(parts[i].id);
            if (element) {
                element.style.opacity = '1';
            }
        }
    }

    renderWord() {
        this.wordDisplay.innerHTML = '';

        for (let i = 0; i < this.currentWord.length; i++) {
            const letter = this.currentWord[i];
            const box = document.createElement('div');
            box.className = 'letter-box';

            if (letter === ' ') {
                box.classList.add('space');
            } else if (this.correctGuesses.has(letter)) {
                box.textContent = letter;
                box.classList.add('revealed');
            } else {
                box.textContent = '';
            }

            this.wordDisplay.appendChild(box);
        }
    }

    createKeyboard() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        this.keyboard.innerHTML = '';

        letters.forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'key-btn';
            btn.textContent = letter;
            btn.dataset.letter = letter;
            btn.addEventListener('click', () => this.guessLetter(letter));
            this.keyboard.appendChild(btn);
        });
    }

    updateKeyboard() {
        const buttons = this.keyboard.querySelectorAll('.key-btn');
        buttons.forEach(btn => {
            const letter = btn.dataset.letter;
            btn.disabled = this.guessedLetters.has(letter);
            btn.classList.remove('correct', 'incorrect');

            if (this.correctGuesses.has(letter)) {
                btn.classList.add('correct');
            } else if (this.incorrectGuesses.has(letter)) {
                btn.classList.add('incorrect');
            }
        });
    }

    guessLetter(letter) {
        if (this.paused || this.guessedLetters.has(letter)) return;

        this.guessedLetters.add(letter);

        if (this.currentWord.includes(letter)) {
            this.correctGuesses.add(letter);
            this.updateScore(10);
        } else {
            this.incorrectGuesses.add(letter);
            this.lives--;
            this.updateHangman();
        }

        this.renderWord();
        this.updateKeyboard();
        this.updateDisplay();
        this.checkGameState();
    }

    checkGameState() {
        // Check if word is complete
        const wordLetters = new Set(this.currentWord.replace(/\s/g, '').split(''));
        const allGuessed = [...wordLetters].every(letter => this.correctGuesses.has(letter));

        if (allGuessed) {
            this.winLevel();
        } else if (this.lives <= 0) {
            this.loseLevel();
        }
    }

    winLevel() {
        this.completedLevels.add(this.currentLevel);
        this.updateScore(100);
        this.saveProgress();

        const winOverlay = document.getElementById('winOverlay');
        const winMessage = document.getElementById('winMessage');
        winMessage.textContent = `You guessed "${this.currentWord}"!`;
        winOverlay.classList.remove('hidden');
    }

    loseLevel() {
        const loseOverlay = document.getElementById('loseOverlay');
        const correctWord = document.getElementById('correctWord');
        correctWord.textContent = this.currentWord;
        loseOverlay.classList.remove('hidden');
    }

    updateScore(points) {
        this.score += points;
        document.getElementById('score').textContent = this.score;
    }

    updateDisplay() {
        document.getElementById('currentLevel').textContent = this.currentLevel;
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }

    nextLevel() {
        const winOverlay = document.getElementById('winOverlay');
        winOverlay.classList.add('hidden');

        if (this.currentLevel < hangmanLevels.length) {
            this.startLevel(this.currentLevel + 1);
        } else {
            // All levels completed
            alert('Congratulations! You completed all levels!');
            this.showLevelSelect();
        }
    }

    replayLevel() {
        document.getElementById('winOverlay').classList.add('hidden');
        document.getElementById('loseOverlay').classList.add('hidden');
        this.startLevel(this.currentLevel);
    }

    showLevelSelect() {
        document.getElementById('winOverlay').classList.add('hidden');
        document.getElementById('loseOverlay').classList.add('hidden');
        document.getElementById('pauseOverlay').classList.add('hidden');

        this.gameScreen.classList.add('hidden');
        this.levelSelectScreen.classList.remove('hidden');
        this.paused = false;
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

    giveHint() {
        if (this.currentHint) {
            alert(`Hint: ${this.currentHint}`);
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

        document.getElementById('replayBtn2').addEventListener('click', () => {
            this.replayLevel();
        });

        document.getElementById('levelSelectBtn2').addEventListener('click', () => {
            this.showLevelSelect();
        });

        document.getElementById('levelSelectBtn3').addEventListener('click', () => {
            this.showLevelSelect();
        });

        document.getElementById('levelSelectBtn4').addEventListener('click', () => {
            this.showLevelSelect();
        });

        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.togglePause();
        });

        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (this.paused || this.gameScreen.classList.contains('hidden')) return;

            const key = e.key.toUpperCase();
            if (/[A-Z]/.test(key)) {
                this.guessLetter(key);
            } else if (key === 'ESCAPE') {
                this.togglePause();
            }
        });
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new HangmanGame();
});

