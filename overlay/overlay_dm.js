function checkForEmbeds() {
  if(removeIcons)
    return;
  // dailymotion Home Page
  let dmHomeContainers = Array.from(document.querySelectorAll('.sd_video_preview'));
  if (dmHomeContainers.length) {
    dmHomeContainers.forEach(dmHomePageHandler);
  }

  // dailymotion Watch Page
  let dmWatchContainer = document.querySelector('.dmp_VideoView');
  if (dmWatchContainer) {
    dmWatchElementHandler(dmWatchContainer);
  }

}

function dmHomePageHandler(el) {
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;
  let url = el.getAttribute('data-id');

  el.classList.add('popupvideo__overlay__wrapper');
  let tmp = getTemplate();
  tmp.addEventListener('click', ev => {
    evNoop(ev);
    sendMessageToAddon({
      action: 'launchVideo',
      url: 'https://www.dailymotion.com/video/' + url,
      domain: 'dailymotion.com'
    });
  });
  el.appendChild(tmp);
}

function dmWatchElementHandler(el) {
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;

  el.classList.add('popupvideo__overlay__wrapper');
  let tmp = getTemplate();
  tmp.addEventListener('click', ev => {
    evNoop(ev);
    let videoEl = document.querySelector('video');
    //videoEl.pause();
    closeFullscreen();
    sendMessageToAddon({
      action: 'launchVideo',
      url: window.location.href,
      domain: 'dailymotion.com',
      time: videoEl.currentTime,
      volume: videoEl.volume,
      muted: videoEl.muted
    });
  }, true);
  el.appendChild(tmp);
}
