/**
 * POLO GAME - Main Application & Controller
 */

class AppController {
  constructor() {
    this.lastFrameTime = 0;
    this.isLoopRunning = false;
    this.animationFrameId = null;

    // DOM Elements
    this.screens = {
      start: null,
      leaderboard: null,
      gameplay: null,
      caughtModal: null,
      winModal: null
    };

    this.inputs = {
      name: null
    };

    this.buttons = {
      start: null,
      showLeaderboard: null,
      backLeaderboard: null,
      move: null,
      restartCaught: null,
      restartWin: null
    };

    this.displays = {
      timer: null,
      statusBadge: null,
      winTime: null,
      winPolo: null,
      leaderboard: null
    };
  }

  async init() {
    // 1. Cache DOM element references
    this.screens.start = document.getElementById('start-screen');
    this.screens.leaderboard = document.getElementById('leaderboard-screen');
    this.screens.gameplay = document.getElementById('gameplay-screen');
    this.screens.caughtModal = document.getElementById('modal-caught');
    this.screens.winModal = document.getElementById('modal-win');

    this.inputs.name = document.getElementById('player-name-input');

    this.buttons.start = document.getElementById('btn-start-game');
    this.buttons.showLeaderboard = document.getElementById('btn-show-leaderboard');
    this.buttons.backLeaderboard = document.getElementById('btn-back-leaderboard');
    this.buttons.move = document.getElementById('btn-avanzar');
    this.buttons.restartCaught = document.getElementById('btn-restart-caught');
    this.buttons.restartWin = document.getElementById('btn-restart-win');

    this.displays.timer = document.getElementById('game-timer-display');
    this.displays.statusBadge = document.getElementById('igneo-status-badge');
    this.displays.winTime = document.getElementById('win-time-display');
    this.displays.winPolo = document.getElementById('win-polo-image');
    this.displays.leaderboard = document.getElementById('leaderboard-container');

    const canvas = document.getElementById('game-canvas');

    // 2. Initialize modules
    renderer.init(canvas);
    gameTimer.bindDisplay(this.displays.timer);
    playerController.bindButton(this.buttons.move);

    // 3. Load Character Assets
    await assetManager.loadAll();
    this.displays.winPolo.src = assetManager.sprites.polo.win.src;

    // 4. Setup UI Event Listeners
    this.setupEventListeners();

    // 5. Subscribe UI to State changes
    gameState.subscribe((state) => this.handleStateChange(state));

    // 6. Start Canvas render loop
    this.startLoop();
  }

  setupEventListeners() {
    // Start Game Button
    this.buttons.start.addEventListener('click', () => {
      soundManager.playClick();
      const name = this.inputs.name.value.trim();
      if (!name) {
        alert('Por favor, escribe tu nombre antes de comenzar.');
        this.inputs.name.focus();
        return;
      }
      gameState.setPlayerName(name);
      this.startGameplay();
    });

    this.buttons.showLeaderboard.addEventListener('click', () => {
      soundManager.playClick();
      this.showLeaderboard();
    });

    this.buttons.backLeaderboard.addEventListener('click', () => {
      soundManager.playClick();
      this.screens.leaderboard.classList.add('hidden');
      this.screens.start.classList.remove('hidden');
    });

    // Enter key submit in name input
    this.inputs.name.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.buttons.start.click();
      }
    });

    // Restart after being caught
    this.buttons.restartCaught.addEventListener('click', () => {
      soundManager.playClick();
      this.screens.caughtModal.classList.add('hidden');
      this.startGameplay();
    });

    // Restart after winning
    this.buttons.restartWin.addEventListener('click', () => {
      soundManager.playClick();
      this.screens.winModal.classList.add('hidden');
      this.showStartScreen();
    });
  }

  startGameplay() {
    // Reset player position and timers
    playerController.reset();
    gameTimer.reset();

    // Set state
    gameState.resetForNewAttempt();

    // Start timer and Igneo AI watcher
    gameTimer.start();
    igneoController.start();
  }

  handleCaught() {
    if (gameState.currentState !== GAME_STATES.PLAYING) return;

    // Stop gameplay immediately
    gameState.setState(GAME_STATES.CAUGHT);
    gameTimer.stop();
    igneoController.triggerSpotted();
    soundManager.playCaught();

    // Show caught modal overlay
    this.screens.caughtModal.classList.remove('hidden');
  }

  handleWin() {
    if (gameState.currentState !== GAME_STATES.PLAYING) return;

    // Stop gameplay immediately and calculate exact elapsed time
    gameState.setPoloState(POLO_STATES.VICTORY);
    gameState.setState(GAME_STATES.WON);
    gameTimer.stop();
    igneoController.stop();
    soundManager.playWin();

    const actualElapsedMs = gameTimer.getElapsedMs();
    const formattedTime = gameTimer.getFormattedTime(actualElapsedMs);

    // Save score to leaderboard (only valid completed games saved)
    leaderboard.saveScore(gameState.playerName, actualElapsedMs, formattedTime);
    leaderboard.renderToContainer(this.displays.leaderboard);

    // Display result modal
    this.displays.winTime.textContent = formattedTime;
    this.screens.winModal.classList.remove('hidden');
  }

  showStartScreen() {
    this.screens.leaderboard.classList.add('hidden');
    gameState.reset();
    gameTimer.reset();
    igneoController.stop();
    leaderboard.renderToContainer(this.displays.leaderboard);
  }

  showLeaderboard() {
    leaderboard.renderToContainer(this.displays.leaderboard);
    this.screens.start.classList.add('hidden');
    this.screens.leaderboard.classList.remove('hidden');
  }

  handleStateChange(state) {
    // Screen router
    if (state.currentState === GAME_STATES.START) {
      this.screens.start.classList.remove('hidden');
      this.screens.leaderboard.classList.add('hidden');
      this.screens.gameplay.classList.add('hidden');
      this.screens.caughtModal.classList.add('hidden');
      this.screens.winModal.classList.add('hidden');
    } else {
      this.screens.start.classList.add('hidden');
      this.screens.leaderboard.classList.add('hidden');
      this.screens.gameplay.classList.remove('hidden');
    }

    // Update Igneo Status UI Banner
    const badge = this.displays.statusBadge;
    badge.className = 'status-badge';

    if (state.igneoState === IGNEO_STATES.SAFE) {
      badge.textContent = 'ÍGNEO NO MIRA';
      badge.classList.add('status-safe');
    } else if (state.igneoState === IGNEO_STATES.WARNING) {
      badge.textContent = 'ÍGNEO SE DA LA VUELTA...';
      badge.classList.add('status-warning');
    } else if (state.igneoState === IGNEO_STATES.DANGER) {
      badge.textContent = 'ÍGNEO TE MIRA';
      badge.classList.add('status-danger');
    } else if (state.igneoState === IGNEO_STATES.SPOTTED) {
      badge.textContent = '¡ÍGNEO TE VIO!';
      badge.classList.add('status-spotted');
    }
  }

  startLoop() {
    if (this.isLoopRunning) return;
    this.isLoopRunning = true;
    this.lastFrameTime = performance.now();

    const loop = (currentTime) => {
      const deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
      this.lastFrameTime = currentTime;

      // Update physics and rendering
      playerController.update(deltaTime);
      renderer.render(deltaTime);

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }
}

const app = new AppController();

// Global init on DOM content ready
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});
