const API_BASE = "http://localhost:8000";

const screens = {
  levels: document.getElementById("levels-screen"),
  mystery: document.getElementById("mystery-screen"),
  complete: document.getElementById("complete-screen"),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

let totalScore = 0;
let totalSolved = 0;
let unlockedLevelOrder = 1;
let cachedLevels = [];
let currentDistrict = null;
let currentMysteries = [];
let currentIndex = 0;
let hintsUsed = 0;
let wrongAttempts = 0;
let mysteryStartTime = 0;

function updateScoreBar() {
  document.getElementById("score-display").textContent = totalScore;
  document.getElementById("solved-display").textContent = totalSolved;
}

async function loadLevels() {
  const res = await fetch(`${API_BASE}/levels`);
  const data = await res.json();
  cachedLevels = data.levels;
  const container = document.getElementById("levels-container");
  container.innerHTML = "";

  data.levels.forEach(level => {
    const locked = level.order > unlockedLevelOrder;
    const card = document.createElement("div");
    card.className = "level-card";
    card.style.opacity = locked ? 0.4 : 1;
    card.style.cursor = locked ? "not-allowed" : "pointer";
    card.innerHTML = `
      <div>
        <div class="level-name">${level.district}</div>
        <div class="level-meta">${level.mystery_count} mysteries</div>
      </div>
      <div class="level-badge">${locked ? "🔒" : level.order}</div>
    `;
    if (!locked) card.onclick = () => startLevel(level.district);
    container.appendChild(card);
  });
}

async function startLevel(district) {
  currentDistrict = district;
  const res = await fetch(`${API_BASE}/level/${encodeURIComponent(district)}`);
  const data = await res.json();
  currentMysteries = data.mysteries;
  currentIndex = 0;
  showScreen("mystery");
  renderMystery();
}

function renderMystery() {
  hintsUsed = 0;
  wrongAttempts = 0;
  mysteryStartTime = Date.now();
  const mystery = currentMysteries[currentIndex];

  const dots = document.getElementById("progress-dots");
  dots.innerHTML = "";
  currentMysteries.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "dot" + (i < currentIndex ? " done" : i === currentIndex ? " current" : "");
    dots.appendChild(dot);
  });

  const tag = document.getElementById("difficulty-tag");
  tag.textContent = mystery.difficulty;
  tag.className = "difficulty-tag " + mystery.difficulty;

  document.getElementById("intro-text").textContent = mystery.intro;
  document.getElementById("hints-container").innerHTML = "";
  document.getElementById("guess-input").value = "";
  document.getElementById("guess-input").disabled = false;
  document.getElementById("submit-guess").disabled = false;
  document.getElementById("hint-btn").disabled = false;
  document.getElementById("feedback").textContent = "";
  document.getElementById("feedback").className = "feedback";
  document.getElementById("facts-box").style.display = "none";
}

function useHint() {
  const mystery = currentMysteries[currentIndex];
  hintsUsed++;
  const hintKey = `hint${hintsUsed}`;
  if (!mystery[hintKey]) return;

  const line = document.createElement("div");
  line.className = "hint-line";
  line.textContent = `Hint ${hintsUsed}: ${mystery[hintKey]}`;
  document.getElementById("hints-container").appendChild(line);

  if (hintsUsed >= 3) document.getElementById("hint-btn").disabled = true;
}

function showFacts(facts) {
  const box = document.getElementById("facts-box");
  box.style.display = "block";
  box.innerHTML = facts.map(f => `• ${f}`).join("<br>");
}

async function submitGuess() {
  const input = document.getElementById("guess-input");
  const guess = input.value.trim();
  if (!guess) return;

  const mystery = currentMysteries[currentIndex];
  const elapsedSeconds = (Date.now() - mysteryStartTime) / 1000;

  const res = await fetch(`${API_BASE}/guess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mystery_id: mystery.id,
      guess,
      hints_used: hintsUsed,
      elapsed_seconds: elapsedSeconds,
      wrong_attempts: wrongAttempts,
    }),
  });
  const result = await res.json();
  const feedback = document.getElementById("feedback");

  if (result.correct) {
    totalScore += result.points;
    totalSolved += 1;
    updateScoreBar();
    feedback.textContent = `Correct! It's ${result.correct_name}. +${result.points} pts`;
    feedback.className = "feedback correct";
    input.disabled = true;
    document.getElementById("submit-guess").disabled = true;
    document.getElementById("hint-btn").disabled = true;
    showFacts(result.facts);
    setTimeout(nextMystery, 2800);
  } else {
    wrongAttempts++;
    feedback.textContent = "Not quite (-10 pts). Try again or use a hint.";
    feedback.className = "feedback wrong";
    input.value = "";
  }
}

async function giveUp() {
  const mystery = currentMysteries[currentIndex];
  const res = await fetch(`${API_BASE}/reveal/${mystery.id}`);
  const data = await res.json();
  const feedback = document.getElementById("feedback");
  feedback.textContent = `It was ${data.name}`;
  feedback.className = "feedback wrong";
  document.getElementById("guess-input").disabled = true;
  document.getElementById("submit-guess").disabled = true;
  document.getElementById("hint-btn").disabled = true;
  showFacts(data.facts);
  setTimeout(nextMystery, 2800);
}

function nextMystery() {
  currentIndex++;
  if (currentIndex >= currentMysteries.length) {
    showLevelComplete();
  } else {
    renderMystery();
  }
}

function showLevelComplete() {
  document.getElementById("complete-summary").textContent =
    `You cleared ${currentDistrict}! Total score: ${totalScore}`;
  const level = cachedLevels.find(l => l.district === currentDistrict);
  if (level) unlockedLevelOrder = Math.max(unlockedLevelOrder, level.order + 1);
  showScreen("complete");
}

document.getElementById("hint-btn").addEventListener("click", useHint);
document.getElementById("giveup-btn").addEventListener("click", giveUp);
document.getElementById("submit-guess").addEventListener("click", submitGuess);
document.getElementById("guess-input").addEventListener("keydown", e => { if (e.key === "Enter") submitGuess(); });
document.getElementById("back-to-levels").addEventListener("click", () => { showScreen("levels"); loadLevels(); });
document.getElementById("next-level-btn").addEventListener("click", () => { showScreen("levels"); loadLevels(); });

loadLevels();