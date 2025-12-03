# Advent Calendar

A small, front-end–only Advent calendar web app inspired by chocolate-box style calendars.  
Each day from 1 to 25 unlocks a scratch card with a little surprise message.

The layout mimics a physical advent calendar: a vertical card with a top strip, a logo area, a small winter scene (house + tree), and doors scattered across the scene instead of a simple grid.

---

## Features

- 25 "doors" (1–25), each mapped to a custom surprise message
- Scratch-card effect using an HTML `<canvas>` overlay
- Day-locking logic:
    - Doors unlock based on the **current date in December**
    - Doors prize generated automatically from the scheduled pipeline
- Light snow effect and subtle animations
- 100% frontend: just HTML, CSS and vanilla JavaScript

The main code is under the folder 'docs' so it can be hosted on GitHub Pages.

