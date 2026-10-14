/** @typedef {import('./state.js').Filters} Filters */

function filterControls() {
  const form = document.querySelector('#filters');
  const query = form?.querySelector('[name="query"]');
  const genre = form?.querySelector('[name="genre"]');
  const mine = form?.querySelector('[name="mine"]');

  if (
    !(form instanceof HTMLFormElement) ||
    !(query instanceof HTMLInputElement) ||
    !(genre instanceof HTMLSelectElement) ||
    !(mine instanceof HTMLInputElement)
  ) {
    throw new Error('Не знайдено форму #filters або її поля');
  }

  return { form, query, genre, mine };
}

/**
 * C3. Повертає поточні значення форми фільтрів #filters. Поки C3 не виконано, фільтрів немає,
 * і список показує всі серіали. Специфікація — ТЗ, C3.
 *
 * @returns {Filters}
 */
export function readFilters() {
  const { query, genre, mine } = filterControls();
  return { query: query.value, genre: genre.value, mine: mine.checked };
}

/**
 * C3. Підключає форму фільтрів: після кожної зміни — refresh(). main.js викликає цю функцію
 * один раз. Специфікація — ТЗ, C3.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initFilters(refresh) {
  const { form, query, genre, mine } = filterControls();

  query.addEventListener('input', refresh);
  genre.addEventListener('change', refresh);
  mine.addEventListener('change', refresh);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    refresh();
  });

  form.addEventListener('reset', (event) => {
    event.preventDefault();
    query.value = query.defaultValue;
    genre.selectedIndex = 0;
    mine.checked = mine.defaultChecked;
    refresh();
  });
}
