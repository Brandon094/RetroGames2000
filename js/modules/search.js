// Debounced search input wiring
export function attachSearch(searchEl, state, resetAndRender) {
  let debounceTimeout;
  searchEl.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      state.searchQuery = e.target.value;
      resetAndRender();
    }, 300);
  });
}
