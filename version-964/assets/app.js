(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var index = 0;
        if (!slides.length) {
            return;
        }
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function initFeatureCarousel() {
        selectAll("[data-feature-carousel]").forEach(function (carousel) {
            var slides = selectAll("[data-feature-slide]", carousel);
            var prev = carousel.querySelector("[data-feature-prev]");
            var next = carousel.querySelector("[data-feature-next]");
            var current = 0;
            if (!slides.length) {
                return;
            }
            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
            }
            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                });
            }
            window.setInterval(function () {
                show(current + 1);
            }, 6000);
        });
    }

    function initSearch() {
        var input = document.querySelector("[data-search-input]");
        var results = document.querySelector("[data-search-results]");
        var form = document.querySelector("[data-search-form]");
        var data = window.MOVIE_SEARCH_DATA || [];
        if (!input || !results || !data.length) {
            return;
        }
        function render(query) {
            var keyword = query.trim().toLowerCase();
            if (!keyword) {
                results.classList.remove("is-open");
                results.innerHTML = "";
                return;
            }
            var list = data.filter(function (item) {
                return [item.title, item.region, item.type, item.year, item.genre, item.tags].join(" ").toLowerCase().indexOf(keyword) > -1;
            }).slice(0, 14);
            if (!list.length) {
                results.classList.add("is-open");
                results.innerHTML = '<div class="empty-state is-visible">暂未找到匹配影片</div>';
                return;
            }
            results.classList.add("is-open");
            results.innerHTML = list.map(function (item) {
                return '<a href="' + escapeHtml(item.url) + '">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
                    '<div><h3>' + escapeHtml(item.title) + '</h3>' +
                    '<p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</p></div>' +
                    '</a>';
            }).join("");
        }
        input.addEventListener("input", function () {
            render(input.value);
        });
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var first = results.querySelector("a");
                if (first) {
                    window.location.href = first.getAttribute("href");
                }
            });
        }
        document.addEventListener("click", function (event) {
            if (!results.contains(event.target) && event.target !== input) {
                results.classList.remove("is-open");
            }
        });
    }

    function initFilters() {
        selectAll("[data-filter-box]").forEach(function (box) {
            var scope = box.closest("main") || document;
            var cards = selectAll("[data-movie-card]", scope);
            var keyword = box.querySelector("[data-filter-keyword]");
            var year = box.querySelector("[data-filter-year]");
            var type = box.querySelector("[data-filter-type]");
            var empty = scope.querySelector("[data-empty-state]");
            function matchYear(card, value) {
                if (!value) {
                    return true;
                }
                var cardYear = parseInt(card.getAttribute("data-year"), 10) || 0;
                if (value === "2019") {
                    return cardYear <= 2019;
                }
                return String(cardYear) === value;
            }
            function apply() {
                var q = (keyword && keyword.value || "").trim().toLowerCase();
                var y = year && year.value || "";
                var t = type && type.value || "";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre")
                    ].join(" ").toLowerCase();
                    var ok = (!q || haystack.indexOf(q) > -1) && matchYear(card, y) && (!t || card.getAttribute("data-type") === t);
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            [keyword, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileNav();
        initHero();
        initFeatureCarousel();
        initSearch();
        initFilters();
    });
}());
