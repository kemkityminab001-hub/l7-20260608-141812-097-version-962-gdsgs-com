(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function toggleMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5600);
    }

    function setupFeatured() {
        var carousel = document.querySelector("[data-featured-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".featured-slide"));
        var prev = carousel.querySelector("[data-featured-prev]");
        var next = carousel.querySelector("[data-featured-next]");
        var index = 0;
        function show(value) {
            if (!slides.length) {
                return;
            }
            index = (value + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
            });
        }
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupRails() {
        document.querySelectorAll("[data-scroll-left]").forEach(function (button) {
            button.addEventListener("click", function () {
                var target = document.getElementById(button.getAttribute("data-scroll-left"));
                if (target) {
                    target.scrollBy({ left: -420, behavior: "smooth" });
                }
            });
        });
        document.querySelectorAll("[data-scroll-right]").forEach(function (button) {
            button.addEventListener("click", function () {
                var target = document.getElementById(button.getAttribute("data-scroll-right"));
                if (target) {
                    target.scrollBy({ left: 420, behavior: "smooth" });
                }
            });
        });
    }

    function setupSearch() {
        var source = Array.isArray(window.MOVIE_SEARCH_INDEX) ? window.MOVIE_SEARCH_INDEX : MOVIE_SEARCH_INDEX;
        document.querySelectorAll("[data-site-search]").forEach(function (form) {
            var input = form.querySelector("[data-search-input]");
            var panel = form.querySelector("[data-search-results]");
            if (!input || !panel || !source) {
                return;
            }
            function render() {
                var value = input.value.trim().toLowerCase();
                if (!value) {
                    panel.classList.remove("is-open");
                    panel.innerHTML = "";
                    return;
                }
                var words = value.split(/\s+/).filter(Boolean);
                var results = source.filter(function (item) {
                    var haystack = item.search.toLowerCase();
                    return words.every(function (word) {
                        return haystack.indexOf(word) !== -1;
                    });
                }).slice(0, 12);
                panel.innerHTML = results.map(function (item) {
                    return '<a class="search-result" href="./' + item.file + '">' +
                        '<strong>' + item.title + '</strong>' +
                        '<em>' + item.line + '</em>' +
                        '<span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span>' +
                        '</a>';
                }).join("");
                panel.classList.toggle("is-open", results.length > 0);
            }
            input.addEventListener("input", render);
            input.addEventListener("focus", render);
            form.addEventListener("submit", function (event) {
                var first = panel.querySelector("a");
                if (first) {
                    event.preventDefault();
                    window.location.href = first.href;
                }
            });
            document.addEventListener("click", function (event) {
                if (!form.contains(event.target)) {
                    panel.classList.remove("is-open");
                }
            });
            var query = new URLSearchParams(window.location.search).get("q");
            if (query && form.classList.contains("large-search")) {
                input.value = query;
                render();
            }
        });
    }

    function setupPlayers() {
        document.querySelectorAll(".player-shell").forEach(function (shell) {
            var video = shell.querySelector("video");
            var cover = shell.querySelector(".player-cover");
            var stream = shell.getAttribute("data-stream");
            var hls = null;
            if (!video || !stream) {
                return;
            }
            function bind() {
                if (video.getAttribute("data-bound") === "1") {
                    return;
                }
                video.setAttribute("data-bound", "1");
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else {
                    video.src = stream;
                }
            }
            function start() {
                bind();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }
            if (cover) {
                cover.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (video.getAttribute("data-bound") !== "1") {
                    start();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        toggleMenu();
        setupHero();
        setupFeatured();
        setupRails();
        setupSearch();
        setupPlayers();
    });
})();
