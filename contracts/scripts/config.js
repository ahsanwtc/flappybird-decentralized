const fs = require('fs');
let config;

export async function initConfig() {
  console.log('init');
  config = JSON.parse((await fs.readFile('../config.json')).toString());
  return config;
};

export const getConfig = ()  => config;

export const setConfig = (path, value) => {
  console.log(config);
  const splitPath = path.split('.').reverse();
  let ref = config;

  while (splitPath.length > 1) {
    let key = splitPath.pop();

    if (key) {
      if (!ref[key]) { ref[key] = {}; }
      ref = ref[key];
    } else {
      return;
    }
  };

  let key = splitPath.pop();
  if (key) {
    ref[key] = value;
  }
};

export const updateConfig = async () => {
  console.log("write: ", JSON.stringify(config));
  return fs.writeFile('../config.json', JSON.stringify(config, null, 2));
}