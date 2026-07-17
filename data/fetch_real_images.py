"""
Fetches a real photo for each place from Wikipedia, using a two-step
search (find the best matching page, then grab its thumbnail image).

Run this ONCE, on a machine with normal internet access. Updates
image_url in place -- falls back to the existing placeholder for any
place Wikipedia doesn't have a photo for, or if a request fails.

Usage:
    pip install requests pandas
    python fetch_real_images.py
"""

import requests
import pandas as pd
import time

INPUT_FILE = "karnataka_places_final.csv"
OUTPUT_FILE = "karnataka_places_final.csv"

API_URL = "https://en.wikipedia.org/w/api.php"

# Wikipedia requires a descriptive User-Agent -- requests without one are
# often rejected or rate-limited.
HEADERS = {
    "User-Agent": "KarnatakaMysteryTrail/1.0 (student portfolio project; contact: your-email@example.com)"
}


def safe_get_json(params):
    """Makes the request and returns parsed JSON, or None if anything went wrong.
    Never raises -- prints a short diagnostic instead so the script can continue."""
    try:
        resp = requests.get(API_URL, params=params, headers=HEADERS, timeout=10)
        if resp.status_code != 200:
            print(f"    [warn] status {resp.status_code}: {resp.text[:150]}")
            return None
        return resp.json()
    except requests.exceptions.RequestException as e:
        print(f"    [warn] request failed: {e}")
        return None
    except ValueError:
        print(f"    [warn] response wasn't valid JSON: {resp.text[:150]}")
        return None


def find_best_page_title(query):
    params = {"action": "query", "list": "search", "srsearch": query, "format": "json", "srlimit": 1}
    data = safe_get_json(params)
    if not data:
        return None
    results = data.get("query", {}).get("search", [])
    return results[0]["title"] if results else None


def get_page_thumbnail(title):
    params = {"action": "query", "prop": "pageimages", "titles": title, "format": "json", "pithumbsize": 500}
    data = safe_get_json(params)
    if not data:
        return None
    pages = data.get("query", {}).get("pages", {})
    for page_data in pages.values():
        thumb = page_data.get("thumbnail", {}).get("source")
        if thumb:
            return thumb
    return None


def fetch_real_image(name, district):
    queries = [f"{name} {district} Karnataka", f"{name} Karnataka", name]
    for query in queries:
        title = find_best_page_title(query)
        if title:
            thumb = get_page_thumbnail(title)
            if thumb:
                return thumb
    return None


if __name__ == "__main__":
    df = pd.read_csv(INPUT_FILE)
    found_count = 0

    for i, row in df.iterrows():
        print(f"[{i+1}/{len(df)}] {row['name']}")
        real_image = fetch_real_image(row["name"], row["district"])
        if real_image:
            df.at[i, "image_url"] = real_image
            found_count += 1
            print("    -> found real photo")
        else:
            print("    -> no photo found, keeping placeholder")
        time.sleep(0.3)

    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\nDone. Found real photos for {found_count}/{len(df)} places")