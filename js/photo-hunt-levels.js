//let currentLevel = 0, levelStartScore = 0, found = [], hintFound = [], score = 0, timeLeft = 60, lives = 20,
//     hintsLeft = 3, comboStreak = 0, selectedLevel = 0, gameOver = false;
// let timerInterval;
// let completedLevels = JSON.parse(localStorage.getItem("completedLevels")) || {
//     chapter1: [],
//     chapter2: [],
// };
//
// const leftImage = document.getElementById("leftImage");
// const leftCanvas = document.getElementById("leftCanvas");
// const leftCtx = leftCanvas.getContext("2d");
//
// const rightImage = document.getElementById("rightImage");
// const rightCanvas = document.getElementById("rightCanvas");
// const rightCtx = rightCanvas.getContext("2d");
//
// leftCanvas.addEventListener("click", (e) => {
//     const rect = leftCanvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
//     console.log("left: " + x, y);
//     handleClick(x, y, "left");
// });
//
// rightCanvas.addEventListener("click", (e) => {
//     const rect = rightCanvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
//     console.log("right: " + x, y);
//     handleClick(x, y, "right");
// });
//
// function toRelative(x, y, radius, imgW = 480, imgH = 300) {
//     return {
//         x: x / imgW,
//         y: y / imgH,
//         radius: radius / Math.min(imgW, imgH)
//     };
// }
//
// const Chapters = {
//     chapter1: PhotoHuntLevels.slice(0, 14),
//     chapter2: PhotoHuntLevels.slice(14, 24),
// };
//
// let currentChapter = "chapter1";
// let activeLevels = pickLevels(Chapters[currentChapter], 10);
//
// function shuffleArray(array) {
//     let arr = [...array]; // copy
//     for (let i = arr.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [arr[i], arr[j]] = [arr[j], arr[i]];
//     }
//     return arr;
// }
//
// function pickLevels(chapterLevels, count = 10) {
//     return shuffleArray(chapterLevels).slice(0, count);
// }
//
// function disableClicks() {
//     gameOver = true;
// }
//
// function enableClicks() {
//     gameOver = false;
// }
//
// function drawShape(ctx, x, y, color = "red", radius = 20, shape = "circle", temporary = false, width = null, height = null) {
//     ctx.strokeStyle = color;
//     ctx.lineWidth = 3;
//
//     if (shape === "square" || shape === "rect") {
//         const w = width ?? radius * 2;
//         const h = height ?? radius * 2;
//         ctx.strokeRect(x - w / 2, y - h / 2, w, h);
//     } else {
//         ctx.beginPath();
//         ctx.arc(x, y, radius, 0, 2 * Math.PI);
//         ctx.stroke();
//     }
//
//     if (temporary) {
//         const clearW = (width ?? radius * 2) + 6;
//         const clearH = (height ?? radius * 2) + 6;
//         const image = ctx === leftCtx ? leftImage : rightImage;
//
//         setTimeout(() => {
//             // Clear shape area
//             ctx.clearRect(x - clearW / 2, y - clearH / 2, clearW, clearH);
//
//             // Redraw only the relevant part of the image
//             ctx.drawImage(
//                 image,
//                 x - clearW / 2, y - clearH / 2, clearW, clearH, // source from image
//                 x - clearW / 2, y - clearH / 2, clearW, clearH  // draw to canvas
//             );
//         }, Math.random() * 2500);
//     }
// }
//
//
// function loadLevel(levelIndex) {
//     const level = activeLevels[levelIndex];
//     updateProgressBar();
//     clearInterval(timerInterval);
//     found = [];
//     hintFound = [];
//     lives = 20;
//     hintsLeft = 3;
//     levelStartScore = score;
//     leftCtx.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
//     rightCtx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
//     enableClicks();
//     leftImage.src = level.images.left;
//     rightImage.src = level.images.right;
//
//     let loaded = 0;
//
//     function checkBothLoaded() {
//         if (++loaded === 2) {
//             // Wait for DOM to reflow so image size is correct
//             requestAnimationFrame(() => {
//                 resizeCanvases();
//             });
//         }
//     }
//
//     leftImage.onload = checkBothLoaded;
//     rightImage.onload = checkBothLoaded;
// }
//
// function resizeCanvases() {
//     leftCanvas.width = leftImage.naturalWidth;
//     leftCanvas.height = leftImage.naturalHeight;
//     rightCanvas.width = rightImage.naturalWidth;
//     rightCanvas.height = rightImage.naturalHeight;
//
//     leftCanvas.style.width = leftImage.offsetWidth + "px";
//     leftCanvas.style.height = leftImage.offsetHeight + "px";
//     rightCanvas.style.width = rightImage.offsetWidth + "px";
//     rightCanvas.style.height = rightImage.offsetHeight + "px";
//
//     leftCtx.drawImage(leftImage, 0, 0, leftCanvas.width, leftCanvas.height);
//     rightCtx.drawImage(rightImage, 0, 0, rightCanvas.width, rightCanvas.height);
// }
//
// function handleClick(x, y, side) {
//     if (gameOver) return;
//
//     const canvas = side === "left" ? leftCanvas : rightCanvas;
//     const ctx = side === "left" ? leftCtx : rightCtx;
//     const image = side === "left" ? leftImage : rightImage;
//
//     // Step 1: Scale the click to the image's natural/original resolution
//     const scaleX = image.naturalWidth / canvas.clientWidth;
//     const scaleY = image.naturalHeight / canvas.clientHeight;
//
//     const scaledX = x * scaleX;
//     const scaledY = y * scaleY;
//
//     const differences = activeLevels[currentLevel].differences;
//     for (let i = 0; i < differences.length; i++) {
//         const diff = differences[i];
//         if (found.includes(i)) continue;
//
//         const dx = diff.x;
//         const dy = diff.y;
//         const radius = diff.radius || 15;
//
//         // Check if the scaled click is within the difference radius
//         const dist = Math.sqrt((scaledX - dx) ** 2 + (scaledY - dy) ** 2);
//         if (dist <= radius) {
//             found.push(i);
//
//             drawShape(leftCtx, dx, dy, "lime", radius, diff.shape || "circle");
//             drawShape(rightCtx, dx, dy, "lime", radius, diff.shape || "circle");
//
//             updateScore(true);
//
//             if (found.length === differences.length) {
//                 const chapterKey = currentChapter;
//                 const levelIndexInChapter = Chapters[chapterKey].indexOf(activeLevels[currentLevel]);
//
//                 if (!completedLevels[chapterKey].includes(levelIndexInChapter)) {
//                     completedLevels[chapterKey].push(levelIndexInChapter);
//                     localStorage.setItem("completedLevels", JSON.stringify(completedLevels));
//                 }
//                 setTimeout(() => {
//                     currentLevel++;
//                     if (currentLevel >= activeLevels.length) {
//                         showEndScreen(true);
//                     } else {
//                         loadLevel(currentLevel);
//                     }
//                 }, 1500);
//             }
//             return;
//         }
//     }
//
//     // If not correct
//     updateScore(false);
//     lives--;
//
//     // Draw red circle where the user clicked
//     drawShape(ctx, x, y, "red", 20, "circle", true);
//
//     if (lives <= 0) {
//         showEndScreen(false);
//         disableClicks();
//     }
// }
//
// function showEndScreen(isWin) {
//     disableClicks();
//     document.getElementById("endScreen").style.display = "flex";
//     document.getElementById("endTitle").textContent = isWin ? "🎉 You Win!" : "💀 Game Over!";
//     document.getElementById("finalScore").textContent = `Your final score: ${score}`;
// }
//
// function restartGame() {
//     score = 0;
//     currentLevel = 0;
//     selectedLevel = 0;
//     lives = 20;
//     hintsLeft = 3;
//     comboStreak = 0;
//     gameOver = false;
//     clearInterval(timerInterval);
//     document.getElementById("progressBar").style.width = "0%";
//     document.getElementById("endScreen").style.display = "none";
//     showLevelSelectScreen();
// }
//
// function updateProgressBar() {
//     const percent = (currentLevel / activeLevels.length) * 100;
//     document.getElementById("progressBar").style.width = `${percent}%`;
// }
//
// function updateThemeUI(theme) {
//     document.body.classList.remove("light-theme", "dark-theme");
//     document.body.classList.add(`${theme}-theme`);
//     localStorage.setItem("theme", theme);
// }
//
// window.addEventListener("DOMContentLoaded", () => {
//     showChapterSelectScreen();
//
//     const savedTheme = localStorage.getItem("theme") || "light";
//     updateThemeUI(savedTheme);
//
// });
//
// function startGame() {
//     currentLevel = selectedLevel;
//     document.getElementById("startScreen").style.display = "none";
//     document.getElementById("levelSelectScreen").style.display = "none";
//     loadLevel(currentLevel);
// }
//
// function showChapterSelectScreen() {
//     const container = document.getElementById("chapterButtons");
//     container.innerHTML = "";
//
//     Object.keys(Chapters).forEach((chapterKey, i) => {
//         const btn = document.createElement("button");
//         btn.textContent = `Chapter ${i + 1}`;
//         btn.className = "level-btn";
//         btn.onclick = () => {
//             currentChapter = chapterKey;
//             activeLevels = pickLevels(Chapters[currentChapter], 10);
//             highlightSelectedChapter(chapterKey);
//         };
//         container.appendChild(btn);
//     });
//     document.getElementById("startScreen").style.display = "none";
//     document.getElementById("chapterSelectScreen").style.display = "flex";
// }
//
// function highlightSelectedChapter(chapterKey) {
//     const buttons = document.querySelectorAll("#chapterButtons button");
//     buttons.forEach(btn => {
//         btn.style.backgroundColor = btn.textContent.includes(chapterKey.split("chapter")[1]) ? "#5aafff" : "";
//     });
// }
//
// function goToLevelSelect() {
//     if (!currentChapter) {
//         alert("Please select a chapter first!");
//         return;
//     }
//     document.getElementById("chapterSelectScreen").style.display = "none";
//     showLevelSelectScreen();
// }
//
// function showLevelSelectScreen() {
//     const container = document.getElementById("levelButtons");
//     container.innerHTML = "";
//     activeLevels.forEach((_, index) => {
//         const btn = document.createElement("button");
//         btn.textContent = `Level ${index + 1}`;
//         btn.className = "level-btn";
//         btn.onclick = () => {
//             selectedLevel = index;
//             highlightSelectedLevel(index);
//         };
//         container.appendChild(btn);
//     });
//     highlightSelectedLevel(selectedLevel);
//     document.getElementById("startScreen").style.display = "none";
//     document.getElementById("levelSelectScreen").style.display = "flex";
// }
//
// function highlightSelectedLevel(index) {
//     const buttons = document.querySelectorAll("#levelButtons button");
//     buttons.forEach((btn, i) => {
//         btn.style.backgroundColor = i === index ? "#5aafff" : "";
//     });
// }
//
//
//
// function updateScore(isCorrect) {
//     if (isCorrect) {
//         comboStreak++;
//         let bonus = comboStreak >= 3 ? 5 : 0;
//         score += 10 + bonus;
//     } else {
//         comboStreak = 0;
//         score = Math.max(0, score - 5);
//     }
// }



//const PhotoHuntLevels = [
//     {
//         chapter: 1,
//         easy: [
//             {
//                 images: {
//                     left: "1.jpg",
//                     right: "r1.jpg"
//                 },
//                 differences: [
//                     {x: 70, y: 80, radius: 15},
//                     {x: 328, y: 38, radius: 15},
//                     {x: 406, y: 138, radius: 15},
//                     {x: 405, y: 242, radius: 15},
//                     {x: 217, y: 146, radius: 15},
//                     {x: 70, y: 230, radius: 15},
//                     {x: 155, y: 184, radius: 15}
//                 ]
//             },
//             {
//                 images: {
//                     left: "L4.jpg",
//                     right: "R4.jpg"
//                 },
//                 differences: [
//                     {x: 194, y: 270, radius: 15},
//                     {x: 374, y: 150, radius: 15},
//                     {x: 152, y: 430, radius: 15},
//                     {x: 392, y: 715, radius: 15},
//                     {x: 300, y: 130, radius: 15},
//                     {x: 520, y: 314, radius: 25, shape: 'square'},
//                     {x: 246, y: 930, radius: 15},
//                     {x: 480, y: 827, radius: 15},
//                     {x: 315, y: 430, radius: 20, shape: 'square'},
//                     {x: 30, y: 385, radius: 15, shape: 'square'},
//                     {x: 200, y: 40, radius: 15},
//                     {x: 485, y: 120, radius: 18, shape: 'square'}
//                 ]
//             }
//         ],
//         medium: [
//             // Medium difficulty levels for chapter 1
//         ],
//         hard: [
//             // Hard difficulty levels for chapter 1
//         ]
//     },
//     {
//         chapter: 2,
//         easy: [ /* ... */ ],
//         medium: [ /* ... */ ],
//         hard: [ /* ... */ ]
//     }
// ];


const PhotoHuntLevels = [
    {
        chapter: 1,
        easy: [
            {
                images: {
                    left: "images/Photo-hunt/Left/level15_left.jpg",
                    right: "images/Photo-hunt/Right/level15_right.jpg"
                },
                differences: [
                    {x: 115, y: 76, radius: 15},
                    {x: 98, y: 160, radius: 15},
                    {x: 500, y: 178, radius: 15},
                    {x: 360, y: 264, radius: 25, shape: "rect" },
                    {x: 142, y: 308, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/level10_left.jpg",
                    right: "images/Photo-hunt/Right/level10_right.jpg"
                },
                differences: [
                    {x: 105, y: 300, radius: 15},
                    {x: 300, y: 376, radius: 15},
                    {x: 368, y: 415, radius: 15},
                    {x: 388, y: 370, radius: 15},
                    {x: 35, y: 175, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/level9_left.jpg",
                    right: "images/Photo-hunt/Right/level9_right.jpg"
                },
                differences: [
                    {x: 268, y: 140, radius: 15},
                    {x: 478, y: 114, radius: 35, shape: "square" },
                    {x: 450, y: 306, radius: 25},
                    {x: 274, y: 410, radius: 15},
                    {x: 48, y: 442, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/level6_left.jpg",
                    right: "images/Photo-hunt/Right/level6_right.jpg"
                },
                differences: [
                    {x: 598, y: 45, radius: 25, shape: "rect" },
                    {x: 190, y: 215, radius: 20},
                    {x: 370, y: 228, radius: 20},
                    {x: 512, y: 288, radius: 20},
                    {x: 482, y: 215, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/level3_left.png",
                    right: "images/Photo-hunt/Right/level3_right.png"
                },
                differences: [
                    {x: 45, y: 50, radius: 15},
                    {x: 272, y: 32, radius: 15},
                    {x: 205, y: 114, radius: 15},
                    {x: 295, y: 144, radius: 15},
                    {x: 168, y: 290, radius: 15},
                    {x: 98, y: 340, radius: 15},
                    {x: 64, y: 224, radius: 15},
                    {x: 170, y: 492, radius: 15},
                    {x: 342, y: 518, radius: 15},
                    {x: 340, y: 405, radius: 24},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/level5_left.jpg",
                    right: "images/Photo-hunt/Right/level5_right.jpg"
                },
                differences: [
                    {x: 200, y: 284, radius: 15},
                    {x: 100, y: 35, radius: 20, shape: "square" },
                    {x: 130, y: 430, radius: 15},
                    {x: 45, y: 465, radius: 15},
                    {x: 100, y: 598, radius: 15},
                    {x: 293, y: 570, radius: 15},
                    {x: 328, y: 450, radius: 15},
                    {x: 448, y: 390, radius: 15},
                    {x: 308, y: 100, radius: 20},
                    {x: 20, y: 198, radius: 30, shape: "square" },
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/level7_left.jpg",
                    right: "images/Photo-hunt/Right/level7_right.jpg"
                },
                differences: [
                    {x: 598, y: 52, radius: 25},
                    {x: 500, y: 95, radius: 15},
                    {x: 330, y: 355, radius: 15},
                    {x: 462, y: 328, radius: 15},
                    {x: 210, y: 400, radius: 15},
                    {x: 68, y: 305, radius: 15},
                    {x: 80, y: 120, radius: 15},
                    {x: 218, y: 198, radius: 15},
                    {x: 370, y: 158, radius: 15},
                    {x: 450, y: 160, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/level8_left.jpg",
                    right: "images/Photo-hunt/Right/level8_right.jpg"
                },
                differences: [
                    {x: 558, y: 144, radius: 35, shape: "rect" },
                    {x: 572, y: 374, radius: 15},
                    {x: 458, y: 266, radius: 15},
                    {x: 420, y: 148, radius: 15},
                    {x: 348, y: 88, radius: 15},
                    {x: 190, y: 254, radius: 15},
                    {x: 230, y: 138, radius: 15},
                    {x: 120, y: 356, radius: 15},
                    {x: 348, y: 272, radius: 15},
                    {x: 205, y: 346, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/level11_left.jpg",
                    right: "images/Photo-hunt/Right/level11_right.jpg"
                },
                differences: [
                    {x: 578, y: 32, radius: 15},
                    {x: 566, y: 155, radius: 15},
                    {x: 600, y: 365, radius: 15},
                    {x: 280, y: 333, radius: 15},
                    {x: 414, y: 380, radius: 15},
                    {x: 165, y: 178, radius: 15},
                    {x: 15, y: 198, radius: 15},
                    {x: 138, y: 72, radius: 15},
                    {x: 210, y: 50, radius: 15},
                    {x: 455, y: 265, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/level13_left.jpg",
                    right: "images/Photo-hunt/Right/level13_right.jpg"
                },
                differences: [
                    {x: 265, y: 144, radius: 15},
                    {x: 68, y: 72, radius: 15},
                    {x: 90, y: 178, radius: 15},
                    {x: 208, y: 202, radius: 15},
                    {x: 136, y: 310, radius: 15},
                    {x: 78, y: 244, radius: 15},
                    {x: 410, y: 388, radius: 15},
                    {x: 608, y: 144, radius: 15},
                    {x: 420, y: 222, radius: 15},
                    {x: 502, y: 88, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/level14_left.jpg",
                    right: "images/Photo-hunt/Right/level14_right.jpg"
                },
                differences: [
                    {x: 504, y: 163, radius: 15},
                    {x: 524, y: 260, radius: 15},
                    {x: 580, y: 336, radius: 15},
                    {x: 398, y: 256, radius: 15},
                    {x: 253, y: 246, radius: 15},
                    {x: 260, y: 42, radius: 15},
                    {x: 254, y: 310, radius: 15},
                    {x: 124, y: 286, radius: 15},
                    {x: 38, y: 312, radius: 15},
                    {x: 160, y: 166, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/level12_left.jpg",
                    right: "images/Photo-hunt/Right/level12_right.jpg"
                },
                differences: [
                    {x: 400, y: 84, radius: 15},
                    {x: 508, y: 178, radius: 15},
                    {x: 478, y: 358, radius: 15},
                    {x: 324, y: 354, radius: 15},
                    {x: 126, y: 188, radius: 15},
                    {x: 60, y: 140, radius: 15},
                    {x: 286, y: 105, radius: 15},
                    {x: 288, y: 178, radius: 15},
                    {x: 252, y: 230, radius: 15},
                    {x: 204, y: 76, radius: 15},
                    {x: 14, y: 240, radius: 15},
                    {x: 378, y: 272, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/1.jpg",
                    right: "images/Photo-hunt/Right/1.jpg"
                }, differences: [
                    {x: 70, y: 80, radius: 15},
                    {x: 328, y: 38, radius: 15},
                    {x: 406, y: 138, radius: 15},
                    {x: 405, y: 242, radius: 15},
                    {x: 217, y: 146, radius: 15},
                    {x: 70, y: 230, radius: 15},
                    {x: 155, y: 184, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/2.jpg",
                    right: "images/Photo-hunt/Right/2.jpg"
                },
                differences: [
                    {x: 340, y: 408, radius: 15},
                    {x: 84, y: 318, radius: 15},
                    {x: 105, y: 108, radius: 15},
                    {x: 30, y: 220, radius: 15},
                    {x: 180, y: 74, radius: 15},
                    {x: 340, y: 216, radius: 15},
                    {x: 312, y: 160, radius: 15},
                    {x: 316, y: 330, radius: 15},
                    {x: 391, y: 218, radius: 15},
                    {x: 100, y: 458, radius: 15},
                ]
            },
            // more easy levels…
        ],
        medium: [
            // medium levels for chapter 1
        ],
        hard: [
            // hard levels for chapter 1
        ]
    },
    {
        chapter: 2,
        easy: [
            {
                images: {
                    left: "images/Photo-hunt/Left/L3.jpg",
                    right: "images/Photo-hunt/Right/R3.jpg"
                },
                differences: [
                    {x: 420, y: 45, radius: 20, shape: "square" },
                    {x: 430, y: 132, radius: 15, width: 10, height: 25, shape: "rect" },
                    {x: 288, y: 202, radius: 15},
                    {x: 230, y: 298, radius: 15},
                    {x: 188, y: 232, radius: 15},
                    {x: 188, y: 85, radius: 15},
                    {x: 315, y: 170, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L2.jpg",
                    right: "images/Photo-hunt/Right/R2.jpg"
                },
                differences: [
                    {x: 354, y: 48, radius: 15},
                    {x: 540, y: 90, radius: 15},
                    {x: 332, y: 125, radius: 15},
                    {x: 105, y: 220, radius: 15},
                    {x: 25, y: 365, radius: 15},
                    {x: 365, y: 415, radius: 15},
                    {x: 575, y: 368, radius: 15},
                    {x: 272, y: 282, radius: 15},
                    {x: 165, y: 175, radius: 15},
                    {x: 655, y: 295, radius: 15},
                    {x: 440, y: 340, radius: 15},
                    {x: 345, y: 283, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/l.jpg",
                    right: "images/Photo-hunt/Right/r.jpg"
                },
                differences: [
                    {x: 435, y: 220, radius: 15},
                    {x: 555, y: 140, radius: 15},
                    {x: 440, y: 650, radius: 15},
                    {x: 135, y: 715, radius: 15},
                    {x: 85, y: 490, radius: 15},
                    {x: 240, y: 490, radius: 15},
                    {x: 625, y: 940, radius: 15},
                    {x: 220, y: 235, radius: 15},
                    {x: 395, y: 50, h: 10, w: 45},
                    {x: 470, y: 470, radius: 15},
                    {x: 660, y: 500, radius: 15},
                    {x: 615, y: 735, radius: 15},
                    {x: 220, y: 105, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L1.jpg",
                    right: "images/Photo-hunt/Right/R1.jpg"
                },
                differences: [
                    {x: 220, y: 495, radius: 15},
                    {x: 640, y: 70, radius: 15},
                    {x: 220, y: 345, radius: 15},
                    {x: 145, y: 140, radius: 15},
                    {x: 525, y: 225, radius: 15},
                    {x: 390, y: 640, radius: 15},
                    {x: 475, y: 640, radius: 15},
                    {x: 585, y: 840, radius: 15},
                    {x: 45, y: 500, radius: 15},
                    {x: 600, y: 460, radius: 15},
                    {x: 605, y: 570, radius: 15},
                    {x: 520, y: 340, radius: 15},
                    {x: 105, y: 610, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/AnimalFarm-Left.jpg",
                    right: "images/Photo-hunt/Right/AnimalFarm-Right.jpg"
                },
                differences: [
                    {x: 270, y: 80, radius: 15},
                    {x: 340, y: 150, radius: 15},
                    {x: 170, y: 160, radius: 15},
                    {x: 75, y: 120, radius: 15},
                    {x: 320, y: 25, radius: 15},
                    {x: 10, y: 180, radius: 15},
                    {x: 30, y: 340, radius: 15},
                    {x: 150, y: 390, radius: 15},
                    {x: 255, y: 405, radius: 15},
                    {x: 280, y: 285, radius: 15},
                    {x: 235, y: 255, radius: 15},
                    {x: 330, y: 415, radius: 15},
                    {x: 370, y: 250, radius: 15},
                    {x: 375, y: 170, radius: 15},
                    {x: 260, y: 180, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L4.jpg",
                    right: "images/Photo-hunt/Right/R4.jpg"
                },
                differences: [
                    {x: 194, y: 270, radius: 15},
                    {x: 374, y: 150, radius: 15},
                    {x: 152, y: 430, radius: 15},
                    {x: 392, y: 715, radius: 15},
                    {x: 300, y: 130, radius: 15},
                    {x: 520, y: 314, radius: 25, shape: 'square'},
                    {x: 246, y: 930, radius: 15},
                    {x: 480, y: 827, radius: 15},
                    {x: 315, y: 430, radius: 20, shape: 'square'},
                    {x: 30, y: 385, radius: 15, shape: 'square'},
                    {x: 200, y: 40, radius: 15},
                    {x: 485, y: 120, radius: 18, shape: 'square'},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L5.jpg",
                    right: "images/Photo-hunt/Right/R5.jpg"
                },
                differences: [
                    {x: 138, y: 455, radius: 20, shape: 'square'},
                    {x: 450, y: 410, radius: 15, shape: 'square'},
                    {x: 560, y: 320, radius: 15},
                    {x: 90, y: 822, radius: 15},
                    {x: 298, y: 815, radius: 20, shape: 'square'},
                    {x: 520, y: 820, radius: 20, shape: 'square'},
                    {x: 42, y: 658, radius: 15},
                    {x: 562, y: 155, radius: 15},
                    {x: 520, y: 615, radius: 25, shape: 'square'},
                    {x: 350, y: 90, radius: 30, shape: 'square'},
                    {x: 190, y: 655, radius: 15},
                    {x: 595, y: 435, radius: 18},
                    {x: 128, y: 270, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L6.jpg",
                    right: "images/Photo-hunt/Right/R6.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                    {x: 165, y: 772, radius: 25, shape: 'square'},
                    {x: 142, y: 938, radius: 15, shape: 'square'},
                    {x: 465, y: 180, radius: 30},
                    {x: 35, y: 375, radius: 15},
                    {x: 555, y: 380, radius: 35, shape: 'square'},
                    {x: 455, y: 565, radius: 35, shape: 'square'},
                    {x: 108, y: 270, radius: 15},
                    {x: 355, y: 346, radius: 15},
                    {x: 500, y: 50, radius: 15},
                ]
            }, {
                // ---------------------Point------Stop-----Break--------------------------
                images: {
                    left: "images/Photo-hunt/Left/L7.jpg",
                    right: "images/Photo-hunt/Right/R7.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                    {x: 500, y: 50, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L8.jpg",
                    right: "images/Photo-hunt/Right/R8.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                    {x: 500, y: 50, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L9.jpg",
                    right: "images/Photo-hunt/Right/R9.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                    {x: 500, y: 50, radius: 15},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L10.jpg",
                    right: "images/Photo-hunt/Right/R10.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L11.jpg",
                    right: "images/Photo-hunt/Right/R11.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L12.jpg",
                    right: "images/Photo-hunt/Right/R12.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L13.jpg",
                    right: "images/Photo-hunt/Right/R13.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L14.jpg",
                    right: "images/Photo-hunt/Right/R14.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L15.jpg",
                    right: "images/Photo-hunt/Right/R15.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L16.jpg",
                    right: "images/Photo-hunt/Right/R16.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L17.jpg",
                    right: "images/Photo-hunt/Right/R17.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L18.jpg",
                    right: "images/Photo-hunt/Right/R18.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L19.jpg",
                    right: "images/Photo-hunt/Right/R19.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L20.jpg",
                    right: "images/Photo-hunt/Right/R20.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L21.jpg",
                    right: "images/Photo-hunt/Right/R21.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L22.jpg",
                    right: "images/Photo-hunt/Right/R22.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L23.jpg",
                    right: "images/Photo-hunt/Right/R23.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L24.jpg",
                    right: "images/Photo-hunt/Right/R24.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L25.jpg",
                    right: "images/Photo-hunt/Right/R25.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L26.jpg",
                    right: "images/Photo-hunt/Right/R26.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L27.jpg",
                    right: "images/Photo-hunt/Right/R27.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L28.jpg",
                    right: "images/Photo-hunt/Right/R28.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L29.jpg",
                    right: "images/Photo-hunt/Right/R29.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L30.jpg",
                    right: "images/Photo-hunt/Right/R30.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L31.jpg",
                    right: "images/Photo-hunt/Right/R31.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            }, {
                images: {
                    left: "images/Photo-hunt/Left/L32.jpg",
                    right: "images/Photo-hunt/Right/R32.jpg"
                },
                differences: [
                    {x: 468, y: 710, radius: 30, shape: 'square'},
                    {x: 308, y: 714, radius: 15},
                    {x: 255, y: 265, radius: 20},
                ]
            },
            // more easy levels for chapter 2…
        ],
        medium: [
            // medium levels for chapter 2
        ],
        hard: [
            // hard levels for chapter 2
        ]
    }
];