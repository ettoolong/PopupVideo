"use strict";

module.exports = {
  youtube: /(https?:\/\/(?:www|m)\.youtube\.com\/watch\?.*v=([A-Za-z0-9._%-]*)|https?:\/\/youtu\.be\/([A-Za-z0-9._%-]*))/i,
  twitch: /https:\/\/(?:www\.)twitch\.tv\//i,
  vimeo: /https:\/\/vimeo\.com\/([0-9]{1,10})/i,
  dailymotion: /https?:\/\/(?:www\.)dailymotion\.com\/video\/([a-z0-9]{1,10})_?.*/i
};
