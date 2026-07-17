import { useState, useEffect } from "react";
import LevelsScreen from "./components/LevelsScreen";
import MysteryGridScreen from "./components/MysteryGridScreen";
import MysteryScreen from "./components/MysteryScreen";
import BadgesScreen from "./components/BadgesScreen";
import { getLevels, getLevelMysteries } from "./api";
import "./App.css";

function loadSetFromStorage(key) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
}

function saveSetToStorage(key, set) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

export default function App() {
  const [screen, setScreen] = useState("levels");
  const [levels, setLevels] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [maxSpeedBonus, setMaxSpeedBonus] = useState(0);
  const [solvedIds, setSolvedIds] = useState(() => loadSetFromStorage("solvedMysteryIds"));
  const [hintUsedIds, setHintUsedIds] = useState(() => loadSetFromStorage("hintUsedMysteryIds"));
  const [districtMysteryMap, setDistrictMysteryMap] = useState({});

  const [currentDistrict, setCurrentDistrict] = useState(null);
  const [districtMysteries, setDistrictMysteries] = useState([]);
  const [currentMysteryIndex, setCurrentMysteryIndex] = useState(0);

  useEffect(() => {
    getLevels().then((data) => {
      setLevels(data.levels);
      Promise.all(
        data.levels.map((lvl) =>
          getLevelMysteries(lvl.district).then((res) => [lvl.district, res.mysteries.map((m) => m.id)])
        )
      ).then((pairs) => {
        setDistrictMysteryMap(Object.fromEntries(pairs));
      });
    });
  }, []);

  function handleSelectLevel(district) {
    setCurrentDistrict(district);
    getLevelMysteries(district).then((data) => {
      setDistrictMysteries(data.mysteries);
      setScreen("grid");
    });
  }

  function handleSelectMystery(index) {
    setCurrentMysteryIndex(index);
    setScreen("mystery");
  }

  function handleScoreChange(points, wasCorrect, speedBonus = 0) {
    setTotalScore((prev) => prev + points);
    if (wasCorrect) {
      setTotalSolved((prev) => prev + 1);
      setMaxSpeedBonus((prev) => Math.max(prev, speedBonus));
    }
  }

  function handleStreakChange(wasCorrect) {
    setStreak((prev) => {
      const next = wasCorrect ? prev + 1 : 0;
      setBestStreak((best) => Math.max(best, next));
      return next;
    });
  }

  function handleMysterySolved(mysteryId) {
    setSolvedIds((prev) => {
      const updated = new Set(prev);
      updated.add(mysteryId);
      saveSetToStorage("solvedMysteryIds", updated);
      return updated;
    });
  }

  function handleHintUsed(mysteryId) {
    setHintUsedIds((prev) => {
      const updated = new Set(prev);
      updated.add(mysteryId);
      saveSetToStorage("hintUsedMysteryIds", updated);
      return updated;
    });
  }

  function handleBackToGrid() {
    setScreen("grid");
  }

  function handleBackToLevels() {
    setScreen("levels");
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Karnataka Mystery Trail</h1>
        <div className="score-bar">
          <span>Score: <strong>{totalScore}</strong></span>
          {streak >= 3 && <span className="streak-badge">🔥 {streak}</span>}
          <span>Solved: <strong>{totalSolved}</strong></span>
        </div>
        {screen !== "badges" && (
          <button className="text-btn" style={{ padding: "6px 0 0" }} onClick={() => setScreen("badges")}>
            🏅 View Badges
          </button>
        )}
      </header>

      <main>
        {screen === "levels" && (
          <LevelsScreen levels={levels} onSelectLevel={handleSelectLevel} />
        )}

        {screen === "grid" && (
          <MysteryGridScreen
            district={currentDistrict}
            mysteries={districtMysteries}
            solvedIds={solvedIds}
            onSelectMystery={handleSelectMystery}
            onBack={handleBackToLevels}
          />
        )}

        {screen === "mystery" && (
          <MysteryScreen
            mystery={districtMysteries[currentMysteryIndex]}
            mysteryNumber={currentMysteryIndex + 1}
            totalMysteries={districtMysteries.length}
            onMysterySolved={handleMysterySolved}
            onHintUsed={handleHintUsed}
            onScoreChange={handleScoreChange}
            onStreakChange={handleStreakChange}
            onBackToGrid={handleBackToGrid}
          />
        )}

        {screen === "badges" && (
          <BadgesScreen
            districtMysteryMap={districtMysteryMap}
            solvedIds={solvedIds}
            hintUsedIds={hintUsedIds}
            bestStreak={bestStreak}
            maxSpeedBonus={maxSpeedBonus}
            onBack={() => setScreen("levels")}
          />
        )}
      </main>
    </div>
  );
}