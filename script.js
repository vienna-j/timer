const RADIUS = 108;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ringProgress = document.getElementById('ringProgress');
const timeDisplay = document.getElementById('timeDisplay');
const statusLabel = document.getElementById('statusLabel');
const toggleBtn = document.getElementById('toggleBtn');
const resetBtn = document.getElementById('resetBtn');
const customMinutesInput = document.getElementById('customMinutes');
const customBtn = document.getElementById('customBtn');
const presetButtons = document.querySelectorAll('.preset-btn');

let totalSeconds = 15 * 60;
let remainingSeconds = totalSeconds;
let isRunning = false;
let intervalId = null;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateDisplay() {
  timeDisplay.textContent = formatTime(remainingSeconds);
  const progressFraction = 1 - remainingSeconds / totalSeconds;
  ringProgress.style.strokeDashoffset = CIRCUMFERENCE * progressFraction;
  document.title = isRunning ? `${formatTime(remainingSeconds)} - 집중 타이머` : '집중 타이머';
}

function setActivePreset(minutes) {
  presetButtons.forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.minutes) === minutes);
  });
}

function setTimer(minutes, { autoStart = true } = {}) {
  stopInterval();
  totalSeconds = minutes * 60;
  remainingSeconds = totalSeconds;
  isRunning = false;
  toggleBtn.disabled = false;
  toggleBtn.textContent = '시작';
  statusLabel.textContent = '대기 중';
  ringProgress.style.strokeDashoffset = 0;
  updateDisplay();
  if (autoStart) {
    startTimer();
  }
}

function startTimer() {
  if (isRunning || remainingSeconds <= 0) return;
  isRunning = true;
  toggleBtn.textContent = '일시정지';
  statusLabel.textContent = '진행 중';
  intervalId = setInterval(tick, 1000);
}

function pauseTimer() {
  isRunning = false;
  stopInterval();
  toggleBtn.textContent = '재개';
  statusLabel.textContent = '일시정지됨';
  updateDisplay();
}

function stopInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function tick() {
  remainingSeconds -= 1;
  if (remainingSeconds <= 0) {
    remainingSeconds = 0;
    updateDisplay();
    finishTimer();
    return;
  }
  updateDisplay();
}

function finishTimer() {
  isRunning = false;
  stopInterval();
  toggleBtn.textContent = '시작';
  toggleBtn.disabled = true;
  statusLabel.textContent = '완료!';
  playBeep();
}

function resetTimer() {
  stopInterval();
  isRunning = false;
  remainingSeconds = totalSeconds;
  toggleBtn.disabled = false;
  toggleBtn.textContent = '시작';
  statusLabel.textContent = '대기 중';
  updateDisplay();
}

function playBeep() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const now = ctx.currentTime;

  [0, 0.3, 0.6].forEach((delay) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.3, now + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.25);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now + delay);
    oscillator.stop(now + delay + 0.3);
  });
}

presetButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const minutes = Number(btn.dataset.minutes);
    setActivePreset(minutes);
    setTimer(minutes);
  });
});

customBtn.addEventListener('click', applyCustomMinutes);
customMinutesInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') applyCustomMinutes();
});

function applyCustomMinutes() {
  const minutes = Number(customMinutesInput.value);
  if (!minutes || minutes <= 0 || minutes > 180) return;
  setActivePreset(-1);
  setTimer(minutes);
}

toggleBtn.addEventListener('click', () => {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
});

resetBtn.addEventListener('click', () => {
  resetTimer();
});

updateDisplay();
