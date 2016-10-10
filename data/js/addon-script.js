let self = require("sdk/self");
let data = self.data;
let winUtils = require("sdk/window/utils");
let pref = require("sdk/preferences/service");
const prefPath = "extensions.@popup-video.";
const pageMod = require("sdk/page-mod");

const getYouTubeUrl = require("./lib/get-youtube-url");
const getVimeoUrl = require("./lib/get-vimeo-url");
const getTwitchUrl = require("./lib/get-twitch-url");
const launchVideo = require("./launch-video");
const contextMenuHandlers = require("./context-menu");
const popupVideoAPI = require("./addon-api.js");
const topWindow = require("./top-window");

let launchIconsMod= null;

function onWinOpen (chromeWindow) {
  let chromeBrowser = chromeWindow.gBrowser;
  if(chromeBrowser) {
    chromeWindow.PopupVideo_API = popupVideoAPI;
  }
}

function onWinClose (chromeWindow) {
  let chromeBrowser = chromeWindow.gBrowser;
  if(chromeBrowser) {
    delete chromeWindow.PopupVideo_API;
  }
}

function loadPageMod () {
  // add launch icon to video embeds
  launchIconsMod = pageMod.PageMod({
    include: "*",
    attachTo: ["existing", "top", "frame"],
    contentStyleFile: data.url("js/content/icon-overlay.css"),
    contentScriptFile: data.url("js/content/icon-overlay.js"),
    onAttach: function(worker) {
      //TODO: set overlayIcon pref to page.
      worker.port.on("launch", function(opts) {
        if (opts.domain.indexOf("youtube.com") > -1) {
          opts.getUrlFn = getYouTubeUrl;
          launchVideo(opts.url, topWindow);
        }
        else if (opts.domain.indexOf("vimeo.com")  > -1) {
          opts.getUrlFn = getVimeoUrl;
          launchVideo(opts.url, topWindow);
        }
        else if (opts.domain.indexOf("twitch.tv")  > -1) {
          opts.getUrlFn = getTwitchUrl;
          launchVideo(opts.url, topWindow);
        }
      });
    }
  });
}

require("sdk/simple-prefs").on("", function(prefName){
  if(prefName === "alwaysTop") {
    let alwaysTop = pref.get(prefPath + prefName);
    let allWindows = winUtils.windows(null, {includePrivate:true});
    for (let chromeWindow of allWindows) {
      if(!winUtils.isBrowser(chromeWindow)) {
        if(chromeWindow.name == "popupVideoWindow") {
          if(alwaysTop) {
            chromeWindow.name = "popupVideoWindow-alwaysTop";
            topWindow.makeOnTop(chromeWindow, alwaysTop);
          }
        }
        else if (chromeWindow.name == "popupVideoWindow-alwaysTop") {
          if(!alwaysTop) {
            chromeWindow.name = "popupVideoWindow";
            topWindow.makeOnTop(chromeWindow, alwaysTop);
          }
        }
      }
    }
  }
  else if (prefName === "resizable"){
    // TODO: Find a way to change already opened window's resizable attribute.
    // I don't know how to to this :(
  }
  else if (prefName === "overlayIcon"){
    let overlayIcon = pref.get(prefPath + prefName);
    if(overlayIcon) {
      if(!launchIconsMod) {
        loadPageMod();
      }
    }
    else {
      if(launchIconsMod) {
        launchIconsMod.destroy();
        launchIconsMod = null;
      }
    }
  }
});

exports.main = function() {
  if( pref.get(prefPath + "overlayIcon") ) {
    loadPageMod();
  }

  popupVideoAPI.setTopWindow(topWindow);
  delete popupVideoAPI.setTopWindow;
  topWindow.init();
  contextMenuHandlers.init(topWindow);

  let allWindows = winUtils.windows(null, {includePrivate:true});
  for (let chromeWindow of allWindows) {
    if(winUtils.isBrowser(chromeWindow)) {
      onWinOpen( chromeWindow );
    }
  }
};

exports.onUnload = function(reason) {
  topWindow.destroy();
  contextMenuHandlers.destroy();
  // browserResizeMod.destroy();
  if(launchIconsMod) {
    launchIconsMod.destroy();
    launchIconsMod = null;
  }

  let allWindows = winUtils.windows(null, {includePrivate:true});
  for (let chromeWindow of allWindows) {
    if(winUtils.isBrowser(chromeWindow)) {
      onWinClose( chromeWindow );
    }
  }
};
