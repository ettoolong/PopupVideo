let defaultPreference = {
  defaultPosition: 0,
  contextMenu: true,
  overlayIcon: true,
  resizable: true,
  alwaysTop: true,
  multiWindow: true,
  iconPosition: 2,
  privateBrowsing: false,
  windowWidth: 560,
  windowHeight: 320,
  version: 3
};
const oldVersionSizeMapping = [
  {width: 425, height:344},
  {width: 480, height:385},
  {width: 640, height:505},
  {width: 960, height:745},
  {width: 280, height:160},
  {width: 560, height:320},
  {width: 640, height:360},
  {width: 853, height:480},
  {width: 1280, height:745}
];

let preferences = {};
let menuId = null;

const storageChangeHandler = (changes, area) => {
  if(area === 'local') {
    let changedItems = Object.keys(changes);
    for (let item of changedItems) {
      preferences[item] = changes[item].newValue;
      switch (item) {
        case 'contextMenu':
          resetContextMenu();
          break;
      }
    }
  }
};

const loadPreference = () => {
  browser.storage.local.get().then(results => {
    if ((typeof results.length === 'number') && (results.length > 0)) {
      results = results[0];
    }
    if (!results.version) {
      preferences = defaultPreference;
      browser.storage.local.set(defaultPreference).then(res => {
        browser.storage.onChanged.addListener(storageChangeHandler);
      }, err => {
      });
    } else {
      preferences = results;
      browser.storage.onChanged.addListener(storageChangeHandler);
    }
    if (preferences.version !== defaultPreference.version) {
      let update = {};
      let needUpdate = false;
      for(let p in defaultPreference) {
        if(preferences[p] === undefined) {
          update[p] = defaultPreference[p];
          needUpdate = true;
        }
      }
      if(preferences.version<=2) {
        update.windowWidth = oldVersionSizeMapping[preferences.defaultSize].width;
        update.windowHeight = oldVersionSizeMapping[preferences.defaultSize].height;
      }

      if(needUpdate) {
        update.version = defaultPreference.version;
        browser.storage.local.set(update).then(null, err => {});
      }
    }
    resetContextMenu();
  });
};

const createContextMenu = () => {
  if (menuId !== null) {
    return;
  }

  menuId = browser.contextMenus.create({
    type: 'normal',
    title: browser.i18n.getMessage('contextMenuItemTitle'),
    // contexts: ['link','video'],
    targetUrlPatterns: [
      '*://*.youtube.com/watch*',
      '*://*.twitch.tv/*',
      '*://*.vimeo.com/*',
      '*://*.dailymotion.com/video/*',
      '*://*/*.mp4',
      '*://*/*.webm',
      '*://*/*.h264'],
    onclick: (data) => {
      //console.log(data);
      let url = '';
      if (data.mediaType === 'video' && data.srcUrl) {
        if(data.frameUrl)
          url = data.frameUrl;
        else
          url = data.srcUrl;
      }
      else if(data.linkUrl) {
        url = data.linkUrl;
      }
      launchVideo(url, preferences);
    }
  });
};

const resetContextMenu = () => {
  let createNew = false;
  if (preferences.contextMenu) {
    createContextMenu();
  } else {
    browser.contextMenus.removeAll(() => {
      menuId = null;
    });
  }
};

window.addEventListener('DOMContentLoaded', event => {
  loadPreference();
});

const messageHandler = (message, sender, sendResponse) => {
  if(message.action === 'launchVideo') {
    launchVideo(message.url, preferences);
  }
};

browser.runtime.onMessage.addListener(messageHandler);
browser.runtime.onMessageExternal.addListener(messageHandler);

/*
  APIs for other addon, for example:

  Foxy Gestures: https://addons.mozilla.org/zh-TW/firefox/addon/foxy-gestures/
  ```
  browser.runtime.sendMessage('PopupVideoWebExt@ettoolong',
  {
    action: 'launchVideo',
    url: data.element.linkHref
  }).then();
  ```
*/


