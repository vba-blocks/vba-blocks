module.exports = function eachObject(obj, fn) {
  if (!obj) return;

  Object.keys(obj).forEach(key => {
    fn(obj[key], key, obj);
  });
};
