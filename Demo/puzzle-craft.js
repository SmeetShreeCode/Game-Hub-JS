const canvas = document.getElementById("puzzleCanvas");
const ctx = canvas.getContext("2d");

const rows = 3;
const cols = 3;
const pieceSize = 200; // canvas is 600x600, so 3x3 = 200px pieces

let pieces = [];
let draggingPiece = null;
let offsetX = 0, offsetY = 0;
let image;

function startPuzzle() {
    image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
        generatePieces();
        drawAll();
    };
    image.src = "https://picsum.photos/600"; // You can change this to any CORS-enabled image
}

function generatePieces() {
    pieces = [];

    const knobs = {}; // Store knobs/holes to match neighboring pieces

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const id = y * cols + x;

            // Random knobs: top, right, bottom, left
            const top = y === 0 ? 0 : -knobs[`${x},${y - 1}`].bottom;
            const left = x === 0 ? 0 : -knobs[`${x - 1},${y}`].right;
            const right = x === cols - 1 ? 0 : Math.random() > 0.5 ? 1 : -1;
            const bottom = y === rows - 1 ? 0 : Math.random() > 0.5 ? 1 : -1;

            knobs[`${x},${y}`] = { top, right, bottom, left };

            const piece = {
                x,
                y,
                px: Math.random() * (canvas.width - pieceSize),
                py: Math.random() * (canvas.height - pieceSize),
                ox: x * pieceSize,
                oy: y * pieceSize,
                shape: { top, right, bottom, left },
                placed: false,
                path: null
            };

            piece.path = createPiecePath(piece);

            pieces.push(piece);
        }
    }
}

function createPiecePath(piece) {
    const path = new Path2D();
    const size = pieceSize;
    const knobSize = size * 0.2;
    const s = piece.shape;

    path.moveTo(0, 0);

    // Top edge
    if (s.top === 0) path.lineTo(size, 0);
    else drawEdge(path, "top", s.top, knobSize, size);

    // Right edge
    if (s.right === 0) path.lineTo(size, size);
    else drawEdge(path, "right", s.right, knobSize, size);

    // Bottom edge
    if (s.bottom === 0) path.lineTo(0, size);
    else drawEdge(path, "bottom", s.bottom, knobSize, size);

    // Left edge
    if (s.left === 0) path.lineTo(0, 0);
    else drawEdge(path, "left", s.left, knobSize, size);

    path.closePath();
    return path;
}

function drawEdge(path, direction, type, knobSize, size) {
    const mid = size / 2;
    const depth = knobSize * 0.7 * type;

    switch (direction) {
        case "top":
            path.lineTo(mid - knobSize, 0);
            path.bezierCurveTo(mid - knobSize / 2, -depth, mid + knobSize / 2, -depth, mid + knobSize, 0);
            path.lineTo(size, 0);
            break;

        case "right":
            path.lineTo(size, mid - knobSize);
            path.bezierCurveTo(size + depth, mid - knobSize / 2, size + depth, mid + knobSize / 2, size, mid + knobSize);
            path.lineTo(size, size);
            break;

        case "bottom":
            path.lineTo(mid + knobSize, size);
            path.bezierCurveTo(mid + knobSize / 2, size + depth, mid - knobSize / 2, size + depth, mid - knobSize, size);
            path.lineTo(0, size);
            break;

        case "left":
            path.lineTo(0, mid + knobSize);
            path.bezierCurveTo(-depth, mid + knobSize / 2, -depth, mid - knobSize / 2, 0, mid - knobSize);
            path.lineTo(0, 0);
            break;
    }
}

function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const piece of pieces) {
        ctx.save();
        ctx.translate(piece.px, piece.py);
        ctx.beginPath();
        ctx.clip(piece.path);
        ctx.drawImage(
            image,
            piece.ox, piece.oy, pieceSize, pieceSize,
            0, 0, pieceSize, pieceSize
        );
        ctx.strokeStyle = "#000";
        ctx.stroke(piece.path);
        ctx.restore();
    }
}

// === Dragging ===
canvas.addEventListener("mousedown", (e) => {
    const { x, y } = getMouse(e);

    for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        ctx.save();
        ctx.translate(p.px, p.py);
        if (ctx.isPointInPath(p.path, x - p.px, y - p.py) && !p.placed) {
            draggingPiece = p;
            offsetX = x - p.px;
            offsetY = y - p.py;
            break;
        }
        ctx.restore();
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (!draggingPiece) return;
    const { x, y } = getMouse(e);
    draggingPiece.px = x - offsetX;
    draggingPiece.py = y - offsetY;
    drawAll();
});

canvas.addEventListener("mouseup", () => {
    if (!draggingPiece) return;

    const dx = draggingPiece.px - draggingPiece.ox;
    const dy = draggingPiece.py - draggingPiece.oy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 20) {
        draggingPiece.px = draggingPiece.ox;
        draggingPiece.py = draggingPiece.oy;
        draggingPiece.placed = true;
    }

    draggingPiece = null;
    drawAll();

    if (pieces.every(p => p.placed)) {
        setTimeout(() => alert("🎉 You solved it!"), 100);
    }
});

function getMouse(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}
