const {
    resolve
} = require('path')

module.exports = {
    assetsInclude: ['./src/Thesis/static/**/*'],
    build: {
        rollupOptions: {
            input: {
                portfolio: resolve(__dirname, 'index.html'),
                thesis: resolve(__dirname, './src/Thesis/index.html')
            }
        }
    }
}