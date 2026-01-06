const IMAGE_PATH = "images/Jigsaw-puzzle/";
const chapters = {
    levels: [
        {image: `${IMAGE_PATH}L1.jpg`},
        {image: `${IMAGE_PATH}L2.jpg`},
        {image: `${IMAGE_PATH}L3.jpg`},
        {image: `${IMAGE_PATH}L4.jpg`},
        {image: `${IMAGE_PATH}L5.jpg`},
        {image: `${IMAGE_PATH}L6.jpg`},
        {image: `${IMAGE_PATH}L7.jpg`},
        {image: `${IMAGE_PATH}L8.jpg`},
        {image: `${IMAGE_PATH}L9.jpg`},
        {image: `${IMAGE_PATH}L10.jpg`},
    ],
};

const LEVELS = [
    {
        id: 0,
        name: "Level 1",
        image: `${IMAGE_PATH}L1.jpg`,
        modes: [
            { name: "Easy", pieces: 12, rotation: false },
            { name: "Medium", pieces: 25, rotation: false },
            { name: "Hard", pieces: 50, rotation: true }
        ]
    },
    {
        id: 1,
        name: "Level 2",
        image: `${IMAGE_PATH}L2.jpg`,
        modes: [
            { name: "Easy", pieces: 25, rotation: false },
            { name: "Hard", pieces: 50, rotation: true },
            { name: "Extreme", pieces: 100, rotation: true }
        ]
    }
];

let selectedLevel = null;
let selectedMode = null;