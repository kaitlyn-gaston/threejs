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
//const gui = new GUI()

// Loader
const loader = new GLTFLoader()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Test model
loader.load( '/goldfish.glb', function ( gltf ) {
    const goldfish = gltf.scene;
    goldfish.traverse((child) => {
        if (child.isMesh) {
            child.material.alphaHash = true
            child.material.depthWrite = true
            child.material.needsUpdate = true

            goldfish.position.set(0,0,0)
            scene.add(goldfish)
        }
        if (child.isMesh && child.material.map) {
            child.material.map.minFilter = THREE.NearestFilter
            child.material.map.magFilter = THREE.NearestFilter
            child.material.map.generateMipmaps = false
            child.material.map.needsUpdate = true
        }
    })
}, undefined, function ( error ) {
    console.error( error );
} );

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
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Lights
const hemiLight = new THREE.HemisphereLight(0x00ffff, 0xff00ff, 1)
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
const pixelPass = new RenderPixelatedPass(3, scene, camera);
pixelPass.normalEdgeStrength = 0.0
pixelPass.depthEdgeStrength = 0.1
composer.addPass(pixelPass);

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

    // Render
    composer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()