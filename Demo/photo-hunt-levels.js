const PhotoHuntLevels = [
    {
        chapter: 1,
        easy: [
            {
                images: {
                    left: "1.jpg",
                    right: "r1.jpg"
                },
                differences: [
                    {x: 70, y: 80, radius: 15},
                    {x: 328, y: 38, radius: 15},
                    {x: 406, y: 138, radius: 15},
                    {x: 405, y: 242, radius: 15},
                    {x: 217, y: 146, radius: 15},
                    {x: 70, y: 230, radius: 15},
                    {x: 155, y: 184, radius: 15}
                ]
            },
            {
                images: {
                    left: "L4.jpg",
                    right: "R4.jpg"
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
                    {x: 485, y: 120, radius: 18, shape: 'square'}
                ]
            }
        ],
        medium: [
            // Medium difficulty levels for chapter 1
        ],
        hard: [
            // Hard difficulty levels for chapter 1
        ]
    },
    {
        chapter: 2,
        easy: [ /* ... */ ],
        medium: [ /* ... */ ],
        hard: [ /* ... */ ]
    }
];

// leftImg.addEventListener('touchstart', function (e) {
//     const rect = leftImg.getBoundingClientRect();
//     const touch = e.touches[0];
//     const x = touch.clientX - rect.left;
//     const y = touch.clientY - rect.top;
//     handleClick(x, y);
// });
//
// rightImg.addEventListener('touchstart', function (e) {
//     const rect = rightImg.getBoundingClientRect();
//     const touch = e.touches[0];
//     const x = touch.clientX - rect.left;
//     const y = touch.clientY - rect.top;
//     handleClick(x, y);
// });
//leftImage.addEventListener("touchstart", handleTouch);
// rightImage.addEventListener("touchstart", handleTouch);
//
// function handleTouch(e) {
//     const rect = e.target.getBoundingClientRect();
//     const touch = e.touches[0];
//     const x = touch.clientX - rect.left;
//     const y = touch.clientY - rect.top;
//     const side = e.target.id === "leftImage" ? "left" : "right";
//     handleClick(x, y, side);
// }