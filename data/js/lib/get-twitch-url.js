const baseURL = "https://player.twitch.tv";
const qs = require("sdk/querystring");

module.exports = getTwitchUrl;

function getTwitchUrl(videoId, type, cb) {
  let params;

  if(type === "vod") {
    params = qs.stringify({
      volume: 0.5,
      video: "v" + videoId
    });
  }
  else if(type === "live") {
    params = qs.stringify({
      volume: 0.5,
      channel: videoId
    });
  }
  cb(null, `${baseURL}/?${params}`);
}
