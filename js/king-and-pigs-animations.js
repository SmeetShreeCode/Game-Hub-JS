const PLAYERANIMATIONS = {
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
                onComplete: () => {
                    // Go back to level selection instead of autoplaying next level
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
}

const PIG_ENEMYANIMATIONS = []

const PIGBOX_ENEMYANIMATIONS = []

const KING_ENEMYANIMATIONS = []

const BOXANIMATIONS = []

const LIVEANIMATIONS = []

const COINANIMATIONS = []

const BOMBANIMATIONS = []

const CANNONANIMATIONS = []