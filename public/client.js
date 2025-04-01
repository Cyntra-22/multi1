const socket = io();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ✅ Set camera position to avoid being inside an object
camera.position.set(0, 2, 5);

// ✅ Add ambient light
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

let players = {};

// ✅ Spawn the local player immediately
socket.on("connect", () => {
    const myColor = Math.random() * 0xffffff; // Random color
    socket.emit("spawnPlayer", { id: socket.id, color: myColor });
});

// ✅ Function to create a player cube
function createPlayer(id, color) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(Math.random() * 4 - 2, 0, Math.random() * 4 - 2); // Random position
    scene.add(cube);
    players[id] = cube;
}

// ✅ Handle new player joining
socket.on("playerJoined", (data) => {
    createPlayer(data.id, data.color);
});

// ✅ Handle player movement updates
socket.on("playerMoved", (data) => {
    if (players[data.id]) {
        players[data.id].position.set(data.x, data.y, data.z);
    }
});

// ✅ Handle player disconnection
socket.on("playerLeft", (id) => {
    if (players[id]) {
        scene.remove(players[id]); // Remove cube from scene
        delete players[id]; // Remove from players list
    }
});

socket.on("playerJoined", (data) => {
    console.log(`New player joined: ${data.id}`);
    console.log(`Total players: ${Object.keys(players).length}`);
    createPlayer(data.id, data.color);
});


// ✅ Move the player using arrow keys
document.addEventListener("keydown", (event) => {
    if (!players[socket.id]) return;

    let x = players[socket.id].position.x;
    let z = players[socket.id].position.z;

    if (event.key === "ArrowUp") z -= 0.1;
    if (event.key === "ArrowDown") z += 0.1;
    if (event.key === "ArrowLeft") x -= 0.1;
    if (event.key === "ArrowRight") x += 0.1;

    socket.emit("move", { x, y: 0, z });
});

// ✅ Render the scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
