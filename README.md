

A full-stack mystery-guessing game built around real Karnataka tourism data. Explore 10 districts, solve riddles about 247 real places, unlock hints, and rack up points — while actually learning about Karnataka's temples, forts, waterfalls, and hidden gems.

🎮 **Live Demo: https://karnataka-yatra.vercel.app
🔗 **Backend API: https://karnataka-yatra.onrender.com

## ✨ Features

- 🗺️ **10 districts as game levels** — Bengaluru, Mysuru, Coorg, Hampi, Mangaluru, Hassan, Mandya, Chikkaballapur, Uttara Kannada, Kalaburagi
- 🔍 **247 real places** with riddles generated from real tourism data, sorted easy → medium → hard
- 🧩 **Progressive hint system** — first letter, category, and a specific clue, each costing points
- 🖼️ **Real photos** pulled from Wikipedia, with a themed category-icon fallback for places without one
- 🏆 **Scoring system** — speed bonus, hint penalties, wrong-guess penalties, all validated server-side
- 🔥 **Streak tracking** and **🏅 badges/achievements** (Karnataka Master, Riddle Genius, Speed Demon, and more)
- 💾 **Progress persistence** — resume exactly where you left off, per district
- 📱 **Installable PWA** — add it to your phone's home screen like a native app
- 🔊 **Sound effects** via the Web Audio API (no external audio files)

## 🛠️ Tech Stack

**Frontend:** React, Vite, JavaScript, CSS
**Backend:** Python, FastAPI, Uvicorn
**Data:** Pandas, Wikipedia API
**Deployment:** Vercel (frontend), Render (backend)
**Other:** PWA (manifest + service worker), localStorage, Web Audio API

## 🏗️ Architecture

Raw tourism CSV (name, district, description, activities)
│
▼
Data cleaning + riddle/hint generation (Python/Pandas)
│
▼
Real photo enrichment via Wikipedia API
│
▼
FastAPI backend
/levels /level/{district} /guess /reveal
(answers validated server-side, never leaked
to the frontend before a correct guess)
│
▼
React frontend — district map → mystery
grid → riddle screen, with scoring,
streaks, badges, and progress tracking


## 📂 Project Structure

karnataka-yatra/
├── data/
│ ├── karnataka_tourism_uploaded.csv # raw source data
│ ├── build_hints_dataset.py # generates riddles + hints
│ ├── add_difficulty_and_levels.py # assigns difficulty + coordinates
│ ├── fetch_real_images.py # pulls real Wikipedia photos
│ └── karnataka_places_final.csv # final dataset (247 places)
├── backend/
│ ├── main.py # FastAPI app
│ └── requirements.txt
├── frontend-react/
│ ├── src/
│ │ ├── App.jsx
│ │ ├── api.js
│ │ ├── badges.js
│ │ ├── categoryIcons.js
│ │ ├── sounds.js
│ │ └── components/
│ │ ├── LevelsScreen.jsx
│ │ ├── MysteryGridScreen.jsx
│ │ ├── MysteryScreen.jsx
│ │ └── BadgesScreen.jsx
│ └── public/
│ ├── icon.svg
│ ├── manifest.json
│ └── sw.js
└── README.md


## 🚀 Running Locally

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend-react
npm install
npm run dev
```

Visit `http://localhost:5173`.

## 🎯 What This Project Demonstrates

- Real-world data cleaning (duplicates, malformed rows, inconsistent formatting)
- Programmatic content generation (riddles, difficulty ratings, category tagging) without relying on paid APIs
- REST API design with server-side validation and anti-cheat logic
- Full-stack deployment across two independent platforms (Render + Vercel)
- Frontend state management, progress persistence, and PWA packaging

## 👩‍💻 Author

Built by [Varshini H A](https://github.com/Varshini287/karnataka-yatra) — a hands-on portfolio project built step-by-step to learn full-stack development, from raw data to a deployed, installable app.
