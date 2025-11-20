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
    {
        word: "HELLO",
        hint: "A friendly greeting",
        category: "Greetings"
    },
    {
        word: "APPLE",
        hint: "A sweet red or green fruit",
        category: "Food"
    },
    {
        word: "RIVER",
        hint: "A flowing stream of water",
        category: "Nature"
    },
    {
        word: "CHAIR",
        hint: "Furniture you sit on",
        category: "Objects"
    },
    {
        word: "BREAD",
        hint: "Staple food made with flour",
        category: "Food"
    },
    {
        word: "PHONE",
        hint: "Used to make calls",
        category: "Technology"
    },
    {
        word: "ZEBRA",
        hint: "Striped animal",
        category: "Animals"
    },
    {
        word: "PLANT",
        hint: "Grows in soil",
        category: "Nature"
    },
    {
        word: "SMILE",
        hint: "Happy facial expression",
        category: "General"
    },
    {
        word: "TRAIN",
        hint: "Vehicle that runs on tracks",
        category: "Transport"
    },
    {
        word: "BERRY",
        hint: "Small juicy fruit",
        category: "Food"
    },
    {
        word: "LIGHT",
        hint: "Opposite of dark",
        category: "General"
    },
    {
        word: "CLOUD",
        hint: "White thing in the sky",
        category: "Nature"
    },
    {
        word: "SNAKE",
        hint: "Legless reptile",
        category: "Animals"
    },
    {
        word: "PIZZA",
        hint: "Cheesy Italian dish",
        category: "Food"
    },
    {
        word: "WATER",
        hint: "Clear liquid essential for life",
        category: "Nature"
    },
    {
        word: "HOUSE",
        hint: "Place you live",
        category: "Places"
    },
    {
        word: "SHEEP",
        hint: "Animal that gives wool",
        category: "Animals"
    },
    {
        word: "BRAIN",
        hint: "Controls the body",
        category: "Biology"
    },
    {
        word: "WORLD",
        hint: "Earth",
        category: "General"
    },
    {
        word: "LEMON",
        hint: "Sour yellow fruit",
        category: "Food"
    },
    {
        word: "STARS",
        hint: "Shine in the night sky",
        category: "Space"
    },
    {
        word: "FROG",
        hint: "Green jumping animal",
        category: "Animals"
    },
    {
        word: "MUSIC",
        hint: "Pleasant sounds",
        category: "Art"
    },
    {
        word: "BEACH",
        hint: "Sandy shore",
        category: "Places"
    },
    {
        word: "CANDY",
        hint: "Sweet treat",
        category: "Food"
    },
    {
        word: "GHOST",
        hint: "Spooky spirit",
        category: "General"
    },
    {
        word: "SWORD",
        hint: "Sharp weapon",
        category: "Objects"
    },
    {
        word: "HORSE",
        hint: "Animal used for riding",
        category: "Animals"
    },
    {
        word: "BLOOM",
        hint: "Flower opening",
        category: "Nature"
    },
    {
        word: "MAPLE",
        hint: "Tree that makes syrup",
        category: "Nature"
    },
    {
        word: "CHALK",
        hint: "Used on blackboards",
        category: "Objects"
    },
    {
        word: "CHEST",
        hint: "Treasure storage box",
        category: "Objects"
    },
    {
        word: "CLOCK",
        hint: "Shows time",
        category: "Objects"
    },
    {
        word: "PANDA",
        hint: "Black and white bear",
        category: "Animals"
    },
    {
        word: "FAIRY",
        hint: "Tiny magical being",
        category: "Fantasy"
    },
    {
        word: "COOKIE",
        hint: "Small sweet snack",
        category: "Food"
    },
    {
        word: "FLAME",
        hint: "Part of fire",
        category: "Nature"
    },
    {
        word: "STONE",
        hint: "Small rock",
        category: "Nature"
    },
    {
        word: "SHIRT",
        hint: "Clothing for the upper body",
        category: "Fashion"
    },
    {
        word: "BLADE",
        hint: "Part of a knife",
        category: "Objects"
    },
    {
        word: "MOUSE",
        hint: "Small rodent or computer device",
        category: "Dual Meaning"
    },
    {
        word: "CROWN",
        hint: "Worn by kings",
        category: "Objects"
    },
    {
        word: "SWEET",
        hint: "Sugary taste",
        category: "Food"
    },
    {
        word: "BRUSH",
        hint: "Used for painting",
        category: "Art"
    },
    {
        word: "GRASS",
        hint: "Green ground plant",
        category: "Nature"
    },
    {
        word: "STORM",
        hint: "Bad weather",
        category: "Weather"
    },
    {
        word: "HONEY",
        hint: "Made by bees",
        category: "Food"
    },
    {
        word: "PEARL",
        hint: "Gem from oysters",
        category: "Objects"
    },
    {
        word: "TOWER",
        hint: "Tall building",
        category: "Places"
    },
    {
        word: "COMPUTER",
        hint: "Device you're using right now",
        category: "Technology"
    },
    {
        word: "ELEPHANT",
        hint: "Largest land animal",
        category: "Animals"
    },
    {
        word: "MOUNTAIN",
        hint: "Very tall natural structure",
        category: "Geography"
    },
    {
        word: "CHOCOLATE",
        hint: "Sweet treat made from cocoa",
        category: "Food"
    },
    {
        word: "BUTTERFLY",
        hint: "Colorful flying insect",
        category: "Animals"
    },
    {
        word: "ADVENTURE",
        hint: "An exciting experience",
        category: "General"
    },
    {
        word: "SUNSHINE",
        hint: "Bright light from the sky",
        category: "Nature"
    },
    {
        word: "KEYBOARD",
        hint: "Input device with keys",
        category: "Technology"
    },
    {
        word: "OCEAN",
        hint: "Large body of salt water",
        category: "Geography"
    },
    {
        word: "LIBRARY",
        hint: "Place with many books",
        category: "Places"
    },
    {
        word: "RAINBOW",
        hint: "Colorful arc in the sky",
        category: "Nature"
    },
    {
        word: "TELESCOPE",
        hint: "Device to see distant objects",
        category: "Science"
    },
    {
        word: "BALLOON",
        hint: "Inflatable floating object",
        category: "Objects"
    },
    {
        word: "PYRAMID",
        hint: "Ancient Egyptian structure",
        category: "History"
    },
    {
        word: "JOURNEY",
        hint: "A trip or voyage",
        category: "General"
    },
    {
        word: "VOLCANO",
        hint: "Mountain that erupts",
        category: "Geography"
    },
    {
        word: "TREASURE",
        hint: "Valuable hidden items",
        category: "General"
    },
    {
        word: "GALAXY",
        hint: "Collection of stars",
        category: "Space"
    },
    {
        word: "MYSTERY",
        hint: "Something unknown or puzzling",
        category: "General"
    },
    {
        word: "PARROT",
        hint: "Bird that can mimic speech",
        category: "Animals"
    },
    {
        word: "JOURNEY",
        hint: "A long trip",
        category: "General"
    },
    {
        word: "VOLCANO",
        hint: "Mountain that erupts",
        category: "Geography"
    },
    {
        word: "ORBITAL",
        hint: "Path around a planet",
        category: "Space"
    },
    {
        word: "HORIZON",
        hint: "Line where sky meets land",
        category: "Nature"
    },
    {
        word: "DESERTS",
        hint: "Dry sandy areas",
        category: "Nature"
    },
    {
        word: "NETWORK",
        hint: "Connected system",
        category: "Technology"
    },
    {
        word: "TREASURE",
        hint: "Hidden valuables",
        category: "General"
    },
    {
        word: "RAINBOW",
        hint: "Colorful arc in the sky",
        category: "Nature"
    },
    {
        word: "DINNER",
        hint: "Evening meal",
        category: "Food"
    },
    {
        word: "ISLANDS",
        hint: "Land surrounded by water",
        category: "Geography"
    },
    {
        word: "PENGUIN",
        hint: "Flightless bird",
        category: "Animals"
    },
    {
        word: "SPACESHIP",
        hint: "Vehicle for space travel",
        category: "Space"
    },
    {
        word: "TELESCOPE",
        hint: "Tool to see far objects",
        category: "Science"
    },
    {
        word: "NOTEBOOK",
        hint: "Used for writing",
        category: "Objects"
    },
    {
        word: "BUTTERFLY",
        hint: "Colorful insect",
        category: "Animals"
    },
    {
        word: "ELEPHANT",
        hint: "Largest land animal",
        category: "Animals"
    },
    {
        word: "CHOCOLATE",
        hint: "Sweet treat",
        category: "Food"
    },
    {
        word: "MOUNTAIN",
        hint: "Tall natural landform",
        category: "Geography"
    },
    {
        word: "KEYBOARD",
        hint: "Input device",
        category: "Technology"
    },
    {
        word: "EARPHONE",
        hint: "Used to listen privately",
        category: "Technology"
    },
    {
        word: "VOLLEYBALL",
        hint: "Popular team sport",
        category: "Sports"
    },
    {
        word: "CAMPFIRE",
        hint: "Outdoor fire",
        category: "Nature"
    },
    {
        word: "REPTILES",
        hint: "Cold-blooded scaled animals",
        category: "Animals"
    },
    {
        word: "WATERFALL",
        hint: "Falling stream",
        category: "Nature"
    },
    {
        word: "HARVESTER",
        hint: "Farming machine",
        category: "Machines"
    },
    {
        word: "PAINTBRUSH",
        hint: "Artist's tool",
        category: "Art"
    },
    {
        word: "SAPPHIRE",
        hint: "Blue gemstone",
        category: "Objects"
    },
    {
        word: "ARCHITECT",
        hint: "Building designer",
        category: "Profession"
    },
    {
        word: "HOSPITAL",
        hint: "Place for medical care",
        category: "Places"
    },
    {
        word: "FORESTING",
        hint: "Managing tree growth",
        category: "Nature"
    },
    {
        word: "CARPENTER",
        hint: "Works with wood",
        category: "Profession"
    },
    {
        word: "SPACELINE",
        hint: "Future air travel company in space",
        category: "Space"
    },
    {
        word: "MEGAPHONE",
        hint: "Amplifies voice",
        category: "Objects"
    },
    {
        word: "WILDERNESS",
        hint: "Uninhabited natural area",
        category: "Nature"
    },
    {
        word: "ADVENTURE",
        hint: "Exciting experience",
        category: "General"
    },
    {
        word: "HEADPHONE",
        hint: "Audio device",
        category: "Technology"
    },
    {
        word: "SCIENTIST",
        hint: "Studies science",
        category: "Profession"
    },
    {
        word: "BACKPACKER",
        hint: "Traveler with a backpack",
        category: "Travel"
    },
    {
        word: "PINEAPPLE",
        hint: "Tropical fruit",
        category: "Food"
    },
    {
        word: "GALAXIES",
        hint: "Group of stars",
        category: "Space"
    },
    {
        word: "SUNSHINE",
        hint: "Bright light from sun",
        category: "Nature"
    },
    {
        word: "BLUEPRINT",
        hint: "Design plan",
        category: "Construction"
    },
    {
        word: "LIBRARIES",
        hint: "Places with books",
        category: "Places"
    },
    {
        word: "TORTOISES",
        hint: "Slow reptiles",
        category: "Animals"
    },
    {
        word: "ROLLERCOAST",
        hint: "Thrilling ride",
        category: "Entertainment"
    },
    {
        word: "SAPPHIRE",
        hint: "Blue gemstone",
        category: "Objects"
    },
    {
        word: "DRAGONFLY",
        hint: "Fast insect",
        category: "Animals"
    },
    {
        word: "PAINTBALL",
        hint: "Color-shooting sport",
        category: "Sports"
    },
    {
        word: "ASTRONAUT",
        hint: "Person who travels to space",
        category: "Space"
    },
    {
        word: "DINOSAUR",
        hint: "Extinct giant reptile",
        category: "Animals"
    },
    {
        word: "HEADPHONE",
        hint: "Device used to listen to audio",
        category: "Technology"
    },
    {
        word: "WILDERNESS",
        hint: "Uninhabited natural area",
        category: "Nature"
    },
    {
        word: "MICROSCOPE",
        hint: "Used to see tiny objects",
        category: "Science"
    },
    {
        word: "HOSPITAL",
        hint: "Place where doctors work",
        category: "Places"
    },
    {
        word: "DRAGONFLY",
        hint: "Fast-flying insect with long body",
        category: "Animals"
    },
    {
        word: "ASTEROID",
        hint: "Rocky object orbiting the sun",
        category: "Space"
    },
    {
        word: "NOTEBOOK",
        hint: "Used for writing notes",
        category: "Objects"
    },
    {
        word: "UMBRELLA",
        hint: "Used during rain",
        category: "Objects"
    },
    {
        word: "CARNIVAL",
        hint: "Festival with rides and games",
        category: "Events"
    },
    {
        word: "PENGUIN",
        hint: "Bird that cannot fly",
        category: "Animals"
    },
    {
        word: "SATELLITE",
        hint: "Orbits a planet",
        category: "Space"
    },
    {
        word: "RAILROAD",
        hint: "Tracks for trains",
        category: "Transport"
    },
    {
        word: "TEACUP",
        hint: "Small cup for hot drink",
        category: "Objects"
    },
    {
        word: "WATERFALL",
        hint: "Falling stream of water",
        category: "Nature"
    },
    {
        word: "SPACESHIP",
        hint: "Vehicle used for space travel",
        category: "Space"
    },
    {
        word: "CROCODILE",
        hint: "Reptile with strong jaws",
        category: "Animals"
    },
    {
        word: "MEGAPHONE",
        hint: "Used to amplify your voice",
        category: "Objects"
    },
    {
        word: "HARVEST",
        hint: "Collecting crops",
        category: "General"
    },
    {
        word: "PINEAPPLE",
        hint: "Tropical fruit",
        category: "Food"
    },
    {
        word: "ROLLERCOASTER",
        hint: "Thrilling amusement park ride",
        category: "Entertainment"
    },
    {
        word: "HURRICANE",
        hint: "Powerful rotating storm",
        category: "Weather"
    },
    {
        word: "SCIENTIST",
        hint: "Person who studies science",
        category: "Profession"
    },
    {
        word: "CASTLE",
        hint: "Large fortified building",
        category: "History"
    },
    {
        word: "CHEMISTRY",
        hint: "Science of matter",
        category: "Science"
    },
    {
        word: "SAPPHIRE",
        hint: "Blue precious gem",
        category: "Objects"
    },
    {
        word: "ORCHESTRA",
        hint: "Large group of musicians",
        category: "Music"
    },
    {
        word: "MEADOW",
        hint: "Grassland field",
        category: "Nature"
    },
    {
        word: "TORTOISE",
        hint: "Slow-moving shelled reptile",
        category: "Animals"
    },
    {
        word: "AIRPLANE",
        hint: "Vehicle that flies",
        category: "Transport"
    },
    {
        word: "BICYCLE",
        hint: "Two-wheeled vehicle",
        category: "Transport"
    },
    {
        word: "BACKPACK",
        hint: "Bag worn on the back",
        category: "Objects"
    },
    {
        word: "FOREST",
        hint: "Area filled with trees",
        category: "Nature"
    },
    {
        word: "PAINTBRUSH",
        hint: "Tool used by artists",
        category: "Art"
    },
    {
        word: "SANDWICH",
        hint: "Food with layers of filling",
        category: "Food"
    },
    {
        word: "MAGAZINE",
        hint: "Periodical publication",
        category: "Objects"
    },
    {
        word: "LIGHTHOUSE",
        hint: "Tall tower near the sea",
        category: "Places"
    },
    {
        word: "SCORPION",
        hint: "Arachnid with stinger",
        category: "Animals"
    },
    {
        word: "ENERGY",
        hint: "Power to do work",
        category: "Science"
    },
    {
        word: "METEOROLOGY",
        hint: "Study of weather",
        category: "Science"
    },
    {
        word: "BIOCHEMISTRY",
        hint: "Chemistry of living things",
        category: "Science"
    },
    {
        word: "ARCHAEOLOGY",
        hint: "Study of ancient artifacts",
        category: "Science"
    },
    {
        word: "CONSERVATION",
        hint: "Protecting natural resources",
        category: "Environment"
    },
    {
        word: "ASTRONAUTICS",
        hint: "Science of space travel",
        category: "Space"
    },
    {
        word: "ELECTRICITY",
        hint: "Flows through wires",
        category: "Science"
    },
    {
        word: "HYPOTHERMIA",
        hint: "Dangerously low body heat",
        category: "Medical"
    },
    {
        word: "CONSTELLATION",
        hint: "Star pattern",
        category: "Space"
    },
    {
        word: "PHOTOGRAPHER",
        hint: "Person who takes pictures",
        category: "Profession"
    },
    {
        word: "TRANQUILITY",
        hint: "Peaceful calmness",
        category: "General"
    },
    {
        word: "THUNDERSTORM",
        hint: "Rain with lightning",
        category: "Weather"
    },
    {
        word: "REVOLUTIONARY",
        hint: "Major change maker",
        category: "History"
    },
    {
        word: "HYPERCALCIUM",
        hint: "Too much calcium",
        category: "Science"
    },
    {
        word: "NEUROSCIENCE",
        hint: "Study of the brain",
        category: "Science"
    },
    {
        word: "INTERGALACTIC",
        hint: "Between galaxies",
        category: "Space"
    },
    {
        word: "MISUNDERSTAND",
        hint: "Fail to interpret correctly",
        category: "General"
    },
    {
        word: "RESPIRATORY",
        hint: "Related to breathing",
        category: "Biology"
    },
    {
        word: "TRANSFORMATION",
        hint: "Complete change",
        category: "General"
    },
    {
        word: "ENTREPRENEUR",
        hint: "Business starter",
        category: "Profession"
    },
    {
        word: "INVESTIGATION",
        hint: "Detailed examination",
        category: "General"
    },
    {
        word: "UNPREDICTABLE",
        hint: "Impossible to guess",
        category: "General"
    },
    {
        word: "THERMODYNAMIC",
        hint: "Relates to heat and energy",
        category: "Science"
    },
    {
        word: "DISAPPEARANCE",
        hint: "Becoming missing",
        category: "General"
    },
    {
        word: "MAGNIFICATION",
        hint: "Making something appear bigger",
        category: "Science"
    },
    {
        word: "CONSTRUCTION",
        hint: "Building something",
        category: "Work"
    },
    {
        word: "TRANSPARENTLY",
        hint: "Done openly",
        category: "General"
    },
    {
        word: "OVERSATURATION",
        hint: "Too much of something",
        category: "Science"
    },
    {
        word: "MICROSCOPICAL",
        hint: "Extremely small",
        category: "Science"
    },
    {
        word: "PHILOSOPHICAL",
        hint: "Related to deep thinking",
        category: "General"
    },
    {
        word: "DECONTAMINATE",
        hint: "Remove harmful substances",
        category: "Cleaning"
    },
    {
        word: "UNDERCARRIAGE",
        hint: "Bottom part of a vehicle",
        category: "Transport"
    },
    {
        word: "REHABILITATION",
        hint: "Process of recovery",
        category: "Medical"
    },
    {
        word: "MULTIPLICATION",
        hint: "Math operation",
        category: "Mathematics"
    },
    {
        word: "EXTRAORDINARY",
        hint: "Very unusual",
        category: "General"
    },
    {
        word: "INSTRUMENTATION",
        hint: "Musical equipment",
        category: "Music"
    },
    {
        word: "COORDINATION",
        hint: "Smooth movement control",
        category: "Biology"
    },
    {
        word: "PRECIPITATION",
        hint: "Rain, snow, hail",
        category: "Weather"
    },
    {
        word: "CONFIGURATION",
        hint: "Arrangement of parts",
        category: "Technology"
    },
    {
        word: "INTERVENTION",
        hint: "To step in",
        category: "General"
    },
    {
        word: "CIRCUMFERENCE",
        hint: "Distance around a circle",
        category: "Mathematics"
    },
    {
        word: "REJUVENATION",
        hint: "Become young again",
        category: "General"
    },
    {
        word: "MICROBIOLOGIST",
        hint: "Scientist who studies microbes",
        category: "Profession"
    },
    {
        word: "MISCOMMUNICATION",
        hint: "Incorrect communication",
        category: "General"
    },
    {
        word: "DETERMINATION",
        hint: "Strong will",
        category: "General"
    },
    {
        word: "RECONSTRUCTION",
        hint: "Rebuilding something",
        category: "General"
    },
    {
        word: "PSYCHOLOGICAL",
        hint: "Mind-related",
        category: "Science"
    },
    {
        word: "REFRIGERATION",
        hint: "Cooling process",
        category: "Technology"
    },
    {
        word: "INTERCONTINENTAL",
        hint: "Across continents",
        category: "Geography"
    },
    {
        word: "MISINTERPRET",
        hint: "Understand wrongly",
        category: "General"
    },

    // ADD MORE LEVELS BELOW THIS LINE
    // ================================
    // 
    // Example:
    // {
    //     word: "YOUR WORD",
    //     hint: "Your hint here",
    //     category: "Your Category"
    // },
    //
    // Just copy the format above and add as many as you want!
];

