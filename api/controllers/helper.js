module.exports.APIReturn = (code = 0, data = {}, mess = '') => {
  if (code === 503) {
    code = 10;
    if (mess !== '') {
      mess = 'miss field';
    }
  }

  if (typeof data === 'string') {
    mess = data;
    data = {};
  }

  return { code, data, mess };
};