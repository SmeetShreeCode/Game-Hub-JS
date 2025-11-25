// Crossword Game - Level by Level System with Auto-Layout
class CrosswordGame {
    constructor() {
        this.currentLevel = 1;
        this.selectedLevel = 1;
        this.completedLevels = new Set();
        this.score = 0;
        this.hintsUsed = 0;

        // Current game state
        this.grid = [];
        this.gridSize = { rows: 0, cols: 0 };
        this.words = [];
        this.cellData = {};
        this.activeWord = null;
        this.activeDirection = 'across';
        this.filledCells = new Set();
        this.correctCells = new Set();
        this.placedWords = []; // Store placed words with positions

        // DOM elements
        this.levelSelectScreen = document.getElementById('levelSelectScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.completeScreen = document.getElementById('completeScreen');
        this.levelGrid = document.getElementById('levelGrid');
        this.crosswordGrid = document.getElementById('crosswordGrid');
        this.acrossClues = document.getElementById('acrossClues');
        this.downClues = document.getElementById('downClues');
        this.currentLevelNum = document.getElementById('currentLevelNum');
        this.progressPercent = document.getElementById('progressPercent');
        this.completedCount = document.getElementById('completedCount');
        this.totalScore = document.getElementById('totalScore');

        // Load progress
        this.loadProgress();

        // Initialize
        this.setupEventListeners();
        this.createLevelSelect();
        this.updateStats();
    }

    loadProgress() {
        const saved = localStorage.getItem('crossword_completed');
        if (saved) {
            this.completedLevels = new Set(JSON.parse(saved));
        }

        const savedScore = localStorage.getItem('crossword_score');
        if (savedScore) {
            this.score = parseInt(savedScore) || 0;
        }
    }

    saveProgress() {
        localStorage.setItem('crossword_completed', JSON.stringify([...this.completedLevels]));
        localStorage.setItem('crossword_score', this.score.toString());
    }

    setupEventListeners() {
        document.getElementById('backBtn').addEventListener('click', () => this.showLevelSelect());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        document.getElementById('levelSelectBtn').addEventListener('click', () => this.showLevelSelect());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('checkBtn').addEventListener('click', () => this.checkAnswers());
        
        // Close overlay when clicking outside modal
        this.completeScreen.addEventListener('click', (e) => {
            if (e.target === this.completeScreen) {
                this.showLevelSelect();
            }
        });
    }

    createLevelSelect() {
        this.levelGrid.innerHTML = '';
        const totalLevels = crosswordLevels.length;

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
        this.hintsUsed = 0;
        this.filledCells.clear();
        this.correctCells.clear();
        this.activeWord = null;
        this.placedWords = [];

        const level = crosswordLevels[levelNum - 1];
        if (!level) return;

        // Auto-generate grid layout
        this.autoLayoutGrid(level);
        this.renderGrid();
        this.renderClues(level);
        this.updateStats();

        this.showScreen('gameScreen');
    }

    // Auto-layout algorithm to place words on grid
    autoLayoutGrid(level) {
        this.cellData = {};
        this.placedWords = [];
        
        const allWords = [];
        
        // Process across words
        level.across.forEach((item, index) => {
            allWords.push({
                word: item.word.toUpperCase(),
                clue: item.clue,
                direction: 'across',
                originalIndex: index
            });
        });

        // Process down words
        level.down.forEach((item, index) => {
            allWords.push({
                word: item.word.toUpperCase(),
                clue: item.clue,
                direction: 'down',
                originalIndex: index
            });
        });

        // Start with first word in center
        if (allWords.length === 0) return;

        const firstWord = allWords[0];
        const centerRow = 10;
        const centerCol = 10;
        
        this.placeWord(firstWord, centerRow, centerCol, 1);
        allWords.shift();

        let currentNumber = 2;

        // Place remaining words by finding intersections
        while (allWords.length > 0) {
            let placed = false;
            
            for (let i = 0; i < allWords.length; i++) {
                const word = allWords[i];
                const intersection = this.findIntersection(word, this.placedWords);
                
                if (intersection) {
                    this.placeWord(word, intersection.row, intersection.col, intersection.number || currentNumber);
                    allWords.splice(i, 1);
                    currentNumber++;
                    placed = true;
                    break;
                }
            }

            // If no intersection found, place word separately
            if (!placed && allWords.length > 0) {
                const word = allWords[0];
                const offset = this.placedWords.length * 3;
                
                if (word.direction === 'across') {
                    this.placeWord(word, centerRow + offset, centerCol, currentNumber);
                } else {
                    this.placeWord(word, centerRow, centerCol + offset, currentNumber);
                }
                
                allWords.shift();
                currentNumber++;
            }
        }

        // Calculate grid dimensions
        let minRow = Infinity, maxRow = -Infinity;
        let minCol = Infinity, maxCol = -Infinity;

        this.placedWords.forEach(pw => {
            if (pw.direction === 'across') {
                minRow = Math.min(minRow, pw.row);
                maxRow = Math.max(maxRow, pw.row);
                minCol = Math.min(minCol, pw.col);
                maxCol = Math.max(maxCol, pw.col + pw.word.length - 1);
            } else {
                minRow = Math.min(minRow, pw.row);
                maxRow = Math.max(maxRow, pw.row + pw.word.length - 1);
                minCol = Math.min(minCol, pw.col);
                maxCol = Math.max(maxCol, pw.col);
            }
        });

        // Normalize to start from 0
        const rowOffset = -minRow;
        const colOffset = -minCol;

        this.placedWords.forEach(pw => {
            pw.row += rowOffset;
            pw.col += colOffset;
        });

        // Rebuild grid with normalized positions
        this.gridSize = { rows: maxRow - minRow + 1, cols: maxCol - minCol + 1 };
        this.grid = Array(this.gridSize.rows).fill(null).map(() => 
            Array(this.gridSize.cols).fill(null)
        );

        this.cellData = {};
        this.placedWords.forEach(pw => {
            for (let i = 0; i < pw.word.length; i++) {
                const row = pw.direction === 'across' ? pw.row : pw.row + i;
                const col = pw.direction === 'across' ? pw.col + i : pw.col;
                const key = `${row}_${col}`;

                if (!this.grid[row][col]) {
                    this.grid[row][col] = {
                        letter: '',
                        number: null,
                        words: []
                    };
                }

                this.grid[row][col].letter = pw.word[i];
                this.grid[row][col].words.push({
                    word: pw.word,
                    direction: pw.direction,
                    number: pw.number,
                    index: i
                });

                if (i === 0) {
                    this.grid[row][col].number = pw.number;
                }

                if (!this.cellData[key]) {
                    this.cellData[key] = [];
                }
                this.cellData[key].push({
                    word: pw.word,
                    direction: pw.direction,
                    number: pw.number,
                    index: i,
                    row: row,
                    col: col
                });
            }
        });
    }

    placeWord(word, row, col, number) {
        this.placedWords.push({
            word: word.word,
            clue: word.clue,
            direction: word.direction,
            row: row,
            col: col,
            number: number,
            originalIndex: word.originalIndex
        });
    }

    findIntersection(word, placedWords) {
        for (const placed of placedWords) {
            // Try to find a common letter
            for (let i = 0; i < word.word.length; i++) {
                for (let j = 0; j < placed.word.length; j++) {
                    if (word.word[i] === placed.word[j]) {
                        // Check if directions are different
                        if (word.direction !== placed.direction) {
                            let row, col;
                            
                            if (word.direction === 'across') {
                                row = placed.direction === 'across' ? placed.row : placed.row + j;
                                col = placed.direction === 'across' ? placed.col + j : placed.col;
                                
                                // Adjust for word position
                                row = row;
                                col = col - i;
                            } else {
                                row = placed.direction === 'across' ? placed.row : placed.row + j;
                                col = placed.direction === 'across' ? placed.col + j : placed.col;
                                
                                // Adjust for word position
                                row = row - i;
                                col = col;
                            }

                            // Check if placement is valid (no conflicts)
                            if (this.canPlaceWord(word.word, row, col, word.direction, placed)) {
                                return { row, col, number: null };
                            }
                        }
                    }
                }
            }
        }
        return null;
    }

    canPlaceWord(word, row, col, direction, excludeWord) {
        for (let i = 0; i < word.length; i++) {
            const checkRow = direction === 'across' ? row : row + i;
            const checkCol = direction === 'across' ? col + i : col;

            // Check against all placed words except the one we're intersecting with
            for (const placed of this.placedWords) {
                if (placed === excludeWord) continue;

                if (placed.direction === direction) {
                    // Same direction - must not overlap
                    if (direction === 'across' && placed.row === checkRow) {
                        if (checkCol >= placed.col && checkCol < placed.col + placed.word.length) {
                            return false;
                        }
                    } else if (direction === 'down' && placed.col === checkCol) {
                        if (checkRow >= placed.row && checkRow < placed.row + placed.word.length) {
                            return false;
                        }
                    }
                } else {
                    // Different direction - can intersect if same letter
                    const intersectRow = placed.direction === 'across' ? placed.row : placed.row + (checkCol - placed.col);
                    const intersectCol = placed.direction === 'across' ? placed.col + (checkRow - placed.row) : placed.col;

                    if (intersectRow === checkRow && intersectCol === checkCol) {
                        const placedIndex = placed.direction === 'across' ? checkCol - placed.col : checkRow - placed.row;
                        if (placedIndex >= 0 && placedIndex < placed.word.length) {
                            if (word[i] !== placed.word[placedIndex]) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return true;
    }

    renderGrid() {
        this.crosswordGrid.innerHTML = '';
        this.crosswordGrid.style.gridTemplateColumns = `repeat(${this.gridSize.cols}, 1fr)`;

        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                const cell = document.createElement('div');
                const cellData = this.grid[row][col];

                if (!cellData) {
                    cell.className = 'cell blocked';
                } else {
                    cell.className = 'cell';
                    const key = `${row}_${col}`;
                    const isFilled = this.filledCells.has(key);
                    const isCorrect = this.correctCells.has(key);

                    if (isCorrect) {
                        cell.classList.add('correct');
                    } else if (isFilled) {
                        cell.classList.add('filled');
                    }

                    if (cellData.number) {
                        const numberSpan = document.createElement('span');
                        numberSpan.className = 'cell-number';
                        numberSpan.textContent = cellData.number;
                        cell.appendChild(numberSpan);
                    }

                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.value = isFilled ? cellData.letter : '';
                    input.dataset.row = row;
                    input.dataset.col = col;

                    input.addEventListener('focus', () => this.onCellFocus(row, col));
                    input.addEventListener('input', (e) => this.onCellInput(e, row, col));
                    input.addEventListener('keydown', (e) => this.onCellKeyDown(e, row, col));

                    cell.appendChild(input);
                }

                this.crosswordGrid.appendChild(cell);
            }
        }
    }

    onCellFocus(row, col) {
        const key = `${row}_${col}`;
        const data = this.cellData[key];
        if (!data || data.length === 0) return;

        document.querySelectorAll('.cell').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.clue-item').forEach(c => c.classList.remove('active'));

        const wordData = data.find(d => d.direction === this.activeDirection) || data[0];
        
        // Find the full word info from placedWords
        const fullWord = this.placedWords.find(pw => 
            pw.word === wordData.word && 
            pw.direction === wordData.direction &&
            pw.number === wordData.number
        );

        if (fullWord) {
            this.activeWord = {
                word: fullWord.word,
                direction: fullWord.direction,
                number: fullWord.number,
                row: fullWord.row,
                col: fullWord.col
            };
            this.activeDirection = fullWord.direction;
        } else {
            this.activeWord = {
                word: wordData.word,
                direction: wordData.direction,
                number: wordData.number,
                row: wordData.row,
                col: wordData.col
            };
            this.activeDirection = wordData.direction;
        }

        this.highlightWord(this.activeWord);

        const clueSelector = `.clue-item[data-direction="${this.activeWord.direction}"][data-number="${this.activeWord.number}"]`;
        const clueElement = document.querySelector(clueSelector);
        if (clueElement) {
            clueElement.classList.add('active');
        }
    }

    highlightWord(wordData) {
        const word = wordData.word;
        const startRow = wordData.row;
        const startCol = wordData.col;

        for (let i = 0; i < word.length; i++) {
            const row = wordData.direction === 'across' ? startRow : startRow + i;
            const col = wordData.direction === 'across' ? startCol + i : startCol;
            const cell = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`)?.parentElement;
            if (cell) {
                cell.classList.add('active');
            }
        }
    }

    onCellInput(e, row, col) {
        const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
        e.target.value = value;

        if (value) {
            const key = `${row}_${col}`;
            this.filledCells.add(key);
            this.moveToNextCell(row, col);
        } else {
            const key = `${row}_${col}`;
            this.filledCells.delete(key);
        }

        this.updateProgress();
    }

    onCellKeyDown(e, row, col) {
        if (e.key === 'Backspace' && !e.target.value) {
            this.moveToPreviousCell(row, col);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
                   e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            this.moveInDirection(e.key, row, col);
        }
    }

    moveToNextCell(row, col) {
        if (!this.activeWord) return;

        const wordData = this.activeWord;
        const word = wordData.word;
        const startRow = wordData.row;
        const startCol = wordData.col;

        let currentIndex = -1;
        if (wordData.direction === 'across') {
            currentIndex = col - startCol;
        } else {
            currentIndex = row - startRow;
        }

        if (currentIndex < word.length - 1) {
            const nextIndex = currentIndex + 1;
            const nextRow = wordData.direction === 'across' ? startRow : startRow + nextIndex;
            const nextCol = wordData.direction === 'across' ? startCol + nextIndex : startCol;
            const nextInput = document.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    }

    moveToPreviousCell(row, col) {
        if (!this.activeWord) return;

        const wordData = this.activeWord;
        const startRow = wordData.row;
        const startCol = wordData.col;

        let currentIndex = -1;
        if (wordData.direction === 'across') {
            currentIndex = col - startCol;
        } else {
            currentIndex = row - startRow;
        }

        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            const prevRow = wordData.direction === 'across' ? startRow : startRow + prevIndex;
            const prevCol = wordData.direction === 'across' ? startCol + prevIndex : startCol;
            const prevInput = document.querySelector(`input[data-row="${prevRow}"][data-col="${prevCol}"]`);
            if (prevInput) {
                prevInput.focus();
            }
        }
    }

    moveInDirection(key, row, col) {
        const data = this.cellData[`${row}_${col}`];
        if (!data) return;

        let newRow = row, newCol = col;

        if (key === 'ArrowRight' && this.activeDirection === 'across') {
            newCol = col + 1;
        } else if (key === 'ArrowLeft' && this.activeDirection === 'across') {
            newCol = col - 1;
        } else if (key === 'ArrowDown' && this.activeDirection === 'down') {
            newRow = row + 1;
        } else if (key === 'ArrowUp' && this.activeDirection === 'down') {
            newRow = row - 1;
        } else {
            const otherDirection = this.activeDirection === 'across' ? 'down' : 'across';
            const otherWord = data.find(d => d.direction === otherDirection);
            if (otherWord) {
                const fullWord = this.placedWords.find(pw => 
                    pw.word === otherWord.word && 
                    pw.direction === otherWord.direction
                );
                if (fullWord) {
                    this.activeDirection = otherDirection;
                    this.activeWord = {
                        word: fullWord.word,
                        direction: fullWord.direction,
                        number: fullWord.number,
                        row: fullWord.row,
                        col: fullWord.col
                    };
                    this.highlightWord(this.activeWord);
                }
                return;
            }
        }

        const newInput = document.querySelector(`input[data-row="${newRow}"][data-col="${newCol}"]`);
        if (newInput) {
            newInput.focus();
        }
    }

    renderClues(level) {
        this.acrossClues.innerHTML = '';
        this.downClues.innerHTML = '';

        // Sort placed words by number
        const acrossWords = this.placedWords
            .filter(pw => pw.direction === 'across')
            .sort((a, b) => a.number - b.number);
        
        const downWords = this.placedWords
            .filter(pw => pw.direction === 'down')
            .sort((a, b) => a.number - b.number);

        acrossWords.forEach(pw => {
            const clueItem = document.createElement('div');
            clueItem.className = 'clue-item';
            clueItem.dataset.direction = 'across';
            clueItem.dataset.number = pw.number;
            clueItem.innerHTML = `<span class="clue-number">${pw.number}.</span>${pw.clue}`;
            clueItem.addEventListener('click', () => this.selectClue('across', pw.number));
            this.acrossClues.appendChild(clueItem);
        });

        downWords.forEach(pw => {
            const clueItem = document.createElement('div');
            clueItem.className = 'clue-item';
            clueItem.dataset.direction = 'down';
            clueItem.dataset.number = pw.number;
            clueItem.innerHTML = `<span class="clue-number">${pw.number}.</span>${pw.clue}`;
            clueItem.addEventListener('click', () => this.selectClue('down', pw.number));
            this.downClues.appendChild(clueItem);
        });
    }

    selectClue(direction, number) {
        this.activeDirection = direction;
        
        const wordData = this.placedWords.find(pw => 
            pw.direction === direction && pw.number === number
        );
        
        if (wordData) {
            this.activeWord = {
                word: wordData.word,
                direction: wordData.direction,
                number: wordData.number,
                row: wordData.row,
                col: wordData.col
            };

            document.querySelectorAll('.cell').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.clue-item').forEach(c => c.classList.remove('active'));
            
            this.highlightWord(this.activeWord);
            document.querySelector(`.clue-item[data-direction="${direction}"][data-number="${number}"]`)?.classList.add('active');

            const firstInput = document.querySelector(`input[data-row="${wordData.row}"][data-col="${wordData.col}"]`);
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    showHint() {
        if (!this.activeWord) {
            alert('Select a clue or cell first!');
            return;
        }

        const wordData = this.activeWord;
        const word = wordData.word;
        const startRow = wordData.row;
        const startCol = wordData.col;

        // Find first empty or incorrect cell
        for (let i = 0; i < word.length; i++) {
            const row = wordData.direction === 'across' ? startRow : startRow + i;
            const col = wordData.direction === 'across' ? startCol + i : startCol;
            const key = `${row}_${col}`;
            const input = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);

            if (input) {
                const currentValue = input.value.toUpperCase();
                const correctLetter = word[i];
                
                // Fill if empty or incorrect
                if (!currentValue || currentValue !== correctLetter) {
                    input.value = correctLetter;
                    this.filledCells.add(key);
                    this.hintsUsed++;
                    input.focus();
                    this.updateProgress();
                    break;
                }
            }
        }
    }

    checkAnswers() {
        let allCorrect = true;
        this.correctCells.clear();

        this.placedWords.forEach(wordData => {
            const word = wordData.word;
            const startRow = wordData.row;
            const startCol = wordData.col;

            for (let i = 0; i < word.length; i++) {
                const row = wordData.direction === 'across' ? startRow : startRow + i;
                const col = wordData.direction === 'across' ? startCol + i : startCol;
                const key = `${row}_${col}`;
                const input = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);

                if (input) {
                    if (input.value.toUpperCase() === word[i]) {
                        this.correctCells.add(key);
                    } else {
                        allCorrect = false;
                    }
                }
            }
        });

        this.renderGrid();

        if (allCorrect) {
            setTimeout(() => this.completeLevel(), 500);
        } else {
            alert('Some answers are incorrect. Keep trying!');
        }
    }

    updateProgress() {
        const totalCells = Object.keys(this.cellData).length;
        const filledCells = this.filledCells.size;
        const progress = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;
        this.progressPercent.textContent = progress;
    }

    completeLevel() {
        this.completedLevels.add(this.currentLevel);
        this.score += 100 - (this.hintsUsed * 10);
        this.saveProgress();
        this.updateStats();
        this.showScreen('completeScreen');
    }

    nextLevel() {
        this.showScreen('gameScreen');
        
        if (this.currentLevel < crosswordLevels.length) {
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
        this.totalScore.textContent = this.score;
        this.currentLevelNum.textContent = this.currentLevel;
    }
}

// Initialize game when page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new CrosswordGame();
});
