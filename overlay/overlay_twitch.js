function checkForEmbeds() {
  if(removeIcons)
    return;
  if (!(host.indexOf('twitch.tv') > -1)) return;

  // twitch channel list Page
  //
  //let twitchStreamItems = Array.from(document.querySelectorAll('.streams-grid .thumb'));
  let twitchStreamItems = Array.from(document.querySelectorAll('.tw-thumbnail-card'));
  if (twitchStreamItems.length) {
    twitchStreamItems.forEach(twitchStreamHandler);
  }

  // twitch video list Page
  let twitchVodItems = Array.from(document.querySelectorAll('.video-preview-card'));
  if (twitchVodItems.length) {
    twitchVodItems.forEach(twitchVodHandler);
  }

  // twitch Watch Page
  let twitchWatchContainer = document.querySelector('.player');
  if (twitchWatchContainer) {
    twitchWatchHandler(twitchWatchContainer);
  }
}

function twitchStreamHandler(el) {
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;

  el.classList.add('popupvideo__overlay__wrapper');
  let thumbnail = el.querySelector('.tw-card-img');

  let tmp = getTemplate();
  tmp.addEventListener('click', ev => {
    evNoop(ev);
    let urlEl = el.querySelector('a[data-a-target="tw-thumbnail-card-link"]');
    if (urlEl && urlEl.getAttribute('href')) {
      sendMessageToAddon({
        action: 'launchVideo',
        url: urlEl.href,
        domain: 'twitch.tv'
      });
    } else console.error('Error parsing url from Twitch stream list page', el); // eslint-disable-line no-console
  });
  thumbnail.appendChild(tmp);
}

function twitchVodHandler(el) {
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;

  el.classList.add('popupvideo__overlay__wrapper');
  let thumbnail = el.querySelector('.full-width');

  let tmp = getTemplate();
  tmp.addEventListener('click', ev => {
    evNoop(ev);
    let urlEl = el.querySelector('a[data-a-target="video-preview-card-image-link"]');
    //let urlEl = el.parentNode;
    if (urlEl && urlEl.getAttribute('href')) {
      sendMessageToAddon({
        action: 'launchVideo',
        url: urlEl.href,
        domain: 'twitch.tv'
      });
    } else console.error('Error parsing url from Twitch stream list page', el); // eslint-disable-line no-console
  });
  thumbnail.appendChild(tmp);
}

function twitchWatchHandler(el) {
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
      domain: 'twitch.tv',
      time: videoEl.currentTime
    });
  });
  el.appendChild(tmp);
}
