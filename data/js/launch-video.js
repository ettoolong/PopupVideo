const qs = require("sdk/querystring");
let winUtils = require("sdk/window/utils");
let pref = require("sdk/preferences/service");
const prefPath = "extensions.@popup-video.";

const getYouTubeUrl = require("./lib/get-youtube-url");
const getTwitchUrl = require("./lib/get-twitch-url");
const getVimeoUrl = require("./lib/get-vimeo-url");
const getVideoId = require("./get-video-id");

// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/window
// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Attribute/accelerated

const getUrlFn = {
  "vimeo": getVimeoUrl,
  "twitch": getTwitchUrl,
  "youtube": getYouTubeUrl
};

const sizeMapping = [
  {width: 425, height:344},
  {width: 480, height:385},
  {width: 640, height:505},
  {width: 960, height:745},
  {width: 280, height:160},
  {width: 560, height:320},
  {width: 640, height:365},
  {width: 853, height:485},
  {width: 1280, height:725}
];

module.exports = function (url, topWindow) {
  //console.log('url = ' + url);
  let defaultSize = pref.get(prefPath + "defaultSize");
  let resizable = pref.get(prefPath + "resizable");
  let alwaysTop = pref.get(prefPath + "alwaysTop");
  let name = alwaysTop ? "popupVideoWindow-alwaysTop" : "popupVideoWindow";

  let {id, domain, type} = getVideoId(url);
  //({changed: 'activate', domain: 'vimeo.com'});
  getUrlFn[domain](id, type, (err, videoUrl) => {
    //console.log('videoUrl = ' + videoUrl);
    let features = {
      minimizable: true,
      chrome: false,
      titlebar: true,
      //alwaysraised: true,
      centerscreen: true,
      private: true
    };
    if(resizable)
      features.resizable = true;

    let win = winUtils.openDialog({
      name: name,
      url: videoUrl,
      features: Object.keys(features).join() + ",width=" + sizeMapping[defaultSize].width+ ",height=" + sizeMapping[defaultSize].height
    });

    if(alwaysTop) {
      topWindow.makeOnTop(win, true);
    }
    //console.log(win);
    //let xulWin = winUtils.getXULWindow(win);
    //win.location.href = ''; //if not specify url, assign url here.
  });
};
