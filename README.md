# 1x1 Lernen – Einmaleins für Kinder

A fun, interactive multiplication tables app for kids, built with React + Vite. The app is fully in German and designed for children (ages 6–10) learning their 1×1 (times tables).

## Features

- **Tabelle** – Explore an interactive 10×10 multiplication table. Click any cell to highlight the equation; select a row to focus on a specific table.
- **Üben** – Self-paced practice with multiple-choice questions, streak counters (🔥), and a star reward system (⭐).
- **Quiz** – A 60-second speed challenge with real-time scoring and persistent high score tracking.
- Persistent progress via `localStorage` (total stars & quiz high score).
- Mobile-responsive, kid-friendly design with animations and colorful UI.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm

### Installation

```bash
git clone <repo-url>
cd 1x1-kids-app
npm install
```

### Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173` with hot-module reload.

### Production Build

```bash
npm run build      # Build to dist/
npm run preview    # Preview the production build locally
```

## Project Structure

```
src/
├── App.jsx                      # Root component / screen router
├── main.jsx                     # React entry point
├── index.css                    # Global styles & CSS variables
└── components/
    ├── HomeScreen.jsx            # Home / navigation screen
    ├── MultiplicationTable.jsx   # Table mode
    ├── PracticeMode.jsx          # Practice mode
    └── QuizMode.jsx              # Quiz mode
```

## Tech Stack

| Tool | Version |
|------|---------|
| React | 18.2 |
| Vite | 5.0 |
| @vitejs/plugin-react | 4.2 |

## License

MIT
