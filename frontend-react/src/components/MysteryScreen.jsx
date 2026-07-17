import { useState, useEffect } from "react";
import { submitGuess, revealMystery } from "../api";
import { getCategoryIcon } from "../categoryIcons";
import { playCorrectSound, playWrongSound, playHintSound } from "../sounds";

export default function MysteryScreen({
  mystery, mysteryNumber, totalMysteries, onMysterySolved, onHintUsed, onScoreChange, onStreakChange, onBackToGrid,
}) {
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [visibleHints, setVisibleHints] = useState([]);
  const [guessValue, setGuessValue] = useState("");
  const [feedback, setFeedback] = useState({ text: "", type: "" });
  const [result, setResult] = useState(null);
  const [locked, setLocked] = useState(false);
  const [startTime] = useState(Date.now());

  function useHint() {
    const nextHintNum = hintsUsed + 1;
    const hintKey = `hint${nextHintNum}`;
    if (!mystery[hintKey]) return;
    setHintsUsed(nextHintNum);
    setVisibleHints([...visibleHints, mystery[hintKey]]);
    onHintUsed(mystery.id);
    playHintSound();
  }

  async function handleGuess() {
    if (!guessValue.trim()) return;
    const elapsedSeconds = (Date.now() - startTime) / 1000;

    const res = await submitGuess({
      mysteryId: mystery.id,
      guess: guessValue,
      hintsUsed,
      elapsedSeconds,
      wrongAttempts,
    });

    if (res.correct) {
      playCorrectSound();
      onScoreChange(res.points, true, res.speed_bonus);
      onStreakChange(true);
      onMysterySolved(mystery.id);
      setFeedback({ text: `Correct! It's ${res.correct_name}. +${res.points} pts`, type: "correct" });
      setLocked(true);
      setResult({ facts: res.facts, name: res.correct_name, image_url: res.image_url });
    } else {
      playWrongSound();
      setWrongAttempts(wrongAttempts + 1);
      onScoreChange(res.points, false);
      onStreakChange(false);
      setFeedback({ text: "Not quite (-10 pts). Try again or use a hint.", type: "wrong" });
      setGuessValue("");
    }
  }

  async function handleGiveUp() {
    playWrongSound();
    onStreakChange(false);
    const data = await revealMystery(mystery.id);
    onMysterySolved(mystery.id);
    setFeedback({ text: `It was ${data.name}`, type: "wrong" });
    setLocked(true);
    setResult({ facts: data.facts, name: data.name, image_url: data.image_url });
  }

  return (
    <section className="screen">
      <button className="text-btn" onClick={onBackToGrid}>&larr; Map</button>
      <p className="subtitle">Mystery {mysteryNumber} of {totalMysteries}</p>

      <div className="card mystery-card fade-in">
        <div className={`difficulty-tag ${mystery.difficulty} pulse`}>{mystery.difficulty}</div>

        {!result && (
          <div className="mystery-box">
            <span className="mystery-icon">?</span>
          </div>
        )}

        {result && result.image_url && !result.image_url.includes("placehold.co") && (
          <img src={result.image_url} alt={result.name} className="result-image fade-in" />
        )}
        {result && (!result.image_url || result.image_url.includes("placehold.co")) && (
          <div className="result-icon-box fade-in">
            <span className="result-icon">{getCategoryIcon(mystery.hint2_type)}</span>
            <span className="result-name">{result.name}</span>
          </div>
        )}

        <p className="intro-text">{mystery.intro}</p>

        <div className="hints-container">
          {visibleHints.map((hint, i) => (
            <div key={i} className="hint-line slide-in">Hint {i + 1}: {hint}</div>
          ))}
        </div>

        {!locked && (
          <>
            <input
              type="text"
              placeholder="Your guess..."
              value={guessValue}
              onChange={(e) => setGuessValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGuess()}
            />
            <button className="primary-btn" onClick={handleGuess}>Guess</button>

            <div className="row-btns">
              <button className="secondary-btn" disabled={hintsUsed >= 3} onClick={useHint}>
                Get a hint (-20 pts)
              </button>
              <button className="secondary-btn" onClick={handleGiveUp}>Give up</button>
            </div>
          </>
        )}

        {feedback.text && <div className={`feedback ${feedback.type}`}>{feedback.text}</div>}

        {result && (
          <div className="facts-box fade-in">
            {result.facts.map((f, i) => <div key={i}>• {f}</div>)}
          </div>
        )}

        {locked && (
          <button className="primary-btn next-btn" onClick={onBackToGrid}>
            Back to Map →
          </button>
        )}
      </div>
    </section>
  );
}