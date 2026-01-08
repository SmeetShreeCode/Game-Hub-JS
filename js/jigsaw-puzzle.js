let puzzle;
let rotEnableElement, playing, restartElement;
let useMouse = true;
let currentLevel = 0;

const mhypot = Math.hypot,
    mrandom = Math.random,
    mmax = Math.max,
    mmin = Math.min,
    mround = Math.round,
    mfloor = Math.floor,
    mceil = Math.ceil,
    msqrt = Math.sqrt,
    mabs = Math.abs;

const DIFFICULTY_PIECES = {
    easy: 12,
    medium: 25,
    hard: 50,
    impossible: 100,
    "never-happened": 200
};
let selectedDifficulty = "easy";

const DIFFICULTIES = [
    "easy",
    "medium",
    "hard",
    "impossible",
    "never-happened"
];
const SAVE_KEY = "jigsaw_puzzle_progress";

function alea(min, max) {
    if (typeof max == 'undefined') return min * mrandom();
    return min + (max - min) * mrandom();
}

function intAlea(min, max) {
    if (typeof max == 'undefined') {
        max = min;
        min = 0;
    }
    return mfloor(min + (max - min) * mrandom());
}

function arrayShuffle(array) {
    let k1, temp;
    for (let k = array.length - 1; k >= 1; --k) {
        k1 = intAlea(0, k + 1);
        temp = array[k];
        array[k] = array[k1];
        array[k1] = temp;
    }
    return array
}

class Modal {
    constructor(properties) {
        let modal = document.createElement("dialog");
        modal.style.borderRadius = "5px";
        if (properties.lines) {
            properties.lines.forEach(line => {
                const p = document.createElement("p");
                p.append(line);
                modal.append(p);
            })
        }
        if (properties?.buttons?.length > 0) {
            const p = document.createElement("p");
            modal.append(p);
            p.style.display = "flex";
            p.style.justifyContent = "center";
            properties.buttons.forEach(buttonObj => {
                const button = document.createElement("button");
                button.setAttribute("type", "button");
                button.style.marginRight = "1em";
                button.style.marginLeft = "1em";
                button.innerText = buttonObj.text || "button";
                p.append(button);
                button.addEventListener("click", () => {
                    modal.remove();
                    modal = null;
                    if (buttonObj.callback) buttonObj.callback();
                });
            })
        } else {
            modal.addEventListener("click", () => {
                modal.remove();
                modal = null;
            })
        }
        document.body.append(modal);
        modal.showModal();
    }
}

class Point {
    constructor(x, y) {
        this.x = Number(x);
        this.y = Number(y);
    }
    copy() {
        return new Point(this.x, this.y);
    }
    distance(otherPoint) {
        return mhypot(this.x - otherPoint.x, this.y - otherPoint.y);
    }
}

class Segment {
    constructor(p1, p2) {
        this.p1 = new Point(p1.x, p1.y);
        this.p2 = new Point(p2.x, p2.y);
    }
    dx() {
        return this.p2.x - this.p1.x;
    }
    dy() {
        return this.p2.y - this.p1.y;
    }
    length() {
        return mhypot(this.dx(), this.dy());
    }
    pointOnRelative(coeff) {
        let dx = this.dx();
        let dy = this.dy();
        return new Point(this.p1.x + coeff * dx, this.p1.y + coeff * dy);
    }
}

class Side {
    constructor() {
        this.type = "";
        this.points = [];
    }
    reversed() {
        const ns = new Side();
        ns.type = this.type;
        ns.points = this.points.slice().reverse();
        return ns;
    }
    scale(puzzle) {
        const coefx = puzzle.scalex;
        const coefy = puzzle.scaley;
        this.scaledPoints = this.points.map(p => new Point(p.x * coefx, p.y * coefy));

    }
    drawPath(ctx, shiftx, shifty, withoutMoveTo) {

        if (!withoutMoveTo) {
            ctx.moveTo(this.scaledPoints[0].x + shiftx, this.scaledPoints[0].y + shifty);
        }
        if (this.type === "d") {
            ctx.lineTo(this.scaledPoints[1].x + shiftx, this.scaledPoints[1].y + shifty);
        } else { // edge zigzag
            for (let k = 1; k < this.scaledPoints.length - 1; k += 3) {
                ctx.bezierCurveTo(this.scaledPoints[k].x + shiftx, this.scaledPoints[k].y + shifty,
                    this.scaledPoints[k + 1].x + shiftx, this.scaledPoints[k + 1].y + shifty,
                    this.scaledPoints[k + 2].x + shiftx, this.scaledPoints[k + 2].y + shifty);
            }
        }
    }
}

function twist0(side, ca, cb) {

    const seg0 = new Segment(side.points[0], side.points[1]);
    const dxh = seg0.dx();
    const dyh = seg0.dy();

    const seg1 = new Segment(ca, cb);
    const mid0 = seg0.pointOnRelative(0.5);
    const mid1 = seg1.pointOnRelative(0.5);

    const segMid = new Segment(mid0, mid1);
    const dxv = segMid.dx();
    const dyv = segMid.dy();

    const scalex = alea(0.8, 1);
    const scaley = alea(0.9, 1);
    const mid = alea(0.45, 0.55);

    const pa = pointAt(mid - 1 / 12 * scalex, 1 / 12 * scaley);
    const pb = pointAt(mid - 2 / 12 * scalex, 3 / 12 * scaley);
    const pc = pointAt(mid, 4 / 12 * scaley);
    const pd = pointAt(mid + 2 / 12 * scalex, 3 / 12 * scaley);
    const pe = pointAt(mid + 1 / 12 * scalex, 1 / 12 * scaley);

    side.points = [seg0.p1,
        new Point(seg0.p1.x + 5 / 12 * dxh * 0.52,
            seg0.p1.y + 5 / 12 * dyh * 0.52),
        new Point(pa.x - 1 / 12 * dxv * 0.72,
            pa.y - 1 / 12 * dyv * 0.72),
        pa,
        new Point(pa.x + 1 / 12 * dxv * 0.72,
            pa.y + 1 / 12 * dyv * 0.72),

        new Point(pb.x - 1 / 12 * dxv * 0.92,
            pb.y - 1 / 12 * dyv * 0.92),
        pb,
        new Point(pb.x + 1 / 12 * dxv * 0.52,
            pb.y + 1 / 12 * dyv * 0.52),
        new Point(pc.x - 2 / 12 * dxh * 0.40,
            pc.y - 2 / 12 * dyh * 0.40),
        pc,
        new Point(pc.x + 2 / 12 * dxh * 0.40,
            pc.y + 2 / 12 * dyh * 0.40),
        new Point(pd.x + 1 / 12 * dxv * 0.52,
            pd.y + 1 / 12 * dyv * 0.52),
        pd,
        new Point(pd.x - 1 / 12 * dxv * 0.92,
            pd.y - 1 / 12 * dyv * 0.92),
        new Point(pe.x + 1 / 12 * dxv * 0.72,
            pe.y + 1 / 12 * dyv * 0.72),
        pe,
        new Point(pe.x - 1 / 12 * dxv * 0.72,
            pe.y - 1 / 12 * dyv * 0.72),
        new Point(seg0.p2.x - 5 / 12 * dxh * 0.52,
            seg0.p2.y - 5 / 12 * dyh * 0.52),
        seg0.p2];
    side.type = "z";

    function pointAt(coeffh, coeffv) {
        return new Point(seg0.p1.x + coeffh * dxh + coeffv * dxv,
            seg0.p1.y + coeffh * dyh + coeffv * dyv)
    }
}

function twist1(side, ca, cb) {

    const seg0 = new Segment(side.points[0], side.points[1]);
    const dxh = seg0.dx();
    const dyh = seg0.dy();

    const seg1 = new Segment(ca, cb);
    const mid0 = seg0.pointOnRelative(0.5);
    const mid1 = seg1.pointOnRelative(0.5);

    const segMid = new Segment(mid0, mid1);
    const dxv = segMid.dx();
    const dyv = segMid.dy();

    const pa = pointAt(alea(0.3, 0.35), alea(-0.05, 0.05));
    const pb = pointAt(alea(0.45, 0.55), alea(0.2, 0.3));
    const pc = pointAt(alea(0.65, 0.78), alea(-0.05, 0.05));

    side.points = [seg0.p1,
        seg0.p1, pa, pa,
        pa, pb, pb,
        pb, pc, pc,
        pc, seg0.p2, seg0.p2];
    side.type = "z";

    function pointAt(coeffh, coeffv) {
        return new Point(seg0.p1.x + coeffh * dxh + coeffv * dxv,
            seg0.p1.y + coeffh * dyh + coeffv * dyv)
    }
}

function twist2(side, ca, cb) {

    const seg0 = new Segment(side.points[0], side.points[1]);
    const dxh = seg0.dx();
    const dyh = seg0.dy();

    const seg1 = new Segment(ca, cb);
    const mid0 = seg0.pointOnRelative(0.5);
    const mid1 = seg1.pointOnRelative(0.5);

    const segMid = new Segment(mid0, mid1);
    const dxv = segMid.dx();
    const dyv = segMid.dy();

    const hmid = alea(0.45, 0.55);
    const vmid = alea(0.4, 0.5)
    const pc = pointAt(hmid, vmid);
    let sega = new Segment(seg0.p1, pc);

    const pb = sega.pointOnRelative(2 / 3);
    sega = new Segment(seg0.p2, pc);
    const pd = sega.pointOnRelative(2 / 3);

    side.points = [seg0.p1, pb, pd, seg0.p2];
    side.type = "z";

    function pointAt(coeffh, coeffv) {
        return new Point(seg0.p1.x + coeffh * dxh + coeffv * dxv,
            seg0.p1.y + coeffh * dyh + coeffv * dyv)
    }
}

function twist3(side, ca, cb) {
    side.points = [side.points[0], side.points[1]];
}

class Piece {
    constructor(kx, ky) {
        this.ts = new Side();
        this.rs = new Side();
        this.bs = new Side();
        this.ls = new Side();
        this.kx = kx;
        this.ky = ky;
    }
    scale(puzzle) {
        this.ts.scale(puzzle);
        this.rs.scale(puzzle);
        this.bs.scale(puzzle);
        this.ls.scale(puzzle);
    }
}

class PolyPiece {
    constructor(initialPiece, puzzle) {
        this.pckxmin = initialPiece.kx;
        this.pckxmax = initialPiece.kx + 1;
        this.pckymin = initialPiece.ky;
        this.pckymax = initialPiece.ky + 1;
        this.pieces = [initialPiece];
        this.puzzle = puzzle;
        this.selected = false;
        this.listLoops();

        this.canvas = document.createElement('CANVAS');
        puzzle.container.appendChild(this.canvas);
        this.canvas.classList.add('polypiece');
        this.ctx = this.canvas.getContext("2d");
        this.rot = 0;
    }

    merge(otherPoly) {

        const orgpckxmin = this.pckxmin;
        const orgpckymin = this.pckymin;
        const pbefore = getTransformed(0, 0, this.nx * puzzle.scalex, this.ny * puzzle.scaley, this.rot);

        const kOther = this.puzzle.polyPieces.indexOf(otherPoly);
        this.puzzle.polyPieces.splice(kOther, 1);

        this.puzzle.container.removeChild(otherPoly.canvas);

        for (let k = 0; k < otherPoly.pieces.length; ++k) {
            this.pieces.push(otherPoly.pieces[k]);
            if (otherPoly.pieces[k].kx < this.pckxmin) this.pckxmin = otherPoly.pieces[k].kx;
            if (otherPoly.pieces[k].kx + 1 > this.pckxmax) this.pckxmax = otherPoly.pieces[k].kx + 1;
            if (otherPoly.pieces[k].ky < this.pckymin) this.pckymin = otherPoly.pieces[k].ky;
            if (otherPoly.pieces[k].ky + 1 > this.pckymax) this.pckymax = otherPoly.pieces[k].ky + 1;
        }

        this.pieces.sort(function (p1, p2) {
            if (p1.ky < p2.ky) return -1;
            if (p1.ky > p2.ky) return 1;
            if (p1.kx < p2.kx) return -1;
            if (p1.kx > p2.kx) return 1;
            return 0;
        });

        this.listLoops();
        this.drawImage();
        const pafter = getTransformed(this.puzzle.scalex * (orgpckxmin - this.pckxmin),
            this.puzzle.scaley * (orgpckymin - this.pckymin),
            this.puzzle.scalex * (this.pckxmax - this.pckxmin + 1),
            this.puzzle.scaley * (this.pckymax - this.pckymin + 1),
            this.rot);

        this.moveTo(this.x - pafter.x + pbefore.x,
            this.y - pafter.y + pbefore.y);
        this.puzzle.evaluateZIndex();

        function getTransformed(orgx, orgy, width, height, rot) {
            const dx = orgx - width / 2;
            const dy = orgy - height / 2;
            return {
                x: width / 2 + [1, 0, -1, 0][rot] * dx + [0, -1, 0, 1][rot] * dy,
                y: height / 2 + [0, 1, 0, -1][rot] * dx + [1, 0, -1, 0][rot] * dy
            }
        }
    }

    ifNear(otherPoly) {
        if (this.rot !== otherPoly.rot) return false;

        let p1, p2;
        let puzzle = this.puzzle;

        let org = this.getOrgP();
        let orgOther = otherPoly.getOrgP();

        if (mhypot(org.x - orgOther.x, org.y - orgOther.y) >= puzzle.dConnect) return false;

        for (let k = this.pieces.length - 1; k >= 0; --k) {
            p1 = this.pieces[k];
            for (let ko = otherPoly.pieces.length - 1; ko >= 0; --ko) {
                p2 = otherPoly.pieces[ko];
                if (p1.kx === p2.kx && mabs(p1.ky - p2.ky) === 1) return true;
                if (p1.ky === p2.ky && mabs(p1.kx - p2.kx) === 1) return true;
            }
        }
        return false;
    }

    listLoops() {
        const that = this;

        function edgeIsCommon(kx, ky, edge) {
            let k;
            switch (edge) {
                case 0:
                    ky--;
                    break;
                case 1:
                    kx++;
                    break;
                case 2:
                    ky++;
                    break;
                case 3:
                    kx--;
                    break;
            } // switch
            for (k = 0; k < that.pieces.length; k++) {
                if (kx === that.pieces[k].kx && ky === that.pieces[k].ky) return true; // we found the neighbor
            }
            return false;
        }

        function edgeIsInTbEdges(kx, ky, edge) {
            let k;
            for (k = 0; k < tbEdges.length; k++) {
                if (kx === tbEdges[k].kx && ky === tbEdges[k].ky && edge === tbEdges[k].edge) return k; // found it
            }
            return false;
        }

        let tbLoops = [];
        let tbEdges = [];
        let k;
        let kEdge;
        let lp;
        let currEdge;
        let tries;
        let edgeNumber;
        let potNext;

        let tbTries = [
            [
                {dkx: 0, dky: 0, edge: 1},
                {dkx: 1, dky: 0, edge: 0},
                {dkx: 1, dky: -1, edge: 3}
            ],
            [
                {dkx: 0, dky: 0, edge: 2},
                {dkx: 0, dky: 1, edge: 1},
                {dkx: 1, dky: 1, edge: 0}
            ],
            [
                {dkx: 0, dky: 0, edge: 3},
                {dkx: -1, dky: 0, edge: 2},
                {dkx: -1, dky: 1, edge: 1}
            ],
            [
                {dkx: 0, dky: 0, edge: 0},
                {dkx: 0, dky: -1, edge: 3},
                {dkx: -1, dky: -1, edge: 2}
            ],
        ];

        for (k = 0; k < this.pieces.length; k++) {
            for (kEdge = 0; kEdge < 4; kEdge++) {
                if (!edgeIsCommon(this.pieces[k].kx, this.pieces[k].ky, kEdge))
                    tbEdges.push({kx: this.pieces[k].kx, ky: this.pieces[k].ky, edge: kEdge, kp: k})
            }
        }

        while (tbEdges.length > 0) {
            lp = [];
            currEdge = tbEdges[0];
            lp.push(currEdge);
            tbEdges.splice(0, 1);
            do {
                for (tries = 0; tries < 3; tries++) {
                    potNext = tbTries[currEdge.edge][tries];
                    edgeNumber = edgeIsInTbEdges(currEdge.kx + potNext.dkx, currEdge.ky + potNext.dky, potNext.edge);
                    if (edgeNumber === false) continue;
                    currEdge = tbEdges[edgeNumber];
                    lp.push(currEdge);
                    tbEdges.splice(edgeNumber, 1);
                    break;
                }
                if (edgeNumber === false) break;
            } while (1);
            tbLoops.push(lp);
        }
        this.tbLoops = tbLoops.map(loop => loop.map(edge => {
            let cell = this.pieces[edge.kp];
            if (edge.edge === 0) return cell.ts;
            if (edge.edge === 1) return cell.rs;
            if (edge.edge === 2) return cell.bs;
            return cell.ls;
        }));
    }

    getRect() {
        let rect0 = this.puzzle.container.getBoundingClientRect();
        let rect = this.canvas.getBoundingClientRect();
        return {
            x: rect.x - rect0.x,
            y: rect.y - rect0.y,
            right: rect.right - rect0.x,
            bottom: rect.bottom - rect0.y,
            width: rect.width,
            height: rect.height
        };
    }

    getOrgP() {
        const rect = this.getRect();
        switch (this.rot) {
            case 0:
                return {x: rect.x - puzzle.scalex * this.pckxmin, y: rect.y - puzzle.scaley * this.pckymin};
            case 1:
                return {x: rect.right + puzzle.scaley * this.pckymin, y: rect.y - puzzle.scalex * this.pckxmin};
            case 2:
                return {x: rect.right + puzzle.scalex * this.pckxmin, y: rect.bottom + puzzle.scaley * this.pckymin};
            case 3:
                return {x: rect.x - puzzle.scaley * this.pckymin, y: rect.bottom + puzzle.scalex * this.pckxmin};
        }
    }

    drawPath(ctx, shiftx, shifty) {
        this.tbLoops.forEach(loop => {
            let without = false;
            loop.forEach(side => {
                side.drawPath(ctx, shiftx, shifty, without);
                without = true;
            });
            ctx.closePath();
        });
    }

    drawImage(special) {
        puzzle = this.puzzle;
        this.nx = this.pckxmax - this.pckxmin + 1;
        this.ny = this.pckymax - this.pckymin + 1;
        this.canvas.width = this.nx * puzzle.scalex;
        this.canvas.height = this.ny * puzzle.scaley;

        this.offsx = (this.pckxmin - 0.5) * puzzle.scalex;
        this.offsy = (this.pckymin - 0.5) * puzzle.scaley;

        this.path = new Path2D();
        this.drawPath(this.path, -this.offsx, -this.offsy);

        this.ctx.fillStyle = 'none';
        this.ctx.shadowColor = this.selected ? (special ? 'red' : 'gold') : 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = this.selected ? mmin(8, puzzle.scalex / 10) : 4;
        this.ctx.shadowOffsetX = this.selected ? 0 : -4;
        this.ctx.shadowOffsetY = this.selected ? 0 : 4;
        this.ctx.fill(this.path);
        if (this.selected) this.ctx.fill(this.path);
        if (this.selected) this.ctx.fill(this.path);
        if (this.selected) this.ctx.fill(this.path);
        if (this.selected) this.ctx.fill(this.path);
        if (this.selected) this.ctx.fill(this.path);
        if (this.selected) this.ctx.fill(this.path);
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0)';

        this.pieces.forEach((pp, kk) => {

            this.ctx.save();

            const path = new Path2D();
            const shiftx = -this.offsx;
            const shifty = -this.offsy;
            pp.ts.drawPath(path, shiftx, shifty, false);
            pp.rs.drawPath(path, shiftx, shifty, true);
            pp.bs.drawPath(path, shiftx, shifty, true);
            pp.ls.drawPath(path, shiftx, shifty, true);
            path.closePath();

            this.ctx.clip(path);
            const srcx = pp.kx ? ((pp.kx - 0.5) * puzzle.scalex) : 0;
            const srcy = pp.ky ? ((pp.ky - 0.5) * puzzle.scaley) : 0;

            const destx = (pp.kx ? 0 : puzzle.scalex / 2) + (pp.kx - this.pckxmin) * puzzle.scalex;
            const desty = (pp.ky ? 0 : puzzle.scaley / 2) + (pp.ky - this.pckymin) * puzzle.scaley;

            let w = 2 * puzzle.scalex;
            let h = 2 * puzzle.scaley;
            if (srcx + w > puzzle.gameCanvas.width) w = puzzle.gameCanvas.width - srcx;
            if (srcy + h > puzzle.gameCanvas.height) h = puzzle.gameCanvas.height - srcy;

            this.ctx.drawImage(puzzle.gameCanvas, srcx, srcy, w, h,
                destx, desty, w, h);

            this.ctx.translate(puzzle.embossThickness / 2, -puzzle.embossThickness / 2);
            this.ctx.lineWidth = puzzle.embossThickness;
            this.ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
            this.ctx.stroke(path);

            this.ctx.translate(-puzzle.embossThickness, puzzle.embossThickness);
            this.ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            this.ctx.stroke(path);
            this.ctx.restore();
            this.canvas.style.transform = `rotate(${90 * this.rot}deg)`;
        });
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
        this.canvas.style.left = x + 'px';
        this.canvas.style.top = y + 'px';
    }

    moveToInitialPlace() {
        const puzzle = this.puzzle;
        this.moveTo(puzzle.offsx + (this.pckxmin - 0.5) * puzzle.scalex,
            puzzle.offsy + (this.pckymin - 0.5) * puzzle.scaley);
    }

    rotate(angle) {
        this.canvas.style.transform = `rotate(${90 * angle}deg)`;
        this.rot = angle;
    }

    isPointInPath(p) {
        let npath = new Path2D();
        this.drawPath(npath, 0, 0);
        let rect = this.getRect();

        let pRefx = [rect.x, rect.right, rect.right, rect.x][this.rot];
        let pRefy = [rect.y, rect.y, rect.bottom, rect.bottom][this.rot];

        let mposx = [1, 0, -1, 0][this.rot] * (p.x - pRefx) + [0, 1, 0, -1][this.rot] * (p.y - pRefy);
        let mposy = [0, -1, 0, 1][this.rot] * (p.x - pRefx) + [1, 0, -1, 0][this.rot] * (p.y - pRefy);

        return (this.ctx.isPointInPath(this.path, mposx, mposy))
    }

    coerceToContainer() {
        let dimx = [puzzle.scalex, puzzle.scaley, puzzle.scalex, puzzle.scaley][this.rot];
        let dimy = [puzzle.scaley, puzzle.scalex, puzzle.scaley, puzzle.scalex][this.rot];
        const rect = this.getRect();
        // if both top and bottom edges are visible, only coerce x coordinates
        if (rect.y > -dimy && rect.bottom < puzzle.contHeight + dimy) {
            if (rect.right < dimx) {
                this.moveTo(this.x + dimx - rect.right, this.y);
                return;
            }
            if (rect.x > puzzle.contWidth - dimx) {
                this.moveTo(this.x + puzzle.contWidth - dimx - rect.x, this.y);
                return;
            }
            return;
        }
        if (rect.x > -dimx && rect.right < puzzle.contHeight + dimy) {
            if (rect.bottom < dimy) {
                this.moveTo(this.x, this.y + dimy - rect.bottom);
                return;
            }
            if (rect.y > puzzle.contHeight - dimy) {
                this.moveTo(this.x, this.y + puzzle.contHeight - dimy - rect.y);
                return;
            }
            return;
        }
        if (rect.y < -dimy) {
            this.moveTo(this.x, this.y - rect.y - dimy);
            this.getRect();
        }
        if (rect.bottom > puzzle.contHeight + dimy) {
            this.moveTo(this.x, this.y + puzzle.contHeight + dimy - rect.bottom);
            this.getRect();
        }
        if (rect.right < dimx) {
            this.moveTo(this.x + dimx - rect.right, this.y);
            return;
        }
        if (rect.x > puzzle.contWidth - dimx) {
            this.moveTo(this.x + puzzle.contWidth - dimx - rect.x, this.y);
            return;
        }
        return;
    }
}

class Puzzle {

    constructor(params) {

        this.container = (typeof params.container == "string") ?
            document.getElementById(params.container) :
            params.container;

        this.container.addEventListener("mousedown", event => {
            useMouse = true;
            event.preventDefault();
            if (event.button !== 0) return; //oly left button involved
            events.push({event: 'touch', position: this.relativeMouseCoordinates(event)});
        });
        this.container.addEventListener("touchstart", event => {
            useMouse = false;
            event.preventDefault();
            if (event.touches.length !== 1) return;
            let ev = event.touches[0];
            events.push({event: 'touch', position: this.relativeMouseCoordinates(ev)});
        }, {passive: false});

        this.container.addEventListener("mouseup", event => {
            useMouse = true;
            event.preventDefault();
            if (event.button !== 0) return;
            handleLeave();
        });
        this.container.addEventListener("touchend", handleLeave);
        this.container.addEventListener("touchleave", handleLeave);
        this.container.addEventListener("touchcancel", handleLeave);

        this.container.addEventListener("mousemove", event => {
            useMouse = true;
            event.preventDefault();
            if (events.length && events[events.length - 1].event === "move") events.pop();
            events.push({event: 'move', position: this.relativeMouseCoordinates(event)})
        });
        this.container.addEventListener("touchmove", event => {
            useMouse = false;
            event.preventDefault();
            if (event.touches.length !== 1) return;
            let ev = event.touches[0];
            if (events.length && events[events.length - 1].event === "move") events.pop();
            events.push({event: 'move', position: this.relativeMouseCoordinates(ev)});
        }, {passive: false});

        this.gameCanvas = document.createElement('CANVAS');
        this.container.appendChild(this.gameCanvas)

        this.srcImage = new Image();
        this.imageLoaded = false;
        this.srcImage.addEventListener("load", () => imageLoaded(this));

        function handleLeave() {
            events.push({event: 'leave'});
        }
    }
    getContainerSize() {
        let styl = window.getComputedStyle(this.container);

        this.contWidth = parseFloat(styl.width);
        this.contHeight = parseFloat(styl.height);
    }

    create() {

        this.container.innerHTML = "";
        this.getContainerSize();
        this.computenxAndny();

        this.relativeHeight = (this.srcImage.naturalHeight / this.ny) / (this.srcImage.naturalWidth / this.nx);

        this.defineShapes({
            coeffDecentr: 0.12,
            twistf: [twist0, twist1, twist2, twist3][document.getElementById("shape").value - 1]
        });

        this.polyPieces = [];
        this.pieces.forEach(row => row.forEach(piece => {
            this.polyPieces.push(new PolyPiece(piece, this));
        }));

        arrayShuffle(this.polyPieces);
        this.evaluateZIndex();
    }
    computenxAndny() {

        let kx, ky, width = this.srcImage.naturalWidth, height = this.srcImage.naturalHeight, npieces = this.nbPieces;
        let err, errmin = 1e9;
        let ncv, nch;

        let nHPieces = mround(msqrt(npieces * width / height));
        let nVPieces = mround(npieces / nHPieces);

        for (ky = 0; ky < 5; ky++) {
            ncv = nVPieces + ky - 2;
            for (kx = 0; kx < 5; kx++) {
                nch = nHPieces + kx - 2;
                err = nch * height / ncv / width;
                err = (err + 1 / err) - 2;
                err += mabs(1 - nch * ncv / npieces);

                if (err < errmin) {
                    errmin = err;
                    this.nx = nch;
                    this.ny = ncv;
                }
            }
        }
    }
    defineShapes(shapeDesc) {
        let {coeffDecentr, twistf} = shapeDesc;

        const corners = [];
        const nx = this.nx, ny = this.ny;
        let np;

        for (let ky = 0; ky <= ny; ++ky) {
            corners[ky] = [];
            for (let kx = 0; kx <= nx; ++kx) {
                corners[ky][kx] = new Point(kx + alea(-coeffDecentr, coeffDecentr),
                    ky + alea(-coeffDecentr, coeffDecentr));
                if (kx === 0) corners[ky][kx].x = 0;
                if (kx === nx) corners[ky][kx].x = nx;
                if (ky === 0) corners[ky][kx].y = 0;
                if (ky === ny) corners[ky][kx].y = ny;
            }
        }
        this.pieces = [];
        for (let ky = 0; ky < ny; ++ky) {
            this.pieces[ky] = [];
            for (let kx = 0; kx < nx; ++kx) {
                this.pieces[ky][kx] = np = new Piece(kx, ky);
                if (ky === 0) {
                    np.ts.points = [corners[ky][kx], corners[ky][kx + 1]];
                    np.ts.type = "d";
                } else {
                    np.ts = this.pieces[ky - 1][kx].bs.reversed();
                }
                np.rs.points = [corners[ky][kx + 1], corners[ky + 1][kx + 1]];
                np.rs.type = "d";
                if (kx < nx - 1) {
                    if (intAlea(2))
                        twistf(np.rs, corners[ky][kx], corners[ky + 1][kx]);
                    else
                        twistf(np.rs, corners[ky][kx + 2], corners[ky + 1][kx + 2]);
                }
                // left side
                if (kx === 0) {
                    np.ls.points = [corners[ky + 1][kx], corners[ky][kx]];
                    np.ls.type = "d";
                } else {
                    np.ls = this.pieces[ky][kx - 1].rs.reversed()
                }
                // bottom side
                np.bs.points = [corners[ky + 1][kx + 1], corners[ky + 1][kx]];
                np.bs.type = "d";
                if (ky < ny - 1) {
                    if (intAlea(2))
                        twistf(np.bs, corners[ky][kx + 1], corners[ky][kx]);
                    else
                        twistf(np.bs, corners[ky + 2][kx + 1], corners[ky + 2][kx]);
                }
            }
        }
    }
    scale() {
        const maxWidth = 0.95 * this.contWidth;
        const maxHeight = 0.95 * this.contHeight;
        let gameInfo = {};
        {
            let memoHeight = 0;
            let xtra = mceil(this.nx * this.ny * 0.2);
            for (let extrax = 0; extrax <= mceil(xtra / this.ny); ++extrax) {
                let reqx = this.srcImage.naturalWidth * (this.nx + extrax) / this.nx;
                let availx = (extrax === 0) ? maxWidth : this.contWidth;
                for (let extray = mceil(xtra / this.nx); (this.nx + extrax) * (this.ny + extray) >= this.nx * this.ny + xtra; --extray) {
                    let reqy = this.srcImage.naturalHeight * (this.ny + extray) / this.ny;
                    let availy = (extray === 0) ? maxHeight : this.contHeight;
                    let resultx = availx;
                    let resulty = resultx * reqy / reqx;
                    if (resulty > availy) {
                        resulty = availy;
                        resultx = resulty * reqx / reqy;
                    }
                    let gameHeight = resulty / (this.ny + extray) * this.ny;
                    let gameWidth = resultx / (this.nx + extrax) * this.nx;
                    if (gameHeight > memoHeight) {
                        memoHeight = gameHeight;
                        gameInfo = {gameWidth, gameHeight, extrax, extray};
                    }
                }
            }
        }
        this.gameHeight = gameInfo.gameHeight;
        this.gameWidth = gameInfo.gameWidth;

        this.gameCanvas.width = this.gameWidth;
        this.gameCanvas.height = this.gameHeight;
        this.gameCtx = this.gameCanvas.getContext("2d");
        this.gameCtx.drawImage(this.srcImage, 0, 0, this.gameWidth, this.gameHeight);

        this.gameCanvas.classList.add("gameCanvas");
        this.gameCanvas.style.zIndex = 500;

        /* scale pieces */
        this.scalex = this.gameWidth / this.nx;
        this.scaley = this.gameHeight / this.ny;

        this.pieces.forEach(row => {
            row.forEach(piece => piece.scale(this));
        });
        this.offsx = (this.contWidth - this.gameWidth) / 2;
        this.offsy = (this.contHeight - this.gameHeight) / 2;

        this.dConnect = mmax(10, mmin(this.scalex, this.scaley) / 10);

        this.embossThickness = mmin(2 + this.scalex / 200 * (5 - 2), 5);
    }

    relativeMouseCoordinates(event) {
        const br = this.container.getBoundingClientRect();
        return {
            x: event.clientX - br.x,
            y: event.clientY - br.y
        };
    }

    limitRectangle(rect) {
        let minscale = mmin(this.scalex, this.scaley);

        rect.x0 = mmin(mmax(rect.x0, -minscale / 2), this.contWidth - 1.5 * minscale);
        rect.x1 = mmin(mmax(rect.x1, -minscale / 2), this.contWidth - 1.5 * minscale);
        rect.y0 = mmin(mmax(rect.y0, -minscale / 2), this.contHeight - 1.5 * minscale);
        rect.y1 = mmin(mmax(rect.y1, -minscale / 2), this.contHeight - 1.5 * minscale);
    }

    spreadInRectangle(rect) {
        this.limitRectangle(rect);
        this.polyPieces.forEach(pp =>
            pp.moveTo(alea(rect.x0, rect.x1), alea(rect.y0, rect.y1))
        );
    }

    spreadSetInRectangle(set, rect) {
        this.limitRectangle(rect);
        set.forEach(pp =>
            pp.moveTo(alea(rect.x0, rect.x1), alea(rect.y0, rect.y1))
        );
    }

    optimInitial() {
        const minx = -this.scalex / 2;
        const miny = -this.scaley / 2;
        const maxx = this.contWidth - 1.5 * this.scalex;
        const maxy = this.contHeight - 1.5 * this.scaley;
        let freex = this.contWidth - this.gameWidth;
        let freey = this.contHeight - this.gameHeight;

        let where = [0, 0, 0, 0];
        let rects = [];
        if (freex > 1.5 * this.scalex) {
            where[1] = 1;
            rects[1] = {
                x0: this.gameWidth - 0.5 * this.scalex,
                x1: maxx,
                y0: miny, y1: maxy
            };
        }
        if (freex > 3 * this.scalex) {
            where[3] = 1;
            rects[3] = {
                x0: minx,
                x1: freex / 2 - 1.5 * this.scalex,
                y0: miny, y1: maxy
            };
            rects[1].x0 = this.contWidth - freex / 2 - 0.5 * this.scalex;
        }
        if (freey > 1.5 * this.scaley) {
            where[2] = 1;
            rects[2] = {
                x0: minx, x1: maxx,
                y0: this.gameHeight - 0.5 * this.scaley,
                y1: this.contHeight - 1.5 * this.scaley
            };
        }
        if (freey > 3 * this.scaley) {
            where[0] = 1;
            rects[0] = {
                x0: minx, x1: maxx,
                y0: miny,
                y1: freey / 2 - 1.5 * this.scaley
            };
            rects[2].y0 = this.contHeight - freey / 2 - 0.5 * this.scaley;
        }
        if (where.reduce((sum, a) => sum + a) < 2) {
            if (freex - freey > 0.2 * this.scalex || where[1]) {
                this.spreadInRectangle({
                    x0: this.gameWidth - this.scalex / 2,
                    x1: maxx,
                    y0: miny,
                    y1: maxy
                });
            } else if (freey - freex > 0.2 * this.scalex || where[2]) {
                this.spreadInRectangle({
                    x0: minx,
                    x1: maxx,
                    y0: this.gameHeight - this.scaley / 2,
                    y1: maxy
                });
            } else {
                if (this.gameWidth > this.gameHeight) {
                    this.spreadInRectangle({
                        x0: minx,
                        x1: maxx,
                        y0: this.gameHeight - this.scaley / 2,
                        y1: maxy
                    });
                } else {
                    this.spreadInRectangle({
                        x0: this.gameWidth - this.scalex / 2,
                        x1: maxx,
                        y0: miny,
                        y1: maxy
                    });
                }
            }
            return;
        }
        let nrects = [];
        rects.forEach(rect => {
            nrects.push(rect);
        });
        let k0 = 0
        const npTot = this.nx * this.ny;
        for (let k = 0; k < nrects.length; ++k) {
            let k1 = mround((k + 1) / nrects.length * npTot);
            this.spreadSetInRectangle(this.polyPieces.slice(k0, k1), nrects[k]);
            k0 = k1;
        }
        arrayShuffle(this.polyPieces);
        this.evaluateZIndex();
    }

    evaluateZIndex() {
        for (let k = this.polyPieces.length - 1; k > 0; --k) {
            if (this.polyPieces[k].pieces.length > this.polyPieces[k - 1].pieces.length) {
                // swap pieces if not in right order
                [this.polyPieces[k], this.polyPieces[k - 1]] = [this.polyPieces[k - 1], this.polyPieces[k]];
            }
        }
        this.polyPieces.forEach((pp, k) => {
            pp.canvas.style.zIndex = k + 10;
        });
        this.zIndexSup = this.polyPieces.length + 10;
    }
}

let loadFile;
{
    let options;

    let elFile = document.createElement('input');
    elFile.setAttribute('type', 'file');
    elFile.style.display = 'none';
    elFile.addEventListener("change", getFile);

    function getFile() {

        if (this.files.length === 0) {
            return;
        }
        let file = this.files[0];
        let reader = new FileReader();

        reader.addEventListener('load', () => {
            puzzle.srcImage.src = reader.result;
        });
        reader.readAsDataURL(this.files[0]);
    }

    loadFile = function (ooptions) {
        elFile.setAttribute("accept", "image/*");
        elFile.value = null;
        elFile.click();
    }
}

function loadInitialFile() {
    puzzle.srcImage.src = chapters.levels[currentLevel].image;
    console.log(chapters.levels);
}

function imageLoaded(puzzle) {
    events.push({event: "srcImageLoaded"});
    puzzle.imageLoaded = true;

}

function fitImage(img, width, height) {
    let wn = img.naturalWidth;
    let hn = img.naturalHeight;
    let w = width;
    let h = w * hn / wn;
    if (h > height) {
        h = height;
        w = h * wn / hn;
    }
    img.style.position = "absolute";
    img.style.width = w + "px";
    img.style.height = h + "px";
    img.style.top = "50%";
    img.style.left = "50%";
    img.style.transform = "translate(-50%,-50%)";
}

function enableRotMenu(enabled) {
    rotEnableElement.disabled = !enabled;
    document.getElementById("enablerotlabel").classList[enabled ? "remove" : "add"]("dimmed");
}

let animate;
let events = [];

{
    let state = 0;
    let moving = {};
    let tmpImage;

    animate = function (tStamp) {
        requestAnimationFrame(animate);

        let event;
        if (events.length) event = events.shift();
        if (event && event.event === "reset") state = 0;
        if (event && event.event === "srcImageLoaded") state = 0;

        if (event && event.event === "resize") {
            puzzle.prevWidth = puzzle.contWidth;
            puzzle.prevHeight = puzzle.contHeight;
            puzzle.getContainerSize();
            if (state === 15 || state > 60) {
                fitImage(tmpImage, puzzle.contWidth * 0.95, puzzle.contHeight * 0.95);
            } else if (state >= 25) {
                puzzle.prevGameWidth = puzzle.gameWidth;
                puzzle.prevGameHeight = puzzle.gameHeight;
                puzzle.scale();
                let reScale = puzzle.contWidth / puzzle.prevWidth;
                puzzle.polyPieces.forEach(pp => {
                    let nx = puzzle.contWidth / 2 - (puzzle.prevWidth / 2 - pp.x) * reScale;
                    let ny = puzzle.contHeight / 2 - (puzzle.prevHeight / 2 - pp.y) * reScale;
                    nx = mmin(mmax(nx, -puzzle.scalex / 2), puzzle.contWidth - 1.5 * puzzle.scalex);
                    ny = mmin(mmax(ny, -puzzle.scaley / 2), puzzle.contHeight - 1.5 * puzzle.scaley);

                    pp.moveTo(nx, ny);
                    pp.drawImage();

                });
            }
            return;
        }

        switch (state) {
            case 0:
                state = 10;

            case 10:
                playing = false;
                restartElement.classList.add("dimmed");
                if (!puzzle.imageLoaded) return;

                puzzle.container.innerHTML = "";
                tmpImage = document.createElement("img");
                tmpImage.src = puzzle.srcImage.src;
                puzzle.getContainerSize();
                fitImage(tmpImage, puzzle.contWidth * 0.95, puzzle.contHeight * 0.95);
                tmpImage.style.boxShadow = "-4px 4px 4px rgba(0, 0, 0, 0.5)";
                puzzle.container.appendChild(tmpImage);
                state = 15;
                break;

            case 15:
                playing = false;
                restartElement.classList.add("dimmed");
                enableRotMenu(true);
                if (!event) return;
                if (event.event === "nbpieces") {
                    puzzle.nbPieces = event.nbpieces;
                    state = 20;
                } else if (event.event === "srcImageLoaded") {
                    state = 10;
                    return;
                } else return;

            case 20:
                menu.close();
                playing = true;
                restartElement.classList.remove("dimmed");
                puzzle.rotationAllowed = rotEnableElement.checked;
                if (!puzzle.rotationAllowed) enableRotMenu(false);
                puzzle.create();
                puzzle.scale();
                if (puzzle.rotationAllowed) puzzle.polyPieces.forEach(pp => pp.rot = intAlea(4));
                puzzle.polyPieces.forEach(pp => {
                    pp.drawImage();
                    pp.moveToInitialPlace();
                });
                puzzle.gameCanvas.style.top = puzzle.offsy + "px";
                puzzle.gameCanvas.style.left = puzzle.offsx + "px";
                puzzle.gameCanvas.style.display = "block";
                state = 25;
                break;

            case 25:
                puzzle.gameCanvas.style.display = "none";
                puzzle.polyPieces.forEach(pp => {
                    pp.canvas.classList.add("moving");
                });
                state = 30;
                break;

            case 30:
                puzzle.optimInitial();
                setTimeout(() => events.push({event: "finished"}), 1200);
                state = 35;
                break;

            case 35:
                if (!event || event.event !== "finished") return;
                puzzle.polyPieces.forEach(pp => {
                    pp.canvas.classList.remove("moving");
                });

                state = 50;

                break;

            case 50:
                if (!event) return;
                if (event.event === "restart") {
                    state = 10;
                    return;
                }
                if (event.event === "nbpieces") {
                    puzzle.nbPieces = event.nbpieces;
                    state = 20;
                } else if (event.event === "touch") {
                    moving = {
                        xMouseInit: event.position.x,
                        yMouseInit: event.position.y
                    }

                    for (let k = puzzle.polyPieces.length - 1; k >= 0; --k) {
                        let pp = puzzle.polyPieces[k];

                        if (pp.isPointInPath(event.position)) {
                            pp.selected = true;
                            pp.drawImage();
                            moving.pp = pp;
                            moving.ppXInit = pp.x;
                            moving.ppYInit = pp.y;
                            moving.tInit = tStamp;
                            puzzle.polyPieces.splice(k, 1);
                            puzzle.polyPieces.push(pp);
                            pp.canvas.style.zIndex = puzzle.zIndexSup;
                            state = 55;
                            return;
                        }
                    }
                }
                break;

            case 55:
                if (!event) return;
                if (event.event === "restart") {
                    state = 10;
                    return;
                }
                switch (event.event) {
                    case "move":
                        moving.pp.moveTo(event.position.x - moving.xMouseInit + moving.ppXInit,
                            event.position.y - moving.yMouseInit + moving.ppYInit);
                        break;
                    case "leave":
                        if (puzzle.rotationAllowed && tStamp < moving.tInit + 250) {
                            moving.pp.rotate((moving.pp.rot + 1) % 4);
                            moving.pp.coerceToContainer();
                        }
                        let doneSomething;
                        moving.pp.selected = false;
                        moving.pp.drawImage();
                        let merged = false;
                        do {
                            doneSomething = false;
                            for (let k = puzzle.polyPieces.length - 1; k >= 0; --k) {
                                let pp = puzzle.polyPieces[k];
                                if (pp === moving.pp) continue;
                                if (moving.pp.ifNear(pp)) {
                                    merged = true;
                                    if (pp.pieces.length > moving.pp.pieces.length) {
                                        pp.merge(moving.pp);
                                        moving.pp = pp;
                                    } else {
                                        moving.pp.merge(pp);
                                    }
                                    doneSomething = true;
                                    break;
                                }
                            }

                        } while (doneSomething);
                        puzzle.evaluateZIndex();
                        if (merged) {
                            moving.pp.selected = true;
                            moving.pp.drawImage(true);
                            moving.tInit = tStamp + 500;
                            state = 56;
                            break;
                        }
                        state = 50; // just go back waiting
                        if (puzzle.polyPieces.length === 1 && puzzle.polyPieces[0].rot === 0) state = 60; // won!
                }

                break;
            case 56:
                if (tStamp < moving.tInit) return;
                moving.pp.selected = false;
                moving.pp.drawImage();
                if (puzzle.polyPieces.length === 1 && puzzle.polyPieces[0].rot === 0) state = 60;
                else state = 50;
                break;

            case 60:
                markDifficultyCompleted(currentLevel, selectedDifficulty);
                playing = false;
                restartElement.classList.add("dimmed");
                puzzle.container.innerHTML = "";
                puzzle.getContainerSize();
                fitImage(tmpImage, puzzle.contWidth * 0.95, puzzle.contHeight * 0.95);
                tmpImage.style.boxShadow = "-4px 4px 4px rgba(0, 0, 0, 0.5)";
                tmpImage.style.left = (puzzle.polyPieces[0].x + puzzle.scalex / 2 + puzzle.gameWidth / 2) / puzzle.contWidth * 100 + "%";
                tmpImage.style.top = (puzzle.polyPieces[0].y + puzzle.scaley / 2 + puzzle.gameHeight / 2) / puzzle.contHeight * 100 + "%";

                tmpImage.classList.add("moving");
                setTimeout(() => tmpImage.style.top = tmpImage.style.left = "50%", 0);
                puzzle.container.appendChild(tmpImage);
                state = 65;
                menu.open();

            case 65:
                enableRotMenu(true);
                if (event && event.event === "nbpieces") {
                    puzzle.nbPieces = event.nbpieces;
                    state = 20;
                    return;
                }
                break;

            case 9999:
                break;
            default:
                let st = state;
                state = 9999;
                throw ("oops, unknown state " + st);
        }
    }
}

/* analyze menu */
let menu;
{ // scope for menu
    menu = {items: []};
    document.querySelectorAll("#menu li").forEach(menuEl => {
        let kItem = menu.items.length;
        let item = {element: menuEl, kItem: kItem};
        menu.items[kItem] = item;
    });

    menu.open = function () {
        menu.items.forEach(item => item.element.style.display = "block");
        menu.opened = true;
    }
    menu.close = function () {
        menu.items.forEach((item, k) => {
            if (k > 0) item.element.style.display = "none";
        });
        menu.opened = false;
    }
    menu.items[0].element.addEventListener("click", () => {
        if (menu.opened) menu.close(); else menu.open()
    });
    menu.items[1].element.addEventListener("click", loadInitialFile);
    menu.items[2].element.addEventListener("click", loadFile);
    rotEnableElement = menu.items[3].element.querySelector("input");
    rotEnableElement.addEventListener("click", toggleRotate);
    restartElement = menu.items[4].element;
    restartElement.addEventListener("click", confirmRestart);
    // menu.items[4].element.addEventListener("click", () => { });
    for (let k = 6; k < menu.items.length; ++k) {
        menu.items[k].element.addEventListener("click", () => events.push({
            event: "nbpieces",
            nbpieces: [12, 25, 50, 100, 200][k - 6]
        }));
    }

    function toggleRotate(event) {

        if (!playing) {
            return;
        }
        new Modal({
            lines: ["Are you sure you want to disable the rotation ?",
                "You won't be allowed to re-enable it before you start a new game.",
                "All pieces will be set back to their original orientation."
            ],
            buttons: [{
                text: "yes", callback: () => {
                    enableRotMenu(false);
                    puzzle.rotationAllowed = false;
                    puzzle.polyPieces.forEach(pp => {
                        pp.rotate(0);
                    });
                }
            },
                {text: "no", callback: () => this.checked = true}]
        });
    }

    function confirmRestart() {
        if (!playing) return; // ignore if not playing
        new Modal({
            lines: ["Are you sure you want to restart the game ?"],
            buttons: [{text: "restart", callback: () => events.push({event: "restart"})},
                {text: "don't restart"}
            ]
        });
    }
}

menu.close();

window.addEventListener("resize", event => {
    // do not accumulate resize events in events queue - keep only current one
    if (events.length && events[events.length - 1].event === "resize") return;
    events.push({event: "resize"});
});

// puzzle = new Puzzle({container: "forPuzzle"});

// loadInitialFile();
requestAnimationFrame(animate);

function showLevelScreen() {
    const list = document.getElementById("levelList");
    list.innerHTML = "";

    const progress = loadProgress(); // { levelIndex: { easy:true } }

    chapters.levels.forEach((lvl, levelIndex) => {
        const card = document.createElement("div");
        card.className = "level-card";

        if (!isLevelUnlocked(levelIndex)) {
            card.classList.add("locked");
        }

        // --- IMAGE ---
        const img = document.createElement("img");
        img.src = lvl.image;
        card.appendChild(img);

        // --- DIFFICULTY BAR ---
        const diffRow = document.createElement("div");
        diffRow.className = "difficulty-row";

        let selectedDifficulty = "easy"; // default

        DIFFICULTIES.forEach(diff => {
            const icon = document.createElement("img");

            const completed =
                progress[levelIndex] && progress[levelIndex][diff];

            const key = completed ? `${diff}_f` : diff;
            icon.src = ICONS[key];

            icon.className = "difficulty-icon";

            if (diff === "easy") icon.classList.add("selected");
            if (completed) icon.classList.add("completed");

            icon.onclick = (e) => {
                e.stopPropagation();

                diffRow.querySelectorAll(".difficulty-icon").forEach(i =>
                    i.classList.remove("selected")
                );

                icon.classList.add("selected");
                selectedDifficulty = diff;
            };

            diffRow.appendChild(icon);
        });

        card.appendChild(diffRow);

        // --- START LEVEL ---
        card.onclick = () => {
            startLevel(levelIndex, selectedDifficulty);
        };
        list.appendChild(card);
    });
    document.getElementById("levelScreen").style.display = "flex";
}


puzzle = new Puzzle({
    container: "container"
});

let unlockedLevels = [true];

function unlockNextLevel() {
    unlockedLevels[currentLevel + 1] = true;
    saveProgress();
}

function isLevelUnlocked(index) {
    return unlockedLevels[index];
}
unlockNextLevel();
showLevelScreen();
// requestAnimationFrame(animate);

function startLevel(levelIndex, difficulty) {
    currentLevel = levelIndex;

    puzzle.nbPieces = DIFFICULTY_PIECES[difficulty];
    puzzle.srcImage.src = chapters.levels[levelIndex].image;

    selectedDifficulty = difficulty; // store globally
    document.getElementById("levelScreen").style.display = "none";
}

document.getElementById("fullscreenBtn").onclick = () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
        el.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
};
window.addEventListener("load", () => {
    puzzle = new Puzzle({ container: "container" });
    console.log("Puzzle created:", puzzle);

    loadProgress();
    loadInitialFile();
    showLevelScreen();
    requestAnimationFrame(animate);
});

function loadProgress() {
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw || raw === "undefined" || raw === "null") {
        return {};
    }

    try {
        return JSON.parse(raw);
    } catch (e) {
        console.warn("Corrupted progress data, resetting:", raw);
        localStorage.removeItem(SAVE_KEY);
        return {};
    }
}

function saveProgress(progress) {
    if (!progress || typeof progress !== "object") return;
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
}

function markDifficultyCompleted(level, difficulty) {
    const progress = loadProgress();
    if (!progress[level]) progress[level] = {};
    progress[level][difficulty] = true;
    saveProgress(progress);
    updateDifficultyIcons(level);
}
function updateDifficultyIcons(level) {
    const progress = loadProgress();
    const levelProgress = progress[level] || {};

    DIFFICULTY_ORDER.forEach(diff => {
        const icon = document.querySelector(
            `.difficulty-icon[data-level="${level}"][data-difficulty="${diff}"]`
        );
        if (!icon) return;

        icon.classList.toggle("completed", !!levelProgress[diff]);
        icon.classList.toggle("selected", diff === selectedDifficulty);
    });
}
document.querySelectorAll(".difficulty-icon").forEach(icon => {
    icon.addEventListener("click", () => {
        selectedDifficulty = icon.dataset.difficulty;
        puzzle.nbPieces = DIFFICULTY_PIECES[selectedDifficulty];
        updateDifficultyIcons(currentLevel);
    });
});