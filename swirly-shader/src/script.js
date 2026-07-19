import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import GUI from 'lil-gui'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import vertexBubble from './vertexBubble.glsl'
import fragmentBubble from './fragmentBubble.glsl'
import { WebGLCubeRenderTarget } from 'three'
import { DotShader } from './grainShader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

//Debug
const gui = new GUI()
const debugObject = {
    baseFirst: new THREE.Color(23 / 255, 40 / 255, 191 / 255),
    baseSecond: new THREE.Color(88 / 255, 13 / 255, 227 / 255),
    accent: new THREE.Color(1 / 255, 7 / 255, 12 / 255),
    mRefractionRatio: 0.71,
    mFresnelBias: 0.0,
    mFresnelScale: 0.51,
    mFresnelPower: 3.22,
    numberOfLines: 3.64
};

const colorFolder = gui.addFolder('Color Controls')
const behaviorFolder = gui.addFolder('Behavior Controls')

//Cursor
const cursor = {
    x:0,
    y:0
}
window.addEventListener('mousemove', (event) => 
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = -(event.clientY / sizes.width - 0.5)
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

window.addEventListener('dblclick', () =>
{
    if(!document.fullscreenElement){
        canvas.requestFullscreen()
    }
    else{
        document.exitFullscreen()
    }
})

const geometry = new THREE.SphereGeometry(2.5,64,64)
const geometry2 = new THREE.SphereGeometry(0.4,64,64)
//const planeGeometry = new THREE.PlaneGeometry(2, 2);

// Scene
const scene = new THREE.Scene()

// Material
const material = new THREE.ShaderMaterial({
    vertexShader:vertex,
    fragmentShader:fragment,
    uniforms: {
        uTime: { value: 0 },
        baseFirst: { value: debugObject.baseFirst},
        accent: { value: debugObject.accent},
        baseSecond: { value: debugObject.baseSecond},
        numberOfLines: { value: debugObject.numberOfLines}
    },
    side:THREE.DoubleSide
})

//Bubble sphere material
const material2 = new THREE.ShaderMaterial({
    vertexShader:vertexBubble,
    fragmentShader:fragmentBubble,
    uniforms: {
        uTime: { value: 0 },
        tCube: { value: 0 },
        mRefractionRatio: { value: debugObject.mRefractionRatio },
        mFresnelBias: { value: debugObject.mFresnelBias },
        mFresnelScale: { value: debugObject.mFresnelScale },
        mFresnelPower: { value: debugObject.mFresnelPower }
    }
})

//Color controls
for (const name of ['baseFirst', 'baseSecond', 'accent']) {
    colorFolder.addColor(debugObject, name).onChange(value => {
        material.uniforms[name].value.set(value)
    })
}

//Controls for number of stripes
behaviorFolder.add(debugObject, 'numberOfLines', 0.1, 15, 0.01)
.onChange(value => {
    material.uniforms.numberOfLines.value = value
})

//Bubble controls
behaviorFolder.add(debugObject, 'mRefractionRatio', 0, 3, 0.01)
.onChange(value => {
    material2.uniforms.mRefractionRatio.value = value
})
behaviorFolder.add(debugObject, 'mFresnelBias', 0, 1, 0.01)
.onChange(value => {
    material2.uniforms.mFresnelBias.value = value
})
behaviorFolder.add(debugObject, 'mFresnelScale', 0, 5, 0.01)
.onChange(value => {
    material2.uniforms.mFresnelScale.value = value
})
behaviorFolder.add(debugObject, 'mFresnelPower', 0, 5, 0.01)
.onChange(value => {
    material2.uniforms.mFresnelPower.value = value
})

// Object
//const quad = new THREE.Mesh(planeGeometry, material2);
//scene.add(quad);
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const mesh2 = new THREE.Mesh(geometry2, material2)
scene.add(mesh2)

const cubeRenderTarget = new WebGLCubeRenderTarget(256,{
    format:THREE.RGBAFormat,
    generateMipmaps:true,
    minFilter:THREE.LinearMipmapLinearFilter,
    encoding:THREE.sRGBEncoding
})

const cubeCamera = new THREE.CubeCamera(0.1,10,cubeRenderTarget)

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 1.5
camera.lookAt(mesh.position)

scene.add(camera)

window.addEventListener('resize', () => 
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width/sizes.height
    camera.updateProjectionMatrix()

    composer.setSize(sizes.width, sizes.height)

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
})

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

//Constricts camera so it doesn't go outside of the bigger sphere mesh
mesh.geometry.computeBoundingBox()
const boundingBox = mesh.geometry.boundingBox
const size = new THREE.Vector3()
boundingBox.getSize(size)

const maxDim = Math.max(size.x, size.y, size.z)

const fov = camera.fov * (Math.PI / 180)
const cameraDistance = (maxDim / 2) / Math.tan(fov / 2)

//Replace 0.75 with something more precise
controls.maxDistance = cameraDistance*0.75
controls.target.copy(mesh.position)

//Composer
const composer = new EffectComposer(renderer)

//Initializes post processing for grainy texture
const initPost = () => {
    composer.addPass(new RenderPass(scene, camera))

    const effect1 = new ShaderPass(DotShader)
    effect1.uniforms['scale'].value = 4
    composer.addPass(effect1)
}

initPost()

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    material.uniforms.uTime.value = elapsedTime *0.35

    controls.update()
    mesh2.visible = false
    cubeCamera.update(renderer,scene)
    mesh2.visible = true
    material2.uniforms.tCube.value = cubeRenderTarget.texture

    // Render
    //renderer.render(scene, camera)
    composer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()