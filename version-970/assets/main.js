(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    }

    var homeInput = document.querySelector("[data-home-search]");
    var homeLink = document.querySelector("[data-home-search-link]");
    if (homeInput && homeLink) {
        function setHomeLink() {
            var query = homeInput.value.trim();
            homeLink.href = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
        }

        homeInput.addEventListener("input", setHomeLink);
        homeInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                setHomeLink();
                window.location.href = homeLink.href;
            }
        });
        setHomeLink();
    }

    var list = document.querySelector("[data-filter-list]");
    if (list) {
        var input = document.querySelector("[data-filter-input]");
        var region = document.querySelector("[data-filter-region]");
        var type = document.querySelector("[data-filter-type]");
        var sort = document.querySelector("[data-filter-sort]");
        var reset = document.querySelector("[data-filter-reset]");
        var cards = Array.prototype.slice.call(list.querySelectorAll(".filter-card"));
        var params = new URLSearchParams(window.location.search);

        if (input && params.get("q")) {
            input.value = params.get("q");
        }

        function normalize(value) {
            return (value || "").toString().toLowerCase();
        }

        function applyFilters() {
            var query = normalize(input ? input.value.trim() : "");
            var regionValue = region ? region.value : "";
            var typeValue = type ? type.value : "";

            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.category
                ].join(" "));
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (regionValue && card.dataset.region !== regionValue) {
                    matched = false;
                }
                if (typeValue && card.dataset.type !== typeValue) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";
            });
        }

        function applySort() {
            var mode = sort ? sort.value : "year-desc";
            var ordered = cards.slice().sort(function (a, b) {
                if (mode === "title-asc") {
                    return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
                }

                var ay = parseInt(a.dataset.year || "0", 10);
                var by = parseInt(b.dataset.year || "0", 10);
                return mode === "year-asc" ? ay - by : by - ay;
            });

            ordered.forEach(function (card) {
                list.appendChild(card);
            });
            applyFilters();
        }

        [input, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        if (sort) {
            sort.addEventListener("change", applySort);
        }
        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (region) {
                    region.value = "";
                }
                if (type) {
                    type.value = "";
                }
                if (sort) {
                    sort.value = "year-desc";
                }
                applySort();
            });
        }

        applySort();
    }
})();
