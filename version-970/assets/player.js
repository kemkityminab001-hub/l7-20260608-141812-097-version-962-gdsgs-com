(function () {
    function initMoviePlayer(streamUrl) {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }

        var video = player.querySelector("video");
        var play = player.querySelector("[data-play]");
        var hlsInstance = null;
        var loaded = false;

        function loadVideo() {
            if (!video || !streamUrl) {
                return;
            }

            if (loaded) {
                video.play().catch(function () {});
                return;
            }

            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 60,
                    enableWorker: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            if (play) {
                play.classList.add("is-hidden");
            }

            video.controls = true;
            video.play().catch(function () {
                if (play) {
                    play.classList.remove("is-hidden");
                }
            });
        }

        if (play) {
            play.addEventListener("click", loadVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!loaded || video.paused) {
                    loadVideo();
                }
            });
            video.addEventListener("play", function () {
                if (play) {
                    play.classList.add("is-hidden");
                }
            });
            video.addEventListener("emptied", function () {
                if (hlsInstance && hlsInstance.destroy) {
                    hlsInstance.destroy();
                }
            });
        }
    }

    window.initMoviePlayer = initMoviePlayer;
})();
