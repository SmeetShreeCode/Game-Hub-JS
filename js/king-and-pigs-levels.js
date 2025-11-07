function loadImage() {
    if (player.currentAnimation) player.currentAnimation.isActive = false;
    background = new Sprite({
        position: {x: 0, y: 0},
        imageSrc: `./images/king-and-pigs/img/Levels/Level ${12}.png`,
    });
}

let level = 11;

let levels = {
    1: {
        init: () => {
            parsedCollisions = collisionsLevel[level].parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 200;
            player.position.y = 200;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;
            enemies.isPatrol = true;

            loadImage();
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
            parsedCollisions = collisionsLevel[level].parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 96;
            player.position.y = 140;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 200;
            enemies.position.y = 455;

            loadImage();
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
            parsedCollisions = collisionsLevel[level].parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 750;
            player.position.y = 230;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadImage();
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
            parsedCollisions = collisionsLevel[level].parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 764;
            player.position.y = 250;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadImage();
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
            parsedCollisions = collisionsLevel[level].parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 214;
            player.position.y = 316;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadImage();
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
            parsedCollisions = collisionsLevel[level].parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 214;
            player.position.y = 318;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadImage();
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
            parsedCollisions = collisionsLevel[level].parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 200;
            player.position.y = 318;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadImage();
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
            parsedCollisions = collisionsLevel[level].parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 750;
            player.position.y = 318;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadImage();
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
            parsedCollisions = collisionsLevel[level].parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 195;
            player.position.y = 318;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadImage();
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
            parsedCollisions = collisionsLevel[level].parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 750;
            player.position.y = 320;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadImage();
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
            parsedCollisions = collisionsLevel[level].parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 120;
            player.position.y = 392;
            enemies.collisionBlocks = collisionBlocks;
            enemies.position.x = 600;
            enemies.position.y = 355;

            loadImage();
            doors = [
                new Sprite({
                    position: {x: 861, y: 147},
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
