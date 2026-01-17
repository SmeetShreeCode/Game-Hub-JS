/* ===============================
   GAME CONSTANTS
================================ */

const GAME = {
    WIDTH: 420,
    HEIGHT: 720,

    BALL: {
        RADIUS: 8,
        BOUNCE: 0.6,
        FRICTION: 0.01,
        DENSITY: 0.002
    },

    GLASS: {
        WIDTH: 100,
        HEIGHT: 120,
        WALL: 12
    },

    GUIDE: {
        LENGTH: 260,
        THICKNESS: 18,
        ANGLE: 35,
        OFFSET_X: 153,
        OFFSET_Y: 8,
    },
    RING: {
        RADIUS: 140,
        THICKNESS: 18,
        GAP_ANGLE: 60,      // opening size in degrees
        SEGMENTS: 60        // more = smoother physics
    },
    GRAVITY: 1.2,
    CONTROL: {
        ROTATE_SPEED: 0.04,
        DRAG_ROTATE_FACTOR: 0.005
    },
};

/* ===============================
   BOOT SCENE
================================ */

class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        this.scene.start('GameScene');
    }
}

/* ===============================
   GAME SCENE
================================ */

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.score = 0;
        this.rings = [];

        /* World bounds */
        this.matter.world.setBounds(0, 0, GAME.WIDTH, GAME.HEIGHT);

        /* Score UI */
        this.scoreText = this.add.text(
            GAME.WIDTH / 2,
            40,
            '0',
            { font: '26px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);

        /* Glass + Guides */
        this.createGlass();
        this.createGuides();

        this.createRing(
            GAME.WIDTH / 2,
            GAME.HEIGHT / 2 - 80,
            {
                ...GAME.RING,
                lines: [
                    {
                        // angle: Phaser.Math.DegToRad(270),
                        // from: 100 + 14 / 2,
                        // to: 140 - 18 / 2,
                        angle: Phaser.Math.DegToRad(260), from: 130, to: 100,
                        thickness: 8
                    }
                ]
            }
        );

        this.createRing(
            GAME.WIDTH / 2,
            GAME.HEIGHT / 2 - 80,
            { ...GAME.RING, RADIUS: 80, THICKNESS: 14 }
        );


        /* 🔥 THIS WAS MISSING */
        this.setupRingRotation();

        /* Drop ball */
        this.input.on('pointerdown', (pointer) => {
            this.dropBall(pointer.x);
        });
    }

    /* ===============================
    ROTATABLE RING (COMPOUND BODY)
    ================================ */

    createRing(cx, cy, ringConfig) {

        const { RADIUS, THICKNESS, GAP_ANGLE, SEGMENTS } = ringConfig;

        /* ---------- VISUAL ---------- */

        const graphics = this.add.graphics();
        graphics.x = cx;
        graphics.y = cy;

        const startAngle = Phaser.Math.DegToRad(90 + GAP_ANGLE / 2);
        const endAngle   = Phaser.Math.DegToRad(450 - GAP_ANGLE / 2);

        /* ---------- PHYSICS ---------- */

        const bodies = [];

// 🔴 ONE TRUE RADIUS (USED EVERYWHERE)
        const midRadius = RADIUS - THICKNESS / 2;

        const arcLength = endAngle - startAngle;
        const step = arcLength / SEGMENTS;

        for (let i = 0; i < SEGMENTS; i++) {

            const angle = startAngle + step * i + step / 2;

            const x = Math.cos(angle) * midRadius;
            const y = Math.sin(angle) * midRadius;

            bodies.push(
                this.matter.bodies.rectangle(
                    x,
                    y,
                    step * midRadius,
                    THICKNESS,
                    {
                        angle: angle + Math.PI / 2,
                        chamfer: 2
                    }
                )
            );
        }

        /* ---------- CONNECTOR LINE PHYSICS ---------- */

        if (ringConfig.lines) {

            ringConfig.lines.forEach(line => {

                const length = line.to - line.from;
                const midLineRadius = (line.from + line.to) / 2 - THICKNESS / 2;

                const x = Math.cos(line.angle) * midLineRadius;
                const y = Math.sin(line.angle) * midLineRadius;

                bodies.push(
                    this.matter.bodies.rectangle(
                        x,
                        y,
                        length,
                        line.thickness,
                        {
                            angle: line.angle
                        }
                    )
                );
            });
        }

        const body = this.matter.body.create({
            parts: bodies,
            isStatic: true
        });

        this.matter.body.setCentre(body, { x: 0, y: 0 }, false);
        this.matter.body.setPosition(body, { x: cx, y: cy });
        this.matter.world.add(body);

        /* ---------- RING OBJECT ---------- */

        const ring = {
            body,
            graphics,
            startAngle,
            endAngle,
            rotation: 0,
            config: ringConfig,
            lines: ringConfig.lines || [],
        };


        this.drawRing(ring);
        this.rings.push(ring);
    }


    drawRing(ring) {

        const { graphics, startAngle, endAngle, rotation, config, lines } = ring;

        graphics.clear();

        /* 🔴 RING ARC */
        graphics.lineStyle(config.THICKNESS, 0xff8fb1, 1);
        graphics.beginPath();
        const midRadius = config.RADIUS - config.THICKNESS / 2;

        graphics.arc(
            0,
            0,
            midRadius,
            startAngle + rotation,
            endAngle + rotation,
            false
        );

        graphics.strokePath();

        /* 🔵 CONNECTOR LINES */
        graphics.lineStyle(6, 0xffffff, 1);

        lines.forEach(line => {

            const a = line.angle + rotation;

            const r1 = line.from - config.THICKNESS / 2;
            const r2 = line.to   - config.THICKNESS / 2;

            const x1 = Math.cos(a) * r1;
            const y1 = Math.sin(a) * r1;

            const x2 = Math.cos(a) * r2;
            const y2 = Math.sin(a) * r2;

            graphics.beginPath();
            graphics.moveTo(x1, y1);
            graphics.lineTo(x2, y2);
            graphics.strokePath();
        });
    }



    setupRingRotation() {

        /* Keyboard */
        this.keys = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            d: Phaser.Input.Keyboard.KeyCodes.D
        });

        /* Drag / Swipe */
        this.isDragging = false;
        this.lastPointerX = 0;

        this.input.on('pointerdown', (p) => {
            this.isDragging = true;
            this.lastPointerX = p.x;
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        this.input.on('pointermove', (p) => {
            if (!this.isDragging) return;

            const dx = p.x - this.lastPointerX;
            this.lastPointerX = p.x;

            this.rotateRing(dx * GAME.CONTROL.DRAG_ROTATE_FACTOR);
        });
    }

    rotateRing(amount) {

        this.rings.forEach(ring => {

            ring.rotation += amount;

            this.matter.body.setAngle(
                ring.body,
                ring.rotation
            );

            this.drawRing(ring);
        });
    }

    update() {
        if (!this.keys) return;

        const speed = GAME.CONTROL.ROTATE_SPEED;

        if (this.keys.left.isDown || this.keys.a.isDown) {
            this.rotateRing(-speed);
        }

        if (this.keys.right.isDown || this.keys.d.isDown) {
            this.rotateRing(speed);
        }
    }


    /* ===============================
       DROP BALL
    ================================ */

    dropBall(x) {
        const body = this.matter.add.circle(
            x,
            80,
            GAME.BALL.RADIUS,
            {
                restitution: GAME.BALL.BOUNCE,
                friction: GAME.BALL.FRICTION,
                density: GAME.BALL.DENSITY
            }
        );

        const gfx = this.add.graphics();
        gfx.fillStyle(0xffffff, 1);
        gfx.fillCircle(0, 0, GAME.BALL.RADIUS);

        const ball = this.add.container(x, 80, [gfx]);
        this.matter.add.gameObject(ball, body);

        /* Collision check */
        this.matter.world.once('collisionstart', (event) => {
            event.pairs.forEach(pair => {
                if (pair.bodyB === this.glassBottom || pair.bodyA === this.glassBottom) {
                    this.addScore();
                }
            });
        });
    }

    /* ===============================
       GLASS
    ================================ */

    createGlass() {
        const cx = GAME.WIDTH / 2;
        const bottomY = GAME.HEIGHT - 80;

        const {WIDTH, HEIGHT, WALL} = GAME.GLASS;

        // Left wall
        this.matter.add.rectangle(
            cx - WIDTH / 2,
            bottomY - HEIGHT / 2,
            WALL,
            HEIGHT,
            {isStatic: true}
        );

        // Right wall
        this.matter.add.rectangle(
            cx + WIDTH / 2,
            bottomY - HEIGHT / 2,
            WALL,
            HEIGHT,
            {isStatic: true}
        );

        // Bottom
        this.glassBottom = this.matter.add.rectangle(
            cx,
            bottomY,
            WIDTH,
            WALL,
            {isStatic: true}
        );

        // Visual
        const g = this.add.graphics();
        g.lineStyle(4, 0x4f8cff, 1);
        g.strokeRoundedRect(
            cx - WIDTH / 2,
            bottomY - HEIGHT,
            WIDTH,
            HEIGHT,
            16
        );
    }

    /* ===============================
        GUIDE LINES (PERFECTLY ALIGNED)
    ================================ */

    createGuides() {
        const cx = GAME.WIDTH / 2;
        const topY = (GAME.HEIGHT - 280) + GAME.GUIDE.OFFSET_Y;

        const length = GAME.GUIDE.LENGTH;
        const thickness = GAME.GUIDE.THICKNESS;
        const angleDeg = GAME.GUIDE.ANGLE;
        const angleRad = Phaser.Math.DegToRad(angleDeg);

        const offsetX = GAME.GUIDE.OFFSET_X;

        // LEFT GUIDE (PHYSICS)
        this.createGuide(
            cx - offsetX,
            topY,
            length,
            thickness,
            angleRad
        );

        // RIGHT GUIDE (PHYSICS)
        this.createGuide(
            cx + offsetX,
            topY,
            length,
            thickness,
            -angleRad
        );
    }

    createGuide(cx, cy, length, thickness, angle) {

        // Physics body
        this.matter.add.rectangle(
            cx,
            cy,
            length,
            thickness,
            {
                isStatic: true,
                angle: angle
            }
        );

        // Visual line — derived from SAME math
        const half = length / 2;

        const x1 = cx - Math.cos(angle) * half;
        const y1 = cy - Math.sin(angle) * half;

        const x2 = cx + Math.cos(angle) * half;
        const y2 = cy + Math.sin(angle) * half;

        const g = this.add.graphics();
        g.lineStyle(10, 0xffffff, 1);

        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.strokePath();
    }

    /* ===============================
       SCORE
    ================================ */

    addScore() {
        this.score++;
        this.scoreText.setText(this.score);
    }
}

/* ===============================
   PHASER CONFIG
================================ */

const config = {
    type: Phaser.AUTO,
    width: GAME.WIDTH,
    height: GAME.HEIGHT,
    parent: 'game-container',
    backgroundColor: '#0b1220',
    physics: {
        default: 'matter',
        matter: {
            gravity: {y: GAME.GRAVITY},
            debug: true
        }
    },
    scene: [BootScene, GameScene]
};

new Phaser.Game(config);
