// ===== CONFIGURACIÓN Y ESTADO GLOBAL =====
let gamesCatalog = [];
let activeGenre = "all";
let searchQuery = "";
let currentPage = 1;
let isLoading = false;
let observer = null;
let allFilteredGames = [];

// Configuración de nombres de géneros
const genreNames = {
    "all": "🎲 Todos",
    "estrategia": "⚔️ Estrategia",
    "rpg": "🧙 RPG",
    "shooter": "🔫 Shooter",
    "aventura": "🗺️ Aventura",
    "simulacion": "🏎️ Simulación",
    "deportes": "🏅 Deportes"
};

// Configuración de cantidad de juegos por carga
const GAMES_PER_PAGE = window.innerWidth < 768 ? 6 : 12; // 6 en móvil, 12 en escritorio

// Elementos DOM
const DOM = {
    grid: document.getElementById('gamesGrid'),
    search: document.getElementById('searchGame'),
    filterContainer: document.getElementById('filterContainer')
};

// ===== FUNCIONES DE UTILIDAD =====
const escapeHtml = (str) => str?.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])) || "";

const getGenreLabel = (genre) => genreNames[genre] || genre;

// ===== CARGA DE DATOS DESDE JSON =====
async function loadGames() {
    try {
        DOM.grid.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-warning"></div><p class="mt-2">Cargando catálogo retro...</p></div>`;

        const response = await fetch('db/games.json');
        if (!response.ok) throw new Error('No se pudo cargar games.json');
        const data = await response.json();

        // Procesar datos
        gamesCatalog = data.games
            .filter(g => g.year >= 2000 && g.year <= 2004 && g.mediafireUrl && g.mediafireUrl !== "#")
            .map(g => ({ ...g, icon: g.icon || "🎮", desc: g.desc || "Clásico imprescindible de la época 2000" }));

        renderFilters();
        resetAndRender(); // Iniciar con lazy loading
    } catch (error) {
        console.error('Error cargando juegos:', error);
        DOM.grid.innerHTML = `<div class="col-12 text-center py-5"><div class="alert alert-danger">Error al cargar los juegos. Asegúrate de que el archivo games.json existe.</div></div>`;
    }
}

// ===== RENDERIZADO DE FILTROS =====
function renderFilters() {
    const genres = ["all", ...new Set(gamesCatalog.map(g => g.genre))];

    DOM.filterContainer.innerHTML = genres.map(genre => `
    <button class="filter-chip ${activeGenre === genre ? 'active' : ''}" data-genre="${genre}">
      ${genreNames[genre] || (genre === 'all' ? '🎮 Todos' : `🎲 ${genre}`)}
    </button>
  `).join('');

    // Agregar event listeners
    document.querySelectorAll('.filter-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            activeGenre = btn.dataset.genre;
            renderFilters();
            resetAndRender(); // Resetear cuando cambia el filtro
        });
    });
}

// ===== OBTENER JUEGOS FILTRADOS =====
function updateFilteredGames() {
    allFilteredGames = gamesCatalog
        .filter(g => activeGenre === "all" || g.genre === activeGenre)
        .filter(g => !searchQuery.trim() || g.name.toLowerCase().includes(searchQuery.toLowerCase()));
}

// ===== CREAR TARJETA DE JUEGO INDIVIDUAL =====
function createGameCard(game) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 col-xl-3';
    col.style.opacity = '0';
    col.style.animation = 'fadeInUp 0.4s ease forwards';
    
    col.innerHTML = `
      <div class="card-retro h-100 d-flex flex-column p-3 p-xl-4">
        <div class="d-flex justify-content-between align-items-start">
          <div class="game-icon-badge fs-1 mb-2">${game.icon}</div>
          <span class="genre-tag"><i class="bi bi-tag-fill"></i> ${getGenreLabel(game.genre)}</span>
        </div>
        <h3 class="h4 fw-bold mt-2 mb-1 retro-header" style="font-size:1.6rem;">${escapeHtml(game.name)}</h3>
        <div class="d-flex align-items-center gap-2 mt-1 mb-2">
          <span class="year-badge fw-bold"><i class="bi bi-calendar2-week"></i> ${game.year}</span>
          <span class="badge bg-dark text-white-50 border px-2"><i class="bi bi-hdd"></i> PC</span>
        </div>
        <p class="small opacity-75 mt-1 mb-3">${escapeHtml(game.desc)}</p>
        <div class="mt-auto pt-2">
          <a href="${game.mediafireUrl}" target="_blank" rel="noopener noreferrer" class="btn-download-retro w-100">
            <i class="bi bi-download"></i> DESCARGAR DESDE MEDIAFIRE
          </a>
        </div>
      </div>
    `;
    
    return col;
}

// ===== RENDERIZADO CON LAZY LOADING =====
function renderGames(reset = true) {
    if (reset) {
        currentPage = 1;
        DOM.grid.innerHTML = '';
        if (observer) observer.disconnect();
    }
    
    updateFilteredGames();
    
    // Mostrar mensaje si no hay resultados
    if (allFilteredGames.length === 0) {
        DOM.grid.innerHTML = `
          <div class="col-12 text-center py-5">
            <div class="p-4 bg-dark bg-opacity-50 rounded-4 border border-warning">
              <i class="bi bi-emoji-frown fs-1"></i>
              <h4 class="mt-3">¡Ningún juego encontrado!</h4>
              <p>No hay resultados para "${searchQuery}" en ${genreNames[activeGenre] || activeGenre}</p>
            </div>
          </div>`;
        return;
    }
    
    // Calcular juegos a mostrar en esta página
    const start = 0;
    const end = currentPage * GAMES_PER_PAGE;
    const gamesToShow = allFilteredGames.slice(start, end);
    
    // Agregar juegos al grid
    gamesToShow.forEach(game => {
        const card = createGameCard(game);
        DOM.grid.appendChild(card);
    });
    
    // Verificar si hay más juegos para cargar
    if (end < allFilteredGames.length) {
        addLoadMoreTrigger();
    } else if (DOM.grid.querySelector('.load-more-trigger')) {
        // Eliminar trigger si ya no hay más juegos
        const trigger = DOM.grid.querySelector('.load-more-trigger');
        if (trigger) trigger.remove();
    }
}

// ===== AGREGAR TRIGGER DE CARGA INFINITA =====
function addLoadMoreTrigger() {
    // Eliminar trigger anterior si existe
    const existingTrigger = DOM.grid.querySelector('.load-more-trigger');
    if (existingTrigger) existingTrigger.remove();
    
    // Crear elemento centinela (el que activará la carga)
    const sentinel = document.createElement('div');
    sentinel.className = 'col-12 text-center py-4 load-more-trigger';
    sentinel.innerHTML = `
        <div class="d-flex justify-content-center align-items-center gap-3">
            <div class="spinner-border spinner-border-sm text-info" role="status"></div>
            <span class="text-info-emphasis">Cargando más juegos retro...</span>
        </div>
    `;
    DOM.grid.appendChild(sentinel);
    
    // Configurar Intersection Observer para detectar cuando el usuario llega al final
    if (observer) observer.disconnect();
    
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading) {
            loadMoreGames();
        }
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px 200px 0px' // Activar un poco antes de llegar al final
    });
    
    observer.observe(sentinel);
}

// ===== CARGAR MÁS JUEGOS =====
async function loadMoreGames() {
    if (isLoading) return;
    
    isLoading = true;
    
    // Simular un pequeño retraso para mejor experiencia (opcional)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    currentPage++;
    renderGames(false); // false = no resetear, solo agregar más
    
    isLoading = false;
}

// ===== RESET Y REINICIAR LAZY LOADING =====
function resetAndRender() {
    currentPage = 1;
    if (observer) observer.disconnect();
    renderGames(true);
}

// ===== EVENTOS =====
let debounceTimeout;
DOM.search.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        searchQuery = e.target.value;
        resetAndRender(); // Resetear y aplicar búsqueda
    }, 300);
});

// ===== INICIALIZACIÓN =====
loadGames();

// Opcional: Recargar cuando cambie el tamaño de la ventana (para ajustar GAMES_PER_PAGE)
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Solo recargar si la cantidad por página cambió
        const newGamesPerPage = window.innerWidth < 768 ? 6 : 12;
        if (newGamesPerPage !== GAMES_PER_PAGE) {
            location.reload(); // Recargar para aplicar nuevo tamaño
        }
    }, 250);
});