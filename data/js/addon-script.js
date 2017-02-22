let self = require("sdk/self");
let data = self.data;
let winUtils = require("sdk/window/utils");
let pref = require("sdk/preferences/service");
const prefPath = "extensions.@popup-video.";
const pageMod = require("sdk/page-mod");

const launchVideo = require("./launch-video");
const contextMenuHandlers = require("./context-menu");
const popupVideoAPI = require("./addon-api.js");
const topWindow = require("./top-window");

let launchIconsMod= null;

let events = require("sdk/system/events");
let { Ci } = require("chrome");
let { MatchPattern } = require("sdk/util/match-pattern");
let pattern = new MatchPattern("https://www.youtube.com/embed/*");

const httpReqModHandler = event => {
  //modify http header Referer to allow video play in iframe.
  //for example: https://www.youtube.com/watch?v=8SzFaEqbLRM
  let channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
  let targetURI = channel.URI;
  if(pattern.test(targetURI.spec)) {
    channel.setRequestHeader("Referer", "https://youtube.com", false);
  }
};

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
          launchVideo(opts.url, topWindow);
        }
        else if (opts.domain.indexOf("vimeo.com")  > -1) {
          launchVideo(opts.url, topWindow);
        }
        else if (opts.domain.indexOf("twitch.tv")  > -1) {
          launchVideo(opts.url, topWindow);
        }
        else if (opts.domain.indexOf("dailymotion.com")  > -1) {
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
    let topWin = /popupVideoWindow-alwaysTop-[0-9]+-[0-9]+/;
    let normalWin = /popupVideoWindow-[0-9]+-[0-9]+/;
    for (let chromeWindow of allWindows) {
      if(!winUtils.isBrowser(chromeWindow)) {
        //name ex: popupVideoWindow-alwaysTop-1476516100560-173
        //         popupVideoWindow-1476516100560-173
        if(normalWin.test(chromeWindow.name)) {
          if(alwaysTop) {
            chromeWindow.name = "popupVideoWindow-alwaysTop" + chromeWindow.name.split(normalWin)[1];
            topWindow.makeOnTop(chromeWindow, alwaysTop);
          }
        }
        else if (topWin.test(chromeWindow.name)) {
          if(!alwaysTop) {
            chromeWindow.name = "popupVideoWindow" + chromeWindow.name.split(topWin)[1];
            topWindow.makeOnTop(chromeWindow, alwaysTop);
          }
        }
      }
    }
  }
  else if (prefName === "multiWindow"){
    let multiWindow = pref.get(prefPath + prefName);
    if(!multiWindow) { //if not allow multi video window, close them.
      let winRegex = /popupVideoWindow(-alwaysTop)?-[0-9]+-[0-9]+/;
      let allWindows = winUtils.windows(null, {includePrivate:true});
      let win;
      for (let chromeWindow of allWindows) {
        if(!winUtils.isBrowser(chromeWindow)) {
          if(winRegex.test(chromeWindow.name)) {
            if(!win) {
              win = chromeWindow;
            } else {
              chromeWindow.close();
            }
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

  events.on("http-on-modify-request", httpReqModHandler);
};

exports.onUnload = function(reason) {
  events.off("http-on-modify-request", httpReqModHandler);

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
