"""
Adds a placeholder image for each place, using its name. These are
generic colored placeholders for now (via placehold.co) so the game is
fully playable immediately. Swap in real photos later via a Wikipedia
enrichment script once you have a machine with normal internet access.
"""

import pandas as pd
from urllib.parse import quote

INPUT_FILE = "karnataka_places_final.csv"
OUTPUT_FILE = "karnataka_places_final.csv"  # overwrites in place


def make_image_url(name):
    return f"https://placehold.co/500x350/1c433c/8fe0a8?font=roboto&text={quote(name)}"


if __name__ == "__main__":
    df = pd.read_csv(INPUT_FILE)
    df["image_url"] = df["name"].apply(make_image_url)
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"Added image_url to {len(df)} places")
    print(df[["name", "image_url"]].head(3).to_string())