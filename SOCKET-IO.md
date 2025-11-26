Here is a clear, beginner-friendly, step-by-step guide to run multiple games, each with its own socket logic, in one Node.js + Socket.IO server.

Right now your server handles ONE game only, with hardcoded logic.
To support many games, we must separate game logic and different namespaces or rooms.

You have two good choices:

✅ OPTION 1: Use Socket.IO Rooms (best for multiplayer games)

Each game instance has its own room.

Example:

/game-core-defender
/game-space-fight
/game-racing


Players join a room → server runs separate logic for that room.

✅ OPTION 2: Use Socket.IO Namespaces

Each game runs in its own namespace with fully different event names and logic:

io.of('/coreDefender')
io.of('/spaceShooter')
io.of('/battleArena')


This is cleaner when the games are completely unrelated.

✔️ I will teach both.

Let's start step-by-step.

🟦 STEP 1 — Create a folder structure
server/
index.js
games/
coreDefender.js
spaceShooter.js
racingGame.js
public/
coreDefender/
spaceShooter/


Each file inside /games contains the game's socket logic.

🟩 STEP 2 — Create a Base Server (index.js)
const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
cors: {
origin: "*"
}
});

const port = 3000;

// Load game modules
require('./games/coreDefender')(io.of('/coreDefender'));
require('./games/spaceShooter')(io.of('/spaceShooter'));

server.listen(port, () => {
console.log(`Server running on port ${port}`);
});

✔️ What this means:

Your server has Socket.IO.

Each game has its own namespace.

Each game module receives the namespace server:

/coreDefender

/spaceShooter

🟥 STEP 3 — Create the Core Defender game file

games/coreDefender.js:

module.exports = function(io) {

    // Game state ONLY for this game!
    const players = {};
    const projectiles = {};

    io.on('connection', socket => {

        console.log('CoreDefender player connected:', socket.id);

        socket.on('initGame', ({ username }) => {
            players[socket.id] = {
                username,
                x: Math.random() * 800,
                y: Math.random() * 600,
                score: 0
            };
        });

        socket.on('keydown', (key) => {
            if (!players[socket.id]) return;
            if (key === 'KeyW') players[socket.id].y -= 5;
            if (key === 'KeyS') players[socket.id].y += 5;
            if (key === 'KeyA') players[socket.id].x -= 5;
            if (key === 'KeyD') players[socket.id].x += 5;
        });

        socket.on('shoot', (data) => {
            // shooting logic
        });

        socket.on('disconnect', () => {
            delete players[socket.id];
        });
    });

    // Game tick
    setInterval(() => {
        io.emit('update', { players, projectiles });
    }, 30);
};

✔️ This game is now completely isolated.

No conflict with other games.

🟧 STEP 4 — Create the Space Shooter game file

games/spaceShooter.js:

module.exports = function(io) {

    const players = {};
    const bullets = {};

    io.on('connection', socket => {

        console.log("SpaceShooter player:", socket.id);

        socket.on('initGame', ({ username }) => {
            players[socket.id] = {
                username,
                x: 400,
                y: 300,
                hp: 100
            };
        });

        socket.on('move', ({ dx, dy }) => {
            if (!players[socket.id]) return;
            players[socket.id].x += dx;
            players[socket.id].y += dy;
        });

        socket.on('fire', () => {
            bullets[Date.now()] = {
                x: players[socket.id].x,
                y: players[socket.id].y
            };
        });

        socket.on('disconnect', () => {
            delete players[socket.id];
        });
    });

    setInterval(() => {
        io.emit('update', { players, bullets });
    }, 30);
};

✔️ This also has separate state

No mix with Core Defender players.

🟩 STEP 5 — Client-side connection

Your front-end for each game must connect to its namespace.

Core Defender (client)
const socket = io("http://192.168.29.24:3000/coreDefender");

Space Shooter (client)
const socket = io("http://192.168.29.24:3000/spaceShooter");

🟦 STEP 6 — How this looks in browser
Core Defender game
http://192.168.29.24:4200/coreDefender

Space Shooter game
http://192.168.29.24:4200/spaceShooter


Each page loads its own JS that connects to the correct namespace.

🟨 RESULT:
✔ You can run unlimited games
✔ Each game has 100% independent socket logic
✔ Player & projectile states do not mix
✔ Same server, multiple games
✔ Clean project structure
⭐ If you want, I can:

✅ Combine multiple games into rooms instead of namespaces
✅ Build a game selector page
✅ Build reusable engine code
✅ Optimize your game loops
✅ Help reorganize your full project structure

Just tell me what you want next.


Great — I will explain step-by-step, slowly, clearly, and visually how to run multiple different multiplayer games on one Node.js + Socket.IO server.

You will understand why we need namespaces, how they work, and how to organize files.

✅ WHY YOU NEED MULTIPLE SOCKET SETUPS

Right now your server:

Handles one game only

Has one set of events

Has one player list

Has one projectile list

If you try adding another game, all players from all games will get mixed together and cause errors.

So we must separate each game's logic into different socket sections.

🚀 THE CLEANEST WAY: Socket.IO Namespaces

A namespace is like a separate mini-server inside the same Socket.IO server.

Example namespaces:

/coreDefender

/spaceShooter

/battleArena

Each namespace:

Has its own players

Has its own events

Has its own update loop

Does not mix players from other games

🎯 STEP 1 — CREATE FOLDER STRUCTURE

Make your server like this:

server/
index.js
games/
coreDefender.js
spaceShooter.js
battleArena.js
public/
coreDefender/
spaceShooter/


Each game gets its own file inside /games.

This keeps everything clean.

🎯 STEP 2 — CREATE THE BASE SERVER (index.js)

This server only:

starts HTTP server,

loads socket namespaces,

plugs in game modules.

const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
cors: { origin: "*" }
});

const port = 3000;

// LOAD EACH GAME
require('./games/coreDefender')(io.of('/coreDefender'));
require('./games/spaceShooter')(io.of('/spaceShooter'));

server.listen(port, () => {
console.log(`Server running on port ${port}`);
});

📌 Understand What Happens Here
👍 io = the main Socket.IO server

But then we do:

io.of('/coreDefender')
io.of('/spaceShooter')


Each of these is a separate socket area.

Think of it like different chat rooms:

People in /coreDefender cannot hear /spaceShooter events.

Code inside /coreDefender can't affect /spaceShooter.

🎯 STEP 3 — WRITE GAME 1 (Core Defender)

games/coreDefender.js

module.exports = function(io) {

    const players = {};
    const projectiles = {};

    io.on('connection', socket => {
        console.log("CoreDefender player connected:", socket.id);

        socket.on('initGame', ({ username }) => {
            players[socket.id] = {
                username,
                x: Math.random() * 800,
                y: Math.random() * 600,
                score: 0
            };
        });

        socket.on('keydown', key => {
            const p = players[socket.id];
            if (!p) return;

            if (key === 'KeyW') p.y -= 5;
            if (key === 'KeyS') p.y += 5;
            if (key === 'KeyA') p.x -= 5;
            if (key === 'KeyD') p.x += 5;
        });

        socket.on('shoot', () => {
            // shooting logic
        });

        socket.on('disconnect', () => {
            delete players[socket.id];
        });
    });

    // game loop
    setInterval(() => {
        io.emit('update', { players, projectiles });
    }, 30);
};

✔ What is happening?

This file controls Core Defender only.

It has its own players & projectiles.

It broadcasts only to coreDefender clients.

🎯 STEP 4 — WRITE GAME 2 (Space Shooter)

games/spaceShooter.js

module.exports = function(io) {

    const ships = {};
    const bullets = {};

    io.on('connection', socket => {
        console.log("SpaceShooter player:", socket.id);

        socket.on('initGame', ({ username }) => {
            ships[socket.id] = {
                username,
                x: 400,
                y: 300,
                hp: 100
            };
        });

        socket.on('move', ({ dx, dy }) => {
            if (!ships[socket.id]) return;
            ships[socket.id].x += dx;
            ships[socket.id].y += dy;
        });

        socket.on('fire', () => {
            bullets[Date.now()] = {
                owner: socket.id,
                x: ships[socket.id].x,
                y: ships[socket.id].y
            };
        });

        socket.on('disconnect', () => {
            delete ships[socket.id];
        });
    });

    setInterval(() => {
        io.emit('update', { ships, bullets });
    }, 30);
};

✔ These two games DO NOT use each other’s events

Core Defender uses initGame, keydown, shoot

Space Shooter uses initGame, move, fire

There is zero conflict.

🎯 STEP 5 — CLIENT CONNECTION

Each game now connects to a different namespace.

Core Defender client
const socket = io("http://192.168.29.24:3000/coreDefender");

Space Shooter client
const socket = io("http://192.168.29.24:3000/spaceShooter");


Each front-end connects to its own game.

🎯 STEP 6 — YOUR FILES IN PUBLIC FOLDER
public/
coreDefender/index.html
coreDefender/game.js
spaceShooter/index.html
spaceShooter/game.js


Each game loads the correct JS.

For example:

coreDefender/index.html
<script src="/socket.io/socket.io.js"></script>
<script src="game.js"></script>

coreDefender/game.js
const socket = io("/coreDefender");

🎯 FINAL VISUAL UNDERSTANDING
Old system:
ONE socket server
→ handles one game
→ all players in same list
→ all events mixed

New system:
SOCKET SERVER
├── Namespace: /coreDefender
│       → independent players
│       → independent loop
│       → independent events
│
├── Namespace: /spaceShooter
│       → its own players
│       → its own bullets
│       → its own logic
│
└── ... more games easily added


No mixing
No conflict
No spaghetti code

🎉 YOU NOW CAN RUN UNLIMITED MULTIPLAYER GAMES

Same server
Each game is isolated
Clean code
Easy to extend

⭐ WHAT DO YOU WANT NEXT?

I can explain:

✅ How to switch between games from the same website
✅ How to create a "game selection" menu
✅ How to structure shared code
✅ How to run multiple game rooms inside one game
✅ How to improve your current game’s performance

Tell me what you want and I will guide you step-by-step.



Perfect — I’ll explain ALL FOUR topics step-by-step, in a clean, practical, game-developer way.

⭐ 1. HOW TO SWITCH BETWEEN GAMES FROM THE SAME WEBSITE

You need a main homepage that lets the user choose a game.

Folder structure:
public/
index.html        ← main menu
coreDefender/
index.html
game.js
spaceShooter/
index.html
game.js

✅ index.html (Main Menu)
<!DOCTYPE html>
<html>
<body>

<h1>Select Your Game</h1>

<button onclick="window.location.href='/coreDefender/index.html'">
    Core Defender
</button>

<button onclick="window.location.href='/spaceShooter/index.html'">
    Space Shooter
</button>

</body>
</html>


This sends the user to each game's page.

⭐ 2. HOW TO CREATE A "GAME SELECTION" MENU

You can make it prettier:

<style>
.game-card {
    width: 200px;
    padding: 20px;
    margin: 20px;
    border-radius: 10px;
    background: #333;
    color: white;
    cursor: pointer;
    display: inline-block;
    text-align: center;
}
.game-card:hover {
    background: #444;
}
</style>

<div class="game-card" onclick="openGame('coreDefender')">
    <h2>Core Defender</h2>
    <p>Shooting, dodging, multiplayer fun.</p>
</div>

<div class="game-card" onclick="openGame('spaceShooter')">
    <h2>Space Shooter</h2>
    <p>Fly your spaceship and battle players.</p>
</div>

<script>
function openGame(game) {
    window.location.href = `/${game}/index.html`;
}
</script>

⭐ 3. HOW TO STRUCTURE SHARED CODE

When you have multiple games, you will repeat code like:

drawing circles

collision checks

player class

vector math

random color

UI elements

socket connection helpers

So make a shared folder:

public/
shared/
utils.js
physics.js
renderer.js
playerBase.js

Example: shared/playerBase.js
export class PlayerBase {
constructor({ x, y, radius, color }) {
this.x = x;
this.y = y;
this.radius = radius;
this.color = color;
}

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

Example: shared/utils.js
export function randomColor() {
return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

export function distance(x1, y1, x2, y2) {
return Math.hypot(x1 - x2, y1 - y2);
}

How to use shared code inside Core Defender
import { PlayerBase } from '../shared/playerBase.js';
import { distance } from '../shared/utils.js';

Why is this useful?

You write common code once.

All games share the same utility tools.

Your games become easier to maintain.

You avoid spaghetti code.

⭐ 4. HOW TO RUN MULTIPLE GAME ROOMS INSIDE A SINGLE GAME

Example: Core Defender might need:

Room A → 5 players
Room B → 10 players
Room C → private room

How Rooms Work in Socket.IO:
socket.join("room1");
io.to("room1").emit("event", data);

Full Example

In /games/coreDefender.js:

module.exports = function(io) {

    const rooms = {};  // each room has its own players list

    io.on("connection", (socket) => {

        socket.on("joinRoom", ({ roomId, username }) => {

            if (!rooms[roomId]) {
                rooms[roomId] = {
                    players: {},
                    projectiles: {}
                };
            }

            socket.join(roomId);

            rooms[roomId].players[socket.id] = {
                username,
                x: Math.random() * 800,
                y: Math.random() * 600,
                score: 0
            };
        });

        socket.on("keydown", ({ roomId, key }) => {
            const p = rooms[roomId].players[socket.id];
            if (!p) return;

            if (key === "KeyW") p.y -= 5;
            if (key === "KeyS") p.y += 5;
            if (key === "KeyA") p.x -= 5;
            if (key === "KeyD") p.x += 5;
        });

        socket.on("disconnect", () => {
            for (const roomId in rooms) {
                delete rooms[roomId].players[socket.id];
            }
        });
    });

    setInterval(() => {
        for (const roomId in rooms) {
            io.to(roomId).emit("update", rooms[roomId]);
        }
    }, 30);
};

✔ Every room works like its own multiplayer map

Room A players don’t see Room B players.

⭐ 5. PERFORMANCE IMPROVEMENTS FOR YOUR CURRENT GAME

Your current game has typical problems:

1. You send too many updates

You broadcast every 15 ms, which is 66 FPS.
Send 20–30 updates per second instead.

setInterval(gameLoop, 33); // 30 FPS

2. Use “dirty updates”

Only send:

changed player positions

new bullets

removed bullets

scores

Do not send entire objects.

3. Move math from frontend to backend

Client should never simulate physics.
Only server should.

4. Compress packets

Use short keys:

// bad
{ x: 100, y: 200, score: 5 }

// good
{ x:100, y:200, s:5 }

5. Use QuadTree for many players

If you ever reach 50+ players, collision checks go from:

O(n^2) -> O(n log n)

6. Don’t use Math.random() inside main loop

It’s slow.
Precompute values where possible.

7. Use object pooling for bullets

Don’t create/delete 100 bullets per second — reuse bullet objects.

🎉 SUMMARY OF EVERYTHING YOU CAN DO NOW

You now understand:

✔ How to switch between games from one website
✔ How to build a game selection UI
✔ How to use shared code for multiple games
✔ How to run multiple rooms in a single game
✔ How to improve game performance

Perfect! Let’s build a complete, ready-to-use multi-game server template with rooms, game selection UI, and a clean folder structure. I’ll break it into steps with code, so you can copy, paste, and extend it immediately.

1️⃣ Folder Structure
project/
│
├─ server/
│   ├─ index.js                ← main server
│   └─ games/
│       ├─ coreDefender.js     ← game 1 logic
│       └─ spaceShooter.js     ← game 2 logic
│
└─ public/
├─ index.html               ← game selection UI
├─ shared/
│   ├─ utils.js             ← shared functions (distance, randomColor)
│   └─ playerBase.js        ← base player class
├─ coreDefender/
│   ├─ index.html
│   └─ game.js
└─ spaceShooter/
├─ index.html
└─ game.js

2️⃣ Server: server/index.js
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
cors: { origin: "*" }
});

// Serve public folder
app.use(express.static('public'));

// Load games
require('./games/coreDefender')(io.of('/coreDefender'));
require('./games/spaceShooter')(io.of('/spaceShooter'));

const port = 3000;
server.listen(port, () => console.log(`Server running on port ${port}`));


✅ Each game gets its own namespace (/coreDefender, /spaceShooter)

3️⃣ Game Template with Rooms: server/games/coreDefender.js
module.exports = function(io) {

    const rooms = {}; // store rooms { roomId: { players, projectiles } }

    io.on("connection", (socket) => {
        console.log("CoreDefender player connected:", socket.id);

        socket.on("joinRoom", ({ roomId, username }) => {
            if (!rooms[roomId]) rooms[roomId] = { players: {}, projectiles: {} };
            socket.join(roomId);

            rooms[roomId].players[socket.id] = {
                username,
                x: Math.random() * 800,
                y: Math.random() * 600,
                score: 0
            };

            // Send current state to new player
            socket.emit("initState", rooms[roomId]);
        });

        socket.on("keydown", ({ roomId, key }) => {
            const p = rooms[roomId].players[socket.id];
            if (!p) return;
            if (key === "KeyW") p.y -= 5;
            if (key === "KeyS") p.y += 5;
            if (key === "KeyA") p.x -= 5;
            if (key === "KeyD") p.x += 5;
        });

        socket.on("shoot", ({ roomId, x, y, angle }) => {
            const room = rooms[roomId];
            if (!room) return;
            const id = Date.now();
            room.projectiles[id] = { x, y, angle, owner: socket.id };
        });

        socket.on("disconnect", () => {
            for (const roomId in rooms) {
                delete rooms[roomId].players[socket.id];
            }
        });
    });

    // Game loop
    setInterval(() => {
        for (const roomId in rooms) {
            const room = rooms[roomId];

            // Update projectiles
            for (const id in room.projectiles) {
                const p = room.projectiles[id];
                p.x += Math.cos(p.angle) * 5;
                p.y += Math.sin(p.angle) * 5;

                // Remove if out of bounds
                if (p.x < 0 || p.x > 1024 || p.y < 0 || p.y > 576) delete room.projectiles[id];
            }

            io.to(roomId).emit("update", room);
        }
    }, 33); // ~30 FPS
};


✅ This allows multiple rooms per game, isolated from each other.

4️⃣ Game Selection Page: public/index.html
<!DOCTYPE html>
<html>
<head>
    <title>Game Selection</title>
    <style>
        .game-card { width:200px; height:100px; margin:20px; display:inline-block; 
            text-align:center; cursor:pointer; background:#333; color:white; border-radius:10px; }
        .game-card:hover { background:#555; }
    </style>
</head>
<body>
<h1>Select a Game</h1>
<div class="game-card" onclick="openGame('coreDefender')">Core Defender</div>
<div class="game-card" onclick="openGame('spaceShooter')">Space Shooter</div>

<script>
function openGame(game) {
    window.location.href = `/${game}/index.html`;
}
</script>
</body>
</html>


✅ Users can now select any game on the same website.

5️⃣ Shared Player Base: public/shared/playerBase.js
export class PlayerBase {
constructor({ x, y, radius=10, color='white' }) {
this.x = x; this.y = y; this.radius = radius; this.color = color;
}
draw(ctx) {
ctx.fillStyle = this.color;
ctx.beginPath();
ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
ctx.fill();
}
}

6️⃣ Shared Utils: public/shared/utils.js
export function distance(x1,y1,x2,y2) { return Math.hypot(x1-x2,y1-y2); }
export function randomColor() { return `hsl(${Math.random()*360},100%,50%)`; }

7️⃣ Core Defender Client: public/coreDefender/game.js
import { PlayerBase } from '../shared/playerBase.js';

const socket = io("/coreDefender");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1024; canvas.height = 576;

let roomId = "room1";
let players = {};
let projectiles = {};

// Join Room
socket.emit("joinRoom", { roomId, username: "Player" + Math.floor(Math.random()*1000) });

// Listen for updates
socket.on("initState", state => { players = state.players; projectiles = state.projectiles; });
socket.on("update", state => { players = state.players; projectiles = state.projectiles; });

// Input
window.addEventListener("keydown", e => {
socket.emit("keydown", { roomId, key: e.code });
});

canvas.addEventListener("click", e => {
const player = players[socket.id];
if (!player) return;
const angle = Math.atan2(e.offsetY - player.y, e.offsetX - player.x);
socket.emit("shoot", { roomId, x: player.x, y: player.y, angle });
});

// Render
function animate() {
ctx.clearRect(0,0,canvas.width,canvas.height);
Object.values(players).forEach(p => new PlayerBase({ x:p.x, y:p.y }).draw(ctx));
Object.values(projectiles).forEach(p => {
ctx.fillStyle = 'red';
ctx.beginPath();
ctx.arc(p.x,p.y,5,0,Math.PI*2);
ctx.fill();
});
requestAnimationFrame(animate);
}
animate();


✅ Works per room and handles players + projectiles.

8️⃣ Multiple Game Rooms

Just change roomId in client to create separate rooms: "room1", "room2", "privateRoom123".

The server automatically isolates them.

You can add a room selection menu before joining.

9️⃣ Optional Improvements

Add username input before joining

Add room selection UI in main menu

Add scores & leaderboard per room

Use shared physics functions for collision

Implement object pooling for bullets

✅ With this template you now have:

Multi-game server

Rooms per game

Shared code structure

Game selection UI

Ready-to-extend client-side rendering