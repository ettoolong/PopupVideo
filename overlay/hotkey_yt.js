if(window === window.top) {
  const shortcutFuncs = {
    togglePlay: function(v){
      if(v.hasAttribute('src')) {
        if(v.paused)
          v.play();
        else
          v.pause();
      } else {
        document.querySelector('.ytp-large-play-button').click();
      }
    },

    toStart: function(v){
      v.currentTime = 0;
    },

    toEnd: function(v){
      v.currentTime = v.duration;
    },

    skipLeft: function(v,key,shift,ctrl){
      if(shift)
        v.currentTime -= 10;
      else if(ctrl)
        v.currentTime -= 1;
      else
        v.currentTime -= 5;
    },

    skipRight: function(v,key,shift,ctrl){
      if(shift)
        v.currentTime += 10;
      else if(ctrl)
        v.currentTime += 1;
      else
        v.currentTime += 5;
    },

    toggleMute: function(v){
      // v.muted = !v.muted;
      document.querySelector('.ytp-mute-button').click();
    },

    toggleFS: function(v){
      //v.requestFullscreen();
      document.querySelector('.ytp-fullscreen-button').click();
    },
  };

  const keyFuncs = {
    32 : shortcutFuncs.togglePlay,      // Space
    35 : shortcutFuncs.toEnd,           // End
    36 : shortcutFuncs.toStart,         // Home
    37 : shortcutFuncs.skipLeft,        // Left arrow
    39 : shortcutFuncs.skipRight,       // Right arrow
    77 : shortcutFuncs.toggleMute,      // M
    70 : shortcutFuncs.toggleFS,        // F
  };

  window.addEventListener('keydown', event => {
    if(event.altKey || event.metaKey){
      return true;
    }
    const func = keyFuncs[event.keyCode];
    if(func){
      const v = document.querySelector('video');
      func(v);
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  }, true);
}
