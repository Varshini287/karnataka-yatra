

import os
import difflib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Karnataka Mystery Trail API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "karnataka_places_final.csv")
df = pd.read_csv(DATA_PATH)

LEVEL_ORDER = ["Bengaluru", "Mysuru", "Coorg", "Hampi", "Mangaluru",
               "Hassan", "Mandya", "Chikkaballapur", "Uttar Kannada", "Kalaburagi"]

BASE_CORRECT_POINTS = 100
WRONG_GUESS_PENALTY = -10
HINT_PENALTY = -20
MAX_SPEED_BONUS = 50
SPEED_BONUS_WINDOW_SECONDS = 50
MIN_CORRECT_POINTS = 10


class GuessRequest(BaseModel):
    mystery_id: int
    guess: str
    hints_used: int = 0
    elapsed_seconds: float = 0
    wrong_attempts: int = 0


def is_close_enough(guess: str, answer: str) -> bool:
    guess, answer = guess.strip().lower(), answer.strip().lower()
    if not guess:
        return False
    if guess in answer or answer in guess:
        return True
    return difflib.SequenceMatcher(None, guess, answer).ratio() > 0.6


def compute_speed_bonus(elapsed_seconds: float) -> int:
    remaining = max(0, SPEED_BONUS_WINDOW_SECONDS - elapsed_seconds)
    return round(MAX_SPEED_BONUS * (remaining / SPEED_BONUS_WINDOW_SECONDS))


@app.get("/")
def root():
    return {"status": "ok", "mysteries_loaded": len(df)}


@app.get("/levels")
def get_levels():
    levels = []
    for i, district in enumerate(LEVEL_ORDER):
        subset = df[df["district"] == district]
        if len(subset) == 0:
            continue
        levels.append({
            "order": i + 1,
            "district": district,
            "mystery_count": len(subset),
            "difficulty_mix": subset["difficulty"].value_counts().to_dict(),
        })
    return {"levels": levels}


@app.get("/level/{district}")
def get_level(district: str):
    filtered = df[df["district"].str.lower() == district.lower()]
    if filtered.empty:
        raise HTTPException(status_code=404, detail="No mysteries found for that district")
    mysteries = filtered[["id", "intro", "hint1", "hint2", "hint3", "difficulty"]].to_dict(orient="records")
    return {"district": district, "mysteries": mysteries}


@app.post("/guess")
def check_guess(req: GuessRequest):
    row = df[df["id"] == req.mystery_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Mystery not found")
    row = row.iloc[0]

    correct = is_close_enough(req.guess, row["name"])
    if not correct:
        return {"correct": False, "points": WRONG_GUESS_PENALTY, "correct_name": None}

    speed_bonus = compute_speed_bonus(req.elapsed_seconds)
    points = BASE_CORRECT_POINTS + speed_bonus
    points += req.hints_used * HINT_PENALTY
    points += req.wrong_attempts * WRONG_GUESS_PENALTY
    points = max(points, MIN_CORRECT_POINTS)

    return {
        "correct": True,
        "points": points,
        "speed_bonus": speed_bonus,
        "correct_name": row["name"],
        "facts": [row["fact1"], row["fact2"], row["fact3"]],
        "district": row["district"],
        "lat": float(row["lat"]),
        "lon": float(row["lon"]),
        "image_url": row["image_url"],
    }


@app.get("/reveal/{mystery_id}")
def give_up_reveal(mystery_id: int):
    row = df[df["id"] == mystery_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Mystery not found")
    row = row.iloc[0]
    return {
        "name": row["name"],
        "district": row["district"],
        "facts": [row["fact1"], row["fact2"], row["fact3"]],
        "lat": float(row["lat"]),
        "lon": float(row["lon"]),
        "image_url": row["image_url"],
    }





