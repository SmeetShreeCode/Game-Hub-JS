/* =====================
      CONSTANTS
   ===================== */
const GAME = {
    W: 450,
    H: 800,
    SPAWN_Y: 150,
    DANGER_Y: 210,
    BOX_X: 30,
    BOX_Y: 110,
    BOX_W: 390,
    BOX_H: 620,
    BOX_RADIUS: 22,     // rounded corner radius
    BOX_THICK: 8,       // white border thickness
    DANGER_LINE_THICK: 4,       // red line thickness
    DANGER_TIME_LIMIT: 7,       // ⏱ seconds allowed above danger line

    // ⚡ Collision lines
    WALL_LEFT_OFFSET: -6,
    WALL_RIGHT_OFFSET: -6,
    WALL_THICKNESS: 20,

    FLOOR_OFFSET: -6,        // ⬆ move floor UP (+) or DOWN (-)
    FLOOR_THICKNESS: 20
};

const FRUITS = [
    {key: 'happiness', scale: 0.6, radius: 31, score: 1},
    {key: 'happy', scale: 0.7, radius: 31, score: 3},
    {key: 'laughing', scale: 0.8, radius: 31, score: 6},
    {key: 'surprised', scale: 0.9, radius: 31, score: 10},
    {key: 'crazy', scale: 1.0, radius: 31, score: 15},
    {key: 'disgusted', scale: 1.1, radius: 31, score: 21},
    {key: 'annoyed', scale: 1.2, radius: 31, score: 28},
    {key: 'hurted', scale: 1.3, radius: 31, score: 36},
    {key: 'crying', scale: 1.4, radius: 31, score: 45},
    {key: 'mute', scale: 1.5, radius: 31, score: 55},
    {key: 'angry-face', scale: 1.6, radius: 31, score: 66},
    {key: 'cool', scale: 1.7, radius: 31, score: 78},
];

const EFFECTS = {
    SHAKE_INTENSITY: 0.008,
    SHAKE_DURATION: 180,
    BIG_MERGE_FROM: 5, // peach+

    // ⚡ Particle constants
    PARTICLE_LIFESPAN: 200,
    PARTICLE_QUANTITY: 5,
    PARTICLE_SPEED_MIN: 80,
    PARTICLE_SPEED_MAX: 100,
    PARTICLE_DEPTH: 25,     // Background=0, Fruits (falling)=5-10, Danger line=15, Pop particles=25, UI/Score=30+, Game over=40+
    PARTICLE_CLEANUP_DELAY: 300,
};

const COLORS = {
    containerBg: 0x22c55e,
    containerBorder: 0xffffff,
    dangerLine: 0xff4444
};

/* =====================
   PRELOAD
===================== */
class PreloadScene extends Phaser.Scene {
    constructor() {
        super('Preload');
    }

    preload() {
        FRUITS.forEach(f => {
            this.load.image(f.key, `images/emoji-merge/${f.key}.webp`);
        });
    }

    create() {
        this.scene.start('Game');
    }
}

/* =====================
   GAME SCENE
===================== */
class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.score = 0;
        this.canDrop = true;
        this.current = null;
        this.gameOver = false;
        this.merging = new Set(); // Track fruits currently merging
        this.dangerTimer = 0;      // how long fruit is touching danger line
        this.dangerActive = false;
        this.maxUnlockedFruit = 2;

        this.matter.world.setGravity(0, 1.2);

        // ✅ ADD THESE TWO LINES HERE
        this.input.setPollAlways();
        this.input.mouse.disableContextMenu();

        this.drawContainerFrame();
        this.createContainerMask();
        this.createParticleTexture();

        this.queue = [
            Phaser.Math.Between(0, 2),
            Phaser.Math.Between(0, 2),
            Phaser.Math.Between(0, 2)
        ];

        this.createUI();
        this.createGuide();
        this.setupInput();

        this.matter.world.on('collisionstart', this.handleMerge, this);

        this.spawnFruit();
    }

    setFruitSize(gameObject, scale) {
        if (!gameObject) return;

        const fruitData = FRUITS[gameObject.type];

        // Visual scale
        gameObject.setScale(scale);

        // ✅ MANUAL radius (scaled properly)
        const baseRadius = fruitData.radius;
        const radius = baseRadius * scale;

        // Remove old body
        if (gameObject.body) {
            this.matter.world.remove(gameObject.body);
        }

        // Create perfect circle collider
        const body = this.matter.bodies.circle(
            gameObject.x,
            gameObject.y,
            radius,
            {
                restitution: 0.25,
                friction: 0.4,
                density: 0.001
            }
        );

        this.matter.world.add(body);
        gameObject.setExistingBody(body);
    }

    safeDestroy(obj) {
        if (!obj || obj._destroying) return;
        obj._destroying = true;

        // Kill tweens first
        this.tweens.killTweensOf(obj);

        this.time.delayedCall(0, () => {
            if (obj.body) {
                this.matter.world.remove(obj.body);
                obj.body = null;
            }
            if (obj.destroy) obj.destroy();
        });
    }

    /* =====================
       CONTAINER FRAME
    ===================== */
    drawContainerFrame() {
        const bg = this.add.graphics();
        bg.fillStyle(COLORS.containerBg, 1);
        bg.fillRoundedRect(GAME.BOX_X + 4, GAME.BOX_Y + 4, GAME.BOX_W - 8, GAME.BOX_H - 8, 18);
        bg.setDepth(0);

        const frame = this.add.graphics();
        frame.lineStyle(GAME.BOX_THICK, COLORS.containerBorder);
        frame.strokeRoundedRect(GAME.BOX_X, GAME.BOX_Y, GAME.BOX_W, GAME.BOX_H, GAME.BOX_RADIUS);
        frame.setDepth(20);

        const left = GAME.BOX_X + GAME.WALL_LEFT_OFFSET;
        const right = GAME.BOX_X + GAME.BOX_W - GAME.WALL_RIGHT_OFFSET;
        // ⬇️ Adjustable floor position
        const bottom = GAME.BOX_Y + GAME.BOX_H - GAME.FLOOR_OFFSET;

        this.bounds = { left, right };

        // Side walls
        this.matter.add.rectangle(left, GAME.H / 2, GAME.WALL_THICKNESS, GAME.H, { isStatic: true, label: 'wall' });
        this.matter.add.rectangle(right, GAME.H / 2, GAME.WALL_THICKNESS, GAME.H, { isStatic: true, label: 'wall' });

        // 🔵 Bottom floor (adjustable)
        this.matter.add.rectangle(GAME.W / 2, bottom, GAME.W, GAME.FLOOR_THICKNESS, { isStatic: true, label: 'floor' });

        this.dangerGraphics = this.add.graphics();
        this.dangerGraphics.setMask(this.containerMask); // ✅ CLIP INSIDE BOX
        this.dangerGraphics.lineStyle(GAME.DANGER_LINE_THICK, COLORS.dangerLine);

        const lineLeft  = GAME.BOX_X + GAME.BOX_THICK;
        const lineRight = GAME.BOX_X + GAME.BOX_W - GAME.BOX_THICK;

        for (let x = lineLeft; x < lineRight; x += 18) {
            this.dangerGraphics.lineBetween(
                x,
                GAME.DANGER_Y,
                x + 10,
                GAME.DANGER_Y
            );
        }

        this.dangerGraphics.setDepth(15);
    }

    createContainerMask() {
        const maskGfx = this.make.graphics({ x: 0, y: 0, add: false });

        maskGfx.fillStyle(0xffffff);
        maskGfx.fillRect(
            GAME.BOX_X + GAME.BOX_THICK / 2,
            GAME.BOX_Y + GAME.BOX_THICK / 2,
            GAME.BOX_W - GAME.BOX_THICK,
            GAME.BOX_H - GAME.BOX_THICK
        );

        this.containerMask = maskGfx.createGeometryMask();
    }

    /* =====================
       UI
    ===================== */
    createUI() {
        this.scoreText = this.add.text(20, 25, 'Score: 0', {
            fontSize: '26px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setDepth(30);

        this.nextIcons = [];
        const startX = GAME.W - 130;

        for (let i = 0; i < 3; i++) {
            const img = this.add.image(
                startX + i * 45,
                55,
                FRUITS[this.queue[i]].key
            ).setScale(0.35).setDepth(30);

            this.nextIcons.push(img);
        }
        this.dangerText = this.add.text(
            GAME.W / 2,
            GAME.DANGER_Y - 30,
            '',
            { fontSize: '20px', color: '#ff4444', fontStyle: 'bold' }
        ).setOrigin(0.5).setDepth(30);

    }

    createGuide() {
        this.guide = this.add.graphics().setDepth(10);
    }

    /* =====================
       INPUT
    ===================== */
    setupInput() {
        let startX = 0;
        let moved = false;

        this.input.on('pointerdown', (p) => {
            if (!this.current || !this.canDrop || this.gameOver) return;

            startX = p.x;
            moved = false;

            this.updateFruitPosition(p);
        });

        this.input.on('pointermove', (p) => {
            if (!this.current || !this.canDrop || this.gameOver) return;

            // Detect real drag
            if (Math.abs(p.x - startX) > 5) {
                moved = true;
            }

            this.updateFruitPosition(p);
        });

        this.input.on('pointerup', () => {
            if (!this.current || !this.canDrop || this.gameOver) return;

            // ✅ ONLY DROP IF IT WAS A TAP (not a drag)
            if (!moved) {
                this.dropCurrentFruit();
            }
        });
    }

    dropCurrentFruit() {
        if (!this.current) return;

        this.current.setIgnoreGravity(false);
        this.current.setDepth(5);

        this.canDrop = false;
        this.guide.clear();

        this.time.delayedCall(450, () => this.spawnFruit());
    }


    updateFruitPosition(pointer) {
        const fruitData = FRUITS[this.current.type];
        if (!fruitData) return;

        const r = this.current.displayWidth / 2;
        const x = Phaser.Math.Clamp(
            pointer.x,
            this.bounds.left + r,
            this.bounds.right - r
        );

        this.current.setPosition(x, GAME.SPAWN_Y);

        // Guide line
        this.guide.clear();
        this.guide.lineStyle(2, 0xffffff, 0.35);
        for (let y = GAME.SPAWN_Y; y < GAME.H - 120; y += 14) {
            this.guide.lineBetween(x, y + r, x, y + r + 7);
        }
    }

    /* =====================
       SPAWN FRUIT
    ===================== */
    spawnFruit() {
        if (this.gameOver) return;

        const type = this.queue.shift();
        this.queue.push(Phaser.Math.Between(0, this.getSpawnRange()));

        const f = FRUITS[type];

        this.current = this.matter.add.image(
            GAME.W / 2,
            GAME.SPAWN_Y,
            f.key
        );

        this.current.type = type;
        this.current.setData('fruit', true);
        this.current.setDepth(10);

        this.setFruitSize(this.current, f.scale);

        // ✅ Correct drag state
        this.current.setIgnoreGravity(true);
        this.current.setVelocity(0, 0);
        this.current.setAngularVelocity(0);

        this.canDrop = true;

        this.nextIcons.forEach((img, i) =>
            img.setTexture(FRUITS[this.queue[i]].key)
        );
    }

    /* =====================
       MERGE LOGIC
    ===================== */
    handleMerge(event) {
        if (this.gameOver) return;

        event.pairs.forEach(pair => {
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;

            if (!bodyA || !bodyB) return;

            const a = bodyA.gameObject;
            const b = bodyB.gameObject;

            // 🛑 HARD NULL GUARDS (ORDER MATTERS)
            if (!a || !b) return;
            if (!a.body || !b.body) return;
            if (a._destroying || b._destroying) return;
            if (!a.scene || !b.scene) return;

            // Must be fruits
            if (a.type === undefined || b.type === undefined) return;
            if (a.type !== b.type) return;

            // Already merged
            if (a._merged || b._merged) return;

            const nextType = a.type + 1;
            this.maxUnlockedFruit = Math.max(this.maxUnlockedFruit, nextType);
            if (!FRUITS[nextType]) return;

            // Mark merged
            a._merged = true;
            b._merged = true;

            this.merging.add(a);
            this.merging.add(b);

            const x = (a.x + b.x) / 2;
            const y = (a.y + b.y) / 2;

            // ✨ Pop particles
            this.popEffect(x, y, Phaser.Display.Color.RandomRGB().color, nextType);

            // Merge animation
            [a, b].forEach(obj => {
                if (!obj || !obj.body) return;

                this.tweens.add({
                    targets: obj,
                    alpha: 0,
                    duration: 120,
                    onComplete: () => this.safeDestroy(obj)
                });
            });

            // Spawn new fruit AFTER physics step
            this.time.delayedCall(120, () => {
                if (this.gameOver) return;

                const f = FRUITS[nextType];

                const m = this.matter.add.image(x, y, f.key);
                m.type = nextType;
                m.setData('fruit', true);
                m.setDepth(5);

                // start smaller
                this.setFruitSize(m, f.scale * 0.6);

                // grow animation (image + physics synced)
                this.tweens.add({
                    targets: m,
                    scale: f.scale,
                    duration: 200,
                    ease: 'Back.easeOut',
                    onUpdate: () => {
                        this.setFruitSize(m, m.scale);
                    }
                });


                this.score += f.score;
                this.scoreText.setText(`Score: ${this.score}`);
            });

            // 📳 Screen shake on big merge
            if (nextType >= EFFECTS.BIG_MERGE_FROM) {
                this.cameras.main.shake(
                    EFFECTS.SHAKE_DURATION,
                    EFFECTS.SHAKE_INTENSITY
                );
            }
        });
    }

    getSpawnRange() {
        // Increase spawn range gradually
        if (this.maxUnlockedFruit >= 10) return 6;
        if (this.maxUnlockedFruit >= 8)  return 5;
        if (this.maxUnlockedFruit >= 6)  return 4;
        if (this.maxUnlockedFruit >= 3)  return 3;
        return 2; // default (first 3 fruits)
    }

    createParticleTexture() {
        const g = this.make.graphics({x: 0, y: 0, add: false});
        g.fillStyle(0xffffff, 1);
        g.fillCircle(4, 4, 4);
        g.generateTexture('popParticle', 8, 8);
        g.destroy();
    }

    popEffect(x, y, color = 0xffffff, power = 1) {
        power = Phaser.Math.Clamp(power, 1, 6);

        const emitter = this.add.particles(x, y, 'popParticle', {
            speed: {
                min: EFFECTS.PARTICLE_SPEED_MIN + power * 40,
                max: EFFECTS.PARTICLE_SPEED_MAX + power * 80
            },
            angle: { min: 0, max: 360 },
            scale: { start: 0.8 + power * 0.15, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: EFFECTS.PARTICLE_LIFESPAN + power * 80,
            quantity: EFFECTS.PARTICLE_QUANTITY + power * 4,
            gravityY: 200 + power * 80,
            tint: color,
            blendMode: 'ADD'
        });
        emitter.setDepth(EFFECTS.PARTICLE_DEPTH);
        // Cleanup
        this.time.delayedCall(EFFECTS.PARTICLE_CLEANUP_DELAY + power * 80, () => emitter.destroy());
    }

    update() {
        if (this.gameOver) return;

        const bodies = this.matter.world.getAllBodies();
        let touchingDanger = false;

        for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i];

            // Hard guards
            if (!b || b.isStatic) continue;
            if (!b.gameObject) continue;

            const o = b.gameObject;

            if (!o.active) continue;
            if (!o.getData || !o.getData('fruit')) continue;
            if (o === this.current) continue;
            if (o._merged) continue;

            // ✅ USE MATTER BODY BOUNDS (MOST IMPORTANT FIX)
            const top = b.bounds.min.y;

            if (top <= GAME.DANGER_Y) {
                touchingDanger = true;
                break;
            }
        }

        // ⏱ Danger timer logic
        if (touchingDanger) {
            this.dangerActive = true;
            this.dangerTimer += this.game.loop.delta / 1000;

            if (this.dangerTimer >= GAME.DANGER_TIME_LIMIT) {
                this.endGame();
                return;
            }
        } else {
            this.dangerActive = false;
            this.dangerTimer = 0;
        }

        // 🔴 Danger line blinking
        if (this.dangerGraphics) {
            this.dangerGraphics.alpha = this.dangerActive
                ? 0.4 + Math.sin(this.time.now * 0.02) * 0.6
                : 1;
        }

        // ⏱ Countdown text
        if (this.dangerText) {
            if (this.dangerActive) {
                const left = Math.ceil(GAME.DANGER_TIME_LIMIT - this.dangerTimer);
                this.dangerText.setText(`⚠ ${left}s`);
            } else {
                this.dangerText.setText('');
            }
        }
    }

    endGame() {
        if (this.gameOver) return;
        this.gameOver = true;
        this.canDrop = false;

        // Save high score
        const highScore = localStorage.getItem('fruitMergeHighScore') || 0;
        if (this.score > highScore) {
            localStorage.setItem('fruitMergeHighScore', this.score);
        }

        // Dark overlay
        this.add.rectangle(0, 0, GAME.W, GAME.H, 0x000000, 0.8).setOrigin(0).setDepth(40);

        // Game Over panel
        this.add.rectangle(GAME.W / 2, GAME.H / 2, 360, 340, 0xffffff).setOrigin(0.5).setDepth(41);

        this.add.text(GAME.W / 2, GAME.H / 2 - 100, 'GAME OVER', {
            fontSize: '48px',
            color: '#ff4444',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(42);

        this.add.text(GAME.W / 2, GAME.H / 2 - 20, 'Score', {
            fontSize: '22px',
            color: '#666'
        }).setOrigin(0.5).setDepth(42);

        this.add.text(GAME.W / 2, GAME.H / 2 + 25, `${this.score}`, {
            fontSize: '48px',
            color: '#000',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(42);

        this.add.text(GAME.W / 2, GAME.H / 2 + 80, `Best: ${Math.max(this.score, highScore)}`, {
            fontSize: '20px',
            color: '#FFD700'
        }).setOrigin(0.5).setDepth(42);

        // Restart button
        const btn = this.add.rectangle(GAME.W / 2, GAME.H / 2 + 140, 220, 60, 0x4CAF50)
            .setInteractive({useHandCursor: true})
            .setDepth(42);

        this.add.text(GAME.W / 2, GAME.H / 2 + 140, 'Play Again', {
            fontSize: '26px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(42);

        btn.on('pointerover', () => btn.setFillStyle(0x66BB6A));
        btn.on('pointerout', () => btn.setFillStyle(0x4CAF50));
        btn.on('pointerdown', () => {
            this.scene.restart();
        });
    }
}

/* =====================
   CONFIG
===================== */
new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME.W,
    height: GAME.H,
    parent: 'game-container',
    backgroundColor: '#1c1c1c',
    physics: {
        default: 'matter',
        matter: {
            gravity: {y: 1.2},
            enableSleep: true,   // ✅ FIXED
            debug: false,
        }
    },
    scene: [PreloadScene, GameScene]
});