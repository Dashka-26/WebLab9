import { getShow, notes, saveNote } from './state.js';

/** @type {number | undefined} */
let currentShowId;

/**
 * C4. Відкриває діалог #details для серіалу: назва, опис, посилання на сторінку TVmaze і форма
 * з моєю оцінкою й нотаткою. Специфікація — ТЗ, C4.
 *
 * @param {number} id
 */
export function openDetails(id) {
  const show = getShow(id);
  const dialog = document.querySelector('#details');
  const title = document.querySelector('#details-title');
  const summary = document.querySelector('#details-summary');
  const link = document.querySelector('#details-link');
  const form = document.querySelector('#note-form');
  const rating = document.querySelector('#note-rating');
  const note = document.querySelector('#note-text');
  const error = document.querySelector('#note-rating-error');

  if (
    !(dialog instanceof HTMLDialogElement) ||
    !title ||
    !summary ||
    !(link instanceof HTMLAnchorElement) ||
    !(form instanceof HTMLFormElement) ||
    !(rating instanceof HTMLInputElement) ||
    !(note instanceof HTMLTextAreaElement) ||
    !error
  ) {
    throw new Error('Не знайдено діалог #details або його поля');
  }

  currentShowId = id;
  title.textContent = show.name;
  summary.replaceChildren();
  const parsed = new DOMParser().parseFromString(show.summary, 'text/html');
  for (const sourceParagraph of parsed.body.children) {
    const paragraph = document.createElement('p');
    paragraph.textContent = sourceParagraph.textContent;
    summary.append(paragraph);
  }
  link.href = show.url;

  const savedNote = notes.get(id);
  rating.value = savedNote ? String(savedNote.rating) : '';
  note.value = savedNote?.text ?? '';
  error.textContent = '';
  rating.removeAttribute('aria-invalid');
  rating.removeAttribute('aria-describedby');
  form.noValidate = true;

  if (!dialog.open) dialog.showModal();
}

/**
 * C4. Підключає діалог #details: закриття й форму «Моя оцінка й нотатка». main.js викликає цю
 * функцію один раз. Специфікація — ТЗ, C4.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initDetails(refresh) {
  const dialog = document.querySelector('#details');
  const form = document.querySelector('#note-form');
  const rating = document.querySelector('#note-rating');
  const note = document.querySelector('#note-text');
  const error = document.querySelector('#note-rating-error');
  const cancel = form?.querySelector('button[type="button"]');
  const status = document.querySelector('#status');

  if (
    !(dialog instanceof HTMLDialogElement) ||
    !(form instanceof HTMLFormElement) ||
    !(rating instanceof HTMLInputElement) ||
    !(note instanceof HTMLTextAreaElement) ||
    !error ||
    !(cancel instanceof HTMLButtonElement) ||
    !status
  ) {
    throw new Error('Не знайдено діалог #details, форму нотатки або їхні поля');
  }

  form.noValidate = true;

  const clearError = () => {
    error.textContent = '';
    rating.removeAttribute('aria-invalid');
    rating.removeAttribute('aria-describedby');
  };

  const validateRating = () => {
    const value = rating.valueAsNumber;
    let message = '';
    if (rating.value === '') {
      message = 'Введіть оцінку від 1 до 10.';
    } else if (!Number.isInteger(value)) {
      message = 'Оцінка має бути цілим числом від 1 до 10.';
    } else if (value < 1 || value > 10) {
      message = 'Оцінка має бути від 1 до 10.';
    }

    error.textContent = message;
    if (message) {
      rating.setAttribute('aria-invalid', 'true');
      rating.setAttribute('aria-describedby', error.id);
    } else {
      clearError();
    }
    return !message;
  };

  rating.addEventListener('input', () => {
    if (rating.getAttribute('aria-invalid') === 'true') validateRating();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateRating()) {
      rating.focus();
      return;
    }

    if (currentShowId === undefined) {
      throw new Error('Не вибрано серіал для збереження нотатки');
    }
    const show = getShow(currentShowId);
    saveNote(currentShowId, { rating: rating.valueAsNumber, text: note.value });
    refresh();
    status.textContent = `Нотатку до ${show.name} збережено`;
    dialog.close();

    const detailsButton = document.querySelector(
      `#results li[data-id="${currentShowId}"] [data-action="details"]`,
    );
    if (detailsButton instanceof HTMLElement) {
      detailsButton.focus();
    } else {
      const heading = document.querySelector('#results-heading');
      if (!(heading instanceof HTMLElement)) throw new Error('Не знайдено #results-heading');
      heading.tabIndex = -1;
      heading.focus();
    }
  });

  cancel.addEventListener('click', () => dialog.close());
}
