export function toThrow(callback) {
  return async () => {
    expect.assertions(1);

    try {
      await callback();
    } catch (err) {
      expect(err).toMatchSnapshot();
    }
  };
}
