// Screw Game Levels - Auto-detected level system
const levels = {
    1: {
        name: 'Easy Start',
        shapes: [
            { id: 'A', name: 'Block A', screws: [0,1], requiredAngle: 0 },
            { id: 'B', name: 'Block B', screws: [2,3], requiredAngle: 0 }
        ],
        init: function() {
            // Simple level: two shapes each held by two screws
        }
    },
    2: {
        name: 'Getting Harder',
        shapes: [
            { id: 'A', name: 'Plate A', screws: [0,2], requiredAngle: 0 },
            { id: 'B', name: 'Plate B', screws: [1,3,4], requiredAngle: 0 }
        ],
        init: function() {
            // Level with multiple-screw shapes
        }
    },
    3: {
        name: 'Medium Challenge',
        shapes: [
            { id: 'A', name: 'Clamp', screws: [0,1,2], requiredAngle: 0 },
            { id: 'B', name: 'Latch', screws: [3,4,5], requiredAngle: 0 }
        ],
        init: function() {
            // Balanced level
        }
    },
    4: {
        name: 'Tricky Puzzle',
        shapes: [
            { id: 'A', name: 'Shield', screws: [0,3], requiredAngle: 0 },
            { id: 'B', name: 'Holder', screws: [1,2,4], requiredAngle: 0 }
        ],
        init: function() {
            // Mixed configuration
        }
    },
    5: {
        name: 'Advanced',
        init: function() {
            // Complex level
        }
    },
    6: {
        name: 'Expert',
        init: function() {
            // Very difficult level
        }
    },
    7: {
        name: 'Master',
        init: function() {
            // Challenge level
        }
    },
    8: {
        name: 'Extreme',
        init: function() {
            // Extreme difficulty
        }
    },
    9: {
        name: 'Impossible?',
        init: function() {
            // Near impossible
        }
    },
    10: {
        name: 'Legendary',
        init: function() {
            // Legendary difficulty
        }
    }
};

// Auto-expand levels to 50 total levels
function expandLevels(targetCount) {
    const baseCount = Object.keys(levels).length;
    for (let i = baseCount + 1; i <= targetCount; i++) {
        const difficulty = Math.floor((i - 1) / 10) + 1;
        levels[i] = {
            name: `Level ${i}`,
            difficulty: difficulty,
            shapes: [],
            init: function() {
                // Each level can have different configurations
            }
        };
    }
}

// Expand to 50 levels initially
expandLevels(50);
