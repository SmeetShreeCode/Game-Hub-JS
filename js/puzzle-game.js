/* ================= CONFIG ================= */

const GRID_SIZE = 4;
const TILE_COUNT = 16;
const TILE_SIZE = 125;
const GAME_TIME_MIN = 5;

/* ================= STATE ================= */

let currentLevel = 0;
let activeTile = 15;
let numberMap = [];
let initPositions = [];
let deadline = null;
let timerInterval = null;

/* ================= DOM ================= */

const mainBox = document.querySelector('.mainBox');
const levelScreen = document.getElementById('levelScreen');
const gameScreen = document.getElementById('gameScreen');
const levelGrid = document.getElementById('levelGrid');
const demoPic = document.getElementById('demoPic');

/* ================= INIT ================= */

buildLevelScreen();
levelScreen.style.display = 'block';
gameScreen.style.display = 'none';

/* ================= ADJACENT TILES ================= */

function init(active) {
    document.querySelectorAll('.clickable')
        .forEach(el => el.classList.remove('clickable'));

    const neighbors = [
        active + 1,
        active - 1,
        active + GRID_SIZE,
        active - GRID_SIZE
    ];

    neighbors.forEach(n => {
        if (n < 0 || n >= TILE_COUNT) return;

        const sameRow =
            Math.floor(n / GRID_SIZE) === Math.floor(active / GRID_SIZE);

        if (
            (Math.abs(n - active) === 1 && sameRow) ||
            Math.abs(n - active) === GRID_SIZE
        ) {
            document.getElementById(`id_${n}`)?.classList.add('clickable');
        }
    });
}

/* ================= TILE CLICK ================= */

mainBox.addEventListener('click', e => {
    const tile = e.target.closest('.clickable');
    if (!tile) return;

    const id = Number(tile.id.split('_')[1]);
    activeTile = toggle(id, activeTile);
    init(activeTile);
    checkResult();
});

/* ================= LEVEL SCREEN ================= */

function buildLevelScreen() {
    levelGrid.innerHTML = '';

    chapters.levels.forEach((lvl, i) => {
        levelGrid.insertAdjacentHTML('beforeend', `
            <div class="levelItem" data-level="${i}"
                 style="background-image:url('${lvl.image}')">
                <div class="levelNumber">${i + 1}</div>
            </div>
        `);
    });
}

levelGrid.addEventListener('click', e => {
    const item = e.target.closest('.levelItem');
    if (!item) return;
    startLevel(Number(item.dataset.level));
});

/* ================= START LEVEL ================= */

function startLevel(levelIndex) {
    currentLevel = levelIndex;

    levelScreen.style.display = 'none';
    gameScreen.style.display = 'block';

    activeTile = 15;
    putValue();
    init(activeTile);

    demoPic.style.backgroundImage =
        `url(${chapters.levels[currentLevel].image})`;
    demoPic.style.backgroundSize = '155px';
    demoPic.style.backgroundPosition = 'center';

    deadline = new Date(Date.now() + GAME_TIME_MIN * 60000);
    initializeClock('timeLeft', deadline);
}

/* ================= KEYBOARD ================= */

document.body.addEventListener('keyup', e => {
    if (gameScreen.style.display !== 'block') return;

    const moves = {
        37: +1,
        39: -1,
        38: +GRID_SIZE,
        40: -GRID_SIZE
    };

    if (!(e.keyCode in moves)) return;

    const next = activeTile + moves[e.keyCode];
    if (next < 0 || next >= TILE_COUNT) return;

    const sameRow =
        Math.floor(next / GRID_SIZE) === Math.floor(activeTile / GRID_SIZE);

    if (
        Math.abs(next - activeTile) === 1 && !sameRow ||
        Math.abs(next - activeTile) > GRID_SIZE
    ) return;

    activeTile = toggle(next, activeTile);
    init(activeTile);
    checkResult();
});

/* ================= CHECK RESULT ================= */

function checkResult() {
    for (let i = 0; i < 15; i++) {
        const tile = document.getElementById(`id_${i}`);
        if (Number(tile.dataset.num) !== i + 1) return;
    }

    clearInterval(timerInterval);
    alert('🎉 Level Completed!');

    gameScreen.style.display = 'none';
    levelScreen.style.display = 'block';
}

/* ================= TOGGLE ================= */

function toggle(id, active) {
    const tile = document.getElementById(`id_${id}`);
    const empty = document.querySelector('.activeBox');

    [tile.dataset.num, empty.dataset.num] = [empty.dataset.num, tile.dataset.num];

    empty.style.backgroundImage = tile.style.backgroundImage;
    empty.style.backgroundPosition = tile.style.backgroundPosition;
    empty.style.backgroundSize = tile.style.backgroundSize;
    mainBox.style.pointerEvents = 'none';

    setTimeout(() => {
        mainBox.style.pointerEvents = '';
    }, 180);

    tile.style.backgroundImage = 'none';

    empty.classList.replace('activeBox', 'box');
    tile.classList.replace('box', 'activeBox');

    numberMap[active] = numberMap[id];
    numberMap[id] = undefined;

    tile.style.transform = 'scale(0.96)';
    empty.style.transform = 'scale(1.02)';

    requestAnimationFrame(() => {
        tile.style.transform = '';
        empty.style.transform = '';
    });

    return id;
}

/* ================= SHUFFLE & SET ================= */

function putValue() {
    initPositions = [];

    let x = 0, y = 0;
    for (let i = 0; i < 15; i++) {
        initPositions[i] = `${x},${y}`;
        if (i % 4 !== 3) {
            x -= TILE_SIZE;
        } else {
            x = 0;
            y -= TILE_SIZE;
        }
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function isSolvable(nums) {
        let inversions = 0;

        for (let i = 0; i < nums.length; i++) {
            for (let j = i + 1; j < nums.length; j++) {
                if (nums[i] && nums[j] && nums[i] > nums[j]) {
                    inversions++;
                }
            }
        }

        const blankIndex = nums.indexOf(0);
        const blankRowFromBottom = GRID_SIZE - Math.floor(blankIndex / GRID_SIZE);

        return blankRowFromBottom % 2 === 0
            ? inversions % 2 === 1
            : inversions % 2 === 0;
    }

    let tileNums;
    do {
        tileNums = shuffle([...Array(15).keys()].map(n => n + 1));
        tileNums.push(0);
    } while (!isSolvable(tileNums));

    numberMap = [];

    for (let i = 0; i < TILE_COUNT; i++) {
        numberMap[i] = tileNums[i] === 0
            ? undefined
            : initPositions[tileNums[i] - 1];
    }

    for (let i = 0; i < 15; i++) {
        const el = document.getElementById(`id_${i}`);
        const [px, py] = numberMap[i].split(',');

        el.style.backgroundImage =
            `url(${chapters.levels[currentLevel].image})`;
        el.style.backgroundSize = '500px 500px';
        el.style.backgroundPosition = `${px}px ${py}px`;

        // ✅ number follows actual tile content
        el.dataset.num = initPositions.indexOf(numberMap[i]) + 1;
    }

    const empty = document.getElementById('id_15');
    empty.style.backgroundImage = 'none';
    empty.style.backgroundPosition = '';
    empty.style.backgroundSize = '';
    empty.dataset.num = '';
}

/* ================= TIMER ================= */

function getTimeRemaining(end) {
    const t = end - Date.now();
    return {
        total: t,
        minutes: Math.floor(t / 60000),
        seconds: Math.floor((t / 1000) % 60)
    };
}

function initializeClock(id, endtime) {
    if (timerInterval) clearInterval(timerInterval);

    const clock = document.getElementById(id);
    const min = clock.querySelector('.minutes');
    const sec = clock.querySelector('.seconds');

    timerInterval = setInterval(() => {
        const t = getTimeRemaining(endtime);

        min.textContent = String(t.minutes).padStart(2, '0');
        sec.textContent = String(t.seconds).padStart(2, '0');

        if (t.total <= 0) {
            clearInterval(timerInterval);
            startLevel(currentLevel);
        }
    }, 1000);
}

let touchStartX = 0;
let touchStartY = 0;

mainBox.addEventListener('touchstart', e => {
    if (gameScreen.style.display !== 'block') return;

    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
}, { passive: true });

mainBox.addEventListener('touchend', e => {
    if (gameScreen.style.display !== 'block') return;

    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

    let next = null;

    if (Math.abs(dx) > Math.abs(dy)) {
        // horizontal
        next = dx > 0 ? activeTile + 1 : activeTile - 1;
    } else {
        // vertical
        next = dy > 0 ? activeTile - GRID_SIZE : activeTile + GRID_SIZE;
    }

    if (next < 0 || next >= TILE_COUNT) return;

    const sameRow =
        Math.floor(next / GRID_SIZE) === Math.floor(activeTile / GRID_SIZE);

    if (
        Math.abs(next - activeTile) === 1 && !sameRow ||
        Math.abs(next - activeTile) > GRID_SIZE
    ) return;

    activeTile = toggle(next, activeTile);
    init(activeTile);
    checkResult();
});
