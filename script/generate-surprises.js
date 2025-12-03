// scripts/generate-surprises.js
const fs = require("fs");
const path = require("path");

// Config
const TIMEZONE_OFFSET = 1; // Europe/Rome standard offset
const MAX_DAYS = 25;

function getRomeDate() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const rome = new Date(utc + TIMEZONE_OFFSET * 60 * 60000);
    return rome;
}

function main() {
    const allPath = path.join(__dirname, "..", "data", "all-surprises.json");
    const outPath = path.join(__dirname, "..", "docs", "surprises.json");

    const raw = fs.readFileSync(allPath, "utf8");
    const all = JSON.parse(raw);

    const todayRome = getRomeDate();

    const year = todayRome.getFullYear();
    const month = todayRome.getMonth();
    const day = todayRome.getDate();

    // If it's not December, you can decide:
    // - before 1 Dec: write empty array
    // - after 25 Dec: write all surprises
    let maxId;
    if (month < 11 || year < 2025) {
        maxId = 0;
    } else if (month > 11 || day >= MAX_DAYS) {
        maxId = MAX_DAYS;
    } else {
        maxId = Math.min(day, MAX_DAYS);
    }

    const mapped = all.map((item) => {
        const { id, ...rest } = item;

        if (id <= maxId) {
            // Day unlocked → include full content
            return item;
        } else {
            // Future days → only id
            return { id };
        }
    });

    fs.writeFileSync(outPath, JSON.stringify(mapped, null, 2), "utf8");
    console.log(
        `Generated surprises.json with ${mapped.length} items (up to day ${maxId}).`
    );
}

main();
