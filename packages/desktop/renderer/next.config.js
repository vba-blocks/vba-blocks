module.exports = {
  webpack(config) {
    config.target = 'electron-renderer';
    return config;
  },
  exportPathMap() {
    return {
      '/start': { page: '/start' }
    };
  }
};
