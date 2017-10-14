function checkForEmbeds() {
  if(removeIcons)
    return;
  if (!(host.indexOf('vimeo.com') > -1)) return;

  // VIMEO LOGGED-OUT HOME PAGE
  let vimeoDefaultHomeContainers = Array.from(document.querySelectorAll('.iris_video-vital__overlay'));
  if (vimeoDefaultHomeContainers.length) {
    vimeoDefaultHomeContainers.forEach(el => {
      if (el.classList.contains('popupvideo__overlay__wrapper')) return;

      el.classList.add('popupvideo__overlay__wrapper');
      let tmp = getTemplate();
      tmp.addEventListener('click', ev => {
        evNoop(ev);
        sendMessageToAddon({
          action: 'launchVideo',
          url: el.href,
          domain: 'vimeo.com'
        });
      }, true);
      el.appendChild(tmp);
    });
  }

  // VIMEO LOGGED-IN HOME PAGE
  let vimeoHomeContainers = Array.from(document.querySelectorAll('.player_wrapper'));
  if (vimeoHomeContainers.length) {
    vimeoHomeContainers.forEach(el => {
      if (el.classList.contains('popupvideo__overlay__wrapper')) return;

      el.classList.add('popupvideo__overlay__wrapper');
      let tmp = getTemplate();
      tmp.addEventListener('click', ev => {
        evNoop(ev);
        let fauxEl = el.querySelector('.faux_player');
        if (fauxEl) {
          sendMessageToAddon({
            action: 'launchVideo',
            url: 'https://vimeo.com/' + fauxEl.getAttribute('data-clip-id'),
            domain: 'vimeo.com'
          });
        } else console.error('Error: failed to locate vimeo url'); // eslint-disable-line no-console
      }, true);
      el.appendChild(tmp);
    });
  }

  // VIMEO DETAIL PAGE
  let vimeoDetailContainer = document.querySelector('.player_container');
  if (vimeoDetailContainer) {
    if (vimeoDetailContainer.classList.contains('popupvideo__overlay__wrapper')) return;
    vimeoDetailContainer.classList.add('popupvideo__overlay__wrapper');
    let videoEl = vimeoDetailContainer.querySelector('video');
    let tmp = getTemplate();
    tmp.addEventListener('mouseup', evNoop);
    tmp.addEventListener('click', ev => {
      evNoop(ev);
      videoEl.pause();
      sendMessageToAddon({
        action: 'launchVideo',
        url: window.location.href,
        domain: 'vimeo.com',
        volume: videoEl.volume,
        muted: videoEl.muted
      });
    }, true);
    vimeoDetailContainer.appendChild(tmp);
  }
}
