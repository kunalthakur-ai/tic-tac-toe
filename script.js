// script.js — Tic Tac Toe with match rounds, scoring, and fun feedback

const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const endScreen = document.getElementById('endScreen');

const roundsPicker = document.getElementById('roundsPicker');
const startBtn = document.getElementById('startBtn');

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const roundLabelEl = document.getElementById('roundLabel');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const winLine = document.getElementById('winLinePath');
const soundBtn = document.getElementById('soundBtn');
const newMatchBtn = document.getElementById('newMatchBtn');

const endTitle = document.getElementById('endTitle');
const finalTally = document.getElementById('finalTally');
const playAgainBtn = document.getElementById('playAgainBtn');
const dustLayer = document.getElementById('dustLayer');

const winningConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let matchLength = null;
let scores = { X: 0, O: 0 };
let round = 1;
let starter = 'X';
let board = Array(9).fill('');
let current = 'X';
let active = false;
let soundOn = true;
let roundTimer = null;

// ----- Start screen -----

roundsPicker.addEventListener('click', (e) => {
  const btn = e.target.closest('.round-btn');
  if (!btn) return;

  document.querySelectorAll('.round-btn').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  matchLength = Number(btn.dataset.rounds);
  startBtn.disabled = false;
});

startBtn.addEventListener('click', () => {
  if (!matchLength) return;

  clearRoundTimer();
  scores = { X: 0, O: 0 };
  round = 1;
  starter = 'X';

  startScreen.classList.add('hidden');
  endScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');

  updateScoreUI(true);
  startRound();
});

// ----- Round lifecycle -----

function startRound() {
  clearRoundTimer();

  board = Array(9).fill('');
  current = starter;
  active = true;

  roundLabelEl.textContent = `round ${round} of ${matchLength}`;

  winLine.classList.remove('show');
  winLine.setAttribute('x1', '0');
  winLine.setAttribute('y1', '0');
  winLine.setAttribute('x2', '0');
  winLine.setAttribute('y2', '0');

  renderBoard();
  updateStatus();
}

function renderBoard() {
  boardEl.innerHTML = '';
  boardEl.classList.remove('shake');

  board.forEach((mark, index) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = index;
    cell.setAttribute('role', 'button');
    cell.setAttribute('aria-label', `cell ${index + 1}`);

    if (mark) cell.appendChild(markSVG(mark));
    boardEl.appendChild(cell);
  });
}

// A single delegated listener handles all nine cells.
boardEl.addEventListener('click', (e) => {
  const cell = e.target.closest('.cell');
  if (!cell || !boardEl.contains(cell)) return;

  const index = Number(cell.dataset.index);
  if (!Number.isInteger(index) || index < 0 || index > 8) return;

  handleCellClick(index, cell);
});

function markSVG(mark) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('aria-hidden', 'true');

  if (mark === 'X') {
    svg.innerHTML = `
      <path class="mark-x" d="M20,20 L80,80"></path>
      <path class="mark-x" d="M80,20 L20,80"></path>
    `;
  } else {
    svg.innerHTML = `
      <circle class="mark-o" cx="50" cy="50" r="34"></circle>
    `;
  }

  return svg;
}

function handleCellClick(index, cellEl) {
  if (!active) return;

  if (board[index]) {
    boardEl.classList.remove('shake');
    void boardEl.offsetWidth;
    boardEl.classList.add('shake');
    playTone(180, 0.05);
    return;
  }

  board[index] = current;
  cellEl.appendChild(markSVG(current));
  spawnDust(cellEl);
  playTone(current === 'X' ? 520 : 390);

  const winningCombo = getWinningCombo();

  if (winningCombo) {
    active = false;
    scores[current]++;
    updateScoreUI();
    drawWinLine(winningCombo);
    statusEl.textContent = `player ${current.toLowerCase()} wins this round`;
    playTone(700, 0.18);
    scheduleRoundTransition(1300);
    return;
  }

  if (!board.includes('')) {
    active = false;
    statusEl.textContent = "it's a draw";
    playTone(260, 0.12);
    scheduleRoundTransition(1000);
    return;
  }

  current = current === 'X' ? 'O' : 'X';
  updateStatus();
}

function getWinningCombo() {
  for (const combo of winningConditions) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return combo;
    }
  }
  return null;
}

function drawWinLine(combo) {
  const [a, , c] = combo;
  const x1 = (a % 3) + 0.5;
  const y1 = Math.floor(a / 3) + 0.5;
  const x2 = (c % 3) + 0.5;
  const y2 = Math.floor(c / 3) + 0.5;

  winLine.setAttribute('x1', x1);
  winLine.setAttribute('y1', y1);
  winLine.setAttribute('x2', x2);
  winLine.setAttribute('y2', y2);

  winLine.classList.remove('show');
  void winLine.getBoundingClientRect();

  requestAnimationFrame(() => winLine.classList.add('show'));
}

function updateStatus() {
  statusEl.textContent = `player ${current.toLowerCase()}'s turn`;
}

function updateScoreUI(skipBump = false) {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;

  if (skipBump) return;

  const el = current === 'X' ? scoreXEl : scoreOEl;
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');

  setTimeout(() => el.classList.remove('bump'), 200);
}

// ----- Round / match transitions -----

function scheduleRoundTransition(delay) {
  clearRoundTimer();
  roundTimer = setTimeout(() => {
    roundTimer = null;
    nextRoundOrEnd();
  }, delay);
}

function clearRoundTimer() {
  if (roundTimer !== null) {
    clearTimeout(roundTimer);
    roundTimer = null;
  }
}

function nextRoundOrEnd() {
  if (round >= matchLength) {
    endMatch();
    return;
  }

  round++;
  starter = starter === 'X' ? 'O' : 'X';
  startRound();
}

function endMatch() {
  clearRoundTimer();
  active = false;

  gameScreen.classList.add('hidden');
  endScreen.classList.remove('hidden');

  if (scores.X === scores.O) {
    endTitle.textContent = "it's a tie match";
  } else {
    const winner = scores.X > scores.O ? 'X' : 'O';
    endTitle.textContent = `player ${winner.toLowerCase()} wins the match`;
  }

  finalTally.textContent = `x ${scores.X} \u2013 ${scores.O} o`;
}

function resetToStartScreen() {
  clearRoundTimer();
  active = false;
  matchLength = null;
  scores = { X: 0, O: 0 };
  round = 1;
  starter = 'X';
  board = Array(9).fill('');
  current = 'X';

  gameScreen.classList.add('hidden');
  endScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');

  startBtn.disabled = true;
  document.querySelectorAll('.round-btn').forEach((b) => b.classList.remove('selected'));
}

playAgainBtn.addEventListener('click', resetToStartScreen);
newMatchBtn.addEventListener('click', resetToStartScreen);

// ----- Chalk dust -----

function spawnDust(cellEl) {
  const rect = cellEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 8; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dust');

    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 30;

    dot.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    dot.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
    dot.style.left = `${cx}px`;
    dot.style.top = `${cy}px`;

    dustLayer.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
  }
}

// ----- Sound -----

let audioCtx = null;

function playTone(freq, duration = 0.09) {
  if (!soundOn) return;

  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();

    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    // Audio unavailable — fail silently.
  }
}

soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundBtn.classList.toggle('muted', !soundOn);
  soundBtn.innerHTML = soundOn ? '&#9834;' : '&#9834;&#x336;';
});
