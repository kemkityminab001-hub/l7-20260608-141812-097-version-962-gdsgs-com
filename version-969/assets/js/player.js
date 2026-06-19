const playerNodes = Array.from(document.querySelectorAll('[data-player]'));

playerNodes.forEach((player) => {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');

  if (!video || !button) {
    return;
  }

  const stream = video.dataset.stream;
  let loaded = false;
  let loading = false;

  const attachStream = async () => {
    if (loaded || loading) {
      return;
    }

    loading = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      loaded = true;
      loading = false;
      return;
    }

    try {
      const module = await import('./video-dru42stk.js');
      const Hls = module.H;

      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        player.hls = hls;
      } else {
        video.src = stream;
      }
    } catch (error) {
      video.src = stream;
    }

    loaded = true;
    loading = false;
  };

  const play = async () => {
    await attachStream();
    player.classList.add('is-playing');
    video.setAttribute('controls', 'controls');

    try {
      await video.play();
    } catch (error) {
      player.classList.remove('is-playing');
    }
  };

  button.addEventListener('click', play);
});
