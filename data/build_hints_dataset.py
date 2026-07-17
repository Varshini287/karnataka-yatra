"""
Transforms the raw uploaded CSV into a game-ready dataset with:
Place Name, Hint1 (hard), Hint2, Hint3 (easy), 3 Facts, and an intro line.
"""

import pandas as pd
import re

INPUT_FILE = "karnataka_tourism_uploaded.csv"
OUTPUT_FILE = "karnataka_places_hints.csv"

# Keyword -> category mapping, used to build Hint 2 and Fact 1
CATEGORY_KEYWORDS = [
    ("temple", "Temple"), ("fort", "Fort"), ("palace", "Palace"),
    ("falls", "Waterfall"), ("beach", "Beach"), ("lake", "Lake"),
    ("park", "Park"), ("garden", "Garden"), ("sanctuary", "Wildlife Sanctuary"),
    ("hill", "Hill/Viewpoint"), ("betta", "Hill/Viewpoint"), ("cave", "Cave"),
    ("museum", "Museum"),
]


def guess_category(name, description):
    text = f"{name} {description}".lower()
    for keyword, category in CATEGORY_KEYWORDS:
        if keyword in text:
            return category
    return "Attraction"


def strip_district_mentions(text, district):
    """Hint 1 should be the vaguest hint -- don't let the district name
    leak in through the raw description text."""
    return re.sub(re.escape(district), "this region", text, flags=re.IGNORECASE)


def build_row(row):
    name = row["name"]
    district = row["city"].title()
    description = row["description"]
    activities = row["activities"]

    category = guess_category(name, description)
    first_activity = activities.split(",")[0].strip()
    description_clean = strip_district_mentions(description, district)

    return {
        "name": name,
        "district": district,
        "intro": f"Somewhere in Karnataka, this {category.lower()} holds a story worth uncovering.",
        "hint1": f"{description_clean.strip().rstrip('.')}.",
        "hint2": f"It's a well-known {category.lower()}, popular for {first_activity.lower()}.",
        "hint3": f"Visitors flock here for {activities.lower()} -- a well-loved spot in {district} district.",
        "fact1": f"Category: {category}",
        "fact2": f"Known for: {description}",
        "fact3": f"Popular activities: {activities}",
    }


if __name__ == "__main__":
    df = pd.read_csv(INPUT_FILE, header=None,
                      names=["name", "city", "description", "activities", "e1", "e2", "e3"])
    df = df.drop(columns=["e1", "e2", "e3"])
    df = df.dropna(subset=["city", "name", "description"])
    df = df.drop_duplicates(subset="name", keep="first").reset_index(drop=True)

    rows = [build_row(r) for _, r in df.iterrows()]
    result = pd.DataFrame(rows)
    result.insert(0, "id", range(1, len(result) + 1))

    result.to_csv(OUTPUT_FILE, index=False)
    print(f"Saved {len(result)} places to {OUTPUT_FILE}")
    print(result.head(3).to_string())