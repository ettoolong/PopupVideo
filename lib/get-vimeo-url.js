const getVimeoUrl = (videoId, type, cb) => {
  fetch("https://player.vimeo.com/video/" + videoId + "/config").then(function(response) {
    var contentType = response.headers.get("content-type");
    if(contentType && contentType.includes("application/json")) {
      return response.json();
    }
  })
  .then(function(json) {
    cb(null, json.request.files.progressive[0].url);
  });
}
