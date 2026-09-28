/**
 * POLO GAME - Centralized State Manager
 */
const GAME_STATES = {
  START: 'START',
  PLAYING: 'PLAYING',
  CAUGHT: 'CAUGHT',
  WON: 'WON'
};

const IGNEO_STATES = {
  SAFE: 'SAFE',       // Ígneo no mira
  WARNING: 'WARNING', // Ígneo se está dando la vuelta
  DANGER: 'DANGER',   // Ígneo te mira
  SPOTTED: 'SPOTTED'  // Ígneo te atrapó
};

class GameState {
  constructor() {
    this.currentState = GAME_STATES.START;
    this.igneoState = IGNEO_STATES.SAFE;
    this.playerName = '';
    this.playerPositionX = CONFIG.TRACK.START_X;
    this.isMoving = false;
    this.listeners = [];
  }

  reset() {
    this.currentState = GAME_STATES.START;
    this.igneoState = IGNEO_STATES.SAFE;
    this.playerPositionX = CONFIG.TRACK.START_X;
    this.isMoving = false;
    this.notify();
  }

  resetForNewAttempt() {
    this.currentState = GAME_STATES.PLAYING;
    this.igneoState = IGNEO_STATES.SAFE;
    this.playerPositionX = CONFIG.TRACK.START_X;
    this.isMoving = false;
    this.notify();
  }

  setState(newState) {
    if (this.currentState !== newState) {
      this.currentState = newState;
      this.notify();
    }
  }

  setIgneoState(newIgneoState) {
    if (this.igneoState !== newIgneoState) {
      this.igneoState = newIgneoState;
      this.notify();
    }
  }

  setPlayerName(name) {
    this.playerName = name.trim();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  get progressPercentage() {
    const dist = this.playerPositionX - CONFIG.TRACK.START_X;
    const total = CONFIG.TRACK.TOTAL_DISTANCE;
    return Math.min(1.0, Math.max(0.0, dist / total));
  }
}

// Global state singleton
const gameState = new GameState();
