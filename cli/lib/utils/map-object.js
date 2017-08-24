module.exports = function mapObject(obj, fn) {
  if (!obj) return [];

  return Object.keys(obj).map(key => {
    return fn(obj[key], key, obj);
  });
};
