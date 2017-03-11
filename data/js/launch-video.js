const qs = require("sdk/querystring");
let winUtils = require("sdk/window/utils");
let pref = require("sdk/preferences/service");
const prefPath = "extensions.@popup-video.";

const getYouTubeUrl = require("./lib/get-youtube-url");
const getTwitchUrl = require("./lib/get-twitch-url");
const getVimeoUrl = require("./lib/get-vimeo-url");
const getDailymotionUrl = require("./lib/get-dailymotion-url");
const getVideoId = require("./get-video-id");

// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/window
// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Attribute/accelerated

const getUrlFn = {
  "videoUrl": (url, type, cb) => { return cb(null, url); },
  "vimeo": getVimeoUrl,
  "twitch": getTwitchUrl,
  "youtube": getYouTubeUrl,
  "dailymotion": getDailymotionUrl
};

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

/*
  NOTE:
    [test on Firefox 49]
    openDialog features bug -> alwaysraised:
      Windows 10 - Right behavior
      Mac 10.12 - Not working, window not be set to top
      Ubuntu 16.04 - Not working, window always set to top

    openDialog features bug -> resizable:
      Windows 10 - Right behavior
      Mac 10.12 - Right behavior
      Ubuntu 16.04 - Not working, window always resizable

    openDialog -> open two windows with the same name:
      Windows 10- Right behavior, open two windows
      Mac 10.12 - Wrong behavior, the second window replace the first window
      Ubuntu 16.04 - Right behavior, open two windows
*/

module.exports = function (url, topWindow) {
  //console.log('url = ' + url);
  let defaultSize = pref.get(prefPath + "defaultSize");
  let defaultPosition = pref.get(prefPath + "defaultPosition");
  let resizable = pref.get(prefPath + "resizable");
  let alwaysTop = pref.get(prefPath + "alwaysTop");
  let multiWindow = pref.get(prefPath + "multiWindow");
  let name = alwaysTop ? "popupVideoWindow-alwaysTop" : "popupVideoWindow";
  name += "-" + Date.now() + "-" + Math.floor((Math.random() * 1000)); //let all windows get differen name.
  let win;
  let positionStr = "";

  let {id, domain, type} = getVideoId(url);
  //({changed: 'activate', domain: 'vimeo.com'});
  getUrlFn[domain](id, type, (err, videoUrl) => {
    //console.log('videoUrl = ' + videoUrl);
    let features = {
      minimizable: true,
      chrome: false,
      titlebar: true,
      //alwaysraised: true,
      //centerscreen: true,
      private: true
    };

    if(resizable) {
      features.resizable = true;
    }

    if(defaultPosition === 0) {
      //center of screen
      features.centerscreen = true;
    }
    else {
      //calculate the popup window position
      let screen = winUtils.getMostRecentBrowserWindow().screen;
      let top = screen.top;
      let left = screen.left;
      if (defaultPosition === 2 || defaultPosition === 4) {
        top = screen.top + screen.height - sizeMapping[defaultSize].height;
        if(top < screen.top)
          top = screen.top;
      }
      if (defaultPosition === 3 || defaultPosition === 4) {
        left = screen.left + screen.width - sizeMapping[defaultSize].width;
        if(left < screen.left)
          left = screen.left;
      }
      positionStr = ",top=" + top + ",left=" + left;
    }

    if(!multiWindow) { //if not allow multi video window, find one opened window to play video
      let winRegex = /popupVideoWindow(-alwaysTop)?-[0-9]+-[0-9]+/;
      let allWindows = winUtils.windows(null, {includePrivate:true});
      for (let chromeWindow of allWindows) {
        if(!winUtils.isBrowser(chromeWindow)) {
          if(winRegex.test(chromeWindow.name)) {
            win = chromeWindow;
          }
        }
      }
    }
    if(!win) {
      win = winUtils.openDialog({
        name: name,
        url: videoUrl,
        features: Object.keys(features).join() + ",width=" + sizeMapping[defaultSize].width+ ",height=" + sizeMapping[defaultSize].height + positionStr
      });
    } else {
      win.location.href = videoUrl; //if not specify url, assign url here.
    }

    if(alwaysTop) {
      topWindow.makeOnTop(win, true);
    }

    //console.log(win);
    //let xulWin = winUtils.getXULWindow(win);
    //win.location.href = ''; //if not specify url, assign url here.
  });
};
