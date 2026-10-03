/**
 * POLO GAME - Configuration & Constants
 */
const CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 1000,
  CANVAS_HEIGHT: 500,

  // Track coordinates
  TRACK: {
    START_X: 100,
    FINISH_X: 880,
    Y: 340,
    TOTAL_DISTANCE: 780 // 880 - 100
  },

  // Player physics
  PLAYER: {
    SPEED: 180, // pixels per second
    WIDTH: 110,
    HEIGHT: 130
  },

  // Ígneo watcher dimensions
  IGNEO: {
    WIDTH: 120,
    HEIGHT: 140,
    X: 880,
    Y: 320
  },

  // State durations (in seconds)
  TIMING: {
    WARNING_DURATION: 0.75, // time to stop before Ígneo looks
    DANGER_MIN: 1.2,
    DANGER_MAX: 1.8,
    // Dynamic Safe duration based on distance percentage (0.0 to 1.0)
    SAFE_EARLY: { min: 2.5, max: 3.8 },  // 0% - 35% distance
    SAFE_MID:   { min: 1.5, max: 2.5 },  // 35% - 70% distance
    SAFE_LATE:  { min: 0.9, max: 1.6 }   // 70% - 100% distance
  },

  // Storage key
  STORAGE_KEY: 'polo_game_leaderboard_v1',
  MAX_LEADERBOARD_ENTRIES: 10
};

// Freeze config object to prevent accidental mutation
Object.freeze(CONFIG);
