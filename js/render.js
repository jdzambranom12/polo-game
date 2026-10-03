/**
 * POLO GAME - Render Engine
 * Canvas rendering for scene, characters, animations & particles
 */

class GameRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animTime = 0;
  }

  init(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    // Snowflake particles
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        type: 'snow',
        x: Math.random() * CONFIG.CANVAS_WIDTH,
        y: Math.random() * CONFIG.CANVAS_HEIGHT,
        radius: 1.5 + Math.random() * 2.5,
        speedY: 20 + Math.random() * 30,
        speedX: -10 + Math.random() * 20
      });
    }
    // Fire spark particles near Ígneo
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        type: 'spark',
        x: CONFIG.IGNEO.X + (Math.random() * 100 - 50),
        y: CONFIG.IGNEO.Y + Math.random() * 100,
        radius: 1 + Math.random() * 3,
        speedY: -(30 + Math.random() * 50),
        speedX: -15 + Math.random() * 30,
        alpha: 0.8 + Math.random() * 0.2
      });
    }
  }

  render(deltaTime) {
    if (!this.ctx) return;
    this.animTime += deltaTime;

    const ctx = this.ctx;
    const w = CONFIG.CANVAS_WIDTH;
    const h = CONFIG.CANVAS_HEIGHT;

    // 1. Clear background (Atmospheric gradient: Ice Blue left -> Fiery Amber right)
    const bgGrad = ctx.createLinearGradient(0, 0, w, 0);
    bgGrad.addColorStop(0, '#e0f7fa');
    bgGrad.addColorStop(0.5, '#fff8e1');
    bgGrad.addColorStop(1, '#ffe0b2');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Draw Distance Track / Ground
    this.drawTrack(ctx, w, h);

    // 3. Update & Draw Ambient Particles (Snow & Ember Sparks)
    this.drawParticles(ctx, deltaTime, w, h);

    // 4. Draw Ígneo (Watcher at Finish Line)
    this.drawIgneo(ctx);

    // 5. Draw Polo (Playable Character)
    this.drawPolo(ctx);

    // 6. Draw Finish Line Banner
    this.drawFinishBanner(ctx);
  }

  drawTrack(ctx, w, h) {
    const trackY = CONFIG.TRACK.Y + 80;
    
    // Ice / Snow Path
    const pathGrad = ctx.createLinearGradient(0, trackY, w, trackY + 80);
    pathGrad.addColorStop(0, '#b2ebf2');
    pathGrad.addColorStop(0.7, '#fff176');
    pathGrad.addColorStop(1, '#ffb74d');

    ctx.fillStyle = pathGrad;
    ctx.beginPath();
    ctx.ellipse(w / 2, trackY + 20, w * 0.48, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#80deea';
    ctx.stroke();

    // Start Platform Indicator
    ctx.fillStyle = '#4dd0e1';
    ctx.beginPath();
    ctx.ellipse(CONFIG.TRACK.START_X, trackY + 15, 60, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Finish Platform Indicator
    ctx.fillStyle = '#ff7043';
    ctx.beginPath();
    ctx.ellipse(CONFIG.TRACK.FINISH_X, trackY + 15, 60, 25, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawFinishBanner(ctx) {
    const finishX = CONFIG.TRACK.FINISH_X;
    const y = CONFIG.TRACK.Y - 140;

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e65100';

    // Finish posts
    ctx.beginPath();
    ctx.moveTo(finishX, y);
    ctx.lineTo(finishX, CONFIG.TRACK.Y + 80);
    ctx.stroke();

    // Flag ribbon
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.moveTo(finishX, y);
    ctx.lineTo(finishX - 40, y + 15);
    ctx.lineTo(finishX, y + 30);
    ctx.closePath();
    ctx.fill();
  }

  drawParticles(ctx, deltaTime, w, h) {
    this.particles.forEach(p => {
      if (p.type === 'snow') {
        p.y += p.speedY * deltaTime;
        p.x += p.speedX * deltaTime;
        if (p.y > h) { p.y = -10; p.x = Math.random() * w; }
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'spark') {
        p.y += p.speedY * deltaTime;
        p.x += p.speedX * deltaTime;
        if (p.y < CONFIG.IGNEO.Y - 100) {
          p.y = CONFIG.IGNEO.Y + Math.random() * 80;
          p.x = CONFIG.IGNEO.X + (Math.random() * 80 - 40);
        }

        ctx.fillStyle = `rgba(255, 112, 67, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  drawPolo(ctx) {
    const playerCenterX = gameState.playerPositionX;
    const isFrozen = gameState.poloState === POLO_STATES.IDLE ||
      gameState.poloState === POLO_STATES.CAUGHT_WHILE_MOVING;
    const visualScale = isFrozen ? 1.4 : 1.3;
    const pw = CONFIG.PLAYER.WIDTH * visualScale;
    const ph = CONFIG.PLAYER.HEIGHT * visualScale;

    // Running bobbing offset
    let bobY = 0;
    if (gameState.poloState === POLO_STATES.MOVING) {
      bobY = Math.sin(this.animTime * 18) * 8;
    }

    const poloSprites = {
      [POLO_STATES.IDLE]: assetManager.sprites.polo.caught,
      [POLO_STATES.MOVING]: assetManager.sprites.polo.run,
      [POLO_STATES.CAUGHT_WHILE_MOVING]: assetManager.sprites.polo.caught,
      [POLO_STATES.VICTORY]: assetManager.sprites.polo.win
    };
    const sprite = poloSprites[gameState.poloState] || assetManager.sprites.polo.idle;

    // Fit the full image inside Polo's bounds without distorting or cropping it.
    if (sprite) {
      const sourceWidth = sprite.naturalWidth || sprite.width;
      const sourceHeight = sprite.naturalHeight || sprite.height;
      const scale = Math.min(pw / sourceWidth, ph / sourceHeight);
      const drawWidth = sourceWidth * scale;
      const drawHeight = sourceHeight * scale;
      const drawX = playerCenterX - drawWidth / 2;
      const igneoCenterY = CONFIG.IGNEO.Y + CONFIG.IGNEO.HEIGHT / 2;
      const drawY = igneoCenterY - drawHeight / 2 + bobY;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.ellipse(playerCenterX, drawY + drawHeight - 10, pw * 0.35, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(sprite, drawX, drawY, drawWidth, drawHeight);
    }
  }

  drawIgneo(ctx) {
    const ix = CONFIG.IGNEO.X;
    const iy = CONFIG.IGNEO.Y;
    const iw = CONFIG.IGNEO.WIDTH;
    const ih = CONFIG.IGNEO.HEIGHT;

    let sprite = assetManager.sprites.igneo.away;
    if (gameState.igneoState === IGNEO_STATES.WARNING) {
      sprite = assetManager.sprites.igneo.turning;
    } else if (gameState.igneoState === IGNEO_STATES.DANGER) {
      sprite = assetManager.sprites.igneo.looking;
    } else if (gameState.igneoState === IGNEO_STATES.SPOTTED) {
      sprite = assetManager.sprites.igneo.spotted;
    }

    // Crop the wide transparent side margins on Ígneo's square sprites.
    if (sprite) {
      const imageWidth = sprite.naturalWidth || sprite.width;
      const sourceHeight = sprite.naturalHeight || sprite.height;
      const sourceX = imageWidth * 0.22;
      const sourceWidth = imageWidth * 0.56;
      const drawHeight = ih * 1.3;
      const drawWidth = drawHeight * sourceWidth / imageWidth;
      const centerX = ix + iw / 2;
      const centerY = iy + ih / 2;
      const drawX = centerX - drawWidth / 2;
      const drawY = centerY - drawHeight / 2;

      ctx.fillStyle = 'rgba(230, 81, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(centerX, drawY + drawHeight - 10, drawWidth * 0.4, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(
        sprite,
        sourceX,
        0,
        sourceWidth,
        sourceHeight,
        drawX,
        drawY,
        drawWidth,
        drawHeight
      );
    }
  }
}

const renderer = new GameRenderer();
