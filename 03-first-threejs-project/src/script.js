import * as THREE from 'three'
import gsap from 'gsap'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
const group = new THREE.Group()
scene.add(group)
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
const mesh = new THREE.Mesh(geometry, material)
group.add(mesh)

//Axes helper
//const axesHelper = new THREE.AxesHelper()
//scene.add(axesHelper)

/**
 * Sizes
 */
const sizes = {
    width: 800,
    height: 600
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

camera.lookAt(mesh.position)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

//let time = Date.now()
//const clock = new THREE.Clock()
gsap.to(mesh.position, { duration: 1, delay: 1, x: 2})

//Animations
const tick = () =>
{
    //const currentTime = Date.now()
    //const deltaTime = currentTime - time
    //time = currentTime

    //Deltatime multiplication to keep the speed the same regardless of computer framerate
    //mesh.rotation.x += 0.001 * deltaTime
    //mesh.rotation.y += 0.001 * deltaTime

    //const elapsedTime = clock.getElapsedTime()

    //mesh.position.y = Math.sin(elapsedTime)
    //mesh.position.x = Math.cos(elapsedTime)

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()