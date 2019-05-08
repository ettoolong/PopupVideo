let currentPrefs = {};

const saveToPreference = (id, value) => {
  let update = {};
  update[id] = value;
  browser.storage.local.set(update).then(null, err => {});
};

const handleVelueChange = id => {
  let elem = document.getElementById(id);
  if(elem) {
    let elemType = elem.getAttribute('type');
    if(elemType === 'checkbox') {
      elem.addEventListener('input', event => {
        saveToPreference(id, elem.checked ? true : false);
      });
    }
    else if(elemType === 'number') {
      elem.addEventListener('input', event => {
        saveToPreference(id, parseInt(elem.value));
      });
    }
    else if(elemType === 'option') {
      elem.addEventListener('input', event => {
        saveToPreference(id, parseInt(elem.value));
      });
    }
  }
};

const setValueToElem = (id, value) => {
  let elem = document.getElementById(id);
  if(elem) {
    let elemType = elem.getAttribute('type');
    if(elemType === 'checkbox') {
      elem.checked = value;
    }
    if(elemType === 'number') {
      elem.value = value;
    }
    else if(elemType === 'option') {
      let options = Array.from(elem.querySelectorAll('option'));
      for(let option of options) {
        if(parseInt(option.getAttribute('value')) === value) {
          option.selected = true;
          break;
        }
      }
    }
  }
};

const getScreenInfo = (callback) => {
  browser.runtime.sendMessage({action: 'getScreenInfo'}).then( response => {
    callback(response);
  }, error => {});
}

const init = preferences => {
  currentPrefs = preferences;
  for(let p in preferences) {
    setValueToElem(p, preferences[p]);
    handleVelueChange(p);
  }
  let l10nTags = Array.from(document.querySelectorAll('[data-l10n-id]'));
  l10nTags.forEach(tag => {
    tag.textContent = browser.i18n.getMessage(tag.getAttribute('data-l10n-id'));
  });
  getScreenInfo(response => {
    if (!response) {
      document.getElementById('resistFingerprinting').style.display = 'block';
    }
  })
  document.getElementById('autoDetect').addEventListener('click', event => {
    getScreenInfo(response => {
      if (response) {
        document.getElementById('screenWidth').value = response.width;
        document.getElementById('screenHeight').value = response.height;
        document.getElementById('screenLeft').value = response.left;
        document.getElementById('screenTop').value = response.top;
        saveToPreference('screenWidth', response.width);
        saveToPreference('screenHeight', response.height);
        saveToPreference('screenLeft', response.left);
        saveToPreference('screenTop', response.top);
      }
    });
  });
};

window.addEventListener('load', event => {
  browser.storage.local.get().then(results => {
    if ((typeof results.length === 'number') && (results.length > 0)) {
      results = results[0];
    }
    if (results.version) {
      init(results);
    }
  });
}, true);
