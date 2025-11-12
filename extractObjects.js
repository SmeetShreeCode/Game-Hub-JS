// extractObjects.js
// Usage: node extractObjects.js map.json
// Usage:  node extractObjects.js images/king-and-pigs/tiled/Json/EE.json
// Usage:  node extractObjects.js images/king-and-pigs/tiled/Json/EE.tmj

import fs from "fs";

const fileName = process.argv[2];
if (!fileName) {
    console.error("❌ Please provide a Tiled map JSON file.\nExample: node extractObjects.js map.json");
    process.exit(1);
}

try {
    const data = JSON.parse(fs.readFileSync(fileName, "utf8"));
    const objects = [];

    for (const layer of data.layers) {
        if (layer.type === "objectgroup" && Array.isArray(layer.objects)) {
            for (const obj of layer.objects) {
                objects.push({
                    id: obj.id,
                    gid: obj.gid,
                    // round coordinates to integers
                    x: Math.round(obj.x),
                    y: Math.round(obj.y),
                    name: obj.name || "",
                });
            }
        }
    }

    // Sort by Y, then X
    // objects.sort((a, b) => a.y - b.y || a.x - b.x);

    // Print as a JSON array
    console.log(JSON.stringify(objects, null, 2));

} catch (err) {
    console.error("❌ Error reading or parsing file:", err.message);
}
