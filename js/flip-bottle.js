const bottle = document.getElementById("bottle");
const flipBtn = document.getElementById("flipBtn");

let isFlipping = false;
let velocityY = 0;
let gravity = 0.5;
let rotation = 0;

flipBtn.addEventListener("click", () => {
    if (!isFlipping) {
        isFlipping = true;
        velocityY = -12; // upward force
        rotation = 0;
        flipBottle();
    }
});

function flipBottle() {
    let y = bottle.offsetTop;
    let angle = 0;

    const interval = setInterval(() => {
        // Physics
        velocityY += gravity;
        y += velocityY;

        // Rotation
        angle += 15;
        bottle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        bottle.style.top = `${y}px`;

        // Landing check
        if (y >= 420) { // Hits platform
            clearInterval(interval);
            isFlipping = false;

            // Landing success if angle is close to 0 or 360
            const landedUpright = angle % 360 > 340 || angle % 360 < 20;

            if (landedUpright) {
                console.error("🎉 Perfect Flip!");
            } else {
                console.warn("❌ Try Again!");
            }

            // Reset position
            bottle.style.top = "420px";
            bottle.style.transform = `translateX(-50%) rotate(0deg)`;
        }
    }, 30);
}
