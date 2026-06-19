(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobilePanel = document.querySelector("[data-mobile-panel]");
        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                mobilePanel.classList.toggle("open");
                document.body.classList.toggle("menu-open", mobilePanel.classList.contains("open"));
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;
        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === activeIndex);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5600);
        }

        var rail = document.querySelector("[data-rail]");
        var left = document.querySelector("[data-scroll-left]");
        var right = document.querySelector("[data-scroll-right]");
        if (rail && left && right) {
            left.addEventListener("click", function () {
                rail.scrollBy({ left: -420, behavior: "smooth" });
            });
            right.addEventListener("click", function () {
                rail.scrollBy({ left: 420, behavior: "smooth" });
            });
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }
        function filterCards(query) {
            var text = normalize(query);
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-category"),
                    card.textContent
                ].join(" "));
                card.classList.toggle("hidden", text && haystack.indexOf(text) === -1);
            });
        }
        searchInputs.forEach(function (input) {
            input.addEventListener("input", function () {
                filterCards(input.value);
            });
        });
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
        var allButton = document.querySelector("[data-filter-all]");
        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                searchInputs.forEach(function (input) {
                    input.value = button.getAttribute("data-filter-category") || "";
                });
                filterCards(button.getAttribute("data-filter-category"));
                filterButtons.forEach(function (item) {
                    item.classList.remove("active");
                });
                button.classList.add("active");
                if (allButton) {
                    allButton.classList.remove("active");
                }
            });
        });
        if (allButton) {
            allButton.addEventListener("click", function () {
                searchInputs.forEach(function (input) {
                    input.value = "";
                });
                filterCards("");
                filterButtons.forEach(function (button) {
                    button.classList.remove("active");
                });
                allButton.classList.add("active");
            });
        }

        Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            var stream = player.getAttribute("data-stream");
            var started = false;
            var hls = null;
            function beginPlayback() {
                if (!video || !stream) {
                    return;
                }
                if (overlay) {
                    overlay.classList.add("hidden");
                }
                if (!started) {
                    started = true;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = stream;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new Hls();
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                    } else {
                        video.src = stream;
                    }
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }
            if (overlay) {
                overlay.addEventListener("click", beginPlayback);
            }
            Array.prototype.slice.call(player.querySelectorAll("[data-play]")).forEach(function (button) {
                button.addEventListener("click", beginPlayback);
            });
            if (video) {
                video.addEventListener("play", function () {
                    if (overlay) {
                        overlay.classList.add("hidden");
                    }
                });
            }
            window.addEventListener("pagehide", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    });
})();
