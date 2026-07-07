// Lazy loading helper: sentinel + IntersectionObserver + load more
export function addLoadMoreTrigger(state, DOM, loadMoreCallback) {
  const existingTrigger = DOM.grid.querySelector('.load-more-trigger');
  if (existingTrigger) existingTrigger.remove();

  const sentinel = document.createElement('div');
  sentinel.className = 'col-12 text-center py-4 load-more-trigger';
  sentinel.innerHTML = `
        <div class="d-flex justify-content-center align-items-center gap-3">
            <div class="spinner-border spinner-border-sm text-info" role="status"></div>
            <span class="text-info-emphasis">Cargando más juegos retro...</span>
        </div>
    `;
  DOM.grid.appendChild(sentinel);

  if (state.observer) state.observer.disconnect();

  state.observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !state.isLoading) {
      loadMoreCallback();
    }
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px 200px 0px'
  });

  state.observer.observe(sentinel);
}

export async function loadMoreGames(state, DOM, renderFn) {
  if (state.isLoading) return;
  state.isLoading = true;
  await new Promise(resolve => setTimeout(resolve, 300));
  state.currentPage++;
  renderFn(state, DOM, false, () => addLoadMoreTrigger(state, DOM, () => loadMoreGames(state, DOM, renderFn)));
  state.isLoading = false;
}
