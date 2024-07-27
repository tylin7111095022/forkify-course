import View from './view.js';
import icons from 'url:../../img/icons.svg'; // Parcel 2

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerclick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      // console.log(btn);
      const gotoPage = +btn.dataset.goto;
      handler(gotoPage);
    });
  }

  _generateMarkup() {
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultPerPage
    );
    const currentPage = this._data.page;
    let markup;

    if (currentPage === 1 && numPages > 1) {
      // Page 1, and there are other pages
      markup = `
      <button data-goto="${
        currentPage + 1
      }" class="btn--inline pagination__btn--next">
        <span>Page ${currentPage + 1}</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </button>`;
    } else if (currentPage === 1 && numPages === 1) {
      // Page 1, and there are no other pages
      markup = '';
    } else if (currentPage === numPages) {
      // Last page
      markup = `
      <button data-goto="${
        currentPage - 1
      }" class="btn--inline pagination__btn--prev">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${currentPage - 1}</span>
      </button>`;
    } else {
      // Other page
      markup = `
    <button data-goto="${
      currentPage - 1
    }" class="btn--inline pagination__btn--prev">
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-left"></use>
      </svg>
      <span>Page ${currentPage - 1}</span>
    </button>
    <button data-goto="${
      currentPage + 1
    }" class="btn--inline pagination__btn--next">
      <span>Page ${currentPage + 1}</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-right"></use>
      </svg>
    </button>`;
    }

    return markup;
  }
}

export default new PaginationView();
