let level = 1;

let levels = {
    1: {
        init: () => {
            parsedCollisions = collisionsLevel1.parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 200;
            player.position.y = 200;

            if (player.currentAnimation) player.currentAnimation.isActive = false;
            background = new Sprite({
                position: {x: 0, y: 0},
                imageSrc: './images/king-and-pigs/img/backgroundLevel1.png',
            });

            doors = [
                new Sprite({
                    position: {x: 767, y: 278},
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
            parsedCollisions = collisionsLevel2.parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 96;
            player.position.y = 140;

            if (player.currentAnimation) player.currentAnimation.isActive = false;
            background = new Sprite({
                position: {x: 0, y: 0},
                imageSrc: './images/king-and-pigs/img/backgroundLevel2.png',
            });

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
            parsedCollisions = collisionsLevel3.parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 750;
            player.position.y = 230;

            if (player.currentAnimation) player.currentAnimation.isActive = false;
            background = new Sprite({
                position: {x: 0, y: 0},
                imageSrc: './images/king-and-pigs/img/backgroundLevel3.png',
            });

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
            parsedCollisions = collisionsLevel4.parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 764;
            player.position.y = 250;

            if (player.currentAnimation) player.currentAnimation.isActive = false;
            background = new Sprite({
                position: {x: 0, y: 0},
                imageSrc: './images/king-and-pigs/img/backgroundLevel4.png',
            });

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
            parsedCollisions = collisionsLevel5.parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 214;
            player.position.y = 318;

            if (player.currentAnimation) player.currentAnimation.isActive = false;
            background = new Sprite({
                position: {x: 0, y: 0},
                imageSrc: './images/king-and-pigs/img/backgroundLevel5.png',
            });

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
            parsedCollisions = collisionsLevel6.parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 214;
            player.position.y = 318;

            if (player.currentAnimation) player.currentAnimation.isActive = false;
            background = new Sprite({
                position: {x: 0, y: 0},
                imageSrc: './images/king-and-pigs/img/backgroundLevel6.png',
            });

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
            parsedCollisions = collisionsLevel7.parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 200;
            player.position.y = 318;

            if (player.currentAnimation) player.currentAnimation.isActive = false;
            background = new Sprite({
                position: {x: 0, y: 0},
                imageSrc: './images/king-and-pigs/img/backgroundLevel7.png',
            });

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
            parsedCollisions = collisionsLevel8.parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 750;
            player.position.y = 318;

            if (player.currentAnimation) player.currentAnimation.isActive = false;
            background = new Sprite({
                position: {x: 0, y: 0},
                imageSrc: './images/king-and-pigs/img/backgroundLevel8.png',
            });

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
            parsedCollisions = collisionsLevel9.parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 200;
            player.position.y = 318;

            if (player.currentAnimation) player.currentAnimation.isActive = false;
            background = new Sprite({
                position: {x: 0, y: 0},
                imageSrc: './images/king-and-pigs/img/backgroundLevel9.png',
            });

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
            parsedCollisions = collisionsLevel10.parse2D();
            collisionBlocks = parsedCollisions.createObjectFrom2D();
            player.collisionBlocks = collisionBlocks;
            player.position.x = 750;
            player.position.y = 318;

            if (player.currentAnimation) player.currentAnimation.isActive = false;
            background = new Sprite({
                position: {x: 0, y: 0},
                imageSrc: './images/king-and-pigs/img/backgroundLevel10.png',
            });

            doors = [
                new Sprite({
                    position: {x: 189, y: 340},
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