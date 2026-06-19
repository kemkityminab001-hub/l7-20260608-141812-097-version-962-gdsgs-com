(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    initHero();
    initFilters();
    initPlayers();
  });

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
        play();
      });
    });

    if (slides.length > 1) {
      play();
    }
  }

  function textOf(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));

    bars.forEach(function (bar) {
      var scope = bar.closest("section") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-state]");
      var search = bar.querySelector("[data-filter-search]");
      var year = bar.querySelector("[data-filter-year]");
      var region = bar.querySelector("[data-filter-region]");
      var genre = bar.querySelector("[data-filter-genre]");

      function apply() {
        var q = textOf(search && search.value);
        var y = textOf(year && year.value);
        var r = textOf(region && region.value);
        var g = textOf(genre && genre.value);
        var visible = 0;

        cards.forEach(function (card) {
          var title = textOf(card.getAttribute("data-title"));
          var cardYear = textOf(card.getAttribute("data-year"));
          var cardRegion = textOf(card.getAttribute("data-region"));
          var cardGenre = textOf(card.getAttribute("data-genre"));
          var allText = textOf(card.textContent);
          var matched = true;

          if (q && title.indexOf(q) === -1 && allText.indexOf(q) === -1) {
            matched = false;
          }

          if (y && cardYear !== y) {
            matched = false;
          }

          if (r && cardRegion.indexOf(r) === -1) {
            matched = false;
          }

          if (g && cardGenre.indexOf(g) === -1 && allText.indexOf(g) === -1) {
            matched = false;
          }

          card.hidden = !matched;

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [search, year, region, genre].forEach(function (input) {
        if (input) {
          input.addEventListener("input", apply);
          input.addEventListener("change", apply);
        }
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var stream = video ? video.getAttribute("data-stream") : "";
      var hlsInstance = null;

      if (!video || !stream) {
        return;
      }

      function bindSource() {
        if (video.getAttribute("data-ready") === "1") {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }

        video.setAttribute("data-ready", "1");
      }

      function start() {
        bindSource();

        if (button) {
          button.classList.add("is-hidden");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }
})();
