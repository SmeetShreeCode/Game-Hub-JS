const levels = [
    {
        boards: [
            {x: 400, y: 300, w: 300, h: 20, color: '#b36'},
            {x: 400, y: 400, w: 200, h: 20, color: '#6b3'},
        ],
        screws: [
            {x: 300, y: 300, boardIndex: 0},
            {x: 500, y: 300, boardIndex: 0},
            {x: 400, y: 400, boardIndex: 1},
        ],
        order: [0, 1, 2]
    },
    {
        boards: [
            {x: 400, y: 250, w: 300, h: 20, color: '#3b7'},
            {x: 400, y: 350, w: 250, h: 20, color: '#c63'},
        ],
        screws: [
            {x: 300, y: 250, boardIndex: 0},
            {x: 500, y: 250, boardIndex: 0},
            {x: 400, y: 350, boardIndex: 1},
        ],
        order: [2, 0, 1]
    },
    {
        boards: [
            {x: 400, y: 200, w: 350, h: 20, color: '#3a9'},
            {x: 400, y: 300, w: 250, h: 20, color: '#c39'},
            {x: 400, y: 400, w: 200, h: 20, color: '#9c3'},
        ],
        screws: [
            {x: 300, y: 200, boardIndex: 0},
            {x: 500, y: 200, boardIndex: 0},
            {x: 325, y: 300, boardIndex: 1},
            {x: 475, y: 300, boardIndex: 1},
            {x: 400, y: 400, boardIndex: 2},
        ],
        order: [0, 1, 2, 3, 4]
    },
    {
        boards: [
            {x: 400, y: 200, w: 350, h: 20, color: '#8e1818'},
            {x: 400, y: 300, w: 250, h: 20, color: '#c39'},
            {x: 400, y: 400, w: 200, h: 20, color: '#9c3'},
            {x: 400, y: 100, w: 450, h: 20, color: '#3a9'},
        ],
        screws: [
            {x: 300, y: 200, boardIndex: 0},
            {x: 500, y: 200, boardIndex: 0},
            {x: 325, y: 300, boardIndex: 1},
            {x: 475, y: 300, boardIndex: 1},
            {x: 400, y: 400, boardIndex: 2},
            {x: 500, y: 100, boardIndex: 3},
            {x: 400, y: 100, boardIndex: 3},
            {x: 300, y: 100, boardIndex: 3},
        ],
        order: [0, 1, 2, 3, 4, 5, 6, 7]
    },
    {
        boards: [
            {x: 400, y: 200, w: 350, h: 20, color: '#8e1818'},
            {x: 400, y: 300, w: 250, h: 20, color: '#c39'},
            {x: 400, y: 400, w: 200, h: 20, color: '#9c3'},
            {x: 400, y: 100, w: 450, h: 20, color: '#3a9'},
            {x: 500, y: 150, w: 100, h: 20, color: '#01594c'},
        ],
        screws: [
            {x: 300, y: 200, boardIndex: 0},
            {x: 500, y: 200, boardIndex: 0},
            {x: 325, y: 300, boardIndex: 1},
            {x: 475, y: 300, boardIndex: 1},
            {x: 400, y: 400, boardIndex: 2},
            {x: 500, y: 100, boardIndex: 3},
            {x: 400, y: 100, boardIndex: 3},
            {x: 300, y: 100, boardIndex: 3},
            {x: 530, y: 150, boardIndex: 4},
            {x: 480, y: 150, boardIndex: 4},
        ],
        order: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
];