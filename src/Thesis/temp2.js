import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import {
    GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';

import {
    GUI
} from 'three/addons/libs/lil-gui.module.min.js';

class Thesis {
    constructor() {
        this.init();
    }

    init() {
        this.clock = new THREE.Clock();
        this.container = document.getElementById('container');
        this.overlay = document.getElementById('overlay');
        this.loadingBar = document.getElementById('progress');
        this.message = document.getElementById('message');
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        this.container.appendChild(this.stats.domElement);

        this.initRenderer();

        window.addEventListener('resize', () => {
            this.onWindowResize();
        }, false);

        this.animate();
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.container.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        // this.scene.background = new THREE.Color(0xbfe3dd);
        this.scene.background = new THREE.Color(0x87CEEB);

        let axisHelper = new THREE.AxesHelper(100);
        this.scene.add(axisHelper);

        let envLight = new THREE.HemisphereLight(0xffffff, 0xa88132, 3);
        envLight.position.set(0, 100, 0)
        // let ambientLight = new THREE.AmbientLight(0x000000, 3)
        // ambientLight.position.set(0, 10 ,0) 
        // this.scene.add(ambientLight)
        let hemisphereLightHelper = new THREE.HemisphereLightHelper(envLight, 3)
        this.scene.add(hemisphereLightHelper)

        //this.scene.add(envLight);

        let geometry = new THREE.BoxGeometry(2, 2, 2);
        let material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x0,
            transparent: false,
            opacity: 0,
            depthTest: true,
            depthWrite: true,
            alphaTest: 0,
            opacity: 1,
            visible: true,
            side: THREE.FrontSide,
            wireframe: false,
        });
        material.flatShading = false;

        let cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);

        let sunLight = new THREE.DirectionalLight(0xffffff, 3);
        sunLight.position.set(-1, 200, 1);
        sunLight.position.multiplyScalar(10)
        this.scene.add(sunLight)

        let sunlightHelper = new THREE.DirectionalLightHelper(sunLight, 5);
        this.scene.add(sunlightHelper);
        //sunLight.target = cube;
        //this.scene.add(envLight);
        this.loader = new GLTFLoader();
        this.loader.load('static/model/scene.gltf',
            (gltf) => {
                let model = gltf.scene;
                model.position.set(0, 0, 0)
                this.scene.add(gltf.scene);
                this.overlay.style.display = 'none';
            }, (loading) => {
                let percent = loading.loaded / loading.total * 100
                this.message.innerText = "Loading " + percent.toFixed(0) + "%"
                this.loadingBar.style.width = percent + '%';
                if (percent == 100) {
                    this.message.innerText = "Rendering inprogress";
                }
            }, (error) => {
                console.log(error)
                this.overlay.style.display = 'none';
            })

        this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, .01, 900);
        this.camera.position.set(100, 20, 8);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 0.5, 0);
        this.controls.update();
        this.controls.enablePan = false;
        this.controls.enableDamping = true;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 1000;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }



    animate() {
        // const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

        // for (let i = 0; i < STEPS_PER_FRAME; i++) {
        //     // controls(deltaTime);
        //     //this.updatePlayer(deltaTime);
        //     //this.teleportPlayerIfOob();
        // }

        this.renderer.render(this.scene, this.camera);

        this.controls.update();

        this.stats.update();

        requestAnimationFrame((t) => {
            this.animate();
        });
    }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new Thesis();
});