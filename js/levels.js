const levels = [{
    images: {
        left: "images/Left/level1_left.jpg",
        right: "images/Right/level1_right.jpg"
    }, differences: [
        {x: 170, y: 85, radius: 20},
        {x: 100, y: 130, radius: 20},
        {x: 180, y: 200, radius: 20},
    ]
}, {
    images: {
        left: "images/Left/level2_left.jpg",
        right: "images/Right/level2_right.jpg"
    },
    differences: [
        {x: 60, y: 125, radius: 15},
        {x: 200, y: 130, radius: 15},
        {x: 280, y: 170, radius: 15},
        {x: 280, y: 60, radius: 15},
    ]
}, {
    images: {
        left: "images/Left/level15_left.jpg",
        right: "images/Right/level15_right.jpg"
    },
    differences: [
        {x: 275, y: 115, radius: 15},
        {x: 205, y: 165, radius: 15},
        {x: 100, y: 185, radius: 15},
        {x: 70, y: 110, radius: 15},
        {x: 85, y: 65, radius: 15},
    ]
}, {
    images: {
        left: "images/Left/level10_left.jpg",
        right: "images/Right/level10_right.jpg"
    },
    differences: [
        {x: 245, y: 230, radius: 15},
        {x: 230, y: 260, radius: 15},
        {x: 185, y: 230, radius: 15},
        {x: 85, y: 195, radius: 15},
        {x: 45, y: 125, radius: 15},
    ]
}, {
    images: {
        left: "images/Left/level9_left.jpg",
        right: "images/Right/level9_right.jpg"
    },
    differences: [
        {x: 260, y: 80, radius: 30},
        {x: 155, y: 220, radius: 15},
        {x: 145, y: 95, radius: 15},
        {x: 50, y: 230, radius: 15},
        {x: 230, y: 170, radius: 25},
    ]
}, {
    images: {
        left: "images/Left/level6_left.jpg",
        right: "images/Right/level6_right.jpg"
    },
    differences: [
        {x: 255, y: 160, radius: 15},
        {x: 235, y: 125, radius: 15},
        {x: 300, y: 55, radius: 15},
        {x: 110, y: 125, radius: 15},
        {x: 190, y: 130, radius: 15},
    ]
}, {
    images: {
        left: "images/Left/level3_left.png",
        right: "images/Right/level3_right.png"
    },
    differences: [
        {x: 55, y: 60, radius: 15},
        {x: 235, y: 135, radius: 15},
        {x: 70, y: 195, radius: 15},
        {x: 270, y: 405, radius: 15},
        {x: 220, y: 50, radius: 15},
        {x: 275, y: 325, radius: 15},
        {x: 145, y: 245, radius: 15},
        {x: 95, y: 275, radius: 15},
        {x: 175, y: 100, radius: 15},
        {x: 145, y: 390, radius: 15},
    ]
}, {
    images: {
        left: "images/Left/level5_left.jpg",
        right: "images/Right/level5_right.jpg"
    },
    differences: [
        {x: 50, y: 315, radius: 15},
        {x: 100, y: 285, radius: 15},
        {x: 210, y: 85, radius: 15},
        {x: 40, y: 155, radius: 15},
        {x: 225, y: 300, radius: 15},
        {x: 150, y: 200, radius: 15},
        {x: 85, y: 50, radius: 15},
        {x: 200, y: 380, radius: 15},
        {x: 85, y: 395, radius: 15},
        {x: 300, y: 270, radius: 15},
    ]
}, {
    images: {
        left: "images/Left/level7_left.jpg",
        right: "images/Right/level7_right.jpg"
    },
    differences: [
        {x: 60, y: 75, radius: 15},
        {x: 255, y: 70, radius: 15},
        {x: 295, y: 55, radius: 15},
        {x: 240, y: 180, radius: 15},
        {x: 230, y: 100, radius: 15},
        {x: 190, y: 100, radius: 15},
        {x: 120, y: 215, radius: 15},
        {x: 120, y: 115, radius: 15},
        {x: 60, y: 170, radius: 15},
        {x: 175, y: 190, radius: 15},
    ]
}, {
    images: {
        left: "images/Left/level8_left.jpg",
        right: "images/Right/level8_right.jpg"
    },
    differences: [
        {x: 265, y: 105, radius: 15},
        {x: 285, y: 200, radius: 15},
        {x: 215, y: 95, radius: 15},
        {x: 105, y: 145, radius: 15},
        {x: 180, y: 155, radius: 15},
        {x: 175, y: 75, radius: 15},
        {x: 125, y: 90, radius: 15},
        {x: 75, y: 190, radius: 15},
        {x: 235, y: 150, radius: 15},
        {x: 115, y: 185, radius: 15},
    ]
}, {
    images: {
        left: "images/Left/level11_left.jpg",
        right: "images/Right/level11_right.jpg"
    },
    differences: [
        {x: 100, y: 110, radius: 15},
        {x: 90, y: 60, radius: 15},
        {x: 125, y: 55, radius: 15},
        {x: 230, y: 145, radius: 15},
        {x: 220, y: 205, radius: 15},
        {x: 305, y: 195, radius: 15},
        {x: 290, y: 45, radius: 15},
        {x: 150, y: 180, radius: 15},
        {x: 30, y: 115, radius: 15},
        {x: 285, y: 100, radius: 15},
    ]
}, {
    images: {
        left: "images/Left/level13_left.jpg",
        right: "images/Right/level13_right.jpg"
    },
    differences: [
        {x: 250, y: 65, radius: 15},
        {x: 305, y: 100, radius: 15},
        {x: 55, y: 60, radius: 15},
        {x: 150, y: 95, radius: 15},
        {x: 215, y: 204, radius: 15},
        {x: 115, y: 125, radius: 15},
        {x: 65, y: 110, radius: 15},
        {x: 85, y: 175, radius: 15},
        {x: 52, y: 145, radius: 15},
        {x: 220, y: 130, radius: 15},
    ]
}, {
    images: {
        left: "images/Left/level14_left.jpg",
        right: "images/Right/level14_right.jpg"
    },
    differences: [
        {x: 135, y: 45, radius: 15},
        {x: 245, y: 100, radius: 15},
        {x: 100, y: 100, radius: 15},
        {x: 40, y: 175, radius: 15},
        {x: 135, y: 175, radius: 15},
        {x: 75, y: 160, radius: 15},
        {x: 290, y: 180, radius: 15},
        {x: 260, y: 145, radius: 15},
        {x: 140, y: 140, radius: 15},
        {x: 210, y: 140, radius: 15},
    ]
}, {
    images: {
        left: "images/Left/level12_left.jpg",
        right: "images/Right/level12_right.jpg"
    },
    differences: [
        {x: 65, y: 105, radius: 15},
        {x: 255, y: 85, radius: 15},
        {x: 295, y: 240, radius: 15},
        {x: 195, y: 95, radius: 15},
        {x: 165, y: 165, radius: 15},
        {x: 35, y: 170, radius: 15},
        {x: 140, y: 75, radius: 15},
        {x: 195, y: 135, radius: 15},
        {x: 100, y: 130, radius: 15},
        {x: 210, y: 235, radius: 15},
        {x: 245, y: 190, radius: 15},
        {x: 315, y: 130, radius: 15},
    ]
},
];