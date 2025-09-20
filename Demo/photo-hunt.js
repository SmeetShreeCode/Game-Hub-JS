let completedLevels = JSON.parse(localStorage.getItem("completedLevels")) || {
    chapter1: [],
    chapter2: [],
};

function toRelative(x, y, radius, imgW = 480, imgH = 300) {
    return {
        x: x / imgW,
        y: y / imgH,
        radius: radius / Math.min(imgW, imgH)
    };
}

function handleClick(x, y, side) {
    if (gameOver) return;

    const canvas = side === "left" ? leftCanvas : rightCanvas;
    const ctx = side === "left" ? leftCtx : rightCtx;
    const image = side === "left" ? leftImage : rightImage;

    // Step 1: Scale the click to the image's natural/original resolution
    const scaleX = image.naturalWidth / canvas.clientWidth;
    const scaleY = image.naturalHeight / canvas.clientHeight;

    const scaledX = x * scaleX;
    const scaledY = y * scaleY;
    console.log(scaledX, scaledY);

    const differences = activeLevels[currentLevel].differences;
    for (let i = 0; i < differences.length; i++) {
        const diff = differences[i];
        if (found.includes(i)) continue;

        const dx = diff.x;
        const dy = diff.y;
        const radius = diff.radius || 15;

        // Check if the scaled click is within the difference radius
        const dist = Math.sqrt((scaledX - dx) ** 2 + (scaledY - dy) ** 2);
        if (dist <= radius) {
            found.push(i);

            drawShape(leftCtx, dx, dy, "lime", radius, diff.shape || "circle", false, diff.width, diff.height);
            drawShape(rightCtx, dx, dy, "lime", radius, diff.shape || "circle", false, diff.width, diff.height);

            updateScore(true);

            if (found.length === differences.length) {
                const chapterKey = currentChapter;
                const levelIndexInChapter = Chapters[chapterKey].indexOf(activeLevels[currentLevel]);

                if (!completedLevels[chapterKey].includes(levelIndexInChapter)) {
                    completedLevels[chapterKey].push(levelIndexInChapter);
                    localStorage.setItem("completedLevels", JSON.stringify(completedLevels));
                }
                setTimeout(() => {
                    currentLevel++;
                    if (currentLevel >= activeLevels.length) {
                        showEndScreen(true);
                    } else {
                        loadLevel(currentLevel);
                    }
                }, 1500);
            }
            return;
        }
    }

    // If not correct
    updateScore(false);
    lives--;

    // Draw red circle where the user clicked
    drawShape(ctx, x, y, "red", 20, "circle", true);

    if (lives <= 0) {
        showEndScreen(false);
        disableClicks();
    }
}

