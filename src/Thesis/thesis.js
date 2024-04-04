import * as THREE from 'three';
// import {FirstPersonControls} from 'three/addons/controls/FirstPersonControls.js';
import { FirstPersonCamera } from './utility/firstpersonCam';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

class ThesisDemo {
    constructor() {
        this.initialize_();
    }

    initialize_() {
        this.initializeRenderer_();
        this.initializeLights_();
        this.initializeScene_();
        this.initializeDemo_();

        this.previousRAF_ = null;
        this.raf_();
        this.onWindowResize_();
    }

    initializeDemo_() {
        // this.controls_ = new FirstPersonControls(
        //     this.camera_, this.threejs_.domElement);
        // this.controls_.lookSpeed = 0.8;
        // this.controls_.movementSpeed = 5;

        this.fpsCamera_ = new FirstPersonCamera(this.camera_, this.objects_);
    }

    initializeRenderer_() {
        this.threejs_ = new THREE.WebGLRenderer({
            antialias: false,
        });
        this.threejs_.shadowMap.enabled = true;
        this.threejs_.shadowMap.type = THREE.PCFSoftShadowMap;
        this.threejs_.setPixelRatio(window.devicePixelRatio);
        this.threejs_.setSize(window.innerWidth, window.innerHeight);
        this.threejs_.physicallyCorrectLights = true;
        this.threejs_.outputEncoding = THREE.sRGBEncoding;

        document.body.appendChild(this.threejs_.domElement);

        window.addEventListener('resize', () => {
            this.onWindowResize_();
        }, false);

        const fov = 90;
        const aspect = 1920 / 1080;
        const near = 0.1;
        const far = 1000.0;
        this.camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera_.position.set(0, 20, 0);

        this.scene_ = new THREE.Scene();

        this.uiCamera_ = new THREE.OrthographicCamera(
            -1, 1, 1 * aspect, -1 * aspect, 1, 1000);
        this.uiScene_ = new THREE.Scene();
    }

    initializeScene_() {
        this.scene_.background = new THREE.Color(0x88ccee);
        this.scene_.fog = new THREE.Fog(0x88ccee, 0, 500);

        const fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
        fillLight1.position.set(2, 1, 1);
        this.scene_.add(fillLight1);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(- 5, 25, - 1);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.01;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.left = - 30;
        directionalLight.shadow.camera.top = 30;
        directionalLight.shadow.camera.bottom = - 30;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.radius = 4;
        directionalLight.shadow.bias = - 0.00006;
        this.scene_.add(directionalLight);




        // const loader = new THREE.CubeTextureLoader();
        // const texture = loader.load([
        //     './resources/skybox/posx.jpg',
        //     './resources/skybox/negx.jpg',
        //     './resources/skybox/posy.jpg',
        //     './resources/skybox/negy.jpg',
        //     './resources/skybox/posz.jpg',
        //     './resources/skybox/negz.jpg',
        // ]);

        // texture.encoding = THREE.sRGBEncoding;
        // this.scene_.background = texture;

        const mapLoader = new THREE.TextureLoader();
        const maxAnisotropy = this.threejs_.capabilities.getMaxAnisotropy();
        const checkerboard = mapLoader.load('resources/checkerboard.png');
        checkerboard.anisotropy = maxAnisotropy;
        checkerboard.wrapS = THREE.RepeatWrapping;
        checkerboard.wrapT = THREE.RepeatWrapping;
        checkerboard.repeat.set(32, 32);
        checkerboard.encoding = THREE.sRGBEncoding;

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 10, 10),
            new THREE.MeshStandardMaterial({ map: checkerboard }));
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this.scene_.add(plane);

        // const box = new THREE.Mesh(
        //     new THREE.BoxGeometry(4, 4, 4),
        //     this.loadMaterial_('vintage-tile1_', 0.2));
        // box.position.set(10, 2, 0);
        // box.castShadow = true;
        // box.receiveShadow = true;
        // this.scene_.add(box);

        const concreteMaterial = this.loadMaterial_('concrete3-', 4);

        const wall1 = new THREE.Mesh(
            new THREE.BoxGeometry(100, 100, 4),
            concreteMaterial);
        wall1.position.set(0, -40, -50);
        wall1.castShadow = true;
        wall1.receiveShadow = true;
        this.scene_.add(wall1);

        const wall2 = new THREE.Mesh(
            new THREE.BoxGeometry(100, 100, 4),
            concreteMaterial);
        wall2.position.set(0, -40, 50);
        wall2.castShadow = true;
        wall2.receiveShadow = true;
        this.scene_.add(wall2);

        const wall3 = new THREE.Mesh(
            new THREE.BoxGeometry(4, 100, 100),
            concreteMaterial);
        wall3.position.set(50, -40, 0);
        wall3.castShadow = true;
        wall3.receiveShadow = true;
        this.scene_.add(wall3);

        const wall4 = new THREE.Mesh(
            new THREE.BoxGeometry(4, 100, 100),
            concreteMaterial);
        wall4.position.set(-50, -40, 0);
        wall4.castShadow = true;
        wall4.receiveShadow = true;
        this.scene_.add(wall4);

        // Create Box3 for each mesh in the scene so that we can
        // do some easy intersection tests.
        const meshes = [
            // plane, box, wall1, wall2, wall3, wall4];
            plane, wall1, wall2, wall3, wall4];

        this.objects_ = [];

        for (let i = 0; i < meshes.length; ++i) {
            const b = new THREE.Box3();
            b.setFromObject(meshes[i]);
            this.objects_.push(b);
        }

        // // Crosshair
        // const crosshair = mapLoader.load('resources/crosshair.png');
        // crosshair.anisotropy = maxAnisotropy;

        // this.sprite_ = new THREE.Sprite(
        //     new THREE.SpriteMaterial({ map: crosshair, color: 0xffffff, fog: false, depthTest: false, depthWrite: false }));
        // this.sprite_.scale.set(0.15, 0.15 * this.camera_.aspect, 1)
        // this.sprite_.position.set(0, 0, -10);

        // this.uiScene_.add(this.sprite_);

        const gui = new GUI( { width: 200});
        gui.add({debug: false}, 'debug').onChange((val)=>{
            console.log(val)
        })
        gui.add({height: 170}, 'height').onChange((val)=>{
            console.log(val)
        })
        gui.add({Forward: "w"}, 'Forward').onChange((val)=>{
            console.log(val)
        })
        gui.add({Backward: "s"}, 'Backward').onChange((val)=>{
            console.log(val)
        })
        gui.add({Left: "a"}, 'Left').onChange((val)=>{
            console.log(val)
        })
        gui.add({Right: "d"}, 'Right').onChange((val)=>{
            console.log(val)
        })
    }

    initializeLights_() {
        const distance = 50.0;
        const angle = Math.PI / 4.0;
        const penumbra = 0.5;
        const decay = 1.0;

        let light = new THREE.SpotLight(
            0xFFFFFF, 100.0, distance, angle, penumbra, decay);
        light.castShadow = true;
        light.shadow.bias = -0.00001;
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 100;

        light.position.set(25, 25, 0);
        light.lookAt(0, 0, 0);
        this.scene_.add(light);

        const upColour = 0xFFFF80;
        const downColour = 0x808080;
        light = new THREE.HemisphereLight(upColour, downColour, 0.5);
        light.color.setHSL(0.6, 1, 0.6);
        light.groundColor.setHSL(0.095, 1, 0.75);
        light.position.set(0, 4, 0);
        this.scene_.add(light);
    }

    loadMaterial_(name, tiling) {
        const mapLoader = new THREE.TextureLoader();
        const maxAnisotropy = this.threejs_.capabilities.getMaxAnisotropy();

        const metalMap = mapLoader.load('resources/freepbr/' + name + 'metallic.png');
        metalMap.anisotropy = maxAnisotropy;
        metalMap.wrapS = THREE.RepeatWrapping;
        metalMap.wrapT = THREE.RepeatWrapping;
        metalMap.repeat.set(tiling, tiling);

        const albedo = mapLoader.load('resources/freepbr/' + name + 'albedo.png');
        albedo.anisotropy = maxAnisotropy;
        albedo.wrapS = THREE.RepeatWrapping;
        albedo.wrapT = THREE.RepeatWrapping;
        albedo.repeat.set(tiling, tiling);
        albedo.encoding = THREE.sRGBEncoding;

        const normalMap = mapLoader.load('resources/freepbr/' + name + 'normal.png');
        normalMap.anisotropy = maxAnisotropy;
        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        normalMap.repeat.set(tiling, tiling);

        const roughnessMap = mapLoader.load('resources/freepbr/' + name + 'roughness.png');
        roughnessMap.anisotropy = maxAnisotropy;
        roughnessMap.wrapS = THREE.RepeatWrapping;
        roughnessMap.wrapT = THREE.RepeatWrapping;
        roughnessMap.repeat.set(tiling, tiling);

        const material = new THREE.MeshStandardMaterial({
            metalnessMap: metalMap,
            map: albedo,
            normalMap: normalMap,
            roughnessMap: roughnessMap,
        });

        return material;
    }

    onWindowResize_() {
        this.camera_.aspect = window.innerWidth / window.innerHeight;
        this.camera_.updateProjectionMatrix();

        this.uiCamera_.left = -this.camera_.aspect;
        this.uiCamera_.right = this.camera_.aspect;
        this.uiCamera_.updateProjectionMatrix();

        this.threejs_.setSize(window.innerWidth, window.innerHeight);
    }

    raf_() {
        requestAnimationFrame((t) => {
            if (this.previousRAF_ === null) {
                this.previousRAF_ = t;
            }

            this.step_(t - this.previousRAF_);
            this.threejs_.autoClear = true;
            this.threejs_.render(this.scene_, this.camera_);
            this.threejs_.autoClear = false;
            this.threejs_.render(this.uiScene_, this.uiCamera_);
            this.previousRAF_ = t;
            this.raf_();
        });
    }

    step_(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;
        this.fpsCamera_.update(timeElapsedS);
    }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new ThesisDemo();
});