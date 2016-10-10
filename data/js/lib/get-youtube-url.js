const baseURL = "https://www.youtube.com/embed";
const qs = require("sdk/querystring");

module.exports = getYouTubeUrl;

function getYouTubeUrl(videoId, type, cb, time) {
  const params = qs.stringify({
    autoplay: time ? 1 : 0,
    modestbranding: 1,
    controls: 1,
    disablekb: 1,
    enablejsapi: 1,
    fs: 1,
    iv_load_policy: 3,
    loop: 0,
    rel: 0,
    showinfo: 0,
    start: parseInt(time, 10) || 0
  });

  cb(null, `${baseURL}/${videoId}/?${params}`);
}
