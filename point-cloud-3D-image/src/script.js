import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';

// Debug
//const gui = new GUI()

/**
 * GPU Compute
 */
// Setup
const gpgpu = {}

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

window.addEventListener('dblclick', () => {
    if(!document.fullscreenElement){
        canvas.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
})

// Initialize the GaussianSplats3D Viewer 
const viewer = new GaussianSplats3D.Viewer({
    cameraUp: [0, -1, -0.5],
    initialCameraPosition: [0, 0, -6],
    initialCameraLookAt: [0, 0, 0],
    sharedMemoryForWorkers: false
});

viewer.addSplatScene('./models/converted_file.ksplat', {
    splatAlphaRemovalThreshold: 5
})
.then(() => {
    viewer.start();
});

// Window resizing
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
})