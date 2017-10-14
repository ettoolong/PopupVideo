//https://developer.dailymotion.com/player
const getDailymotionUrl = (videoId, type, cb, time) => {
  let baseURL = "https://www.dailymotion.com/embed/video";
  let params = queryString({
    autoplay: time ? true : false,
    controls: true,
    "endscreen-enable": false,
    mute: false,
    quality: 'auto',
    "sharing-enable": false,
    start: parseInt(time, 10) || 0
  });
  cb(null, `${baseURL}/${videoId}?${params}`);
};
