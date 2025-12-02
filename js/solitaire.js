/* ==================== Solitaire Game - Complete Implementation ==================== */

(function () {
    'use strict';

    // --- Constants ---
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const colors = { '♠': 'black', '♣': 'black', '♥': 'red', '♦': 'red' };
    const el = id => document.getElementById(id);

    // --- Game State ---
    const state = {
        stock: [],
        waste: [],
        foundations: [[], [], [], []], // arrays of cards
        tableau: [[], [], [], [], [], [], []], // each card: {suit,rank,value,color,faceUp}
        moveHistory: [],
        moveCount: 0,
        score: 0,
        startTime: null,
        timerId: null,
        drawMode: 1, // 1 or 3 cards
        wasteIndex: 0 // For 3-card draw mode
    };

    // --- DOM Cache ---
    const piles = {
        stock: el('stock'),
        waste: el('waste'),
        foundations: [el('foundation-0'), el('foundation-1'), el('foundation-2'), el('foundation-3')],
        tableau: [el('tableau-0'), el('tableau-1'), el('tableau-2'), el('tableau-3'), el('tableau-4'), el('tableau-5'), el('tableau-6')]
    };
    const timerEl = el('timer');
    const moveCountEl = el('moveCount');
    const scoreEl = el('score');
    const undoBtn = el('undoBtn');
    const restartBtn = el('restartBtn');
    const autoPlayBtn = el('autoPlayBtn');
    const draw1Btn = el('draw1Btn');
    const draw3Btn = el('draw3Btn');
    const dragLayer = el('dragLayer');
    const winEl = el('win');
    const playAgainBtn = el('playAgain');
    const winTimeEl = el('winTime');
    const winMovesEl = el('winMoves');
    const winScoreEl = el('winScore');

    // --- Card Element Factory ---
    function makeCardEl(card, meta) {
        // meta: {pileId, indexInPile}
        const div = document.createElement('div');
        div.className = 'card ' + (card.faceUp ? 'face-up ' + (card.color === 'red' ? 'red' : 'black') : 'face-down');
        div.style.width = getComputedStyle(document.documentElement).getPropertyValue('--card-w') || '';
        div.style.height = getComputedStyle(document.documentElement).getPropertyValue('--card-h') || '';
        div.dataset.suit = card.suit;
        div.dataset.rank = card.rank;
        div.dataset.value = card.value;
        div.dataset.pile = meta.pileId;
        div.dataset.idx = meta.index;
        
        // Content for face-up cards
        if (card.faceUp) {
            div.innerHTML = `<div class="rank">${card.rank}</div><div class="suit">${card.suit}</div><div class="rank" style="transform:rotate(180deg)">${card.rank}</div>`;
        }
        return div;
    }

    // --- Deck Helpers ---
    function newDeck() {
        const deck = [];
        for (const s of suits) {
            for (let i = 0; i < ranks.length; i++) {
                deck.push({ suit: s, rank: ranks[i], value: i + 1, color: colors[s], faceUp: false });
            }
        }
        return deck;
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // --- Initialize / Deal ---
    function startNewGame() {
        // Clear state
        state.stock = [];
        state.waste = [];
        state.foundations = [[], [], [], []];
        state.tableau = [[], [], [], [], [], [], []];
        state.moveHistory = [];
        state.moveCount = 0;
        state.score = 0;
        state.wasteIndex = 0;

        // Create and shuffle deck
        const deck = shuffle(newDeck());
        let idx = 0;

        // Deal to tableau
        for (let pile = 0; pile < 7; pile++) {
            for (let j = 0; j <= pile; j++) {
                const card = deck[idx++];
                if (j === pile) card.faceUp = true; // Last card face up
                state.tableau[pile].push(card);
            }
        }

        // Rest to stock
        state.stock = deck.slice(idx).map(c => (c.faceUp = false, c));

        // Timer
        state.startTime = Date.now();
        if (state.timerId) clearInterval(state.timerId);
        state.timerId = setInterval(updateTimer, 1000);

        // Render all
        renderAll();
        updateUndo();
        winEl.classList.remove('show');
    }

    // --- Rendering ---
    function clearChildren(node) {
        while (node.lastChild) node.removeChild(node.lastChild);
    }

    function renderStock() {
        const node = piles.stock;
        clearChildren(node);
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = 'Stock';
        node.appendChild(label);
        
        if (state.stock.length > 0 || (state.drawMode === 3 && state.waste.length > 0)) {
            const back = { faceUp: false };
            const cardEl = makeCardEl(back, { pileId: 'stock', index: 0 });
            cardEl.style.left = '0px';
            cardEl.style.top = '0px';
            cardEl.addEventListener('click', drawFromStock);
            cardEl.addEventListener('touchend', (e) => {
                e.preventDefault();
                drawFromStock();
            });
            node.appendChild(cardEl);
        }
    }

    function renderWaste() {
        const node = piles.waste;
        clearChildren(node);
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = 'Waste';
        node.appendChild(label);
        
        if (state.drawMode === 1) {
            if (state.waste.length > 0) {
                const card = state.waste[state.waste.length - 1];
                const elCard = makeCardEl(card, { pileId: 'waste', index: state.waste.length - 1 });
                elCard.style.left = '0px';
                elCard.style.top = '0px';
                node.appendChild(elCard);
            }
        } else {
            // 3-card mode: show last 3 cards
            const visibleStart = Math.max(0, state.waste.length - 3);
            const visibleCards = state.waste.slice(visibleStart);
            visibleCards.forEach((card, index) => {
                const elCard = makeCardEl(card, { pileId: 'waste', index: visibleStart + index });
                elCard.style.left = (index * 20) + 'px';
                elCard.style.top = '0px';
                elCard.style.zIndex = index;
                node.appendChild(elCard);
            });
        }
    }

    function renderFoundations() {
        for (let i = 0; i < 4; i++) {
            const node = piles.foundations[i];
            clearChildren(node);
            const label = document.createElement('div');
            label.className = 'label';
            label.textContent = ['♠', '♥', '♦', '♣'][i];
            node.appendChild(label);
            
            const f = state.foundations[i];
            if (f.length > 0) {
                const top = f[f.length - 1];
                const elCard = makeCardEl(top, { pileId: `foundation-${i}`, index: f.length - 1 });
                elCard.style.left = '0px';
                elCard.style.top = '0px';
                node.appendChild(elCard);
            }
        }
    }

    function renderTableau() {
        for (let i = 0; i < 7; i++) {
            const node = piles.tableau[i];
            clearChildren(node);
            const pile = state.tableau[i];
            
            // Append each card positioned with vertical offset
            for (let j = 0; j < pile.length; j++) {
                const card = pile[j];
                const cardEl = makeCardEl(card, { pileId: `tableau-${i}`, index: j });
                // Vertical stacking with overlap
                const cardGap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-gap')) || 26;
                const y = j * cardGap;
                cardEl.style.left = '0px';
                cardEl.style.top = y + 'px';
                node.appendChild(cardEl);
            }
        }
    }

    function renderAll() {
        renderStock();
        renderWaste();
        renderFoundations();
        renderTableau();
        updateTimer();
        updateUndo();
        updateScore();
    }

    // --- UI Updates ---
    function updateTimer() {
        if (!state.startTime) return;
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function updateUndo() {
        undoBtn.disabled = state.moveHistory.length === 0;
    }

    function updateScore() {
        moveCountEl.textContent = state.moveCount;
        scoreEl.textContent = state.score;
    }

    // --- Game Rules Helpers ---
    function cardMatchesFoundation(card, foundationIndex) {
        const suit = ['♠', '♥', '♦', '♣'][foundationIndex];
        if (card.suit !== suit) return false;
        const f = state.foundations[foundationIndex];
        return (f.length === 0 && card.value === 1) || (f.length > 0 && card.value === f[f.length - 1].value + 1);
    }

    function canPlaceOnTableau(stackBottomCard, tableauIndex) {
        const pile = state.tableau[tableauIndex];
        if (pile.length === 0) return stackBottomCard.value === 13; // King on empty
        const top = pile[pile.length - 1];
        if (!top.faceUp) return false;
        // Alternate colors and descending by 1
        return top.color !== stackBottomCard.color && top.value === stackBottomCard.value + 1;
    }

    // --- Move History & Undo ---
    function pushHistory() {
        state.moveHistory.push({
            stock: state.stock.map(c => ({ ...c })),
            waste: state.waste.map(c => ({ ...c })),
            foundations: state.foundations.map(p => p.map(c => ({ ...c }))),
            tableau: state.tableau.map(p => p.map(c => ({ ...c }))),
            wasteIndex: state.wasteIndex,
            moveCount: state.moveCount,
            score: state.score
        });
        if (state.moveHistory.length > 60) state.moveHistory.shift();
        updateUndo();
    }

    function undo() {
        const snap = state.moveHistory.pop();
        if (!snap) return;
        state.stock = snap.stock;
        state.waste = snap.waste;
        state.foundations = snap.foundations;
        state.tableau = snap.tableau;
        state.wasteIndex = snap.wasteIndex;
        state.moveCount = snap.moveCount;
        state.score = snap.score;
        renderAll();
    }

    // --- Actions: Draw from Stock ---
    function drawFromStock() {
        pushHistory();

        if (state.stock.length === 0) {
            // Recycle waste back to stock
            if (state.waste.length === 0) {
                state.moveHistory.pop(); // Undo the history push
                updateUndo();
                return;
            }
            state.stock = state.waste.reverse().map(c => ({ ...c, faceUp: false }));
            state.waste = [];
            state.wasteIndex = 0;
        } else {
            if (state.drawMode === 1) {
                const card = state.stock.pop();
                card.faceUp = true;
                state.waste.push(card);
            } else {
                // Draw 3 cards
                const drawn = state.stock.splice(-3).reverse();
                drawn.forEach(card => {
                    card.faceUp = true;
                    state.waste.push(card);
                });
                state.wasteIndex = Math.max(0, state.waste.length - 3);
            }
        }

        state.moveCount++;
        renderAll();
    }

    // --- Move to Foundation ---
    function moveToFoundationFromPile(pileId, idx) {
        let card = null;
        let sourcePile = null;

        if (pileId === 'waste') {
            if (state.waste.length === 0) return false;
            if (state.drawMode === 1) {
                card = state.waste[state.waste.length - 1];
            } else {
                const visibleStart = Math.max(0, state.waste.length - 3);
                card = state.waste[state.waste.length - 1];
            }
            sourcePile = 'waste';
        } else if (pileId.startsWith('tableau-')) {
            const t = parseInt(pileId.split('-')[1]);
            const pile = state.tableau[t];
            if (idx !== pile.length - 1) return false; // Only top card to foundation
            card = pile[pile.length - 1];
            sourcePile = `tableau-${t}`;
        }

        if (!card || !card.faceUp) return false;

        for (let f = 0; f < 4; f++) {
            if (cardMatchesFoundation(card, f)) {
                pushHistory();
                
                // Remove from source
                if (sourcePile === 'waste') {
                    if (state.drawMode === 1) {
                        state.waste.pop();
                    } else {
                        const cardIndex = state.waste.findIndex(c => c.suit === card.suit && c.rank === card.rank);
                        if (cardIndex >= 0) {
                            state.waste.splice(cardIndex, 1);
                            state.wasteIndex = Math.max(0, state.waste.length - 3);
                        }
                    }
                } else if (sourcePile.startsWith('tableau-')) {
                    const t = parseInt(sourcePile.split('-')[1]);
                    state.tableau[t].pop();
                    // Flip new top
                    if (state.tableau[t].length > 0) {
                        state.tableau[t][state.tableau[t].length - 1].faceUp = true;
                    }
                }

                // Add to foundation
                state.foundations[f].push(card);
                state.score += 10;
                state.moveCount++;
                renderAll();
                checkWin();
                return true;
            }
        }
        return false;
    }

    // --- Place Stack on Tableau ---
    function tryPlaceStackOnTableau(stack, sourcePileId, targetTableauIndex) {
        const bottom = stack[0];
        if (canPlaceOnTableau(bottom, targetTableauIndex)) {
            pushHistory();

            // Remove from source
            if (sourcePileId === 'waste') {
                if (state.drawMode === 1) {
                    state.waste.pop();
                } else {
                    const card = stack[0];
                    const cardIndex = state.waste.findIndex(c => c.suit === card.suit && c.rank === card.rank);
                    if (cardIndex >= 0) {
                        state.waste.splice(cardIndex, 1);
                        state.wasteIndex = Math.max(0, state.waste.length - 3);
                    }
                }
            } else if (sourcePileId.startsWith('tableau-')) {
                const s = parseInt(sourcePileId.split('-')[1]);
                const pile = state.tableau[s];
                const i = pile.findIndex(c => c === stack[0] || (c.suit === stack[0].suit && c.rank === stack[0].rank));
                if (i >= 0) {
                    state.tableau[s] = pile.slice(0, i);
                    // Flip new top if needed
                    const newPile = state.tableau[s];
                    if (newPile.length > 0) newPile[newPile.length - 1].faceUp = true;
                }
            }

            // Append stack onto target
            state.tableau[targetTableauIndex] = state.tableau[targetTableauIndex].concat(stack.map(c => ({ ...c })));
            state.moveCount++;
            renderAll();
            return true;
        }
        return false;
    }

    // --- Auto-Play ---
    function autoPlay() {
        let moved = false;
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            let foundMove = false;

            // Check waste pile
            if (state.waste.length > 0) {
                let card;
                if (state.drawMode === 1) {
                    card = state.waste[state.waste.length - 1];
                } else {
                    card = state.waste[state.waste.length - 1];
                }
                
                if (card && card.faceUp && moveToFoundationFromPile('waste', 0)) {
                    foundMove = true;
                    moved = true;
                    continue;
                }
            }

            // Check tableau piles
            for (let i = 0; i < 7; i++) {
                const pile = state.tableau[i];
                if (pile.length > 0) {
                    const topCard = pile[pile.length - 1];
                    if (topCard.faceUp) {
                        if (moveToFoundationFromPile(`tableau-${i}`, pile.length - 1)) {
                            foundMove = true;
                            moved = true;
                            break;
                        }
                    }
                }
            }

            if (!foundMove) break;
            attempts++;
        }

        if (moved) {
            renderAll();
        }
    }

    // --- Win Check ---
    function checkWin() {
        const all = state.foundations.every(f => f.length === 13 && f[f.length - 1].value === 13);
        if (all) {
            if (state.timerId) clearInterval(state.timerId);
            winTimeEl.textContent = timerEl.textContent;
            winMovesEl.textContent = state.moveCount;
            winScoreEl.textContent = state.score;
            winEl.classList.add('show');
            createFireworks();
        }
    }

    function createFireworks() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'card-firework';
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const angle = (Math.PI * 2 * i) / 50;
                const distance = 200 + Math.random() * 300;
                firework.style.left = centerX + 'px';
                firework.style.top = centerY + 'px';
                firework.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
                firework.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
                document.body.appendChild(firework);
                setTimeout(() => firework.remove(), 2000);
            }, i * 50);
        }
    }

    // --- Drag and Drop ---
    let dragging = null; // {stack:Array, sourcePileId, srcIndex, x, y, el:DOM}

    function pointerDownHandler(e) {
        const pe = e.touches ? e.touches[0] : e;
        const cardEl = e.target.closest('.card');
        if (!cardEl) return;

        const pileId = cardEl.dataset.pile;
        const idx = Number(cardEl.dataset.idx);

        // Only allow dragging of faceUp cards (tableau or waste)
        if (pileId === 'waste') {
            if (state.waste.length === 0) return;
            let card;
            if (state.drawMode === 1) {
                card = state.waste[state.waste.length - 1];
            } else {
                card = state.waste[state.waste.length - 1];
            }
            if (!card || !card.faceUp) return;
            const stack = [card];
            startDrag(stack, 'waste', pe.clientX, pe.clientY);
            e.preventDefault();
            return;
        }

        if (pileId && pileId.startsWith('tableau-')) {
            const t = parseInt(pileId.split('-')[1]);
            const pile = state.tableau[t];
            if (idx < 0 || idx >= pile.length) return;
            const card = pile[idx];
            if (!card.faceUp) return;
            // Stack from idx to end (all face-up cards)
            const stack = [];
            for (let i = idx; i < pile.length; i++) {
                if (pile[i].faceUp) {
                    stack.push(pile[i]);
                } else {
                    break;
                }
            }
            startDrag(stack, `tableau-${t}`, pe.clientX, pe.clientY, idx);
            e.preventDefault();
            return;
        }
    }

    function startDrag(stack, sourcePileId, sx, sy, srcIndex) {
        dragging = { stack, sourcePileId, srcIndex: srcIndex || 0, x: sx, y: sy, el: null };

        // Create visual drag element (top card)
        const top = stack[stack.length - 1];
        const elCard = makeCardEl(top, { pileId: sourcePileId, index: stack.length - 1 });
        elCard.classList.add('dragging');
        const cardW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-w')) || 72;
        const cardH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-h')) || 98;
        elCard.style.position = 'fixed';
        elCard.style.left = (sx - cardW / 2) + 'px';
        elCard.style.top = (sy - cardH / 2) + 'px';
        elCard.style.pointerEvents = 'none';
        dragLayer.appendChild(elCard);
        dragging.el = elCard;

        // Subscribe to pointer events
        window.addEventListener('pointermove', onDragMove, { passive: false });
        window.addEventListener('pointerup', onDragUp, { passive: false });
        window.addEventListener('touchmove', onDragMove, { passive: false });
        window.addEventListener('touchend', onDragUp, { passive: false });
        requestAnimationFrame(rAFDrag);
    }

    function onDragMove(e) {
        if (!dragging) return;
        const pe = e.touches ? e.touches[0] : e;
        dragging.x = pe.clientX;
        dragging.y = pe.clientY;
        e.preventDefault();
    }

    function rAFDrag() {
        if (!dragging) return;
        const elCard = dragging.el;
        if (elCard && dragging.x !== undefined) {
            const cardW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-w')) || 72;
            const cardH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-h')) || 98;
            const x = dragging.x - cardW / 2;
            const y = dragging.y - cardH / 2;
            elCard.style.left = x + 'px';
            elCard.style.top = y + 'px';
            highlightDropTarget(dragging.x, dragging.y, dragging);
        }
        requestAnimationFrame(rAFDrag);
    }

    function highlightDropTarget(x, y, dragging) {
        // Remove previous highlights
        document.querySelectorAll('.pile').forEach(p => p.classList.remove('valid'));

        const elements = document.elementsFromPoint(x, y);
        for (const el of elements) {
            if (!el.classList) continue;
            if (el.classList.contains('foundation')) {
                const id = el.id;
                const fIndex = Number(id.split('-')[1]);
                if (dragging.stack.length === 1 && cardMatchesFoundation(dragging.stack[0], fIndex)) {
                    el.classList.add('valid');
                    return;
                }
            } else if (el.classList.contains('tableau')) {
                const id = el.id;
                const tIndex = Number(id.split('-')[1]);
                if (canPlaceOnTableau(dragging.stack[0], tIndex) || (state.tableau[tIndex].length === 0 && dragging.stack[0].value === 13)) {
                    el.classList.add('valid');
                    return;
                }
            }
        }
    }

    function onDragUp(e) {
        if (!dragging) return;
        const pe = e.changedTouches ? e.changedTouches[0] : e;
        const x = pe.clientX;
        const y = pe.clientY;

        // Find drop target
        const elements = document.elementsFromPoint(x, y);
        let dropped = false;

        for (const eltarget of elements) {
            if (eltarget.classList && eltarget.classList.contains('foundation')) {
                const fIndex = Number(eltarget.id.split('-')[1]);
                if (dragging.stack.length === 1 && cardMatchesFoundation(dragging.stack[0], fIndex)) {
                    // Perform move
                    pushHistory();
                    // Remove from source
                    if (dragging.sourcePileId === 'waste') {
                        if (state.drawMode === 1) {
                            state.waste.pop();
                        } else {
                            const card = dragging.stack[0];
                            const cardIndex = state.waste.findIndex(c => c.suit === card.suit && c.rank === card.rank);
                            if (cardIndex >= 0) {
                                state.waste.splice(cardIndex, 1);
                                state.wasteIndex = Math.max(0, state.waste.length - 3);
                            }
                        }
                    } else if (dragging.sourcePileId.startsWith('tableau-')) {
                        const s = Number(dragging.sourcePileId.split('-')[1]);
                        state.tableau[s] = state.tableau[s].slice(0, dragging.srcIndex);
                        if (state.tableau[s].length) {
                            state.tableau[s][state.tableau[s].length - 1].faceUp = true;
                        }
                    }
                    state.foundations[fIndex].push(dragging.stack[0]);
                    state.score += 10;
                    state.moveCount++;
                    dropped = true;
                    break;
                }
            } else if (eltarget.classList && eltarget.classList.contains('tableau')) {
                const tIndex = Number(eltarget.id.split('-')[1]);
                if (canPlaceOnTableau(dragging.stack[0], tIndex) || (state.tableau[tIndex].length === 0 && dragging.stack[0].value === 13)) {
                    // Move stack
                    pushHistory();
                    // Remove from source
                    if (dragging.sourcePileId === 'waste') {
                        if (state.drawMode === 1) {
                            state.waste.pop();
                        } else {
                            const card = dragging.stack[0];
                            const cardIndex = state.waste.findIndex(c => c.suit === card.suit && c.rank === card.rank);
                            if (cardIndex >= 0) {
                                state.waste.splice(cardIndex, 1);
                                state.wasteIndex = Math.max(0, state.waste.length - 3);
                            }
                        }
                    } else if (dragging.sourcePileId.startsWith('tableau-')) {
                        const s = Number(dragging.sourcePileId.split('-')[1]);
                        state.tableau[s] = state.tableau[s].slice(0, dragging.srcIndex);
                        if (state.tableau[s].length) {
                            state.tableau[s][state.tableau[s].length - 1].faceUp = true;
                        }
                    }
                    // Append copies of stack
                    state.tableau[tIndex] = state.tableau[tIndex].concat(dragging.stack.map(c => ({ ...c })));
                    state.moveCount++;
                    dropped = true;
                    break;
                }
            }
        }

        // Cleanup drag element & listeners
        if (dragging.el && dragging.el.parentNode) {
            dragging.el.parentNode.removeChild(dragging.el);
        }
        dragging = null;
        document.querySelectorAll('.pile').forEach(p => p.classList.remove('valid'));
        window.removeEventListener('pointermove', onDragMove);
        window.removeEventListener('pointerup', onDragUp);
        window.removeEventListener('touchmove', onDragMove);
        window.removeEventListener('touchend', onDragUp);

        // Render whether dropped or not
        renderAll();
        checkWin();
    }

    // --- Event Handlers ---
    let lastClickTime = 0;
    document.addEventListener('click', (e) => {
        const cardEl = e.target.closest('.card');
        if (!cardEl) {
            // Click on stock area
            const pile = e.target.closest('.pile');
            if (pile && pile.id === 'stock') {
                drawFromStock();
            }
            return;
        }

        const pileId = cardEl.dataset.pile;
        const now = Date.now();

        // Double-click emulation: two clicks within 300ms
        if (now - lastClickTime < 300) {
            // Try auto move to foundation
            moveToFoundationFromPile(pileId, Number(cardEl.dataset.idx));
        } else {
            // Single click: if on waste, try move to foundation
            if (pileId === 'waste') {
                moveToFoundationFromPile('waste');
            }
            // Click on tableau card: if face-down and top -> flip
            if (pileId && pileId.startsWith('tableau-')) {
                const t = parseInt(pileId.split('-')[1]);
                const pile = state.tableau[t];
                const idx = Number(cardEl.dataset.idx);
                if (idx === pile.length - 1 && !pile[idx].faceUp) {
                    pushHistory();
                    pile[idx].faceUp = true;
                    state.moveCount++;
                    renderAll();
                }
            }
        }
        lastClickTime = now;
    });

    // Touch / pointer start registration on board (delegated)
    document.getElementById('board').addEventListener('pointerdown', pointerDownHandler, { passive: false });
    document.getElementById('board').addEventListener('touchstart', pointerDownHandler, { passive: false });

    // --- Controls ---
    undoBtn.addEventListener('click', () => undo());
    restartBtn.addEventListener('click', () => startNewGame());
    autoPlayBtn.addEventListener('click', () => autoPlay());
    playAgainBtn.addEventListener('click', () => {
        winEl.classList.remove('show');
        startNewGame();
    });

    draw1Btn.addEventListener('click', () => {
        state.drawMode = 1;
        draw1Btn.classList.add('active');
        draw3Btn.classList.remove('active');
        startNewGame();
    });

    draw3Btn.addEventListener('click', () => {
        state.drawMode = 3;
        draw3Btn.classList.add('active');
        draw1Btn.classList.remove('active');
        startNewGame();
    });

    // --- Initialize on load ---
    startNewGame();

    // Expose API for debugging (optional)
    window._sol = { state, startNewGame, renderAll };
})();

