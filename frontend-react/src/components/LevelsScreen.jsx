export default function LevelsScreen({ levels, onSelectLevel }) {
  return (
    <section className="screen">
      <p className="subtitle">Pick a district to explore</p>
      <div className="levels-container">
        {levels.map((level) => (
          <div
            key={level.district}
            className="level-card"
            onClick={() => onSelectLevel(level.district)}
          >
            <div>
              <div className="level-name">{level.district}</div>
              <div className="level-meta">{level.mystery_count} mysteries</div>
            </div>
            <div className="level-badge">{level.order}</div>
          </div>
        ))}
      </div>
    </section>
  );
}