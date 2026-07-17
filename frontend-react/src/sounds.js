let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(frequency, duration, type = "sine", volume = 0.2, delay = 0) {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(ctx.destination);

  const startTime = ctx.currentTime + delay;
  osc.start(startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.stop(startTime + duration);
}

export function playCorrectSound() {
  playTone(523.25, 0.15, "sine", 0.2, 0);
  playTone(783.99, 0.25, "sine", 0.2, 0.1);
}

export function playWrongSound() {
  playTone(180, 0.25, "sawtooth", 0.12, 0);
}

export function playHintSound() {
  playTone(440, 0.12, "triangle", 0.12, 0);
}

export function playDistrictCompleteSound() {
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    playTone(freq, 0.25, "sine", 0.2, i * 0.12);
  });
}