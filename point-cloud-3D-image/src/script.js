import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js'
import pointFragment from './shaders/points/fragment.glsl'
import pointVertex from './shaders/points/vertex.glsl'

// Debug
//const gui = new GUI()

// Scene
const scene = new THREE.Scene()

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 5000)
camera.position.x = 2
camera.position.y = 5
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const loader = new PLYLoader()

loader.setPropertyNameMapping({
    f_dc_0: 'red',
    f_dc_1: 'green',
    f_dc_2: 'blue'
})

try {
    const geometry = await loader.loadAsync('./models/hongkong-street.ply')
    
    geometry.computeVertexNormals()

    const material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader:pointVertex,
        fragmentShader:pointFragment,
        uniforms:
        {
            uSize: { value: 30 * renderer.getPixelRatio() },
            uTime: { value: 0.0 }
        }
    })

    const points = new THREE.Points(geometry, material)
    points.rotation.z = Math.PI
    scene.add(points)

} catch (error) {
    console.error('An error occurred loading the PLY file:', error);
}

controls.target.set(2, 5, 5);
controls.update()

const timer = new THREE.Timer(); 

const tick = () =>
{
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

window.addEventListener('dblclick', () => {
    if(!document.fullscreenElement){
        canvas.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
})

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