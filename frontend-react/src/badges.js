export const BADGES = [
  {
    id: "first_district",
    icon: "🗺️",
    name: "First Steps",
    desc: "Clear your first district",
    check: (stats) => stats.completedDistricts.length >= 1,
  },
  {
    id: "karnataka_master",
    icon: "🏆",
    name: "Karnataka Master",
    desc: "Clear all 10 districts",
    check: (stats) => stats.completedDistricts.length >= stats.totalDistricts && stats.totalDistricts > 0,
  },
  {
    id: "streak_master",
    icon: "🔥",
    name: "Streak Master",
    desc: "Hit a 5-answer streak",
    check: (stats) => stats.bestStreak >= 5,
  },
  {
    id: "riddle_genius",
    icon: "🧠",
    name: "Riddle Genius",
    desc: "Clear a district using zero hints",
    check: (stats) => stats.noHintDistricts.length >= 1,
  },
  {
    id: "speed_demon",
    icon: "⚡",
    name: "Speed Demon",
    desc: "Guess correctly in under 10 seconds",
    check: (stats) => stats.maxSpeedBonus >= 40,
  },
];

export function computeBadgeStats({ districtMysteryMap, solvedIds, hintUsedIds, bestStreak, maxSpeedBonus }) {
  const districts = Object.keys(districtMysteryMap);
  const completedDistricts = districts.filter((d) =>
    districtMysteryMap[d].length > 0 && districtMysteryMap[d].every((id) => solvedIds.has(id))
  );
  const noHintDistricts = completedDistricts.filter((d) =>
    districtMysteryMap[d].every((id) => !hintUsedIds.has(id))
  );

  return {
    completedDistricts,
    noHintDistricts,
    totalDistricts: districts.length,
    bestStreak,
    maxSpeedBonus,
  };
}