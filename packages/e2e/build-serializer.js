module.exports = {
  print(result, serialize) {
    return serialize(result.details);
  },
  test(result) {
    return result && result.__result;
  }
};
