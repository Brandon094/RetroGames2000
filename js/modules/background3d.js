import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';

export function initBackground3D() {
    const canvas = document.getElementById('bg-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 1, 15);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 0.6;
    camera.position.z = 4;

    // --- EL SUELO (GRID TRON) ---
    const gridSize = 40;
    const gridDivisions = 40;
    const geometry = new THREE.PlaneGeometry(gridSize, gridSize, gridDivisions, gridDivisions);

    // Material de rejilla neón
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });

    const grid = new THREE.Mesh(geometry, material);
    grid.rotation.x = -Math.PI / 2;
    scene.add(grid);

    const grid2 = grid.clone();
    grid2.position.z = -gridSize;
    scene.add(grid2);

    // --- CARRETERA CENTRAL (LINEAS DE CARRERA) ---
    const roadGeom = new THREE.PlaneGeometry(4, gridSize, 1, gridDivisions);
    const roadMat = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.3,
        wireframe: true
    });
    const road = new THREE.Mesh(roadGeom, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.01; // Un pelín arriba del suelo
    scene.add(road);

    const road2 = road.clone();
    road2.position.z = -gridSize;
    scene.add(road2);

    // --- "ESTELAS" DE VELOCIDAD (PARTÍCULAS) ---
    const pointsGeometry = new THREE.BufferGeometry();
    const count = 200;
    const positions = new Float32Array(count * 3);
    for(let i=0; i<count*3; i+=3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i+1] = Math.random() * 2;
        positions[i+2] = (Math.random() - 0.5) * 40;
    }
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pointsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.5 });
    const stars = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(stars);

    // --- LÓGICA DE CONTROL Y ANIMACIÓN ---
    let mouseX = 0;
    let targetCameraX = 0;
    let targetCameraRotationZ = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
    });

    function animate() {
        requestAnimationFrame(animate);

        const speed = 0.15; // ¡Mucha más velocidad!

        // Movimiento infinito de suelo y carretera
        [grid, grid2, road, road2].forEach(m => {
            m.position.z += speed;
            if (m.position.z >= gridSize) {
                m.position.z -= gridSize * 2;
            }
        });

        // Movimiento de estrellas
        stars.position.z += speed * 2;
        if(stars.position.z > 20) stars.position.z = -20;

        // "CONDUCIR" CON EL MOUSE
        targetCameraX = mouseX * 4;
        targetCameraRotationZ = -mouseX * 0.5;

        // Suavizado de movimiento (Lerp)
        camera.position.x += (targetCameraX - camera.position.x) * 0.05;
        camera.rotation.z += (targetCameraRotationZ - camera.rotation.z) * 0.05;
        camera.rotation.y = -camera.position.x * 0.1;

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}
