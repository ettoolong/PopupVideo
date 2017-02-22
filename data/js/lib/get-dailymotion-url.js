const baseURL = "https://www.dailymotion.com/embed/video";
const qs = require("sdk/querystring");

module.exports = getDailymotionUrl;
//https://developer.dailymotion.com/player
function getDailymotionUrl(videoId, type, cb, time) {
  let params = qs.stringify({
    autoplay: time ? true : false,
    controls: true,
    "endscreen-enable": false,
    mute: false,
    quality: 'auto',
    "sharing-enable": false,
    start: parseInt(time, 10) || 0
  });
  cb(null, `${baseURL}/${videoId}?${params}`);
}
