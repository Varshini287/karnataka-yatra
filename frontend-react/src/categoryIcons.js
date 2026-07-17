const ICON_MAP = {
  "Temple": "🛕",
  "Fort": "🏰",
  "Palace": "🏯",
  "Waterfall": "🌊",
  "Beach": "🏖️",
  "Lake": "💧",
  "Park": "🌳",
  "Garden": "🌷",
  "Wildlife Sanctuary": "🦌",
  "Hill/Viewpoint": "⛰️",
  "Cave": "🕳️",
  "Museum": "🏛️",
  "Attraction": "📍",
};

export function getCategoryIcon(category) {
  return ICON_MAP[category] || "📍";
}