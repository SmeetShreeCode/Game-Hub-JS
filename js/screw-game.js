const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

// ctx.fillStyle = '#8e1818';
// ctx.fillRect(0, 0, 500, 500);
//
// ctx.fillStyle = '#828e18';
// ctx.fillRect(0, 0, 200, 200);

const board = {
    head: [0, 0],
    tail: [0, 0],
};

console.log(canvas);

