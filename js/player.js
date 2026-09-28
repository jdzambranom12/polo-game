/**
 * POLO GAME - Player Controller & Physics
 */

class PlayerController {
  constructor() {
    this.isHoldingMove = false;
    this.btnElement = null;
    this.boundPointerDown = this.handlePointerDown.bind(this);
    this.boundPointerUp = this.handlePointerUp.bind(this);
    this.boundPointerCancel = this.handlePointerCancel.bind(this);
  }

  bindButton(btnElement) {
    if (this.btnElement) {
      this.unbindButton();
    }
    this.btnElement = btnElement;

    // Support mouse, touch, and pointer events uniformly
    btnElement.addEventListener('pointerdown', this.boundPointerDown);
    btnElement.addEventListener('pointerup', this.boundPointerUp);
    btnElement.addEventListener('pointercancel', this.boundPointerCancel);
    btnElement.addEventListener('pointerleave', this.boundPointerCancel);
    
    // Prevent context menu or drag selection on long press
    btnElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  unbindButton() {
    if (this.btnElement) {
      this.btnElement.removeEventListener('pointerdown', this.boundPointerDown);
      this.btnElement.removeEventListener('pointerup', this.boundPointerUp);
      this.btnElement.removeEventListener('pointercancel', this.boundPointerCancel);
      this.btnElement.removeEventListener('pointerleave', this.boundPointerCancel);
      this.btnElement = null;
    }
  }

  handlePointerDown(e) {
    e.preventDefault();
    if (gameState.currentState !== GAME_STATES.PLAYING) return;

    // Capture pointer for reliable release detection outside button bounds
    if (e.target && e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    }

    this.isHoldingMove = true;
    gameState.isMoving = true;
    soundManager.playStep();

    // Check immediate caught condition if Ígneo is already looking!
    this.checkDangerViolation();
  }

  handlePointerUp(e) {
    if (e) e.preventDefault();
    this.stopMovement();
  }

  handlePointerCancel(e) {
    if (e) e.preventDefault();
    this.stopMovement();
  }

  stopMovement() {
    this.isHoldingMove = false;
    gameState.isMoving = false;
  }

  update(deltaTime) {
    if (gameState.currentState !== GAME_STATES.PLAYING) {
      this.isHoldingMove = false;
      gameState.isMoving = false;
      return;
    }

    // Check if player is holding button during DANGER state
    if (this.isHoldingMove) {
      this.checkDangerViolation();
    }

    // Advance position if holding move button
    if (this.isHoldingMove && gameState.currentState === GAME_STATES.PLAYING) {
      gameState.playerPositionX += CONFIG.PLAYER.SPEED * deltaTime;

      // Check win condition
      if (gameState.playerPositionX >= CONFIG.TRACK.FINISH_X) {
        gameState.playerPositionX = CONFIG.TRACK.FINISH_X;
        this.stopMovement();
        app.handleWin();
      }
    }
  }

  checkDangerViolation() {
    if (gameState.igneoState === IGNEO_STATES.DANGER && gameState.isMoving) {
      this.stopMovement();
      app.handleCaught();
    }
  }

  reset() {
    this.stopMovement();
    gameState.playerPositionX = CONFIG.TRACK.START_X;
  }
}

const playerController = new PlayerController();
