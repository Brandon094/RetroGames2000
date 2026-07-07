import { escapeHtml, getGenreLabel } from './utils.js';

export function createGameCard(game) {
  const col = document.createElement('div');
  col.className = 'col-md-6 col-lg-4 col-xl-3';
  col.style.opacity = '0';
  col.style.animation = 'fadeInUp 0.4s ease forwards';

  // Determinar si hay miniatura disponible (propiedades posibles)
  const imgSrc = game.image || game.thumb || game.cover || game.screenshot || '';
  const hasImage = !!imgSrc;

  const imageHtml = hasImage ? `
    <div class="game-card-img-container">
      <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(game.name)}" class="game-img"/>
      <div class="img-overlay"></div>
    </div>
  ` : `
    <div class="game-icon-placeholder">
      <div class="game-icon-badge fs-1">${game.icon}</div>
    </div>
  `;

  col.innerHTML = `
      <div class="card-retro h-100 d-flex flex-column">
        ${imageHtml}
        <div class="p-3 p-xl-4 d-flex flex-column flex-grow-1">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="genre-tag"><i class="bi bi-tag-fill"></i> ${getGenreLabel(game.genre)}</span>
              <span class="year-badge fw-bold">${game.year}</span>
            </div>
            <h3 class="h4 fw-bold mb-2 retro-header" style="font-size:1.4rem; min-height: 3.4rem; display: flex; align-items: center;">${escapeHtml(game.name)}</h3>
            <p class="small opacity-75 mb-3 flex-grow-1">${escapeHtml(game.desc)}</p>
            <div class="mt-auto">
              <a href="${game.mediafireUrl}" target="_blank" rel="noopener noreferrer" class="btn-download-retro w-100">
                <i class="bi bi-download"></i> DESCARGAR JUEGO COMPLETO
              </a>
            </div>
        </div>
      </div>
    `;

  return col;
}
