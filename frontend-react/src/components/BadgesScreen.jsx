import { BADGES, computeBadgeStats } from "../badges";

export default function BadgesScreen({ districtMysteryMap, solvedIds, hintUsedIds, bestStreak, maxSpeedBonus, onBack }) {
  const stats = computeBadgeStats({ districtMysteryMap, solvedIds, hintUsedIds, bestStreak, maxSpeedBonus });

  return (
    <section className="screen">
      <button className="text-btn" onClick={onBack}>&larr; Districts</button>
      <p className="subtitle">Your Badges</p>

      <div className="badges-grid">
        {BADGES.map((badge) => {
          const earned = badge.check(stats);
          return (
            <div key={badge.id} className={`badge-card ${earned ? "earned" : ""}`}>
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-name">{badge.name}</div>
              <div className="badge-desc">{badge.desc}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}