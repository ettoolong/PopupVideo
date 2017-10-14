const getTwitchUrl = (videoId, type, cb) => {
  let baseURL = "https://player.twitch.tv";
  let params;

  if(type === "vod") {
    params = queryString({
      volume: 0.5,
      video: "v" + videoId
    });
  }
  else if(type === "live") {
    params = queryString({
      volume: 0.5,
      channel: videoId
    });
  }
  cb(null, `${baseURL}/?${params}`);
};
