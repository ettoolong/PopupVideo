let self = require("sdk/self");
let data = self.data;
let pref = require("sdk/preferences/service");
const prefPath = "extensions.@popup-video.";

const _ = require("sdk/l10n").get;
const cm = require("sdk/context-menu");
const launchVideo = require("./launch-video");
const siteRegex = require("./site-regex");

const items = [];
let lastUrl = "";
let topWindow;

module.exports = {
  init: init,
  destroy: destroy
};

function destroy() {
  items.forEach(i => i.destroy());
}

function getItem(opts) {
  items.push(cm.Item(opts));
}

function init(tw) {
  topWindow = tw;
  getItem({
    label: _("popupVideoWindow"),
    image: data.url("img/icon.svg"),
    context: cm.PredicateContext(function(context){
      if(pref.get(prefPath + "contextMenu")) {
        lastUrl = context.linkURL;
        return (siteRegex.youtube.test(lastUrl) || siteRegex.twitch.test(lastUrl) || siteRegex.vimeo.test(lastUrl) );
      }
      else {
        return false;
      }
    }),
    contentScriptFile: data.url("js/content-script.js"),
    onMessage: url => {
      launchVideo(lastUrl, topWindow);
    }
  });

}
