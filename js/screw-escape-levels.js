const levels = [
    {
        boards: [
            {
                shape: "rect",
                x: 400,
                y: 300,
                w: 300,
                h: 20,
                color: "#b36"
            },
            {
                shape: "circle",
                x: 400,
                y: 400,
                radius: 40,
                color: "#6b3"
            }
        ],
        screws: [
            {
                x: 300,
                y: 300,
                boardIndex: 0
            },
            {
                x: 500,
                y: 300,
                boardIndex: 0
            },
            {
                x: 400,
                y: 400,
                boardIndex: 1
            }
        ],
        order: [
            0,
            1,
            2
        ]
    },
    {
        boards: [
            {
                shape: "roundRect",
                x: 400,
                y: 250,
                w: 300,
                h: 20,
                radius: 12,
                color: "#3b7"
            },
            {
                shape: "polygon",
                x: 400,
                y: 350,
                sides: 5,
                radius: 50,
                color: "#c63"
            }
        ],
        screws: [
            {
                x: 300,
                y: 250,
                boardIndex: 0
            },
            {
                x: 500,
                y: 250,
                boardIndex: 0
            },
            {
                x: 400,
                y: 350,
                boardIndex: 1
            }
        ],
        order: [
            2,
            0,
            1
        ]
    },
    {
        boards: [
            {
                shape: "circle",
                x: 400,
                y: 200,
                radius: 60,
                color: "#3a9"
            },
            {
                shape: "rect",
                x: 400,
                y: 300,
                w: 250,
                h: 20,
                color: "#c39"
            },
            {
                shape: "polygon",
                x: 400,
                y: 400,
                sides: 6,
                radius: 50,
                color: "#9c3"
            }
        ],
        screws: [
            {
                x: 360,
                y: 200,
                boardIndex: 0
            },
            {
                x: 440,
                y: 200,
                boardIndex: 0
            },
            {
                x: 325,
                y: 300,
                boardIndex: 1
            },
            {
                x: 475,
                y: 300,
                boardIndex: 1
            },
            {
                x: 400,
                y: 400,
                boardIndex: 2
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4
        ]
    },
    {
        boards: [
            {
                shape: "polygon",
                x: 400,
                y: 200,
                sides: 8,
                radius: 90,
                color: "#8e1818"
            },
            {
                shape: "rect",
                x: 400,
                y: 300,
                w: 250,
                h: 20,
                color: "#c39"
            },
            {
                shape: "circle",
                x: 400,
                y: 400,
                radius: 45,
                color: "#9c3"
            },
            {
                shape: "roundRect",
                x: 400,
                y: 100,
                w: 450,
                h: 20,
                radius: 12,
                color: "#3a9"
            }
        ],
        screws: [
            {
                x: 330,
                y: 200,
                boardIndex: 0
            },
            {
                x: 470,
                y: 200,
                boardIndex: 0
            },
            {
                x: 325,
                y: 300,
                boardIndex: 1
            },
            {
                x: 475,
                y: 300,
                boardIndex: 1
            },
            {
                x: 400,
                y: 400,
                boardIndex: 2
            },
            {
                x: 500,
                y: 100,
                boardIndex: 3
            },
            {
                x: 400,
                y: 100,
                boardIndex: 3
            },
            {
                x: 300,
                y: 100,
                boardIndex: 3
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7
        ]
    },
    {
        boards: [
            {
                shape: "polygon",
                x: 400,
                y: 200,
                sides: 6,
                radius: 90,
                color: "#8e1818"
            },
            {
                shape: "roundRect",
                x: 400,
                y: 300,
                w: 250,
                h: 20,
                radius: 12,
                color: "#c39"
            },
            {
                shape: "circle",
                x: 400,
                y: 400,
                radius: 45,
                color: "#9c3"
            },
            {
                shape: "rect",
                x: 400,
                y: 100,
                w: 450,
                h: 20,
                color: "#3a9"
            },
            {
                shape: "polygon",
                x: 500,
                y: 150,
                sides: 3,
                radius: 50,
                color: "#01594c"
            }
        ],
        screws: [
            {
                x: 330,
                y: 200,
                boardIndex: 0
            },
            {
                x: 470,
                y: 200,
                boardIndex: 0
            },
            {
                x: 325,
                y: 300,
                boardIndex: 1
            },
            {
                x: 475,
                y: 300,
                boardIndex: 1
            },
            {
                x: 400,
                y: 400,
                boardIndex: 2
            },
            {
                x: 500,
                y: 100,
                boardIndex: 3
            },
            {
                x: 400,
                y: 100,
                boardIndex: 3
            },
            {
                x: 300,
                y: 100,
                boardIndex: 3
            },
            {
                x: 530,
                y: 150,
                boardIndex: 4
            },
            {
                x: 480,
                y: 150,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "roundRect",
                x: 400,
                y: 100,
                w: 350,
                h: 20,
                radius: 12,
                color: "#8e1818"
            },
            {
                shape: "polygon",
                x: 400,
                y: 200,
                sides: 4,
                radius: 70,
                color: "#c39"
            },
            {
                shape: "circle",
                x: 400,
                y: 300,
                radius: 50,
                color: "#9c3"
            },
            {
                shape: "rect",
                x: 400,
                y: 50,
                w: 450,
                h: 20,
                color: "#3a9"
            },
            {
                shape: "polygon",
                x: 500,
                y: 250,
                sides: 5,
                radius: 40,
                color: "#01594c"
            }
        ],
        screws: [
            {
                x: 300,
                y: 100,
                boardIndex: 0
            },
            {
                x: 500,
                y: 100,
                boardIndex: 0
            },
            {
                x: 400,
                y: 200,
                boardIndex: 1
            },
            {
                x: 350,
                y: 200,
                boardIndex: 1
            },
            {
                x: 400,
                y: 300,
                boardIndex: 2
            },
            {
                x: 500,
                y: 50,
                boardIndex: 3
            },
            {
                x: 400,
                y: 50,
                boardIndex: 3
            },
            {
                x: 300,
                y: 50,
                boardIndex: 3
            },
            {
                x: 530,
                y: 250,
                boardIndex: 4
            },
            {
                x: 480,
                y: 250,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "polygon",
                x: 420,
                y: 180,
                sides: 5,
                radius: 80,
                color: "#7a1a9a"
            },
            {
                shape: "circle",
                x: 420,
                y: 300,
                radius: 55,
                color: "#1cb35c"
            },
            {
                shape: "rect",
                x: 420,
                y: 100,
                w: 420,
                h: 20,
                color: "#2a89c9"
            },
            {
                shape: "roundRect",
                x: 520,
                y: 240,
                w: 260,
                h: 20,
                radius: 12,
                color: "#c96"
            },
            {
                shape: "polygon",
                x: 320,
                y: 240,
                sides: 6,
                radius: 45,
                color: "#aa4c0c"
            }
        ],
        screws: [
            {
                x: 360,
                y: 180,
                boardIndex: 0
            },
            {
                x: 480,
                y: 180,
                boardIndex: 0
            },
            {
                x: 420,
                y: 300,
                boardIndex: 1
            },
            {
                x: 520,
                y: 100,
                boardIndex: 2
            },
            {
                x: 420,
                y: 100,
                boardIndex: 2
            },
            {
                x: 320,
                y: 100,
                boardIndex: 2
            },
            {
                x: 642,
                y: 240,
                boardIndex: 3
            },
            {
                x: 398,
                y: 240,
                boardIndex: 3
            },
            {
                x: 350,
                y: 240,
                boardIndex: 4
            },
            {
                x: 290,
                y: 240,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "rect",
                x: 400,
                y: 90,
                w: 350,
                h: 20,
                color: "#4d9f3a"
            },
            {
                shape: "circle",
                x: 400,
                y: 200,
                radius: 60,
                color: "#df3b7a"
            },
            {
                shape: "polygon",
                x: 520,
                y: 260,
                sides: 3,
                radius: 55,
                color: "#0f7b80"
            },
            {
                shape: "roundRect",
                x: 280,
                y: 260,
                w: 240,
                h: 20,
                radius: 12,
                color: "#c44"
            },
            {
                shape: "polygon",
                x: 400,
                y: 340,
                sides: 7,
                radius: 50,
                color: "#5577aa"
            }
        ],
        screws: [
            {
                x: 300,
                y: 90,
                boardIndex: 0
            },
            {
                x: 500,
                y: 90,
                boardIndex: 0
            },
            {
                x: 400,
                y: 200,
                boardIndex: 1
            },
            {
                x: 452,
                y: 200,
                boardIndex: 1
            },
            {
                x: 520,
                y: 260,
                boardIndex: 2
            },
            {
                x: 280,
                y: 260,
                boardIndex: 3
            },
            {
                x: 360,
                y: 260,
                boardIndex: 3
            },
            {
                x: 400,
                y: 340,
                boardIndex: 4
            },
            {
                x: 358,
                y: 340,
                boardIndex: 4
            },
            {
                x: 442,
                y: 340,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "polygon",
                x: 450,
                y: 150,
                sides: 8,
                radius: 70,
                color: "#c19d3f"
            },
            {
                shape: "rect",
                x: 450,
                y: 260,
                w: 380,
                h: 20,
                color: "#6a2eb9"
            },
            {
                shape: "circle",
                x: 450,
                y: 360,
                radius: 40,
                color: "#3bd9b2"
            },
            {
                shape: "roundRect",
                x: 330,
                y: 200,
                w: 200,
                h: 20,
                radius: 12,
                color: "#d66"
            },
            {
                shape: "polygon",
                x: 570,
                y: 200,
                sides: 4,
                radius: 45,
                color: "#146b5a"
            }
        ],
        screws: [
            {
                x: 410,
                y: 150,
                boardIndex: 0
            },
            {
                x: 490,
                y: 150,
                boardIndex: 0
            },
            {
                x: 268,
                y: 260,
                boardIndex: 1
            },
            {
                x: 450,
                y: 260,
                boardIndex: 1
            },
            {
                x: 632,
                y: 260,
                boardIndex: 1
            },
            {
                x: 450,
                y: 360,
                boardIndex: 2
            },
            {
                x: 330,
                y: 200,
                boardIndex: 3
            },
            {
                x: 422,
                y: 200,
                boardIndex: 3
            },
            {
                x: 570,
                y: 200,
                boardIndex: 4
            },
            {
                x: 533,
                y: 200,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "circle",
                x: 400,
                y: 180,
                radius: 58,
                color: "#7b3fcf"
            },
            {
                shape: "rect",
                x: 400,
                y: 90,
                w: 420,
                h: 20,
                color: "#3a9c4f"
            },
            {
                shape: "polygon",
                x: 520,
                y: 240,
                sides: 5,
                radius: 55,
                color: "#c15555"
            },
            {
                shape: "roundRect",
                x: 280,
                y: 240,
                w: 240,
                h: 20,
                radius: 12,
                color: "#f5a623"
            },
            {
                shape: "polygon",
                x: 400,
                y: 330,
                sides: 6,
                radius: 45,
                color: "#1f7faa"
            }
        ],
        screws: [
            {
                x: 400,
                y: 180,
                boardIndex: 0
            },
            {
                x: 300,
                y: 90,
                boardIndex: 1
            },
            {
                x: 500,
                y: 90,
                boardIndex: 1
            },
            {
                x: 520,
                y: 240,
                boardIndex: 2
            },
            {
                x: 480,
                y: 240,
                boardIndex: 2
            },
            {
                x: 280,
                y: 240,
                boardIndex: 3
            },
            {
                x: 360,
                y: 240,
                boardIndex: 3
            },
            {
                x: 363,
                y: 330,
                boardIndex: 4
            },
            {
                x: 437,
                y: 330,
                boardIndex: 4
            },
            {
                x: 400,
                y: 330,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "polygon",
                x: 420,
                y: 160,
                sides: 4,
                radius: 70,
                color: "#b83"
            },
            {
                shape: "circle",
                x: 420,
                y: 270,
                radius: 48,
                color: "#3bb78f"
            },
            {
                shape: "roundRect",
                x: 420,
                y: 90,
                w: 350,
                h: 20,
                radius: 12,
                color: "#e63"
            },
            {
                shape: "rect",
                x: 520,
                y: 340,
                w: 260,
                h: 20,
                color: "#359"
            },
            {
                shape: "polygon",
                x: 320,
                y: 340,
                sides: 3,
                radius: 50,
                color: "#d45"
            }
        ],
        screws: [
            {
                x: 370,
                y: 160,
                boardIndex: 0
            },
            {
                x: 470,
                y: 160,
                boardIndex: 0
            },
            {
                x: 420,
                y: 270,
                boardIndex: 1
            },
            {
                x: 300,
                y: 90,
                boardIndex: 2
            },
            {
                x: 540,
                y: 90,
                boardIndex: 2
            },
            {
                x: 642,
                y: 340,
                boardIndex: 3
            },
            {
                x: 398,
                y: 340,
                boardIndex: 3
            },
            {
                x: 320,
                y: 340,
                boardIndex: 4
            },
            {
                x: 350,
                y: 340,
                boardIndex: 4
            },
            {
                x: 290,
                y: 340,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "rect",
                x: 400,
                y: 70,
                w: 360,
                h: 20,
                color: "#4da"
            },
            {
                shape: "polygon",
                x: 400,
                y: 170,
                sides: 6,
                radius: 65,
                color: "#a43"
            },
            {
                shape: "circle",
                x: 540,
                y: 260,
                radius: 50,
                color: "#4ab"
            },
            {
                shape: "roundRect",
                x: 260,
                y: 260,
                w: 260,
                h: 20,
                radius: 12,
                color: "#e77"
            },
            {
                shape: "polygon",
                x: 400,
                y: 350,
                sides: 8,
                radius: 45,
                color: "#497"
            }
        ],
        screws: [
            {
                x: 300,
                y: 70,
                boardIndex: 0
            },
            {
                x: 500,
                y: 70,
                boardIndex: 0
            },
            {
                x: 360,
                y: 170,
                boardIndex: 1
            },
            {
                x: 440,
                y: 170,
                boardIndex: 1
            },
            {
                x: 540,
                y: 260,
                boardIndex: 2
            },
            {
                x: 260,
                y: 260,
                boardIndex: 3
            },
            {
                x: 340,
                y: 260,
                boardIndex: 3
            },
            {
                x: 400,
                y: 350,
                boardIndex: 4
            },
            {
                x: 363,
                y: 350,
                boardIndex: 4
            },
            {
                x: 437,
                y: 350,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "polygon",
                x: 460,
                y: 150,
                sides: 5,
                radius: 75,
                color: "#a39"
            },
            {
                shape: "circle",
                x: 460,
                y: 260,
                radius: 45,
                color: "#0c8"
            },
            {
                shape: "rect",
                x: 460,
                y: 350,
                w: 380,
                h: 20,
                color: "#8b5"
            },
            {
                shape: "roundRect",
                x: 320,
                y: 210,
                w: 220,
                h: 20,
                radius: 12,
                color: "#e58"
            },
            {
                shape: "polygon",
                x: 600,
                y: 210,
                sides: 4,
                radius: 40,
                color: "#275"
            }
        ],
        screws: [
            {
                x: 410,
                y: 150,
                boardIndex: 0
            },
            {
                x: 510,
                y: 150,
                boardIndex: 0
            },
            {
                x: 460,
                y: 260,
                boardIndex: 1
            },
            {
                x: 278,
                y: 350,
                boardIndex: 2
            },
            {
                x: 642,
                y: 350,
                boardIndex: 2
            },
            {
                x: 320,
                y: 210,
                boardIndex: 3
            },
            {
                x: 420,
                y: 210,
                boardIndex: 3
            },
            {
                x: 600,
                y: 210,
                boardIndex: 4
            },
            {
                x: 568,
                y: 210,
                boardIndex: 4
            },
            {
                x: 632,
                y: 210,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "circle",
                x: 400,
                y: 150,
                radius: 40,
                color: "#d45"
            },
            {
                shape: "polygon",
                x: 520,
                y: 240,
                sides: 3,
                radius: 55,
                color: "#48a"
            },
            {
                shape: "rect",
                x: 400,
                y: 70,
                w: 400,
                h: 20,
                color: "#7b3"
            },
            {
                shape: "roundRect",
                x: 280,
                y: 240,
                w: 240,
                h: 20,
                radius: 12,
                color: "#d73"
            },
            {
                shape: "polygon",
                x: 400,
                y: 340,
                sides: 7,
                radius: 50,
                color: "#538"
            }
        ],
        screws: [
            {
                x: 400,
                y: 150,
                boardIndex: 0
            },
            {
                x: 520,
                y: 240,
                boardIndex: 1
            },
            {
                x: 480,
                y: 240,
                boardIndex: 1
            },
            {
                x: 300,
                y: 70,
                boardIndex: 2
            },
            {
                x: 500,
                y: 70,
                boardIndex: 2
            },
            {
                x: 280,
                y: 240,
                boardIndex: 3
            },
            {
                x: 360,
                y: 240,
                boardIndex: 3
            },
            {
                x: 400,
                y: 340,
                boardIndex: 4
            },
            {
                x: 358,
                y: 340,
                boardIndex: 4
            },
            {
                x: 442,
                y: 340,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "rect",
                x: 420,
                y: 70,
                w: 360,
                h: 20,
                color: "#962"
            },
            {
                shape: "roundRect",
                x: 420,
                y: 160,
                w: 260,
                h: 20,
                radius: 12,
                color: "#b67"
            },
            {
                shape: "circle",
                x: 420,
                y: 250,
                radius: 55,
                color: "#469"
            },
            {
                shape: "polygon",
                x: 520,
                y: 330,
                sides: 8,
                radius: 42,
                color: "#3e7"
            },
            {
                shape: "polygon",
                x: 320,
                y: 330,
                sides: 4,
                radius: 45,
                color: "#c51"
            }
        ],
        screws: [
            {
                x: 260,
                y: 70,
                boardIndex: 0
            },
            {
                x: 580,
                y: 70,
                boardIndex: 0
            },
            {
                x: 420,
                y: 160,
                boardIndex: 1
            },
            {
                x: 360,
                y: 160,
                boardIndex: 1
            },
            {
                x: 420,
                y: 250,
                boardIndex: 2
            },
            {
                x: 520,
                y: 330,
                boardIndex: 3
            },
            {
                x: 486,
                y: 330,
                boardIndex: 3
            },
            {
                x: 320,
                y: 330,
                boardIndex: 4
            },
            {
                x: 357,
                y: 330,
                boardIndex: 4
            },
            {
                x: 290,
                y: 330,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "polygon",
                x: 450,
                y: 160,
                sides: 6,
                radius: 70,
                color: "#3db"
            },
            {
                shape: "rect",
                x: 450,
                y: 80,
                w: 420,
                h: 20,
                color: "#bb4"
            },
            {
                shape: "circle",
                x: 450,
                y: 270,
                radius: 45,
                color: "#d75"
            },
            {
                shape: "roundRect",
                x: 300,
                y: 210,
                w: 260,
                h: 20,
                radius: 12,
                color: "#59a"
            },
            {
                shape: "polygon",
                x: 600,
                y: 210,
                sides: 5,
                radius: 42,
                color: "#244"
            }
        ],
        screws: [
            {
                x: 400,
                y: 160,
                boardIndex: 0
            },
            {
                x: 500,
                y: 160,
                boardIndex: 0
            },
            {
                x: 260,
                y: 80,
                boardIndex: 1
            },
            {
                x: 640,
                y: 80,
                boardIndex: 1
            },
            {
                x: 450,
                y: 270,
                boardIndex: 2
            },
            {
                x: 300,
                y: 210,
                boardIndex: 3
            },
            {
                x: 380,
                y: 210,
                boardIndex: 3
            },
            {
                x: 600,
                y: 210,
                boardIndex: 4
            },
            {
                x: 566,
                y: 210,
                boardIndex: 4
            },
            {
                x: 634,
                y: 210,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "circle",
                x: 400,
                y: 160,
                radius: 50,
                color: "#ed4"
            },
            {
                shape: "roundRect",
                x: 520,
                y: 240,
                w: 260,
                h: 20,
                radius: 12,
                color: "#73b"
            },
            {
                shape: "polygon",
                x: 280,
                y: 240,
                sides: 4,
                radius: 45,
                color: "#2d8"
            },
            {
                shape: "rect",
                x: 400,
                y: 80,
                w: 380,
                h: 20,
                color: "#a44"
            },
            {
                shape: "polygon",
                x: 400,
                y: 330,
                sides: 9,
                radius: 45,
                color: "#3d6"
            }
        ],
        screws: [
            {
                x: 400,
                y: 160,
                boardIndex: 0
            },
            {
                x: 642,
                y: 240,
                boardIndex: 1
            },
            {
                x: 398,
                y: 240,
                boardIndex: 1
            },
            {
                x: 280,
                y: 240,
                boardIndex: 2
            },
            {
                x: 317,
                y: 240,
                boardIndex: 2
            },
            {
                x: 218,
                y: 80,
                boardIndex: 3
            },
            {
                x: 582,
                y: 80,
                boardIndex: 3
            },
            {
                x: 400,
                y: 330,
                boardIndex: 4
            },
            {
                x: 363,
                y: 330,
                boardIndex: 4
            },
            {
                x: 437,
                y: 330,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "rect",
                x: 420,
                y: 60,
                w: 360,
                h: 20,
                color: "#5bc"
            },
            {
                shape: "polygon",
                x: 420,
                y: 160,
                sides: 3,
                radius: 65,
                color: "#d73"
            },
            {
                shape: "circle",
                x: 420,
                y: 260,
                radius: 55,
                color: "#6b4"
            },
            {
                shape: "roundRect",
                x: 300,
                y: 340,
                w: 260,
                h: 20,
                radius: 12,
                color: "#93f"
            },
            {
                shape: "polygon",
                x: 540,
                y: 340,
                sides: 5,
                radius: 45,
                color: "#318"
            }
        ],
        screws: [
            {
                x: 260,
                y: 60,
                boardIndex: 0
            },
            {
                x: 580,
                y: 60,
                boardIndex: 0
            },
            {
                x: 420,
                y: 160,
                boardIndex: 1
            },
            {
                x: 380,
                y: 160,
                boardIndex: 1
            },
            {
                x: 420,
                y: 260,
                boardIndex: 2
            },
            {
                x: 300,
                y: 340,
                boardIndex: 3
            },
            {
                x: 380,
                y: 340,
                boardIndex: 3
            },
            {
                x: 540,
                y: 340,
                boardIndex: 4
            },
            {
                x: 503,
                y: 340,
                boardIndex: 4
            },
            {
                x: 577,
                y: 340,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "polygon",
                x: 460,
                y: 160,
                sides: 8,
                radius: 70,
                color: "#bb3"
            },
            {
                shape: "circle",
                x: 460,
                y: 260,
                radius: 45,
                color: "#65a"
            },
            {
                shape: "roundRect",
                x: 460,
                y: 350,
                w: 300,
                h: 20,
                radius: 12,
                color: "#e54"
            },
            {
                shape: "rect",
                x: 300,
                y: 210,
                w: 240,
                h: 20,
                color: "#78a"
            },
            {
                shape: "polygon",
                x: 620,
                y: 210,
                sides: 4,
                radius: 40,
                color: "#4a5"
            }
        ],
        screws: [
            {
                x: 420,
                y: 160,
                boardIndex: 0
            },
            {
                x: 500,
                y: 160,
                boardIndex: 0
            },
            {
                x: 460,
                y: 260,
                boardIndex: 1
            },
            {
                x: 318,
                y: 350,
                boardIndex: 2
            },
            {
                x: 602,
                y: 350,
                boardIndex: 2
            },
            {
                x: 300,
                y: 210,
                boardIndex: 3
            },
            {
                x: 360,
                y: 210,
                boardIndex: 3
            },
            {
                x: 620,
                y: 210,
                boardIndex: 4
            },
            {
                x: 588,
                y: 210,
                boardIndex: 4
            },
            {
                x: 652,
                y: 210,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "circle",
                x: 400,
                y: 140,
                radius: 55,
                color: "#de5"
            },
            {
                shape: "rect",
                x: 400,
                y: 240,
                w: 340,
                h: 20,
                color: "#69c"
            },
            {
                shape: "polygon",
                x: 520,
                y: 320,
                sides: 6,
                radius: 45,
                color: "#c46"
            },
            {
                shape: "roundRect",
                x: 280,
                y: 320,
                w: 240,
                h: 20,
                radius: 12,
                color: "#e84"
            }
        ],
        screws: [
            {
                x: 400,
                y: 140,
                boardIndex: 0
            },
            {
                x: 260,
                y: 240,
                boardIndex: 1
            },
            {
                x: 540,
                y: 240,
                boardIndex: 1
            },
            {
                x: 520,
                y: 320,
                boardIndex: 2
            },
            {
                x: 483,
                y: 320,
                boardIndex: 2
            },
            {
                x: 280,
                y: 320,
                boardIndex: 3
            },
            {
                x: 360,
                y: 320,
                boardIndex: 3
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6
        ]
    },
    {
        boards: [
            {
                shape: "polygon",
                x: 400,
                y: 160,
                sides: 7,
                radius: 60,
                color: "#ac7"
            },
            {
                shape: "circle",
                x: 400,
                y: 260,
                radius: 50,
                color: "#59c"
            },
            {
                shape: "roundRect",
                x: 510,
                y: 330,
                w: 260,
                h: 20,
                radius: 12,
                color: "#c66"
            },
            {
                shape: "rect",
                x: 290,
                y: 330,
                w: 260,
                h: 20,
                color: "#3b8"
            }
        ],
        screws: [
            {
                x: 350,
                y: 160,
                boardIndex: 0
            },
            {
                x: 450,
                y: 160,
                boardIndex: 0
            },
            {
                x: 400,
                y: 260,
                boardIndex: 1
            },
            {
                x: 632,
                y: 330,
                boardIndex: 2
            },
            {
                x: 388,
                y: 330,
                boardIndex: 2
            },
            {
                x: 290,
                y: 330,
                boardIndex: 3
            },
            {
                x: 360,
                y: 330,
                boardIndex: 3
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6
        ]
    },
    {
        boards: [
            {
                shape: "rect",
                x: 400,
                y: 100,
                w: 380,
                h: 20,
                color: "#87e"
            },
            {
                shape: "circle",
                x: 400,
                y: 200,
                radius: 45,
                color: "#d94"
            },
            {
                shape: "polygon",
                x: 520,
                y: 290,
                sides: 4,
                radius: 55,
                color: "#3a8"
            },
            {
                shape: "polygon",
                x: 280,
                y: 290,
                sides: 3,
                radius: 50,
                color: "#e47"
            }
        ],
        screws: [
            {
                x: 260,
                y: 100,
                boardIndex: 0
            },
            {
                x: 540,
                y: 100,
                boardIndex: 0
            },
            {
                x: 400,
                y: 200,
                boardIndex: 1
            },
            {
                x: 520,
                y: 290,
                boardIndex: 2
            },
            {
                x: 480,
                y: 290,
                boardIndex: 2
            },
            {
                x: 280,
                y: 290,
                boardIndex: 3
            },
            {
                x: 320,
                y: 290,
                boardIndex: 3
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6
        ]
    },
    {
        boards: [
            {
                shape: "polygon",
                x: 440,
                y: 150,
                sides: 5,
                radius: 65,
                color: "#da3"
            },
            {
                shape: "rect",
                x: 440,
                y: 260,
                w: 360,
                h: 20,
                color: "#75c"
            },
            {
                shape: "roundRect",
                x: 300,
                y: 210,
                w: 260,
                h: 20,
                radius: 12,
                color: "#e84"
            },
            {
                shape: "circle",
                x: 440,
                y: 340,
                radius: 50,
                color: "#6b8"
            }
        ],
        screws: [
            {
                x: 390,
                y: 150,
                boardIndex: 0
            },
            {
                x: 490,
                y: 150,
                boardIndex: 0
            },
            {
                x: 268,
                y: 260,
                boardIndex: 1
            },
            {
                x: 612,
                y: 260,
                boardIndex: 1
            },
            {
                x: 300,
                y: 210,
                boardIndex: 2
            },
            {
                x: 360,
                y: 210,
                boardIndex: 2
            },
            {
                x: 440,
                y: 340,
                boardIndex: 3
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6
        ]
    },
    {
        boards: [
            {
                shape: "rect",
                x: 420,
                y: 100,
                w: 340,
                h: 20,
                color: "#9cf"
            },
            {
                shape: "polygon",
                x: 420,
                y: 200,
                sides: 6,
                radius: 55,
                color: "#d76"
            },
            {
                shape: "circle",
                x: 550,
                y: 290,
                radius: 45,
                color: "#4a8"
            },
            {
                shape: "roundRect",
                x: 290,
                y: 290,
                w: 260,
                h: 20,
                radius: 12,
                color: "#c55"
            }
        ],
        screws: [
            {
                x: 260,
                y: 100,
                boardIndex: 0
            },
            {
                x: 580,
                y: 100,
                boardIndex: 0
            },
            {
                x: 380,
                y: 200,
                boardIndex: 1
            },
            {
                x: 460,
                y: 200,
                boardIndex: 1
            },
            {
                x: 550,
                y: 290,
                boardIndex: 2
            },
            {
                x: 290,
                y: 290,
                boardIndex: 3
            },
            {
                x: 360,
                y: 290,
                boardIndex: 3
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6
        ]
    },
    {
        boards: [
            {
                shape: "polygon",
                x: 420,
                y: 130,
                sides: 8,
                radius: 70,
                color: "#c33"
            },
            {
                shape: "circle",
                x: 420,
                y: 240,
                radius: 55,
                color: "#4b9"
            },
            {
                shape: "rect",
                x: 420,
                y: 330,
                w: 420,
                h: 20,
                color: "#86d"
            },
            {
                shape: "roundRect",
                x: 300,
                y: 180,
                w: 240,
                h: 20,
                radius: 12,
                color: "#e75"
            },
            {
                shape: "polygon",
                x: 540,
                y: 180,
                sides: 5,
                radius: 50,
                color: "#5a7"
            }
        ],
        screws: [
            {
                x: 380,
                y: 130,
                boardIndex: 0
            },
            {
                x: 460,
                y: 130,
                boardIndex: 0
            },
            {
                x: 420,
                y: 240,
                boardIndex: 1
            },
            {
                x: 218,
                y: 330,
                boardIndex: 2
            },
            {
                x: 622,
                y: 330,
                boardIndex: 2
            },
            {
                x: 300,
                y: 180,
                boardIndex: 3
            },
            {
                x: 360,
                y: 180,
                boardIndex: 3
            },
            {
                x: 540,
                y: 180,
                boardIndex: 4
            },
            {
                x: 500,
                y: 180,
                boardIndex: 4
            },
            {
                x: 580,
                y: 180,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "rect",
                x: 400,
                y: 80,
                w: 420,
                h: 20,
                color: "#57c"
            },
            {
                shape: "polygon",
                x: 400,
                y: 170,
                sides: 7,
                radius: 65,
                color: "#da4"
            },
            {
                shape: "circle",
                x: 540,
                y: 270,
                radius: 50,
                color: "#3c9"
            },
            {
                shape: "circle",
                x: 260,
                y: 270,
                radius: 50,
                color: "#e65"
            },
            {
                shape: "roundRect",
                x: 400,
                y: 350,
                w: 300,
                h: 20,
                radius: 12,
                color: "#94d"
            }
        ],
        screws: [
            {
                x: 250,
                y: 80,
                boardIndex: 0
            },
            {
                x: 550,
                y: 80,
                boardIndex: 0
            },
            {
                x: 350,
                y: 170,
                boardIndex: 1
            },
            {
                x: 450,
                y: 170,
                boardIndex: 1
            },
            {
                x: 540,
                y: 270,
                boardIndex: 2
            },
            {
                x: 260,
                y: 270,
                boardIndex: 3
            },
            {
                x: 258,
                y: 350,
                boardIndex: 4
            },
            {
                x: 542,
                y: 350,
                boardIndex: 4
            },
            {
                x: 400,
                y: 350,
                boardIndex: 4
            },
            {
                x: 480,
                y: 350,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "polygon",
                x: 450,
                y: 140,
                sides: 9,
                radius: 75,
                color: "#b55"
            },
            {
                shape: "circle",
                x: 450,
                y: 250,
                radius: 55,
                color: "#4f9"
            },
            {
                shape: "roundRect",
                x: 450,
                y: 330,
                w: 320,
                h: 20,
                radius: 12,
                color: "#a85"
            },
            {
                shape: "rect",
                x: 300,
                y: 200,
                w: 240,
                h: 20,
                color: "#69a"
            },
            {
                shape: "polygon",
                x: 600,
                y: 200,
                sides: 6,
                radius: 45,
                color: "#27a"
            }
        ],
        screws: [
            {
                x: 400,
                y: 140,
                boardIndex: 0
            },
            {
                x: 500,
                y: 140,
                boardIndex: 0
            },
            {
                x: 450,
                y: 250,
                boardIndex: 1
            },
            {
                x: 298,
                y: 330,
                boardIndex: 2
            },
            {
                x: 602,
                y: 330,
                boardIndex: 2
            },
            {
                x: 300,
                y: 200,
                boardIndex: 3
            },
            {
                x: 360,
                y: 200,
                boardIndex: 3
            },
            {
                x: 600,
                y: 200,
                boardIndex: 4
            },
            {
                x: 563,
                y: 200,
                boardIndex: 4
            },
            {
                x: 637,
                y: 200,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "rect",
                x: 420,
                y: 90,
                w: 380,
                h: 20,
                color: "#8d4"
            },
            {
                shape: "circle",
                x: 420,
                y: 180,
                radius: 55,
                color: "#e84"
            },
            {
                shape: "polygon",
                x: 560,
                y: 260,
                sides: 8,
                radius: 55,
                color: "#5ba"
            },
            {
                shape: "polygon",
                x: 280,
                y: 260,
                sides: 4,
                radius: 50,
                color: "#d45"
            },
            {
                shape: "roundRect",
                x: 420,
                y: 340,
                w: 320,
                h: 20,
                radius: 12,
                color: "#7af"
            }
        ],
        screws: [
            {
                x: 260,
                y: 90,
                boardIndex: 0
            },
            {
                x: 580,
                y: 90,
                boardIndex: 0
            },
            {
                x: 420,
                y: 180,
                boardIndex: 1
            },
            {
                x: 560,
                y: 260,
                boardIndex: 2
            },
            {
                x: 520,
                y: 260,
                boardIndex: 2
            },
            {
                x: 280,
                y: 260,
                boardIndex: 3
            },
            {
                x: 320,
                y: 260,
                boardIndex: 3
            },
            {
                x: 420,
                y: 340,
                boardIndex: 4
            },
            {
                x: 350,
                y: 340,
                boardIndex: 4
            },
            {
                x: 490,
                y: 340,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    {
        boards: [
            {
                shape: "circle",
                x: 420,
                y: 150,
                radius: 60,
                color: "#ca3"
            },
            {
                shape: "rect",
                x: 420,
                y: 70,
                w: 420,
                h: 20,
                color: "#64d"
            },
            {
                shape: "polygon",
                x: 560,
                y: 250,
                sides: 9,
                radius: 55,
                color: "#38c"
            },
            {
                shape: "polygon",
                x: 280,
                y: 250,
                sides: 5,
                radius: 50,
                color: "#d53"
            },
            {
                shape: "roundRect",
                x: 420,
                y: 330,
                w: 340,
                h: 20,
                radius: 12,
                color: "#ea6"
            }
        ],
        screws: [
            {
                x: 420,
                y: 150,
                boardIndex: 0
            },
            {
                x: 250,
                y: 70,
                boardIndex: 1
            },
            {
                x: 590,
                y: 70,
                boardIndex: 1
            },
            {
                x: 560,
                y: 250,
                boardIndex: 2
            },
            {
                x: 520,
                y: 250,
                boardIndex: 2
            },
            {
                x: 280,
                y: 250,
                boardIndex: 3
            },
            {
                x: 320,
                y: 250,
                boardIndex: 3
            },
            {
                x: 420,
                y: 330,
                boardIndex: 4
            },
            {
                x: 360,
                y: 330,
                boardIndex: 4
            },
            {
                x: 500,
                y: 330,
                boardIndex: 4
            }
        ],
        order: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ]
    }
];
