const fs = require('fs');
let config;

module.exports.initConfig = async () => {
  console.log('init');
  config = JSON.parse((await readFile('./config.json')).toString());
  return config;
};

const readFile = async file => new Promise(async (resolve, reject) => {
  fs.readFile(file, { encoding: 'utf-8' }, (error, data) => {
    if (error) {
      return reject(error);
    }

    return resolve(data);
  });
});

module.exports.getConfig = ()  => config;

module.exports.setConfig = (path, value) => {
  console.log('setConfig', config);
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

module.exports.updateConfig = async () => {
  console.log("write: ", JSON.stringify(config));
  fs.writeFile('./config.json', JSON.stringify(config, null, 2), error => {
    if (error) {
      console.log(error);
      return;
    }
    console.log("File written successfully\n");
  });
}