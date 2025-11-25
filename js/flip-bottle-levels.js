// Bottle Flip Game Levels
// 
// HOW TO ADD MORE LEVELS:
// =======================
// Simply add a new object to the levels array below.
// Each level needs:
//   - gravity: How fast the bottle falls (default: 0.5)
//   - platforms: Array of platform objects
//     Each platform needs:
//       - x: X position (0-500, will scale to screen)
//       - y: Y position from bottom (0-500)
//       - width: Platform width (0-500)
//       - height: Platform height (default: 100)
//       - type: 'table', 'chair', 'box', or default
//       - target: true if this is the target platform (default: false)
//   - maxAttempts: Maximum attempts before game over (default: 10)
//
// Example:
//   {
//       gravity: 0.5,
//       platforms: [
//           { x: 200, y: 50, width: 150, height: 100, type: 'table', target: true },
//           { x: 100, y: 200, width: 100, height: 80, type: 'chair' }
//       ],
//       maxAttempts: 10
//   }

const bottleFlipLevels = [
    // Level 1 - Easy (One large platform)
    {
        gravity: 0.5,
        platforms: [
            { x: 200, y: 50, width: 200, height: 100, type: 'table', target: true }
        ],
        maxAttempts: 10
    },

    // Level 2 - Easy (Two platforms, target on right)
    {
        gravity: 0.5,
        platforms: [
            { x: 100, y: 100, width: 120, height: 80, type: 'chair' },
            { x: 300, y: 50, width: 150, height: 100, type: 'table', target: true }
        ],
        maxAttempts: 10
    },

    // Level 3 - Medium (Multiple platforms, target in middle)
    {
        gravity: 0.5,
        platforms: [
            { x: 50, y: 150, width: 100, height: 80, type: 'box' },
            { x: 200, y: 50, width: 120, height: 100, type: 'table', target: true },
            { x: 350, y: 120, width: 100, height: 80, type: 'chair' }
        ],
        maxAttempts: 8
    },

    // Level 4 - Medium (Platforms at different heights)
    {
        gravity: 0.5,
        platforms: [
            { x: 80, y: 200, width: 100, height: 80, type: 'box' },
            { x: 250, y: 100, width: 120, height: 100, type: 'table', target: true },
            { x: 400, y: 180, width: 80, height: 70, type: 'chair' }
        ],
        maxAttempts: 8
    },

    // Level 5 - Medium (Smaller target platform)
    {
        gravity: 0.5,
        platforms: [
            { x: 100, y: 150, width: 100, height: 80, type: 'chair' },
            { x: 250, y: 50, width: 100, height: 100, type: 'table', target: true },
            { x: 380, y: 120, width: 100, height: 80, type: 'box' }
        ],
        maxAttempts: 8
    },

    // Level 6 - Hard (Higher gravity, multiple platforms)
    {
        gravity: 0.6,
        platforms: [
            { x: 50, y: 180, width: 80, height: 70, type: 'box' },
            { x: 200, y: 80, width: 100, height: 100, type: 'table', target: true },
            { x: 350, y: 150, width: 90, height: 80, type: 'chair' }
        ],
        maxAttempts: 7
    },

    // Level 7 - Hard (Small target, obstacles)
    {
        gravity: 0.5,
        platforms: [
            { x: 60, y: 200, width: 90, height: 70, type: 'box' },
            { x: 180, y: 120, width: 80, height: 80, type: 'chair' },
            { x: 300, y: 50, width: 80, height: 100, type: 'table', target: true },
            { x: 420, y: 180, width: 70, height: 70, type: 'box' }
        ],
        maxAttempts: 7
    },

    // Level 8 - Hard (Very small target)
    {
        gravity: 0.5,
        platforms: [
            { x: 100, y: 150, width: 100, height: 80, type: 'chair' },
            { x: 250, y: 50, width: 70, height: 100, type: 'table', target: true },
            { x: 380, y: 130, width: 100, height: 80, type: 'box' }
        ],
        maxAttempts: 6
    },

    // Level 9 - Expert (Small target, offset, higher gravity)
    {
        gravity: 0.6,
        platforms: [
            { x: 50, y: 180, width: 80, height: 70, type: 'box' },
            { x: 180, y: 100, width: 80, height: 80, type: 'chair' },
            { x: 320, y: 50, width: 70, height: 100, type: 'table', target: true },
            { x: 430, y: 150, width: 60, height: 70, type: 'box' }
        ],
        maxAttempts: 5
    },

    // Level 10 - Expert (Tiny target, multiple obstacles)
    {
        gravity: 0.5,
        platforms: [
            { x: 50, y: 200, width: 70, height: 60, type: 'box' },
            { x: 150, y: 120, width: 80, height: 80, type: 'chair' },
            { x: 250, y: 50, width: 60, height: 100, type: 'table', target: true },
            { x: 350, y: 140, width: 80, height: 70, type: 'box' },
            { x: 450, y: 180, width: 50, height: 60, type: 'chair' }
        ],
        maxAttempts: 5
    }
];

// Export for use in flip-bottle.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = bottleFlipLevels;
}
