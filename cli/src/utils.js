function eachObject(obj, fn) {
  if (!obj) {
    return;
  }

  Object.keys(obj).forEach(key => {
    fn(obj[key], key, obj);
  });
}

function isString(val) {
  return typeof val === 'string';
}

module.exports = {
  eachObject,
  isString,
};
