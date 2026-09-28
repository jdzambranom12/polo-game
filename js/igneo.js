/**
 * POLO GAME - Ígneo Watcher State Machine & AI Timing
 */

class IgneoController {
  constructor() {
    this.timerId = null;
    this.stateStartTime = 0;
  }

  start() {
    this.stop();
    this.setSafeState();
  }

  stop() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  setSafeState() {
    if (gameState.currentState !== GAME_STATES.PLAYING) return;
    
    gameState.setIgneoState(IGNEO_STATES.SAFE);

    // Calculate dynamic safe duration based on Polo's progress
    const progress = gameState.progressPercentage;
    let timingConfig;

    if (progress < 0.35) {
      timingConfig = CONFIG.TIMING.SAFE_EARLY;
    } else if (progress < 0.70) {
      timingConfig = CONFIG.TIMING.SAFE_MID;
    } else {
      timingConfig = CONFIG.TIMING.SAFE_LATE;
    }

    // Random safe duration within difficulty range
    const safeDuration = (timingConfig.min + Math.random() * (timingConfig.max - timingConfig.min)) * 1000;

    this.timerId = setTimeout(() => {
      this.setWarningState();
    }, safeDuration);
  }

  setWarningState() {
    if (gameState.currentState !== GAME_STATES.PLAYING) return;

    gameState.setIgneoState(IGNEO_STATES.WARNING);
    soundManager.playWarning();

    const warningDuration = CONFIG.TIMING.WARNING_DURATION * 1000;

    this.timerId = setTimeout(() => {
      this.setDangerState();
    }, warningDuration);
  }

  setDangerState() {
    if (gameState.currentState !== GAME_STATES.PLAYING) return;

    gameState.setIgneoState(IGNEO_STATES.DANGER);
    soundManager.playDanger();

    // Check if player is currently moving at the exact instant Ígneo turns!
    if (gameState.isMoving) {
      playerController.checkDangerViolation();
      return;
    }

    const dangerDuration = (CONFIG.TIMING.DANGER_MIN + Math.random() * (CONFIG.TIMING.DANGER_MAX - CONFIG.TIMING.DANGER_MIN)) * 1000;

    this.timerId = setTimeout(() => {
      this.setSafeState();
    }, dangerDuration);
  }

  triggerSpotted() {
    this.stop();
    gameState.setIgneoState(IGNEO_STATES.SPOTTED);
  }

  reset() {
    this.stop();
    gameState.setIgneoState(IGNEO_STATES.SAFE);
  }
}

const igneoController = new IgneoController();
