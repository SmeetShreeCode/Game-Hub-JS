// Crossword Game Levels
// 
// HOW TO ADD MORE LEVELS:
// =======================
// Simply add a new object to the levels array below.
// Each level needs:
//   - across: Array of across words with {word, clue}
//   - down: Array of down words with {word, clue}
//
// Example:
//   {
//       across: [
//           { word: "HELLO", clue: "A greeting" },
//           { word: "WORLD", clue: "Our planet" }
//       ],
//       down: [
//           { word: "HI", clue: "Another greeting" },
//           { word: "OLD", clue: "Not new" }
//       ]
//   }
//
// TIPS:
// - Words will automatically be placed on the grid
// - The game finds intersections between words automatically
// - Clue numbers are assigned automatically
// - Just provide word and clue - that's it!

const crosswordLevels = [
    // Level 1 - Easy
    {
        across: [
            { word: "CAT", clue: "A furry pet" },
            { word: "DOG", clue: "Man's best friend" }
        ],
        down: [
            { word: "CAR", clue: "A vehicle" },
            { word: "BAT", clue: "Flying mammal" },
            { word: "GEM", clue: "Precious stone" }
        ]
    },

    // Level 2 - Easy
    {
        across: [
            { word: "SUN", clue: "Bright star in the sky" },
            { word: "MOON", clue: "Earth's natural satellite" },
            { word: "STAR", clue: "Twinkling light in the night" }
        ],
        down: [
            { word: "TOE", clue: "Part of your foot" },
            { word: "ART", clue: "Creative expression" }
        ]
    },

    // Level 3 - Medium
    {
        across: [
            { word: "APPLE", clue: "Red or green fruit" },
            { word: "BANANA", clue: "Yellow curved fruit" },
            { word: "PEAR", clue: "Green fruit" }
        ],
        down: [
            { word: "APE", clue: "Primate" },
            { word: "PAN", clue: "Cooking utensil" },
            { word: "LEG", clue: "Body part" },
            { word: "EAR", clue: "Hearing organ" }
        ]
    },

    // Level 4 - Medium
    {
        across: [
            { word: "COMPUTER", clue: "Electronic device" },
            { word: "MOUSE", clue: "Computer accessory" },
            { word: "KEYBOARD", clue: "Typing device" }
        ],
        down: [
            { word: "CAM", clue: "Video recording device" },
            { word: "OAK", clue: "Type of tree" },
            { word: "MOP", clue: "Cleaning tool" },
            { word: "USE", clue: "To utilize" },
            { word: "TEA", clue: "Hot beverage" },
            { word: "RED", clue: "Color" }
        ]
    },

    // Level 5 - Hard
    {
        across: [
            { word: "ELEPHANT", clue: "Large gray animal with trunk" },
            { word: "TIGER", clue: "Striped big cat" },
            { word: "LION", clue: "King of the jungle" },
            { word: "BEAR", clue: "Hibernating animal" }
        ],
        down: [
            { word: "EAT", clue: "To consume food" },
            { word: "LEG", clue: "Body part" },
            { word: "PIE", clue: "Dessert" },
            { word: "HAT", clue: "Head covering" },
            { word: "ANT", clue: "Small insect" },
            { word: "TOE", clue: "Foot digit" }
        ]
    }
];

// Export for use in crossword.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = crosswordLevels;
}
