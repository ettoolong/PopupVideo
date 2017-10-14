const queryString = params => {
  let keys = Object.keys(params);
  let paramAreay = [];
  for(let i = 0; i < keys.length; ++i) {
    paramAreay.push(keys[i] + '=' + params[keys[i]]);
  }
  return paramAreay.join('&');
};
