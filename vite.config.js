const { resolve } = require('path')

module.exports = {
  build: {
    rollupOptions: {
      input: {
        portfolio: resolve(__dirname, 'index.html'),
        thesis: resolve(__dirname, './src/Thesis/index.html')
      }
    }
  }
}