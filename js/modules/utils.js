export const genreNames = {
  all: "🎲 Todos",
  estrategia: "⚔️ Estrategia",
  rpg: "🧙 RPG",
  shooter: "🔫 Shooter",
  aventura: "🗺️ Aventura",
  simulacion: "🏎️ Simulación",
  deportes: "🏅 Deportes"
};

export const GAMES_PER_PAGE = window.innerWidth < 768 ? 6 : 12;

export const escapeHtml = (str) => str?.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])) || "";

export const getGenreLabel = (genre) => genreNames[genre] || genre;
