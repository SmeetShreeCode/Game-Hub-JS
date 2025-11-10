function loadCollisionsAndPlatforms() {
    parsedCollisions = collisionsLevel[level].parse2D();
    collisionBlocks = parsedCollisions.createObjectFrom2D('collision');
    player.collisionBlocks = collisionBlocks;

    platformCollisions = parsedCollisions.createObjectFrom2D('floor');
    player.platformCollisionBlocks = platformCollisions;
}

function loadLevelImage() {
    if (player.currentAnimation) player.currentAnimation.isActive = false;
    background = new Sprite({
        position: {x: 0, y: 0},
        imageSrc: `./images/king-and-pigs/img/Levels/Level ${level}.png`,
    });
}

// and for mobile control put https://yoannmoi.net/nipplejs/ or button controls

let level = 1;

let levels = {
    1: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 200;
            player.position.y = 200;

            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;
            enemies.isPatrol = true;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 767, y: 272},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    2: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 96;
            player.position.y = 140;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 200;
            enemies.position.y = 455;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 772, y: 336},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    3: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 750;
            player.position.y = 230;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 176, y: 335},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    4: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 764;
            player.position.y = 250;

            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 136, y: 329},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    5: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 214;
            player.position.y = 316;

            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 735, y: 336},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    6: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 214;
            player.position.y = 318;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 740, y: 210},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    7: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 200;
            player.position.y = 318;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 805, y: 339},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    8: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 750;
            player.position.y = 318;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 318, y: 335},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    9: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 195;
            player.position.y = 318;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 753, y: 211},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    10: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 750;
            player.position.y = 320;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 189, y: 338},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    11: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 780;
            player.position.y = 292;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 182, y: 208},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    12: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 780;
            player.position.y = 292;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 128, y: 273},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    13: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 75;
            player.position.y = 292;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 866, y: 335},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    14: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 850;
            player.position.y = 285;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 163, y: 398},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    15: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 850;
            player.position.y = 285;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 114, y: 335},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    16: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 110;
            player.position.y = 410;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 868, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    17: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 825;
            player.position.y = 83;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 66, y: 146},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    18: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 62;
            player.position.y = 400;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 861, y: 146},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    19: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 62;
            player.position.y = 400;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 707, y: 399},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    20: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 62;
            player.position.y = 400;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 832, y: 399},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    21: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 195;
            player.position.y = 115;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 868, y: 210},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    22: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 138;
            player.position.y = 50;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 771, y: 144},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    23: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 50;
            player.position.y = 134;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 833, y: 274},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    24: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 220;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 702, y: 145},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    25: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 280;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 631, y: 145},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    26: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 260;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 639, y: 145},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    27: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 260;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 759, y: 80},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    28: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 40;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 696, y: 140},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    29: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 40;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 810, y: 145},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    30: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 40;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 704, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    31: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 250;
            player.position.y = 80;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 639, y: 75},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    32: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 250;
            player.position.y = 80;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 835, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    33: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 250;
            player.position.y = 80;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 709, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    34: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 250;
            player.position.y = 80;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 707, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    35: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 75;
            player.position.y = 80;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 770, y: 398},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    36: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 75;
            player.position.y = 80;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 830, y: 398},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    37: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 75;
            player.position.y = 400;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 767, y: 398},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    38: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 75;
            player.position.y = 400;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 805, y: 398},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    39: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 75;
            player.position.y = 400;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 805, y: 398},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    40: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 75;
            player.position.y = 400;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 767, y: 398},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    41: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 75;
            player.position.y = 400;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 704, y: 398},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    42: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 75;
            player.position.y = 400;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 825, y: 398},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    43: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 75;
            player.position.y = 400;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 697, y: 398},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    44: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 75;
            player.position.y = 400;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 867, y: 398},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    45: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 850;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 64, y: 274},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    46: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 150;
            player.position.y = 450;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 809, y: 396},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    47: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 150;
            player.position.y = 450;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 695, y: 396},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    48: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 150;
            player.position.y = 450;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 819, y: 396},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    49: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 150;
            player.position.y = 450;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 867, y: 396},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    50: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 640;
            player.position.y = 450;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 363, y: 396},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    51: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 834, y: 78},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    52: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 830, y: 78},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    53: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 790;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 555, y: 140},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    54: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 767, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    55: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 76;
            player.position.y = 400;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 867, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    56: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 790;
            player.position.y = 180;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 97, y: 145},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    57: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 868, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    58: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 867, y: 78},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    59: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 868, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    60: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 800;
            player.position.y = 400;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 100, y: 78},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    61: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 98, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    62: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 867, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    63: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 20;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 318, y: 78},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    64: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 704, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    65: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 226, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    66: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 676, y: 78},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    67: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 759, y: 78},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    68: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 867, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    69: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 63, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    70: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 869, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    71: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 20;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 868, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    72: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 64, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    73: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 780;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 63, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    74: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 820;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 97, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    75: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 830;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 63, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    76: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 869, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    77: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 830;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 101, y: 78},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    78: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 831, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    79: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 868, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    80: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 869, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    81: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 812, y: 143},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    82: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 118, y: 143},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    83: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 126, y: 206},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    84: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 825, y: 210},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    85: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 739, y: 205},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    86: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 831, y: 210},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    87: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 313, y: 270},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    88: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 811, y: 142},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    89: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 40;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 811, y: 145},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    90: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 101, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    91: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 444, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    92: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 837, y: 142},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    93: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 867, y: 145},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    94: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 120, y: 210},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    95: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 812, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    96: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 780;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 102, y: 82},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    97: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 102, y: 400},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    98: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 120, y: 140},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    99: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 171, y: 395},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },
    100: {
        init: () => {
            loadCollisionsAndPlatforms();

            player.position.x = 140;
            player.position.y = 100;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 500;
            enemies.position.y = 355;

            loadLevelImage();
            doors = [
                new Sprite({
                    position: {x: 122, y: 395},
                    imageSrc: './images/king-and-pigs/img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                })
            ];
        },
    },

};
