module.exports = {
  webpack(config) {
    config.target = 'electron-renderer';
    return config;
  },
  exportPathMap() {
    return {
      '/': { page: '/index' }
    };
  }
};
