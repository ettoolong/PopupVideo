// source code from another project:
// https://github.com/meandavejustice/min-vid
// https://github.com/meandavejustice/min-vid/blob/master/data/icon-overlay.js - commit[0b94ede]

const host = window.location.host;
let overlayCheckInterval;
let removeIcons = false;
let currentPrefs = {};
let positionList = ['topCenter', 'topLeft', 'topRight'];

browser.storage.local.get().then(results => {
  if ((typeof results.length === 'number') && (results.length > 0)) {
    results = results[0];
  }
  if (results.version) {
    currentPrefs = results;
  }
  if(currentPrefs.overlayIcon) {
    overlayCheckInterval = setInterval(checkForEmbeds, 3000);
  }
});

const storageChangeHandler = (changes, area) => {
  if(area === 'local') {
    let changedItems = Object.keys(changes);
    for (let item of changedItems) {
      currentPrefs[item] = changes[item].newValue;
      switch (item) {
        case 'overlayIcon':
          if(changes[item].newValue) {
            overlayCheckInterval = setInterval(checkForEmbeds, 3000);
          }
          else {
            clearInterval(overlayCheckInterval);
            Array.from(document.querySelectorAll('.popupvideo__overlay__wrapper')).forEach(removeOverlay);
          }
          break;
        case 'iconPosition':
          Array.from(document.querySelectorAll('.popupvideo__overlay__container')).forEach(setOverlayPosition);
          break;
      }
    }
  }
};
browser.storage.onChanged.addListener(storageChangeHandler);

const hideOverlayIcons = () => {
  Array.from(document.querySelectorAll('.popupvideo__overlay__container')).forEach(el => {
    el.classList.add('popupvideo__overlay__container__hide');
  });
};

const showOverlayIcons = () => {
  Array.from(document.querySelectorAll('.popupvideo__overlay__container')).forEach(el => {
    el.classList.remove('popupvideo__overlay__container__hide');
  });
};

const checkFullscreen = () => {
  //https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
  //https://developer.mozilla.org/en-US/docs/Web/API/Document/fullscreenElement
  //the default value 'full-screen-api.unprefix.enabled' in about:config still false?
  document.addEventListener('mozfullscreenchange', function(event) {
    if(document.mozFullScreen) {
      hideOverlayIcons();
    } else {
      showOverlayIcons();
    }
  }, false);
}

if(document.readyState === "complete") {
  checkFullscreen();
} else {
  window.addEventListener('load', event => {
    checkFullscreen();
  }, true);
}

const sendMessageToAddon = (message, cb) => {
  browser.runtime.sendMessage(message).then( response => {
    if(cb) {
      cb(response);
    }
  }, error => {});
};

function removeOverlay(el) {
  el.classList.remove('popupvideo__overlay__wrapper');
  let containerEl = el.querySelector('.popupvideo__overlay__container');
  if (containerEl) containerEl.remove();
}

function setOverlayPosition(el) {
  el.classList.remove(...positionList);
  el.classList.add(positionList[currentPrefs.iconPosition]);
}

// General Helpers
function getTemplate() {
  let containerEl = document.createElement('div');
  let iconEl = document.createElement('div');

  containerEl.className = 'popupvideo__overlay__container';
  containerEl.classList.add(positionList[currentPrefs.iconPosition]);
  iconEl.className = 'popupvideo__overlay__icon';

  containerEl.appendChild(iconEl);
  return containerEl;
}

function evNoop(ev) {
  ev.preventDefault();
  ev.stopImmediatePropagation();
}

function closeFullscreen() {
  if (document.mozFullScreenEnabled) {
    document.mozCancelFullScreen();
  }
}

sendMessageToAddon({action: 'init'}, response => {
  if(response.action === 'removeIcons')
    removeIcons = true;
});
