import * as THREE from 'three'

class App {
    constructor() {
        const container = document.createElement('div');
        document.body.appendChild(container)

        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        
    }

    render() {

    }
}

export { App }