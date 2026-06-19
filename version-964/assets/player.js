(function () {
    function initPlayer() {
        var video = document.getElementById("moviePlayer");
        var layer = document.getElementById("playLayer");
        var playButton = document.getElementById("playButton");
        var streamUrl = window.__PLAYER_STREAM__;
        var hlsInstance = null;
        var prepared = false;
        if (!video || !streamUrl) {
            return;
        }
        function prepare() {
            if (prepared) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            prepared = true;
        }
        function start() {
            prepare();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    video.setAttribute("controls", "controls");
                });
            }
        }
        if (layer) {
            layer.addEventListener("click", start);
        }
        if (playButton) {
            playButton.addEventListener("click", function (event) {
                event.stopPropagation();
                start();
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
    document.addEventListener("DOMContentLoaded", initPlayer);
}());
