import { GAMES_PER_PAGE } from './utils.js';
import { createGameCard } from './cards.js';
import { genreNames } from './utils.js';

export function updateFilteredGames(state) {
  state.allFilteredGames = state.gamesCatalog
    .filter(g => state.activeGenre === "all" || g.genre === state.activeGenre)
    .filter(g => !state.searchQuery.trim() || g.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
}

export function renderGames(state, DOM, reset = true, addLoadMoreTrigger) {
  if (reset) {
    state.currentPage = 1;
    DOM.grid.innerHTML = '';
    if (state.observer) state.observer.disconnect();
  }

  updateFilteredGames(state);

  if (state.allFilteredGames.length === 0) {
    DOM.grid.innerHTML = `
          <div class="col-12 text-center py-5">
            <div class="p-4 bg-dark bg-opacity-50 rounded-4 border border-warning">
              <i class="bi bi-emoji-frown fs-1"></i>
              <h4 class="mt-3">¡Ningún juego encontrado!</h4>
              <p>No hay resultados para "${state.searchQuery}" en ${genreNames[state.activeGenre] || state.activeGenre}</p>
            </div>
          </div>`;
    return;
  }

  const start = reset ? 0 : (state.currentPage - 1) * GAMES_PER_PAGE;
  const end = state.currentPage * GAMES_PER_PAGE;
  const gamesToShow = state.allFilteredGames.slice(start, end);

  gamesToShow.forEach(game => {
    const card = createGameCard(game);
    DOM.grid.appendChild(card);
  });

  if (end < state.allFilteredGames.length) {
    addLoadMoreTrigger();
  } else {
    const trigger = DOM.grid.querySelector('.load-more-trigger');
    if (trigger) trigger.remove();
  }
}
