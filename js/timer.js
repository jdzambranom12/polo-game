/**
 * POLO GAME - Gameplay Timer
 * High-precision performance.now() elapsed timer
 */

class GameTimer {
  constructor() {
    this.startTime = 0;
    this.elapsedMs = 0;
    this.isRunning = false;
    this.animationFrameId = null;
    this.displayElement = null;
  }

  bindDisplay(element) {
    this.displayElement = element;
    this.updateDisplay(0);
  }

  start() {
    this.stop();
    this.startTime = performance.now();
    this.elapsedMs = 0;
    this.isRunning = true;
    this.tick();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.startTime > 0) {
      this.elapsedMs = performance.now() - this.startTime;
      this.updateDisplay(this.elapsedMs);
    }
  }

  reset() {
    this.stop();
    this.startTime = 0;
    this.elapsedMs = 0;
    this.updateDisplay(0);
  }

  tick() {
    if (!this.isRunning) return;

    this.elapsedMs = performance.now() - this.startTime;
    this.updateDisplay(this.elapsedMs);

    this.animationFrameId = requestAnimationFrame(() => this.tick());
  }

  getElapsedMs() {
    if (this.isRunning) {
      return performance.now() - this.startTime;
    }
    return this.elapsedMs;
  }

  getFormattedTime(ms = this.getElapsedMs()) {
    const totalDecis = Math.floor(ms / 10);
    const hundredths = Math.floor((ms % 1000) / 10);
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor(ms / 60000);

    const pad = (num, len = 2) => String(num).padStart(len, '0');
    return `${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
  }

  updateDisplay(ms) {
    if (this.displayElement) {
      this.displayElement.textContent = this.getFormattedTime(ms);
    }
  }
}

const gameTimer = new GameTimer();
