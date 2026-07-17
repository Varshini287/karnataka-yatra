"""
Adds difficulty ratings and district coordinates to the hints dataset
built in step 2. Also assigns a "theme" (level name) and sorts each
district's places from easy -> hard so gameplay has a natural progression.
"""

import pandas as pd

INPUT_FILE = "karnataka_places_hints.csv"
OUTPUT_FILE = "karnataka_places_final.csv"

# Approximate district center coordinates -- good enough for a map pin.
DISTRICT_COORDS = {
    "Bengaluru": (12.9716, 77.5946),
    "Mysuru": (12.2958, 76.6394),
    "Coorg": (12.3375, 75.8069),
    "Hampi": (15.3350, 76.4600),
    "Mangaluru": (12.9141, 74.8560),
    "Hassan": (13.0072, 76.0962),
    "Mandya": (12.5242, 76.8958),
    "Chikkaballapur": (13.4355, 77.7315),
    "Uttar Kannada": (14.8000, 74.6833),
    "Kalaburagi": (17.3297, 76.8343),
}

# Districts that are less touristy get a harder difficulty mix.
HARD_BIAS_DISTRICTS = {"Chikkaballapur", "Hassan", "Mandya", "Uttar Kannada", "Kalaburagi"}


def assign_difficulty(df):
    counters = {}
    difficulties = []
    for _, row in df.iterrows():
        district = row["district"]
        counters[district] = counters.get(district, 0) + 1
        pos = counters[district]
        cycle = ["medium", "hard", "hard"] if district in HARD_BIAS_DISTRICTS else ["easy", "medium", "hard"]
        difficulties.append(cycle[(pos - 1) % len(cycle)])
    df["difficulty"] = difficulties
    return df


if __name__ == "__main__":
    df = pd.read_csv(INPUT_FILE)

    df = assign_difficulty(df)

    df["lat"] = df["district"].map(lambda d: DISTRICT_COORDS.get(d, (14.5, 75.7))[0])
    df["lon"] = df["district"].map(lambda d: DISTRICT_COORDS.get(d, (14.5, 75.7))[1])

    # Sort so each district's places go easy -> medium -> hard
    difficulty_rank = {"easy": 0, "medium": 1, "hard": 2}
    df["diff_rank"] = df["difficulty"].map(difficulty_rank)
    df = df.sort_values(["district", "diff_rank"]).drop(columns=["diff_rank"])

    df.to_csv(OUTPUT_FILE, index=False)
    print(f"Saved {len(df)} places to {OUTPUT_FILE}")
    print(df.groupby(["district", "difficulty"]).size().unstack(fill_value=0))