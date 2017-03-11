"use strict";

/*
  APIs for other addon, for example:

  FireGestures: https://addons.mozilla.org/zh-TW/firefox/addon/firegestures/
  ```
  var srcNode = FireGestures.sourceNode;
  var url = FireGestures.getLinkURL(srcNode);
  if(url){
    if(PopupVideo_API.supportSite(url)){
      PopupVideo_API.popupVideo(url);
    }
  } else {
    throw FireGestures._getLocaleString("ERROR_NOT_ON_LINK");
  }
  ```
*/

const launchVideo = require("./launch-video");
const siteRegex = require("./site-regex");
let topWindow;

const setTopWindow = (tw) => {
  topWindow = tw;
};
exports.setTopWindow = setTopWindow;

const supportSite = (url) => {
  return ( siteRegex.youtube.test(url) || siteRegex.twitch.test(url) || siteRegex.vimeo.test(url) || siteRegex.dailymotion.test(url) );
};
exports.supportSite = supportSite;

const popupVideo = (url, force) => {
  if( supportSite(url) || force) {
    launchVideo(url, topWindow);
  }
};
exports.popupVideo = popupVideo;
