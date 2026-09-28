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
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('INICIO', CONFIG.TRACK.START_X, trackY + 20);

    // Finish Platform Indicator
    ctx.fillStyle = '#ff7043';
    ctx.beginPath();
    ctx.ellipse(CONFIG.TRACK.FINISH_X, trackY + 15, 60, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('META', CONFIG.TRACK.FINISH_X, trackY + 20);
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
    const px = gameState.playerPositionX;
    const py = CONFIG.TRACK.Y;
    const pw = CONFIG.PLAYER.WIDTH;
    const ph = CONFIG.PLAYER.HEIGHT;

    // Running bobbing offset
    let bobY = 0;
    if (gameState.isMoving) {
      bobY = Math.sin(this.animTime * 18) * 8;
    }

    // Select sprite pose based on state
    let sprite = assetManager.sprites.polo.idle;
    if (gameState.currentState === GAME_STATES.CAUGHT) {
      sprite = assetManager.sprites.polo.caught;
    } else if (gameState.currentState === GAME_STATES.WON) {
      sprite = assetManager.sprites.polo.win;
    } else if (gameState.isMoving) {
      sprite = assetManager.sprites.polo.run;
    }

    // Shadow under character
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(px + pw / 2, py + ph - 10, pw * 0.35, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw sprite canvas
    if (sprite) {
      ctx.drawImage(sprite, px, py + bobY, pw, ph);
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

    // Shadow under Ígneo
    ctx.fillStyle = 'rgba(230, 81, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(ix + iw / 2, iy + ih - 10, iw * 0.4, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw sprite canvas
    if (sprite) {
      ctx.drawImage(sprite, ix, iy, iw, ih);
    }
  }
}

const renderer = new GameRenderer();
