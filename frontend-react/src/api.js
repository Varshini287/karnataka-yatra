const API_BASE = "https://karnataka-yatra.onrender.com";

export async function getLevels() {
  const res = await fetch(`${API_BASE}/levels`);
  return res.json();
}

export async function getLevelMysteries(district) {
  const res = await fetch(`${API_BASE}/level/${encodeURIComponent(district)}`);
  return res.json();
}

export async function submitGuess({ mysteryId, guess, hintsUsed, elapsedSeconds, wrongAttempts }) {
  const res = await fetch(`${API_BASE}/guess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mystery_id: mysteryId,
      guess,
      hints_used: hintsUsed,
      elapsed_seconds: elapsedSeconds,
      wrong_attempts: wrongAttempts,
    }),
  });
  return res.json();
}

export async function revealMystery(mysteryId) {
  const res = await fetch(`${API_BASE}/reveal/${mysteryId}`);
  return res.json();
}

// Tries to get a REAL photo from Wikipedia. Falls back to null if not found
// (the component decides what to show instead, e.g. the placeholder).
export async function fetchWikipediaImage(placeName) {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeName)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail ? data.thumbnail.source : null;
  } catch {
    return null;
  }
}