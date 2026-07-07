// Renderiza los botones de filtro
export function renderFilters(filterContainer, gamesCatalog, activeGenre, onChange, genreNames) {
  const genres = ["all", ...new Set(gamesCatalog.map(g => g.genre))];

  filterContainer.innerHTML = genres.map(genre => `
    <button class="filter-chip ${activeGenre === genre ? 'active' : ''}" data-genre="${genre}">
      ${genreNames[genre] || (genre === 'all' ? '🎮 Todos' : `🎲 ${genre}`)}
    </button>
  `).join('');

  // Agregar event listeners
  filterContainer.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      onChange(btn.dataset.genre);
    });
  });
}
