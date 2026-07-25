import * as THREE from "three";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
    const lenis = new Lenis({ autoRaf: true });

    const container = document.querySelector(".trail-container");
    if (!container) return;

    const scene = new THREE.Scene();
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    window.addEventListener("resize", () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h);
        camera.left = w / -2;
        camera.right = w / 2;
        camera.top = h / 2;
        camera.bottom = h / -2;
        camera.updateProjectionMatrix();
    });

    const textureLoader = new THREE.TextureLoader();
    const imageUrls = ["/assets/butterfly1.png", "/assets/butterfly2.png", "/assets/butterfly3.png", "/assets/butterfly4.png"];
    const textures = imageUrls.map(url => textureLoader.load(url));

    const config = {
        mouseThreshold: 80,
        idleInterval: 800,
        lifespan: 1200,
    };

    let mouseX = 0, mouseY = 0, lastMouseX = 0, lastMouseY = 0;
    let isMoving = false;
    let lastSteadyTime = 0;
    let lastAngle = 0;
    const activeTrails = [];

    container.addEventListener("mousemove", (event) => {
        const rect = container.getBoundingClientRect();
        mouseX = event.clientX - rect.left - width / 2;
        mouseY = -(event.clientY - rect.top - height / 2);

        const dx = mouseX - lastMouseX;
        const dy = mouseY - lastMouseY;
        const dist = Math.hypot(dx, dy);
        
        isMoving = dist > config.mouseThreshold;

        if (isMoving) {
            lastAngle = Math.atan2(dy, dx);

            lastMouseX = mouseX;
            lastMouseY = mouseY;
            spawnTrail(mouseX, mouseY, lastAngle);
        }
    });

    function checkIdle(time) {
        if (!isMoving && time - lastSteadyTime >= config.idleInterval) {
            lastSteadyTime = time;
            spawnTrail(mouseX, mouseY, lastAngle);
        }
    }

    function spawnTrail(x, y, angle) {
        const texture = textures[Math.floor(Math.random() * textures.length)];
        texture.minFilter = THREE.NearestFilter
        texture.magFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        
        const geometry = new THREE.PlaneGeometry(50, 30);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, 0);
        
        mesh.rotation.z = angle - Math.PI / 2; 

        scene.add(mesh);

        activeTrails.push({
            mesh,
            material,
            birth: performance.now(),
            life: config.lifespan
        });
    }

    function animate(time) {
        requestAnimationFrame(animate);
        checkIdle(time);

        const now = performance.now();

        for (let i = activeTrails.length - 1; i >= 0; i--) {
            const trail = activeTrails[i];
            const age = now - trail.birth;
            const progress = age / trail.life;

            if (progress >= 1) {
                scene.remove(trail.mesh);
                trail.geometry?.dispose();
                trail.material.dispose();
                activeTrails.splice(i, 1);
            } else {
                const scale = Math.sin(progress * Math.PI); 
                trail.mesh.scale.setScalar(scale * 1.2);
                trail.material.opacity = Math.sin(progress * Math.PI);
            }
        }

        renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);
});