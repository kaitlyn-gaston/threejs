import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js'
import { Sky } from 'three/addons/objects/Sky.js';

/**
 * Base
 */
// Debug
const gui = new GUI()

// Loader
const loader = new GLTFLoader()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const swimUniforms = {
  uTime: { value: 0 },
  uSwimStrength: { value: 0.44 },
  uSwimSpeed: { value: 3.2 },
}

// Test model
loader.load( './goldfish.glb', function ( gltf ) {
    const goldfish = gltf.scene;
    
    goldfish.position.set(0, 0, 0);
    scene.add(goldfish);

    goldfish.traverse((child) => {
        if (child.isMesh) {
            child.geometry.computeBoundingBox();
            
            const minZ = child.geometry.boundingBox.min.z;
            const maxZ = child.geometry.boundingBox.max.z;

            child.material.alphaTest = 0.5;
            child.material.depthWrite = true;
            child.material.needsUpdate = true;

            child.material.onBeforeCompile = (shader) => {
                shader.uniforms.uTime = swimUniforms.uTime;
                shader.uniforms.uSwimStrength = swimUniforms.uSwimStrength;
                shader.uniforms.uSwimSpeed = swimUniforms.uSwimSpeed; 

                shader.uniforms.uMinZ = { value: minZ };
                shader.uniforms.uMaxZ = { value: maxZ };

                shader.vertexShader = shader.vertexShader.replace(
                'void main() {',
                `
                uniform float uTime;
                uniform float uSwimStrength;
                uniform float uSwimSpeed;
                uniform float uMinZ;
                uniform float uMaxZ;
                void main() {
                `
                );

                shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
                
                float bodyProgress = (position.z - uMinZ) / (uMaxZ - uMinZ);
                bodyProgress = clamp(bodyProgress, 0.0, 1.0);

                bodyProgress = 1.0 - bodyProgress;

                float tailFactor = mix(0.15, 1.0, pow(bodyProgress, 2.0));

                float wave = sin(uTime * uSwimSpeed - bodyProgress * 6.28318) * uSwimStrength;

                transformed.x += wave * tailFactor;
                `
                );
            }
        }
    });
})

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1.3
camera.position.y = 0.5
camera.position.z = 1.3
scene.add(camera)

// Lights
const hemiLight = new THREE.HemisphereLight(0xbcee11, 0x0aaef5, 12.379)
hemiLight.position.set(0.2,2,0.5)

scene.add(hemiLight)

// Point light
const pointLight = new THREE.PointLight(0x00ffff, 5.5)
pointLight.position.set(0.2,1,0.5)
scene.add(pointLight)

// Ambient light
const ambientLight = new THREE.AmbientLight('#86cdff', 0.575)
scene.add(ambientLight)

// Sky
const sky = new Sky();
sky.scale.set(100, 100, 100)

sky.material.uniforms['turbidity'].value = 6.2
sky.material.uniforms['rayleigh'].value = 0.116
sky.material.uniforms['mieCoefficient'].value = 0.0
sky.material.uniforms['mieDirectionalG'].value = 0.7
sky.material.uniforms['sunPosition'].value.set(0.3, 0.02, -0.9)

scene.add( sky );

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.maxDistance = 10

const lightData = {
    skyColor: hemiLight.color.getHex(),
    groundColor: hemiLight.groundColor.getHex()
}

const hemiFolder = gui.addFolder('Hemisphere Light')

hemiFolder.add(hemiLight, 'intensity').min(0.0).max(20).step(0.001)

hemiFolder.addColor(lightData, 'groundColor').onChange((value) => {
    hemiLight.groundColor.set(value)
})

hemiFolder.addColor(lightData, 'skyColor').onChange((value) => {
    hemiLight.color.set(value)
})

const pointFolder = gui.addFolder('Point Light')

pointFolder.add(pointLight, 'intensity').min(0.0).max(20).step(0.001)

pointFolder.addColor(pointLight, 'color').onChange((value) => {
    pointLight.color.set(value)
})

const ambientFolder = gui.addFolder('Ambient Light')

ambientFolder.add(ambientLight, 'intensity').min(0.0).max(20).step(0.001)

ambientFolder.addColor(ambientLight, 'color').onChange((value) => {
    ambientLight.color.set(value)
})

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const composer = new EffectComposer(renderer);
const pixelPass = new RenderPixelatedPass(4, scene, camera);
pixelPass.normalEdgeStrength = 0.0
pixelPass.depthEdgeStrength = 0.1
composer.addPass(pixelPass)

const pixelFolder = gui.addFolder('Pixelation')

pixelFolder.add(pixelPass, 'pixelSize').min(1).max(20).step(1).onChange((value) => {
    pixelPass.setPixelSize(value)
})

const swimFolder = gui.addFolder('Swimming Animation')
swimFolder.add(swimUniforms.uSwimStrength, 'value', 0, 1, 0.001).name('strength')
swimFolder.add(swimUniforms.uSwimSpeed, 'value', 0, 20, 0.001).name('speed')

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    const angle = elapsedTime * 0.5
    pointLight.position.x = Math.cos(angle) * 2
    pointLight.position.z = Math.sin(angle) * 2

    // Update controls
    controls.update()

    swimUniforms.uTime.value = elapsedTime

    // Render
    composer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()