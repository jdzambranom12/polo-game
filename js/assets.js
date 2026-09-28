/**
 * POLO GAME - Asset Loader & Sprite Manager
 */

const ASSET_PATHS = {
  POLO_IDLE: 'assets/polo/Inicio.png',
  POLO_RUN: 'assets/polo/Corriendo.png',
  POLO_CAUGHT: 'assets/polo/Congelado.png',
  POLO_WIN: 'assets/polo/Celebrando.png',
  IGNEO_SHEET: 'assets/igneo/igneo_sheet.jpg',

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
    const poloAssets = [
      ['idle', ASSET_PATHS.POLO_IDLE],
      ['run', ASSET_PATHS.POLO_RUN],
      ['caught', ASSET_PATHS.POLO_CAUGHT],
      ['win', ASSET_PATHS.POLO_WIN]
    ];
    const poloResults = await Promise.allSettled(
      poloAssets.map(([, path]) => this.loadImage(path))
    );

    poloResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.sprites.polo[poloAssets[index][0]] = result.value;
      } else {
        console.error(`Could not load Polo asset ${poloAssets[index][1]}.`, result.reason);
      }
    });

    try {
      const igneoSheetImg = await this.loadImage(ASSET_PATHS.IGNEO_SHEET);

      // Slice Ígneo poses from sheet with transparent background filter
      this.sprites.igneo.away = this.cropAndRemoveBg(igneoSheetImg, 0.5, 0.5, 0.25, 0.5);
      this.sprites.igneo.turning = this.cropAndRemoveBg(igneoSheetImg, 0.75, 0.5, 0.25, 0.5);
      this.sprites.igneo.looking = this.cropAndRemoveBg(igneoSheetImg, 0.25, 0.5, 0.25, 0.5);
      this.sprites.igneo.spotted = this.cropAndRemoveBg(igneoSheetImg, 0.5, 0, 0.25, 0.5);

      console.log('Ígneo character assets loaded & sliced successfully!');
    } catch (err) {
      console.warn('Could not load Ígneo character sheet, generating SVG vector placeholders...', err);
      this.generateIgneoFallbackSprites();
    }

    this.isLoaded = true;
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
   * Fallback vector graphic placeholders if Ígneo's sheet is missing or restricted
   */
  generateIgneoFallbackSprites() {
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
