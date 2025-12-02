const adventYear = new Date().getFullYear();
const adventMonth = 11; // dicembre

const doorsLayer = document.getElementById("doorsLayer");
const scratchModal = document.getElementById("scratchModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalDayLabel = document.getElementById("modalDayLabel");
const modalTitle = document.getElementById("modalTitle");
const surpriseTextEl = document.getElementById("surpriseText");
const scratchWrapper = document.getElementById("scratchWrapper");
const scratchCanvas = document.getElementById("scratchCanvas");

let remoteToday = null;
let surprisesById = {};

async function getCurrentTime() {
    return new Date()
}

async function loadSurprises() {
    const res = await fetch("surprises.json?cacheBust=" + Date.now());
    if (!res.ok) {
        throw new Error("Cannot load surprises.json: " + res.status);
    }
    const data = await res.json(); // array [{id, text}, ...]
    surprisesById = {};
    for (const item of data) {
        surprisesById[item.id] = item.text;
    }
}

function isDayUnlocked(day) {
    const todayYear = remoteToday.getFullYear();
    const todayMonth = remoteToday.getMonth();
    const todayDate = remoteToday.getDate();

    if (todayYear > adventYear) return true;
    if (todayYear < adventYear) return false;
    if (todayMonth > adventMonth) return true;
    if (todayMonth < adventMonth) return false;
    return todayDate >= day;
}

// Layout caselle "sparso" in percentuali (top/left) dentro .scene
const doorLayout = {
    // parte alta cielo
    23: { top: "6%", left: "18%" },
    24: { top: "6%", left: "42%" },
    25: { top: "6%", left: "68%" },

    // intorno al logo / cielo medio
    20: { top: "18%", left: "12%" },
    21: { top: "22%", left: "34%" },
    22: { top: "20%", left: "64%" },

    // sopra la casa
    10: { top: "32%", left: "10%" },
    19: { top: "30%", left: "40%" },
    8:  { top: "30%", left: "68%" },

    // zona casa
    2:  { top: "44%", left: "9%" },
    4:  { top: "52%", left: "22%" },
    6:  { top: "48%", left: "36%" },
    11: { top: "58%", left: "15%" },
    15: { top: "64%", left: "26%" },

    // collinetta bassa sinistra
    9:  { top: "72%", left: "16%" },
    3:  { top: "82%", left: "32%" },

    // zona albero (destra)
    13: { top: "34%", left: "78%" },
    16: { top: "42%", left: "70%" },
    17: { top: "52%", left: "80%" },
    18: { top: "60%", left: "68%" },
    12: { top: "66%", left: "82%" },
    14: { top: "74%", left: "72%" },

    // base destra
    7:  { top: "82%", left: "58%" },
    5:  { top: "88%", left: "46%" },
    1:  { top: "88%", left: "76%" }
};

function buildDoors() {
    doorsLayer.innerHTML = "";
    const todayYear = remoteToday.getFullYear();
    const todayMonth = remoteToday.getMonth();
    const todayDate = remoteToday.getDate();

    for (let day = 1; day <= 25; day++) {
        const pos = doorLayout[day];
        if (!pos) continue; // se per caso manca qualcosa

        const btn = document.createElement("button");
        btn.classList.add("door");
        btn.textContent = day;
        btn.style.top = pos.top;
        btn.style.left = pos.left;

        const unlocked = isDayUnlocked(day);
        if (!unlocked) {
            btn.classList.add("locked");
        } else {
            btn.addEventListener("click", () => openDay(day));
        }

        if (
            unlocked &&
            todayYear === adventYear &&
            todayMonth === adventMonth &&
            todayDate === day
        ) {
            btn.classList.add("today");
        }

        doorsLayer.appendChild(btn);
    }
}

function openDay(day) {
    modalDayLabel.textContent = `Giorno ${day} di 25`;
    modalTitle.textContent = "La tua sorpresa di oggi 🎁";
    surpriseTextEl.textContent =
        surprisesById[day] || "Oggi non ho scritto niente… ma ti amo lo stesso. 😅";

    scratchWrapper.classList.remove("cleared");
    scratchModal.classList.remove("hidden");
    initScratch();
}

function closeModal() {
    scratchModal.classList.add("hidden");
}

closeModalBtn.addEventListener("click", closeModal);
scratchModal.addEventListener("click", (e) => {
    if (e.target === scratchModal) closeModal();
});

function initScratch() {
    const ctx = scratchCanvas.getContext("2d");
    const rect = scratchWrapper.getBoundingClientRect();

    scratchCanvas.width = rect.width;
    scratchCanvas.height = rect.height;

    ctx.globalCompositeOperation = "source-over";

    const gradient = ctx.createLinearGradient(0, 0, scratchCanvas.width, scratchCanvas.height);
    gradient.addColorStop(0, "#e5e7eb");
    gradient.addColorStop(0.5, "#f9fafb");
    gradient.addColorStop(1, "#cbd5f5");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

    ctx.fillStyle = "rgba(148, 163, 184, 0.3)";
    for (let i = 0; i < 60; i++) {
        const x = Math.random() * scratchCanvas.width;
        const y = Math.random() * scratchCanvas.height;
        const r = 5 + Math.random() * 12;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalCompositeOperation = "destination-out";

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let scratchCount = 0;
    let cleared = false;
    const radius = 20;

    function getPos(e) {
        const bounds = scratchCanvas.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
            return {
                x: e.touches[0].clientX - bounds.left,
                y: e.touches[0].clientY - bounds.top
            };
        } else {
            return {
                x: e.clientX - bounds.left,
                y: e.clientY - bounds.top
            };
        }
    }

    function startScratch(e) {
        e.preventDefault();
        isDrawing = true;
        const pos = getPos(e);
        lastX = pos.x;
        lastY = pos.y;
        scratchCircle(pos.x, pos.y);
    }

    function moveScratch(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getPos(e);
        scratchLine(lastX, lastY, pos.x, pos.y);
        lastX = pos.x;
        lastY = pos.y;
        scratchCount++;

        if (!cleared && scratchCount % 8 === 0) {
            checkCleared();
        }
    }

    function endScratch() {
        isDrawing = false;
    }

    function scratchCircle(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function scratchLine(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.ceil(distance / (radius / 2));
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const x = x1 + dx * t;
            const y = y1 + dy * t;
            scratchCircle(x, y);
        }
    }

    function checkCleared() {
        const imageData = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
        const pixels = imageData.data;
        let transparentCount = 0;
        const total = pixels.length / 4;

        for (let i = 3; i < pixels.length; i += 4 * 6) {
            if (pixels[i] < 80) transparentCount++;
        }

        const ratio = transparentCount / (total / 6);
        if (ratio > 0.6) {
            cleared = true;
            scratchWrapper.classList.add("cleared");
        }
    }

    scratchCanvas.onmousedown = startScratch;
    scratchCanvas.onmousemove = moveScratch;
    window.addEventListener("mouseup", endScratch);

    scratchCanvas.ontouchstart = startScratch;
    scratchCanvas.ontouchmove = moveScratch;
    window.addEventListener("touchend", endScratch, { passive: false });
    window.addEventListener("touchcancel", endScratch, { passive: false });
}

function createSnowflakes(count = 60) {
    for (let i = 0; i < count; i++) {
        const s = document.createElement("div");
        s.className = "snowflake";
        const size = 2 + Math.random() * 3;
        const duration = 8 + Math.random() * 8;
        const delay = Math.random() * duration;
        const startX = Math.random() * 100;
        const offsetX = (Math.random() - 0.5) * 20;

        s.style.width = size + "px";
        s.style.height = size + "px";
        s.style.left = startX + "vw";
        s.style.setProperty("--offsetX", offsetX + "vw");
        s.style.animationDuration = duration + "s";
        s.style.animationDelay = delay + "s";

        document.body.appendChild(s);
    }
}

createSnowflakes(70);

(async function init() {
    await loadSurprises()
    remoteToday = await getCurrentTime();
    buildDoors();
})();