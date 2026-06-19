document.addEventListener("DOMContentLoaded", function () {
  setupMenu();
  setupSearchForms();
  setupHero();
  setupCatalogTools();
  setupPlayers();
});

function setupMenu() {
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav-links");
  var search = document.querySelector(".header-inner .site-search");
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener("click", function () {
    nav.classList.toggle("is-open");
    if (search) {
      search.classList.toggle("is-open");
    }
  });
}

function setupSearchForms() {
  document.querySelectorAll("form.site-search").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        input && input.focus();
      }
    });
  });
}

function setupHero() {
  var hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
  var prev = hero.querySelector(".hero-control.prev");
  var next = hero.querySelector(".hero-control.next");
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
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
  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      show(dotIndex);
      start();
    });
  });
  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  show(0);
  start();
}

function setupCatalogTools() {
  document.querySelectorAll("[data-catalog]").forEach(function (catalog) {
    var input = catalog.querySelector(".local-search");
    var buttons = Array.prototype.slice.call(catalog.querySelectorAll("[data-filter]"));
    var cards = Array.prototype.slice.call(catalog.querySelectorAll(".movie-card, .rank-card"));
    var empty = catalog.querySelector(".no-results");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input && query) {
      input.value = query;
    }

    function selectedFilter() {
      var current = buttons.find(function (button) {
        return button.classList.contains("is-active");
      });
      return current ? current.getAttribute("data-filter") : "all";
    }

    function matchesFilter(card, filter) {
      var text = (card.getAttribute("data-search") || "").toLowerCase();
      var type = (card.getAttribute("data-type") || "").toLowerCase();
      var region = (card.getAttribute("data-region") || "").toLowerCase();
      if (filter === "all") {
        return true;
      }
      if (filter === "movie") {
        return type.indexOf("电影") !== -1;
      }
      if (filter === "series") {
        return type.indexOf("剧") !== -1;
      }
      if (filter === "animation") {
        return type.indexOf("动画") !== -1 || text.indexOf("动画") !== -1 || text.indexOf("动漫") !== -1;
      }
      if (filter === "domestic") {
        return region.indexOf("中国") !== -1 || region.indexOf("国产") !== -1 || text.indexOf("国产") !== -1;
      }
      if (filter === "asian") {
        return region.indexOf("韩国") !== -1 || region.indexOf("日本") !== -1 || region.indexOf("日韩") !== -1 || text.indexOf("日韩") !== -1;
      }
      if (filter === "western") {
        return region.indexOf("欧美") !== -1 || region.indexOf("美国") !== -1 || region.indexOf("英国") !== -1 || text.indexOf("欧美") !== -1;
      }
      return text.indexOf(filter.toLowerCase()) !== -1;
    }

    function apply() {
      var value = input ? input.value.trim().toLowerCase() : "";
      var filter = selectedFilter();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var ok = (!value || text.indexOf(value) !== -1) && matchesFilter(card, filter);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        apply();
      });
    });

    if (input) {
      input.addEventListener("input", apply);
    }
    apply();
  });
}

function setupPlayers() {
  document.querySelectorAll("[data-player]").forEach(function (shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var source = shell.getAttribute("data-src");
    var started = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function start() {
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.load();
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        return;
      }
      video.src = source;
      video.load();
      playVideo();
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
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
