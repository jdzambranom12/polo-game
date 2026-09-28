/**
 * POLO GAME - Leaderboard Persistence Manager
 */

class LeaderboardManager {
  constructor(storageKey = CONFIG.STORAGE_KEY) {
    this.storageKey = storageKey;
  }

  getScores() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      
      // Sort by fastest time (timeMs ascending)
      return data
        .filter(item => item && typeof item.timeMs === 'number' && item.name)
        .sort((a, b) => a.timeMs - b.timeMs)
        .slice(0, CONFIG.MAX_LEADERBOARD_ENTRIES);
    } catch (e) {
      console.warn('Error accessing localStorage leaderboard', e);
      return [];
    }
  }

  saveScore(playerName, timeMs, formattedTime) {
    const cleanName = (playerName || '').trim();
    if (!cleanName || typeof timeMs !== 'number' || timeMs <= 0) {
      console.warn('Invalid score attempt skipped from saving');
      return false;
    }

    const currentScores = this.getScores();
    const newEntry = {
      name: cleanName,
      timeMs: Math.round(timeMs),
      formattedTime: formattedTime,
      timestamp: Date.now()
    };

    currentScores.push(newEntry);
    currentScores.sort((a, b) => a.timeMs - b.timeMs);
    const topScores = currentScores.slice(0, CONFIG.MAX_LEADERBOARD_ENTRIES);

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(topScores));
      return true;
    } catch (e) {
      console.error('Error saving to localStorage', e);
      return false;
    }
  }

  renderToContainer(containerElement) {
    if (!containerElement) return;

    const scores = this.getScores();

    if (scores.length === 0) {
      containerElement.innerHTML = `
        <div class="empty-leaderboard">
          <p>No hay tiempos registrados aún.</p>
          <small>¡Sé el primero en completar la carrera!</small>
        </div>
      `;
      return;
    }

    let html = `
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Jugador</th>
            <th>Tiempo</th>
          </tr>
        </thead>
        <tbody>
    `;

    scores.forEach((entry, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
      html += `
        <tr class="${idx === 0 ? 'top-rank' : ''}">
          <td class="rank-col">${medal}</td>
          <td class="name-col">${this.escapeHtml(entry.name)}</td>
          <td class="time-col">${entry.formattedTime}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    containerElement.innerHTML = html;
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

const leaderboard = new LeaderboardManager();
