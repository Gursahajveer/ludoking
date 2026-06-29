(() => {
  // Color definitions for the four players and their visual identity.
  const COLORS = [
    { id: 'red', name: 'Red', accent: '#f43f5e' },
    { id: 'green', name: 'Green', accent: '#22c55e' },
    { id: 'yellow', name: 'Yellow', accent: '#facc15' },
    { id: 'blue', name: 'Blue', accent: '#3b82f6' },
  ];

  // Track positions define the shared path tokens follow around the board.
  const TRACK_COORDS = [
    { x: 50, y: 30 },
    { x: 56, y: 30 },
    { x: 62, y: 30 },
    { x: 68, y: 30 },
    { x: 74, y: 30 },
    { x: 80, y: 30 },
    { x: 86, y: 30 },
    { x: 92, y: 30 },
    { x: 96, y: 36 },
    { x: 96, y: 42 },
    { x: 96, y: 48 },
    { x: 96, y: 54 },
    { x: 96, y: 60 },
    { x: 96, y: 66 },
    { x: 96, y: 72 },
    { x: 90, y: 78 },
    { x: 84, y: 78 },
    { x: 78, y: 78 },
    { x: 72, y: 78 },
    { x: 66, y: 78 },
    { x: 60, y: 78 },
    { x: 54, y: 78 },
    { x: 48, y: 78 },
    { x: 42, y: 78 },
    { x: 36, y: 78 },
    { x: 30, y: 78 },
    { x: 24, y: 78 },
    { x: 18, y: 78 },
    { x: 12, y: 78 },
    { x: 8, y: 72 },
    { x: 8, y: 66 },
    { x: 8, y: 60 },
    { x: 8, y: 54 },
    { x: 8, y: 48 },
    { x: 8, y: 42 },
    { x: 8, y: 36 },
    { x: 8, y: 30 },
    { x: 8, y: 24 },
    { x: 8, y: 18 },
    { x: 8, y: 12 },
    { x: 14, y: 12 },
    { x: 20, y: 12 },
    { x: 26, y: 12 },
    { x: 32, y: 12 },
    { x: 38, y: 12 },
    { x: 44, y: 12 },
    { x: 50, y: 12 },
    { x: 56, y: 12 },
    { x: 62, y: 12 },
    { x: 68, y: 12 },
    { x: 74, y: 12 },
    { x: 80, y: 12 },
    { x: 86, y: 12 },
    { x: 92, y: 12 },
  ];

  // Safe squares are protected from capture and feel special on the track.
  const SAFE_POSITIONS = new Set([0, 8, 13, 21, 26, 34, 39, 47, 52, 55]);

  // Each player has four home spawn positions and a shared finish lane anchor.
  const HOME_SPAWNS = {
    red: [{ x: 18, y: 18 }, { x: 28, y: 18 }, { x: 18, y: 28 }, { x: 28, y: 28 }],
    green: [{ x: 72, y: 18 }, { x: 82, y: 18 }, { x: 72, y: 28 }, { x: 82, y: 28 }],
    yellow: [{ x: 18, y: 72 }, { x: 28, y: 72 }, { x: 18, y: 82 }, { x: 28, y: 82 }],
    blue: [{ x: 72, y: 72 }, { x: 82, y: 72 }, { x: 72, y: 82 }, { x: 82, y: 82 }],
  };

  const FINISH_POSITIONS = {
    red: { x: 50, y: 18 },
    green: { x: 82, y: 50 },
    yellow: { x: 50, y: 82 },
    blue: { x: 18, y: 50 },
  };

  const boardEl = document.getElementById('board');
  const playersListEl = document.getElementById('playersList');
  const diceFaceEl = document.getElementById('diceFace');
  const rollButton = document.getElementById('rollButton');
  const turnIndicatorEl = document.getElementById('turnIndicator');
  const gameMessageEl = document.getElementById('gameMessage');
  const leaderboardListEl = document.getElementById('leaderboardList');
  const statsGridEl = document.getElementById('statsGrid');
  const historyListEl = document.getElementById('historyList');
  const winnerOverlayEl = document.getElementById('winnerOverlay');
  const winnerNameEl = document.getElementById('winnerName');
  const winnerSubtitleEl = document.getElementById('winnerSubtitle');
  const playAgainButton = document.getElementById('playAgainButton');
  const restartButton = document.getElementById('restartButton');
  const settingsButton = document.getElementById('settingsButton');
  const settingsOverlayEl = document.getElementById('settingsOverlay');
  const closeSettingsButton = document.getElementById('closeSettingsButton');
  const soundToggle = document.getElementById('soundToggle');
  const animationToggle = document.getElementById('animationToggle');
  const darkModeToggle = document.getElementById('darkModeToggle');

  const state = {
    players: [],
    currentPlayerIndex: 0,
    diceValue: null,
    pendingRoll: false,
    awaitingSelection: false,
    winner: null,
    settings: {
      sound: true,
      animations: true,
      darkMode: true,
    },
    stats: {
      gamesPlayed: 0,
      totalCaptures: 0,
      totalTurns: 0,
      wins: { red: 0, green: 0, yellow: 0, blue: 0 },
    },
    history: [],
  };

  function init() {
    loadSettings();
    loadStats();
    buildBoard();
    attachEvents();
    startNewGame();
  }

  function attachEvents() {
    rollButton.addEventListener('click', handleRollDice);
    playAgainButton.addEventListener('click', () => startNewGame(false));
    restartButton.addEventListener('click', () => startNewGame(true));
    settingsButton.addEventListener('click', openSettings);
    closeSettingsButton.addEventListener('click', closeSettings);
    settingsOverlayEl.addEventListener('click', (event) => {
      if (event.target === settingsOverlayEl) closeSettings();
    });

    soundToggle.addEventListener('change', () => {
      state.settings.sound = soundToggle.checked;
      saveSettings();
    });

    animationToggle.addEventListener('change', () => {
      state.settings.animations = animationToggle.checked;
      document.body.classList.toggle('reduced-motion', !state.settings.animations);
      saveSettings();
    });

    darkModeToggle.addEventListener('change', () => {
      state.settings.darkMode = darkModeToggle.checked;
      document.body.classList.toggle('light-mode', !state.settings.darkMode);
      saveSettings();
    });
  }

  function loadSettings() {
    const stored = localStorage.getItem('nova-ludo-settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      state.settings = { ...state.settings, ...parsed };
    }
    soundToggle.checked = state.settings.sound;
    animationToggle.checked = state.settings.animations;
    darkModeToggle.checked = state.settings.darkMode;
    document.body.classList.toggle('light-mode', !state.settings.darkMode);
    document.body.classList.toggle('reduced-motion', !state.settings.animations);
  }

  function saveSettings() {
    localStorage.setItem('nova-ludo-settings', JSON.stringify(state.settings));
  }

  function loadStats() {
    const stored = localStorage.getItem('nova-ludo-stats');
    if (stored) {
      const parsed = JSON.parse(stored);
      state.stats = { ...state.stats, ...parsed, wins: { ...state.stats.wins, ...(parsed.wins || {}) } };
    }
    const historyStored = localStorage.getItem('nova-ludo-history');
    if (historyStored) {
      state.history = JSON.parse(historyStored);
    }
  }

  function saveStats() {
    localStorage.setItem('nova-ludo-stats', JSON.stringify(state.stats));
    localStorage.setItem('nova-ludo-history', JSON.stringify(state.history));
  }

  function startNewGame(resetStats = false) {
    hideWinner();
    if (resetStats) {
      state.stats = {
        gamesPlayed: 0,
        totalCaptures: 0,
        totalTurns: 0,
        wins: { red: 0, green: 0, yellow: 0, blue: 0 },
      };
      state.history = [];
      saveStats();
    }

    state.players = COLORS.map((color) => ({
      id: color.id,
      name: color.name,
      accent: color.accent,
      tokens: Array.from({ length: 4 }, (_, index) => ({
        id: `${color.id}-${index + 1}`,
        playerId: color.id,
        state: 'home',
        homeIndex: index,
        trackIndex: null,
        finished: false,
      })),
    }));

    state.currentPlayerIndex = 0;
    state.diceValue = null;
    state.pendingRoll = false;
    state.awaitingSelection = false;
    state.winner = null;
    state.stats.gamesPlayed += 1;
    saveStats();
    renderAll();
    setMessage(`${getCurrentPlayer().name} begins the match. Roll the dice.`);
  }

  function buildBoard() {
    boardEl.innerHTML = '';

    // Home zones frame the board with each player's nest area.
    const homeZones = [
      { color: 'red', top: '2%', left: '2%' },
      { color: 'green', top: '2%', right: '2%' },
      { color: 'yellow', bottom: '2%', left: '2%' },
      { color: 'blue', bottom: '2%', right: '2%' },
    ];

    homeZones.forEach((zone) => {
      const zoneEl = document.createElement('div');
      zoneEl.className = `home-zone ${zone.color}`;
      Object.assign(zoneEl.style, { top: zone.top, left: zone.left, right: zone.right, bottom: zone.bottom });
      boardEl.appendChild(zoneEl);
    });

    // Each player's home cells are placed inside their zone.
    const homeCells = [
      { color: 'red', positions: [{ x: 18, y: 18 }, { x: 28, y: 18 }, { x: 18, y: 28 }, { x: 28, y: 28 }] },
      { color: 'green', positions: [{ x: 72, y: 18 }, { x: 82, y: 18 }, { x: 72, y: 28 }, { x: 82, y: 28 }] },
      { color: 'yellow', positions: [{ x: 18, y: 72 }, { x: 28, y: 72 }, { x: 18, y: 82 }, { x: 28, y: 82 }] },
      { color: 'blue', positions: [{ x: 72, y: 72 }, { x: 82, y: 72 }, { x: 72, y: 82 }, { x: 82, y: 82 }] },
    ];

    homeCells.forEach(({ color, positions }) => {
      positions.forEach((pos) => {
        const cell = document.createElement('div');
        cell.className = `home-cell ${color}`;
        cell.style.left = `${pos.x}%`;
        cell.style.top = `${pos.y}%`;
        boardEl.appendChild(cell);
      });
    });

    // Render the shared route cells and mark safe positions.
    TRACK_COORDS.forEach((position, index) => {
      const cell = document.createElement('div');
      cell.className = `track-cell ${SAFE_POSITIONS.has(index) ? 'safe' : ''}`;
      cell.style.left = `${position.x}%`;
      cell.style.top = `${position.y}%`;
      boardEl.appendChild(cell);
    });
  }

  function renderAll() {
    renderPlayers();
    renderDice();
    renderBoardTokens();
    renderLeaderboard();
    renderStats();
    renderHistory();
    updateTurnIndicator();
  }

  function renderPlayers() {
    playersListEl.innerHTML = '';
    state.players.forEach((player, index) => {
      const card = document.createElement('div');
      card.className = `player-card ${player.id} ${state.currentPlayerIndex === index ? 'active' : ''}`;
      card.innerHTML = `
        <div class="player-meta">
          <span class="player-dot"></span>
          <div>
            <strong>${player.name}</strong>
            <div class="subtitle">${getFinishedTokens(player)} / 4 finished</div>
          </div>
        </div>
        <span class="pill">${getActiveTokens(player)} active</span>
      `;
      playersListEl.appendChild(card);
    });
  }

  function getActiveTokens(player) {
    return player.tokens.filter((token) => token.state === 'track').length;
  }

  function getFinishedTokens(player) {
    return player.tokens.filter((token) => token.state === 'finished').length;
  }

  function renderDice() {
    if (state.diceValue === null) {
      diceFaceEl.textContent = '?';
      rollButton.disabled = false;
      return;
    }
    diceFaceEl.textContent = state.diceValue;
    rollButton.disabled = state.awaitingSelection;
  }

  function renderBoardTokens() {
    const tokenLayer = document.createElement('div');
    tokenLayer.className = 'token-layer';

    state.players.forEach((player) => {
      player.tokens.forEach((token) => {
        const tokenEl = document.createElement('button');
        tokenEl.className = `token ${token.playerId} ${token.state === 'finished' ? 'finished' : ''} ${canTokenMove(token) ? 'movable' : ''}`;
        tokenEl.type = 'button';
        tokenEl.dataset.tokenId = token.id;
        tokenEl.style.left = `${getTokenPosition(token).x}%`;
        tokenEl.style.top = `${getTokenPosition(token).y}%`;
        tokenEl.setAttribute('aria-label', `${player.name} token`);
        tokenEl.addEventListener('click', () => handleTokenSelection(token));
        tokenLayer.appendChild(tokenEl);
      });
    });

    boardEl.querySelectorAll('.token-layer').forEach((layer) => layer.remove());
    boardEl.appendChild(tokenLayer);
  }

  function getTokenPosition(token) {
    if (token.state === 'home') {
      return HOME_SPAWNS[token.playerId][token.homeIndex];
    }
    if (token.state === 'track') {
      return TRACK_COORDS[token.trackIndex];
    }
    return FINISH_POSITIONS[token.playerId];
  }

  function handleRollDice() {
    if (state.winner || state.awaitingSelection) return;

    const player = getCurrentPlayer();
    const roll = Math.floor(Math.random() * 6) + 1;
    state.diceValue = roll;
    state.pendingRoll = true;
    state.awaitingSelection = true;
    state.stats.totalTurns += 1;
    saveStats();

    playSound('roll');
    setMessage(`${player.name} rolled a ${roll}. Choose a token.`);

    if (!getMovableTokens(player).length) {
      setMessage(`${player.name} has no legal moves. Turn passes.`);
      state.awaitingSelection = false;
      state.pendingRoll = false;
      setTimeout(() => advanceTurn(), 600);
      renderAll();
      return;
    }

    renderAll();
  }

  function handleTokenSelection(token) {
    if (!state.awaitingSelection || state.winner) return;
    if (token.playerId !== getCurrentPlayer().id) return;
    if (!canTokenMove(token)) return;

    moveToken(token);
  }

  function moveToken(token) {
    const player = getCurrentPlayer();
    const roll = state.diceValue;

    if (token.state === 'home') {
      token.state = 'track';
      token.trackIndex = playerTokensStartIndex(player.id);
      token.finished = false;
      token.homeIndex = null;
      setMessage(`${player.name} released a token.`);
    } else {
      const targetIndex = token.trackIndex + roll;
      if (targetIndex > TRACK_COORDS.length - 1) {
        setMessage('That move would overshoot the finish lane.');
        return;
      }
      token.trackIndex = targetIndex;
      if (token.trackIndex >= TRACK_COORDS.length - 1) {
        token.state = 'finished';
        token.finished = true;
        token.trackIndex = TRACK_COORDS.length - 1;
      }
    }

    const occupancy = findOccupantAt(token);
    if (occupancy && occupancy.playerId !== player.id && !isSafeCell(token)) {
      occupancy.state = 'home';
      occupancy.trackIndex = null;
      occupancy.finished = false;
      occupancy.homeIndex = 0;
      state.stats.totalCaptures += 1;
      saveStats();
      playSound('capture');
      setMessage(`${player.name} captured ${occupancy.playerId.toUpperCase()}!`);
    } else {
      playSound('move');
    }

    if (checkWinner(player)) {
      finishGame(player);
      return;
    }

    state.awaitingSelection = false;
    state.pendingRoll = false;
    state.diceValue = null;

    if (roll === 6) {
      setMessage(`${player.name} rolled a 6. Extra turn granted.`);
      renderAll();
      return;
    }

    advanceTurn();
  }

  function findOccupantAt(token) {
    const targetIndex = token.state === 'track' ? token.trackIndex : null;
    if (targetIndex === null) return null;

    for (const player of state.players) {
      for (const candidate of player.tokens) {
        if (candidate.id === token.id) continue;
        if (candidate.state === 'track' && candidate.trackIndex === targetIndex && candidate.playerId !== token.playerId) {
          return candidate;
        }
      }
    }
    return null;
  }

  function isSafeCell(token) {
    return token.state === 'track' && SAFE_POSITIONS.has(token.trackIndex);
  }

  function canTokenMove(token) {
    if (!state.pendingRoll || state.winner) return false;
    if (token.playerId !== getCurrentPlayer().id) return false;
    if (token.state === 'finished') return false;
    if (token.state === 'home') return state.diceValue === 6;
    return token.trackIndex + state.diceValue <= TRACK_COORDS.length - 1;
  }

  function getMovableTokens(player) {
    return player.tokens.filter((token) => canTokenMove(token));
  }

  function playerTokensStartIndex(playerId) {
    const map = { red: 0, green: 14, yellow: 28, blue: 42 };
    return map[playerId];
  }

  function advanceTurn() {
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    state.diceValue = null;
    state.pendingRoll = false;
    state.awaitingSelection = false;
    setMessage(`${getCurrentPlayer().name}'s turn. Roll the dice.`);
    renderAll();
  }

  function checkWinner(player) {
    return player.tokens.every((token) => token.state === 'finished');
  }

  function finishGame(player) {
    state.winner = player.id;
    state.stats.wins[player.id] += 1;
    state.history.push({ winner: player.name, date: new Date().toLocaleDateString() });
    saveStats();
    setMessage(`${player.name} wins the match!`);
    renderAll();
    showWinner(player);
  }

  function showWinner(player) {
    winnerNameEl.textContent = `${player.name} Wins!`;
    winnerSubtitleEl.textContent = 'The board erupts in celebration. Play again or restart to chase another round.';
    winnerOverlayEl.classList.remove('hidden');
    spawnParticles();
    playSound('victory');
  }

  function hideWinner() {
    winnerOverlayEl.classList.add('hidden');
    document.querySelectorAll('.particle').forEach((particle) => particle.remove());
  }

  function spawnParticles() {
    const overlay = winnerOverlayEl;
    for (let index = 0; index < 36; index += 1) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = '50%';
      particle.style.top = '45%';
      particle.style.background = COLORS[index % COLORS.length].accent;
      const dx = (Math.random() - 0.5) * 220;
      const dy = (Math.random() - 0.5) * 220;
      particle.style.setProperty('--dx', `${dx}px`);
      particle.style.setProperty('--dy', `${dy}px`);
      overlay.appendChild(particle);
    }
  }

  function updateTurnIndicator() {
    const player = getCurrentPlayer();
    turnIndicatorEl.textContent = `${player.name} to roll`;
  }

  function setMessage(message) {
    gameMessageEl.textContent = message;
  }

  function renderLeaderboard() {
    const ranking = COLORS.map((color) => ({
      ...color,
      wins: state.stats.wins[color.id],
    })).sort((a, b) => b.wins - a.wins);

    leaderboardListEl.innerHTML = ranking.map((entry, index) => `
      <li><strong>${index + 1}. ${entry.name}</strong> — ${entry.wins} wins</li>
    `).join('');
  }

  function renderStats() {
    const stats = [
      { label: 'Games', value: state.stats.gamesPlayed },
      { label: 'Captures', value: state.stats.totalCaptures },
      { label: 'Turns', value: state.stats.totalTurns },
      { label: 'Wins', value: Object.values(state.stats.wins).reduce((sum, value) => sum + value, 0) },
    ];

    statsGridEl.innerHTML = stats.map((entry) => `
      <div class="stat-card">
        <span>${entry.label}</span>
        <strong>${entry.value}</strong>
      </div>
    `).join('');
  }

  function renderHistory() {
    historyListEl.innerHTML = '';
    if (!state.history.length) {
      historyListEl.innerHTML = '<li>No matches yet.</li>';
      return;
    }

    state.history.slice(-6).reverse().forEach((entry) => {
      const item = document.createElement('li');
      item.textContent = `${entry.winner} — ${entry.date}`;
      historyListEl.appendChild(item);
    });
  }

  function openSettings() {
    settingsOverlayEl.classList.remove('hidden');
  }

  function closeSettings() {
    settingsOverlayEl.classList.add('hidden');
  }

  function getCurrentPlayer() {
    return state.players[state.currentPlayerIndex];
  }

  function playSound(type) {
    if (!state.settings.sound || typeof window === 'undefined') return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);

    const frequencyMap = {
      roll: [520, 720],
      move: [340, 420],
      capture: [260, 180],
      victory: [440, 560, 680],
    };

    const frequencies = frequencyMap[type] || [440];
    oscillator.type = 'triangle';
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);

    frequencies.forEach((frequency, index) => {
      oscillator.frequency.setValueAtTime(frequency, context.currentTime + index * 0.04);
    });

    oscillator.start();
    oscillator.stop(context.currentTime + 0.22);
    setTimeout(() => context.close(), 250);
  }

  init();
})();
