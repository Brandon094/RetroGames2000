import { state } from './modules/state.js';
import { renderFilters } from './modules/filters.js';
import { renderGames, updateFilteredGames } from './modules/renderer.js';
import { addLoadMoreTrigger, loadMoreGames } from './modules/lazy.js';
import { attachSearch } from './modules/search.js';
import { genreNames } from './modules/utils.js';
import { initBackground3D } from './modules/background3d.js';

// Elementos DOM
const DOM = {
    grid: document.getElementById('gamesGrid'),
    search: document.getElementById('searchGame'),
    filterContainer: document.getElementById('filterContainer')
};

async function loadGames() {
    try {
        DOM.grid.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-warning"></div><p class="mt-2">Cargando catálogo retro...</p></div>`;

        const response = await fetch('db/games.json');
        if (!response.ok) throw new Error('No se pudo cargar games.json');
        const data = await response.json();

        // Filtramos por el rango de años de tu colección (1997-2007)
        state.gamesCatalog = data.games
            .filter(g => g.year >= 1997 && g.year <= 2007 && g.mediafireUrl && g.mediafireUrl !== "#")
            .map(g => ({ ...g, icon: g.icon || "🎮", desc: g.desc || "Clásico imprescindible de la época" }));

        // Renderizar filtros y resultados
        renderFilters(DOM.filterContainer, state.gamesCatalog, state.activeGenre, (newGenre) => {
            state.activeGenre = newGenre;
            renderFilters(DOM.filterContainer, state.gamesCatalog, state.activeGenre, onFilterChange, genreNames);
            resetAndRender();
        }, genreNames);

        resetAndRender();
    } catch (error) {
        console.error('Error cargando juegos:', error);
        DOM.grid.innerHTML = `<div class="col-12 text-center py-5"><div class="alert alert-danger">Error al cargar los juegos. Asegúrate de que el archivo games.json existe.</div></div>`;
    }
}

function onFilterChange(newGenre) {
    state.activeGenre = newGenre;
}

function resetAndRender() {
    state.currentPage = 1;
    if (state.observer) state.observer.disconnect();
    renderGames(state, DOM, true, () => addLoadMoreTrigger(state, DOM, () => loadMoreGames(state, DOM, renderGames)));
}

// Inicialización de todo
initBackground3D();
attachSearch(DOM.search, state, resetAndRender);
loadGames();

// Recargar cuando cambie el tamaño de la ventana
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const newGamesPerPage = window.innerWidth < 768 ? 6 : 12;
        if (newGamesPerPage !== (window.innerWidth < 768 ? 6 : 12)) {
            location.reload();
        }
    }, 250);
});