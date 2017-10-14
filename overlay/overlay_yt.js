function checkForEmbeds() {
  if(removeIcons)
    return;
  if (!(host.indexOf('youtube.com') > -1)) return;

  // video
  let ytHomeContainers = Array.from(document.querySelectorAll('ytd-thumbnail'));
  if (ytHomeContainers.length) {
    ytHomeContainers.forEach(ytHomePageHandler);
  }

  // YouTube Watch Page
  let ytWatchContainer = document.querySelector('.html5-video-player');
  if (ytWatchContainer) {
    ytWatchElementHandler(ytWatchContainer);
  }

  // YouTube Playlist
  let ytPlaylistContainers = Array.from(document.querySelectorAll('ytd-playlist-thumbnail'));
  if (ytPlaylistContainers.length) {
    ytPlaylistContainers.forEach(ytPlaylistHandler);
  }
}

function ytHomePageHandler(el) {
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;

  let urlEl = el.querySelector('a.ytd-thumbnail');
  if (!urlEl || !urlEl.getAttribute('href')) return;

  let url = urlEl.getAttribute('href');

  if (!url.startsWith('/watch')) return;

  el.classList.add('popupvideo__overlay__wrapper');
  let tmp = getTemplate();
  tmp.addEventListener('click', ev => {
    evNoop(ev);
    sendMessageToAddon({
      action: 'launchVideo',
      url: 'https://youtube.com' + url,
      domain: 'youtube.com'
    });
  });
  el.appendChild(tmp);
}

function ytPlaylistHandler(el) {
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;

  let urlEl = el.querySelector('a.ytd-playlist-thumbnail');
  if (!urlEl || !urlEl.getAttribute('href')) return;

  let url = urlEl.getAttribute('href');

  if (!url.startsWith('/watch')) return;

  el.classList.add('popupvideo__overlay__wrapper');
  let tmp = getTemplate();
  tmp.addEventListener('click', ev => {
    evNoop(ev);
    sendMessageToAddon({
      action: 'launchVideo',
      url: 'https://youtube.com' + url,
      domain: 'youtube.com'
    });
  });
  el.appendChild(tmp);
}

function ytWatchElementHandler(el) {
  if (!window.location.pathname.startsWith('/watch')) return;

  if (el.classList.contains('popupvideo__overlay__wrapper')) return;
  el.classList.add('popupvideo__overlay__wrapper');
  let tmp = getTemplate();
  tmp.addEventListener('click', ev => {
    evNoop(ev);
    let videoEl = document.querySelector('video');
    videoEl.pause();
    closeFullscreen();
    sendMessageToAddon({
      action: 'launchVideo',
      url: window.location.href,
      domain: 'youtube.com',
      time: videoEl.currentTime,
      volume: videoEl.volume,
      muted: videoEl.muted
    });
  });
  el.appendChild(tmp);
}
