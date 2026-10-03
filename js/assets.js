/**
 * POLO GAME - Asset Loader & Sprite Manager
 */

const ASSET_PATHS = {
  POLO_IDLE: 'assets/polo/Inicio.png',
  POLO_RUN: 'assets/polo/Corriendo.png',
  POLO_CAUGHT: 'assets/polo/Congelado.png',
  POLO_WIN: 'assets/polo/Celebrando.png',
  IGNEO_AWAY: 'assets/igneo/Volteado.png',
  IGNEO_TURNING: 'assets/igneo/Va a mirar.png',
  IGNEO_LOOKING: 'assets/igneo/Mirando.png'
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
    const imageAssets = [
      ['polo', 'idle', ASSET_PATHS.POLO_IDLE],
      ['polo', 'run', ASSET_PATHS.POLO_RUN],
      ['polo', 'caught', ASSET_PATHS.POLO_CAUGHT],
      ['polo', 'win', ASSET_PATHS.POLO_WIN],
      ['igneo', 'away', ASSET_PATHS.IGNEO_AWAY],
      ['igneo', 'turning', ASSET_PATHS.IGNEO_TURNING],
      ['igneo', 'looking', ASSET_PATHS.IGNEO_LOOKING]
    ];
    const imageResults = await Promise.allSettled(
      imageAssets.map(([, , path]) => this.loadImage(path))
    );

    imageResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const [character, pose] = imageAssets[index];
        this.sprites[character][pose] = result.value;
      } else {
        console.error(`Could not load character asset ${imageAssets[index][2]}.`, result.reason);
      }
    });

    this.sprites.igneo.spotted = this.sprites.igneo.looking;
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

}

const assetManager = new AssetManager();
