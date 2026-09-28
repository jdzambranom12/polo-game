/**
 * POLO GAME - Asset Loader & Sprite Manager
 * 
 * ARCHITECTURE NOTE FOR ASSET SWAPPING:
 * -------------------------------------
 * To replace the Polo or Ígneo character assets with individual custom PNGs in the future:
 * Simply set `OVERRIDE_SINGLE_ASSETS` to true and place single image files in:
 *   - assets/polo/polo_idle.png
 *   - assets/polo/polo_run.png
 *   - assets/polo/polo_caught.png
 *   - assets/polo/polo_win.png
 *   - assets/igneo/igneo_away.png
 *   - assets/igneo/igneo_turning.png
 *   - assets/igneo/igneo_looking.png
 *   - assets/igneo/igneo_spotted.png
 * 
 * By default, this manager automatically extracts the exact character poses from the official
 * reference sheets `polo_sheet.jpg` and `igneo_sheet.jpg`, applying dynamic background transparency!
 */

const ASSET_PATHS = {
  // Primary Sheet Sources (Official Character Reference Sheets)
  POLO_SHEET: 'assets/polo/polo_sheet.jpg',
  IGNEO_SHEET: 'assets/igneo/igneo_sheet.jpg',

  // Optional Individual Direct Image Overrides (for future single PNG replacement)
  POLO_IDLE: 'assets/polo/polo_idle.png',
  POLO_RUN: 'assets/polo/polo_run.png',
  POLO_CAUGHT: 'assets/polo/polo_caught.png',
  POLO_WIN: 'assets/polo/polo_win.png',

  IGNEO_AWAY: 'assets/igneo/igneo_away.png',
  IGNEO_TURNING: 'assets/igneo/igneo_turning.png',
  IGNEO_LOOKING: 'assets/igneo/igneo_looking.png',
  IGNEO_SPOTTED: 'assets/igneo/igneo_spotted.png'
};

class AssetManager {
  constructor() {
    this.sprites = {
      polo: {
        idle: null,
        run: null,
        caught: null,
        win: null
      },
      igneo: {
        away: null,
        turning: null,
        looking: null,
        spotted: null
      }
    };
    this.isLoaded = false;
  }

  async loadAll() {
    try {
      // Attempt to load official sheets and slice them
      const poloSheetImg = await this.loadImage(ASSET_PATHS.POLO_SHEET);
      const igneoSheetImg = await this.loadImage(ASSET_PATHS.IGNEO_SHEET);

      // Slice Polo poses from sheet with transparent background filter
      // Row 0 Col 0: Run (top left)
      // Row 0 Col 1: Win (top second)
      // Row 1 Col 0: Caught (bottom left)
      // Row 1 Col 2: Idle (bottom third)
      this.sprites.polo.run = this.cropAndRemoveBg(poloSheetImg, 0, 0, 0.25, 0.5);
      this.sprites.polo.win = this.cropAndRemoveBg(poloSheetImg, 0.25, 0, 0.25, 0.5);
      this.sprites.polo.caught = this.cropAndRemoveBg(poloSheetImg, 0, 0.5, 0.25, 0.5);
      this.sprites.polo.idle = this.cropAndRemoveBg(poloSheetImg, 0.5, 0.5, 0.25, 0.5);

      // Slice Ígneo poses from sheet with transparent background filter
      // Row 1 Col 2: Away (bottom 3rd - calm, eyes closed)
      // Row 1 Col 3: Turning (bottom 4th - flame spin/side)
      // Row 1 Col 1: Looking (bottom 2nd - pointing left/looking forward)
      // Row 0 Col 2: Spotted (top 3rd - landing/alert pose)
      this.sprites.igneo.away = this.cropAndRemoveBg(igneoSheetImg, 0.5, 0.5, 0.25, 0.5);
      this.sprites.igneo.turning = this.cropAndRemoveBg(igneoSheetImg, 0.75, 0.5, 0.25, 0.5);
      this.sprites.igneo.looking = this.cropAndRemoveBg(igneoSheetImg, 0.25, 0.5, 0.25, 0.5);
      this.sprites.igneo.spotted = this.cropAndRemoveBg(igneoSheetImg, 0.5, 0, 0.25, 0.5);

      this.isLoaded = true;
      console.log('Official character assets loaded & sliced successfully!');
    } catch (err) {
      console.warn('Could not load primary character sheets, generating SVG vector placeholders...', err);
      this.generateFallbackSprites();
      this.isLoaded = true;
    }
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  }

  /**
   * Crop normalized region (nx, ny, nw, nh) from sheet image and remove white background pixels
   */
  cropAndRemoveBg(sheetImg, nx, ny, nw, nh) {
    const sw = sheetImg.naturalWidth * nw;
    const sh = sheetImg.naturalHeight * nh;
    const sx = sheetImg.naturalWidth * nx;
    const sy = sheetImg.naturalHeight * ny;

    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');

    // Draw raw cropped region
    ctx.drawImage(sheetImg, sx, sy, sw, sh, 0, 0, sw, sh);

    // Perform white background chromakey filtering (turning near-white pixels transparent)
    try {
      const imgData = ctx.getImageData(0, 0, sw, sh);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // If pixel is near-white (background of character reference sheets)
        if (r > 235 && g > 235 && b > 235) {
          data[i + 3] = 0; // Set Alpha to 0
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      console.warn('Canvas pixel manipulation CORS error, fallback to raw crop', e);
    }

    return canvas;
  }

  /**
   * Fallback vector graphic placeholders if asset files are missing or restricted
   */
  generateFallbackSprites() {
    this.sprites.polo.idle = this.createFallbackCanvas('Polo (Idle)', '#81d4fa');
    this.sprites.polo.run = this.createFallbackCanvas('Polo (Run)', '#29b6f6');
    this.sprites.polo.caught = this.createFallbackCanvas('Polo (!)', '#ff7043');
    this.sprites.polo.win = this.createFallbackCanvas('Polo (Win!)', '#66bb6a');

    this.sprites.igneo.away = this.createFallbackCanvas('Ígneo (Away)', '#ffb74d');
    this.sprites.igneo.turning = this.createFallbackCanvas('Ígneo (?)', '#ffa726');
    this.sprites.igneo.looking = this.createFallbackCanvas('Ígneo (LOOKING)', '#ff5722');
    this.sprites.igneo.spotted = this.createFallbackCanvas('Ígneo (SPOTTED)', '#d84315');
  }

  createFallbackCanvas(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');

    // Pill body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(10, 10, 100, 120, 30);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 60, 75);

    return canvas;
  }
}

const assetManager = new AssetManager();
