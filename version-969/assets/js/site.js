(() => {
  const body = document.body;
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
      body.classList.toggle('menu-open', mobilePanel.classList.contains('is-open'));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const thumbs = Array.from(hero.querySelectorAll('[data-hero-thumb]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const show = (index) => {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === current));
      dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === current));
      thumbs.forEach((thumb, thumbIndex) => thumb.classList.toggle('is-active', thumbIndex === current));
    };

    const start = () => {
      timer = window.setInterval(() => show(current + 1), 5600);
    };

    const restart = () => {
      window.clearInterval(timer);
      start();
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        show(index);
        restart();
      });
    });

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('mouseenter', () => {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(current + 1);
        restart();
      });
    }

    show(0);
    start();
  }

  const filterInput = document.querySelector('.filter-input');
  const filterSelects = Array.from(document.querySelectorAll('.filter-select'));
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const hint = document.querySelector('[data-result-hint]');
  const globalQueryInput = document.querySelector('#global-search-query');
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';

  if (globalQueryInput && query) {
    globalQueryInput.value = query;
  }

  if (filterInput && query) {
    filterInput.value = query;
  }

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const applyFilters = () => {
    if (!cards.length) {
      return;
    }

    const term = normalize(filterInput ? filterInput.value : '');
    const filters = {};

    filterSelects.forEach((select) => {
      filters[select.dataset.filter] = normalize(select.value);
    });

    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.tags,
        card.textContent,
      ].join(' '));
      const matchesTerm = !term || haystack.includes(term);
      const matchesYear = !filters.year || normalize(card.dataset.year).includes(filters.year);
      const matchesRegion = !filters.region || normalize(card.dataset.region).includes(filters.region);
      const matchesGenre = !filters.genre || normalize(card.dataset.genre).includes(filters.genre);
      const shouldShow = matchesTerm && matchesYear && matchesRegion && matchesGenre;

      card.classList.toggle('is-hidden', !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (hint) {
      hint.textContent = term || Object.values(filters).some(Boolean) ? `已筛选出 ${visible} 部影片` : '';
    }
  };

  if (cards.length && (filterInput || filterSelects.length)) {
    if (filterInput) {
      filterInput.addEventListener('input', applyFilters);
    }

    filterSelects.forEach((select) => select.addEventListener('change', applyFilters));
    applyFilters();
  }
})();
