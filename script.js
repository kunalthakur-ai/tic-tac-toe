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
const winLine = document.getElementById('winLine');
const winLinePath = document.getElementById('winLinePath');
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
 
// ----- Start screen: round length selection -----
 
roundsPicker.addEventListener('click', (e) => {
  const btn = e.target.closest('.round-btn');
  if (!btn) return;
  document.querySelectorAll('.round-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  matchLength = parseInt(btn.dataset.rounds, 10);
  startBtn.disabled = false;
});
 
startBtn.addEventListener('click', () => {
  if (!matchLength) return;
  scores = { X: 0, O: 0 };
  round = 1;
  starter = 'X';
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  updateScoreUI(true);
  startRound();
});
 
// ----- Round lifecycle -----
 
function startRound() {
  board = Array(9).fill('');
  current = starter;
  active = true;
  roundLabelEl.textContent = `round ${round} of ${matchLength}`;
  winLine.classList.remove('show');
  renderBoard();
  updateStatus();
}
 
function renderBoard() {
  boardEl.innerHTML = '';
  boardEl.classList.remove('shake');
  board.forEach((mark, i) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    if (mark) cell.appendChild(markSVG(mark));
    cell.addEventListener('click', () => handleCellClick(i, cell));
    boardEl.appendChild(cell);
  });
}
 
function markSVG(mark) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  if (mark === 'X') {
    svg.innerHTML = `
      <path class="mark-x" d="M20,20 L80,80" />
      <path class="mark-x" d="M80,20 L20,80" />
    `;
  } else {
    svg.innerHTML = `<circle class="mark-o" cx="50" cy="50" r="34" />`;
  }
  return svg;
}
 
function handleCellClick(i, cellEl) {
  if (!active) return;
  if (board[i]) {
    boardEl.classList.add('shake');
    setTimeout(() => boardEl.classList.remove('shake'), 300);
    return;
  }
 
  board[i] = current;
  cellEl.appendChild(markSVG(current));
  spawnDust(cellEl);
  playTone(current === 'X' ? 520 : 390);
 
  const winningCombo = getWinningCombo();
  function drawWinLine(combo) {
  const [a, , c] = combo;

  const ax = (a % 3) + 0.5;
  const ay = Math.floor(a / 3) + 0.5;

  const cx = (c % 3) + 0.5;
  const cy = Math.floor(c / 3) + 0.5;

  winLinePath.setAttribute('x1', ax);
  winLinePath.setAttribute('y1', ay);
  winLinePath.setAttribute('x2', cx);
  winLinePath.setAttribute('y2', cy);

  requestAnimationFrame(() => {
    winLine.classList.add('show');
  });
}


  winLinePath.setAttribute('x1', ax);
  winLinePath.setAttribute('y1', ay);
  winLinePath.setAttribute('x2', cx);
  winLinePath.setAttribute('y2', cy);

  requestAnimationFrame(() => {
    winLine.classList.add('show');
  });
}

  }
 
  if (!board.includes('')) {
    active = false;
    statusEl.textContent = "it's a draw";
    setTimeout(nextRoundOrEnd, 1000);
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
  const ax = (a % 3) + 0.5, ay = Math.floor(a / 3) + 0.5;
  const cx = (c % 3) + 0.5, cy = Math.floor(c / 3) + 0.5;
  winLine.setAttribute('x1', ax);
  winLine.setAttribute('y1', ay);
  winLine.setAttribute('x2', cx);
  winLine.setAttribute('y2', cy);
  requestAnimationFrame(() => winLine.classList.add('show'));
}
 
function updateStatus() {
  statusEl.textContent = `player ${current.toLowerCase()}'s turn`;
}
 
function updateScoreUI(skipBump) {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  if (!skipBump) {
    const el = current === 'X' ? scoreXEl : scoreOEl;
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 200);
  }
}
 
function nextRoundOrEnd() {
  if (round >= matchLength) {
    endMatch();
  } else {
    round++;
    starter = starter === 'X' ? 'O' : 'X';
    startRound();
  }
}
 
function endMatch() {
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
 
playAgainBtn.addEventListener('click', () => {
  endScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  matchLength = null;
  startBtn.disabled = true;
  document.querySelectorAll('.round-btn').forEach(b => b.classList.remove('selected'));
});
 
newMatchBtn.addEventListener('click', () => {
  gameScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  matchLength = null;
  startBtn.disabled = true;
  document.querySelectorAll('.round-btn').forEach(b => b.classList.remove('selected'));
});
 
// ----- Fun extras: chalk dust and sound -----
 
function spawnDust(cellEl) {
  const rect = cellEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < 8; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dust');
    const angle = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 30;
    dot.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    dot.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    dot.style.left = `${cx}px`;
    dot.style.top = `${cy}px`;
    dustLayer.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
  }
}
 
let audioCtx = null;
function playTone(freq, duration = 0.09) {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // audio not available, fail silently
  }
}
 
soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundBtn.classList.toggle('muted', !soundOn);
  soundBtn.innerHTML = soundOn ? '&#9834;' : '&#9834;&#x336;';
});
 
