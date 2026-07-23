import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader()
const windUniforms = {
  uTime: { value: 0 },
  uWindStrength: { value: 0.3 },
  uWindSpeed: { value: 2.0 },
}

loader.load( '/spikey_tree.glb', function ( gltf ) {
    const tree = gltf.scene;

    tree.traverse((child) => {
        if (child.isMesh) {
            child.material.transparent = false
            child.material.alphaHash = true
            child.material.side = THREE.DoubleSide
            child.material.needsUpdate = true

            child.material.onBeforeCompile = (shader) => {
                shader.uniforms.uTime = windUniforms.uTime;
                shader.uniforms.uWindStrength = windUniforms.uWindStrength;
                shader.uniforms.uWindSpeed = windUniforms.uWindSpeed;

                shader.vertexShader = shader.vertexShader.replace(
                'void main() {',
                `
                uniform float uTime;
                uniform float uWindStrength;
                uniform float uWindSpeed;
                void main() {
                `
                );

                shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
                
                float heightFactor = position.y / 15.0; 
                heightFactor = clamp(heightFactor, 0.0, 1.0);

                float sway = sin(uTime * uWindSpeed + position.z) * uWindStrength;
                
                transformed.x += sway * heightFactor;
                `
                )
            }
        }
    })

    tree.position.set(-6.5, 0, -6);
    tree.scale.setScalar(0.2);

    scene.add(tree);
}, undefined, function ( error ) {
    console.error( error );
} );

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial()
)
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

// House container
const house = new THREE.Group()
scene.add(house)

// Walls
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial()
)
walls.position.y += 2.5/2
house.add(walls)

// Roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1.5, 4),
    new THREE.MeshStandardMaterial()
)
roof.position.y += 2.5 + 0.75
roof.rotation.y = Math.PI * 0.25
house.add(roof)

// Door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshStandardMaterial()
)
door.position.y = 1
door.position.z = 2 + 0.01
house.add(door)

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial()

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, 2.2)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, 2.1)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(- 0.8, 0.1, 2.2)

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(- 1, 0.05, 2.6)

scene.add(bush1, bush2, bush3, bush4)

// Graves
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial()

const graves = new THREE.Group()
scene.add(graves)

for(let i = 0; i < 30; i++)
{
    const angle = Math.random() * Math.PI * 2
    const radius = 3 + Math.random() * 4

    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius

    const grave = new THREE.Mesh(graveGeometry, graveMaterial)
    grave.position.x = x
    grave.position.y = Math.random() * 0.4
    grave.position.z = z

    grave.rotation.x = (Math.random() - 0.5) * 0.4
    grave.rotation.y = (Math.random() - 0.5) * 0.4
    grave.rotation.z = (Math.random() - 0.5) * 0.4

    graves.add(grave)
}

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

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
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
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

/**
 * Animate
 */
const timer = new Timer()

const tick = () =>
{
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()

    // Update controls
    controls.update()

    // Wind animation
    windUniforms.uTime.value = elapsedTime;

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()