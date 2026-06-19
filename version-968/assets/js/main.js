(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-nav]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
            document.body.classList.toggle("menu-open", panel.classList.contains("open"));
        });
    }

    function setupPageFilter() {
        var input = document.querySelector("[data-page-filter]");
        var list = document.querySelector("[data-filter-list]");
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                card.style.display = text.indexOf(keyword) > -1 ? "" : "none";
            });
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".player-cover");
            var stream = player.getAttribute("data-stream");
            var prepared = false;
            var hls = null;

            function prepare() {
                if (prepared || !video || !stream) {
                    return;
                }
                prepared = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                }
            }

            function start() {
                prepare();
                if (cover) {
                    cover.classList.add("hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (cover) {
                cover.addEventListener("click", start);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        start();
                    }
                });
            }
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    function resultCard(item) {
        return [
            '<a class="search-card" href="' + item.url + '">',
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<div>',
            '<h3>' + escapeHtml(item.title) + '</h3>',
            '<p>' + escapeHtml(item.oneLine) + '</p>',
            '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span>',
            '</div>',
            '</a>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var summary = document.querySelector("[data-search-summary]");
        var input = document.querySelector("[data-search-input]");
        if (!results || !summary || !window.SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get("q") || "").trim();
        if (input) {
            input.value = keyword;
        }
        if (!keyword) {
            results.innerHTML = "";
            return;
        }
        var lower = keyword.toLowerCase();
        var matches = window.SEARCH_DATA.filter(function (item) {
            return [item.title, item.year, item.region, item.genre, item.tags, item.oneLine]
                .join(" ")
                .toLowerCase()
                .indexOf(lower) > -1;
        }).slice(0, 120);
        summary.textContent = matches.length ? "已匹配到相关影片" : "没有匹配内容";
        results.innerHTML = matches.map(resultCard).join("");
    }

    ready(function () {
        setupMenu();
        setupPageFilter();
        setupPlayers();
        setupSearchPage();
    });
})();
