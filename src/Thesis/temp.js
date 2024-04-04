import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';
import { Capsule } from 'three/addons/math/Capsule.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import InputController from './utility/input.js';

const STEPS_PER_FRAME = 5;
const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const stats = new Stats();
class Thesis {
    constructor() {
        this.init_();
    }

    init_() {
        this.initStaticVar();
        this.initRenderer();
        this.initScene();
        this.initPlayerVariables();
        this.initConfig();

        //this._animate = this.animate.bind( this );
        this.animate();
        this.onWindowResize();
    }
    initStaticVar() {
        this.GRAVITY = 30;
        
    }
    //Initiate Required Three JS items
    initRenderer() {
        //Setup camera
        camera.rotation.order = 'YXZ';

        this.container = document.getElementById('container');

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.VSMShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container.appendChild(renderer.domElement);

        window.addEventListener('resize', () => {
            this.onWindowResize();
        }, false);
    }

    initScene() {
        scene.background = new THREE.Color(0x88ccee);
        scene.fog = new THREE.Fog(0x88ccee, 0, 500);

        const fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
        fillLight1.position.set(2, 1, 1);
        scene.add(fillLight1);

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
        scene.add(directionalLight);

        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        this.container.appendChild(stats.domElement);

        //Incase needed for loading map
        this.worldOctree = new Octree();
        const mapLoader = new THREE.TextureLoader();
        const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
        const checkerboard = mapLoader.load('static/textures/default.png');
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
        scene.add(plane);
        
        const wall1 = new THREE.Mesh(
            new THREE.BoxGeometry(100, 100, 4),
            checkerboard);
        wall1.position.set(0, -40, -50);
        wall1.castShadow = true;
        wall1.receiveShadow = true;
        scene.add(wall1);

        const wall2 = new THREE.Mesh(
            new THREE.BoxGeometry(100, 100, 4),
            checkerboard);
        wall2.position.set(0, -40, 50);
        wall2.castShadow = true;
        wall2.receiveShadow = true;
        scene.add(wall2);

        const wall3 = new THREE.Mesh(
            new THREE.BoxGeometry(4, 100, 100),
            checkerboard);
        wall3.position.set(50, -40, 0);
        wall3.castShadow = true;
        wall3.receiveShadow = true;
        scene.add(wall3);

        const wall4 = new THREE.Mesh(
            new THREE.BoxGeometry(4, 100, 100),
            checkerboard);
        wall4.position.set(-50, -40, 0);
        wall4.castShadow = true;
        wall4.receiveShadow = true;
        scene.add(wall4);

        const meshes = [plane, wall1, wall2, wall3, wall4];

        this.objects_ = [];

        for (let i = 0; i < meshes.length; ++i) {
            const b = new THREE.Box3();
            b.setFromObject(meshes[i]);
            this.objects_.push(b);
        }
    }

    initPlayerVariables() {
        this.inputController = new InputController(camera);
        this.playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);
        this.playerVelocity = new THREE.Vector3();
        this.playerDirection = new THREE.Vector3();
        this.playerOnFloor = false;
        this.mouseTime = 0;
    }

    initConfig() {
        const gui = new GUI( { width: 200});
        gui.add({Player_Height: 170}, 'Player_Height', 120, 200).onChange((val)=>{
            console.log(val)
        })
        const userControls = gui.addFolder('Player Controls')
        userControls.add({Forward: "w"}, 'Forward').onChange((val)=>{
            console.log(val)
        })
        userControls.add({Backward: "s"}, 'Backward').onChange((val)=>{
            console.log(val)
        })
        userControls.add({Left: "a"}, 'Left').onChange((val)=>{
            console.log(val)
        })
        userControls.add({Right: "d"}, 'Right').onChange((val)=>{
            console.log(val)
        })
    }

    playerCollisions() {

        const result = this.worldOctree.capsuleIntersect(this.playerCollider);
        console.log(this.scene.capsuleIntersect(this.playerCollider));
    
        this.playerOnFloor = false;
    
        if (result) {
    
            this.playerOnFloor = result.normal.y > 0;
    
            if (!playerOnFloor) {
    
                this.playerVelocity.addScaledVector(result.normal, - result.normal.dot(this.playerVelocity));
    
            }
    
            this.playerCollider.translate(result.normal.multiplyScalar(result.depth));
    
        }
    
    }

    updatePlayer(deltaTime) {

        let damping = Math.exp(- 4 * deltaTime) - 1;
    
        if (!this.playerOnFloor) {
    
            // this.playerVelocity.y -= this.GRAVITY * deltaTime;
    
            // small air resistance
            damping *= 0.1;
    
        }
    
        this.playerVelocity.addScaledVector(this.playerVelocity, damping);
    
        const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);
        this.playerCollider.translate(deltaPosition);
    
        this.playerCollisions();
    
        camera.position.copy(this.playerCollider.end);
    
    }

    onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    teleportPlayerIfOob() {

        if (camera.position.y <= - 25) {
    
            this.playerCollider.start.set(0, 0.35, 0);
            this.playerCollider.end.set(0, 1, 0);
            this.playerCollider.radius = 0.35;
            camera.position.copy(this.playerCollider.end);
            camera.rotation.set(0, 0, 0);
    
        }
    
    }
    animate() {
        const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;
    
        for (let i = 0; i < STEPS_PER_FRAME; i++) {
            // controls(deltaTime);
            this.updatePlayer(deltaTime);
            this.teleportPlayerIfOob();
        }
    
        renderer.render(scene, camera);
    
        stats.update();
    
        requestAnimationFrame((t)=>{
            this.animate();
        });
    }
    
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new Thesis();
});