import { useEffect, useRef } from "react";
import { playDistrictCompleteSound } from "../sounds";

export default function MysteryGridScreen({ district, mysteries, solvedIds, onSelectMystery, onBack }) {
  const nextPlayableIndex = mysteries.findIndex((m) => !solvedIds.has(m.id));
  const allSolved = nextPlayableIndex === -1 && mysteries.length > 0;
  const solvedCount = mysteries.filter((m) => solvedIds.has(m.id)).length;
  const hasCelebrated = useRef(false);

  useEffect(() => {
    if (allSolved && !hasCelebrated.current) {
      hasCelebrated.current = true;
      playDistrictCompleteSound();
    }
  }, [allSolved]);

  return (
    <section className="screen">
      <button className="text-btn" onClick={onBack}>&larr; Districts</button>

      <div className="grid-header">
        <h2>{district}</h2>
        <p className="subtitle">{solvedCount}/{mysteries.length} solved</p>
      </div>

      {allSolved && (
        <div className="card" style={{ textAlign: "center", marginBottom: 16 }}>
          🎉 You've cleared every mystery here!
        </div>
      )}

      <div className="mystery-grid">
        {mysteries.map((m, i) => {
          const isDone = solvedIds.has(m.id);
          const isCurrent = i === nextPlayableIndex;
          const isLocked = !isDone && !isCurrent;

          let nodeClass = "grid-node";
          if (isDone) nodeClass += " node-done";
          else if (isCurrent) nodeClass += " node-current";
          else nodeClass += " node-locked";

          return (
            <div
              key={m.id}
              className={nodeClass}
              onClick={() => isCurrent && onSelectMystery(i)}
            >
              {isDone ? "⭐" : isLocked ? "🔒" : i + 1}
            </div>
          );
        })}
      </div>
    </section>
  );
}