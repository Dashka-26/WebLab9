/** @typedef {import('./state.js').Show} Show */
import { notes, shows, watchlist } from './state.js';

/**
 * C1. Показує серіали в списку #results — по картці з шаблону #show-card на кожен, у тому
 * самому порядку, — і оновлює рядок статусу #status. Специфікація — ТЗ, C1.
 *
 * @param {readonly Show[]} list серіали, які треба показати
 */
export function renderShows(list) {
  const results = document.querySelector('#results');
  const status = document.querySelector('#status');
  const template = document.querySelector('#show-card');
  const cardTemplate = template?.content.firstElementChild;

  if (!results || !status || !cardTemplate) {
    throw new Error('Не знайдено #results, #status або шаблон #show-card');
  }

  const cards = document.createDocumentFragment();
  for (const show of list) {
    const card = /** @type {HTMLElement} */ (cardTemplate.cloneNode(true));
    card.dataset.id = String(show.id);
    card.querySelectorAll('[data-field="name"]').forEach((field) => {
      field.textContent = show.name;
    });
    const year = card.querySelector('[data-field="year"]');
    const genres = card.querySelector('[data-field="genres"]');
    const rating = card.querySelector('[data-field="rating"]');
    if (!year || !genres || !rating) {
      throw new Error('У шаблоні #show-card відсутнє поле року, жанрів або оцінки');
    }
    year.textContent = show.year ?? '—';
    genres.textContent = show.genres.length ? show.genres.join(', ') : '—';
    rating.textContent = show.rating ?? '—';

    const note = notes.get(show.id);
    const myRating = card.querySelector('[data-field="my-rating"]');
    const myRatingRow = card.querySelector('.card__mine');
    const noteText = card.querySelector('[data-field="note"]');
    if (myRating && myRatingRow && note) {
      myRating.textContent = String(note.rating);
      myRatingRow.hidden = false;
    }
    if (noteText && note?.text) {
      noteText.textContent = note.text;
      noteText.hidden = false;
    }

    const toggle = card.querySelector('[data-action="toggle"]');
    if (!toggle) throw new Error('У шаблоні #show-card відсутня кнопка «До списку»');
    toggle.setAttribute('aria-pressed', String(watchlist.has(show.id)));
    cards.append(card);
  }

  results.replaceChildren(cards);
  status.textContent = list.length
    ? `Знайдено: ${list.length} з ${shows.length}`
    : 'Нічого не знайдено';
}
