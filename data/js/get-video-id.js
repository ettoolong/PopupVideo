'use strict';

module.exports = function (str) {
  if (typeof str !== 'string') {
    throw new TypeError('get-video-id expects a string');
  }

  if (/<iframe/ig.test(str)) {
    str = getSrcFromEmbedCode(str);
  }

  // remove the '-nocookie' flag from youtube urls
  str = str.replace('-nocookie', '');

  var id;
  var domain;
  var type;

  if (/youtube|youtu\.be/.test(str)) {
    //id = youtube(str);
    let {vId, vType} = youtube(str);
    id = vId;
	  type = vType;
    domain = 'youtube';
  }
  else if (/vimeo/.test(str)) {
    id = vimeo(str);
    domain = 'vimeo';
  // } else if (/vine/.test(str)) {
  // 	id = vine(str);
  }
  else if (/twitch/.test(str)) {
	  let {vId, vType} = twitch(str);
    id = vId;
	  type = vType;
    domain = 'twitch';
  }
  else if (/dailymotion/.test(str)) {
    id = dailymotion(str);
    domain = 'dailymotion';
  }
  else {
    id = str;
    domain = 'videoUrl';
    type = 'videoUrl';
  }
  return {id, domain, type};
};

/**
 * Get the twitch id.
 * @param {string} str - the url from which you want to extract the id
 * @returns {string|undefined, string}
 */
function twitch(str) {
  const vodTester = /https:\/\/(?:www\.)twitch\.tv\/[0-9a-zA-Z_]{1,25}\/v\/([0-9]{1,10})/g;
  if (vodTester.test(str)) {
    return {vId: str.split(vodTester)[1].split('&')[0], vType: 'vod'};
  }

  const liveTester = /https:\/\/(?:www\.)twitch\.tv\//g
  if (liveTester.test(str)) {
    return {vId: str.split(liveTester)[1].split('&')[0], vType: 'live'};
  }
}

/**
 * Get the vimeo id.
 * @param {string} str - the url from which you want to extract the id
 * @returns {string|undefined}
 */
function vimeo(str) {
  if (str.indexOf('#') > -1) {
    str = str.split('#')[0];
  }
  var id;
  if (/https?:\/\/vimeo\.com\/[0-9]+$|https?:\/\/player\.vimeo\.com\/video\/[0-9]+$/igm.test(str)) {
    var arr = str.split('/');
    if (arr && arr.length) {
      id = arr.pop();
    }
  }
  return id;
}

/**
 * Get the vine id.
 * @param {string} str - the url from which you want to extract the id
 * @returns {string|undefined}
 */
function vine(str) {
  var regex = /https:\/\/vine\.co\/v\/([a-zA-Z0-9]*)\/?/;
  var matches = regex.exec(str);
  return matches && matches[1];
}

/**
 * Get the dailymotion id.
 * @param {string} str - the url from which you want to extract the id
 * @returns {string|undefined}
 */
function dailymotion(str) {
  var regex = /https?:\/\/(?:www\.)?dailymotion\.com\/video\/([a-zA-Z0-9]*)(?:\?)?/;
  var matches = regex.exec(str);
  return matches && matches[1];
}

/**
 * Get the Youtube Video id.
 * @param {string} str - the url from which you want to extract the id
 * @returns {string|undefined}
 */
function youtube(str) {
  // shortcode
  var shortcode = /youtube:\/\/|https?:\/\/youtu\.be\//g;

  if (shortcode.test(str)) {
    var shortcodeid = str.split(shortcode)[1];
    return {vId: stripParameters(shortcodeid), vType: 'video'};
  }

  // /v/ or /vi/
  var inlinev = /\/v\/|\/vi\//g;

  if (inlinev.test(str)) {
    var inlineid = str.split(inlinev)[1];
    return {vId: stripParameters(inlineid), vType: 'video'};
  }

  // list=
  var parameterl = /list=/g;

  // v= or vi=
  var parameterv = /v=|vi=/g;

  if (parameterl.test(str)) {
    var arr = str.split(parameterl);
    var arr2 = str.split(parameterv);
    return {vId: arr2[1].split('&')[0] + '&' + arr[1].split('&')[0], vType: 'list'};
  }

  if (parameterv.test(str)) {
    var arr = str.split(parameterv);
    return {vId: arr[1].split('&')[0], vType: 'video'};
  }

  // embed
  var embedreg = /\/embed\//g;

  if (embedreg.test(str)) {
    var embedid = str.split(embedreg)[1];
    return {vId: stripParameters(embedid), vType: 'video'};
  }

  // user
  var userreg = /\/user\//g;

  if (userreg.test(str)) {
    var elements = str.split('/');
    return {vId: stripParameters(elements.pop()), vType: 'video'};
  }
}

/**
 * Strip away any parameters following `?`
 * @param str
 * @returns {*}
 */
function stripParameters(str) {
  if (str.indexOf('?') > -1) {
    return str.split('?')[0];
  }
  return str;
}

/**
 * extract the `src` url from an embed string
 * @param embedCodeString
 * @returns {*}
 */
function getSrcFromEmbedCode(embedCodeString) {
  var re = /src="(.*?)"/gm;
  var url = re.exec(embedCodeString);

  if (url && url.length >= 2) {
    return url[1];
  }
}
