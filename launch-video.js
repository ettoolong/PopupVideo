let windowID = null;
let tabID = null;
const sizeMapping = [
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

const launchVideo = (url, pref) => {
  let getUrlFn = {
    "videoUrl": (url, type, cb) => { return cb(null, url); },
    "vimeo": getVimeoUrl,
    "twitch": getTwitchUrl,
    "youtube": getYouTubeUrl,
    "dailymotion": getDailymotionUrl
  };
  let {id, domain, type} = getVideoId(url);

  //({changed: 'activate', domain: 'vimeo.com'});
  getUrlFn[domain](id, type, (err, videoUrl) => {
    if(pref.multiWindow || (!pref.multiWindow && windowID === null)) {
      let screen = window.screen;
      let top = screen.top;
      let left = screen.left;
      if (pref.defaultPosition === 0) {
        top = screen.top + (screen.height - sizeMapping[pref.defaultSize].height)/2;
        left = screen.left + (screen.width - sizeMapping[pref.defaultSize].width)/2;
      }
      else {
        if (pref.defaultPosition === 2 || pref.defaultPosition === 4) {
          top = screen.top + screen.height - sizeMapping[pref.defaultSize].height;
          if(top < screen.top)
            top = screen.top;
        }
        if (pref.defaultPosition === 3 || pref.defaultPosition === 4) {
          left = screen.left + screen.width - sizeMapping[pref.defaultSize].width;
          if(left < screen.left)
            left = screen.left;
        }
      }
      browser.windows.create({
        url: videoUrl,
        type: 'popup',
        top: top,
        left: left,
        width: sizeMapping[pref.defaultSize].width,
        height: sizeMapping[pref.defaultSize].height,
      }).then(windowInfo => {
        windowID = windowInfo.id;
        tabID = windowInfo.tabs[0].id;
        browser.windows.update(windowID,{focused: true, top: top, left: left});
      });
    }
    else {
      browser.tabs.update(tabID, {url: videoUrl});
      browser.windows.update(windowID,{focused: true});
    }
  });
};

browser.windows.onRemoved.addListener(id => {
  if(windowID === id) {
    windowID = null;
    tabID = null;
  }
});

//modify http header Referer to allow video play in iframe.
//for example: https://www.youtube.com/watch?v=8SzFaEqbLRM
browser.webRequest.onBeforeSendHeaders.addListener(
  event => {
    let found = false;
    for (var header of event.requestHeaders) {
      if (header.name.toLowerCase() === 'referer') {
        found = true;
      }
    }
    if(!found) {
      event.requestHeaders.push({name:'referer',value:'https://youtube.com'});
    }
    return {requestHeaders: event.requestHeaders};
  },
  {urls: ['https://www.youtube.com/embed/*']},
  ['blocking', 'requestHeaders']
);

browser.runtime.onMessage.addListener( (message, sender, sendResponse) => {
  if(message.action === 'init') {
    if(sender.tab.id === tabID && sender.tab.windowId === windowID) {
      sendResponse({action: 'removeIcons'});
    }
  }
});
