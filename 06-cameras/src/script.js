import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import GUI from 'lil-gui'

//Debug
const gui = new GUI()
const debugObject = {}

//Cursor
const cursor = {
    x:0,
    y:0
}
window.addEventListener('mousemove', (event) => 
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = -(event.clientY / sizes.width - 0.5)

    console.log(cursor.x, cursor.y)
})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => 
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width/sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
})

window.addEventListener('dblclick', () =>
{
    if(!document.fullscreenElement){
        canvas.requestFullscreen()
    }
    else{
        document.exitFullscreen()
    }
})

//Object
debugObject.color = "#ffff00"

const geometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5)

//const geometry = new THREE.BufferGeometry()

//const count = 50
//const positionsArray = new Float32Array(count * 3 * 3)

//for(let i = 0; i < count*3*3; i++)
//{
//    positionsArray[i] = Math.random() - 0.5
//}

//const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3)
//geometry.setAttribute('position', positionsAttribute)

// Scene
const scene = new THREE.Scene()

const material = new THREE.MeshBasicMaterial({color: debugObject.color})
// Object
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const cubeTweaks = gui.addFolder("Awesome cube")

cubeTweaks.add(mesh.position, 'y').min(-3).max(3).step(0.01).name('elevation')
gui.add(mesh, 'visible')
gui.add(material, 'wireframe')
gui
    .addColor(debugObject, 'color')
    .onChange(() => {
        material.color.set(debugObject.color)
})
debugObject.spin = () =>
{
    gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + Math.PI * 2 })
}
gui.add(debugObject, 'spin')

debugObject.subdivision = 2
gui.add(debugObject, 'subdivision').min(1).max(20).step(1)
    .onFinishChange(() =>
    {
        mesh.geometry.dispose()
        mesh.geometry = new THREE.BoxGeometry(
            1, 1, 1,
            debugObject.subdivision, debugObject.subdivision, debugObject.subdivision
        )
    })

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
//const aspectRatio = sizes.width/sizes.height
//const camera = new THREE.OrthographicCamera(-1*aspectRatio, 1*aspectRatio, 1, -1, 0.1, 100)
//camera.position.x = 2
//camera.position.y = 2
camera.position.z = 3
camera.lookAt(mesh.position)
scene.add(camera)

//Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
//controls.target.y = 2
//controls.update()

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    //mesh.rotation.y = elapsedTime;

    //Update camera
    //camera.position.x = Math.sin(cursor.x*Math.PI*2) * 3
    //camera.position.y = cursor.y * 5
    //camera.position.z = Math.cos(cursor.x*Math.PI*2) * 3
    //camera.lookAt(mesh.position)

    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()