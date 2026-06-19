(function () {
    var blocks = Array.from(document.querySelectorAll('[data-player]'));

    blocks.forEach(function (block) {
        var video = block.querySelector('video');
        var button = block.querySelector('[data-play-button]');
        var hlsInstance = null;

        if (!video || !button) {
            return;
        }

        function start() {
            var stream = video.getAttribute('data-stream');

            if (!stream) {
                return;
            }

            button.classList.add('is-hidden');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (video.src !== stream) {
                    video.src = stream;
                }
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.play().catch(function () {});
                }
                return;
            }

            if (video.src !== stream) {
                video.src = stream;
            }
            video.play().catch(function () {});
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
    });
})();
