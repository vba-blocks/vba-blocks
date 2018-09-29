const { getProcesses } = require('../');

test('should getProcesses', async () => {
  const list = await getProcesses();
  expect(list.length).toBeGreaterThan(0);
});
