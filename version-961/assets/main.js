(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupHeader() {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (header) {
      var update = function () {
        if (window.scrollY > 20) {
          header.classList.add("is-scrolled");
        } else {
          header.classList.remove("is-scrolled");
        }
      };
      update();
      window.addEventListener("scroll", update, { passive: true });
    }

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
        if (header) {
          header.classList.toggle("menu-open", menu.classList.contains("open"));
        }
      });
    }
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupRails() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-rail-button]"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var id = button.getAttribute("data-rail-target");
        var rail = document.getElementById(id);
        var direction = button.getAttribute("data-rail-button") === "left" ? -1 : 1;
        if (rail) {
          rail.scrollBy({
            left: direction * 420,
            behavior: "smooth"
          });
        }
      });
    });
  }

  function readQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) {
      return;
    }

    var search = panel.querySelector("[data-search-input]");
    var category = panel.querySelector("[data-category-filter]");
    var region = panel.querySelector("[data-region-filter]");
    var year = panel.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    if (search && readQueryValue("q")) {
      search.value = readQueryValue("q");
    }

    function lower(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var query = lower(search ? search.value : "");
      var selectedCategory = lower(category ? category.value : "");
      var selectedRegion = lower(region ? region.value : "");
      var selectedYear = lower(year ? year.value : "");

      cards.forEach(function (card) {
        var haystack = lower([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-category"),
          card.getAttribute("data-genre")
        ].join(" "));
        var ok = true;

        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (selectedCategory && lower(card.getAttribute("data-category")) !== selectedCategory) {
          ok = false;
        }
        if (selectedRegion && lower(card.getAttribute("data-region")).indexOf(selectedRegion) === -1) {
          ok = false;
        }
        if (selectedYear && lower(card.getAttribute("data-year")).indexOf(selectedYear) === -1) {
          ok = false;
        }

        card.classList.toggle("is-hidden", !ok);
      });
    }

    [search, category, region, year].forEach(function (field) {
      if (field) {
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      }
    });

    apply();
  }

  function attachStream(video, stream) {
    if (!video || !stream) {
      return;
    }

    if (video.getAttribute("data-loaded-stream") === stream) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
      video.src = stream;
      video.setAttribute("data-loaded-stream", stream);
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (video.hlsController) {
        video.hlsController.destroy();
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsController = hls;
      video.setAttribute("data-loaded-stream", stream);
      return;
    }

    video.src = stream;
    video.setAttribute("data-loaded-stream", stream);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var stream = video ? video.getAttribute("data-stream") : "";

      function play() {
        attachStream(video, stream);
        var playRequest = video.play();
        player.classList.add("is-playing");
        if (playRequest && typeof playRequest.catch === "function") {
          playRequest.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0 || video.ended) {
            player.classList.remove("is-playing");
          }
        });
      }
    });
  }

  ready(function () {
    setupHeader();
    setupHero();
    setupRails();
    setupFilters();
    setupPlayers();
  });
})();
