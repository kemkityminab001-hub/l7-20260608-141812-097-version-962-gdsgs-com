(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
            document.body.classList.toggle('menu-open', mobileMenu.classList.contains('open'));
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (slides.length > 1) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                    restart();
                });
            });
            restart();
        }
    }

    function uniqueValues(cards, attribute) {
        var values = cards.map(function (card) {
            return card.getAttribute(attribute) || '';
        }).filter(Boolean);
        return Array.from(new Set(values)).sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-Hans-CN');
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    var forms = Array.from(document.querySelectorAll('[data-filter-form]'));

    forms.forEach(function (form) {
        var scope = form.closest('main') || document;
        var cards = Array.from(scope.querySelectorAll('[data-card]'));
        var search = form.querySelector('[data-filter-search]');
        var year = form.querySelector('[data-filter-year]');
        var region = form.querySelector('[data-filter-region]');
        var type = form.querySelector('[data-filter-type]');
        var empty = scope.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';

        fillSelect(year, uniqueValues(cards, 'data-year'));
        fillSelect(region, uniqueValues(cards, 'data-region'));
        fillSelect(type, uniqueValues(cards, 'data-type'));

        if (q && search) {
            search.value = q;
        }

        function applyFilter() {
            var keyword = search ? search.value.trim().toLowerCase() : '';
            var y = year ? year.value : '';
            var r = region ? region.value : '';
            var t = type ? type.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                var matched = true;
                matched = matched && (!keyword || text.indexOf(keyword) !== -1);
                matched = matched && (!y || card.getAttribute('data-year') === y);
                matched = matched && (!r || card.getAttribute('data-region') === r);
                matched = matched && (!t || card.getAttribute('data-type') === t);
                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible > 0;
            }
        }

        ['input', 'change'].forEach(function (eventName) {
            form.addEventListener(eventName, applyFilter);
        });

        form.addEventListener('submit', function (event) {
            if (cards.length > 0) {
                event.preventDefault();
                applyFilter();
            }
        });

        applyFilter();
    });
})();
