import { openDetails } from './details.js';
import { toggle, watchlist } from './state.js';

/**
 * C2. Підключає кнопки карток у списку #results: «До списку» додає серіал до мого списку або
 * прибирає з нього, «Детальніше» відкриває діалог (openDetails з details.js). main.js викликає
 * цю функцію один раз, після першого показу списку. Специфікація — ТЗ, C2.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initList(refresh) {
  const results = document.querySelector('#results');
  const count = document.querySelector('#watchlist-count');
  if (!results || !count) {
    throw new Error('Не знайдено #results або #watchlist-count');
  }

  results.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest('button[data-action]');
    const card = button?.closest('li[data-id]');
    if (!button || !card || !results.contains(card)) return;

    const id = Number(card.dataset.id);
    if (!Number.isInteger(id)) return;

    if (button.dataset.action === 'toggle') {
      const inWatchlist = toggle(id);
      count.textContent = String(watchlist.size);
      const cards = [...results.children];
      const previousIndex = cards.indexOf(card);
      refresh();

      const updatedButton = results.querySelector(
        `li[data-id="${id}"] [data-action="toggle"]`,
      );
      if (updatedButton) {
        updatedButton.focus();
      } else if (!inWatchlist) {
        const nextId = cards.slice(previousIndex + 1).map((item) => item.getAttribute('data-id'));
        const previousId = cards.slice(0, previousIndex).reverse().map((item) => item.getAttribute('data-id'));
        const neighbor = [...nextId, ...previousId].find(
          (neighborId) => neighborId && results.querySelector(`li[data-id="${neighborId}"]`),
        );
        const neighborButton = neighbor
          ? results.querySelector(`li[data-id="${neighbor}"] [data-action="toggle"]`)
          : null;
        if (neighborButton) {
          neighborButton.focus();
        } else {
          const heading = document.querySelector('#results-heading');
          if (!heading) throw new Error('Не знайдено #results-heading');
          heading.tabIndex = -1;
          heading.focus();
        }
      }
    } else if (button.dataset.action === 'details') {
      openDetails(id);
    }
  });
}
