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
    BOX_H: 620
};

const FRUITS = [
    { key: 'apple', r: 22, score: 1 },
    { key: 'orange', r: 26, score: 3 },
    { key: 'lemon', r: 30, score: 6 },
    { key: 'lime', r: 34, score: 10 },
    { key: 'peach', r: 38, score: 15 },
    { key: 'plum', r: 44, score: 21 },
    { key: 'strawberry', r: 50, score: 28 },
    { key: 'watermelon', r: 60, score: 36 }
];

/* =====================
   PRELOAD
===================== */
class PreloadScene extends Phaser.Scene {
    constructor() { super('Preload'); }

    preload() {
        FRUITS.forEach(f => {
            this.load.image(f.key, `images/fruit-basket/${f.key}.png`);
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
    constructor() { super('Game'); }

    create() {
        this.score = 0;
        this.canDrop = true;
        this.current = null;
        this.gameOver = false;
        this.merging = new Set(); // Track fruits currently merging

        this.matter.world.setGravity(0, 1.2);

        this.drawContainerFrame();

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

    safeDestroy(obj) {
        if (!obj || !obj.body) return;

        // Remove body safely from Matter
        this.matter.world.remove(obj.body);
        obj.body = null;

        // Destroy on next frame
        this.time.delayedCall(0, () => {
            if (obj && obj.destroy) obj.destroy();
        });
    }

    /* =====================
       CONTAINER FRAME
    ===================== */
    drawContainerFrame() {
        const bg = this.add.graphics();
        bg.fillStyle(0x2a2a2a, 1);
        bg.fillRoundedRect(GAME.BOX_X + 4, GAME.BOX_Y + 4, GAME.BOX_W - 8, GAME.BOX_H - 8, 18);
        bg.setDepth(0);

        const frame = this.add.graphics();
        frame.lineStyle(4, 0xffffff);
        frame.strokeRoundedRect(GAME.BOX_X, GAME.BOX_Y, GAME.BOX_W, GAME.BOX_H, 22);
        frame.setDepth(20);

        const left = GAME.BOX_X + 10;
        const right = GAME.BOX_X + GAME.BOX_W - 10;
        const bottom = GAME.BOX_Y + GAME.BOX_H;

        this.bounds = { left, right };

        this.matter.add.rectangle(left, 450, 20, 900, { isStatic: true, label: 'wall' });
        this.matter.add.rectangle(right, 450, 20, 900, { isStatic: true, label: 'wall' });
        this.matter.add.rectangle(GAME.W / 2, bottom, GAME.W, 20, { isStatic: true, label: 'floor' });
        this.matter.add.rectangle(left - 10, 450, 40, 900, { isStatic: true });
        this.matter.add.rectangle(right + 10, 450, 40, 900, { isStatic: true });

        const g = this.add.graphics();
        g.lineStyle(2, 0xff4444);
        for (let x = left; x < right; x += 18) {
            g.lineBetween(x, GAME.DANGER_Y, x + 10, GAME.DANGER_Y);
        }
        g.setDepth(15);
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
    }

    createGuide() {
        this.guide = this.add.graphics().setDepth(10);
    }

    /* =====================
       INPUT
    ===================== */
    setupInput() {
        this.input.on('pointermove', p => {
            if (!this.current || !this.canDrop || this.gameOver) return;

            const r = FRUITS[this.current.type].r;
            const x = Phaser.Math.Clamp(p.x, this.bounds.left + r, this.bounds.right - r);
            this.current.setPosition(x, GAME.SPAWN_Y);

            this.guide.clear();
            this.guide.lineStyle(2, 0xffffff, 0.35);
            for (let y = GAME.SPAWN_Y; y < GAME.H - 120; y += 14) {
                this.guide.lineBetween(x, y + r, x, y + r + 7);
            }
        });

        this.input.on('pointerdown', () => {
            if (!this.current || !this.canDrop || this.gameOver) return;

            this.current.setIgnoreGravity(false);
            this.current.setDepth(5);
            this.canDrop = false;
            this.guide.clear();

            this.time.delayedCall(450, () => this.spawnFruit());
        });
    }

    /* =====================
       SPAWN FRUIT
    ===================== */
    spawnFruit() {
        if (this.gameOver) return;

        const type = this.queue.shift();
        this.queue.push(Phaser.Math.Between(0, 2));

        const f = FRUITS[type];

        this.current = this.matter.add.image(
            GAME.W / 2,
            GAME.SPAWN_Y,
            f.key,
            null,
            {
                shape: { type: 'circle', radius: f.r },
                restitution: 0.25,
                friction: 0.4,
                density: 0.001
            }
        );

        // 🔑 AUTO SCALE IMAGE TO PHYSICS SIZE
        const scale = (f.r * 2) / this.current.width;
        this.current.setScale(scale);

        this.current.type = type;
        this.current.setData('fruit', true);
        this.current.setDepth(10);

        this.current.setIgnoreGravity(true);
        this.current.setVelocity(0, 0);

        this.canDrop = true;

        this.nextIcons.forEach((img, i) =>
            img.setTexture(FRUITS[this.queue[i]].key)
        );
    }

    /* =====================
       MERGE LOGIC
    ===================== */
    handleMerge(e) {
        if (this.gameOver) return;

        e.pairs.forEach(p => {
            const a = p.bodyA.gameObject;
            const b = p.bodyB.gameObject;

            if (!a || !b) return;
            if (!a.scene || !b.scene) return;
            if (a.type === undefined || b.type === undefined) return;
            if (a.type !== b.type) return;
            if (a._merged || b._merged) return;

            const nt = a.type + 1;
            if (!FRUITS[nt]) return;

            a._merged = true;
            b._merged = true;

            const x = (a.x + b.x) / 2;
            const y = (a.y + b.y) / 2;

            this.tweens.add({
                targets: [a, b],
                scale: 0,
                alpha: 0,
                duration: 150,
                onComplete: () => {
                    this.safeDestroy(a);
                    this.safeDestroy(b);
                }
            });

            this.time.delayedCall(100, () => {
                const f = FRUITS[nt];
                const m = this.matter.add.image(x, y, f.key, null, {
                    shape: { type: 'circle', radius: f.r },
                    restitution: 0.3,
                    friction: 0.5,
                    density: 0.001
                });

                const scale = (f.r * 2) / m.width;
                m.setScale(scale * 0.5); // start small
                m.type = nt;
                m.setDepth(5);

                this.tweens.add({
                    targets: m,
                    scale: scale,
                    duration: 200,
                    ease: 'Back.easeOut'
                });

                this.score += f.score;
                this.scoreText.setText(`Score: ${this.score}`);
            });
        });
    }


    update() {
        if (this.gameOver) return;

        // Check all settled fruits
        this.matter.world.getAllBodies().forEach(b => {
            const o = b.gameObject;
            if (!o || !o.getData('fruit')) return;
            if (b.isStatic) return;
            if (o === this.current) return;
            if (this.merging.has(o)) return; // Don't check merging fruits

            // Check if fruit has settled (low velocity)
            if (Math.abs(b.velocity.y) > 0.3 || Math.abs(b.velocity.x) > 0.3) return;

            const top = b.position.y - FRUITS[o.type].r;
            if (top < GAME.DANGER_Y) {
                this.endGame();
            }
        });
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
            .setInteractive({ useHandCursor: true })
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
            gravity: { y: 1.2 },
            enableSleep: true,   // ✅ FIXED
            debug: false
        }
    },
    scene: [PreloadScene, GameScene]
});