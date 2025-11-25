// Word Search Game Levels
// 
// HOW TO ADD MORE LEVELS:
// =======================
// Simply add a new object to the levels array below.
// Each level needs:
//   - words: Array of words to find (strings)
//   - category: Optional category name (string)
//
// Example:
//   {
//       words: ["HELLO", "WORLD", "GAME"],
//       category: "Greetings"
//   }
//
// TIPS:
// - Use UPPERCASE letters for words
// - Words should be 3-15 characters long
// - You can add as many words as you want per level
// - Levels are automatically unlocked in order
// - The game will automatically generate the grid size
// - Words can be placed horizontally, vertically, or diagonally

const wordSearchLevels = [
    // Level 1 - Easy
    {
        words: ["CAT", "DOG", "BIRD"],
        category: "Animals"
    },
    
    // Level 2
    {
        words: ["SUN", "MOON", "STAR"],
        category: "Space"
    },
    
    // Level 3
    {
        words: ["APPLE", "BANANA", "ORANGE", "MANGO"],
        category: "Fruits"
    },
    
    // Level 4
    {
        words: ["RED", "BLUE", "GREEN", "YELLOW"],
        category: "Colors"
    },
    
    // Level 5
    {
        words: ["BOOK", "PEN", "PAPER", "DESK"],
        category: "School"
    },
    
    // Level 6
    {
        words: ["CAR", "BUS", "TRAIN", "PLANE"],
        category: "Transport"
    },
    
    // Level 7
    {
        words: ["MUSIC", "SONG", "DANCE"],
        category: "Entertainment"
    },
    
    // Level 8
    {
        words: ["WATER", "FIRE", "EARTH", "AIR"],
        category: "Elements"
    },
    
    // Level 9
    {
        words: ["SPRING", "SUMMER", "WINTER", "AUTUMN"],
        category: "Seasons"
    },
    
    // Level 10
    {
        words: ["MOUNTAIN", "RIVER", "OCEAN", "FOREST"],
        category: "Nature"
    },
    
    // Level 11
    {
        words: ["COMPUTER", "KEYBOARD", "MOUSE", "MONITOR"],
        category: "Technology"
    },
    
    // Level 12
    {
        words: ["PIZZA", "BURGER", "SANDWICH", "SALAD"],
        category: "Food"
    },
    
    // Level 13
    {
        words: ["DOCTOR", "TEACHER", "ENGINEER", "ARTIST"],
        category: "Professions"
    },
    
    // Level 14
    {
        words: ["BASKETBALL", "FOOTBALL", "TENNIS", "SWIMMING"],
        category: "Sports"
    },
    
    // Level 15
    {
        words: ["LIBRARY", "HOSPITAL", "SCHOOL", "PARK"],
        category: "Places"
    },
    
    // Level 16
    {
        words: ["ELEPHANT", "LION", "TIGER", "BEAR"],
        category: "Wild Animals"
    },
    
    // Level 17
    {
        words: ["GUITAR", "PIANO", "DRUMS", "VIOLIN"],
        category: "Instruments"
    },
    
    // Level 18
    {
        words: ["CHOCOLATE", "CANDY", "CAKE", "COOKIE"],
        category: "Desserts"
    },
    
    // Level 19
    {
        words: ["RAINBOW", "CLOUD", "STORM", "LIGHTNING"],
        category: "Weather"
    },
    
    // Level 20
    {
        words: ["ADVENTURE", "JOURNEY", "TRAVEL", "EXPLORE"],
        category: "Travel"
    },
    
    // ADD MORE LEVELS BELOW THIS LINE
    // ================================
    // 
    // Example:
    // {
    //     words: ["WORD1", "WORD2", "WORD3"],
    //     category: "Your Category"
    // },
    //
    // Just copy the format above and add as many levels as you want!
    // The game will automatically:
    // - Generate the grid size
    // - Place words in random directions
    // - Fill remaining cells with random letters
    // - Handle word finding and validation
];

