// Hangman Game Levels
// 
// HOW TO ADD MORE LEVELS:
// =======================
// Simply add a new object to the levels array below.
// Each level needs:
//   - word: The word to guess (string)
//   - hint: A helpful hint (string)
//   - category: Optional category name (string)
//
// Example:
//   {
//       word: "ELEPHANT",
//       hint: "A large animal with a trunk",
//       category: "Animals"
//   }
//
// TIPS:
// - Use UPPERCASE letters for words
// - Keep hints short and helpful
// - You can add as many levels as you want
// - Levels are automatically unlocked in order
// - The game will show the category in the level select if provided

const hangmanLevels = [
    // Level 1
    {
        word: "HELLO",
        hint: "A friendly greeting",
        category: "Greetings"
    },
    
    // Level 2
    {
        word: "COMPUTER",
        hint: "Device you're using right now",
        category: "Technology"
    },
    
    // Level 3
    {
        word: "ELEPHANT",
        hint: "Largest land animal",
        category: "Animals"
    },
    
    // Level 4
    {
        word: "MOUNTAIN",
        hint: "Very tall natural structure",
        category: "Geography"
    },
    
    // Level 5
    {
        word: "CHOCOLATE",
        hint: "Sweet treat made from cocoa",
        category: "Food"
    },
    
    // Level 6
    {
        word: "BUTTERFLY",
        hint: "Colorful flying insect",
        category: "Animals"
    },
    
    // Level 7
    {
        word: "ADVENTURE",
        hint: "An exciting experience",
        category: "General"
    },
    
    // Level 8
    {
        word: "SUNSHINE",
        hint: "Bright light from the sky",
        category: "Nature"
    },
    
    // Level 9
    {
        word: "KEYBOARD",
        hint: "Input device with keys",
        category: "Technology"
    },
    
    // Level 10
    {
        word: "OCEAN",
        hint: "Large body of salt water",
        category: "Geography"
    },
    
    // Level 11
    {
        word: "LIBRARY",
        hint: "Place with many books",
        category: "Places"
    },
    
    // Level 12
    {
        word: "RAINBOW",
        hint: "Colorful arc in the sky",
        category: "Nature"
    },
    
    // Level 13
    {
        word: "TELESCOPE",
        hint: "Device to see distant objects",
        category: "Science"
    },
    
    // Level 14
    {
        word: "BALLOON",
        hint: "Inflatable floating object",
        category: "Objects"
    },
    
    // Level 15
    {
        word: "PYRAMID",
        hint: "Ancient Egyptian structure",
        category: "History"
    },
    
    // Level 16
    {
        word: "JOURNEY",
        hint: "A trip or voyage",
        category: "General"
    },
    
    // Level 17
    {
        word: "VOLCANO",
        hint: "Mountain that erupts",
        category: "Geography"
    },
    
    // Level 18
    {
        word: "TREASURE",
        hint: "Valuable hidden items",
        category: "General"
    },
    
    // Level 19
    {
        word: "GALAXY",
        hint: "Collection of stars",
        category: "Space"
    },
    
    // Level 20
    {
        word: "MYSTERY",
        hint: "Something unknown or puzzling",
        category: "General"
    },
    
    // ADD MORE LEVELS BELOW THIS LINE
    // ================================
    // 
    // Example:
    // {
    //     word: "YOURWORD",
    //     hint: "Your hint here",
    //     category: "Your Category"
    // },
    //
    // Just copy the format above and add as many as you want!
];

